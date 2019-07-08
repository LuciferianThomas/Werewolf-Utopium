const Discord = require('discord.js')
const db = require('quick.db')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
	name: "ban",
	usage: "ban <user> [reason]",
	description: "Ban rule-breakers.",
  category: "Moderation",
  botStaffOnly: false,
  guildPerms: ["BAN_MEMBERS"],
	run: async (client, message, args, shared) => {
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to ban."))
    
    if (target.hasPermission("BAN_MEMBERS") || target.hasPermission("KICK_MEMBERS") || target.hasPermission("ADMINISTRATOR")) return message.channel.send(fn.embed(client, "You cannot ban a moderator!"))
    
    if (target.highestRole.comparePositionTo(message.member.highestRole) >= 0) return message.channel.send(fn.embed(client, `You do not have permissions to ban ${target.user.username}!`))
    if (!target.bannable) return message.channel.send(fn.embed(client, `I do not have permissions to ban ${target.user.username}!`))
    
    let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
    
    let cases = []
    if (modCases.has(message.guild.id)) cases = modCases.get(message.guild.id)
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    let modCase = new fn.ModCase(client, cases.length+1, "BAN", target, message.member, reason)
    let embed = fn.modCaseEmbed(client, modCase)
    
    target.user.send(fn.embed(client, `You have been banned from ${message.guild.name}!`), embed).then(() => {
      target.ban(reason).then(() => {
        message.channel.send(fn.embed(client, `${target.user.tag} has been banned from ${message.guild.name}!`), embed)
        modCases.push(message.guild.id, modCase)
      }).catch(error => {
        fn.error(client, error)
      })
    }).catch(error => {
      target.ban(reason).then(() => {
        message.channel.send(fn.embed(client, `I cannot DM ${target.user.tag}!`), fn.embed(client, `${target.user.tag} has been banned from ${message.guild.name}!`), embed)
        modCases.push(message.guild.id, modCase)
      }).catch(error => {
        fn.error(client, error)
      })
    })
	}
}