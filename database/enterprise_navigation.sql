/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80044
 Source Host           : localhost:3306
 Source Schema         : enterprise_navigation

 Target Server Type    : MySQL
 Target Server Version : 80044
 File Encoding         : 65001

 Date: 16/01/2026 10:30:06
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `action` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `entity_id` int NULL DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `ip_address` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_audit_logs_created_at`(`created_at`) USING BTREE,
  INDEX `idx_audit_logs_user_id`(`user_id`) USING BTREE,
  INDEX `idx_audit_logs_action`(`action`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 150 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------
INSERT INTO `audit_logs` VALUES (1, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:40:40');
INSERT INTO `audit_logs` VALUES (2, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:40:40');
INSERT INTO `audit_logs` VALUES (3, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:41:19');
INSERT INTO `audit_logs` VALUES (4, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:41:19');
INSERT INTO `audit_logs` VALUES (5, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:54:06');
INSERT INTO `audit_logs` VALUES (6, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:54:06');
INSERT INTO `audit_logs` VALUES (7, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:54:45');
INSERT INTO `audit_logs` VALUES (8, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:54:45');
INSERT INTO `audit_logs` VALUES (9, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:54:45');
INSERT INTO `audit_logs` VALUES (10, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:54:45');
INSERT INTO `audit_logs` VALUES (11, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:55:02');
INSERT INTO `audit_logs` VALUES (12, 1, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 15:55:02');
INSERT INTO `audit_logs` VALUES (13, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:10:37');
INSERT INTO `audit_logs` VALUES (14, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:10:46');
INSERT INTO `audit_logs` VALUES (15, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:10:46');
INSERT INTO `audit_logs` VALUES (16, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:10:46');
INSERT INTO `audit_logs` VALUES (17, 4, 'link.delete', 'link', 129, 'Deleted link', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:15:02');
INSERT INTO `audit_logs` VALUES (18, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:15:12');
INSERT INTO `audit_logs` VALUES (19, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:15:44');
INSERT INTO `audit_logs` VALUES (20, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:15:50');
INSERT INTO `audit_logs` VALUES (21, 1, 'admin.notification.send', 'notification', 1, 'Sent notification \"更新公告\" to 6 users', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:37:19');
INSERT INTO `audit_logs` VALUES (22, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:37:31');
INSERT INTO `audit_logs` VALUES (23, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:37:39');
INSERT INTO `audit_logs` VALUES (24, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:37:55');
INSERT INTO `audit_logs` VALUES (25, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 16:37:55');
INSERT INTO `audit_logs` VALUES (26, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:19:08');
INSERT INTO `audit_logs` VALUES (27, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:19:08');
INSERT INTO `audit_logs` VALUES (28, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:24:50');
INSERT INTO `audit_logs` VALUES (29, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:24:50');
INSERT INTO `audit_logs` VALUES (30, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:51:57');
INSERT INTO `audit_logs` VALUES (31, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:51:57');
INSERT INTO `audit_logs` VALUES (32, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:56:35');
INSERT INTO `audit_logs` VALUES (33, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 17:56:35');
INSERT INTO `audit_logs` VALUES (34, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:04:02');
INSERT INTO `audit_logs` VALUES (35, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:04:17');
INSERT INTO `audit_logs` VALUES (36, 4, 'link.create', 'link', 212, 'Created link \"中国版权保护中心\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:01');
INSERT INTO `audit_logs` VALUES (37, 4, 'reorder.links', NULL, NULL, 'Reordered 7 links', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:10');
INSERT INTO `audit_logs` VALUES (38, 4, 'reorder.links', NULL, NULL, 'Reordered 7 links', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:14');
INSERT INTO `audit_logs` VALUES (39, 4, 'reorder.links', NULL, NULL, 'Reordered 7 links', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:16');
INSERT INTO `audit_logs` VALUES (40, 4, 'reorder.links', NULL, NULL, 'Reordered 7 links', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:24');
INSERT INTO `audit_logs` VALUES (41, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:29');
INSERT INTO `audit_logs` VALUES (42, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:36');
INSERT INTO `audit_logs` VALUES (43, 1, 'link.update', 'link', 211, 'Updated link \"CRM系统\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:06:58');
INSERT INTO `audit_logs` VALUES (44, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:14:26');
INSERT INTO `audit_logs` VALUES (45, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:14:54');
INSERT INTO `audit_logs` VALUES (46, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:14:54');
INSERT INTO `audit_logs` VALUES (47, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:14:54');
INSERT INTO `audit_logs` VALUES (48, 4, 'link.create', 'link', 213, 'Created link \"中国版权保护中心\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:15:41');
INSERT INTO `audit_logs` VALUES (49, 4, 'reorder.links', NULL, NULL, 'Reordered 7 links', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:15');
INSERT INTO `audit_logs` VALUES (50, 4, 'reorder.links', NULL, NULL, 'Reordered 8 links', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:18');
INSERT INTO `audit_logs` VALUES (51, 4, 'link.update', 'link', 146, 'Updated link \"国家政务服务平台\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:37');
INSERT INTO `audit_logs` VALUES (52, 4, 'link.update', 'link', 163, 'Updated link \"国家统计局数据平台\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:38');
INSERT INTO `audit_logs` VALUES (53, 4, 'link.update', 'link', 163, 'Updated link \"国家统计局数据平台\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:40');
INSERT INTO `audit_logs` VALUES (54, 4, 'link.update', 'link', 146, 'Updated link \"国家政务服务平台\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:40');
INSERT INTO `audit_logs` VALUES (55, 4, 'link.update', 'link', 143, 'Updated link \"公积金管理系统\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:16:41');
INSERT INTO `audit_logs` VALUES (56, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:23:19');
INSERT INTO `audit_logs` VALUES (57, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-14 18:23:27');
INSERT INTO `audit_logs` VALUES (58, 1, 'link.update', 'link', 209, 'Updated link \"人力资源系统\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:31:43');
INSERT INTO `audit_logs` VALUES (59, 1, 'link.update', 'link', 208, 'Updated link \"协同办公系统\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:31:50');
INSERT INTO `audit_logs` VALUES (60, 1, 'profile.update', 'user', 1, 'Updated profile', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:31:55');
INSERT INTO `audit_logs` VALUES (61, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:31:58');
INSERT INTO `audit_logs` VALUES (62, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:32:09');
INSERT INTO `audit_logs` VALUES (63, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:32:09');
INSERT INTO `audit_logs` VALUES (64, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:32:09');
INSERT INTO `audit_logs` VALUES (65, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:53:11');
INSERT INTO `audit_logs` VALUES (66, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:53:11');
INSERT INTO `audit_logs` VALUES (67, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:53:30');
INSERT INTO `audit_logs` VALUES (68, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 08:53:30');
INSERT INTO `audit_logs` VALUES (69, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 09:48:19');
INSERT INTO `audit_logs` VALUES (70, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 09:48:19');
INSERT INTO `audit_logs` VALUES (71, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:18:24');
INSERT INTO `audit_logs` VALUES (72, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:18:24');
INSERT INTO `audit_logs` VALUES (73, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:23:29');
INSERT INTO `audit_logs` VALUES (74, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:23:29');
INSERT INTO `audit_logs` VALUES (75, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:23:50');
INSERT INTO `audit_logs` VALUES (76, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:28:26');
INSERT INTO `audit_logs` VALUES (77, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:28:26');
INSERT INTO `audit_logs` VALUES (78, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:33:33');
INSERT INTO `audit_logs` VALUES (79, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:33:33');
INSERT INTO `audit_logs` VALUES (80, 4, 'profile.avatar.update', 'user', 4, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:34:38');
INSERT INTO `audit_logs` VALUES (81, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:34:38');
INSERT INTO `audit_logs` VALUES (82, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:34:50');
INSERT INTO `audit_logs` VALUES (83, 4, 'profile.avatar.update', 'user', 4, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:35:04');
INSERT INTO `audit_logs` VALUES (84, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:35:04');
INSERT INTO `audit_logs` VALUES (85, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:48:00');
INSERT INTO `audit_logs` VALUES (86, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 10:48:00');
INSERT INTO `audit_logs` VALUES (87, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:05:23');
INSERT INTO `audit_logs` VALUES (88, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:05:23');
INSERT INTO `audit_logs` VALUES (89, 4, 'profile.avatar.update', 'user', 4, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:07:58');
INSERT INTO `audit_logs` VALUES (90, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:07:58');
INSERT INTO `audit_logs` VALUES (91, 4, 'profile.avatar.update', 'user', 4, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:08:04');
INSERT INTO `audit_logs` VALUES (92, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:08:04');
INSERT INTO `audit_logs` VALUES (93, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:08:08');
INSERT INTO `audit_logs` VALUES (94, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:31:17');
INSERT INTO `audit_logs` VALUES (95, 4, 'profile.avatar.update', 'user', 4, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:31:38');
INSERT INTO `audit_logs` VALUES (96, 4, 'profile.update', 'user', 4, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:31:38');
INSERT INTO `audit_logs` VALUES (97, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:31:45');
INSERT INTO `audit_logs` VALUES (98, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:31:54');
INSERT INTO `audit_logs` VALUES (99, 1, 'profile.avatar.update', 'user', 1, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:32:02');
INSERT INTO `audit_logs` VALUES (100, 1, 'profile.update', 'user', 1, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:32:02');
INSERT INTO `audit_logs` VALUES (101, 1, 'admin.user.reset_config', 'user', 4, 'Reset configuration for user \"han\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:33:40');
INSERT INTO `audit_logs` VALUES (102, 1, 'admin.user.reset_profile', 'user', 4, 'Reset profile for user \"han\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:34:00');
INSERT INTO `audit_logs` VALUES (103, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:34:17');
INSERT INTO `audit_logs` VALUES (104, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:34:28');
INSERT INTO `audit_logs` VALUES (105, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:34:44');
INSERT INTO `audit_logs` VALUES (106, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:34:53');
INSERT INTO `audit_logs` VALUES (107, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:45:38');
INSERT INTO `audit_logs` VALUES (108, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:45:47');
INSERT INTO `audit_logs` VALUES (109, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:51:45');
INSERT INTO `audit_logs` VALUES (110, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 11:51:45');
INSERT INTO `audit_logs` VALUES (111, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 14:25:17');
INSERT INTO `audit_logs` VALUES (112, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 14:25:17');
INSERT INTO `audit_logs` VALUES (113, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 14:52:47');
INSERT INTO `audit_logs` VALUES (114, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 14:52:47');
INSERT INTO `audit_logs` VALUES (115, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:01:43');
INSERT INTO `audit_logs` VALUES (116, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:01:43');
INSERT INTO `audit_logs` VALUES (117, 4, 'feedback.create', 'feedback', 1, 'Submitted feedback (feature)', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:02:01');
INSERT INTO `audit_logs` VALUES (118, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:02:07');
INSERT INTO `audit_logs` VALUES (119, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:02:35');
INSERT INTO `audit_logs` VALUES (120, 1, 'admin.notification.send', 'notification', 2, 'Sent notification \"管理员回信\" to 1 users', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:08:54');
INSERT INTO `audit_logs` VALUES (121, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:08:59');
INSERT INTO `audit_logs` VALUES (122, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:09:09');
INSERT INTO `audit_logs` VALUES (123, 4, 'reorder.groups', NULL, NULL, 'Reordered 7 groups', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:25:55');
INSERT INTO `audit_logs` VALUES (124, 4, 'reorder.groups', NULL, NULL, 'Reordered 7 groups', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 15:25:57');
INSERT INTO `audit_logs` VALUES (125, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:20:37');
INSERT INTO `audit_logs` VALUES (126, 1, 'profile.avatar.update', 'user', 1, 'Updated avatar', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:20:58');
INSERT INTO `audit_logs` VALUES (127, 1, 'profile.update', 'user', 1, 'Updated profile', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:20:58');
INSERT INTO `audit_logs` VALUES (128, 1, 'feedback.create', 'feedback', 2, 'Submitted feedback (feature)', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:21:17');
INSERT INTO `audit_logs` VALUES (129, 1, 'auth.logout', 'user', 1, 'User \"admin\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:31:10');
INSERT INTO `audit_logs` VALUES (130, 4, 'auth.login', 'user', 4, 'User \"han\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:31:16');
INSERT INTO `audit_logs` VALUES (131, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:31:17');
INSERT INTO `audit_logs` VALUES (132, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:31:17');
INSERT INTO `audit_logs` VALUES (133, 4, 'reorder.links', NULL, NULL, 'Reordered 9 links', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:32:20');
INSERT INTO `audit_logs` VALUES (134, 4, 'reorder.links', NULL, NULL, 'Reordered 9 links', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:32:22');
INSERT INTO `audit_logs` VALUES (135, 4, 'reorder.links', NULL, NULL, 'Reordered 9 links', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 16:32:27');
INSERT INTO `audit_logs` VALUES (136, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 18:02:23');
INSERT INTO `audit_logs` VALUES (137, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-15 18:02:23');
INSERT INTO `audit_logs` VALUES (138, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 09:05:53');
INSERT INTO `audit_logs` VALUES (139, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 09:05:53');
INSERT INTO `audit_logs` VALUES (140, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 09:11:28');
INSERT INTO `audit_logs` VALUES (141, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 09:11:28');
INSERT INTO `audit_logs` VALUES (142, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 09:38:21');
INSERT INTO `audit_logs` VALUES (143, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 09:38:21');
INSERT INTO `audit_logs` VALUES (144, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 10:12:08');
INSERT INTO `audit_logs` VALUES (145, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 10:12:08');
INSERT INTO `audit_logs` VALUES (146, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 10:14:08');
INSERT INTO `audit_logs` VALUES (147, 4, 'config.refresh', 'configuration', 1, 'Refreshed configuration \"默认企业配置\"', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 10:14:08');
INSERT INTO `audit_logs` VALUES (148, 4, 'auth.logout', 'user', 4, 'User \"han\" logged out', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 10:20:14');
INSERT INTO `audit_logs` VALUES (149, 1, 'auth.login', 'user', 1, 'User \"admin\" logged in', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-16 10:20:23');

-- ----------------------------
-- Table structure for default_configurations
-- ----------------------------
DROP TABLE IF EXISTS `default_configurations`;
CREATE TABLE `default_configurations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `config_data` json NOT NULL,
  `version` int NULL DEFAULT 1,
  `is_active` tinyint(1) NULL DEFAULT 0,
  `created_by` int NOT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `created_by`(`created_by`) USING BTREE,
  INDEX `idx_active`(`is_active`) USING BTREE,
  INDEX `idx_version`(`version`) USING BTREE,
  CONSTRAINT `default_configurations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of default_configurations
-- ----------------------------
INSERT INTO `default_configurations` VALUES (1, '默认企业配置', '包含内部办公系统的标准配置（新用户注册时自动应用）', '{\"links\": [{\"url\": \"https://www.hnntgroup.cn/qywh\", \"name\": \"公司网站\", \"iconUrl\": \"https://hnntgroup.cn/favicon.ico\", \"groupName\": \"内部办公\", \"sortOrder\": 0, \"description\": \"公司官方网站\", \"isDeletable\": false, \"isSystemLink\": true}, {\"url\": \"http://oa.czgm.com\", \"name\": \"协同办公系统(OA)\", \"iconUrl\": \"http://oa.czgm.com/seeyon/common/images/A6/favicon.ico\", \"groupName\": \"内部办公\", \"sortOrder\": 1, \"description\": \"办公自动化系统\", \"isDeletable\": false, \"isSystemLink\": true}, {\"url\": \"http://ehr.czgm.com\", \"name\": \"人力资源系统(EHR)\", \"iconUrl\": \"/icons/website-icon.svg\", \"groupName\": \"内部办公\", \"sortOrder\": 1, \"description\": \"人力资源管理系统\", \"isDeletable\": false, \"isSystemLink\": true}, {\"url\": \"http://mail.czgm.com\", \"name\": \"电子邮件系统\", \"iconUrl\": \"http://mail.czgm.com/favicon.ico\", \"groupName\": \"内部办公\", \"sortOrder\": 3, \"description\": \"企业邮箱系统\", \"isDeletable\": false, \"isSystemLink\": true}, {\"url\": \"http://192.168.21.196\", \"name\": \"CRM系统\", \"iconUrl\": \"/icons/link-icon.svg\", \"groupName\": \"内部办公\", \"sortOrder\": 4, \"description\": \"客户关系管理系统\", \"isDeletable\": false, \"isSystemLink\": true}], \"groups\": [{\"name\": \"内部办公\", \"sortOrder\": 0, \"description\": \"公司内部办公系统（管理员配置，不可删除）\", \"isDeletable\": false, \"isSystemGroup\": true}]}', 1007, 1, 1, '2026-01-07 09:48:54', '2026-01-16 10:10:45');

-- ----------------------------
-- Table structure for favicon_cache
-- ----------------------------
DROP TABLE IF EXISTS `favicon_cache`;
CREATE TABLE `favicon_cache`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cached_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `expires_at` timestamp(0) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `domain`(`domain`) USING BTREE,
  INDEX `idx_domain_expires`(`domain`, `expires_at`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 57 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of favicon_cache
-- ----------------------------
INSERT INTO `favicon_cache` VALUES (1, 'www.doubao.com', 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/76x76.png', '2026-01-09 11:24:18', '2026-01-10 11:24:19');
INSERT INTO `favicon_cache` VALUES (2, 'www.baidu.com', 'https://www.baidu.com/favicon.ico', '2026-01-07 14:43:07', '2026-01-08 14:43:07');
INSERT INTO `favicon_cache` VALUES (4, 'weibo.com', 'https://weibo.com/favicon.ico', '2026-01-09 11:24:23', '2026-01-10 11:24:24');
INSERT INTO `favicon_cache` VALUES (5, 'tv.cctv.com', 'https://p4.img.cctvpic.com/photoAlbum/page/performance/img/2021/9/28/1632795780652_242.jpg', '2026-01-09 11:24:27', '2026-01-10 11:24:27');
INSERT INTO `favicon_cache` VALUES (6, 'weixin.qq.com', 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico', '2026-01-07 17:20:00', '2026-01-08 17:20:01');
INSERT INTO `favicon_cache` VALUES (7, 'www.hnntgroup.cn', 'https://hnntgroup.cn/favicon.ico', '2026-01-07 17:49:48', '2026-01-08 17:49:48');
INSERT INTO `favicon_cache` VALUES (15, 'www.qq.com', 'https://mat1.gtimg.com/qqcdn/qqindex2021/favicon.ico', '2026-01-07 17:59:15', '2026-01-08 17:59:16');
INSERT INTO `favicon_cache` VALUES (16, 'v.qq.com', 'https://vfiles.gtimg.cn/wuji_dashboard/xy/starter/4ea79867.png', '2026-01-09 11:24:30', '2026-01-10 11:24:31');
INSERT INTO `favicon_cache` VALUES (17, 'oa.czgm.com', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', '2026-01-07 18:19:47', '2026-01-08 18:19:48');
INSERT INTO `favicon_cache` VALUES (18, 'mail.czgm.com', 'http://mail.czgm.com/favicon.ico', '2026-01-07 18:20:31', '2026-01-08 18:20:32');
INSERT INTO `favicon_cache` VALUES (19, 'www.stats.gov.cn', 'https://www.stats.gov.cn/favicon.ico', '2026-01-09 11:25:11', '2026-01-10 11:25:11');
INSERT INTO `favicon_cache` VALUES (20, 'www.pbc.gov.cn', 'https://www.pbc.gov.cn/uiFramework/commonResource/image/logo.ico', '2026-01-09 11:25:14', '2026-01-10 11:25:15');
INSERT INTO `favicon_cache` VALUES (21, 'www.yicai.com', 'https://www.yicai.com/favicon.ico', '2026-01-09 11:25:23', '2026-01-10 11:25:23');
INSERT INTO `favicon_cache` VALUES (22, '36kr.com', 'https://www.google.com/s2/favicons?domain=36kr.com&sz=128', '2026-01-14 08:52:21', '2026-01-15 08:52:22');
INSERT INTO `favicon_cache` VALUES (23, 'www.gov.cn', 'https://www.gov.cn/images/trs_favicon.ico', '2026-01-09 11:26:52', '2026-01-10 11:26:53');
INSERT INTO `favicon_cache` VALUES (24, 'gjzwfw.www.gov.cn', 'https://gjzwfw.www.gov.cn/favicon.ico', '2026-01-09 11:26:55', '2026-01-10 11:26:55');
INSERT INTO `favicon_cache` VALUES (25, 'www.ccgp.gov.cn', 'https://www.ccgp.gov.cn/favicon.ico', '2026-01-09 11:27:19', '2026-01-10 11:27:20');
INSERT INTO `favicon_cache` VALUES (26, 'cebpubservice.com', 'http://cebpubservice.com/common/images/bidder.ico', '2026-01-08 09:18:13', '2026-01-09 09:18:14');
INSERT INTO `favicon_cache` VALUES (28, 'www.cnipa.gov.cn', 'https://www.cnipa.gov.cn/favicon.ico', '2026-01-09 11:25:00', '2026-01-10 11:25:00');
INSERT INTO `favicon_cache` VALUES (30, 'www.mofcom.gov.cn', 'https://www.mofcom.gov.cn/favicon.ico', '2026-01-09 11:25:29', '2026-01-10 11:25:29');
INSERT INTO `favicon_cache` VALUES (31, 'flk.npc.gov.cn', 'https://flk.npc.gov.cn/favicon.ico', '2026-01-09 11:27:43', '2026-01-10 11:27:44');
INSERT INTO `favicon_cache` VALUES (32, 'wenshu.court.gov.cn', 'https://wenshu.court.gov.cn/website/wenshu/images/favicon.ico', '2026-01-09 11:27:48', '2026-01-10 11:27:48');
INSERT INTO `favicon_cache` VALUES (33, 'www.33iot.com', 'https://www.33iot.com/cn/res/images/favicon.ico', '2026-01-08 17:42:28', '2026-01-09 17:42:28');
INSERT INTO `favicon_cache` VALUES (50, 'www.remove.bg', 'https://www.remove.bg/apple-touch-icon.png?v=fc0bfce6e1310f1539afec9729716721', '2026-01-09 11:50:19', '2026-01-10 11:50:19');
INSERT INTO `favicon_cache` VALUES (51, 'www.bilibili.com', 'https://static.hdslb.com/mobile/img/512.png', '2026-01-09 11:51:04', '2026-01-10 11:51:05');
INSERT INTO `favicon_cache` VALUES (52, 'yuanbao.tencent.com', 'https://static.yuanbao.tencent.com/m/yuanbao-web/favicon@32.png', '2026-01-09 11:51:58', '2026-01-10 11:51:58');
INSERT INTO `favicon_cache` VALUES (53, 'www.ccopyright.com.cn', 'https://www.ccopyright.com.cn/images/favicon.ico', '2026-01-14 18:05:55', '2026-01-15 18:05:56');

-- ----------------------------
-- Table structure for groups
-- ----------------------------
DROP TABLE IF EXISTS `groups`;
CREATE TABLE `groups`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `sort_order` int NULL DEFAULT 0,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `is_system_group` tinyint(1) NULL DEFAULT 0,
  `is_deletable` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_sort`(`user_id`, `sort_order`) USING BTREE,
  INDEX `idx_user_active`(`user_id`, `is_active`) USING BTREE,
  INDEX `idx_system_group`(`is_system_group`) USING BTREE,
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 51 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of groups
-- ----------------------------
INSERT INTO `groups` VALUES (1, 2, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-07 09:49:19', '2026-01-07 09:49:19');
INSERT INTO `groups` VALUES (2, 3, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-07 10:19:33', '2026-01-07 10:19:33');
INSERT INTO `groups` VALUES (3, 1, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-07 10:19:33', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (4, 4, '工具', NULL, 4, 0, 0, 1, '2026-01-07 10:22:02', '2026-01-12 11:18:45');
INSERT INTO `groups` VALUES (5, 4, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-07 10:47:57', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (6, 4, '公司', NULL, 5, 0, 0, 1, '2026-01-07 11:50:21', '2026-01-07 17:14:44');
INSERT INTO `groups` VALUES (7, 4, 'd阿瓦达', 'd', 7, 0, 0, 1, '2026-01-07 12:31:04', '2026-01-07 17:14:56');
INSERT INTO `groups` VALUES (8, 4, '大大', NULL, 8, 0, 0, 1, '2026-01-07 12:31:08', '2026-01-07 17:14:58');
INSERT INTO `groups` VALUES (9, 4, '影音媒体', NULL, 3, 0, 0, 1, '2026-01-07 12:31:13', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (10, 4, '政务', NULL, 5, 0, 0, 1, '2026-01-07 12:31:16', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (11, 4, '常用工具', NULL, 1, 0, 0, 1, '2026-01-07 12:31:19', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (12, 4, '新闻资讯', NULL, 2, 0, 0, 1, '2026-01-07 12:31:22', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (13, 5, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-07 16:11:51', '2026-01-07 16:11:51');
INSERT INTO `groups` VALUES (14, 6, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-07 17:45:02', '2026-01-07 17:45:02');
INSERT INTO `groups` VALUES (15, 4, '财经数据', NULL, 6, 0, 0, 1, '2026-01-08 09:07:01', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (16, 4, '司法', NULL, 7, 0, 0, 1, '2026-01-08 09:20:05', '2026-01-09 15:37:08');
INSERT INTO `groups` VALUES (17, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-08 17:16:37', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (18, 1, '测试分组', '自动创建的分组', 1, 0, 0, 1, '2026-01-08 17:24:32', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (19, 1, '分组1', '自动创建的分组', 2, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-09 15:25:07');
INSERT INTO `groups` VALUES (20, 1, '分组2', '自动创建的分组', 3, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-09 15:25:10');
INSERT INTO `groups` VALUES (21, 1, '分组3', '自动创建的分组', 4, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (22, 1, '分组4', '自动创建的分组', 5, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (23, 1, '搜索工具', '自动创建的分组', 6, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (24, 1, '开发工具', '自动创建的分组', 7, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (25, 1, '购物网站', '自动创建的分组', 8, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (26, 1, '社交媒体', '自动创建的分组', 9, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (27, 1, '娱乐视频', '自动创建的分组', 10, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `groups` VALUES (28, 7, '常用工具', '自动创建的分组', 1, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (29, 7, '新闻资讯', '自动创建的分组', 2, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (30, 7, '影音媒体', '自动创建的分组', 3, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (31, 7, 'AI工具', '自动创建的分组', 4, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (32, 7, '政务', '自动创建的分组', 5, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (33, 7, '财经数据', '自动创建的分组', 6, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (34, 7, '司法', '自动创建的分组', 7, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `groups` VALUES (35, 4, '学术', NULL, 7, 0, 0, 1, '2026-01-12 09:59:02', '2026-01-15 11:33:40');
INSERT INTO `groups` VALUES (36, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-14 11:25:24', '2026-01-14 11:25:25');
INSERT INTO `groups` VALUES (37, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-14 11:25:25', '2026-01-14 11:25:26');
INSERT INTO `groups` VALUES (38, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-14 11:25:26', '2026-01-14 11:25:27');
INSERT INTO `groups` VALUES (39, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-14 11:25:27', '2026-01-14 11:25:41');
INSERT INTO `groups` VALUES (40, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-14 11:25:41', '2026-01-14 11:25:43');
INSERT INTO `groups` VALUES (41, 7, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-14 11:25:43', '2026-01-14 11:25:43');
INSERT INTO `groups` VALUES (42, 1, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 0, 1, 0, '2026-01-14 11:30:36', '2026-01-14 11:30:52');
INSERT INTO `groups` VALUES (43, 1, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-14 11:30:52', '2026-01-14 11:30:52');
INSERT INTO `groups` VALUES (44, 4, '内部办公', '公司内部办公系统（管理员配置，不可删除）', 0, 1, 1, 0, '2026-01-15 11:33:40', '2026-01-15 15:25:57');
INSERT INTO `groups` VALUES (45, 4, '学术', '自动创建的分组', 5, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 15:25:57');
INSERT INTO `groups` VALUES (46, 4, '常用工具', '自动创建的分组', 1, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 15:25:57');
INSERT INTO `groups` VALUES (47, 4, '影音媒体', '自动创建的分组', 2, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 15:25:57');
INSERT INTO `groups` VALUES (48, 4, '政务', '自动创建的分组', 3, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 15:25:57');
INSERT INTO `groups` VALUES (49, 4, '新闻资讯', '自动创建的分组', 4, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 15:25:57');
INSERT INTO `groups` VALUES (50, 4, '财经数据', '自动创建的分组', 6, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 15:25:57');

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `executed_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `version`(`version`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '001', '001_initial_schema.sql', 'Create initial database schema for Enterprise Navigation Tool', '2026-01-07 09:48:53');
INSERT INTO `migrations` VALUES (2, '002', '002_add_system_fields.sql', 'add system fields', '2026-01-07 09:48:54');
INSERT INTO `migrations` VALUES (3, '003', '003_add_updated_at_to_configurations.sql', 'add updated at to configurations', '2026-01-07 15:40:49');
INSERT INTO `migrations` VALUES (4, '004', '004_add_user_profile_fields.sql', 'Add profile fields for user display name and avatar', '2026-01-13 15:49:14');
INSERT INTO `migrations` VALUES (5, '005', '005_add_audit_logs.sql', 'Add audit logs table for user actions', '2026-01-14 15:40:37');
INSERT INTO `migrations` VALUES (6, '006', '006_add_notifications.sql', 'Add notifications for admin broadcasts and user targeting', '2026-01-14 16:36:05');
INSERT INTO `migrations` VALUES (7, '007', '007_add_feedback.sql', 'Add user feedback entries', '2026-01-15 15:01:40');

-- ----------------------------
-- Table structure for notification_recipients
-- ----------------------------
DROP TABLE IF EXISTS `notification_recipients`;
CREATE TABLE `notification_recipients`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` int NOT NULL,
  `user_id` int NOT NULL,
  `read_at` timestamp(0) NULL DEFAULT NULL,
  `delivered_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uniq_notification_user`(`notification_id`, `user_id`) USING BTREE,
  INDEX `idx_user_read`(`user_id`, `read_at`) USING BTREE,
  CONSTRAINT `notification_recipients_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `notification_recipients_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notification_recipients
-- ----------------------------
INSERT INTO `notification_recipients` VALUES (1, 1, 7, NULL, '2026-01-14 16:37:19');
INSERT INTO `notification_recipients` VALUES (2, 1, 6, NULL, '2026-01-14 16:37:19');
INSERT INTO `notification_recipients` VALUES (3, 1, 5, NULL, '2026-01-14 16:37:19');
INSERT INTO `notification_recipients` VALUES (5, 1, 3, NULL, '2026-01-14 16:37:19');
INSERT INTO `notification_recipients` VALUES (6, 1, 1, '2026-01-14 18:08:58', '2026-01-14 16:37:19');

-- ----------------------------
-- Table structure for notifications
-- ----------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` enum('info','success','warning','error') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'info',
  `created_by` int NULL DEFAULT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_created_by`(`created_by`) USING BTREE,
  INDEX `idx_created_at`(`created_at`) USING BTREE,
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notifications
-- ----------------------------
INSERT INTO `notifications` VALUES (1, '更新公告', '1.1：新增站内搜索功能，可以在搜索引擎列表切换。', 'info', 1, '2026-01-14 16:37:19');
INSERT INTO `notifications` VALUES (2, '管理员回信', '感谢您的宝贵意见！以按照您的要求修改！', 'info', 1, '2026-01-15 15:08:54');

-- ----------------------------
-- Table structure for user_feedback
-- ----------------------------
DROP TABLE IF EXISTS `user_feedback`;
CREATE TABLE `user_feedback`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` enum('bug','feature','ui','data','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','reviewed','resolved') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'new',
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_feedback_user`(`user_id`) USING BTREE,
  INDEX `idx_feedback_type`(`type`) USING BTREE,
  INDEX `idx_feedback_status`(`status`) USING BTREE,
  INDEX `idx_feedback_created`(`created_at`) USING BTREE,
  CONSTRAINT `user_feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_feedback
-- ----------------------------
INSERT INTO `user_feedback` VALUES (1, 4, 'feature', '11223344', 'new', '2026-01-15 15:02:01');
INSERT INTO `user_feedback` VALUES (2, 1, 'feature', '111111', 'new', '2026-01-15 16:21:17');

-- ----------------------------
-- Table structure for user_sessions
-- ----------------------------
DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions`  (
  `id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `expires_at` timestamp(0) NOT NULL,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_expires`(`user_id`, `expires_at`) USING BTREE,
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_sessions
-- ----------------------------

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'user',
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `last_login_at` timestamp(0) NULL DEFAULT NULL,
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  `is_active` tinyint(1) NULL DEFAULT 1,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  UNIQUE INDEX `email`(`email`) USING BTREE,
  INDEX `idx_username`(`username`) USING BTREE,
  INDEX `idx_email`(`email`) USING BTREE,
  INDEX `idx_role`(`role`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin', 'http://localhost:3000/uploads/avatars/avatar-1-1768465258213.webp', 'admin@company.com', '$2b$10$B3/xm7RJgdeD7gWJX1bqdu2coZPZec8DattfPpHKQhovXJnEBvyhC', 'admin', '2026-01-07 09:48:54', '2026-01-16 10:20:23', '2026-01-16 10:20:23', 1);
INSERT INTO `users` VALUES (2, 'demo_user_1767750559821', NULL, NULL, 'demo1767750559821@example.com', '$2b$10$SkyTXIkDCX25Ie4IH0bIYekPKffMuSCAfddWH2R2XRPKpA6WVMGT2', 'user', '2026-01-07 09:49:19', NULL, '2026-01-13 10:22:43', 0);
INSERT INTO `users` VALUES (3, 'qda', NULL, NULL, 'q@a.com', '$2b$10$d8.lQvvrwCukd/Kcg2Xx1eIyIS.xfD1o/h9/FDK4dgYSIUJI5YaXK', 'user', '2026-01-07 09:56:21', '2026-01-07 09:56:21', '2026-01-13 10:22:43', 1);
INSERT INTO `users` VALUES (4, 'han', 'han', NULL, 'q@ad.com', '$2b$10$cz9bnjw.VSqxE/TSRjcLYOxCyV2fYo6m9wdNbOT3Yz0orMvTKS0oG', 'user', '2026-01-07 10:21:33', '2026-01-15 16:31:16', '2026-01-15 16:31:16', 1);
INSERT INTO `users` VALUES (5, 'testuser', NULL, NULL, 'test@company.com', '$2b$10$Llq18lct67u/jOA3L5Y7b.t/Srt687knZF/4V.OrvshhnTOOGKnvy', 'user', '2026-01-07 16:11:05', '2026-01-07 17:03:00', '2026-01-13 10:22:43', 1);
INSERT INTO `users` VALUES (6, 'han2', NULL, NULL, 'h156175@163.com', '$2b$10$mL9Yu18eRirICBRVzoyB4uBAf6giaCQZT3Gy6kqrSw535ck4ctzFy', 'user', '2026-01-07 17:45:02', '2026-01-07 17:45:02', '2026-01-13 10:22:43', 1);
INSERT INTO `users` VALUES (7, 'han1', NULL, NULL, 'q@afd.com', '$2b$10$vcTeyGuGAu0TarzizEW4Qu/nIzKIxAj/3Px7N3ZK8k5HKbetjnngy', 'user', '2026-01-08 17:16:37', '2026-01-08 17:28:15', '2026-01-14 11:25:46', 1);

-- ----------------------------
-- Table structure for website_links
-- ----------------------------
DROP TABLE IF EXISTS `website_links`;
CREATE TABLE `website_links`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `icon_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sort_order` int NULL DEFAULT 0,
  `is_favorite` tinyint(1) NULL DEFAULT 0,
  `access_count` int NULL DEFAULT 0,
  `last_accessed_at` timestamp(0) NULL DEFAULT NULL,
  `is_active` tinyint(1) NULL DEFAULT 1,
  `is_system_link` tinyint(1) NULL DEFAULT 0,
  `is_deletable` tinyint(1) NULL DEFAULT 1,
  `created_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
  `updated_at` timestamp(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `group_id`(`group_id`) USING BTREE,
  INDEX `idx_user_group_sort`(`user_id`, `group_id`, `sort_order`) USING BTREE,
  INDEX `idx_user_favorite`(`user_id`, `is_favorite`) USING BTREE,
  INDEX `idx_user_active`(`user_id`, `is_active`) USING BTREE,
  INDEX `idx_system_link`(`is_system_link`) USING BTREE,
  FULLTEXT INDEX `idx_search`(`name`, `description`),
  CONSTRAINT `website_links_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `website_links_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 305 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of website_links
-- ----------------------------
INSERT INTO `website_links` VALUES (1, 2, 1, '公司网站', 'http://wm.czgm.com', '公司官方网站', NULL, 0, 0, 0, NULL, 1, 1, 0, '2026-01-07 09:49:19', '2026-01-07 09:49:19');
INSERT INTO `website_links` VALUES (2, 2, 1, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', NULL, 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 09:49:19', '2026-01-07 09:49:19');
INSERT INTO `website_links` VALUES (3, 2, 1, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', NULL, 2, 0, 0, NULL, 1, 1, 0, '2026-01-07 09:49:19', '2026-01-07 09:49:19');
INSERT INTO `website_links` VALUES (4, 2, 1, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', NULL, 3, 0, 0, NULL, 1, 1, 0, '2026-01-07 09:49:19', '2026-01-07 09:49:19');
INSERT INTO `website_links` VALUES (5, 2, 1, 'CRM系统', 'http://192.168.21.206', '客户关系管理系统', NULL, 4, 0, 0, NULL, 1, 1, 0, '2026-01-07 09:49:19', '2026-01-07 16:29:58');
INSERT INTO `website_links` VALUES (6, 3, 2, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 1, 1, 0, '2026-01-07 10:19:33', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (7, 3, 2, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 10:19:33', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (8, 3, 2, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 10:19:33', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (9, 3, 2, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 1, 1, 0, '2026-01-07 10:19:33', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (10, 3, 2, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 1, 1, 0, '2026-01-07 10:19:33', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (11, 1, 3, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 7, '2026-01-14 09:31:40', 0, 1, 0, '2026-01-07 10:19:33', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (12, 1, 3, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 6, '2026-01-14 09:35:40', 0, 1, 0, '2026-01-07 10:19:33', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (13, 1, 3, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 2, '2026-01-14 09:35:31', 0, 1, 0, '2026-01-07 10:19:33', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (14, 1, 3, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 3, '2026-01-14 09:35:34', 0, 1, 0, '2026-01-07 10:19:33', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (15, 1, 3, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 1, 5, '2026-01-14 09:35:38', 0, 1, 0, '2026-01-07 10:19:33', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (16, 4, 4, '百度', 'http://www.baidu.com', NULL, 'https://www.baidu.com/favicon.ico', 1, 0, 3, '2026-01-07 15:06:50', 0, 0, 1, '2026-01-07 10:22:46', '2026-01-07 17:17:55');
INSERT INTO `website_links` VALUES (17, 4, 5, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 14, '2026-01-14 11:17:37', 0, 1, 0, '2026-01-07 10:47:57', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (18, 4, 5, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 4, '2026-01-15 09:30:23', 0, 1, 0, '2026-01-07 10:47:57', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (19, 4, 5, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 0, 1, 0, '2026-01-07 10:47:57', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (20, 4, 5, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 2, '2026-01-14 11:23:41', 0, 1, 0, '2026-01-07 10:47:57', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (21, 4, 5, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 15, '2026-01-12 17:24:01', 0, 1, 0, '2026-01-07 10:47:57', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (22, 4, 4, '豆包', 'https://www.doubao.com', '会更好个', 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/76x76.png', 0, 1, 3, '2026-01-07 15:07:39', 0, 0, 1, '2026-01-07 10:55:55', '2026-01-12 11:18:45');
INSERT INTO `website_links` VALUES (23, 4, 5, '百度', 'https://www.doubao.com', NULL, 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/76x76.png', 5, 0, 0, NULL, 0, 0, 1, '2026-01-07 11:50:34', '2026-01-07 11:52:59');
INSERT INTO `website_links` VALUES (24, 4, 5, '百度', 'https://www.doubao.com', NULL, NULL, 5, 0, 0, NULL, 0, 0, 1, '2026-01-07 11:56:28', '2026-01-07 11:56:37');
INSERT INTO `website_links` VALUES (25, 1, 3, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', NULL, 4, 0, 0, NULL, 0, 1, 0, '2026-01-07 16:03:33', '2026-01-07 16:27:17');
INSERT INTO `website_links` VALUES (26, 5, 13, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 1, 1, 0, '2026-01-07 16:11:51', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (27, 5, 13, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 16:11:51', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (28, 5, 13, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 16:11:51', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (29, 5, 13, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 1, 1, 0, '2026-01-07 16:11:51', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (30, 5, 13, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 1, 1, 0, '2026-01-07 16:11:51', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (31, 5, 13, 'CRM系统', 'http://192.168.21.206', '客户关系管理系统', NULL, 4, 0, 0, NULL, 0, 1, 0, '2026-01-07 16:24:14', '2026-01-07 16:27:59');
INSERT INTO `website_links` VALUES (32, 4, 5, 'CRM系统', 'http://192.168.21.206', '客户关系管理系统', NULL, 4, 0, 0, NULL, 0, 1, 0, '2026-01-07 16:24:14', '2026-01-07 16:27:59');
INSERT INTO `website_links` VALUES (33, 3, 2, 'CRM系统', 'http://192.168.21.206', '客户关系管理系统', NULL, 4, 0, 0, NULL, 0, 1, 0, '2026-01-07 16:24:14', '2026-01-07 16:27:59');
INSERT INTO `website_links` VALUES (34, 4, 5, '豆包', 'https://www.doubao.com', 'AI助手', 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/76x76.png', 9, 0, 6, '2026-01-14 09:08:21', 0, 0, 1, '2026-01-07 17:15:22', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (35, 4, 5, '微博', 'https://weibo.com/', '看世界', 'https://weibo.com/favicon.ico', 23, 0, 2, '2026-01-12 15:50:54', 0, 0, 1, '2026-01-07 17:16:49', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (36, 4, 9, 'CCTV', 'https://tv.cctv.com/', NULL, 'https://p4.img.cctvpic.com/photoAlbum/page/performance/img/2021/9/28/1632795780652_242.jpg', 0, 1, 1, '2026-01-12 09:58:27', 0, 0, 1, '2026-01-07 17:17:51', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (37, 4, 10, '微信', 'https://weixin.qq.com/', NULL, 'https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico', 1, 0, 1, '2026-01-08 08:48:52', 0, 0, 1, '2026-01-07 17:20:03', '2026-01-08 09:13:55');
INSERT INTO `website_links` VALUES (38, 6, 14, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 1, 1, 0, '2026-01-07 17:45:02', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (39, 6, 14, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 17:45:02', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (40, 6, 14, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 1, 1, 0, '2026-01-07 17:45:02', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (41, 6, 14, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 1, 1, 0, '2026-01-07 17:45:02', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (42, 6, 14, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 1, 1, 0, '2026-01-07 17:45:02', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (43, 4, 12, '腾讯', 'https://www.qq.com/', NULL, 'https://mat1.gtimg.com/qqcdn/qqindex2021/favicon.ico', 2, 0, 2, '2026-01-08 09:00:31', 0, 0, 1, '2026-01-07 17:59:28', '2026-01-08 09:05:14');
INSERT INTO `website_links` VALUES (44, 4, 9, '腾讯视频', 'https://v.qq.com/', NULL, 'https://vfiles.gtimg.cn/wuji_dashboard/xy/starter/4ea79867.png', 2, 0, 1, '2026-01-07 18:12:02', 0, 0, 1, '2026-01-07 18:12:01', '2026-01-09 15:26:53');
INSERT INTO `website_links` VALUES (45, 4, 15, '国家统计局', 'https://www.stats.gov.cn', NULL, 'https://www.stats.gov.cn/favicon.ico', 0, 0, 1, '2026-01-08 09:07:45', 0, 0, 1, '2026-01-08 09:07:43', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (46, 4, 10, '中国人民银行', 'https://www.pbc.gov.cn', NULL, 'https://www.pbc.gov.cn/uiFramework/commonResource/image/logo.ico', 6, 1, 0, NULL, 0, 0, 1, '2026-01-08 09:08:46', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (47, 4, 15, '第一财经', 'https://www.yicai.com/', NULL, 'https://www.yicai.com/favicon.ico', 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:10:13', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (48, 4, 15, '36 氪', 'https://36kr.com/', NULL, 'https://36kr.com/favicon.ico', 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:10:24', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (49, 4, 10, '中国政府网', 'https://www.gov.cn/', NULL, 'https://www.gov.cn/images/trs_favicon.ico', 3, 1, 1, '2026-01-08 09:14:15', 0, 0, 1, '2026-01-08 09:14:13', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (50, 4, 10, '国家政务服务平台', 'https://gjzwfw.www.gov.cn/', NULL, 'https://gjzwfw.www.gov.cn/favicon.ico', 5, 1, 0, NULL, 0, 0, 1, '2026-01-08 09:14:50', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (51, 4, 10, '国家税务总局', 'https://www.chinatax.gov.cn/', NULL, '/icons/link-icon.svg', 4, 1, 0, NULL, 0, 0, 1, '2026-01-08 09:17:11', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (52, 4, 10, '中国政府采购网', 'https://www.ccgp.gov.cn/', NULL, 'https://www.ccgp.gov.cn/favicon.ico', 7, 1, 0, NULL, 0, 0, 1, '2026-01-08 09:17:34', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (53, 4, 10, '国家知识产权局', 'https://www.cnipa.gov.cn/', NULL, 'https://www.cnipa.gov.cn/favicon.ico', 0, 1, 1, '2026-01-12 09:58:41', 0, 0, 1, '2026-01-08 09:18:47', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (54, 4, 10, '国家统计局', 'https://www.stats.gov.cn/', NULL, 'https://www.stats.gov.cn/favicon.ico', 6, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:19:15', '2026-01-08 09:19:21');
INSERT INTO `website_links` VALUES (55, 4, 15, '商务部', 'https://www.mofcom.gov.cn/', NULL, 'https://www.mofcom.gov.cn/favicon.ico', 3, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:19:36', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (56, 4, 16, '中国人大网', 'http://www.npc.gov.cn/', NULL, '/icons/link-icon.svg', 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:21:16', '2026-01-09 15:37:07');
INSERT INTO `website_links` VALUES (57, 4, 16, '国家法律法规数据库', 'https://flk.npc.gov.cn/', NULL, 'https://flk.npc.gov.cn/favicon.ico', 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:21:38', '2026-01-09 15:37:07');
INSERT INTO `website_links` VALUES (58, 4, 16, '中国裁判文书网', 'https://wenshu.court.gov.cn/', NULL, 'https://wenshu.court.gov.cn/website/wenshu/images/favicon.ico', 3, 0, 0, NULL, 0, 0, 1, '2026-01-08 09:21:52', '2026-01-09 15:37:07');
INSERT INTO `website_links` VALUES (59, 4, 16, '国家政务服务平台', 'https://gjzwfw.www.gov.cn/fw/c100948/', NULL, 'https://gjzwfw.www.gov.cn/favicon.ico', 4, 0, 1, '2026-01-08 09:29:01', 0, 0, 1, '2026-01-08 09:22:25', '2026-01-08 09:29:11');
INSERT INTO `website_links` VALUES (60, 7, 17, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-08 17:16:37', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (61, 7, 17, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 3, '2026-01-09 11:38:41', 0, 1, 0, '2026-01-08 17:16:37', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (62, 7, 17, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 2, '2026-01-09 11:41:27', 0, 1, 0, '2026-01-08 17:16:37', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (63, 7, 17, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 1, '2026-01-09 11:54:03', 0, 1, 0, '2026-01-08 17:16:37', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (64, 7, 17, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 1, '2026-01-09 11:21:02', 0, 1, 0, '2026-01-08 17:16:37', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (65, 1, 18, '测试网站1', 'https://test1.com', '测试描述1', NULL, 1, 1, 0, NULL, 0, 0, 1, '2026-01-08 17:24:32', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (66, 1, 18, '测试网站2', 'https://test2.com', '测试描述2', NULL, 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:24:32', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (67, 1, 21, '测试3', 'https://test3.com', '描述3', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (68, 1, 22, '测试4', 'https://test4.com', '描述4', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (69, 1, 23, 'Google', 'https://www.google.com', '全球最大的搜索引擎', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:39', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (70, 1, 23, '百度', 'https://www.baidu.com', '中国最大的搜索引擎', NULL, 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (71, 1, 24, 'GitHub', 'https://github.com', '全球最大的代码托管平台', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (72, 1, 24, 'Stack Overflow', 'https://stackoverflow.com', '程序员问答社区', NULL, 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (73, 1, 24, 'MDN Web Docs', 'https://developer.mozilla.org', 'Web开发文档', NULL, 3, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (74, 1, 25, '淘宝', 'https://www.taobao.com', '中国最大的电商平台', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (75, 1, 25, '京东', 'https://www.jd.com', '中国知名电商平台', NULL, 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (76, 1, 26, '微博', 'https://weibo.com', '中国知名社交媒体', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (77, 1, 26, '知乎', 'https://www.zhihu.com', '中文问答社区', NULL, 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (78, 1, 27, 'B站', 'https://www.bilibili.com', '中国知名视频网站', NULL, 1, 0, 2, '2026-01-14 09:53:54', 0, 0, 1, '2026-01-08 17:35:40', '2026-01-14 11:30:36');
INSERT INTO `website_links` VALUES (79, 7, 28, '豆包', 'https://www.doubao.com', NULL, 'https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/favicon/76x76.png', 0, 0, 2, '2026-01-09 11:32:17', 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (80, 7, 29, '微博', 'https://weibo.com/', NULL, 'https://weibo.com/favicon.ico', 1, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (81, 7, 30, 'CCTV', 'https://tv.cctv.com/', NULL, 'https://p4.img.cctvpic.com/photoAlbum/page/performance/img/2021/9/28/1632795780652_242.jpg', 0, 0, 1, '2026-01-09 11:44:15', 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (82, 7, 30, '腾讯视频', 'https://v.qq.com/', NULL, 'https://vfiles.gtimg.cn/wuji_dashboard/xy/starter/4ea79867.png', 1, 0, 1, '2026-01-09 11:33:44', 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (83, 7, 32, '国家知识产权局', 'https://www.cnipa.gov.cn/', NULL, 'https://www.cnipa.gov.cn/favicon.ico', 1, 0, 1, '2026-01-09 11:45:08', 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (84, 7, 32, '中国政府网', 'https://www.gov.cn/', NULL, 'https://www.gov.cn/images/trs_favicon.ico', 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (85, 7, 32, '国家政务服务平台', 'https://gjzwfw.www.gov.cn/', NULL, 'https://gjzwfw.www.gov.cn/favicon.ico', 3, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (86, 7, 32, '国家税务总局', 'https://www.chinatax.gov.cn/', NULL, NULL, 4, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (87, 7, 32, '中国政府采购网', 'https://www.ccgp.gov.cn/', NULL, 'https://www.ccgp.gov.cn/favicon.ico', 5, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (88, 7, 33, '国家统计局', 'https://www.stats.gov.cn', NULL, 'https://www.stats.gov.cn/favicon.ico', 1, 0, 1, '2026-01-09 11:20:02', 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (89, 7, 33, '中国人民银行', 'https://www.pbc.gov.cn', NULL, 'https://www.pbc.gov.cn/uiFramework/commonResource/image/logo.ico', 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (90, 7, 33, '第一财经', 'https://www.yicai.com/', NULL, 'https://www.yicai.com/favicon.ico', 3, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (91, 7, 33, '36 氪', 'https://36kr.com/', NULL, 'https://36kr.com/favicon.ico', 4, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (92, 7, 33, '商务部', 'https://www.mofcom.gov.cn/', NULL, 'https://www.mofcom.gov.cn/favicon.ico', 5, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (93, 7, 34, '中国人大网', 'http://www.npc.gov.cn/', NULL, NULL, 1, 0, 1, '2026-01-09 11:25:52', 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (94, 7, 34, '国家法律法规数据库', 'https://flk.npc.gov.cn/', NULL, 'https://flk.npc.gov.cn/favicon.ico', 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (95, 7, 34, '中国裁判文书网', 'https://wenshu.court.gov.cn/', NULL, 'https://wenshu.court.gov.cn/website/wenshu/images/favicon.ico', 3, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:36:20', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (96, 7, 28, '打发法', 'https://www.33iot.com/', NULL, '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 0, 1, '2026-01-08 17:42:26', '2026-01-08 17:42:34');
INSERT INTO `website_links` VALUES (97, 7, 28, '抠图', 'https://www.remove.bg/zh', NULL, 'https://www.remove.bg/apple-touch-icon.png?v=fc0bfce6e1310f1539afec9729716721', 1, 0, 0, NULL, 0, 0, 1, '2026-01-09 11:50:36', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (98, 7, 30, '哔哩哔哩', 'https://www.bilibili.com/', NULL, 'https://static.hdslb.com/mobile/img/512.png', 2, 0, 1, '2026-01-09 12:29:07', 0, 0, 1, '2026-01-09 11:51:10', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (99, 7, 31, '腾讯元宝', 'https://yuanbao.tencent.com/chat', NULL, 'https://static.yuanbao.tencent.com/m/yuanbao-web/favicon@32.png', 1, 0, 1, '2026-01-09 11:52:05', 0, 0, 1, '2026-01-09 11:52:04', '2026-01-14 11:25:24');
INSERT INTO `website_links` VALUES (100, 4, 5, '达', 'https://yuanbao.tencent.com/chat', NULL, 'https://static.yuanbao.tencent.com/m/yuanbao-web/favicon@32.png', 5, 0, 0, NULL, 0, 0, 1, '2026-01-09 15:48:57', '2026-01-09 16:09:07');
INSERT INTO `website_links` VALUES (101, 4, 15, '中国版权保护中心', 'https://www.ccopyright.com.cn/', NULL, 'https://www.ccopyright.com.cn/images/favicon.ico', 12, 0, 2, '2026-01-12 10:05:28', 0, 0, 1, '2026-01-12 10:00:56', '2026-01-12 17:26:22');
INSERT INTO `website_links` VALUES (102, 4, 5, '会议管理系统', 'http://meeting.czgm.com', '会议预约、记录与跟踪管理系统', NULL, 14, 0, 3, '2026-01-14 11:17:45', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (103, 4, 5, '印章管理系统', 'http://seal.czgm.com', '企业印章使用申请与登记管理系统', NULL, 15, 0, 1, '2026-01-12 11:27:16', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (104, 4, 11, '合同管理系统', 'http://contract.czgm.com', '企业合同起草、审批与归档管理系统', NULL, 3, 0, 2, '2026-01-12 15:56:25', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (105, 4, 5, '固定资产管理系统', 'http://asset.czgm.com', '企业固定资产登记与管理系统', NULL, 20, 0, 1, '2026-01-12 11:27:21', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (106, 4, 5, '库存管理系统', 'http://inventory.czgm.com', '企业库存实时监控与管理系统', NULL, 29, 0, 1, '2026-01-12 11:27:24', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (107, 4, 5, '报销管理系统', 'http://expense.czgm.com', '员工费用报销申请与审批系统', NULL, 28, 0, 1, '2026-01-12 11:27:26', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (108, 4, 5, '文档管理系统', 'http://doc.czgm.com', '企业文档存储与共享管理系统', NULL, 8, 0, 1, '2026-01-12 11:27:28', 0, 0, 1, '2026-01-12 11:24:38', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (109, 4, 5, '考勤管理系统', 'http://attendance.czgm.com', '员工考勤打卡与请假管理系统', NULL, 26, 0, 1, '2026-01-12 11:27:30', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (110, 4, 5, '薪资管理系统', 'http://salary.czgm.com', '员工薪资计算与发放管理系统', NULL, 16, 0, 1, '2026-01-12 11:27:31', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (111, 4, 5, '车辆调度系统', 'http://vehicle.czgm.com', '企业车辆预约与调度管理系统', NULL, 18, 0, 1, '2026-01-12 11:27:34', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (112, 4, 5, '采购管理系统', 'http://procurement.czgm.com', '企业采购流程管理与审批系统', NULL, 1, 1, 4, '2026-01-15 09:19:08', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (113, 4, 5, '项目管理系统', 'http://pm.czgm.com', '企业项目全生命周期管理系统', NULL, 27, 0, 3, '2026-01-12 14:57:35', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (114, 4, 35, 'Elsevier ScienceDirect', 'https://www.sciencedirect.com', 'Elsevier ScienceDirect外文期刊', NULL, 0, 0, 1, '2026-01-12 11:25:37', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (115, 4, 35, 'Google Scholar', 'https://scholar.google.com', 'Google Scholar学术文献搜索引擎', NULL, 1, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (116, 4, 35, 'SpringerLink', 'https://link.springer.com', 'SpringerLink学术期刊与图书', NULL, 2, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (117, 4, 35, 'Web of Science', 'https://www.webofscience.com', 'Web of Science核心合集数据库', NULL, 5, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (118, 4, 15, '万方数据知识服务平台', 'https://www.wanfangdata.com.cn', '万方数据学术资源与知识服务', NULL, 12, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (119, 4, 15, '中国知网(CNKI)', 'https://www.cnki.net', '中国知网学术文献检索与下载平台', NULL, 15, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (120, 4, 35, '中国科学院文献情报中心', 'https://www.las.ac.cn', '中国科学院文献情报中心资源平台', NULL, 6, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (121, 4, 35, '中国科技论文在线', 'https://www.paper.edu.cn', '中国科技论文在线发表平台', NULL, 3, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (122, 4, 15, '国家哲学社会科学文献中心', 'https://www.ncpssd.org', '国家哲学社会科学文献中心学术资源', NULL, 14, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (123, 4, 15, '维普中文期刊服务平台', 'https://www.cqvip.com', '维普中文期刊数据库与文献服务', NULL, 13, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (124, 4, 5, '单位转换工具', 'https://www.unitconverters.net', '各种单位换算工具', NULL, 10, 0, 2, '2026-01-14 10:29:34', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (125, 4, 5, '图片处理工具', 'https://www.fotor.com', '图片裁剪、压缩、格式转换工具', NULL, 11, 0, 1, '2026-01-12 11:27:45', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (126, 4, 5, '在线PDF转换工具', 'https://www.ilovepdf.com', '在线PDF格式转换与编辑工具', NULL, 12, 0, 2, '2026-01-14 11:17:41', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (127, 4, 5, '在线计算器', 'https://www.calculator.net', '科学计算器与金融计算器工具', NULL, 13, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (128, 4, 5, '密码管理工具', 'https://www.lastpass.com', '密码安全存储与管理工具', NULL, 25, 0, 1, '2026-01-12 11:34:34', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (129, 4, 5, '思维导图工具', 'https://www.mindmaster.cn', '在线思维导图绘制与协作工具', NULL, 7, 0, 1, '2026-01-12 14:38:57', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-14 16:15:02');
INSERT INTO `website_links` VALUES (130, 4, 5, '文档翻译工具', 'https://www.deepl.com/translator', '多语言文档在线翻译工具', NULL, 17, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (131, 4, 5, '时间管理工具', 'https://www.trello.com', '日程安排与任务管理工具', NULL, 24, 0, 1, '2026-01-14 12:57:42', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (132, 4, 9, '中国大学MOOC', 'https://www.icourse163.org', '中国大学MOOC平台在线课程', NULL, 1, 1, 1, '2026-01-13 09:14:08', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (133, 4, 9, '中国美术馆线上展厅', 'https://www.namoc.org', '中国美术馆线上展览与藏品', NULL, 2, 1, 1, '2026-01-13 09:14:38', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (134, 4, 9, '哔哩哔哩学习区', 'https://www.bilibili.com', '哔哩哔哩平台学习类视频资源', NULL, 3, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (135, 4, 9, '国家大剧院线上平台', 'https://www.nationalcentre.org.cn', '国家大剧院线上演出与直播', NULL, 4, 1, 1, '2026-01-13 09:15:14', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (136, 4, 9, '央视影音', 'https://tv.cctv.com', '央视影音平台电视节目回放', NULL, 5, 1, 1, '2026-01-13 09:15:16', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (137, 4, 9, '学习强国视频平台', 'https://www.xuexi.cn', '学习强国平台视频学习资源', NULL, 6, 1, 1, '2026-01-13 09:15:19', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (138, 4, 9, '网易云课堂', 'https://study.163.com', '网易云课堂在线学习平台', NULL, 7, 1, 1, '2026-01-13 09:15:55', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (139, 4, 11, '腾讯课堂', 'https://ke.qq.com', '腾讯课堂职业教育与技能培训', NULL, 1, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (140, 4, 10, '不动产登记系统', 'https://www.bdc.gov.cn', '不动产登记申请与查询系统', NULL, 8, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (141, 4, 9, '信用信息公示系统', 'https://www.gsxt.gov.cn', '企业信用信息公示与查询系统', NULL, 8, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (142, 4, 10, '公共资源交易平台', 'https://www.ggzy.gov.cn', '公共资源交易信息发布与交易平台', NULL, 10, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (143, 4, 10, '公积金管理系统', 'https://www.zfgjj.gov.cn', '住房公积金查询与管理系统', NULL, 11, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (144, 4, 10, '出入境管理系统', 'https://s.nia.gov.cn', '出入境证件申请与查询系统', NULL, 9, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (145, 4, 5, '医保服务平台', 'https://www.ybj.gov.cn', '医疗保险服务与查询平台', NULL, 0, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (146, 4, 10, '国家政务服务平台', 'https://www.gjzwfw.www.gov.cn', '国家级政务服务综合平台，提供各类政务服务', NULL, 12, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (147, 4, 10, '市场监督管理局', 'https://www.samr.gov.cn', '市场监督管理相关业务办理平台', NULL, 14, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (148, 4, 10, '市政务服务中心', 'https://www.czzwfw.gov.cn', '市级政务服务中心线上平台，提供本地化服务', NULL, 15, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (149, 4, 10, '应急管理平台', 'https://www.mem.gov.cn', '应急管理与突发事件处置指挥平台', NULL, 16, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (150, 4, 10, '省政务服务网', 'https://www.hnzwfw.gov.cn', '省级政务服务网络平台，办理省内政务事项', NULL, 17, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (151, 4, 10, '社保查询系统', 'https://www.12333sb.gov.cn', '社会保障信息查询与服务系统', NULL, 1, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (152, 4, 10, '税务申报系统', 'https://etax.chinatax.gov.cn', '企业和个人税务申报与缴纳系统', NULL, 2, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (153, 4, 10, '行政审批系统', 'https://www.spj.gov.cn', '行政许可审批事项在线办理系统', NULL, 18, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (154, 4, 5, '中国日报', 'https://www.chinadaily.com.cn', '中国日报网，提供中英文新闻服务', NULL, 21, 0, 1, '2026-01-12 11:27:56', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (155, 4, 12, '人民网', 'https://www.people.com.cn', '人民日报社官方新闻网站，发布权威信息', NULL, 1, 1, 1, '2026-01-12 11:32:14', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (156, 4, 5, '光明网', 'https://www.gmw.cn', '光明日报社官方网站，聚焦文化教育', NULL, 19, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (157, 4, 12, '央视新闻', 'https://news.cctv.com', '中央广播电视总台新闻网站，提供视频新闻', NULL, 0, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (158, 4, 5, '新华网', 'https://www.xinhuanet.com', '新华社官方新闻网站，提供权威新闻资讯', NULL, 22, 0, 2, '2026-01-14 11:17:43', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (159, 4, 11, '环球网', 'https://www.huanqiu.com', '环球网，提供国际国内综合新闻', NULL, 0, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (160, 4, 11, '科技日报', 'https://www.stdaily.com', '科技日报社官方网站，报道科技领域动态', NULL, 2, 1, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (161, 4, 11, '经济日报', 'https://www.economicdaily.com.cn', '经济日报社官方网站，专注经济领域新闻', NULL, 4, 1, 1, '2026-01-14 16:14:29', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (162, 4, 15, '债券信息平台', 'https://www.chinabond.com.cn', '债券发行信息与交易数据查询平台', NULL, 4, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (163, 4, 10, '国家统计局数据平台', 'https://data.stats.gov.cn', '国家统计局官方数据发布与查询平台', NULL, 13, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (164, 4, 15, '基金净值查询系统', 'https://www.chinaamc.com', '公募基金净值实时查询与业绩分析', NULL, 5, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (165, 4, 15, '外汇汇率查询', 'https://www.boc.cn/sourcedb/whpj/', '全球主要货币汇率实时查询与走势', NULL, 6, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (166, 4, 15, '期货交易行情', 'https://www.shfe.com.cn', '期货市场实时交易行情与分析系统', NULL, 7, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (167, 4, 15, '股票市场行情系统', 'https://www.sse.com.cn', '股票市场实时行情与历史数据查询', NULL, 8, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (168, 4, 15, '行业经济数据分析平台', 'https://www.ceicdata.com', '各行业经济运行数据统计与分析平台', NULL, 9, 0, 0, NULL, 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (169, 4, 15, '财政部国库数据', 'https://www.mof.gov.cn', '财政部国库收支数据与财政政策信息', NULL, 10, 0, 1, '2026-01-12 11:25:30', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (170, 4, 15, '黄金价格行情', 'https://www.gold.org', '国际国内黄金价格实时行情与分析', NULL, 11, 0, 1, '2026-01-12 11:25:21', 0, 0, 1, '2026-01-12 11:24:39', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (171, 4, 5, '中国版权保护中心', 'https://www.ccopyright.com.cn/', NULL, 'https://www.ccopyright.com.cn/images/favicon.ico', 30, 0, 0, NULL, 0, 0, 1, '2026-01-12 17:26:06', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (172, 7, 36, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:24', '2026-01-14 11:25:25');
INSERT INTO `website_links` VALUES (173, 7, 36, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:24', '2026-01-14 11:25:25');
INSERT INTO `website_links` VALUES (174, 7, 36, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:24', '2026-01-14 11:25:25');
INSERT INTO `website_links` VALUES (175, 7, 36, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:24', '2026-01-14 11:25:25');
INSERT INTO `website_links` VALUES (176, 7, 36, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:24', '2026-01-14 11:25:25');
INSERT INTO `website_links` VALUES (177, 7, 37, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:25', '2026-01-14 11:25:26');
INSERT INTO `website_links` VALUES (178, 7, 37, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:25', '2026-01-14 11:25:26');
INSERT INTO `website_links` VALUES (179, 7, 37, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:25', '2026-01-14 11:25:26');
INSERT INTO `website_links` VALUES (180, 7, 37, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:25', '2026-01-14 11:25:26');
INSERT INTO `website_links` VALUES (181, 7, 37, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:25', '2026-01-14 11:25:26');
INSERT INTO `website_links` VALUES (182, 7, 38, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:26', '2026-01-14 11:25:27');
INSERT INTO `website_links` VALUES (183, 7, 38, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:26', '2026-01-14 11:25:27');
INSERT INTO `website_links` VALUES (184, 7, 38, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:26', '2026-01-14 11:25:27');
INSERT INTO `website_links` VALUES (185, 7, 38, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:26', '2026-01-14 11:25:27');
INSERT INTO `website_links` VALUES (186, 7, 38, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:26', '2026-01-14 11:25:27');
INSERT INTO `website_links` VALUES (187, 7, 39, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:27', '2026-01-14 11:25:41');
INSERT INTO `website_links` VALUES (188, 7, 39, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:27', '2026-01-14 11:25:41');
INSERT INTO `website_links` VALUES (189, 7, 39, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:27', '2026-01-14 11:25:41');
INSERT INTO `website_links` VALUES (190, 7, 39, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:27', '2026-01-14 11:25:41');
INSERT INTO `website_links` VALUES (191, 7, 39, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:27', '2026-01-14 11:25:41');
INSERT INTO `website_links` VALUES (192, 7, 40, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:41', '2026-01-14 11:25:43');
INSERT INTO `website_links` VALUES (193, 7, 40, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:41', '2026-01-14 11:25:43');
INSERT INTO `website_links` VALUES (194, 7, 40, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:41', '2026-01-14 11:25:43');
INSERT INTO `website_links` VALUES (195, 7, 40, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:41', '2026-01-14 11:25:43');
INSERT INTO `website_links` VALUES (196, 7, 40, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:25:41', '2026-01-14 11:25:43');
INSERT INTO `website_links` VALUES (197, 7, 41, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:25:43', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (198, 7, 41, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:25:43', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (199, 7, 41, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:25:43', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (200, 7, 41, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:25:43', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (201, 7, 41, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:25:43', '2026-01-16 10:10:44');
INSERT INTO `website_links` VALUES (202, 1, 42, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:30:36', '2026-01-14 11:30:52');
INSERT INTO `website_links` VALUES (203, 1, 42, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:30:36', '2026-01-14 11:30:52');
INSERT INTO `website_links` VALUES (204, 1, 42, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 2, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:30:36', '2026-01-14 11:30:52');
INSERT INTO `website_links` VALUES (205, 1, 42, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:30:36', '2026-01-14 11:30:52');
INSERT INTO `website_links` VALUES (206, 1, 42, 'CRM系统', 'http://192.168.21.197', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 0, 1, 0, '2026-01-14 11:30:36', '2026-01-14 11:30:52');
INSERT INTO `website_links` VALUES (207, 1, 43, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 1, 1, '2026-01-14 12:45:25', 1, 1, 0, '2026-01-14 11:30:52', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (208, 1, 43, '协同办公系统', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:30:52', '2026-01-15 08:31:50');
INSERT INTO `website_links` VALUES (209, 1, 43, '人力资源系统', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 1, 0, NULL, 1, 1, 0, '2026-01-14 11:30:52', '2026-01-15 08:31:43');
INSERT INTO `website_links` VALUES (210, 1, 43, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:30:52', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (211, 1, 43, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 1, 1, 0, '2026-01-14 11:30:52', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (212, 4, 35, '中国版权保护中心', 'https://www.ccopyright.com.cn/', NULL, 'https://www.ccopyright.com.cn/images/favicon.ico', 4, 0, 0, NULL, 0, 0, 1, '2026-01-14 18:06:01', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (213, 4, 11, '中国版权保护中心', 'https://www.ccopyright.com.cn/', NULL, 'https://www.ccopyright.com.cn/images/favicon.ico', 5, 0, 1, '2026-01-14 18:15:42', 0, 0, 1, '2026-01-14 18:15:41', '2026-01-15 11:33:40');
INSERT INTO `website_links` VALUES (214, 1, 43, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-15 08:53:06', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (215, 1, 43, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 1, 1, 0, '2026-01-15 08:53:06', '2026-01-16 10:10:45');
INSERT INTO `website_links` VALUES (216, 4, 44, '公司网站', 'https://www.hnntgroup.cn/qywh', '公司官方网站', 'https://hnntgroup.cn/favicon.ico', 0, 0, 1, '2026-01-15 15:37:43', 1, 1, 0, '2026-01-15 11:33:40', '2026-01-16 10:14:08');
INSERT INTO `website_links` VALUES (217, 4, 44, '协同办公系统(OA)', 'http://oa.czgm.com', '办公自动化系统', 'http://oa.czgm.com/seeyon/common/images/A6/favicon.ico', 1, 0, 0, NULL, 1, 1, 0, '2026-01-15 11:33:40', '2026-01-16 10:14:08');
INSERT INTO `website_links` VALUES (218, 4, 44, '人力资源系统(EHR)', 'http://ehr.czgm.com', '人力资源管理系统', '/icons/website-icon.svg', 1, 0, 0, NULL, 1, 1, 0, '2026-01-15 11:33:40', '2026-01-16 10:14:08');
INSERT INTO `website_links` VALUES (219, 4, 44, '电子邮件系统', 'http://mail.czgm.com', '企业邮箱系统', 'http://mail.czgm.com/favicon.ico', 3, 0, 0, NULL, 1, 1, 0, '2026-01-15 11:33:40', '2026-01-16 10:14:08');
INSERT INTO `website_links` VALUES (220, 4, 44, 'CRM系统', 'http://192.168.21.196', '客户关系管理系统', '/icons/link-icon.svg', 4, 0, 0, NULL, 1, 1, 0, '2026-01-15 11:33:40', '2026-01-16 10:14:08');
INSERT INTO `website_links` VALUES (221, 4, 44, 'CRM系统', 'http://192.168.21.198', '客户关系管理系统', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (222, 4, 44, '会议管理系统', 'http://meeting.czgm.com', '会议预约、记录与跟踪管理系统', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (223, 4, 44, '印章管理系统', 'http://seal.czgm.com', '企业印章使用申请与登记管理系统', NULL, 7, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (224, 4, 44, '合同管理系统', 'http://contract.czgm.com', '企业合同起草、审批与归档管理系统', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (225, 4, 44, '固定资产管理系统', 'http://asset.czgm.com', '企业固定资产登记与管理系统', NULL, 9, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (226, 4, 44, '库存管理系统', 'http://inventory.czgm.com', '企业库存实时监控与管理系统', NULL, 10, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (227, 4, 44, '报销管理系统', 'http://expense.czgm.com', '员工费用报销申请与审批系统', NULL, 11, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (228, 4, 44, '文档管理系统', 'http://doc.czgm.com', '企业文档存储与共享管理系统', NULL, 12, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (229, 4, 44, '考勤管理系统', 'http://attendance.czgm.com', '员工考勤打卡与请假管理系统', NULL, 13, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (230, 4, 44, '薪资管理系统', 'http://salary.czgm.com', '员工薪资计算与发放管理系统', NULL, 14, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (231, 4, 44, '车辆调度系统', 'http://vehicle.czgm.com', '企业车辆预约与调度管理系统', NULL, 15, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (232, 4, 44, '采购管理系统', 'http://procurement.czgm.com', '企业采购流程管理与审批系统', NULL, 16, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (233, 4, 44, '项目管理系统', 'http://pm.czgm.com', '企业项目全生命周期管理系统', NULL, 17, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (234, 4, 45, 'Elsevier ScienceDirect', 'https://www.sciencedirect.com', 'Elsevier ScienceDirect外文期刊', NULL, 1, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (235, 4, 45, 'Google Scholar', 'https://scholar.google.com', 'Google Scholar学术文献搜索引擎', NULL, 2, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:02', '2026-01-15 11:52:02');
INSERT INTO `website_links` VALUES (236, 4, 45, 'SpringerLink', 'https://link.springer.com', 'SpringerLink学术期刊与图书', NULL, 3, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (237, 4, 45, 'Web of Science', 'https://www.webofscience.com', 'Web of Science核心合集数据库', NULL, 4, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (238, 4, 45, '万方数据知识服务平台', 'https://www.wanfangdata.com.cn', '万方数据学术资源与知识服务', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (239, 4, 45, '中国版权保护中心', 'https://www.ccopyright.com.cn/', '中国版权保护中心，提供学术文献检索和研究资源', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (240, 4, 45, '中国知网(CNKI)', 'https://www.cnki.net', '中国知网学术文献检索与下载平台', NULL, 7, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (241, 4, 45, '中国科学院文献情报中心', 'https://www.las.ac.cn', '中国科学院文献情报中心资源平台', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (242, 4, 45, '中国科技论文在线', 'https://www.paper.edu.cn', '中国科技论文在线发表平台', NULL, 9, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (243, 4, 45, '国家哲学社会科学文献中心', 'https://www.ncpssd.org', '国家哲学社会科学文献中心学术资源', NULL, 10, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (244, 4, 45, '维普中文期刊服务平台', 'https://www.cqvip.com', '维普中文期刊数据库与文献服务', NULL, 11, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (245, 4, 46, '单位转换工具', 'https://www.unitconverters.net', '各种单位换算工具', NULL, 1, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (246, 4, 46, '图片处理工具', 'https://www.fotor.com', '图片裁剪、压缩、格式转换工具', NULL, 2, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (247, 4, 46, '在线PDF转换工具', 'https://www.ilovepdf.com', '在线PDF格式转换与编辑工具', NULL, 3, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (248, 4, 46, '在线计算器', 'https://www.calculator.net', '科学计算器与金融计算器工具', NULL, 4, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (249, 4, 46, '密码管理工具', 'https://www.lastpass.com', '密码安全存储与管理工具', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (250, 4, 46, '思维导图工具', 'https://www.mindmaster.cn', '在线思维导图绘制与协作工具', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (251, 4, 46, '文档翻译工具', 'https://www.deepl.com/translator', '多语言文档在线翻译工具', NULL, 7, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (252, 4, 46, '时间管理工具', 'https://www.trello.com', '日程安排与任务管理工具', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (253, 4, 46, '豆包', 'https://www.doubao.com', 'AI助手', NULL, 9, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (254, 4, 47, 'CCTV', 'https://tv.cctv.com/', '中央电视台官方视频平台，提供电视节目直播与回放', NULL, 0, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (255, 4, 47, '中国大学MOOC', 'https://www.icourse163.org', '中国大学MOOC平台在线课程', NULL, 1, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (256, 4, 47, '中国美术馆线上展厅', 'https://www.namoc.org', '中国美术馆线上展览与藏品', NULL, 2, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (257, 4, 47, '哔哩哔哩学习区', 'https://www.bilibili.com', '哔哩哔哩平台学习类视频资源', NULL, 3, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (258, 4, 47, '国家大剧院线上平台', 'https://www.nationalcentre.org.cn', '国家大剧院线上演出与直播', NULL, 4, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (259, 4, 47, '央视影音', 'https://tv.cctv.com', '央视影音平台电视节目回放', NULL, 7, 0, 1, '2026-01-15 15:26:11', 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (260, 4, 47, '学习强国视频平台', 'https://www.xuexi.cn', '学习强国平台视频学习资源', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (261, 4, 47, '网易云课堂', 'https://study.163.com', '网易云课堂在线学习平台', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (262, 4, 47, '腾讯课堂', 'https://ke.qq.com', '腾讯课堂职业教育与技能培训', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 16:32:27');
INSERT INTO `website_links` VALUES (263, 4, 48, '不动产登记系统', 'https://www.bdc.gov.cn', '不动产登记申请与查询系统', NULL, 1, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (264, 4, 48, '中国人民银行', 'https://www.pbc.gov.cn', '中国人民银行官方网站，提供相关政务服务和信息查询', NULL, 2, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (265, 4, 48, '中国政府网', 'https://www.gov.cn/', '中国政府官方门户网站，发布政府信息和政策', NULL, 3, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (266, 4, 48, '中国政府采购网', 'https://www.ccgp.gov.cn/', '中国政府采购网官方网站，提供相关政务服务和信息查询', NULL, 4, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (267, 4, 48, '信用信息公示系统', 'https://www.gsxt.gov.cn', '企业信用信息公示与查询系统', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (268, 4, 48, '公共资源交易平台', 'https://www.ggzy.gov.cn', '公共资源交易信息发布与交易平台', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (269, 4, 48, '公积金管理系统', 'https://www.zfgjj.gov.cn', '住房公积金查询与管理系统', NULL, 7, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (270, 4, 48, '出入境管理系统', 'https://s.nia.gov.cn', '出入境证件申请与查询系统', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (271, 4, 48, '医保服务平台', 'https://www.ybj.gov.cn', '医疗保险服务与查询平台', NULL, 9, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (272, 4, 48, '国家政务服务平台', 'https://gjzwfw.www.gov.cn/', '国家政务服务平台官方网站，提供相关政务服务和信息查询', NULL, 10, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (273, 4, 48, '国家政务服务平台', 'https://www.gjzwfw.www.gov.cn', '国家级政务服务综合平台，提供各类政务服务', NULL, 11, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (274, 4, 48, '国家知识产权局', 'https://www.cnipa.gov.cn/', '国家知识产权局官方网站，提供专利、商标等知识产权服务', NULL, 12, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (275, 4, 48, '国家税务总局', 'https://www.chinatax.gov.cn/', '国家税务总局官方网站，提供相关政务服务和信息查询', NULL, 13, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (276, 4, 48, '市场监督管理局', 'https://www.samr.gov.cn', '市场监督管理相关业务办理平台', NULL, 14, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (277, 4, 48, '市政务服务中心', 'https://www.czzwfw.gov.cn', '市级政务服务中心线上平台，提供本地化服务', NULL, 15, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (278, 4, 48, '应急管理平台', 'https://www.mem.gov.cn', '应急管理与突发事件处置指挥平台', NULL, 16, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (279, 4, 48, '省政务服务网', 'https://www.hnzwfw.gov.cn', '省级政务服务网络平台，办理省内政务事项', NULL, 17, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (280, 4, 48, '社保查询系统', 'https://www.12333sb.gov.cn', '社会保障信息查询与服务系统', NULL, 18, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (281, 4, 48, '税务申报系统', 'https://etax.chinatax.gov.cn', '企业和个人税务申报与缴纳系统', NULL, 19, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (282, 4, 48, '行政审批系统', 'https://www.spj.gov.cn', '行政许可审批事项在线办理系统', NULL, 20, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (283, 4, 49, '中国日报', 'https://www.chinadaily.com.cn', '中国日报网，提供中英文新闻服务', NULL, 1, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (284, 4, 49, '人民网', 'https://www.people.com.cn', '人民日报社官方新闻网站，发布权威信息', NULL, 2, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (285, 4, 49, '光明网', 'https://www.gmw.cn', '光明日报社官方网站，聚焦文化教育', NULL, 3, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (286, 4, 49, '央视新闻', 'https://news.cctv.com', '中央广播电视总台新闻网站，提供视频新闻', NULL, 4, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (287, 4, 49, '微博', 'https://weibo.com/', '看世界', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (288, 4, 49, '新华网', 'https://www.xinhuanet.com', '新华社官方新闻网站，提供权威新闻资讯', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (289, 4, 49, '环球网', 'https://www.huanqiu.com', '环球网，提供国际国内综合新闻', NULL, 7, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (290, 4, 49, '科技日报', 'https://www.stdaily.com', '科技日报社官方网站，报道科技领域动态', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (291, 4, 49, '经济日报', 'https://www.economicdaily.com.cn', '经济日报社官方网站，专注经济领域新闻', NULL, 9, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (292, 4, 50, '36 氪', 'https://36kr.com/', '36 氪，提供财经新闻、数据和市场分析', NULL, 1, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (293, 4, 50, '债券信息平台', 'https://www.chinabond.com.cn', '债券发行信息与交易数据查询平台', NULL, 2, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (294, 4, 50, '商务部', 'https://www.mofcom.gov.cn/', '商务部，提供财经新闻、数据和市场分析', NULL, 3, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (295, 4, 50, '国家统计局', 'https://www.stats.gov.cn', '国家统计局，提供财经新闻、数据和市场分析', NULL, 4, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (296, 4, 50, '国家统计局数据平台', 'https://data.stats.gov.cn', '国家统计局官方数据发布与查询平台', NULL, 5, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (297, 4, 50, '基金净值查询系统', 'https://www.chinaamc.com', '公募基金净值实时查询与业绩分析', NULL, 6, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (298, 4, 50, '外汇汇率查询', 'https://www.boc.cn/sourcedb/whpj/', '全球主要货币汇率实时查询与走势', NULL, 7, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (299, 4, 50, '期货交易行情', 'https://www.shfe.com.cn', '期货市场实时交易行情与分析系统', NULL, 8, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (300, 4, 50, '第一财经', 'https://www.yicai.com/', '第一财经，提供财经新闻、数据和市场分析', NULL, 9, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (301, 4, 50, '股票市场行情系统', 'https://www.sse.com.cn', '股票市场实时行情与历史数据查询', NULL, 10, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (302, 4, 50, '行业经济数据分析平台', 'https://www.ceicdata.com', '各行业经济运行数据统计与分析平台', NULL, 11, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (303, 4, 50, '财政部国库数据', 'https://www.mof.gov.cn', '财政部国库收支数据与财政政策信息', NULL, 12, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');
INSERT INTO `website_links` VALUES (304, 4, 50, '黄金价格行情', 'https://www.gold.org', '国际国内黄金价格实时行情与分析', NULL, 13, 0, 0, NULL, 1, 0, 1, '2026-01-15 11:52:03', '2026-01-15 11:52:03');

SET FOREIGN_KEY_CHECKS = 1;
