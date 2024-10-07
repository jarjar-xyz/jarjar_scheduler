export default () => ({
  suiRPCPullInterval: parseInt(process.env.SUI_RPC_PULL_INTERVAL) || 1000,
  port: parseInt(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET,
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    log: process.env.DB_LOG === 'true',
  },
});
