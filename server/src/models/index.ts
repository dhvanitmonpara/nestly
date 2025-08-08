import { sequelize } from "../db/connect";
import ChannelMembers from "./channel-members.model";
import Channel from "./channel.model";
import Message from "./message.model";
import User from "./user.model";

export const dbInit = async () => {

  // channel-members.mode// user.model.js
  User.hasMany(Channel, { foreignKey: 'owner_id' });
  Channel.belongsTo(User, { foreignKey: 'owner_id' });

  // channel-members.model.js
  User.hasMany(ChannelMembers, { foreignKey: 'user_id' });
  ChannelMembers.belongsTo(User, { foreignKey: 'user_id' });

  Channel.hasMany(ChannelMembers, { foreignKey: 'channel_id' });
  ChannelMembers.belongsTo(Channel, { foreignKey: 'channel_id' });

  // message.model.js
  User.hasMany(Message, {foreignKey: "user_id"})
  Message.belongsTo(User, {foreignKey: "user_id"})

  await sequelize.sync({ alter: true }); // auto-create/update tables
};