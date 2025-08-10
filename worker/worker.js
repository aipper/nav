// Cloudflare Worker 实现 - Personal Navigation 后端服务

// 配置信息 - 这些值将从环境变量中获取
const CONFIG = {
  github: {
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  },
};

// 从环境变量加载配置
function loadConfig() {
  CONFIG.github.clientId = CF_GITHUB_CLIENT_ID || '';
  CONFIG.github.clientSecret = CF_GITHUB_CLIENT_SECRET || '';
  CONFIG.github.redirectUri = CF_GITHUB_REDIRECT_URI || '';
}

// 初始化配置
loadConfig();

// 处理请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 处理
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理 OPTIONS 请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // 认证中间件
  const authResult = await authenticate(request);
  if (!authResult.authenticated) {
    return new Response(JSON.stringify({ error: authResult.error }), {
      status: 401,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
  const user = authResult.user;

  // 路由处理
  if (path.startsWith('/kv/')) {
    return handleKVRequest(request, url, headers);
  } else if (path === '/auth/github') {
    return handleGitHubAuth(url, headers);
  } else if (path === '/auth/github/callback') {
    return handleGitHubCallback(url, headers);
  } else if (path === '/auth/me') {
    return new Response(JSON.stringify(user), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  return new Response('Not Found', {
    status: 404,
    headers: { ...headers, 'Content-Type': 'text/plain' },
  });
}

// 认证处理
async function authenticate(request) {
  // 公开路由不需要认证
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/auth/github' || path === '/auth/github/callback') {
    return { authenticated: true, user: null };
  }

  // 从请求头获取令牌
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: '未提供有效令牌' };
  }

  const token = authHeader.substring(7);
  try {
    // 验证令牌 (在实际应用中，可能需要调用GitHub API验证令牌)
    // 这里简化处理，假设令牌存储在KV中
    const user = await PERSONAL_NAVIGATION.get(`user_${token}`);
    if (!user) {
      return { authenticated: false, error: '无效的令牌' };
    }

    return { authenticated: true, user: JSON.parse(user) };
  } catch (error) {
    console.error('认证错误:', error);
    return { authenticated: false, error: '认证过程中发生错误' };
  }
}

// 处理KV请求
async function handleKVRequest(request, url, headers) {
  const path = url.pathname;
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(JSON.stringify({ error: '缺少key参数' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (path === '/kv/get' && request.method === 'GET') {
      const value = await PERSONAL_NAVIGATION.get(key);
      return new Response(JSON.stringify({ value: value ? JSON.parse(value) : null }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } else if (path === '/kv/put' && request.method === 'POST') {
      const data = await request.json();
      if (!data.value) {
        return new Response(JSON.stringify({ error: '缺少value字段' }), {
          status: 400,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }

      await PERSONAL_NAVIGATION.put(key, JSON.stringify(data.value));
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    } else if (path === '/kv/delete' && request.method === 'DELETE') {
      await PERSONAL_NAVIGATION.delete(key);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: '不支持的方法或路径' }), {
      status: 404,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('KV操作错误:', error);
    return new Response(JSON.stringify({ error: 'KV操作失败' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}

// 处理GitHub认证
function handleGitHubAuth(url, headers) {
  const state = Math.random().toString(36).substring(2, 15);
  // 将state存储在KV中以便后续验证
  PERSONAL_NAVIGATION.put(`state_${state}`, 'valid', { expirationTtl: 300 });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${CONFIG.github.clientId}&redirect_uri=${encodeURIComponent(CONFIG.github.redirectUri)}&state=${state}&scope=user`;

  return Response.redirect(githubAuthUrl, 302);
}

// 处理GitHub回调
async function handleGitHubCallback(url, headers) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return new Response(JSON.stringify({ error: '缺少code或state参数' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }

  // 验证state
  const stateValid = await PERSONAL_NAVIGATION.get(`state_${state}`);
  if (!stateValid) {
    return new Response(JSON.stringify({ error: '无效的state' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
  // 删除已使用的state
  PERSONAL_NAVIGATION.delete(`state_${state}`);

  try {
    // 交换访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: CONFIG.github.clientId,
        client_secret: CONFIG.github.clientSecret,
        code,
        redirect_uri: CONFIG.github.redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return new Response(JSON.stringify({ error: tokenData.error_description }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = tokenData.access_token;

    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const user = await userResponse.json();

    // 生成一个会话令牌
    const sessionToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    // 存储用户信息
    await PERSONAL_NAVIGATION.put(`user_${sessionToken}`, JSON.stringify(user), { expirationTtl: 60 * 60 * 24 * 7 }); // 7天有效期

    // 重定向回应用，并带上会话令牌
    const redirectUrl = new URL(CONFIG.github.redirectUri);
    redirectUrl.searchParams.set('token', sessionToken);

    return Response.redirect(redirectUrl.toString(), 302);
  } catch (error) {
    console.error('GitHub认证回调错误:', error);
    return new Response(JSON.stringify({ error: '认证过程中发生错误' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
}