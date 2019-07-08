const Discord = require('discord.js')
const db = require('quick.db')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
	name: "unmute",
	usage: "unmute <user> [reason]",
	description: "Unmute those who learnt their lessons.",
  category: "Moderation",
  botStaffOnly: false,
  guildPerms: ["KICK_MEMBERS"],
	run: async (client, message, args, shared) => {
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to mute."))
    
    if (target.highestRole.comparePositionTo(message.member.highestRole) >= 0) return message.channel.send(fn.embed(client, `You do not have permissions to unmute ${target.user.username}!`))
    if (!message.guild.members.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(fn.embed(client, `I do not have permissions to unmute ${target.user.username}!`))
    
    let muteRole = message.guild.roles.get(shared.guild.muteRole)
    if (!muteRole) {
      muteRole = message.guild.roles.find(role => role.name.toLowerCase().startsWith("mute")).first()
      if (!muteRole) return message.channel.send(fn.embed(client, `I cannot find a mute role, nor can I create one!`))
      guildData.set(`${message.guild.id}.muteRole`, muteRole.id)
    }
    
    let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
    
    let cases = []
    if (modCases.has(message.guild.id)) cases = modCases.get(message.guild.id)
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    let modCase = new fn.ModCase(client, cases.length+1, "UNMUTE", target, message.member, reason)
    let embed = fn.modCaseEmbed(client, modCase)
    
    if (!target.roles.has(muteRole.id)) return message.channel.send(fn.embed(client, `${target} is not muted!`))
    
    target.removeRole(muteRole).then(() => {
      modCases.push(message.guild.id, modCase)
      
      message.channel.send(fn.embed(client, `${target} has been unmuted!`))
      message.channel.send(embed)
      
      target.user.send(fn.embed(client, `You have been unmuted from ${message.guild.name}!`))
      target.user.send(embed).catch(error => message.channel.send(fn.embed(client, `I cannot DM ${target.user.tag}!`)))
      
      let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
        
      if (modlog) {
        modlog.send(embed)
          .catch(() => message.channel.send(fn.embed(client, `I cannot log in ${modlog}!`)))
      }
    }).catch(error => {
      message.channel.send(fn.error(client, `I was unable to remove ${muteRole} from ${target}!`))
    })
    
    return undefined
	}
}