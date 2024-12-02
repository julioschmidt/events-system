import { Sequelize } from 'sequelize';

// Configuração do Sequelize
const sequelize = new Sequelize(
    "mydb",
    "user",
    "root",
  {
    host: "177.44.248.73",
    dialect: 'postgres',
    port: Number("5432"),
  }
);

export default sequelize;