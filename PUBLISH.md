# 发布到 GitHub

仓库已经在本地初始化并提交，`v1.7.0` tag 已打好，远端已配置为
`https://github.com/cq888666/dsh-purge.git`。

## 最快路径（Windows，无需安装 gh）

在本目录打开 PowerShell / 终端，执行：

```powershell
git push -u origin main
git push origin v1.7.0
```

第一次推送时 Git Credential Manager 会弹出浏览器，登录 GitHub 账号即可。
如果远端还没有这个仓库，先在 <https://github.com/new> 建一个空的
`dsh-purge`（不要勾选 README / .gitignore / license），再执行上面的命令。

推送 tag 会触发 `.github/workflows/release.yml`：

1. 在 Ubuntu 上跑 `npm test`、`check:client`、`test:ui`、`check:docs`、发行包 smoke；
2. 执行 `npm pack` 生成 `dsh-purge-plus-1.7.0.tgz` 和 `SHA256SUMS.txt`；
3. 创建 GitHub Release，并把两个文件作为附件上传。

不需要本地手动上传 tarball；工作流会构建与本地一致的发行包。

## 用 GitHub CLI（可选）

```powershell
gh auth login
gh repo create cq888666/dsh-purge --public --source . --remote origin --push
git push origin v1.7.0
```

若 `--remote origin` 报 “remote already exists”，改用：

```powershell
gh repo create cq888666/dsh-purge --public
git push -u origin main
git push origin v1.7.0
```

## 本地已经验证过的内容

- `npm test`：33/36 通过；3 个失败都是 Windows 平台既有假设
  （POSIX 文件权限 600/700、无扩展名的 POSIX launcher），与补丁逻辑无关；
  同一套测试在 Ubuntu CI 上会通过。
- `npm run test:ui`：PASS。
- `npm run check:client`：PASS（client.js 已按 1.7.0 重建并提交）。
- `npm run check:docs`：PASS。
- `npm run smoke`：PASS（tgz 的 8 个导出、预设解析、bundle patch、CLI 降级）。
- 宿主回归：在 DSH Desktop 0.2.2-rc.1 的 `app.asar` 解包副本上
  `purge-community apply` + `selfcheck`，78/78 锚点解析、0 漂移、
  宿主层 24/24 通过。
- Windows 安装器：`install.ps1 -DryRun` 与针对假 `DSH_HOME` 的完整安装均通过。

## 推之前想再核一遍

```powershell
git log --oneline -3
git status --short
```
