'use strict';

const path = require('path');

module.exports = appInfo => {
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1582545323037_9284';

  // add your middleware config here
  config.middleware = ['notfoundHandler'];

  config.view = {
    root: path.join(appInfo.baseDir, 'app/view'),
    mapping: {
      '.html': 'nunjucks',
    },
  };

  config.assets = {
    publicPath: '/public',
    devServer: {
      autoPort: true,
      command: 'umi dev --port={port}',
      env: {
        APP_ROOT: path.join(__dirname, '../app/web'),        // 调试web tsx
        // APP_ROOT: path.join(__dirname, '../app/web.js'),  // 调试web.js, react版本兼容问题？
        BROWSER: 'none',
        SOCKET_SERVER: 'http://127.0.0.1:{port}',
      },
      debug: true,
    },
  };

  config.security = {
    csrf: false,
  };

  // add your user config here
  const userConfig = {
    mysql: {
      // 单数据库信息配置
      client: {
        // host
        host: "localhost",
        // 端口号
        port: "3306",
        // 用户名
        user: "root",
        // 密码
        password: "xiaoxudoo@126", // your password
        // 数据库名
        database: "google_shopify"
      },
      // 是否加载到 app 上，默认开启
      app: true,
      // 是否加载到 agent 上，默认关闭
      agent: false
    },
    logger: {
      outputJSON: true,
    },
    bodyParser: {
      jsonLimit: '1mb',
      formLimit: '1mb',
    },
  };

  return {
    ...config,
    ...userConfig
  };
};
