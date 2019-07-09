const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "userinfo",
  usage: "userinfo [user]",
  description: "User Information",
  category: "Utility",
  run: async (client, message, args, shared) => {
    let target = message.author
    if (message.mentions.users.filter(user => user.id != client.user.id).size) target = message.mentions.users.filter(user => user.id != client.user.id).first()
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${target.tag} | Information`)
  }
}