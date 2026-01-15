import React, { useCallback, useEffect, useMemo, useState } from 'react';
import adminService, { FeedbackStats } from '../../services/adminService';
import { FeedbackListItem, FeedbackStatus, FeedbackType } from '../../types';
import './FeedbackPanel.css';

const feedbackTypes: FeedbackType[] = ['feature', 'bug', 'ui', 'data', 'other'];
const feedbackStatuses: FeedbackStatus[] = ['new', 'reviewed', 'resolved'];
const defaultReplyTitle = '反馈回复';

const FeedbackPanel: React.FC = () => {
  const [items, setItems] = useState<FeedbackListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<FeedbackType | ''>('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [replyTarget, setReplyTarget] = useState<FeedbackListItem | null>(null);
  const [replyTitle, setReplyTitle] = useState(defaultReplyTitle);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await adminService.getFeedbackStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load feedback stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.getFeedbackList({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        keyword: keyword || undefined,
        limit: pageSize,
        offset: page * pageSize
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to load feedback list:', err);
      setError('加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, keyword, page]);

  const handleOpenReply = (item: FeedbackListItem) => {
    setReplyTarget(item);
    setReplyTitle(defaultReplyTitle);
    setReplyMessage('');
    setReplyStatus(null);
  };

  const handleSendReply = async () => {
    if (!replyTarget || !replyMessage.trim()) {
      return;
    }
    setReplySending(true);
    setReplyStatus(null);
    try {
      await adminService.sendNotification({
        title: replyTitle.trim(),
        message: replyMessage.trim(),
        level: 'info',
        userIds: [replyTarget.userId]
      });
      setReplyStatus('已发送');
      setReplyMessage('');
    } catch (err) {
      console.warn('Failed to send reply:', err);
      setReplyStatus('发送失败，请稍后重试');
    } finally {
      setReplySending(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className="feedback-panel">
      <div className="feedback-stats">
        <div className="feedback-stat-card">
          <div className="label">总反馈</div>
          <div className="value">{statsLoading ? '...' : stats?.total ?? 0}</div>
        </div>
        <div className="feedback-stat-card">
          <div className="label">新反馈</div>
          <div className="value">{stats?.byStatus?.new ?? 0}</div>
        </div>
      </div>

      <div className="feedback-breakdown">
        <div className="breakdown-card">
          <div className="label">类型分布</div>
          <div className="breakdown-list">
            {feedbackTypes.map((type) => (
              <span key={type} className={`badge type-${type}`}>
                {type} {stats?.byType?.[type] ?? 0}
              </span>
            ))}
          </div>
        </div>
        <div className="breakdown-card">
          <div className="label">状态分布</div>
          <div className="breakdown-list">
            {feedbackStatuses.map((status) => (
              <span key={status} className={`badge status-${status}`}>
                {status} {stats?.byStatus?.[status] ?? 0}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="feedback-filters">
        <select
          value={typeFilter}
          onChange={(event) => {
            setPage(0);
            setTypeFilter(event.target.value as FeedbackType | '');
          }}
        >
          <option value="">全部类型</option>
          {feedbackTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(event) => {
            setPage(0);
            setStatusFilter(event.target.value as FeedbackStatus | '');
          }}
        >
          <option value="">全部状态</option>
          {feedbackStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索内容或用户"
        />
        <button type="button" onClick={() => loadList()} disabled={loading}>
          刷新
        </button>
      </div>

      {error && <div className="feedback-error">{error}</div>}

      <div className="feedback-table">
        <div className="feedback-table-header">
          <span>时间</span>
          <span>用户</span>
          <span>类型</span>
          <span>状态</span>
          <span>内容</span>
        </div>
        {loading ? (
          <div className="feedback-loading">加载中...</div>
        ) : items.length === 0 ? (
          <div className="feedback-empty">暂无反馈</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="feedback-table-row">
              <span>{new Date(item.createdAt).toLocaleString()}</span>
              <span className="feedback-user">
                {item.displayName || item.username}
                <em>{item.email}</em>
              </span>
              <span className={`badge type-${item.type}`}>{item.type}</span>
              <span className={`badge status-${item.status}`}>{item.status}</span>
              <span className="feedback-message">
                {item.message}
                <button
                  type="button"
                  className="feedback-reply"
                  onClick={() => handleOpenReply(item)}
                >
                  快速回信
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="feedback-pagination">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
        >
          上一页
        </button>
        <span>
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          下一页
        </button>
      </div>

      {replyTarget && (
        <div className="feedback-reply-modal">
          <div className="feedback-reply-card">
            <div className="feedback-reply-header">
              <div>
                <h4>发送给 {replyTarget.displayName || replyTarget.username}</h4>
                <p>{replyTarget.email}</p>
              </div>
              <button type="button" onClick={() => setReplyTarget(null)} aria-label="关闭">
                ×
              </button>
            </div>
            <div className="feedback-reply-body">
              <label>
                标题
                <input
                  type="text"
                  value={replyTitle}
                  onChange={(event) => setReplyTitle(event.target.value)}
                />
              </label>
              <label>
                内容
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                />
              </label>
              {replyStatus && <div className="feedback-reply-status">{replyStatus}</div>}
            </div>
            <div className="feedback-reply-footer">
              <button type="button" onClick={() => setReplyTarget(null)}>
                取消
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleSendReply}
                disabled={replySending || !replyMessage.trim()}
              >
                {replySending ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
