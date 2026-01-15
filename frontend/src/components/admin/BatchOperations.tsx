import React, { useState, useCallback } from 'react';
import { WebsiteLink, Group } from '../../types';
import './BatchOperations.css';

interface BatchOperationsProps {
  selectedLinks: WebsiteLink[];
  allGroups: Group[];
  onBatchDelete: (linkIds: number[]) => Promise<void>;
  onBatchMove: (linkIds: number[], targetGroupId: number) => Promise<void>;
  onBatchEdit: (linkIds: number[], updates: Partial<WebsiteLink>) => Promise<void>;
  onBatchExport: (linkIds: number[], format: 'csv' | 'xlsx') => Promise<void>;
  onClearSelection: () => void;
}

interface BatchEditData {
  description?: string;
  isFavorite?: boolean;
  groupId?: number;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedLinks,
  allGroups,
  onBatchDelete,
  onBatchMove,
  onBatchEdit,
  onBatchExport,
  onClearSelection
}) => {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);
  const [editData, setEditData] = useState<BatchEditData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBatchDelete = useCallback(async () => {
    if (selectedLinks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const linkIds = selectedLinks.map(link => link.id);
      await onBatchDelete(linkIds);
      setShowDeleteConfirm(false);
      onClearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, onBatchDelete, onClearSelection]);

  const handleBatchMove = useCallback(async () => {
    if (selectedLinks.length === 0 || !targetGroupId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const linkIds = selectedLinks.map(link => link.id);
      await onBatchMove(linkIds, targetGroupId);
      setShowMoveModal(false);
      setTargetGroupId(null);
      onClearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : '移动失败');
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, targetGroupId, onBatchMove, onClearSelection]);

  const handleBatchEdit = useCallback(async () => {
    if (selectedLinks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const linkIds = selectedLinks.map(link => link.id);
      const updates: Partial<WebsiteLink> = {};
      
      if (editData.description !== undefined) {
        updates.description = editData.description;
      }
      if (editData.isFavorite !== undefined) {
        updates.isFavorite = editData.isFavorite;
      }
      if (editData.groupId !== undefined) {
        updates.groupId = editData.groupId;
      }
      
      await onBatchEdit(linkIds, updates);
      setShowEditModal(false);
      setEditData({});
      onClearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : '编辑失败');
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, editData, onBatchEdit, onClearSelection]);

  const handleBatchExport = useCallback(async (format: 'csv' | 'xlsx') => {
    if (selectedLinks.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const linkIds = selectedLinks.map(link => link.id);
      await onBatchExport(linkIds, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败');
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, onBatchExport]);

  if (selectedLinks.length === 0) {
    return null;
  }

  return (
    <div className="batch-operations">
      <div className="batch-operations-header">
        <div className="selection-info">
          <span className="selection-count">已选择 {selectedLinks.length} 个链接</span>
          <button 
            className="clear-selection-btn"
            onClick={onClearSelection}
            disabled={loading}
          >
            清除选择
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}
      </div>

      <div className="batch-actions">
        <div className="action-group">
          <button
            className="batch-btn move-btn"
            onClick={() => setShowMoveModal(true)}
            disabled={loading}
          >
            📁 移动到分组
          </button>
          
          <button
            className="batch-btn edit-btn"
            onClick={() => setShowEditModal(true)}
            disabled={loading}
          >
            ✏️ 批量编辑
          </button>
          
          <button
            className="batch-btn delete-btn"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            🗑️ 批量删除
          </button>
        </div>

        <div className="action-group">
          <button
            className="batch-btn export-btn"
            onClick={() => handleBatchExport('csv')}
            disabled={loading}
          >
            📄 导出CSV
          </button>
          
          <button
            className="batch-btn export-btn"
            onClick={() => handleBatchExport('xlsx')}
            disabled={loading}
          >
            📊 导出Excel
          </button>
        </div>
      </div>

      {/* Move Modal */}
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>移动到分组</h3>
              <button 
                className="modal-close"
                onClick={() => setShowMoveModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>将选中的 {selectedLinks.length} 个链接移动到：</p>
              
              <div className="group-selection">
                {allGroups.map(group => (
                  <label key={group.id} className="group-option">
                    <input
                      type="radio"
                      name="targetGroup"
                      value={group.id}
                      checked={targetGroupId === group.id}
                      onChange={(e) => setTargetGroupId(parseInt(e.target.value))}
                    />
                    <span>{group.name}</span>
                    {group.description && (
                      <span className="group-description">{group.description}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowMoveModal(false)}
                disabled={loading}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleBatchMove}
                disabled={loading || !targetGroupId}
              >
                {loading ? '移动中...' : '确认移动'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>批量编辑</h3>
              <button 
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>编辑选中的 {selectedLinks.length} 个链接：</p>
              
              <div className="edit-form">
                <div className="form-group">
                  <label>描述</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="留空表示不修改"
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label>分组</label>
                  <select
                    value={editData.groupId || ''}
                    onChange={(e) => setEditData(prev => ({ 
                      ...prev, 
                      groupId: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  >
                    <option value="">不修改分组</option>
                    {allGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editData.isFavorite === true}
                      onChange={(e) => setEditData(prev => ({ 
                        ...prev, 
                        isFavorite: e.target.checked ? true : undefined 
                      }))}
                    />
                    <span>设为收藏</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={loading}
              >
                取消
              </button>
              <button
                className="btn-primary"
                onClick={handleBatchEdit}
                disabled={loading}
              >
                {loading ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>确认删除</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDeleteConfirm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <p>确定要删除选中的 {selectedLinks.length} 个链接吗？</p>
              <p className="warning-text">此操作不可撤销！</p>
              
              <div className="selected-links-preview">
                {selectedLinks.slice(0, 5).map(link => (
                  <div key={link.id} className="link-preview">
                    <span className="link-name">{link.name}</span>
                    <span className="link-url">{link.url}</span>
                  </div>
                ))}
                {selectedLinks.length > 5 && (
                  <div className="more-links">
                    还有 {selectedLinks.length - 5} 个链接...
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                取消
              </button>
              <button
                className="btn-danger"
                onClick={handleBatchDelete}
                disabled={loading}
              >
                {loading ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperations;