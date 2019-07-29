const Discord = require('discord.js'),
      db = require('quick.db')

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
  guildPerms: ["BAN_MEMBERS"],
	run: async (client, message, args, shared) => {
    if (!args[0]) return message.channel.send(fn.embed(client, "Please mention the user you want to unban."))
    
    message.guild.fetchBan(args[0]).then(({ user }) => {
      let reason = args.slice(1).join(' ') || "Unspecified"
      
      message.guild.unban(user.id).then(() => {
        let cases = []
        if (modCases.has(message.guild.id)) cases = modCases.get(message.guild.id)
        
        let modCase = new fn.ModCase(client, cases.length+1, "UNBAN", user, message.member, reason)
        let embed = fn.modCaseEmbed(client, modCase)
        
        modCases.push(message.guild.id, modCase)
        
        message.channel.send(fn.embed(client, `${user.tag} has been unbanned from ${message.guild.name}!`))
        message.channel.send(embed)
    
        let modlog = message.guild.channels.find(channel => channel.id == shared.guild.modlog)
        
        if (modlog) {
          modlog.send(embed)
            .catch(() => message.channel.send(fn.embed(client, `I cannot log in ${modlog}!`)))
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