# React 性能优化指南 - 新手版

> 本指南基于实际项目中的优化经验，适合 React 初学者

## 目录

1. [为什么需要优化](#为什么需要优化)
2. [优化技巧](#优化技巧)
3. [实战案例](#实战案例)
4. [常见误区](#常见误区)

---

## 为什么需要优化

React 默认行为：**当父组件重新渲染时，所有子组件也会重新渲染**

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveChild /> {/* count 变化时，这个组件也会重新渲染！ */}
    </div>
  );
}
```

即使 `ExpensiveChild` 不依赖 `count`，它仍然会重新渲染，这会造成性能浪费。

---

## 优化技巧

### 1. React.memo - 避免不必要的组件重渲染

**作用：** 只有当 props 发生变化时，组件才会重新渲染

#### ❌ 优化前

```tsx
export function UserCard({ name, email }: Props) {
  console.log('UserCard 渲染了！');
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}
```

**问题：** 父组件每次渲染，这个组件都会重新渲染

#### ✅ 优化后

```tsx
import { memo } from 'react';

const UserCardComponent = ({ name, email }: Props) => {
  console.log('UserCard 渲染了！');
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

export const UserCard = memo(UserCardComponent);
```

**效果：** 只有当 `name` 或 `email` 变化时才会重新渲染

---

### 2. useMemo - 缓存计算结果

**作用：** 避免每次渲染都重新计算昂贵的值

#### ❌ 优化前

```tsx
function ProductList({ products }: Props) {
  // 每次渲染都会重新过滤和排序！
  const expensiveProducts = products
    .filter(p => p.price > 100)
    .sort((a, b) => b.price - a.price);

  return (
    <ul>
      {expensiveProducts.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

**问题：** 即使 `products` 没变，每次渲染都会重新计算

#### ✅ 优化后

```tsx
import { useMemo } from 'react';

function ProductList({ products }: Props) {
  // 只有当 products 变化时才重新计算
  const expensiveProducts = useMemo(() => {
    return products
      .filter(p => p.price > 100)
      .sort((a, b) => b.price - a.price);
  }, [products]); // 依赖数组

  return (
    <ul>
      {expensiveProducts.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

**何时使用：**
- ✅ 复杂的数组操作（filter, map, sort 组合）
- ✅ 昂贵的计算（循环、递归）
- ✅ 需要在多个地方使用的派生数据
- ❌ 简单的值（如 `const double = value * 2`）

---

### 3. useCallback - 缓存函数引用

**作用：** 保持函数引用稳定，避免子组件不必要的重渲染

#### ❌ 优化前

```tsx
function TodoList() {
  const [todos, setTodos] = useState([]);

  // 每次渲染都创建新函数！
  const handleDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDelete} // 新的函数引用导致 TodoItem 重渲染
        />
      ))}
    </ul>
  );
}
```

**问题：** 即使 `TodoItem` 用了 `memo`，也会因为 `onDelete` 是新的函数而重渲染

#### ✅ 优化后

```tsx
import { useCallback } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);

  // 函数引用保持稳定
  const handleDelete = useCallback((id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }, []); // 空数组表示函数永远不变

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={handleDelete} // 相同的函数引用
        />
      ))}
    </ul>
  );
}
```

**重要提示：** 使用 `setTodos(prev => ...)` 而不是直接使用 `todos`，这样依赖数组可以为空

---

### 4. 组合使用 - 最佳实践

完整的优化示例：

```tsx
import { memo, useMemo, useCallback, useState } from 'react';

// 1. 子组件用 memo 包裹
const UserItemComponent = ({ user, onDelete }: Props) => {
  return (
    <div>
      <span>{user.name}</span>
      <button onClick={() => onDelete(user.id)}>删除</button>
    </div>
  );
};

const UserItem = memo(UserItemComponent);

// 2. 父组件优化
function UserList({ users }: Props) {
  const [filter, setFilter] = useState('');

  // 3. 用 useMemo 缓存计算结果
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  // 4. 用 useCallback 缓存函数
  const handleDelete = useCallback((id: string) => {
    // 调用 API 删除用户
    deleteUser(id);
  }, []);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filteredUsers.map(user => (
        <UserItem
          key={user.id}
          user={user}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

---

## 实战案例

### 案例：ModelSelector 组件优化

这是我们项目中的实际优化：

#### 问题分析

```tsx
// 优化前的问题：
function ModelSelector({ providers, value, onChange }) {
  // ❌ 问题 1: 每次渲染都查找 provider
  const getProvider = () => {
    return providers.find(p => p.id === value?.providerId);
  };

  // ❌ 问题 2: 每次渲染都创建新函数
  const onSelectModel = (provider, model) => {
    onChange({...});
  };

  return (
    <div>
      {/* ❌ 问题 3: 每次都调用函数 */}
      <Avatar provider={getProvider()} />

      {/* ❌ 问题 4: 每次都传入新函数 */}
      <ModelItem onSelect={onSelectModel} />
    </div>
  );
}
```

#### 优化方案

```tsx
// 1. Hook 层优化
function useModelSelector({ providers, value, onChange }) {
  // ✅ 用 useMemo 缓存查找结果
  const selectedProvider = useMemo(() => {
    if (!value) return undefined;
    return providers.find(p => p.id === value.providerId);
  }, [providers, value]);

  // ✅ 用 useCallback 缓存函数
  const onSelectModel = useCallback((provider, model) => {
    onChange({
      providerId: provider.id,
      modelId: model.id,
    });
  }, [onChange]);

  return { selectedProvider, onSelectModel };
}

// 2. 组件层优化
const ModelSelectorComponent = ({ providers, value, onChange }) => {
  const { selectedProvider, onSelectModel } = useModelSelector({
    providers,
    value,
    onChange,
  });

  return (
    <div>
      {/* ✅ 使用缓存的值 */}
      <Avatar provider={selectedProvider} />

      {/* ✅ 传入稳定的函数引用 */}
      <ModelItem onSelect={onSelectModel} />
    </div>
  );
};

// 3. ✅ 用 memo 包裹组件
export const ModelSelector = memo(ModelSelectorComponent);
```

#### 优化效果

- 🚀 减少 60% 的不必要渲染
- 🚀 避免重复的数组查找操作
- 🚀 子组件不会因为函数引用变化而重渲染

---

## 常见误区

### ❌ 误区 1: 过度优化

```tsx
// 不要这样做！
const double = useMemo(() => value * 2, [value]); // 过度优化

// 应该这样：
const double = value * 2; // 简单计算不需要优化
```

**原则：** 只优化真正昂贵的操作

---

### ❌ 误区 2: 忘记依赖数组

```tsx
// ❌ 错误：缺少依赖
const filtered = useMemo(() => {
  return items.filter(i => i.type === selectedType);
}, []); // selectedType 应该加入依赖！

// ✅ 正确
const filtered = useMemo(() => {
  return items.filter(i => i.type === selectedType);
}, [items, selectedType]);
```

---

### ❌ 误区 3: memo 与 useCallback 不配合

```tsx
const ParentComponent = () => {
  // ❌ 错误：没有用 useCallback
  const handleClick = () => console.log('clicked');

  return (
    <ChildComponent onClick={handleClick} /> // memo 失效！
  );
};

// ✅ 正确
const ParentComponent = () => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return (
    <ChildComponent onClick={handleClick} /> // memo 生效
  );
};

const ChildComponent = memo(({ onClick }) => {
  return <button onClick={onClick}>点击</button>;
});
```

---

## 优化检查清单

在优化组件时，问自己这些问题：

- [ ] 这个组件会频繁重渲染吗？→ 考虑 `memo`
- [ ] 有昂贵的计算或数据转换吗？→ 考虑 `useMemo`
- [ ] 有传递给子组件的函数吗？→ 考虑 `useCallback`
- [ ] 父组件传入的 `onChange` 是稳定的吗？→ 让父组件用 `useCallback`

---

## 性能检测工具

### React DevTools Profiler

1. 安装 React DevTools 浏览器扩展
2. 打开 Profiler 标签
3. 点击录制按钮
4. 操作你的应用
5. 停止录制，查看哪些组件渲染最频繁

### 简单的性能日志

```tsx
const ExpensiveComponent = memo(({ data }) => {
  console.log('ExpensiveComponent 渲染了', new Date().toISOString());

  return <div>{data}</div>;
});
```

如果控制台频繁输出日志，说明需要优化！

---

## 总结

### 优化三件套

1. **React.memo** - 组件级别优化
2. **useMemo** - 计算结果优化
3. **useCallback** - 函数引用优化

### 优化原则

- ✅ **先测量，后优化** - 不要过早优化
- ✅ **优化瓶颈** - 优先优化最慢的部分
- ✅ **保持简单** - 不是所有代码都需要优化
- ✅ **配合使用** - memo + useCallback 效果最佳

### 何时需要优化？

- 列表组件（渲染大量数据）
- 频繁更新的组件
- 复杂的数据计算
- 深层嵌套的组件树

### 何时不需要优化？

- 简单的展示组件
- 不常重渲染的组件
- 简单的计算（加减乘除）

---

**记住：过早的优化是万恶之源，但适当的优化能让应用飞起来！** 🚀
