export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    phone: process.env.TWILIO_PHONE ?? '',
  },
  otp: {
    bypass: process.env.OTP_BYPASS === 'true',
    demo: process.env.DEMO_OTP ?? '123456',
  },
  firebase: {
    credentialsJson: process.env.FIREBASE_CREDENTIALS_JSON ?? '',
  },
});
