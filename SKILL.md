---
name: gongkao-exam-workbench
description: Launch the bundled Chinese civil-service exam workbench when the user asks to open or use a 公考、国考、省考、行测或申论工作台. It provides Shenlun past-paper practice and grading, randomized Xingce questions, automatic mistake collection, scheduled review, and experience and treasure-chest rewards. Do not activate for ordinary exam questions that do not ask for the workbench.
metadata:
  skillhub:
    slug: gongkao-exam-workbench
    display_name: 公考工作台
    version: "1.0.2"
    summary: 一句话启动公考工作台，提供申论真题与批改、行测随机练习、错题自动收集和定期复盘，并通过经验和宝箱反馈激励学习。
---

# 公考工作台

当用户说“帮我打开工作台”“帮我打开考公工作台”“搭建公考备考工作台”“启动国考工作台”“我要用行测/申论工作台”或表达同等意图时，立即启动随 Skill 打包的网页应用。

工作台提供申论真题题库与申论批改、行测随机题目练习、错题自动收集和定期错题复盘。每次练习与错题复盘都会提供经验、宝箱等成长反馈，帮助用户形成持续学习的正循环。

从本 Skill 目录执行：

```bash
node scripts/open-workbench.mjs
```

如果当前工作目录不是本 Skill 目录，使用本 `SKILL.md` 所在目录拼出脚本的绝对路径。脚本会启动仅监听本机回环地址的轻量静态服务，并用系统默认浏览器打开工作台。启动成功后，简短告诉用户工作台已经打开。

工作台的本地功能和缓存数据保存在当前浏览器中。用户主动填写连接码后，工作台会通过本地服务代理访问 `https://api.yueqianzhisuan.cn/api`，加载题库、提交申论批改并同步学习数据；不要替用户填写连接码或登录凭据。

普通启动时不要修改 `assets/index.html`，也不要重新构建前端。若端口被占用，启动脚本会自动选择相邻的可用端口。
