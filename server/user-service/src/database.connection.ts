import { Sequelize } from 'sequelize';

// Configuração do Sequelize
const sequelize = new Sequelize(
    "mydb",
    "user",
    "root",
  {
    host: "postgres",
    dialect: 'postgres',
    port: Number("5432"),
  }
);

export default sequelize;