module.exports = {
  apps : [{
    name      : 'LynxBlockExplorer',
    script    : './bin/cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production : {
      NODE_ENV: 'production'
    }
  }]
};
