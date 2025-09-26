# Date Location Finder

一个基于React和TypeScript的约会地点推荐应用，帮助用户找到两个地点之间的中心位置并推荐附近的餐厅、咖啡厅等场所。

## 功能特性

- 🗺️ 地理编码和反向地理编码
- 📍 计算两个地点的中心位置
- 🔍 搜索附近的餐厅、咖啡厅、娱乐场所等
- 📱 响应式设计，支持移动端
- ♿ 无障碍功能支持
- 🌙 深色/浅色主题切换
- 📱 PWA支持，可安装到设备
- 🚀 性能优化和懒加载
- 🧪 完整的测试覆盖

## 技术栈

- **前端框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式**: Tailwind CSS
- **地图服务**: Google Maps REST API
- **构建工具**: Vite
- **测试**: Vitest + Testing Library
- **代码质量**: ESLint + Prettier

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量模板文件：
```bash
cp .env.example .env
```

2. 获取Google Maps API密钥：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - 创建新项目或选择现有项目
   - 启用以下API：
     - Geocoding API
     - Places API
     - Directions API
   - 创建API密钥并设置适当的限制

3. 在 `.env` 文件中设置API密钥：
```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 开发

启动开发服务器：
```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建

构建生产版本：
```bash
npm run build
```

预览生产版本：
```bash
npm run preview
```

### 测试

运行所有测试：
```bash
npm test
```

运行测试并生成覆盖率报告：
```bash
npm run test:run
```

启动测试UI：
```bash
npm run test:ui
```

### 代码质量

检查代码风格：
```bash
npm run lint
```

自动修复代码风格问题：
```bash
npm run lint:fix
```

格式化代码：
```bash
npm run format
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── __tests__/      # 组件测试
│   └── ...
├── contexts/           # React上下文
├── hooks/              # 自定义Hooks
├── services/           # 业务逻辑服务
│   ├── __tests__/      # 服务测试
│   ├── GoogleMapsService.ts  # Google Maps REST API服务
│   ├── LocationService.ts    # 位置服务封装
│   └── ...
├── stores/             # Zustand状态管理
├── types/              # TypeScript类型定义
├── utils/              # 工具函数
└── ...
```

## API服务架构

应用使用Google Maps REST API替代了原来的MCP (Model Context Protocol) 方式：

### GoogleMapsService
直接调用Google Maps REST API的服务类，提供：
- 地理编码 (Geocoding API)
- 地点搜索 (Places API Text Search)
- 附近搜索 (Places API Nearby Search)
- 地点详情 (Places API Place Details)
- 路线规划 (Directions API)

### LocationService
业务逻辑封装层，提供：
- 重试机制
- 错误处理
- 数据转换
- 缓存策略

## 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API密钥 | 是 |

## 部署

### Vercel
1. 连接GitHub仓库到Vercel
2. 在Vercel项目设置中添加环境变量
3. 部署

### Netlify
1. 连接GitHub仓库到Netlify
2. 设置构建命令: `npm run build`
3. 设置发布目录: `dist`
4. 在环境变量中添加API密钥
5. 部署

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🗺️ Google Maps REST API集成
- 📱 响应式设计
- ♿ 无障碍功能
- 🧪 完整测试覆盖
- 📱 PWA支持