import { Sequelize } from 'sequelize';

// Configuração do Sequelize
const sequelize = new Sequelize(
    "mydb",
    "postgres",
    "root",
  {
    host: "localhost",
    dialect: 'postgres',
    port: Number("5432"),
  }
);

export default sequelize;