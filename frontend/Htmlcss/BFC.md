### 1.BFC

`BFC`就是`块级格式化上下文`，它是一个独立的渲染区域，且它不会影响其他区域的渲染，也不会被其他区域影响

#### 1.1 解决了什么问题

1. 高度塌陷
2. margin 重合
3. 浮动元素遮挡住正常流式布局元素

#### 1.2 BFC 的触发条件

1. 根元素（`<html>`）
2. 浮动元素（`float`不为`none`）
3. 绝对定位元素（`position`为`absolute`或`fixed`）
4. `display`为`inline-block`、`table-cell`、`table-caption`、`flex`、`inline-flex`、`grid`、`inline-grid`
5. `overflow`不为`visible`

#### 1.3 BFC 的特性

1. 内部的盒子会在垂直方向上一个接一个地放置
2. 垂直方向上的距离由`margin`决定，属于同一个 BFC 的两个相邻盒子的`margin`会发生重叠
3. BFC 的区域不会与浮动盒子重叠
4. BFC 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素
5. 计算 BFC 的高度时，浮动元素也参与计算
