# authService 使用指南

这是对 `src/services/authService.js` 的入门说明，面向项目中调用认证相关 API 的前端开发人员（尤其是初学者）。

## 文件位置
`src/services/authService.js`

## 功能概述
该文件包含围绕用户认证的若干辅助函数：
- `login(username, password, rememberMe)`：模拟的登录请求（示例环境用），返回模拟的 token 与用户信息。
- `saveLoginInfo(username, password, rememberMe)`：根据记住选项将用户名/密码保存到 localStorage（注意安全性）。
- `getSavedLoginInfo()`：读取 localStorage 中保存的用户名/密码。
- `saveToken(token)`：把认证 token 保存到 localStorage。
- `getToken()`：从 localStorage 获取 token。
- `clearAuthInfo()`：清除认证相关的本地 token（保留记住的用户名/密码）。
- `isAuthenticated()`：检查是否存在 token，从而判断用户是否已登录。

## 快速示例
下面是一些如何在项目中使用这些函数的示例：

1. 登录并保存 token
```javascript
import { login, saveToken } from '@/services/authService';

async function handleSubmit(username, password) {
  const res = await login(username, password);
  if (res && res.code === 0) {
    // 登录成功，保存 token
    saveToken(res.token);
    // 你可以在此把用户信息保存到状态管理或上下文中
    // navigate 到主页面
  } else {
    // 登录失败，显示错误提示
    alert(res.message || '登录失败');
  }
}
```

2. 保存“记住我”信息（示例）
```javascript
import { saveLoginInfo } from '@/services/authService';

// rememberMe 可选值：'none' | 'username' | 'both'
saveLoginInfo('alice', 'password123', 'username');
```

3. 在应用启动时检查登录状态
```javascript
import { isAuthenticated, getToken } from '@/services/authService';

if (isAuthenticated()) {
  const token = getToken();
  // 将 token 放入请求头或应用状态中
}
```

## 注意事项（重要）
- 安全性：当前代码为演示/本地开发使用，绝对不要在生产环境中把明文密码存入 `localStorage`。生产环境应该使用安全的认证流程（HTTPS、后端验证、短期 token、刷新 token、HttpOnly cookie 等）。
- 接口真实化：`login` 函数当前模拟网络延迟并返回静态数据。要连接真正后端时，请把 `login` 的实现替换为真实的网络请求（例如 `fetch` 或 `axios`）。
- 错误处理：在调用方处理网络错误、展示加载状态（loading）以及更友好的国际化提示。
- token 存储：如果需要更安全的持久化，请优先选择 `HttpOnly` cookie 或安全的后端会话管理方案。

## 测试提示
- 你可以在浏览器控制台中运行 `localStorage.getItem('authToken')` 来查看保存的 token（开发环境）。
- 使用 `getSavedLoginInfo()` 可以调试 rememberedUsername 与 rememberedPassword 的保存/读取行为。

## 变更记录
- 2025-10-03：为 `authService.js` 添加详细中文注释并编写本使用指南。

---
如果你希望我把 README 内容也显示在项目的 README 或者在 PR 描述中引用，请告诉我我会把它自动添加到分支并推送。