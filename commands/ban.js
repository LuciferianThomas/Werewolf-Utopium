const Discord = require('discord.js')
const db = require('quick.db')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modcases = new db.table("MODCASES")

module.exports = {
	name: "ban",
	usage: "ban <user> [reason]",
	description: "Ban rule-breakers.",
  category: "Moderation",
  botStaffOnly: false,
  guildPerms: ["BAN_MEMBERS"],
	run: async (client, message, args, shared) => {
		let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
    
    let cases = []
    if (modcases.has(message.guild.id)) cases = modcases.get(message.guild.id)
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    
	}
}