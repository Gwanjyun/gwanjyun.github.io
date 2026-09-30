# 邓钧元 · 个人主页

AIGC 算法工程师个人主页 —— 纯静态站点，直接托管在 GitHub Pages。

在线地址：<https://gwanjyun.github.io/>

## 技术栈

无框架、无构建步骤：原生 HTML + CSS + JavaScript。
内容与界面分离，所有文字资料集中在 `data/content.json`。

```
.
├── index.html          主页
├── research.html       研究（方向 / 论文 / 荣誉）
├── projects.html       项目与作品
├── blog.html           博客列表
├── post.html           文章正文（post.html?id=0）
├── contact.html        联系方式
├── css/style.css       设计系统（白底黑白极简）
├── js/
│   ├── partials.js     导航与页脚注入（读 content.json 取姓名）
│   ├── render.js       内容渲染器（按 body[data-page] 分发）
│   └── main.js         滚动动画、数字滚动、整卡可点
├── data/content.json   ★ 全部内容数据
└── .github/workflows/deploy.yml   自动部署
```

## 本地预览

浏览器出于安全策略不允许 `file://` 下读取 JSON，请用本地服务器打开：

```bash
# 任选一种
python -m http.server 8000
npx serve .
```

然后访问 <http://localhost:8000/>。

## 如何修改内容

只需编辑 `data/content.json` 一个文件，保存后刷新页面即可生效：

| 字段 | 作用 |
| --- | --- |
| `profile` | 姓名、头衔、简介、邮箱、GitHub / Scholar 等链接 |
| `about` | 首页 Hero 文案与四个统计数字 |
| `work_experience` | 工作经历卡片 |
| `project_experience` | 首页项目经历卡片 |
| `research` | 研究方向卡片 |
| `publications` | 论文（`authors[].me: true` 会加粗本人） |
| `awards` | 荣誉与任职 |
| `projects` | 项目页卡片（`link` 有值则整卡可点） |
| `posts` | 博客文章（`content` 用 `\n` 分段） |

新增一篇文章：在 `posts` 数组里加一个对象即可，列表页与 `post.html?id=N` 会自动生效
（N 为数组下标，从 0 开始）。

### 换头像

把照片放进 `img/` 目录，然后设置：

```json
"photo": "img/photo.jpg"
```

留空则显示姓名首字缩写。

## 部署

推送到 `main` 分支后，GitHub Actions 会自动发布。

仓库首次使用时，需在 **Settings → Pages → Build and deployment → Source** 中选择
**GitHub Actions**。

## 说明

原参考站 junyuandeng.com 依赖后端 `/api/content` 与 `/api/tools/*` 提供数据。
GitHub Pages 是纯静态托管，因此本版本把内容层改为读取仓库内的 `data/content.json`，
并移除了需要服务端的「AI 工具实验室」板块。
