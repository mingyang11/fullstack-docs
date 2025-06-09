# 基础

## 模板语法

### 文本插值

组件实例中数据展示的一种方式，使用方式是用两个大括号包裹起来`{{msg}}`。

```vue
<template>
  <h2>模板语法</h2>
  <h4>文本插值</h4>
  <div>{{ message }}</div>
</template>

<script setup lang="ts">
const message: string = '我是文本插值';
</script>
```

### 原始 html

这种显示方式就是将 html 标签内容当作字符串放到页面上面，但是要将其解析，需要用到`v-html`指令。主要用于后端将格式化的数据以 html 标签的形式传给前端，然后前端展示。

```vue
<template>
  <h2>模板语法</h2>
  <h4>原始html</h4>
  <span v-html="rawHtml"></span>
</template>

<script setup lang="ts">
const rawHtml: string = "<p style='color: red;'>我是原始html</p>";
</script>
```

### Attribute 绑定

如果想要将一个 `attribute`绑定到标签或组件上，需要用到`v-bind`指令。

```vue
<div v-bind:id="id"></div>
```

#### 简写

`v-bind:id`可以简写为`:id`，即`v-bind:`可以简写为`:`

```vue
<div :id="id"></div>
```

#### 同名简写

- 3.4 版本+

如果组件内定义的属性名和要绑定的属性名一样，可以直接使用同名简写的形式

```vue
<template>
  <div :id>同名简写</div>
</template>

<script setup lang="ts">
const id: string = '123';
</script>
```

#### 动态绑定多个值

可以通过`v-bind`后面不带具体的属性名，带一个对象来绑定多个属性。

```vue
<template>
  <div v-bind="manyAttribute">多属性绑定</div>
</template>

<script setup lang="ts">
const manyAttribute: object = {
  id: '123',
  class: 'test',
  style: 'color: red;',
};
</script>
```

### 使用 JavaScript 表达式

我们可以在 vue 模板中绑定文本插值，同样也可以在 vue 模板中放`JavaScript表达式`，但是不能放`JavaScript语句`和`条件控制语句`。

```vue
<template>
  <h4>JavaScript表达式</h4>
  <div>{{ Math.random() > 0.5 ? 'hello' : 'world' }}</div>
  <div>{{ 1 + 1 }}</div>
  <div>{{ [1, 2, 3, 4].reverse().join(',') }}</div>
  <div :id="`id-${id}`"></div>
</template>

<script setup lang="ts">
const id: string = '123';
</script>
```

#### 调用函数

可以在绑定的表达式中使用一个组件暴露的方法

```vue
<time :title="toTitleDate(date)" :datetime="date">
  {{ formatDate(date) }}
</time>
```

### 指令

指令是指带有`v-`前缀的特殊 atrribute，`vue`提供了很多的`内置指令`,包含有：

- `v-html: `html 内容展示
- `v-bind: `绑定属性
- `v-for: `循环
- `v-if: `if
- `v-else: `else
- `v-show: `显示隐藏
- `v-on: `绑定事件，简写`@`，如`v-on:click`可以简写为`@click`。
- `v-model: `表单元素绑定

#### 修饰符 Modifiers

修饰符是以点开头的特殊后缀，表明指令需要以一些特殊的方式被绑定。例如 `.prevent` 修饰符会告知 `v-on` 指令对触发的事件调用 `event.preventDefault()`：

```vue
<form @submit.prevent="onSubmit">...</form>
```

## 响应式基础

简单来说就是响应式状态数据，和`react`的`state`和`props`类似，变化之后引起 UI 的更新。

Vue 3 提供了两种主要的响应式 API：

**ref：**

- 主要用于声明基础数据类型的响应式
- 也可以用于复杂数据类型
- 访问值时需要通过 `.value`

**reactive：**

- 主要用于声明对象和数组的响应式
- 修改时不能直接赋值，需要逐个修改属性

不同的是：

1. ref 主要用于声明基础数据的响应式，但实际上也可以用于声明复杂数据的响应式也有浅层响应(我理解就是只对比外层数据，不会对深层次属性进行对比，这是需要用 shallowRef 来声明)。
2. reactive 主要用于声明复杂数据的响应式，也有浅层响应(shallowReactive)。

## 计算属性

计算属性就是将一些计算过后的值缓存起来，之后只有当计算中使用的状态变化时才会再次进行计算，这样避免了每次调用一个值的时候都会计算一遍的问题，特别是当一个计算属性涉及到大量的计算消耗内存的操作的时候，这个属性就很有用。

```vue
<template>
  <div>{{ doubleCount }}</div>
  <div>{{ functionCount() }}</div>
  <button @click="count2++">{{ count2 }}+</button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const count = ref(1000);
const count2 = ref(0);

const doubleCount = computed(() => {
  let sum = 0;
  for (let i = 0; i < count.value; i++) {
    sum += i;
  }
  console.log(sum, 'doubleCount');
  return sum;
});

const functionCount = () => {
  let sum = 0;
  for (let i = 0; i < count.value; i++) {
    sum += i;
  }
  console.log(sum, 'functionCount');
  return sum;
};
</script>
```

### 计算属性缓存 VS 方法

如上面的那段代码，我写了一个计算属性 `doubleCount` 和一个方法 `functionCount`。在页面上的显示效果是：计算属性 `doubleCount` 如果在响应式属性 `count` 不变化的情况下，只会在页面加载的时候执行一次；而方法 `functionCount` 却是在我更改其他响应式属性的时候也都会重新计算。

## 类与样式绑定

本质其实就是类名和样式的动态属性绑定的操作，动态绑定的时候需要用到指令`v-bind`，而非动态绑定的时候则不需要，就直接是`class`和`style`就可以了。

```vue
<template>
  <h4>动态绑定类名</h4>
  <div :class="classname">方式1</div>
  <div :class="{ active: isActive }">方式2</div>
  <div :class="classArr">方式3</div>
  <div :class="[isActive ? 'active' : '', 'focurs']">方式4</div>
  <div :class="[isActive ? 'active' : 'focurs']">方式5</div>
  <h4>不绑定类名</h4>
  <div class="box">这里的box就是个字符串</div>
  <h4>绑定样式</h4>
  <div :style="{ color: 'red', fontSize: '20px' }">方式1</div>
  <div :style="styleObj">方式2</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const classname = ref('active');
const isActive = ref<boolean>(true);
const classArr = ref<string[]>(['active', 'focurs']);
const styleObj = ref({ color: 'red', fontSize: '20px' });
</script>
```

## 条件渲染

- `v-if：`判断元素是否展示
- `v-else：`判断元素是否展示，需要和`v-if`或者`v-else-if`配合使用
- `v-else-if：`判断元素展示，需要和`v-if`配合使用
- `v-show：`展示/隐藏元素

```vue
<template>
  <div v-if="type === 'A'">A</div>
  <div v-else-if="type === 'B'">B</div>
  <div v-else-if="type === 'C'">C</div>
  <div v-else>Not A/B/C</div>
  <div v-show="type === 'A'">v-show</div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const type = ref<string>('B');
</script>
```

### v-if 和 template

因为 v-if 是一个指令，他必须依附于某个元素。但如果我们想要切换不止一个元素呢？在这种情况下我们可以在一个 `<template>` 元素上使用 v-if，这只是一个不可见的包装器元素，最后渲染的结果并不会包含这个 `<template>` 元素。

```vue
<template>
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```

### v-if VS v-show

`v-if`是判断元素是否展示，元素是真实的存在或者不存在页面上，如果为 false 则这个元素就会从页面上消失。而`v-show`则是改变元素的 CSS 属性，以达到展示或隐藏的效果，且这个元素是真实存在页面上的。

### v-if 和 v-for

当它们同时存在于一个节点上时，`v-if` 比 `v-for` 的优先级更高。这意味着 `v-if` 的条件将无法访问到 `v-for` 作用域内定义的变量别名。

## 列表渲染

### 数组渲染

```vue
<template>
  <li v-for="(item, index) in items">
    {{ parentMessage }} - {{ index }} - {{ item.message }}
  </li>
</template>
<script setup lang="ts">
import { ref } from 'vue';
const parentMessage = ref('Parent');
const items = ref([{ message: 'Foo' }, { message: 'Bar' }]);
</script>
```

### 对象渲染

```vue
<template>
  <ul>
    <li v-for="value in myObject">
      {{ value }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
const myObject = reactive({
  title: 'How to do lists in Vue',
  author: 'Jane Doe',
  publishedAt: '2016-04-10',
});
</script>
```

### 通过 key 管理状态

为了给 Vue 一个提示，以便它可以跟踪每个节点的标识，从而重用和重新排序现有的元素，你需要为每个元素对应的块提供一个唯一的 `key` attribute

```vue
<template v-for="todo in todos" :key="todo.name">
  <li>{{ todo.name }}</li>
</template>
```

## 事件处理

### 事件修饰符

在处理事件时调用 event.preventDefault() 或 event.stopPropagation() 是很常见的。尽管我们可以直接在方法内调用，但如果方法能更专注于数据逻辑而不用去处理 DOM 事件的细节会更好。

为解决这一问题，Vue 为 v-on 提供了事件修饰符。修饰符是用 . 表示的指令后缀，包含以下这些：

- .stop
- .prevent
- .self
- .capture
- .once
- .passive

```vue
<!-- 单击事件将停止传递 -->
<a @click.stop="doThis"></a>

<!-- 提交事件将不再重新加载页面 -->
<form @submit.prevent="onSubmit"></form>

<!-- 修饰语可以使用链式书写 -->
<a @click.stop.prevent="doThat"></a>

<!-- 也可以只有修饰符 -->
<form @submit.prevent></form>

<!-- 仅当 event.target 是元素本身时才会触发事件处理器 -->
<!-- 例如：事件处理器不来自子元素 -->
<div @click.self="doThat">...</div>

<!-- 添加事件监听器时，使用 `capture` 捕获模式 -->
<!-- 例如：指向内部元素的事件，在被内部元素处理前，先被外部处理 -->
<div @click.capture="doThis">...</div>

<!-- 点击事件最多被触发一次 -->
<a @click.once="doThis"></a>

<!-- 滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成 -->
<!-- 以防其中包含 `event.preventDefault()` -->
<div @scroll.passive="onScroll">...</div>
```

### 按键修饰符

```vue
<!-- 仅在 `key` 为 `Enter` 时调用 `submit` -->
<input @keyup.enter="submit" />
```

- .enter
- .tab
- .delete (捕获"Delete"和"Backspace"两个按键)
- .esc
- .space
- .up
- .down
- .left
- .right

### 鼠标按键修饰符

- .left
- .right
- .middle

## 表单输入绑定

在前端处理表单时，我们常常需要将表单输入框的内容同步给 JavaScript 中相应的变量，vue 则给出了`v-model`这一个指令来简化了这一步骤。

```vue
<p>Message is: {{ message }}</p>
<input v-model="message" placeholder="edit me" />
```

### 修饰符

- `.lazy`: 加了个防抖效果
- `.number`：限制只能输入数字
- `.trim`：去除开头结尾空格

## 侦听器

## 模板引用

## 生命周期

- `beforeCreate：`在组件实例初始化完成之后立即调用。
- `created：`在组件实例处理完所有与状态相关的选项后调用。
- `beforeMount：`在组件被挂载之前调用。
- `mounted：`在组件被挂载之后调用。
- `beforeUpdate：`在组件即将因为一个响应式状态变更而更新其 DOM 树之前调用。
- `updated：`在组件因为一个响应式状态变更而更新其 DOM 树之后调用。
- `beforeUnmount：`在一个组件实例被卸载之前调用。
- `unmounted：`在一个组件实例被卸载之后调用。
- `errorCaptured：`在捕获了后代组件传递的错误时调用。
