# 状态管理 (State Management)

这个目录包含了应用的所有Zustand状态管理store。

## 文件结构

- `searchStore.ts` - 搜索相关的状态管理
- `uiStore.ts` - UI界面相关的状态管理
- `index.ts` - 统一导出所有stores和工具函数
- `__tests__/` - 测试文件

## 使用方法

### 基本用法

```typescript
import { useSearchStore, useUIStore } from './stores';

function MyComponent() {
  // 使用搜索store
  const { location1, setLocation1, loading } = useSearchStore();
  
  // 使用UI store
  const { isDarkMode, toggleDarkMode } = useUIStore();
  
  return (
    <div>
      <button onClick={() => setLocation1(someLocation)}>
        Set Location 1
      </button>
      <button onClick={toggleDarkMode}>
        Toggle Dark Mode
      </button>
    </div>
  );
}
```

### 使用选择器

```typescript
import { useSearchSelectors, useUISelectors } from './stores';

function SearchButton() {
  const { canStartSearch } = useSearchSelectors();
  const { hasAnyLoading } = useUISelectors();
  
  return (
    <button 
      disabled={!canStartSearch || hasAnyLoading}
      onClick={handleSearch}
    >
      {hasAnyLoading ? 'Searching...' : 'Search'}
    </button>
  );
}
```

### 组合Hook

```typescript
import { useAppState } from './stores';

function App() {
  const { 
    search, 
    ui, 
    searchSelectors, 
    uiSelectors,
    isAppLoading,
    canStartSearch 
  } = useAppState();
  
  // 使用组合的状态和选择器
}
```

## 状态持久化

搜索store支持部分状态的持久化存储：
- 搜索历史 (`searchHistory`)
- 选中的店铺类型 (`selectedVenueTypes`)

这些数据会自动保存到localStorage中，应用重启后会自动恢复。

## 开发工具

在开发环境下，可以通过浏览器控制台访问调试工具：

```javascript
// 获取当前状态快照
window.storeDevTools.getStateSnapshot()

// 重置所有状态
window.storeDevTools.resetAll()

// 模拟错误状态
window.storeDevTools.simulateError('Test error message')

// 模拟加载状态
window.storeDevTools.simulateLoading(3000) // 3秒
```

## 最佳实践

1. **使用选择器**: 优先使用提供的选择器函数而不是直接访问状态
2. **组合Hook**: 对于需要多个store状态的组件，使用`useAppState`
3. **错误处理**: 使用UI store的通知系统来显示错误信息
4. **加载状态**: 使用细分的加载状态来提供更好的用户体验
5. **状态重置**: 在适当的时候使用重置功能来清理状态

## 类型安全

所有的store都有完整的TypeScript类型定义，确保类型安全：

```typescript
// 所有状态和actions都有类型提示
const { location1, setLocation1 } = useSearchStore();
//      ^Location | null  ^(location: Location | null) => void
```