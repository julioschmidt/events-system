import { Model, DataTypes } from 'sequelize';
import sequelize from './database.connection';

class Certificate extends Model {
  public id!: number;
  public userId!: number;
  public eventId!: number;
  public certificadoCode!: string;
  public createdAt!: Date;
}

Certificate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    certificadoCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'certificates',
  }
);

export default Certificate;