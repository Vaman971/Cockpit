/**
 * Global test setup — runs before each test file.
 * Suppresses logger output and sets test environment variables.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_32_characters_min';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'test';
process.env.DB_PORT = '3306';
process.env.ALLOWED_EMAIL_DOMAIN = 'tatatechnologies.com';
process.env.LOG_LEVEL = 'silent';
process.env.CORS_ORIGIN = 'http://localhost:3000';
