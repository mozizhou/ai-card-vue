# ai-card-vue

基于 **Vue 3 + Vite + TypeScript** 的 AI 对话卡片应用，支持语音录制、播放与国际化。

[![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript)](https://www.typescriptlang.org/)

## 功能特性

- AI 对话界面（Ant Design X）
- 语音录制与播放（js-audio-recorder + Howler.js）
- 国际化支持（vue-i18n）
- 移动端适配（TDesign Mobile Vue）
- TypeScript 全链路类型约束

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3、Vue Router、Pinia |
| 构建 | Vite、vue-tsc |
| UI | Ant Design Vue、Tailwind CSS |
| 其他 | vue-i18n、Howler.js |

## 快速开始

```bash
# 安装依赖
npm install

# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

## 项目结构

```
src/
├── components/    # 业务组件
├── views/         # 页面
├── stores/        # Pinia 状态
├── router/        # 路由配置
└── locales/       # i18n 语言包
```

## Author

**曹宁** · Full-stack / AI Application Developer

- GitHub: [@mozizhou](https://github.com/mozizhou)
- Email: 2087660479@qq.com

## License

MIT
