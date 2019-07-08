const Discord = require('discord.js')
const db = require('quick.db')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')
const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
	name: "unban",
	usage: "unban <user> [reason]",
	description: "Unban those who learnt their lessons.",
  category: "Moderation",
  botStaffOnly: false,
  guildPerms: ["BAN_MEMBERS"],
	run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please input the User ID of the user you want to unban."))
    
    message.guild.fetchBan(args[0]).then(({ user, reason }) => {
      message.guild.unban(user.id).then(() => {
        let modCase = new fn.ModCase(client, cases.length+1, "UNBAN", target, message.member, reason)
        let embed = fn.modCaseEmbed(client, modCase)
        
        modCases.push(message.guild.id, modCase)
        
        message.channel.send(fn.embed(client, `${user.tag} has been unbanned from ${message.guild.name}!`))
        message.channel.send(embed)
        
        if (shared.guild.modlog && message.guild.channels.get(shared.guild.modlog)) {
          message.guild.channels.get(shared.guild.modlog).send(embed)
            .catch(() => message.channel.send(fn.embed(client, `I cannot log in ${message.guild.channels.get(shared.guild.modlog)}!`)))
        } else if (shared.guild.modlog && message.guild.channels.get(shared.guild.modlog)) {
          message.channel.send(fn.embed(client, {title: `Your moderator log channel is invalid!`, description: `Please set a new moderator log channel with \`${shared.guild.prefix}setconfig modlog <#channel>\`.`}))
        }
        return undefined
      }).catch(error => {
        message.channel.send(fn.error(client, `I cannot unban ${user.tag}!`, error))
      })
    }).catch(error => {
      message.channel.send(fn.embed(client, `${args[0]} is not banned!`))
    })
    
    return;
    
/*		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target) target = fn.getMember(message.guild, args[0])
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
    
    target.user.send(fn.embed(client, `You have been banned from ${message.guild.name}!`))
    target.user.send(embed).catch(error => message.channel.send(fn.embed(client, `I cannot DM ${target.user.tag}!`))).then(() => {
      target.ban(reason).then(() => {
        message.channel.send(fn.embed(client, `${target.user.tag} has been banned from ${message.guild.name}!`))
        message.channel.send(embed)
        modCases.push(message.guild.id, modCase)
      }).catch(error => {
        fn.error(client, `I cannot `, error)
      })
    })
    
    
    return undefined */
	}
}