const Discord = require('discord.js')
const db = require('quick.db')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')
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
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) return fn.send(client, message, "Please mention the user you want to ban.")
    
    if (target.hasPermission("BAN_MEMBERS") || target.hasPermission("KICK_MEMBERS") || target.hasPermission("ADMINISTRATOR")) return fn.send(client, message, "You cannot ban a moderator!")
    
    if (target.highestRole.comparePositionTo(message.member.highestRole) >= 0) return fn.send(message, `You do not have permissions to ban ${target.user.username}!`)
    if (!target.bannable) return fn.send(message, `I do not have permissions to ban ${target.user.username}!`)
    
    let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
    
    let cases = []
    if (modcases.has(message.guild.id)) cases = modcases.get(message.guild.id)
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    let modCase = new fn.modCase(cases.length+1, "BAN", target, message.member, reason)
    let embed = fn.modCaseEmbed(modCase)
    
    fn.dm(target, `You have been banned from ${message.guild.name}!`)
	}
}