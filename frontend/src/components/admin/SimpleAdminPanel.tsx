import React, { useState } from 'react';
import SimpleBatchImport from './SimpleBatchImport';
import './SimpleAdminPanel.css';

interface SimpleAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const SimpleAdminPanel: React.FC<SimpleAdminPanelProps> = ({
  isOpen,
  onClose,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      console.log('🔍 开始导出...');
      const token = localStorage.getItem('authToken'); // 使用正确的key
      console.log('🔑 Token:', token ? token.substring(0, 50) + '...' : 'null');

      if (!token) {
        alert('请先登录系统');
        return;
      }

      const response = await fetch('/api/export/simple', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 响应状态:', response.status);
      console.log('📄 Content-Type:', response.headers.get('content-type'));

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `navigation-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        console.log('✅ 导出成功!');
        alert('导出成功！文件已下载。');
      } else {
        const errorText = await response.text();
        console.error('❌ 导出失败:', errorText);
        alert('导出失败: ' + errorText);
      }
    } catch (error) {
      console.error('❌ 导出错误:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('导出错误: ' + errorMessage);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="simple-admin-panel">
        <div className="panel-header">
          <h2>数据管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="panel-tabs">
          <button
            className={`tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
          >
            导入数据
          </button>
          <button
            className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            导出数据
          </button>
        </div>

        <div className="panel-content">
          {activeTab === 'import' && (
            <SimpleBatchImport />
          )}
          
          {activeTab === 'export' && (
            <div className="export-section">
              <h3>导出所有数据</h3>
              <p>将所有链接和分组导出为CSV文件</p>
              <button className="export-btn" onClick={handleExport}>
                导出CSV文件
              </button>
            </div>
          )}
        </div>

        <div className="panel-footer">
          <button className="refresh-btn" onClick={onRefresh}>
            刷新
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminPanel;