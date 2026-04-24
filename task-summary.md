# 中国古代建筑文化 Web 应用

## 任务目标
以"弘扬中华优秀自然科学文明和优秀文化传承"为主题，创建 Vue 3 + Three.js 建筑文化展示 Web 应用。

## 项目结构
```
chinese-archiculture-project/
├── package.json          # 依赖：vue@3, three@0.162, gsap@3, vite@5
├── vite.config.js         # Vite 构建配置
├── index.html             # 入口 HTML（含 Google Fonts 字体加载）
└── src/
    ├── main.js
    ├── App.vue            # 根组件，组合所有板块
    ├── assets/main.css    # 全局样式 + CSS 变量
    ├── data/buildings.js  # 建筑/时间轴/构件数据（6座建筑 + 6朝代 + 3构件）
    └── components/
        ├── NavBar.vue         # 固定导航栏
        ├── HeroSection.vue    # Hero 全屏（Three.js 3D 古塔 + 金色粒子 + 动画）
        ├── QuoteSection.vue   # 引言区（《吕氏春秋》）
        ├── BuildingsSection.vue # 经典建筑（6张可交互卡片 + 详情弹窗）
        ├── ThreePreview.vue   # Three.js 3D 模型预览（6种建筑类型）
        ├── TimelineSection.vue # 历史脉络（6朝代时间轴）
        ├── ComponentsSection.vue # 建筑构件（斗拱/榫卯/飞檐 + 详细参数）
        ├── ComponentPreview.vue # 构件 3D 展示
        └── FooterSection.vue   # 页脚
```

## 技术亮点
- **Three.js 3D**：6种建筑类型独立3D模型（故宫/天坛/木塔/布达拉宫/悬空寺/赵州桥）+ 粒子系统
- **Vue 3 组件化**：全部组件化，props/event 驱动，无状态冲突
- **交互卡片**：详细数据统计（面积/高度/材质/建造年代）+ 筛选分类 + 详情弹窗
- **历史时间轴**：左右交替布局，6个朝代演进
- **构件展示**：详细参数表（尺寸/力学原理/应用场景）
- **响应式**：桌面3列 → 平板2列 → 手机1列

## 启动方式
```bash
cd chinese-archiculture-project
npm install
npm run dev
```
访问 http://localhost:5174

## 修复记录
- HeroSection.vue: `stats` 变量名冲突 → 重命名为 `statsEl` 和 `statsData`
