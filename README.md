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
├── tools/              本地内容管理后台（不发布，见下）
└── .github/workflows/deploy.yml   自动部署
```

## 可视化后台（推荐）

不想手动改 JSON 的话，用本地后台填表即可：

```bash
node tools/serve.mjs
```

然后打开 <http://127.0.0.1:8770/tools/admin.html>

- 共 9 个板块：个人资料、首页文案、工作经历、项目经历、研究方向、发表论文、
  荣誉任职、项目页、博客文章，另有「原始 JSON」标签可直接编辑全文
- 数组类内容支持**新增 / 删除 / 复制 / 上下排序**，折叠收起
- 论文作者可勾选「本人」，前台会自动加粗
- 标签（tags）输入后回车即可添加，点 × 删除
- 点「保存到文件」直接写回 `data/content.json`，写前自动备份到 `.backups/`
  （保留最近 20 份），可随时手动恢复
- 没启动服务时也能用：点「导出 JSON」下载后覆盖 `data/content.json`

保存后发布：

```bash
git add -A && git commit -m "更新内容" && git push
```

### 两个标签页的数据关系

表单标签页与「原始 JSON」标签页编辑的是**同一份数据**，规则如下：

- 表单里的修改会实时记录在内存中，切标签不会丢失
- 切到「原始 JSON」时，若文本框没有被你手动改过，会**自动同步**为表单最新内容
- 若你手动改过文本框，再点「应用」会弹确认，避免把表单里的改动覆盖掉
- 拿不准时先点「从表单重新载入」，看到的就是当前真实内容

### 数据安全

- 每次保存前，原文件自动备份到 `.backups/`（保留最近 20 份）
- 恢复方式：把 `.backups/` 里某一份复制回 `data/content.json`
- 更权威的兜底是 git：`git checkout -- data/content.json` 回到上次提交的状态
- 保存前会校验 JSON 格式与顶层结构，不合法直接拒绝写入，原文件不受影响

> **`tools/` 已在 `.gitignore` 中，不会发布到公开站点。**
> GitHub Pages 是纯静态托管，加密码也挡不住真正想进的人，
> 所以后台只在你本机运行（仅监听 `127.0.0.1`）。

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
