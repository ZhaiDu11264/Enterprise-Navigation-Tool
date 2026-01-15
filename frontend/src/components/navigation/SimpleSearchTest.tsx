import React, { useState, useEffect } from 'react';

const SEARCH_ENGINES = [
  { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: '百' },
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'G' },
  { name: '搜狗', url: 'https://www.sogou.com/web?query=', icon: '搜' },
];

export function SimpleSearchTest() {
  const [query, setQuery] = useState('');
  const [currentEngine, setCurrentEngine] = useState(SEARCH_ENGINES[0]);
  const [showEngines, setShowEngines] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载搜索记录
  useEffect(() => {
    const saved = localStorage.getItem('testSearchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load search history:', e);
      }
    }
  }, []);

  // 保存搜索记录
  const saveHistory = (newHistory: string[]) => {
    localStorage.setItem('testSearchHistory', JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  // 执行搜索
  const handleSearch = () => {
    if (!query.trim()) return;
    
    // 添加到历史记录
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    saveHistory(newHistory);
    
    // 打开搜索
    const searchUrl = currentEngine.url + encodeURIComponent(query);
    window.open(searchUrl, '_blank');
    
    console.log('搜索:', query, '使用引擎:', currentEngine.name);
  };

  // 切换搜索引擎
  const handleEngineChange = (engine: typeof SEARCH_ENGINES[0]) => {
    setCurrentEngine(engine);
    setShowEngines(false);
    console.log('切换搜索引擎到:', engine.name);
  };

  // 选择历史记录
  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
    console.log('选择历史记录:', historyItem);
  };

  // 清除历史记录
  const clearHistory = () => {
    localStorage.removeItem('testSearchHistory');
    setSearchHistory([]);
    console.log('清除搜索记录');
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      border: '2px solid #007bff',
      borderRadius: '12px',
      background: 'white'
    }}>
      <h3 style={{ textAlign: 'center', color: '#333' }}>🔍 搜索功能测试</h3>
      
      {/* 搜索栏 */}
      <div style={{ 
        display: 'flex', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '10px'
      }}>
        {/* 搜索引擎选择器 */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowEngines(!showEngines)}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: '#f8f9fa',
              cursor: 'pointer',
              borderRight: '1px solid #ddd'
            }}
          >
            {currentEngine.icon} ▼
          </button>
          
          {showEngines && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              zIndex: 1000,
              minWidth: '120px'
            }}>
              {SEARCH_ENGINES.map(engine => (
                <button
                  key={engine.name}
                  onClick={() => handleEngineChange(engine)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: engine.name === currentEngine.name ? '#e3f2fd' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {engine.icon} {engine.name}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* 搜索输入框 */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowHistory(searchHistory.length > 0 && !query)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder={`使用${currentEngine.name}搜索...`}
          style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            outline: 'none'
          }}
        />
        
        {/* 搜索按钮 */}
        <button
          onClick={handleSearch}
          style={{
            padding: '10px 15px',
            border: 'none',
            background: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          搜索
        </button>
      </div>
      
      {/* 搜索历史 */}
      {showHistory && searchHistory.length > 0 && (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: 'white',
          marginBottom: '10px'
        }}>
          <div style={{
            padding: '8px 12px',
            background: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>搜索记录</span>
            <button
              onClick={clearHistory}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              清除
            </button>
          </div>
          {searchHistory.map((item, index) => (
            <div
              key={index}
              onClick={() => handleHistoryClick(item)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: index < searchHistory.length - 1 ? '1px solid #eee' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              🕒 {item}
            </div>
          ))}
        </div>
      )}
      
      {/* 状态显示 */}
      <div style={{ fontSize: '14px', color: '#666' }}>
        <div>当前搜索引擎: <strong>{currentEngine.name}</strong></div>
        <div>搜索记录数量: <strong>{searchHistory.length}</strong></div>
        <div>localStorage可用: <strong>{typeof Storage !== "undefined" ? '是' : '否'}</strong></div>
      </div>
      
      {/* 测试按钮 */}
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            setQuery('测试搜索');
            console.log('设置测试查询');
          }}
          style={{
            padding: '5px 10px',
            border: '1px solid #007bff',
            background: 'white',
            color: '#007bff',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          设置测试查询
        </button>
        
        <button
          onClick={() => {
            console.log('当前状态:', {
              query,
              currentEngine: currentEngine.name,
              searchHistory,
              showEngines,
              showHistory
            });
          }}
          style={{
            padding: '5px 10px',
            border: '1px solid #28a745',
            background: 'white',
            color: '#28a745',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          打印状态
        </button>
        
        <button
          onClick={() => {
            const testHistory = ['测试1', '测试2', '测试3'];
            saveHistory(testHistory);
            console.log('添加测试历史记录');
          }}
          style={{
            padding: '5px 10px',
            border: '1px solid #ffc107',
            background: 'white',
            color: '#ffc107',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          添加测试记录
        </button>
      </div>
    </div>
  );
}