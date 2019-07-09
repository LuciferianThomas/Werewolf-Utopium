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
    let target = message.author
    if (args[0]) target = fn.getUser(client, args[0])
    if (message.mentions.users.filter(user => user.id != client.user.id).size) target = message.mentions.users.filter(user => user.id != client.user.id).first()
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${target.tag} | Information`)
      .setThumbnail(target.displayAvatarURL)
      .addField(target.bot ? "Bot" : "User", `${target}`, true)
      .addField("Joined Discord", fn.formatDate(target.createdTimestamp), true)
      .addField('Current Status', `${target.presence.status.charAt(0).toUpperCase()}`, true)
      .addField('Current Activity', target.presence.game ? `${activities[target.presence.game.type]} ${target.presence.game.name}` : "None", true)
      .addField("Bot Staff", shared.user.botStaff ? "Yes" : "No" + '\n' + shared.user.blacklisted ? "Yes" : "No", true)
    
    message.channel.send(embed)
  }
}