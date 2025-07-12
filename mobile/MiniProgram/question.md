### 1. uCharts 图表引入

### 2. lime-echart 引入

### 3. 自定义状态栏

getSystemInfo

### 4. 当前页面路由栈

getCurrentPages

### 5. 右上角胶囊

getMenuButtonBoundingClientRect

### 6. 组件注册方式

### 7. 隐藏滚动条方式

1. `scroll-view`组件设置:  
   通过设置`show-scrollbar`属性为`false`来隐藏滚动条（小程序中不生效）

2. `app-plus`中设置:  
   小程序不生效

```json
{
  "path": "pages/research/research",
  "style": {
    "navigationBarTitleText": "研报",
    "navigationBarBackgroundColor": "#Fff",
    "app-plus": {
      "scrollIndicator": "none"
    }
  }
}
```

3. 全局配置滚动条样式：  
   生效

```less
::-webkit-scrollbar {
  display: none;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}
```

### 8. request 封装

### 9. 微信小程序分包

1. 修改 manifest.json 文件

首先需要在 manifest.json 中开启分包优化：

```json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    }
  }
}
```

2. 配置 pages.json

在 pages.json 中添加 subPackages 或 subpackages 配置项（两者都可以）：

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    }
  ],
  "subPackages": [
    {
      "root": "packageA",
      "pages": [
        {
          "path": "page1/page1",
          "style": {
            "navigationBarTitleText": "分包A页面1"
          }
        },
        {
          "path": "page2/page2",
          "style": {
            "navigationBarTitleText": "分包A页面2"
          }
        }
      ]
    },
    {
      "root": "packageB",
      "pages": [
        {
          "path": "page1/page1",
          "style": {
            "navigationBarTitleText": "分包B页面1"
          }
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["packageA"]
    }
  }
}
```

3. 目录结构调整

根据上面的配置，你的项目目录结构应该类似这样：

```text
├── pages
│   └── index
│       ├── index.vue
│       └── index.json
├── packageA
│   ├── page1
│   │   ├── page1.vue
│   │   └── page1.json
│   └── page2
│       ├── page2.vue
│       └── page2.json
├── packageB
│   └── page1
│       ├── page1.vue
│       └── page1.json
├── static
├── main.js
├── App.vue
├── manifest.json
└── pages.json
```
