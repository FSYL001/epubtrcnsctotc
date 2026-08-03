<div align="center">

# EPUBTR

**EPUB 简繁转换器**

一个现代、纯前端运行的 EPUB 电子书简繁体转换工具，直接在浏览器中完成转换。所有处理都在本地 Web Worker 中进行，你的文件不会被上传到任何服务器。

[![在线体验](https://img.shields.io/badge/Online%20Demo-epubtrcn.fsyl001.sbs-6366f1)](https://epubtrcn.fsyl001.sbs)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)]()
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](https://github.com/FSYL001/epubtrcnsctotc/pulls)

[English](README.md) | **简体中文**

</div>

在线体验：[https://epubtrcn.fsyl001.sbs](https://epubtrcn.fsyl001.sbs)

## 界面预览

![EPUBTR 界面](docs/screenshot.png)

## 功能特性

- **完全本地转换** - EPUB 的解析、转换和重新打包都在浏览器内完成，不上传、无服务器、无需账号。
- **双向转换** - 支持简体中文转繁体中文、繁体中文转简体中文，以及自动转换。
- **批量处理** - 拖拽或选择多个 EPUB 文件，一键完成批量转换。
- **忠实保留 EPUB 结构** - 图片、CSS、字体、超链接、目录、版式和元数据均被保留。
- **界面不卡顿** - 转换在 Web Worker 中执行，并带有逐文件状态队列。
- **独立错误处理** - 单个文件转换失败不会影响队列中的其他文件。
- **多语言界面** - 支持简体中文、繁体中文和 English。
- **明暗主题** - 默认跟随系统主题，也可手动切换 Light / Dark / System。

## 快速开始

### 环境要求

- Node.js 20.19+ 或 22.12+（Vite 8 的要求）
- npm（或 pnpm / yarn）

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开终端打印的本地地址，拖入 EPUB 文件即可
```

### 生产构建

```bash
npm run build    # 类型检查 + 产物输出到 dist/
npm run preview  # 本地预览生产构建
```

### 代码检查

```bash
npm run lint
```

## 使用说明

1. 打开网页。
2. 将 EPUB 文件拖入上传区域，或点击选择文件（仅支持 `.epub`）。
3. 选择转换方向：**简体 -> 繁体**、**繁体 -> 简体**，或 **自动转换**。
4. 等待队列完成，每个文件会显示对应状态。
5. 下载转换后的文件，文件名保留原名并带有 `_converted.epub` 后缀。

## 工作原理

1. **文件输入** - EPUB 文件以 `ArrayBuffer` 形式读取并进入队列。
2. **Worker 分发** - 每个文件交给 Web Worker 处理，主线程保持流畅。
3. **EPUB 解析** - JSZip 解压归档，读取 `META-INF/container.xml` 定位 OPF 包文档。
4. **文本转换** - opencc-js 转换 XHTML/HTML 正文、NCX 目录标签和 OPF 元数据，不影响标记、属性和非文本资源。
5. **重新打包** - 使用 DEFLATE 压缩重新生成 EPUB 归档。
6. **下载** - 结果通过 Blob 下载，文件名为 `<原名>_converted.epub`。

## 转换范围

| 会转换 | 会保留 |
| --- | --- |
| XHTML/HTML 正文可见文本 | HTML 标签和属性 |
| NCX 目录标签 | CSS 和 JavaScript |
| OPF 元数据（标题、作者、简介、出版社、主题等） | URL 和文件路径 |
| | 图片、字体及其他二进制资源 |

## 项目结构

```text
epubtr/
├── docs/
│   └── screenshot.png      # README 界面截图
├── src/
│   ├── components/         # UI 组件（Header、UploadZone、FileList 等）
│   │   └── ui/             # shadcn/ui 风格基础组件
│   ├── hooks/              # useTheme、useLanguage
│   ├── lib/                # i18n 文案、类型定义、工具函数
│   ├── workers/
│   │   └── converter.worker.ts  # EPUB 解析 / 转换 / 重新打包逻辑
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/                 # 静态资源（favicon、头像）
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 技术栈

| 分层 | 技术 |
| --- | --- |
| UI | React 19、TypeScript（strict）、Tailwind CSS 3、Radix UI 基础组件 |
| 构建 | Vite 8 |
| EPUB / ZIP | JSZip、fast-xml-parser |
| 中文转换 | opencc-js |
| 图标 | lucide-react |
| 代码检查 | oxlint |

## 部署

这是一个纯静态前端应用，构建后将 `dist/` 部署到任意静态托管平台即可：

```bash
npm run build
```

项目自带的 `public/_redirects` 为支持 Netlify 风格重定向的托管平台提供 SPA 回退规则。

## 参与贡献

欢迎提交 [Issue](https://github.com/FSYL001/epubtrcnsctotc/issues) 反馈问题或功能建议，也欢迎提交 [Pull Request](https://github.com/FSYL001/epubtrcnsctotc/pulls)。提交 PR 时请确保：

- 清晰描述改动内容
- `npm run lint` 和 `npm run build` 均通过
- 提交信息简洁、可读

## 致谢

- [opencc-js](https://github.com/nk2028/opencc-js) - OpenCC 的纯 JavaScript 移植
- [JSZip](https://github.com/Stuk/jszip) - ZIP 创建与解析
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - XML 解析与序列化
- [React](https://react.dev)、[Vite](https://vite.dev) 和 [Tailwind CSS](https://tailwindcss.com) - 前端基础

## 许可证

[CC BY-NC 4.0](LICENSE) - 知识共享 署名-非商业性使用 4.0 国际许可协议。

你可以将本项目用于**非商业目的**的分享与改编，但需要注明原作者。
