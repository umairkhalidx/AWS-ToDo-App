require('dotenv').config();

module.exports = {
  db: {
    name: process.env.DB_NAME || 'umair-todo-mysql-db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'abcd',
    expiresIn: '30d'
  }
};