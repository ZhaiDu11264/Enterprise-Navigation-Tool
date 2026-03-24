import React, { useState, useCallback } from 'react';
import { WebsiteLink, Group } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { language } = useLanguage();
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null);
  const [editData, setEditData] = useState<BatchEditData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = language === 'zh'
    ? {
        errors: { del: '删除失败', move: '移动失败', edit: '编辑失败', export: '导出失败' },
        header: {
          selected: (n: number) => `已选择 ${n} 个链接`,
          clear: '清除选择',
          close: '关闭错误'
        },
        actions: {
          move: '📁 移动到分组',
          edit: '✏️ 批量编辑',
          delete: '🗑️ 批量删除',
          exportCsv: '📄 导出CSV',
          exportExcel: '📊 导出Excel'
        },
        moveModal: {
          title: '移动到分组',
          desc: (n: number) => `将选中的 ${n} 个链接移动到：`,
          cancel: '取消',
          confirm: '确认移动',
          loading: '移动中...'
        },
        editModal: {
          title: '批量编辑',
          desc: (n: number) => `编辑选中的 ${n} 个链接：`,
          description: '描述',
          descriptionPlaceholder: '留空表示不修改',
          group: '分组',
          groupNoChange: '不修改分组',
          favorite: '设为收藏',
          cancel: '取消',
          save: '保存更改',
          saving: '保存中...'
        },
        deleteModal: {
          title: '确认删除',
          desc: (n: number) => `确定要删除选中的 ${n} 个链接吗？`,
          warning: '此操作不可撤销！',
          more: (n: number) => `还有 ${n} 个链接...`,
          cancel: '取消',
          confirm: '确认删除',
          deleting: '删除中...'
        }
      }
    : {
        errors: { del: 'Delete failed', move: 'Move failed', edit: 'Edit failed', export: 'Export failed' },
        header: {
          selected: (n: number) => `${n} links selected`,
          clear: 'Clear Selection',
          close: 'Close error'
        },
        actions: {
          move: '📁 Move to Group',
          edit: '✏️ Batch Edit',
          delete: '🗑️ Batch Delete',
          exportCsv: '📄 Export CSV',
          exportExcel: '📊 Export Excel'
        },
        moveModal: {
          title: 'Move to Group',
          desc: (n: number) => `Move ${n} selected links to:`,
          cancel: 'Cancel',
          confirm: 'Confirm Move',
          loading: 'Moving...'
        },
        editModal: {
          title: 'Batch Edit',
          desc: (n: number) => `Edit ${n} selected links:`,
          description: 'Description',
          descriptionPlaceholder: 'Leave empty to keep unchanged',
          group: 'Group',
          groupNoChange: 'Keep current group',
          favorite: 'Mark as favorite',
          cancel: 'Cancel',
          save: 'Save Changes',
          saving: 'Saving...'
        },
        deleteModal: {
          title: 'Confirm Delete',
          desc: (n: number) => `Delete ${n} selected links?`,
          warning: 'This action cannot be undone!',
          more: (n: number) => `${n} more links...`,
          cancel: 'Cancel',
          confirm: 'Confirm Delete',
          deleting: 'Deleting...'
        }
      };

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
      setError(err instanceof Error ? err.message : t.errors.del);
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, onBatchDelete, onClearSelection, t.errors.del]);

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
      setError(err instanceof Error ? err.message : t.errors.move);
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, targetGroupId, onBatchMove, onClearSelection, t.errors.move]);

  const handleBatchEdit = useCallback(async () => {
    if (selectedLinks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const linkIds = selectedLinks.map(link => link.id);
      const updates: Partial<WebsiteLink> = {};
      if (editData.description !== undefined) updates.description = editData.description;
      if (editData.isFavorite !== undefined) updates.isFavorite = editData.isFavorite;
      if (editData.groupId !== undefined) updates.groupId = editData.groupId;
      await onBatchEdit(linkIds, updates);
      setShowEditModal(false);
      setEditData({});
      onClearSelection();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.edit);
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, editData, onBatchEdit, onClearSelection, t.errors.edit]);

  const handleBatchExport = useCallback(async (format: 'csv' | 'xlsx') => {
    if (selectedLinks.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const linkIds = selectedLinks.map(link => link.id);
      await onBatchExport(linkIds, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.export);
    } finally {
      setLoading(false);
    }
  }, [selectedLinks, onBatchExport, t.errors.export]);

  if (selectedLinks.length === 0) return null;

  return (
    <div className="batch-operations">
      <div className="batch-operations-header">
        <div className="selection-info">
          <span className="selection-count">{t.header.selected(selectedLinks.length)}</span>
          <button className="clear-selection-btn" onClick={onClearSelection} disabled={loading}>
            {t.header.clear}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label={t.header.close}>×</button>
          </div>
        )}
      </div>

      <div className="batch-actions">
        <div className="action-group">
          <button className="batch-btn move-btn" onClick={() => setShowMoveModal(true)} disabled={loading}>{t.actions.move}</button>
          <button className="batch-btn edit-btn" onClick={() => setShowEditModal(true)} disabled={loading}>{t.actions.edit}</button>
          <button className="batch-btn delete-btn" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>{t.actions.delete}</button>
        </div>

        <div className="action-group">
          <button className="batch-btn export-btn" onClick={() => handleBatchExport('csv')} disabled={loading}>{t.actions.exportCsv}</button>
          <button className="batch-btn export-btn" onClick={() => handleBatchExport('xlsx')} disabled={loading}>{t.actions.exportExcel}</button>
        </div>
      </div>

      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t.moveModal.title}</h3>
              <button className="modal-close" onClick={() => setShowMoveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{t.moveModal.desc(selectedLinks.length)}</p>
              <div className="group-selection">
                {allGroups.map(group => (
                  <label key={group.id} className="group-option">
                    <input
                      type="radio"
                      name="targetGroup"
                      value={group.id}
                      checked={targetGroupId === group.id}
                      onChange={(e) => setTargetGroupId(parseInt(e.target.value, 10))}
                    />
                    <span>{group.name}</span>
                    {group.description && <span className="group-description">{group.description}</span>}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowMoveModal(false)} disabled={loading}>{t.moveModal.cancel}</button>
              <button className="btn-primary" onClick={handleBatchMove} disabled={loading || !targetGroupId}>
                {loading ? t.moveModal.loading : t.moveModal.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t.editModal.title}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{t.editModal.desc(selectedLinks.length)}</p>
              <div className="edit-form">
                <div className="form-group">
                  <label>{t.editModal.description}</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t.editModal.descriptionPlaceholder}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>{t.editModal.group}</label>
                  <select
                    value={editData.groupId || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, groupId: e.target.value ? parseInt(e.target.value, 10) : undefined }))}
                  >
                    <option value="">{t.editModal.groupNoChange}</option>
                    {allGroups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editData.isFavorite === true}
                      onChange={(e) => setEditData(prev => ({ ...prev, isFavorite: e.target.checked ? true : undefined }))}
                    />
                    <span>{t.editModal.favorite}</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)} disabled={loading}>{t.editModal.cancel}</button>
              <button className="btn-primary" onClick={handleBatchEdit} disabled={loading}>{loading ? t.editModal.saving : t.editModal.save}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{t.deleteModal.title}</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>{t.deleteModal.desc(selectedLinks.length)}</p>
              <p className="warning-text">{t.deleteModal.warning}</p>
              <div className="selected-links-preview">
                {selectedLinks.slice(0, 5).map(link => (
                  <div key={link.id} className="link-preview">
                    <span className="link-name">{link.name}</span>
                    <span className="link-url">{link.url}</span>
                  </div>
                ))}
                {selectedLinks.length > 5 && (
                  <div className="more-links">{t.deleteModal.more(selectedLinks.length - 5)}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={loading}>{t.deleteModal.cancel}</button>
              <button className="btn-danger" onClick={handleBatchDelete} disabled={loading}>{loading ? t.deleteModal.deleting : t.deleteModal.confirm}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperations;
