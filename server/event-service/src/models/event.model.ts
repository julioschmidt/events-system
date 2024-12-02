import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.connection';

class Event extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public date!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'events',
  }
);

export default Event;