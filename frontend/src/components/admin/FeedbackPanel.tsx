import React, { useCallback, useEffect, useMemo, useState } from 'react';
import adminService, { FeedbackStats } from '../../services/adminService';
import { FeedbackListItem, FeedbackStatus, FeedbackType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import './FeedbackPanel.css';

const feedbackTypes: FeedbackType[] = ['feature', 'bug', 'ui', 'data', 'other'];
const feedbackStatuses: FeedbackStatus[] = ['new', 'reviewed', 'resolved'];

const typeLabels: Record<FeedbackType, { zh: string; en: string }> = {
  feature: { zh: '功能建议', en: 'Feature' },
  bug: { zh: '问题反馈', en: 'Bug' },
  ui: { zh: '界面体验', en: 'UI/UX' },
  data: { zh: '数据问题', en: 'Data' },
  other: { zh: '其他', en: 'Other' }
};

const statusLabels: Record<FeedbackStatus, { zh: string; en: string }> = {
  new: { zh: '新建', en: 'New' },
  reviewed: { zh: '已查看', en: 'Reviewed' },
  resolved: { zh: '已解决', en: 'Resolved' }
};

const FeedbackPanel: React.FC = () => {
  const { language } = useLanguage();
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
  const [replyTitle, setReplyTitle] = useState(language === 'zh' ? '反馈回复' : 'Feedback Reply');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<string | null>(null);

  const t = language === 'zh'
    ? {
        defaultReplyTitle: '反馈回复',
        loadFailed: '加载失败，请稍后重试',
        sent: '已发送',
        sendFailed: '发送失败，请稍后重试',
        totalFeedback: '总反馈',
        newFeedback: '新反馈',
        typeDist: '类型分布',
        statusDist: '状态分布',
        allTypes: '全部类型',
        allStatuses: '全部状态',
        searchPlaceholder: '搜索内容或用户',
        refresh: '刷新',
        time: '时间',
        user: '用户',
        type: '类型',
        status: '状态',
        content: '内容',
        loading: '加载中...',
        empty: '暂无反馈',
        quickReply: '快速回信',
        prev: '上一页',
        next: '下一页',
        sendTo: '发送给',
        close: '关闭',
        title: '标题',
        message: '内容',
        cancel: '取消',
        sending: '发送中...',
        send: '发送'
      }
    : {
        defaultReplyTitle: 'Feedback Reply',
        loadFailed: 'Failed to load. Please try again later.',
        sent: 'Sent',
        sendFailed: 'Failed to send. Please try again later.',
        totalFeedback: 'Total Feedback',
        newFeedback: 'New Feedback',
        typeDist: 'Type Distribution',
        statusDist: 'Status Distribution',
        allTypes: 'All Types',
        allStatuses: 'All Statuses',
        searchPlaceholder: 'Search content or user',
        refresh: 'Refresh',
        time: 'Time',
        user: 'User',
        type: 'Type',
        status: 'Status',
        content: 'Content',
        loading: 'Loading...',
        empty: 'No feedback yet',
        quickReply: 'Quick Reply',
        prev: 'Previous',
        next: 'Next',
        sendTo: 'Send to',
        close: 'Close',
        title: 'Title',
        message: 'Message',
        cancel: 'Cancel',
        sending: 'Sending...',
        send: 'Send'
      };

  useEffect(() => {
    setReplyTitle(t.defaultReplyTitle);
  }, [t.defaultReplyTitle]);

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
      setError(t.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, keyword, page, t.loadFailed]);

  const handleOpenReply = (item: FeedbackListItem) => {
    setReplyTarget(item);
    setReplyTitle(t.defaultReplyTitle);
    setReplyMessage('');
    setReplyStatus(null);
  };

  const handleSendReply = async () => {
    if (!replyTarget || !replyMessage.trim()) return;
    setReplySending(true);
    setReplyStatus(null);
    try {
      await adminService.sendNotification({
        title: replyTitle.trim(),
        message: replyMessage.trim(),
        level: 'info',
        userIds: [replyTarget.userId]
      });
      setReplyStatus(t.sent);
      setReplyMessage('');
    } catch (err) {
      console.warn('Failed to send reply:', err);
      setReplyStatus(t.sendFailed);
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
  const localType = (type: FeedbackType) => typeLabels[type][language];
  const localStatus = (status: FeedbackStatus) => statusLabels[status][language];

  return (
    <div className="feedback-panel">
      <div className="feedback-stats">
        <div className="feedback-stat-card">
          <div className="label">{t.totalFeedback}</div>
          <div className="value">{statsLoading ? '...' : stats?.total ?? 0}</div>
        </div>
        <div className="feedback-stat-card">
          <div className="label">{t.newFeedback}</div>
          <div className="value">{stats?.byStatus?.new ?? 0}</div>
        </div>
      </div>

      <div className="feedback-breakdown">
        <div className="breakdown-card">
          <div className="label">{t.typeDist}</div>
          <div className="breakdown-list">
            {feedbackTypes.map((type) => (
              <span key={type} className={`badge type-${type}`}>{localType(type)} {stats?.byType?.[type] ?? 0}</span>
            ))}
          </div>
        </div>
        <div className="breakdown-card">
          <div className="label">{t.statusDist}</div>
          <div className="breakdown-list">
            {feedbackStatuses.map((status) => (
              <span key={status} className={`badge status-${status}`}>{localStatus(status)} {stats?.byStatus?.[status] ?? 0}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="feedback-filters">
        <select value={typeFilter} onChange={(event) => { setPage(0); setTypeFilter(event.target.value as FeedbackType | ''); }}>
          <option value="">{t.allTypes}</option>
          {feedbackTypes.map((type) => <option key={type} value={type}>{localType(type)}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => { setPage(0); setStatusFilter(event.target.value as FeedbackStatus | ''); }}>
          <option value="">{t.allStatuses}</option>
          {feedbackStatuses.map((status) => <option key={status} value={status}>{localStatus(status)}</option>)}
        </select>
        <input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder={t.searchPlaceholder} />
        <button type="button" onClick={() => loadList()} disabled={loading}>{t.refresh}</button>
      </div>

      {error && <div className="feedback-error">{error}</div>}

      <div className="feedback-table">
        <div className="feedback-table-header">
          <span>{t.time}</span>
          <span>{t.user}</span>
          <span>{t.type}</span>
          <span>{t.status}</span>
          <span>{t.content}</span>
        </div>
        {loading ? (
          <div className="feedback-loading">{t.loading}</div>
        ) : items.length === 0 ? (
          <div className="feedback-empty">{t.empty}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="feedback-table-row">
              <span>{new Date(item.createdAt).toLocaleString()}</span>
              <span className="feedback-user">{item.displayName || item.username}<em>{item.email}</em></span>
              <span className={`badge type-${item.type}`}>{localType(item.type)}</span>
              <span className={`badge status-${item.status}`}>{localStatus(item.status)}</span>
              <span className="feedback-message">
                {item.message}
                <button type="button" className="feedback-reply" onClick={() => handleOpenReply(item)}>{t.quickReply}</button>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="feedback-pagination">
        <button type="button" disabled={page === 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>{t.prev}</button>
        <span>{page + 1} / {totalPages}</span>
        <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((prev) => prev + 1)}>{t.next}</button>
      </div>

      {replyTarget && (
        <div className="feedback-reply-modal">
          <div className="feedback-reply-card">
            <div className="feedback-reply-header">
              <div>
                <h4>{t.sendTo} {replyTarget.displayName || replyTarget.username}</h4>
                <p>{replyTarget.email}</p>
              </div>
              <button type="button" onClick={() => setReplyTarget(null)} aria-label={t.close}>×</button>
            </div>
            <div className="feedback-reply-body">
              <label>
                {t.title}
                <input type="text" value={replyTitle} onChange={(event) => setReplyTitle(event.target.value)} />
              </label>
              <label>
                {t.message}
                <textarea rows={4} value={replyMessage} onChange={(event) => setReplyMessage(event.target.value)} />
              </label>
              {replyStatus && <div className="feedback-reply-status">{replyStatus}</div>}
            </div>
            <div className="feedback-reply-footer">
              <button type="button" onClick={() => setReplyTarget(null)}>{t.cancel}</button>
              <button type="button" className="primary" onClick={handleSendReply} disabled={replySending || !replyMessage.trim()}>
                {replySending ? t.sending : t.send}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
