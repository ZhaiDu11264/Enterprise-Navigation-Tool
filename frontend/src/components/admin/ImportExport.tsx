import React, { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './ImportExport.css';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  totalRows: number;
  createdGroups: string[];
  createdLinks: number;
}

interface ImportOptions {
  validateUrls: boolean;
  skipDuplicates: boolean;
  createMissingGroups: boolean;
  overwriteExisting: boolean;
}

interface ExportOptions {
  includeAllUsers: boolean;
  includeGroups: boolean;
  includeStats: boolean;
  includeMetadata: boolean;
  format: 'csv' | 'xlsx';
  selectedGroupIds?: number[];
  favoriteOnly?: boolean;
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;
  preview: Array<{
    name: string;
    url: string;
    description?: string;
    groupName: string;
  }>;
}

const ImportExport: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'batch'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    validateUrls: true,
    skipDuplicates: true,
    createMissingGroups: false,
    overwriteExisting: false
  });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeAllUsers: true,
    includeGroups: true,
    includeStats: false,
    includeMetadata: false,
    format: 'csv',
    selectedGroupIds: [],
    favoriteOnly: false
  });

  const t = useMemo(() => language === 'zh' ? ({
    title: '导入/导出数据',
    close: '关闭',
    tabs: { import: '导入数据', export: '导出数据', batch: '批量操作' },
    import: {
      title: '导入网址链接',
      desc: '上传 CSV 或 Excel 文件以批量导入网址链接。文件应包含名称、URL、描述和分组列。',
      chooseFile: '选择要上传的 CSV 或 Excel 文件',
      formats: '支持格式：.csv, .xlsx, .xls',
      selectFile: '选择文件',
      importOptions: '导入选项',
      validateUrls: '导入时校验 URL',
      skipDuplicates: '跳过重复 URL',
      createMissingGroups: '自动创建缺失的分组',
      overwriteExisting: '覆盖已存在的链接',
      validateFile: '验证文件',
      validating: '验证中...',
      importData: '导入数据',
      importing: '导入中...',
      validationResult: '文件验证结果',
      totalRows: '总行数',
      errorCount: '错误数',
      validationStatus: '验证状态',
      valid: '通过',
      invalid: '失败',
      validationErrors: '验证错误',
      rowError: (row: number, message: string) => `第 ${row} 行: ${message}`,
      moreErrors: (n: number) => `还有 ${n} 个错误...`,
      preview: '数据预览',
      colName: '名称',
      colUrl: 'URL',
      colDesc: '描述',
      colGroup: '分组',
      importResult: '导入结果',
      linksImported: '已导入链接',
      groupsCreated: '已创建分组',
      importErrors: '导入错误',
      expectedFormat: '文件格式示例',
      downloadTemplateHint: '可下载模板查看期望格式：',
      csvTemplate: '下载 CSV 模板',
      xlsxTemplate: '下载 Excel 模板'
    },
    export: {
      title: '导出网址链接',
      desc: '导出网址链接和配置为 CSV 或 Excel 文件，用于备份或迁移。',
      options: '导出选项',
      includeAllUsers: '包含所有用户数据',
      includeGroups: '包含分组信息',
      includeStats: '包含访问统计',
      includeMetadata: '包含用户元数据',
      format: '导出格式',
      exportData: '导出数据',
      exporting: '导出中...',
      csvLabel: 'CSV（逗号分隔）',
      xlsxLabel: 'Excel (.xlsx)',
      info: '导出信息',
      totalUsers: '总用户数',
      totalLinks: '总链接数',
      totalGroups: '总分组数',
      lastExport: '上次导出',
      never: '从未'
    },
    batch: {
      title: '批量操作工具',
      desc: '用于高级导入/导出与数据处理的占位工具面板。',
      cards: [
        ['数据分析', '分析数据质量与结构，识别重复项和无效链接等问题。', '开始分析'],
        ['数据转换', '在不同格式之间转换数据，支持 CSV、Excel、JSON。', '格式转换'],
        ['数据清理', '清理重复链接、修复无效 URL、标准化数据格式。', '清理数据'],
        ['批量编辑', '批量修改链接属性，如描述、分组、标签等。', '批量编辑'],
        ['高级搜索', '按复杂条件搜索和筛选链接，支持正则表达式。', '高级搜索'],
        ['统计报告', '生成详细的使用统计报告和分析图表。', '生成报告']
      ],
      history: '操作历史'
    },
    errors: {
      invalidFile: '请选择有效的 CSV 或 Excel 文件',
      selectValidate: '请选择要验证的文件',
      validationFailed: '验证失败',
      validationRequestFailed: '文件验证失败，请重试。',
      selectImport: '请选择要导入的文件',
      importCompletedWithErrors: (n: number) => `导入完成，但有 ${n} 个错误`,
      importFailed: '导入失败',
      importRequestFailed: '文件导入失败，请重试。',
      templateDownloadFailed: '下载模板失败',
      templateDownloadRequestFailed: '模板下载失败，请重试。',
      exportFailed: '导出失败',
      exportRequestFailed: '导出数据失败，请重试。'
    }
  }) : ({
    title: 'Import / Export Data',
    close: 'Close',
    tabs: { import: 'Import Data', export: 'Export Data', batch: 'Batch Tools' },
    import: {
      title: 'Import Website Links',
      desc: 'Upload a CSV or Excel file to import website links in bulk. The file should contain name, URL, description, and group columns.',
      chooseFile: 'Choose a CSV or Excel file to upload',
      formats: 'Supported formats: .csv, .xlsx, .xls',
      selectFile: 'Select File',
      importOptions: 'Import Options',
      validateUrls: 'Validate URLs during import',
      skipDuplicates: 'Skip duplicate URLs',
      createMissingGroups: 'Create missing groups automatically',
      overwriteExisting: 'Overwrite existing links',
      validateFile: 'Validate File',
      validating: 'Validating...',
      importData: 'Import Data',
      importing: 'Importing...',
      validationResult: 'Validation Result',
      totalRows: 'Total Rows',
      errorCount: 'Error Count',
      validationStatus: 'Validation Status',
      valid: 'Valid',
      invalid: 'Invalid',
      validationErrors: 'Validation Errors',
      rowError: (row: number, message: string) => `Row ${row}: ${message}`,
      moreErrors: (n: number) => `${n} more errors...`,
      preview: 'Data Preview',
      colName: 'Name',
      colUrl: 'URL',
      colDesc: 'Description',
      colGroup: 'Group',
      importResult: 'Import Result',
      linksImported: 'Links Imported',
      groupsCreated: 'Groups Created',
      importErrors: 'Import Errors',
      expectedFormat: 'Expected File Format',
      downloadTemplateHint: 'Download a template to see the expected format:',
      csvTemplate: 'Download CSV Template',
      xlsxTemplate: 'Download Excel Template'
    },
    export: {
      title: 'Export Website Links',
      desc: 'Download website links and configuration as CSV or Excel files for backup or migration.',
      options: 'Export Options',
      includeAllUsers: 'Include all user data',
      includeGroups: 'Include group information',
      includeStats: 'Include access statistics',
      includeMetadata: 'Include user metadata',
      format: 'Export Format',
      exportData: 'Export Data',
      exporting: 'Exporting...',
      csvLabel: 'CSV (Comma Separated Values)',
      xlsxLabel: 'Excel (.xlsx)',
      info: 'Export Info',
      totalUsers: 'Total Users',
      totalLinks: 'Total Links',
      totalGroups: 'Total Groups',
      lastExport: 'Last Export',
      never: 'Never'
    },
    batch: {
      title: 'Batch Operation Tools',
      desc: 'Placeholder tools for advanced import/export and data processing workflows.',
      cards: [
        ['Data Analysis', 'Analyze data quality and structure, identify duplicates and invalid links.', 'Start Analysis'],
        ['Data Transform', 'Convert data between formats including CSV, Excel, and JSON.', 'Convert Format'],
        ['Data Cleanup', 'Clean duplicate links, repair invalid URLs, standardize data.', 'Clean Data'],
        ['Batch Edit', 'Batch update link properties such as description, group, and tags.', 'Batch Edit'],
        ['Advanced Search', 'Search and filter links with complex conditions and regex.', 'Advanced Search'],
        ['Reports', 'Generate detailed usage reports and charts.', 'Generate Report']
      ],
      history: 'Operation History'
    },
    errors: {
      invalidFile: 'Please select a valid CSV or Excel file',
      selectValidate: 'Please select a file to validate',
      validationFailed: 'Validation failed',
      validationRequestFailed: 'Failed to validate file. Please try again.',
      selectImport: 'Please select a file to import',
      importCompletedWithErrors: (n: number) => `Import completed with ${n} errors`,
      importFailed: 'Import failed',
      importRequestFailed: 'Failed to import file. Please try again.',
      templateDownloadFailed: 'Failed to download template',
      templateDownloadRequestFailed: 'Failed to download template. Please try again.',
      exportFailed: 'Export failed',
      exportRequestFailed: 'Failed to export data. Please try again.'
    }
  }), [language]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setImportFile(file);
      setError(null);
      setImportResult(null);
      setValidationResult(null);
    } else {
      setError(t.errors.invalidFile);
      setImportFile(null);
    }
  };

  const resetImportInput = () => {
    const fileInput = document.getElementById('import-file') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  };

  const handleValidateFile = useCallback(async () => {
    if (!importFile) {
      setError(t.errors.selectValidate);
      return;
    }

    setValidationLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`/api/import/validate?validateUrls=${importOptions.validateUrls}`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();
      if (response.ok) {
        setValidationResult(data);
      } else {
        setError(data.error || t.errors.validationFailed);
      }
    } catch (err) {
      console.error('Validation failed:', err);
      setError(t.errors.validationRequestFailed);
    } finally {
      setValidationLoading(false);
    }
  }, [importFile, importOptions.validateUrls, t.errors]);

  const handleImport = async () => {
    if (!importFile) {
      setError(t.errors.selectImport);
      return;
    }

    setImportLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`/api/import/file?validateUrls=${importOptions.validateUrls}`, {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          imported: data.result.successfulImports,
          errors: data.result.errors || [],
          totalRows: data.result.totalRows,
          createdGroups: data.result.createdGroups || [],
          createdLinks: data.result.createdLinks || 0
        });
      } else {
        setImportResult({
          success: false,
          imported: data.result?.successfulImports || 0,
          errors: data.result?.errors || [],
          totalRows: data.result?.totalRows || 0,
          createdGroups: [],
          createdLinks: 0
        });
        if (data.result?.errors?.length > 0) {
          setError(t.errors.importCompletedWithErrors(data.result.errors.length));
        } else {
          setError(data.error || t.errors.importFailed);
        }
      }

      setImportFile(null);
      resetImportInput();
    } catch (err) {
      console.error('Import failed:', err);
      setError(t.errors.importRequestFailed);
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await fetch(`/api/export/template?format=${format}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || t.errors.templateDownloadFailed);
        return;
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `import-template.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Template download failed:', err);
      setError(t.errors.templateDownloadRequestFailed);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        format: exportOptions.format,
        includeMetadata: exportOptions.includeMetadata.toString()
      });

      const response = await fetch(`/api/export?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || t.errors.exportFailed);
        return;
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `navigation-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) filename = filenameMatch[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      setError(t.errors.exportRequestFailed);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="import-export">
      <div className="import-export-header">
        <h3>{t.title}</h3>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label={t.close}>×</button>
        </div>
      )}

      <div className="import-export-tabs">
        <button className={`tab-button ${activeTab === 'import' ? 'active' : ''}`} onClick={() => setActiveTab('import')}>{t.tabs.import}</button>
        <button className={`tab-button ${activeTab === 'export' ? 'active' : ''}`} onClick={() => setActiveTab('export')}>{t.tabs.export}</button>
        <button className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`} onClick={() => setActiveTab('batch')}>{t.tabs.batch}</button>
      </div>

      {activeTab === 'import' && (
        <div className="import-section">
          <div className="section-description">
            <h4>{t.import.title}</h4>
            <p>{t.import.desc}</p>
          </div>

          <div className="file-upload-area">
            <div className="upload-zone">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p>{t.import.chooseFile}</p>
                <p className="upload-hint">{t.import.formats}</p>
              </div>
              <input type="file" id="import-file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="file-input" />
              <label htmlFor="import-file" className="file-input-label">{t.import.selectFile}</label>
            </div>

            {importFile && (
              <div className="selected-file">
                <div className="file-info">
                  <span className="file-name">{importFile.name}</span>
                  <span className="file-size">{(importFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <button className="remove-file" onClick={() => { setImportFile(null); resetImportInput(); }} aria-label={t.close}>×</button>
              </div>
            )}
          </div>

          <div className="import-options">
            <h5>{t.import.importOptions}</h5>
            <label className="checkbox-option"><input type="checkbox" checked={importOptions.validateUrls} onChange={(e) => setImportOptions(prev => ({ ...prev, validateUrls: e.target.checked }))} /><span>{t.import.validateUrls}</span></label>
            <label className="checkbox-option"><input type="checkbox" checked={importOptions.skipDuplicates} onChange={(e) => setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))} /><span>{t.import.skipDuplicates}</span></label>
            <label className="checkbox-option"><input type="checkbox" checked={importOptions.createMissingGroups} onChange={(e) => setImportOptions(prev => ({ ...prev, createMissingGroups: e.target.checked }))} /><span>{t.import.createMissingGroups}</span></label>
            <label className="checkbox-option"><input type="checkbox" checked={importOptions.overwriteExisting} onChange={(e) => setImportOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))} /><span>{t.import.overwriteExisting}</span></label>
          </div>

          <div className="import-actions">
            <button className="validate-button" onClick={handleValidateFile} disabled={!importFile || validationLoading}>{validationLoading ? t.import.validating : t.import.validateFile}</button>
            <button className="import-button" onClick={handleImport} disabled={!importFile || importLoading || (validationResult ? !validationResult.valid : false)}>{importLoading ? t.import.importing : t.import.importData}</button>
          </div>

          {validationResult && (
            <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
              <h5>{t.import.validationResult}</h5>
              <div className="validation-summary">
                <div className="validation-stat"><span className="stat-value">{validationResult.totalRows}</span><span className="stat-label">{t.import.totalRows}</span></div>
                <div className="validation-stat"><span className="stat-value">{validationResult.errors.length}</span><span className="stat-label">{t.import.errorCount}</span></div>
                <div className="validation-stat"><span className={`stat-value ${validationResult.valid ? 'success' : 'error'}`}>{validationResult.valid ? '✓' : '✗'}</span><span className="stat-label">{t.import.validationStatus}</span></div>
              </div>

              {validationResult.errors.length > 0 && (
                <div className="validation-errors">
                  <h6>{t.import.validationErrors}:</h6>
                  <ul>
                    {validationResult.errors.slice(0, 10).map((entry, index) => <li key={index}>{t.import.rowError(entry.row, entry.message)}</li>)}
                    {validationResult.errors.length > 10 && <li>{t.import.moreErrors(validationResult.errors.length - 10)}</li>}
                  </ul>
                </div>
              )}

              {validationResult.preview.length > 0 && (
                <div className="data-preview">
                  <h6>{t.import.preview}:</h6>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr><th>{t.import.colName}</th><th>{t.import.colUrl}</th><th>{t.import.colDesc}</th><th>{t.import.colGroup}</th></tr>
                      </thead>
                      <tbody>
                        {validationResult.preview.map((row, index) => (
                          <tr key={index}><td>{row.name}</td><td>{row.url}</td><td>{row.description || '-'}</td><td>{row.groupName}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="import-result">
              <h5>{t.import.importResult}</h5>
              <div className="result-summary">
                <div className="result-stat success"><span className="stat-value">{importResult.imported}</span><span className="stat-label">{t.import.linksImported}</span></div>
                <div className="result-stat error"><span className="stat-value">{importResult.errors.length}</span><span className="stat-label">{t.import.errorCount}</span></div>
                <div className="result-stat info"><span className="stat-value">{importResult.createdGroups.length}</span><span className="stat-label">{t.import.groupsCreated}</span></div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="import-errors">
                  <h6>{t.import.importErrors}:</h6>
                  <ul>
                    {importResult.errors.map((entry, index) => <li key={index}>{t.import.rowError(entry.row, entry.message)}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="format-help">
            <h5>{t.import.expectedFormat}</h5>
            <div className="template-downloads">
              <p>{t.import.downloadTemplateHint}</p>
              <div className="template-buttons">
                <button className="template-button" onClick={() => handleDownloadTemplate('csv')}>{t.import.csvTemplate}</button>
                <button className="template-button" onClick={() => handleDownloadTemplate('xlsx')}>{t.import.xlsxTemplate}</button>
              </div>
            </div>
            <div className="format-example">
              <table>
                <thead><tr><th>{t.import.colName}</th><th>{t.import.colUrl}</th><th>{t.import.colDesc}</th><th>{t.import.colGroup}</th></tr></thead>
                <tbody>
                  <tr><td>Google</td><td>https://www.google.com</td><td>{language === 'zh' ? '搜索引擎' : 'Search engine'}</td><td>{language === 'zh' ? '搜索工具' : 'Search Tools'}</td></tr>
                  <tr><td>GitHub</td><td>https://github.com</td><td>{language === 'zh' ? '代码仓库' : 'Code repository'}</td><td>{language === 'zh' ? '开发工具' : 'Development'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="export-section">
          <div className="section-description"><h4>{t.export.title}</h4><p>{t.export.desc}</p></div>

          <div className="export-options">
            <h5>{t.export.options}</h5>
            <label className="checkbox-option"><input type="checkbox" checked={exportOptions.includeAllUsers} onChange={(e) => setExportOptions(prev => ({ ...prev, includeAllUsers: e.target.checked }))} /><span>{t.export.includeAllUsers}</span></label>
            <label className="checkbox-option"><input type="checkbox" checked={exportOptions.includeGroups} onChange={(e) => setExportOptions(prev => ({ ...prev, includeGroups: e.target.checked }))} /><span>{t.export.includeGroups}</span></label>
            <label className="checkbox-option"><input type="checkbox" checked={exportOptions.includeStats} onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))} /><span>{t.export.includeStats}</span></label>
            <label className="checkbox-option"><input type="checkbox" checked={exportOptions.includeMetadata} onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))} /><span>{t.export.includeMetadata}</span></label>
          </div>

          <div className="export-format">
            <h5>{t.export.format}</h5>
            <div className="format-options">
              <label className="radio-option"><input type="radio" name="format" value="csv" checked={exportOptions.format === 'csv'} onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'xlsx' }))} /><span>{t.export.csvLabel}</span></label>
              <label className="radio-option"><input type="radio" name="format" value="xlsx" checked={exportOptions.format === 'xlsx'} onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'xlsx' }))} /><span>{t.export.xlsxLabel}</span></label>
            </div>
          </div>

          <div className="export-actions"><button className="export-button" onClick={handleExport} disabled={exportLoading}>{exportLoading ? t.export.exporting : t.export.exportData}</button></div>

          <div className="export-info">
            <h5>{t.export.info}</h5>
            <div className="info-grid">
              <div className="info-item"><span className="info-label">{t.export.totalUsers}:</span><span className="info-value">12</span></div>
              <div className="info-item"><span className="info-label">{t.export.totalLinks}:</span><span className="info-value">156</span></div>
              <div className="info-item"><span className="info-label">{t.export.totalGroups}:</span><span className="info-value">24</span></div>
              <div className="info-item"><span className="info-label">{t.export.lastExport}:</span><span className="info-value">{t.export.never}</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'batch' && (
        <div className="batch-section">
          <div className="section-description"><h4>{t.batch.title}</h4><p>{t.batch.desc}</p></div>
          <div className="batch-tools">
            {t.batch.cards.map(([title, desc, action]) => (
              <div className="tool-card" key={title}>
                <div className="tool-header"><h5>{title}</h5></div>
                <div className="tool-content"><p>{desc}</p><button className="tool-button">{action}</button></div>
              </div>
            ))}
          </div>
          <div className="batch-history">
            <h5>{t.batch.history}</h5>
            <div className="history-list">
              <div className="history-item"><div className="history-info"><span className="history-action">{language === 'zh' ? '导入数据' : 'Import Data'}</span><span className="history-details">{language === 'zh' ? '成功导入 45 个链接' : 'Imported 45 links successfully'}</span></div><div className="history-meta"><span className="history-time">{language === 'zh' ? '2 小时前' : '2 hours ago'}</span><span className="history-status success">{language === 'zh' ? '成功' : 'Success'}</span></div></div>
              <div className="history-item"><div className="history-info"><span className="history-action">{language === 'zh' ? '导出数据' : 'Export Data'}</span><span className="history-details">{language === 'zh' ? '导出 156 个链接到 Excel' : 'Exported 156 links to Excel'}</span></div><div className="history-meta"><span className="history-time">{language === 'zh' ? '1 天前' : '1 day ago'}</span><span className="history-status success">{language === 'zh' ? '成功' : 'Success'}</span></div></div>
              <div className="history-item"><div className="history-info"><span className="history-action">{language === 'zh' ? '数据清理' : 'Data Cleanup'}</span><span className="history-details">{language === 'zh' ? '清理了 12 个重复链接' : 'Cleaned 12 duplicate links'}</span></div><div className="history-meta"><span className="history-time">{language === 'zh' ? '3 天前' : '3 days ago'}</span><span className="history-status success">{language === 'zh' ? '成功' : 'Success'}</span></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport;
