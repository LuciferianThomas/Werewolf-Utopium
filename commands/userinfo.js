const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

let activities = ['Playing', 'Streaming', 'Listening', 'Watching']

module.exports = {
  name: "userinfo",
  usage: "userinfo [user]",
  description: "User Information",
  category: "Utility",
  run: async (client, message, args, shared) => {
    let target = message.member
    if (args[0]) target = fn.getUser(client, args[0])
    if (message.mentions.members.filter(member => member.id != client.user.id).size) target = message.mentions.members.filter(member => member.id != client.user.id).first()
    
    let user = userData.get()
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${target.user.tag} | Information`)
      .setThumbnail(target.user.displayAvatarURL)
      .addField(target.bot ? "Bot" : "User", `${target}`, true)
      .addField("Joined Discord", fn.date(target.user.createdAt), true)
      .addField('Current Status', `${target.user.presence.status.toUpperCase()}`, true)
      .addField('Current Activity', target.user.presence.game ? `${activities[target.user.presence.game.type]} ${target.user.presence.game.name}` : "None", true)
      .addField(`${client.user.username} Tags`, shared.user.botStaff || shared.user.blacklisted ? (shared.user.botStaff ? "Bot Staff" : "" + '\n' + shared.user.blacklisted ? "Blacklsited" : "") : "None", true)
      .addField(`${client.user.username} Commands Used`, shared.user.commandsUsed, true)
      .addField(`Roles [${target.roles.size-1}]`, target.roles.map(r => `${r}`).slice(1).join(' '), true)
    
    message.channel.send(embed)
  }
}