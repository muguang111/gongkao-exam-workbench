# 公考工作台

一句话启动公考工作台，提供申论真题题库与批改、行测随机题目练习、错题自动收集和定期复盘，并通过经验、宝箱等成长反馈激励持续学习。

[![skills.sh](https://skills.sh/b/muguang111/gongkao-exam-workbench)](https://skills.sh/muguang111/gongkao-exam-workbench)

当前版本：`1.0.2`

## 主要功能

- 申论真题题库与申论批改
- 行测随机题目练习
- 错题自动收集与定期错题复盘
- 每次练习和复盘获得经验、宝箱等学习反馈

## 使用方法

将本仓库作为 Skill 安装或导入后，对 AI 助手说：

> 帮我打开工作台

也可以使用 Skills CLI 安装：

```bash
npx skills add muguang111/gongkao-exam-workbench --skill gongkao-exam-workbench
```

Skill 会启动仅监听本机的网页服务，并使用默认浏览器打开工作台。首次使用时，根据页面提示设置考试日期、备考方式和需要的功能。

## 数据与接口

- 工作台的本地功能和缓存数据保存在当前浏览器中。
- 用户主动填写连接码后，云端同步、申论题库和申论批改功能通过 `https://api.yueqianzhisuan.cn/api` 提供。
- 本地启动地址通常为 `http://127.0.0.1:43110/`；若端口被占用，脚本会尝试相邻端口。

## 环境要求

- Node.js 18 或更高版本。
- macOS、Windows 或 Linux 桌面环境。

## 仓库结构

```text
.
├── SKILL.md
├── agents/openai.yaml
├── scripts/open-workbench.mjs
└── assets/index.html
```
