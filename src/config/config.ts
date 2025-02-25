interface Config {
  env: 'production' | 'development' | 'test';
  port: number;
}

const config: Config = {
  env:
    (process.env.NODE_ENV as 'production' | 'development' | 'test') ||
    'development',
  port: Number(process.env.PORT) || 3000,
};

export default config;
