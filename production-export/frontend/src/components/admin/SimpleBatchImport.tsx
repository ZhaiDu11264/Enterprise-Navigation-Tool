import React, { useState } from 'react';
import './SimpleBatchImport.css';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

const SimpleBatchImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('请选择CSV文件');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('authToken'); // 使用正确的key
      if (!token) {
        setError('请先登录系统');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/import/simple', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          imported: data.imported || 0,
          errors: data.errors || []
        });
      } else {
        // 安全地处理错误对象
        let errorMessage = '导入失败';
        if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (data.error && data.error.message) {
          errorMessage = data.error.message;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError('导入失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = 'name,url,description,group\nGoogle,https://google.com,搜索引擎,搜索工具\nGitHub,https://github.com,代码仓库,开发工具';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'import-template.csv';
    link.click();
  };

  return (
    <div className="simple-batch-import">
      <div className="import-header">
        <h3>批量导入链接</h3>
        <button className="template-btn" onClick={downloadTemplate}>
          下载模板
        </button>
      </div>

      {error && (
        <div className="error-message">
          {typeof error === 'string' ? error : '发生未知错误'}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="file-upload">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={loading}
        />
        {file && (
          <div className="file-info">
            <span>{file.name}</span>
            <span>({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </div>

      <div className="import-actions">
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="import-btn"
        >
          {loading ? '导入中...' : '开始导入'}
        </button>
      </div>

      {result && (
        <div className="import-result">
          <div className="result-summary">
            <span className="success">成功导入: {result.imported}</span>
            {result.errors.length > 0 && (
              <span className="errors">错误: {result.errors.length}</span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div className="error-list">
              {result.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="error-item">{error}</div>
              ))}
              {result.errors.length > 5 && (
                <div className="more-errors">还有 {result.errors.length - 5} 个错误...</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="format-info">
        <h4>CSV格式说明</h4>
        <p>文件应包含以下列：name（名称）、url（网址）、description（描述）、group（分组）</p>
      </div>
    </div>
  );
};

export default SimpleBatchImport;