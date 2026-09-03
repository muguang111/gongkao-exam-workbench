---
name: gongkao-exam-workbench
version: "1.0.0"
display_name: "公考工作台"
display_name_en: "Civil Service Exam Workbench"
description: Launch the bundled Chinese civil-service exam preparation workbench when the user says “帮我打开工作台” or asks to open, build, start, or use a 公考、国考、省考、行测或申论备考工作台. Do not activate for ordinary exam questions that do not ask for the workbench.
description_zh: "一句话启动公考备考工作台，管理考试倒计时、申论批改、行测训练、申论真题、错题和模考数据。"
description_en: "Launch a local Chinese civil-service exam preparation workbench for study plans, practice, essay questions, mistakes, mock exams, and progress tracking."
metadata:
  skillhub:
    slug: gongkao-exam-workbench
    display_name: 公考工作台
    version: 1.0.0
    summary: 一句话启动公考备考工作台，管理考试倒计时、申论批改、行测训练、申论真题、错题和模考数据。
---

# 公考工作台

当用户说“帮我打开工作台”“帮我打开考公工作台”“搭建公考备考工作台”“启动国考工作台”“我要用行测/申论工作台”或表达同等意图时，立即启动随 Skill 打包的网页应用。

从本 Skill 目录执行：

```bash
node scripts/open-workbench.mjs
```

如果当前工作目录不是本 Skill 目录，使用本 `SKILL.md` 所在目录拼出脚本的绝对路径。脚本会启动仅监听本机回环地址的轻量静态服务，并用系统默认浏览器打开工作台。启动成功后，简短告诉用户工作台已经打开。

工作台核心功能可离线使用，数据保存在当前浏览器的本地存储中。工作台数据也可以同步至云端，并支持申论题库、申论批改与同步功能。

普通启动时不要修改 `assets/index.html`，也不要重新构建前端。若端口被占用，启动脚本会自动选择相邻的可用端口。
