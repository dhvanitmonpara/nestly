import { sequelize } from "../db/connect";
import Member from "./members.model";
import Channel from "./channel.model";
import Message from "./message.model";
import Server from "./server.model";
import User from "./user.model";
import DirectConversation from "./directConversation.model";
import DirectMessage from "./directMessage.model";

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

  // directConversation.model.js
  User.hasMany(DirectConversation, { foreignKey: 'user_id1' });
  User.hasMany(DirectConversation, { foreignKey: 'user_id2' });
  DirectConversation.belongsTo(User, { as: 'user1', foreignKey: 'user_id1' });
  DirectConversation.belongsTo(User, { as: 'user2', foreignKey: 'user_id2' });

  // directMessage.model.js
  DirectMessage.belongsTo(User, { foreignKey: "sender_id", as: "sender" })
  User.hasMany(DirectMessage, { foreignKey: "sender_id" })
  DirectMessage.belongsTo(DirectConversation, { foreignKey: "conversation_id" })
  DirectConversation.hasMany(DirectMessage, { foreignKey: "conversation_id" })

  await sequelize.sync({ alter: true }); // auto-create/update tables
};