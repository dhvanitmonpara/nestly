import { DataTypes } from "sequelize"
import { sequelize } from "../db/connect";

const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accent_color:{
    type: DataTypes.CHAR(6),
    defaultValue: "6a7282"
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  auth_type:{
    type: DataTypes.ENUM("oauth", "manual"),
    allowNull: false
  },
  refresh_token: {
    type: DataTypes.STRING,
  },
  display_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

export default User