import { DataTypes } from "sequelize"
import { sequelize } from "../db/connect"
import User from "./user.model"

const Channel = sequelize.define("channels", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id"
    },
    allowNull: false,
  },
})

export default Channel