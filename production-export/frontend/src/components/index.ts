import React from 'react';

// 核心组件 - 立即加载
export { NavigationView } from './navigation/NavigationView';
export { LinkCard } from './navigation/LinkCard';
export { GroupTabs } from './navigation/GroupTabs';

// 认证组件
export { LoginForm } from './auth/LoginForm';
export { RegisterForm } from './auth/RegisterForm';
export { UserProfile } from './auth/UserProfile';

// 懒加载的管理组件
export const SimpleAdminPanel = React.lazy(() => import('./admin/SimpleAdminPanel'));
export const ImportExport = React.lazy(() => import('./admin/ImportExport'));
export const BatchOperations = React.lazy(() => import('./admin/BatchOperations'));

// 通用组件 - 导出具体的函数而不是默认导出
export { NotificationProvider, useNotifications } from './common/NotificationSystem';
export { ProgressBar, StepProgress, CircularProgress } from './common/ProgressIndicator';