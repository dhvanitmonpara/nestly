import { DataTypes } from "sequelize"
import User from "./user.model"
import { sequelize } from "../db/connect"

const DirectConversation = sequelize.define("direct_conversation", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id1: {
    type: DataTypes.INTEGER,
    references: {
        model: User,
        key: "id"
    },
    allowNull: false,
  },
  user_id2: {
    type: DataTypes.INTEGER,
    references: {
        model: User,
        key: "id"
    },
    allowNull: false,
  },
})

export default DirectConversation