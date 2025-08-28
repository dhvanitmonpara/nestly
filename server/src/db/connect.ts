import { Dialect, Sequelize } from 'sequelize';
import { env } from '../conf/env';

export const sequelize = new Sequelize(
  env.MYSQL_DATABASE,
  env.MYSQL_USER,
  env.MYSQL_PASSWORD,
  {
    host: env.MYSQL_HOST,
    port: Number(env.MYSQL_PORT),
    dialect: env.DB_TYPE as Dialect,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(0)
  }
};
