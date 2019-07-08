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
  moderatorOverride: true,
	run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please input the User ID of the user you want to unban."))
    
    message.guild.fetchBan(args[0]).then(({ user, reason }) => {
      message.guild.unban(user.id).then(() => {
        let cases = []
        if (modCases.has(message.guild.id)) cases = modCases.get(message.guild.id)
        
        let modCase = new fn.ModCase(client, cases.length+1, "UNBAN", user, message.member, reason)
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
    
    return undefined
	}
}