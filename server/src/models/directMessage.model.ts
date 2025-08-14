import { DataTypes } from "sequelize"
import User from "./user.model"
import { sequelize } from "../db/connect"
import DirectConversation from "./directConversation.model"

const DirectMessage = sequelize.define("direct_message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    references: {
        model: DirectConversation,
        key: "id"
    },
    allowNull: false,
  },
  sender_id: {
    type: DataTypes.INTEGER,
    references: {
        model: User,
        key: "id"
    },
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

export default DirectMessage