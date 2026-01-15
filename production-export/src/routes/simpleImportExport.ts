import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { authenticateToken } from '../middleware/auth';
import { LinkService } from '../models/WebsiteLink';
import { GroupService } from '../models/Group';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// 简单导入 - 只支持CSV
router.post('/import/simple', authenticateToken, upload.single('file'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '请选择文件' });
      return;
    }

    const userId = req.user!.userId;
    const results: any[] = [];
    const errors: string[] = [];
    let imported = 0;

    // 解析CSV
    const stream = Readable.from(req.file.buffer);
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv({
          mapHeaders: ({ header }: { header: string }) => {
            // 移除BOM字符，转换为小写，并映射字段名
            const cleanHeader = header.replace(/^\ufeff/, '').trim().toLowerCase();
            // 处理常见的字段名变体
            const fieldMap: { [key: string]: string } = {
              'name': 'name',
              'title': 'name',
              'url': 'url',
              'link': 'url',
              'description': 'description',
              'desc': 'description',
              'group': 'group',
              'category': 'group',
              'icon url': 'iconUrl',
              'icon': 'iconUrl',
              'favicon': 'iconUrl'
            };
            return fieldMap[cleanHeader] || cleanHeader;
          }
        }))
        .on('data', (data) => {
          // 清理数据中的空格
          const cleanData: any = {};
          for (const [key, value] of Object.entries(data)) {
            cleanData[key] = typeof value === 'string' ? (value as string).trim() : value;
          }
          results.push(cleanData);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // 获取或创建分组
    const groupMap = new Map<string, number>();
    
    for (const row of results) {
      try {
        const { name, url, description, group } = row;
        
        console.log('🔍 处理行数据:', { name, url, description, group }); // 调试日志
        
        if (!name || !url) {
          errors.push(`缺少必要字段: name="${name || 'empty'}", url="${url || 'empty'}"`);
          continue;
        }

        // 验证URL格式
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          errors.push(`无效的URL格式: ${url}`);
          continue;
        }

        // 获取或创建分组
        let groupId: number;
        if (groupMap.has(group)) {
          groupId = groupMap.get(group)!;
        } else {
          let existingGroup = await GroupService.getGroupByName(userId, group);
          
          if (!existingGroup) {
            existingGroup = await GroupService.createGroup(userId, {
              name: group,
              description: `自动创建的分组`
            });
          }
          
          groupId = existingGroup.id;
          groupMap.set(group, groupId);
        }

        // 检查是否已存在 - 简单检查，不需要专门的方法
        const existingLinks = await LinkService.getUserLinks(userId);
        const existing = existingLinks.find(link => link.url === url);

        if (existing) {
          errors.push(`链接已存在: ${url}`);
          continue;
        }

        // 创建链接
        await LinkService.createLink(userId, {
          name,
          url,
          description: description || '',
          groupId
        });

        imported++;
      } catch (error: any) {
        errors.push(`处理行失败: ${error.message || error}`);
      }
    }

    res.json({
      success: true,
      imported,
      errors,
      total: results.length
    });

  } catch (error) {
    console.error('Simple import error:', error);
    res.status(500).json({ error: '导入失败' });
  }
});

// 简单导出 - 只导出CSV
router.get('/export/simple', authenticateToken, async (req, res): Promise<void> => {
  try {
    console.log('🔍 Export request received');
    console.log('User:', req.user);
    
    const userId = req.user!.userId;
    console.log('📤 Exporting data for user:', userId);
    
    const links = await LinkService.getLinksWithGroups(userId);
    console.log('📊 Found links:', links.length);

    // 生成CSV内容
    const csvHeader = 'name,url,description,group\n';
    const csvRows = links.map((link: any) => {
      const name = `"${link.name.replace(/"/g, '""')}"`;
      const url = `"${link.url.replace(/"/g, '""')}"`;
      const description = `"${(link.description || '').replace(/"/g, '""')}"`;
      const group = `"${(link.groupName || '默认分组').replace(/"/g, '""')}"`;
      return `${name},${url},${description},${group}`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    console.log('📄 CSV content length:', csvContent.length);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="navigation-export-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('\ufeff' + csvContent); // BOM for Excel compatibility
    
    console.log('✅ Export completed successfully');

  } catch (error: any) {
    console.error('❌ Simple export error:', error);
    res.status(500).json({ error: '导出失败', details: error.message });
  }
});

export default router;