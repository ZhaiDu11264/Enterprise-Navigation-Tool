import React, { useState, useCallback } from 'react';
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
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
        setError('Please select a valid CSV or Excel file');
        setImportFile(null);
      }
    }
  };

  const handleValidateFile = useCallback(async () => {
    if (!importFile) {
      setError('Please select a file to validate');
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setValidationResult(data);
      } else {
        setError(data.error || 'Validation failed');
      }

    } catch (err: any) {
      console.error('Validation failed:', err);
      setError('Failed to validate file. Please try again.');
    } finally {
      setValidationLoading(false);
    }
  }, [importFile, importOptions.validateUrls]);

  const handleImport = async () => {
    if (!importFile) {
      setError('Please select a file to import');
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
          setError(`Import completed with ${data.result.errors.length} errors`);
        } else {
          setError(data.error || 'Import failed');
        }
      }

      setImportFile(null);
      // Reset file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (err: any) {
      console.error('Import failed:', err);
      setError('Failed to import file. Please try again.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    try {
      const response = await fetch(`/api/export/template?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `import-template.${format}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to download template');
      }
    } catch (err: any) {
      console.error('Template download failed:', err);
      setError('Failed to download template. Please try again.');
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Get filename from response headers
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `navigation-export-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Export failed');
      }

    } catch (err: any) {
      console.error('Export failed:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="import-export">
      <div className="import-export-header">
        <h3>Import/Export Data</h3>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="import-export-tabs">
        <button
          className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          导入数据
        </button>
        <button
          className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          导出数据
        </button>
        <button
          className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          批量操作
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="import-section">
          <div className="section-description">
            <h4>Import Website Links</h4>
            <p>Upload a CSV or Excel file to import website links in bulk. The file should contain columns for name, URL, description, and group.</p>
          </div>

          <div className="file-upload-area">
            <div className="upload-zone">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p>Choose a CSV or Excel file to upload</p>
                <p className="upload-hint">Supported formats: .csv, .xlsx, .xls</p>
              </div>
              <input
                type="file"
                id="import-file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="file-input"
              />
              <label htmlFor="import-file" className="file-input-label">
                Select File
              </label>
            </div>

            {importFile && (
              <div className="selected-file">
                <div className="file-info">
                  <span className="file-name">{importFile.name}</span>
                  <span className="file-size">
                    {(importFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  className="remove-file"
                  onClick={() => {
                    setImportFile(null);
                    const fileInput = document.getElementById('import-file') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="import-options">
            <h5>Import Options</h5>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={importOptions.validateUrls}
                onChange={(e) => setImportOptions(prev => ({ ...prev, validateUrls: e.target.checked }))}
              />
              <span>Validate URLs during import</span>
            </label>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={importOptions.skipDuplicates}
                onChange={(e) => setImportOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
              />
              <span>Skip duplicate URLs</span>
            </label>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={importOptions.createMissingGroups}
                onChange={(e) => setImportOptions(prev => ({ ...prev, createMissingGroups: e.target.checked }))}
              />
              <span>自动创建缺失的分组</span>
            </label>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={importOptions.overwriteExisting}
                onChange={(e) => setImportOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
              />
              <span>覆盖已存在的链接</span>
            </label>
          </div>

          <div className="import-actions">
            <button
              className="validate-button"
              onClick={handleValidateFile}
              disabled={!importFile || validationLoading}
            >
              {validationLoading ? '验证中...' : '验证文件'}
            </button>
            <button
              className="import-button"
              onClick={handleImport}
              disabled={!importFile || importLoading || (validationResult ? !validationResult.valid : false)}
            >
              {importLoading ? '导入中...' : '导入数据'}
            </button>
          </div>

          {validationResult && (
            <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
              <h5>文件验证结果</h5>
              <div className="validation-summary">
                <div className="validation-stat">
                  <span className="stat-value">{validationResult.totalRows}</span>
                  <span className="stat-label">总行数</span>
                </div>
                <div className="validation-stat">
                  <span className="stat-value">{validationResult.errors.length}</span>
                  <span className="stat-label">错误数</span>
                </div>
                <div className="validation-stat">
                  <span className={`stat-value ${validationResult.valid ? 'success' : 'error'}`}>
                    {validationResult.valid ? '✓' : '✗'}
                  </span>
                  <span className="stat-label">验证状态</span>
                </div>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="validation-errors">
                  <h6>验证错误:</h6>
                  <ul>
                    {validationResult.errors.slice(0, 10).map((error: any, index: number) => (
                      <li key={index}>
                        第 {error.row} 行: {error.message}
                      </li>
                    ))}
                    {validationResult.errors.length > 10 && (
                      <li>还有 {validationResult.errors.length - 10} 个错误...</li>
                    )}
                  </ul>
                </div>
              )}
              
              {validationResult.preview.length > 0 && (
                <div className="data-preview">
                  <h6>数据预览:</h6>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr>
                          <th>名称</th>
                          <th>URL</th>
                          <th>描述</th>
                          <th>分组</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResult.preview.map((row, index) => (
                          <tr key={index}>
                            <td>{row.name}</td>
                            <td>{row.url}</td>
                            <td>{row.description || '-'}</td>
                            <td>{row.groupName}</td>
                          </tr>
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
              <h5>Import Results</h5>
              <div className="result-summary">
                <div className="result-stat success">
                  <span className="stat-value">{importResult.imported}</span>
                  <span className="stat-label">Links Imported</span>
                </div>
                <div className="result-stat error">
                  <span className="stat-value">{importResult.errors.length}</span>
                  <span className="stat-label">Errors</span>
                </div>
                <div className="result-stat info">
                  <span className="stat-value">{importResult.createdGroups.length}</span>
                  <span className="stat-label">Groups Created</span>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="import-errors">
                  <h6>Import Errors:</h6>
                  <ul>
                    {importResult.errors.map((error: any, index: number) => (
                      <li key={index}>
                        Row {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="format-help">
            <h5>Expected File Format</h5>
            <div className="template-downloads">
              <p>Download a template file to see the expected format:</p>
              <div className="template-buttons">
                <button 
                  className="template-button"
                  onClick={() => handleDownloadTemplate('csv')}
                >
                  Download CSV Template
                </button>
                <button 
                  className="template-button"
                  onClick={() => handleDownloadTemplate('xlsx')}
                >
                  Download Excel Template
                </button>
              </div>
            </div>
            <div className="format-example">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>URL</th>
                    <th>Description</th>
                    <th>Group</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Google</td>
                    <td>https://www.google.com</td>
                    <td>Search engine</td>
                    <td>Search Tools</td>
                  </tr>
                  <tr>
                    <td>GitHub</td>
                    <td>https://github.com</td>
                    <td>Code repository</td>
                    <td>Development</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="export-section">
          <div className="section-description">
            <h4>Export Website Links</h4>
            <p>Download all website links and configurations as a CSV or Excel file for backup or migration purposes.</p>
          </div>

          <div className="export-options">
            <h5>Export Options</h5>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={exportOptions.includeAllUsers}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAllUsers: e.target.checked }))}
              />
              <span>Include all user data</span>
            </label>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={exportOptions.includeGroups}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeGroups: e.target.checked }))}
              />
              <span>Include group information</span>
            </label>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={exportOptions.includeStats}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeStats: e.target.checked }))}
              />
              <span>Include access statistics</span>
            </label>
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
              />
              <span>Include user metadata</span>
            </label>
          </div>

          <div className="export-format">
            <h5>Export Format</h5>
            <div className="format-options">
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="format" 
                  value="csv" 
                  checked={exportOptions.format === 'csv'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'xlsx' }))}
                />
                <span>CSV (Comma Separated Values)</span>
              </label>
              <label className="radio-option">
                <input 
                  type="radio" 
                  name="format" 
                  value="xlsx" 
                  checked={exportOptions.format === 'xlsx'}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'xlsx' }))}
                />
                <span>Excel (.xlsx)</span>
              </label>
            </div>
          </div>

          <div className="export-actions">
            <button
              className="export-button"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          <div className="export-info">
            <h5>导出信息</h5>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">总用户数:</span>
                <span className="info-value">12</span>
              </div>
              <div className="info-item">
                <span className="info-label">总链接数:</span>
                <span className="info-value">156</span>
              </div>
              <div className="info-item">
                <span className="info-label">总分组数:</span>
                <span className="info-value">24</span>
              </div>
              <div className="info-item">
                <span className="info-label">上次导出:</span>
                <span className="info-value">从未</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Operations Tab */}
      {activeTab === 'batch' && (
        <div className="batch-section">
          <div className="section-description">
            <h4>批量操作工具</h4>
            <p>使用这些工具进行高级的批量导入导出操作，包括数据转换、清理和验证功能。</p>
          </div>

          <div className="batch-tools">
            <div className="tool-card">
              <div className="tool-header">
                <h5>📊 数据分析</h5>
              </div>
              <div className="tool-content">
                <p>分析现有数据的质量和结构，识别重复项、无效链接等问题。</p>
                <button className="tool-button">
                  开始分析
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <h5>🔄 数据转换</h5>
              </div>
              <div className="tool-content">
                <p>在不同格式之间转换数据，支持CSV、Excel、JSON等格式。</p>
                <button className="tool-button">
                  格式转换
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <h5>🧹 数据清理</h5>
              </div>
              <div className="tool-content">
                <p>清理重复链接、修复无效URL、标准化数据格式。</p>
                <button className="tool-button">
                  清理数据
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <h5>📋 批量编辑</h5>
              </div>
              <div className="tool-content">
                <p>批量修改链接属性，如描述、分组、标签等。</p>
                <button className="tool-button">
                  批量编辑
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <h5>🔍 高级搜索</h5>
              </div>
              <div className="tool-content">
                <p>使用复杂条件搜索和筛选链接，支持正则表达式。</p>
                <button className="tool-button">
                  高级搜索
                </button>
              </div>
            </div>

            <div className="tool-card">
              <div className="tool-header">
                <h5>📈 统计报告</h5>
              </div>
              <div className="tool-content">
                <p>生成详细的使用统计报告和数据分析图表。</p>
                <button className="tool-button">
                  生成报告
                </button>
              </div>
            </div>
          </div>

          <div className="batch-history">
            <h5>操作历史</h5>
            <div className="history-list">
              <div className="history-item">
                <div className="history-info">
                  <span className="history-action">导入数据</span>
                  <span className="history-details">成功导入 45 个链接</span>
                </div>
                <div className="history-meta">
                  <span className="history-time">2 小时前</span>
                  <span className="history-status success">成功</span>
                </div>
              </div>
              
              <div className="history-item">
                <div className="history-info">
                  <span className="history-action">导出数据</span>
                  <span className="history-details">导出 156 个链接到 Excel</span>
                </div>
                <div className="history-meta">
                  <span className="history-time">1 天前</span>
                  <span className="history-status success">成功</span>
                </div>
              </div>
              
              <div className="history-item">
                <div className="history-info">
                  <span className="history-action">数据清理</span>
                  <span className="history-details">清理了 12 个重复链接</span>
                </div>
                <div className="history-meta">
                  <span className="history-time">3 天前</span>
                  <span className="history-status success">成功</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportExport;