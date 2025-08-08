import { DataTypes } from "sequelize"
import User from "./user.model"
import Channel from "./channel.model"
import { sequelize } from "../db/connect"

const ChannelMembers = sequelize.define("channel-members", {
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
  channel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Channel,
        key: "id"
    }
  }
})

export default ChannelMembers