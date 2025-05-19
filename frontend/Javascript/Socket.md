# WebSocket 和 SocketIO

## 目录

- [WebSocket 基础](#websocket-基础)
  - [什么是 WebSocket](#1-什么是-websocket)
  - [WebSocket 与 HTTP 的区别](#2-websocket-与-http-的区别)
  - [WebSocket 技术详解](#3-websocket-技术详解)
- [WebSocket 实战应用](#websocket-实战应用)
  - [监狱聊天室需求](#1-监狱聊天室需求)
  - [监狱聊天室实现](#2-监狱聊天室实现)
- [Socket.IO 详解](#socketio-详解)
  - [Socket.IO 简介](#1-socketio-简介)
  - [Socket.IO 主要特点](#2-socketio-主要特点)
  - [对比 WebSocket](#3-socketio-vs-原生-websocket)
  - [基础使用](#4-socketio-基础使用)
  - [高级特性](#5-socketio-高级特性)
- [Socket.IO 实战应用](#socketio-实战应用)
  - [类微信聊天工具需求](#1-类微信聊天工具需求)
  - [类微信聊天工具实现](#2-类微信聊天工具实现)
- [最佳实践与总结](#最佳实践与总结)
  - [选择指南](#1-websocket-与-socketio-选择指南)
  - [安全最佳实践](#2-安全最佳实践)
  - [性能优化](#3-性能优化)
  - [扩展性考虑](#4-扩展性考虑)
- [参考资源](#参考资源)

## WebSocket 基础

### 1. 什么是 WebSocket？

`websocket`是一种基于`TCP`的双工通讯协议，就是允许服务端和客户端之间互相发送数据。我们一般做的业务都是前端发送请求给后端，然后后端将数据返回给我们，但是如果要做类似于 **弹幕、聊天、游戏、股票** 这种要求实时性很强的需求，我们此时再想用前端轮询的方式就不行了，这时候就得用到`websocket`的技术，它允许客户端和服务端持久连接，且连接过程中可以互相通讯，后端也可以不经请求向前端发送消息，解决了传统`http`协议**轮询效率低、延迟高**的局限性。

### 2. WebSocket 与 HTTP 的区别

| 特性     | WebSocket                   | HTTP                      |
| -------- | --------------------------- | ------------------------- |
| 连接方式 | 持久化长连接                | 短连接（请求-响应后关闭） |
| 通信模式 | 双向实时通信                | 单向（客户端发起请求）    |
| 协议头   | `ws://` 或 `wss://`（加密） | `http://` 或 `https://`   |
| 数据格式 | 二进制帧或文本帧            | 文本（HTTP 报文）         |
| 使用场景 | 实时聊天、游戏、股票行情    | 静态资源请求、REST API    |

### 3. WebSocket 技术详解

WebSocket 是 HTML5 提供的一种在单个 TCP 连接上进行全双工通信的协议。WebSocket 通过 HTTP/1.1 协议的 101 状态码进行握手。为了创建 WebSocket 连接，需要通过浏览器发出请求，之后服务器进行回应，这个过程称为"握手"（Handshaking）。

#### 3.1 WebSocket API

浏览器提供的原生 WebSocket API 非常简单直观：

```javascript
// 创建WebSocket实例
const socket = new WebSocket('ws://example.com/socket');

// 连接建立时触发
socket.onopen = function (event) {
  console.log('WebSocket连接已建立');
  // 发送数据
  socket.send('你好，服务器!');
};

// 接收到服务器消息时触发
socket.onmessage = function (event) {
  console.log('收到服务器消息:', event.data);
};

// 连接关闭时触发
socket.onclose = function (event) {
  console.log('WebSocket连接已关闭:', event.code, event.reason);
};

// 发生错误时触发
socket.onerror = function (error) {
  console.error('WebSocket错误:', error);
};
```

#### 3.2 WebSocket 状态

WebSocket 对象的 readyState 属性表示连接状态：

```javascript
const readyState = socket.readyState;

// 可能的值
WebSocket.CONNECTING; // 0: 连接尚未建立
WebSocket.OPEN; // 1: 连接已建立，可以通信
WebSocket.CLOSING; // 2: 连接正在关闭
WebSocket.CLOSED; // 3: 连接已经关闭或者连接不能打开
```

#### 3.3 发送和接收数据

WebSocket 可以发送文本或二进制数据：

```javascript
// 发送文本数据
socket.send('Hello!');

// 发送JSON数据
socket.send(JSON.stringify({ type: 'message', content: 'Hello!' }));

// 发送二进制数据
const buffer = new ArrayBuffer(128);
socket.send(buffer);
```

#### 3.4 关闭连接

```javascript
// 正常关闭连接
socket.close();

// 带状态码和原因关闭
socket.close(1000, '操作完成');
```

## WebSocket 实战应用

### 1. 监狱聊天室需求

::: details 监狱聊天室需求说明

1. 用户连接：
   - 每个新连接的用户会被分配一个随机的囚犯 ID 和名称
   - 新用户加入时，所有用户会收到通知
2. 消息功能
   - 用户可以发送和接收实时消息
   - 新用户会收到最近 50 条历史消息
   - 消息包含发送者名称和时间戳
3. 用户列表
   - 左侧边栏显示当前在线的所有囚犯
   - 每个用户有独特的头像颜色
4. 通知系统
   - 用户加入和离开时会有系统通知

:::

### 2. 监狱聊天室实现

#### 2.1 后端实现 (Express + ws)

首先创建一个 Node.js 项目并安装必要的依赖：

```bash
mkdir prison-chat
cd prison-chat
npm init -y
npm install express ws moment uuid
```

**服务器实现 (server.js)**:

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket服务器
const wss = new WebSocket.Server({ server });

// 存储连接的用户
const clients = new Map();
// 存储历史消息
const messageHistory = [];
const MAX_HISTORY = 50;

// 囚犯名字生成
const prisonerNames = [
  '铁拳',
  '刀锋',
  '毒蛇',
  '幽灵',
  '狂暴',
  '黑鸦',
  '暗影',
  '恶狼',
  '冷血',
  '狂怒',
  '冰刃',
  '烈焰',
  '刺客',
  '猎手',
  '游魂',
  '死神',
  '狂战',
  '飞刀',
  '夜行',
  '枯骨',
  '鬼面',
  '血手',
  '魔爪',
  '钢牙',
];

// 随机生成囚犯信息
function generatePrisoner() {
  const id = uuidv4().substring(0, 8);
  const nameIndex = Math.floor(Math.random() * prisonerNames.length);
  const name = prisonerNames[nameIndex] + id.substring(0, 4);
  const color = `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')}`;

  return { id, name, color };
}

// 广播消息给所有客户端
function broadcast(message) {
  const messageString = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });

  // 保存聊天消息到历史记录
  if (message.type === 'message') {
    messageHistory.push(message);
    // 保持历史记录不超过MAX_HISTORY条
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory.shift();
    }
  }
}

// 获取当前在线用户列表
function getUserList() {
  const users = [];
  clients.forEach((user) => {
    users.push({
      id: user.id,
      name: user.name,
      color: user.color,
    });
  });
  return users;
}

// WebSocket连接处理
wss.on('connection', (ws) => {
  // 为新连接的用户生成囚犯信息
  const prisoner = generatePrisoner();

  // 存储用户信息
  clients.set(ws, prisoner);

  // 发送欢迎消息
  ws.send(
    JSON.stringify({
      type: 'welcome',
      data: prisoner,
      users: getUserList(),
      time: moment().format('YYYY-MM-DD HH:mm:ss'),
    })
  );

  // 发送历史消息
  if (messageHistory.length > 0) {
    ws.send(
      JSON.stringify({
        type: 'history',
        data: messageHistory,
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
      })
    );
  }

  // 广播新用户加入通知
  broadcast({
    type: 'notification',
    message: `囚犯 ${prisoner.name} 被关进了监狱`,
    users: getUserList(),
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
  });

  // 处理消息
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      const user = clients.get(ws);

      if (message.type === 'message') {
        broadcast({
          type: 'message',
          sender: user.name,
          senderId: user.id,
          content: message.content,
          color: user.color,
          time: moment().format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  // 处理连接关闭
  ws.on('close', () => {
    const user = clients.get(ws);
    if (user) {
      broadcast({
        type: 'notification',
        message: `囚犯 ${user.name} 越狱了`,
        users: getUserList(),
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
      });

      // 移除用户
      clients.delete(ws);
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`监狱聊天室服务器运行在 http://localhost:${PORT}`);
});
```

#### 2.2 前端实现

**HTML 结构 (public/index.html)**:

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>监狱聊天室</title>
    <link rel="stylesheet" href="./css/style.css" />
  </head>
  <body>
    <div class="prison-chat">
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>在线囚犯</h2>
          <span class="prisoner-count">0</span>
        </div>
        <div class="user-list">
          <!-- 用户列表将动态生成 -->
        </div>
      </div>

      <div class="chat-container">
        <div class="chat-header">
          <h1>监狱聊天室</h1>
          <div class="user-info">
            <span class="user-id">囚犯ID: </span>
            <span class="user-name">囚犯名称: </span>
          </div>
        </div>

        <div class="messages">
          <!-- 消息将动态生成 -->
        </div>

        <div class="input-area">
          <input type="text" id="message-input" placeholder="输入消息..." />
          <button id="send-button">发送</button>
        </div>
      </div>
    </div>

    <script src="./js/main.js"></script>
  </body>
</html>
```

**CSS 样式和 JavaScript 客户端实现**可以查看完整文档。

## Socket.IO 详解

### 1. Socket.IO 简介

Socket.IO 是一个基于 WebSocket 的库，提供了更多的功能和更好的兼容性。它不仅支持 WebSocket，还会在 WebSocket 不可用时自动降级到其他传输方式，如长轮询。

### 2. Socket.IO 主要特点

1. **实时双向通信**：与 WebSocket 类似，支持服务器和客户端之间的实时双向通信。
2. **自动重连**：当连接断开时，Socket.IO 会自动尝试重新连接。
3. **事件系统**：提供了基于事件的 API，使消息处理更加结构化。
4. **房间和命名空间**：支持将连接分组到不同的房间或命名空间，便于消息的定向广播。
5. **跨浏览器兼容性**：在不支持 WebSocket 的浏览器中会自动降级到其他传输方式。

### 3. Socket.IO vs 原生 WebSocket

| 特点     | WebSocket                    | Socket.IO                      |
| -------- | ---------------------------- | ------------------------------ |
| 复杂度   | 较低，API 简单               | 较高，功能丰富                 |
| 易用性   | 需要自行实现重连、房间等功能 | 内置重连、房间、命名空间等功能 |
| 性能     | 轻量级，开销小               | 稍重，但提供更多功能           |
| 兼容性   | 仅支持现代浏览器             | 支持几乎所有浏览器，有降级方案 |
| 消息格式 | 文本和二进制                 | 支持更复杂的数据结构           |
| 学习曲线 | 较低                         | 中等                           |

### 4. Socket.IO 基础使用

#### 4.1 服务端

安装依赖：

```bash
npm install express socket.io
```

基本服务器设置：

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// 处理连接
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 处理自定义事件
  socket.on('chat message', (msg) => {
    console.log('收到消息:', msg);

    // 向所有客户端广播消息
    io.emit('chat message', msg);
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
```

#### 4.2 客户端

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Socket.IO 聊天</title>
    <script src="/socket.io/socket.io.js"></script>
  </head>
  <body>
    <ul id="messages"></ul>

    <form id="form">
      <input id="input" autocomplete="off" />
      <button>发送</button>
    </form>

    <script>
      const socket = io();

      const form = document.getElementById('form');
      const input = document.getElementById('input');
      const messages = document.getElementById('messages');

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
          // 发送消息到服务器
          socket.emit('chat message', input.value);
          input.value = '';
        }
      });

      // 接收广播消息
      socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
      });
    </script>
  </body>
</html>
```

### 5. Socket.IO 高级特性

#### 5.1 房间

房间是 Socket.IO 提供的一个概念，用于将相关的客户端分组，便于定向广播消息：

```javascript
// 服务端
io.on('connection', (socket) => {
  // 加入房间
  socket.join('room1');

  // 向特定房间发送消息
  io.to('room1').emit('room message', '这条消息只发送给room1的成员');

  // 离开房间
  socket.leave('room1');
});
```

#### 5.2 命名空间

命名空间类似于路由，可以创建不同的通信通道：

```javascript
// 服务端
const chatNamespace = io.of('/chat');
const newsNamespace = io.of('/news');

chatNamespace.on('connection', (socket) => {
  console.log('用户连接到聊天命名空间');
});

newsNamespace.on('connection', (socket) => {
  console.log('用户连接到新闻命名空间');
});

// 客户端
const chatSocket = io('/chat');
const newsSocket = io('/news');
```

#### 5.3 中间件

Socket.IO 支持使用中间件进行连接验证和处理：

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  // 验证token
  if (isValidToken(token)) {
    // 可以在socket对象上存储用户信息
    socket.user = getUserFromToken(token);
    next();
  } else {
    next(new Error('认证失败'));
  }
});
```

#### 5.4 消息确认

Socket.IO 支持消息发送的确认回调：

```javascript
// 客户端发送消息并等待确认
socket.emit('chat message', '你好', (response) => {
  console.log('服务器确认收到:', response);
});

// 服务端处理并确认
socket.on('chat message', (msg, callback) => {
  console.log('收到消息:', msg);
  // 发送确认回调
  callback({ status: 'received' });
});
```

#### 5.5 广播消息

广播消息到所有客户端，除了发送者：

```javascript
socket.on('chat message', (msg) => {
  // 广播给除了发送消息的客户端外的所有客户端
  socket.broadcast.emit('chat message', msg);
});
```

## Socket.IO 实战应用

### 1. 类微信聊天工具需求

我们将使用 Socket.IO 实现一个类似微信的聊天工具，支持以下功能：

1. 用户注册和登录
2. 私聊功能
3. 群聊功能
4. 在线状态显示
5. 消息发送确认和已读状态
6. 历史消息加载

### 2. 类微信聊天工具实现

#### 2.1 后端实现 (Express + Socket.IO)

首先创建项目并安装依赖：

```bash
mkdir wechat-clone
cd wechat-clone
npm init -y
npm install express socket.io jsonwebtoken bcrypt moment mongoose cors
```

项目目录结构和完整代码可以查看文档详细内容。

#### 2.2 前端实现 (React)

前端使用 React 框架实现一个类似微信的聊天界面。

完整前端实现可以查看文档详细内容。

## 最佳实践与总结

### 1. WebSocket 与 Socket.IO 选择指南

- 选择 **WebSocket** 的情况：

  - 需要最轻量级的通信方式
  - 项目简单，只需要基本的实时通信功能
  - 对性能要求极高，想要减少额外开销
  - 目标用户使用现代浏览器

- 选择 **Socket.IO** 的情况：
  - 需要兼容旧浏览器
  - 需要更高级的功能（房间、命名空间等）
  - 希望简化代码实现，减少维护成本
  - 构建复杂的实时应用，如多用户聊天、在线游戏等

### 2. 安全最佳实践

1. **认证**

   - 使用安全的认证机制（如 JWT）
   - 在 WebSocket/Socket.IO 连接时验证用户身份
   - 保持认证状态随连接生命周期

2. **数据验证**

   - 始终验证客户端发送的数据
   - 防止注入攻击和 XSS

3. **限流与保护**

   - 实现速率限制防止 DoS 攻击
   - 限制连接频率和消息大小

4. **加密**
   - 使用 WSS 而不是 WS (WebSocket Secure)
   - Socket.IO 通过 HTTPS 提供

### 3. 性能优化

1. **消息压缩**

   - 对大型消息使用压缩算法
   - 使用二进制传输大数据

2. **选择性广播**

   - 避免向所有客户端广播消息
   - 使用房间和命名空间控制消息流向

3. **批量操作**

   - 合并短时间内的多个更新
   - 使用节流和防抖技术减少事件频率

4. **连接管理**
   - 实现合理的重连策略
   - 加入指数退避算法

### 4. 扩展性考虑

当应用需要扩展到多服务器时：

1. **Socket.IO 集群**

   - 使用 Redis 适配器实现跨服务器消息共享
   - 配置黏性会话确保用户连接到同一服务器

2. **水平扩展**

   - 使用负载均衡分发 WebSocket 连接
   - 考虑使用专门的 WebSocket 网关

3. **消息队列集成**
   - 与 RabbitMQ 或 Kafka 等消息队列集成
   - 实现更可靠的消息传递

## 参考资源

1. WebSocket API: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
2. Socket.IO 官方文档: [Socket.IO](https://socket.io/docs/v4/)
3. Express 框架: [Express](https://expressjs.com/)
4. ws 库 (Node.js WebSocket 库): [ws](https://github.com/websockets/ws)

通过本文的学习和两个实际项目的实现，你应该能够理解 WebSocket 和 Socket.IO 的基本概念、差异以及适用场景。根据具体需求选择合适的技术，可以帮助你构建高效、稳定的实时应用。
