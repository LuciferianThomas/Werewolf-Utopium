const Discord = require('discord.js')
const db = require('quick.db')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

module.exports = {
	name: "ban",
	usage: "ban <user> [reason]",
	description: "Ban rule-breakers.",
  category: "Moderation",
  botStaffOnly: false,
  guildPerms: ["BAN_MEMBERS"],
	run: async (client, message, args, shared) => {
		
	}
}