const Discord = require('discord.js')
const db = require('quick.db')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
	name: "mute",
	usage: "mute <user> [reason]",
	description: "Mute rule-breakers.",
  category: "Moderation",
  botStaffOnly: false,
  guildPerms: ["KICK_MEMBERS"],
	run: async (client, message, args, shared) => {
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to mute."))
    
    if (target.hasPermission("BAN_MEMBERS") || target.hasPermission("KICK_MEMBERS") || target.hasPermission("ADMINISTRATOR")) return message.channel.send(fn.embed(client, "You cannot mute a moderator!"))
    
    if (target.highestRole.comparePositionTo(message.member.highestRole) >= 0) return message.channel.send(fn.embed(client, `You do not have permissions to mute ${target.user.username}!`))
    if (!message.guild.members.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(fn.embed(client, `I do not have permissions to mute ${target.user.username}!`))
    
    let muteRole = message.guild.roles.get(shared.guild.muteRole)
    if (!muteRole) {
      muteRole = message.guild.roles.find(role => role.name.toLowerCase().startsWith("mute"))
      if (!muteRole) muteRole = await message.guild.createRole({name: 'Muted', color: 0xa8a8a8}, `I was told to mute someone when there is no mute role!`)
      if (!muteRole) return message.channel.send(fn.embed(client, `I cannot find a mute role, nor can I create one!`))
      guildData.set(`${message.guild.id}.muteRole`, muteRole.id)
    }
    
    let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
    
    let cases = []
    if (modCases.has(message.guild.id)) cases = modCases.get(message.guild.id)
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    let modCase = new fn.ModCase(client, cases.length+1, "MUTE", target, message.member, reason)
    let embed = fn.modCaseEmbed(client, modCase)
    
    target.addRole(muteRole).then(() => {
      modCases.push(message.guild.id, modCase)
      
      target.user.send(fn.embed(client, `You have been muted from ${message.guild.name}!`))
      target.user.send(embed).catch(error => message.channel.send(fn.embed(client, `I cannot DM ${target.user.tag}!`)))
    })
    
    return undefined
	}
}