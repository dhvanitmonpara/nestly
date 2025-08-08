import { DataTypes } from "sequelize"
import { sequelize } from "../db/connect"
import User from "./user.model"
import Channel from "./channel.model"

const Message = sequelize?.define("messages", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
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

export default Message