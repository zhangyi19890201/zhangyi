// 认证相关的 API 服务（这些函数封装了与用户认证相关的常用操作）

// login: 模拟一个异步登录请求
// 参数：username - 用户输入的用户名
//      password - 用户输入的密码
//      _rememberMe - 是否记住登录（此处只是占位，模拟用途）
export const login = async (username, password, _rememberMe = false) => {
  // 模拟网络延迟：用一个 Promise 在 800 毫秒后 resolve
  // 真实项目中这里会发送网络请求（fetch / axios 等）到后端登录接口
  await new Promise(resolve => setTimeout(resolve, 800));

  // 使用参数占位：把 _rememberMe 引入到作用域以避免 ESLint 报未使用
  // 实际上这里并没有使用它做任何东西，仅用于示例或占位
  void _rememberMe;

  // 简单的模拟逻辑：如果用户名和密码都是 'a' 则视为登录成功
  // 返回一个包含 code、token、user_info 的对象，模拟后端成功返回的数据结构
  if (username === 'a' && password === 'a') {
    return {
      code: 0, // 0 代表成功（这是约定的模拟值）
      token: 'mock-token-for-testing', // 模拟的访问令牌（token）
      user_info: { // 模拟的用户信息
        id: '1',
        username: 'a',
        name: '测试用户',
        department: '测试部门',
        position: '测试职位',
      },
    };
  }

  // 如果用户名/密码不匹配，模拟返回一个失败的响应对象
  return {
    code: 1001, // 非 0 的 code 表示失败或错误（此处随便用一个示例码）
    message: '用户名或密码错误', // 提示信息
  };
};

// saveLoginInfo: 将用户名/密码按照记住选项保存到 localStorage
// 参数：username - 要保存的用户名
//      password - 要保存的密码（请注意：生产环境不要把明文密码存在 localStorage）
//      rememberMe - 标记如何保存：'none' | 'username' | 'both'
export const saveLoginInfo = (username, password, rememberMe) => {
  // 如果选择保存用户名或同时保存用户名和密码
  if (rememberMe === 'username' || rememberMe === 'both') {
    // 把用户名保存到 localStorage
    localStorage.setItem('rememberedUsername', username);
    if (rememberMe === 'both') {
      // 如果选择了同时保存密码，则也保存密码（仅示例，不建议生产中这样做）
      localStorage.setItem('rememberedPassword', password);
    } else {
      // 否则确保密码项被移除（避免残留不必要的数据）
      localStorage.removeItem('rememberedPassword');
    }
  } else {
    // 如果选择不记住任何信息，移除可能存在的 username/password
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberedPassword');
  }
};

// getSavedLoginInfo: 从 localStorage 中读取之前保存的用户名和密码（如果有）
// 返回一个对象，包含 username 和 password 字段，如果没有则返回空字符串
export const getSavedLoginInfo = () => {
  return {
    // 从 localStorage 读取 rememberedUsername，如果不存在则返回空字符串
    username: localStorage.getItem('rememberedUsername') || '',
    // 从 localStorage 读取 rememberedPassword，如果不存在则返回空字符串
    password: localStorage.getItem('rememberedPassword') || '',
  };
};

// saveToken: 将认证令牌保存到 localStorage（用于后续 API 请求的鉴权）
export const saveToken = (token) => {
  // 把 token 字符串保存到本地存储，键名为 'authToken'
  localStorage.setItem('authToken', token);
};

// getToken: 从 localStorage 中读取保存的认证令牌
export const getToken = () => {
  // 直接返回本地存储中的 authToken（可能是 null，如果不存在）
  return localStorage.getItem('authToken');
};

// clearAuthInfo: 清除认证相关的信息（此处仅清除 token）
// 注意：本函数保留了 rememberedUsername / rememberedPassword（如果存在）
export const clearAuthInfo = () => {
  // 移除本地存储中的认证 token
  localStorage.removeItem('authToken');
};

// isAuthenticated: 检查用户是否已登录（是否存在 token）
export const isAuthenticated = () => {
  // getToken() 返回字符串或 null，使用 !! 将其转换为布尔值
  // 有 token 返回 true（已认证），没有返回 false（未认证）
  return !!getToken();
};