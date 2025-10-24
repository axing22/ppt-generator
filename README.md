# 🔺 Pyramid AI Presenter

一个基于AI的智能PPT生成器，使用GLM-4.5 API自动解析文本内容并生成结构化的幻灯片。

## ✨ 功能特性

- 🤖 **AI智能解析**：使用GLM-4.5模型自动分析文本，提取标题、核心观点和论据
- 📝 **结构化编辑**：支持手动编辑标题、核心观点和多条论据
- 👀 **实时预览**：输入内容时实时预览幻灯片效果
- 🎨 **智能布局**：根据论据数量自动选择最佳布局（流程图、双栏、三列）
- 📤 **HTML导出**：支持导出为独立HTML文件
- ⌨️ **键盘快捷键**：支持键盘导航操作

## 🛠 技术栈

- **前端框架**：Next.js 15.1.6 + TypeScript
- **样式框架**：Tailwind CSS 4.0
- **图标库**：Font Awesome
- **AI模型**：GLM-4.5 API
- **部署平台**：Vercel

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📖 使用指南

### 1. 手动创建幻灯片

1. 在左侧"思考区"输入幻灯片标题
2. 填写核心观点（主要思想）
3. 添加多个论据来支持核心观点
4. 右侧"实时预览"会自动更新显示效果

### 2. AI智能解析

1. 点击"✨ 批量导入"按钮
2. 在弹出的文本框中粘贴或输入文本内容
3. AI会自动解析并生成结构化幻灯片
4. 解析完成后自动填充到编辑区

### 3. 预览和导航

1. 点击"预览模式"切换到全屏预览
2. 使用"上一页"/"下一页"按钮或键盘方向键导航
3. 按"ESC"键退出预览模式

### 4. 导出幻灯片

点击"导出 HTML"按钮下载完整的HTML文件，可在浏览器中直接打开查看。

## 🎨 配色方案

- **主色调**：Cyan（青色）系
- **背景**：cyan-400 到 white/10 的渐变
- **按钮**：cyan-500, emerald-500, purple-blue 渐变
- **边框**：cyan-300/30
- **文字**：slate-800, emerald-600

## 🔧 项目结构

```
ppt-generator/
├── src/
│   ├── app/
│   │   ├── api/          # API路由
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 主页面
│   └── globals.css       # 全局样式
├── public/               # 静态资源
├── package.json          # 项目配置
├── next.config.ts        # Next.js配置
├── tsconfig.json         # TypeScript配置
├── tailwind.config.ts    # Tailwind配置
└── README.md            # 项目说明
```

## 🌐 在线演示

[https://cool-ppt.vercel.app](https://cool-ppt.vercel.app)

## 📝 AI解析示例

输入文本示例：
```
AI大模型使用体验

核心观点：AI的差距，不在"会不会用"，而在"用对没用对模型"

论据：
1. 模型选择：不同的AI模型适用于不同的任务场景
2. 提示词工程：好的提示词能显著提升AI回答质量
3. 成本效益：合理使用AI工具可以大幅提升工作效率
```

AI会自动解析为结构化的幻灯片数据。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [GLM-4.5](https://open.bigmodel.cn/) - 智谱AI提供的强大语言模型
- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - 原子化CSS框架
- [Vercel](https://vercel.com/) - 部署平台
