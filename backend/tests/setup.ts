process.env.JWT_SECRET = 'test-secret-lungo-almeno-32-caratteri-per-sicurezza';
process.env.JWT_EXPIRES_IN = '15m';
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';
process.env.MAIL_FROM = 'test@bugboard.it';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';