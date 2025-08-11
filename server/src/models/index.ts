import { sequelize } from "../db/connect";
import Member from "./members.model";
import Channel from "./channel.model";
import Message from "./message.model";
import Server from "./server.model";
import User from "./user.model";

export const dbInit = async () => {

  // members.model.js
  User.hasMany(Server, { foreignKey: 'owner_id' });
  Server.belongsTo(User, { foreignKey: 'owner_id' });

  // server.model.js
  Server.hasMany(Channel, { foreignKey: 'server_id' });
  Channel.belongsTo(Server, { foreignKey: 'server_id' });

  // members.model.js
  User.hasMany(Member, { foreignKey: 'user_id' });
  Member.belongsTo(User, { foreignKey: 'user_id' });

  Server.hasMany(Member, { foreignKey: 'server_id' });
  Member.belongsTo(Server, { foreignKey: 'server_id' });

  // message.model.js
  User.hasMany(Message, { foreignKey: "user_id" })
  Message.belongsTo(User, { foreignKey: "user_id" })

  await sequelize.sync({ alter: true }); // auto-create/update tables
};