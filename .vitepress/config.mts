import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '扶摇的前端之路',
  description: 'A VitePress Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '前端', link: '/frontend/Htmlcss/BFC.md' },
      { text: '后端', link: '/backend/node1.md' },
      { text: '移动端', link: '/mobile/taro.md' },
    ],

    sidebar: {
      '/frontend/': [
        {
          text: 'HTML+CSS',
          collapsed: true,
          items: [{ text: 'BFC', link: '/frontend/Htmlcss/BFC.md' }],
        },
        {
          text: 'JavaScript',
          collapsed: true,
          items: [
            { text: '继承', link: '/frontend/Javascript/javascript1.md' },
            { text: '节流防抖', link: '/frontend/Javascript/防抖节流.md' },
            { text: '通讯', link: '/frontend/Javascript/Socket.md' },
            { text: 'webwork', link: '/frontend/Javascript/WebWork.md' },
          ],
        },
        {
          text: 'Vue',
          collapsed: true,
          items: [{ text: '指令', link: '/frontend/Vue/Inlstruction.md' }],
        },
        {
          text: 'React',
          collapsed: true,
          items: [],
        },
      ],
      '/backend/': [
        {
          text: 'Node',
          collapsed: true,
          items: [{ text: 'node1', link: '/backend/node1.md' }],
        },
        {
          text: 'Nest',
          collapsed: true,
          items: [{ text: 'nest1', link: '/backend/nest1.md' }],
        },
      ],
      '/mobile/': [
        {
          text: 'Taro',
          collapsed: true,
          items: [{ text: 'taro', link: '/mobile/taro.md' }],
        },
        {
          text: 'uniapp',
          collapsed: true,
          items: [{ text: 'umiapp', link: '/mobile/umiapp.md' }],
        },
        {
          text: 'H5',
          collapsed: true,
          items: [
            { text: 'H5适配', link: '/mobile/H5/h5适配.md' },
            { text: 'H5开发遇到的问题', link: '/mobile/H5/开发问题.md' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
});
