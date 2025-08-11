import { DataTypes } from "sequelize"
import User from "./user.model"
import { sequelize } from "../db/connect"
import Server from "./server.model"

const Member = sequelize.define("members", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
        model: User,
        key: "id"
    },
    allowNull: false,
  },
  server_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Server,
        key: "id"
    }
  }
})

export default Member