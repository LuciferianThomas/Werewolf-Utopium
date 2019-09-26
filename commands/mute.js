const Discord = require('discord.js'),
      db = require('quick.db')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
	name: "mute",
	usage: "mute <user> [reason]",
	description: "Mute rule-breakers.",
  category: "Moderation",
  aliases: ["smute"],
  guildPerms: ["KICK_MEMBERS"],
	run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please mention the user you want to mute."))
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
    if (!target) return message.channel.send(fn.embed(client, "Please mention the user you want to mute."))
    
    if (target.hasPermission("BAN_MEMBERS") || target.hasPermission("KICK_MEMBERS") || target.hasPermission("ADMINISTRATOR") && message.guild.ownerID != message.author.id) return message.channel.send(fn.embed(client, "You cannot mute a moderator!"))
    
    if (target.highestRole.comparePositionTo(message.member.highestRole) >= 0 && message.guild.ownerID != message.author.id) return message.channel.send(fn.embed(client, `You do not have permissions to mute ${target.user.username}!`))
    if (!message.guild.members.get(client.user.id).hasPermission("MANAGE_ROLES")) return message.channel.send(fn.embed(client, `I do not have permissions to mute ${target.user.username}!`))
    
    let muteRole = message.guild.roles.get(shared.guild.muteRole)
    if (!muteRole) {
      muteRole = message.guild.roles.find(role => role.name.toLowerCase().startsWith("mute")).first()
      if (!muteRole) {
        muteRole = await message.guild.createRole({name: 'Muted', color: 0xa8a8a8}, `I was told to mute someone when there is no mute role!`)
        message.channel.send(fn.embed(client, {title: `I cannot find a mute role, so I made one for you!`, description: `${muteRole}`}))
      }
      if (!muteRole) return message.channel.send(fn.embed(client, `I cannot find a mute role, nor can I create one!`))
      guildData.set(`${message.guild.id}.muteRole`, muteRole.id)
    }
    
    if (target.roles.has(muteRole.id)) return message.channel.send(fn.embed(client, `${target} is already muted!`))
    
    let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
    
    let cases = []
    if (modCases.has(message.guild.id)) cases = modCases.get(message.guild.id)
    
    let reason = args.slice(1).join(' ') || "Unspecified"
    
    let modCase = new fn.ModCase(client, cases.length+1, "MUTE", target, message, reason)
    let embed = fn.modCaseEmbed(client, modCase)
    
    target.addRole(muteRole).then(() => {
      modCases.push(message.guild.id, modCase)
        
      console.log(`${message.guild.name} | Muted ${target.user.tag} (${target.user.id})`)

      if (shared.commandName != "smute") {
        message.channel.send(fn.embed(client, `${target} has been muted!`))
        message.channel.send(embed)
      }
      
      target.user.send(fn.embed(client, `You have been muted from ${message.guild.name}!`))
      target.user.send(embed).catch(error => message.channel.send(fn.embed(client, `I cannot DM ${target.user.tag}!`)))
      
      let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
        
      if (modlog) {
        modlog.send(embed)
          .catch(() => message.channel.send(fn.embed(client, `I cannot log in ${modlog}!`)))
      }
    }).catch(error => {
      message.channel.send(fn.error(client, `I was unable to give ${muteRole} to ${target}!`))
    })
    
    return undefined
	}
}