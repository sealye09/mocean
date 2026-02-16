# 拖拽排序 & 动画实现指南

> 本文档面向没有使用过拖拽库的开发者，用生活化的比喻解释拖拽和动画的实现原理。

## 一、整体比喻：一场"搬家"

想象你在整理一面**照片墙**：

- **照片墙** = 整个页面（`page.tsx`）
- **相框分区** = 分组容器（`DroppableGroup`）—— 墙上划好的几个区域
- **照片** = 模型卡片（`DraggableModelCard`）—— 可以拿起来移动的照片
- **你的手** = 鼠标指针 + 传感器（`PointerSensor`）
- **照片的影子** = 拖拽覆盖层（`DragOverlay`）—— 你拿起照片时，手里那张半透明的副本
- **搬家规则** = 拖拽策略（`DragStrategy`）—— 决定照片放下后发生什么

---

## 二、角色介绍（组件与职责）

### 2.1 舞台总监：DndContext

```
page.tsx:262-296
```

`DndContext` 是 dnd-kit 的核心容器，相当于**舞台总监**，它负责协调所有角色：

```tsx
<DndContext
  sensors={sensors}              // 谁能触发拖拽？（鼠标/触摸）
  collisionDetection={pointerWithin}  // 怎么判断"碰到了"？
  onDragStart={onDragStart}      // 拿起照片时做什么？
  onDragEnd={onDragEnd}          // 放下照片时做什么？
>
  {/* 所有的分组和卡片都在这里面 */}
  <DroppableGroup ... />
  <DroppableGroup ... />

  {/* 拖拽时跟随鼠标的"影子" */}
  <DragOverlay>...</DragOverlay>
</DndContext>
```

### 2.2 收纳盒：DroppableGroup

```
DroppableGroup.tsx
```

每个分组是一个**收纳盒**，有两个身份：

| 身份 | 对应 Hook | 作用 |
|------|-----------|------|
| 可放置区域 | `useDroppable` | 告诉系统"这里可以放东西"，ID 为 `group-${groupId}` |
| 排序上下文 | `SortableContext` | 告诉系统"盒子里的东西可以排序" |

```tsx
// 1. 声明"我是一个收纳盒"
const { setNodeRef, isOver } = useDroppable({
  id: `group-${group.groupId}`    // 收纳盒的名牌
});

// 2. 声明"盒子里的东西可以排序"
<SortableContext items={modelIds} strategy={rectSortingStrategy}>
  <div ref={setNodeRef}>         {/* 把名牌挂到 DOM 上 */}
    {group.models.map(model => (
      <DraggableModelCard ... />  {/* 盒子里的每张照片 */}
    ))}
  </div>
</SortableContext>
```

**`rectSortingStrategy`** 是排序策略，意思是"这些卡片按网格排列"（而不是一行），dnd-kit 会据此计算卡片应该如何让位。

### 2.3 照片：DraggableModelCard

```
DraggableModelCard.tsx
```

每张卡片使用 `useSortable`，它是 `useDraggable` + `useDroppable` 的合体——既能被拿起，也能作为放置目标：

```tsx
const {
  attributes,   // 无障碍属性（aria-*）
  listeners,    // 鼠标/触摸事件监听器
  setNodeRef,   // 把"我是可拖拽的"挂到 DOM 上
  transform,    // 当前的位移量（x, y）
  transition,   // CSS transition 字符串
  isDragging,   // 我正在被拖拽吗？
  isSorting     // 当前有人在拖拽吗？（不一定是我）
} = useSortable({ id: model.id });
```

### 2.4 影子：DragOverlay

```
page.tsx:289-295
```

当你拿起一张照片时，原位置的照片变透明（`opacity: 0`），而你手里看到的是一个**独立的副本**：

```tsx
<DragOverlay dropAnimation={null}>
  {activeModel ? (
    <ModelCard model={activeModel} className="w-80 rotate-3 opacity-90 shadow-2xl" />
  ) : null}
</DragOverlay>
```

- `dropAnimation={null}` —— 放下时不播放回弹动画（因为数据会刷新，元素会自动到正确位置）
- `rotate-3` —— 轻微倾斜 3 度，暗示"这东西正被拿着"
- `opacity-90` —— 90% 不透明，暗示"这是副本"
- `shadow-2xl` —— 大阴影，产生"浮起来"的视觉效果

### 2.5 搬家公司：useDragModels Hook

```
useDragModels.ts
```

这个 Hook 是整个拖拽的"大脑"，管理所有逻辑：

```
useDragModels
├── sensors          → 传感器配置（什么操作触发拖拽）
├── onDragStart      → 记录"谁被拿起了"
├── onDragEnd        → 放下后执行数据更新
├── resolveDropTarget → 分析"放在了哪里"
├── strategyExecutor → 根据场景选择处理策略
└── activeModel      → 当前被拖拽的模型（给 DragOverlay 用）
```

---

## 三、拖拽的完整生命周期

用一个时间线来描述，当你拖拽一张卡片时发生了什么：

### 第 1 幕：准备阶段

```
你的鼠标按下卡片，但还没移动
```

`PointerSensor` 配置了 `distance: 8`，意思是**鼠标必须移动 8 像素才算开始拖拽**。这是为了区分"点击"和"拖拽"——如果你只是点了一下就松手，那是点击事件，不会触发拖拽。

### 第 2 幕：拿起（onDragStart）

```
鼠标移动超过 8px，拖拽正式开始
```

1. `onDragStart` 被调用，记录被拖拽卡片的 ID（`setActiveId`）
2. 被拖拽的卡片变透明（`opacity: 0`），因为 `isDragging = true`
3. `DragOverlay` 检测到 `activeModel` 不为 null，渲染出跟随鼠标的"影子卡片"
4. 所有卡片的 `isSorting` 变为 `true`

### 第 3 幕：移动中（拖拽进行时）

```
你拿着"影子"在页面上移动
```

当鼠标经过其他卡片时：
- dnd-kit 通过 `pointerWithin` 碰撞检测算法，计算鼠标指针在哪个元素内部
- 被"碰到"的卡片和同组其他卡片会自动计算新的 `transform`（位移量）
- 因为 `isSorting = true`，`transition` 被启用，所以位移带有平滑动画

**比喻**：就像你在书架上抽出一本书，旁边的书会自动滑过来填补空隙。

### 第 4 幕：放下（onDragEnd）

```
你松开鼠标
```

1. `setActiveId(null)` → `DragOverlay` 中的影子消失
2. `isSorting` 变为 `false` → 所有卡片的 `transition` 被关闭（关键！）
3. 分析放置位置（`resolveDropTarget`）：放在了哪个分组？放在了哪张卡片旁边？
4. 执行对应的更新策略（修改数据库中的 `sort` 和 `groupId` 字段）
5. SWR 刷新数据 → React 重新渲染 → 卡片以新顺序显示

> **为什么第 2 步要关闭 transition？**
>
> 因为第 5 步数据刷新时，卡片的 DOM 顺序会改变。如果此时 transition 还开着，
> dnd-kit 会检测到位置变化并播放一次"滑动动画"——看起来就像卡片又动了一次。
> 关闭 transition 后，位置变化是瞬间完成的，用户感知不到。

---

## 四、动画系统详解

### 4.1 "让位动画"：transform + transition

这是拖拽过程中最重要的动画。当你拖拽卡片 A 经过卡片 B 时，B 需要"让开"。

**原理**：dnd-kit 不会真的移动 DOM 元素，而是通过 CSS `transform` 制造视觉上的位移。

```
初始状态：  [A] [B] [C]
拖拽 A 到 C 后面时：
  DOM 顺序不变：  [A] [B] [C]
  视觉效果：      [_] [B←] [C←] ... [A的影子]
                   ↑    ↑     ↑
                  空位  向左移  向左移
```

每张卡片收到的 `transform` 值由 dnd-kit 自动计算：

```tsx
const style = {
  // dnd-kit 计算出 "你应该向左移动 200px"
  transform: CSS.Transform.toString(transform),
  // 让这个移动是平滑的（250ms ease）
  transition: isSorting ? transition : undefined,
};
```

### 4.2 "影子动画"：DragOverlay

影子（DragOverlay）跟随鼠标移动，它是一个独立于正常布局的浮层：

```
  正常布局层：  [_] [B] [C]     ← 原位置空了（opacity: 0）
  浮层：        [A的影子]        ← 跟随鼠标，有阴影和倾斜
```

这样做的好处是：影子不会影响其他元素的布局，移动非常流畅。

### 4.3 "消失/出现动画"：opacity

```tsx
opacity: isDragging ? 0 : 1
```

- 拿起时：原位置的卡片 `opacity: 0`（完全透明，但仍占位）
- 放下时：`opacity: 1`（恢复显示）

配合 className 中的 `transition-opacity`，透明度变化也是平滑的。

### 4.4 isSorting 的精妙之处

这是防止"拖拽结束后重复动画"的关键设计：

```
时间线：
  ─────────────────────────────────────────────
  拖拽开始        拖拽中          放下      数据刷新
  ─────────────────────────────────────────────
  isSorting=true  isSorting=true  =false    =false
  transition=ON   transition=ON   =OFF      =OFF
  ─────────────────────────────────────────────
                  卡片平滑让位 ✓   无动画 ✓  无动画 ✓
```

如果不用 `isSorting` 控制，数据刷新时会出现：
```
放下 → 卡片回到原位（因为 DOM 还是旧的）→ 数据刷新 → 卡片又滑到新位置
         第 1 次动画（多余的）                   第 2 次动画（多余的）
```

---

## 五、碰撞检测：pointerWithin

dnd-kit 提供多种碰撞检测算法，我们选择 `pointerWithin`：

| 算法 | 比喻 | 适用场景 |
|------|------|---------|
| `closestCenter` | "谁的中心离我最近" | 简单列表 |
| `closestCorners` | "谁的角离我最近" | 简单列表 |
| `rectIntersection` | "我和谁有重叠" | 大元素 |
| **`pointerWithin`** | **"我的指尖在谁里面"** | **嵌套容器** |

我们的场景是**分组（大盒子）里嵌套着卡片（小盒子）**，`pointerWithin` 能精确判断指针在哪个层级的哪个元素内。

---

## 六、拖拽策略（四种"搬家方式"）

放下照片时，根据"从哪来"和"放到哪"，有 4 种情况：

```
                    放在卡片上          放在空白区域
                ┌───────────────┬───────────────────┐
  同一个分组内  │ 策略1: 插入排序  │ 策略2: 移到末尾    │
                ├───────────────┼───────────────────┤
  跨分组        │ 策略3: 跨组插入  │ 策略4: 跨组追加    │
                └───────────────┴───────────────────┘
```

### 策略1：同组内插入排序

**比喻**：把书架上的一本书抽出来，插到另一本书的位置。

```
拖拽前：  [A:0] [B:1] [C:2] [D:3]
把 A 拖到 C 的位置：
操作：    从数组中移除 A，在 C 的位置插入 A
结果：    [B:0] [C:1] [A:2] [D:3]
                              ↑ sort 字段重新编号
```

### 策略2：同组内移到末尾

**比喻**：把书架上的书拿出来，放到最右边。

```
拖拽前：  [A:0] [B:1] [C:2]
把 A 拖到分组空白处：
结果：    [B:0] [C:1] [A:2]
```

### 策略3：跨组插入

**比喻**：把 A 书架的书拿出来，插到 B 书架的某个位置。

```
分组1：  [A:0] [B:1]     分组2：  [X:0] [Y:1]
把 A 拖到 Y 的位置：
分组1：  [B:0]            分组2：  [X:0] [A:1] [Y:2]
                                          ↑ groupId 也会改变
```

### 策略4：跨组追加

**比喻**：把书拿到另一个书架的最后面。

```
分组1：  [A:0] [B:1]     分组2：  [X:0] [Y:1]
把 A 拖到分组2的空白处：
分组1：  [B:0]            分组2：  [X:0] [Y:1] [A:2]
```

### 策略的判断逻辑

```tsx
resolveDropTarget(overId) 负责判断"放在了哪里"：

overId 以 "group-" 开头？
  → 是：放在了分组空白处，targetModelId = undefined
  → 否：放在了某张卡片上，targetModelId = overId

然后结合 isSameGroup（是否同组），选择对应策略。
```

---

## 七、文件地图

```
拖拽功能涉及的所有文件：

page.tsx                          ← 舞台：DndContext + DragOverlay
  ├── DroppableGroup.tsx          ← 收纳盒：useDroppable + SortableContext
  │   └── DraggableModelCard.tsx  ← 照片：useSortable（拖拽 + 动画）
  │       └── ModelCard.tsx       ← 照片的外观（纯展示组件）
  └── useDragModels.ts            ← 大脑：传感器 + 事件处理 + 策略执行
      ├── DragStrategy (接口)      ← 搬家规则的契约
      ├── SameGroupReorderStrategy ← 策略1：同组插入排序
      ├── SameGroupMoveToEndStrategy ← 策略2：同组移到末尾
      ├── CrossGroupInsertStrategy ← 策略3：跨组插入
      ├── CrossGroupMoveStrategy   ← 策略4：跨组追加
      └── DragStrategyExecutor     ← 策略调度器
```

---

## 八、关键代码速查

### 为什么拖拽开始时原卡片会"消失"？

```tsx
// DraggableModelCard.tsx:40
opacity: isDragging ? 0 : 1   // 被拖拽的卡片完全透明
```

### 为什么拖拽时其他卡片会平滑移动？

```tsx
// DraggableModelCard.tsx:37-39
transform: CSS.Transform.toString(transform),  // dnd-kit 计算的位移
transition: isSorting ? transition : undefined, // 拖拽中才有过渡动画
```

### 为什么放下后不会出现重复动画？

```tsx
// DraggableModelCard.tsx:39
transition: isSorting ? transition : undefined
// 放下后 isSorting=false → transition=undefined → 数据刷新时无动画
```

### 为什么要移动 8 像素才开始拖拽？

```tsx
// useDragModels.ts:308
useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
// 防止误触，区分"点击"和"拖拽"意图
```

### DragOverlay 的影子为什么不会影响布局？

`DragOverlay` 内部使用 `position: fixed`，脱离文档流，所以不会挤开其他元素。

### 分组怎么知道"有人拖到我上方了"？

```tsx
// DroppableGroup.tsx:42-44
const { setNodeRef, isOver } = useDroppable({
  id: `group-${group.groupId}`
});
// isOver=true 时，分组背景变色 → className={isOver && "bg-accent/50"}
```
