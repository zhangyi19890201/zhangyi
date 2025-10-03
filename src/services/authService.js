// 认证相关的API服务

// 模拟登录请求
export const login = async (username, password, _rememberMe = false) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  // 使用参数占位以避免 ESLint 报告未使用
  void _rememberMe;
  
  // 根据需求准备模板中的测试用户：用户名a，密码a
  if (username === 'a' && password === 'a') {
    return {
      code: 0,
      token: 'mock-token-for-testing',
      user_info: {
        id: '1',
        username: 'a',
        name: '测试用户',
        department: '测试部门',
        position: '测试职位',
      },
    };
  }
  
  // 模拟登录失败
  return {
    code: 1001,
    message: '用户名或密码错误',
  };
};

// 保存用户登录信息到localStorage
export const saveLoginInfo = (username, password, rememberMe) => {
  // rememberMe 允许值: 'none' | 'username' | 'both'
  if (rememberMe === 'username' || rememberMe === 'both') {
    localStorage.setItem('rememberedUsername', username);
    if (rememberMe === 'both') {
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedPassword');
    }
  } else {
    localStorage.removeItem('rememberedUsername');
    localStorage.removeItem('rememberedPassword');
  }
};

// 获取保存的登录信息
export const getSavedLoginInfo = () => {
  return {
    username: localStorage.getItem('rememberedUsername') || '',
    password: localStorage.getItem('rememberedPassword') || '',
  };
};

// 保存用户令牌
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

// 获取用户令牌
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// 清除认证信息（保留记住的用户名和密码）
export const clearAuthInfo = () => {
  localStorage.removeItem('authToken');
};

// 检查用户是否已登录
export const isAuthenticated = () => {
  return !!getToken();
};