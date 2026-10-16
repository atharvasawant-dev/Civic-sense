// server/config/jwt.js
const getJwtSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not defined in production!');
  }
  return process.env.JWT_SECRET || 'dev_civic_sense_jwt_secret_change_in_production';
};

module.exports = { getJwtSecret };
