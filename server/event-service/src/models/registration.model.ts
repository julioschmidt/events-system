import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.connection';
import Event from './event.model';  // Importação do modelo Event

class Registration extends Model {
  public id!: number;
  public userId!: number;
  public eventId!: number;
  public status!: string;
  public createdAt!: Date;
}

Registration.init(
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
      references: {        // Adiciona referência ao evento
        model: Event,      // Define a tabela de referência
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'ACTIVE',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'registrations',
  }
);

// Definindo a relação: Um Registration pertence a um Event
Registration.belongsTo(Event, {
  foreignKey: 'eventId',
  as: 'event',  // Define o alias para facilitar a inclusão dos dados do evento
});

export default Registration;
