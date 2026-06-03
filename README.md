# HR × AI 协作人格测试

**简化版部署包** — 所有源码都在根目录，没有子文件夹，避免 GitHub 网页上传时的目录结构问题。

## 上传到 GitHub 的步骤

1. 把这个文件夹解压
2. 进入文件夹，**全选所有 11 个文件**（按 Ctrl+A）
3. 拖到 GitHub 仓库的 Upload files 页面
4. Commit

所有文件都是平铺的，不会有"文件夹丢失"的问题。

## 文件清单

```
App.tsx
index.css
index.html
main.tsx
package.json
personas.ts
postcss.config.js
README.md
tailwind.config.js
tsconfig.json
utils.ts
vite.config.ts
```

## 修改文字

- 界面文字（标题、按钮、提示）→ 改 `App.tsx`
- 题目选项、24 个人格 → 改 `personas.ts`
