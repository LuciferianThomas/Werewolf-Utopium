const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "config",
  usage: "config [item] [set <newValue>]",
  description: "Get and set configuration of this server.",
  category: "Utility",
  guildPerms: ["ADMINISTRATOR"],
  run: async (client, message, args, shared) => {
    let guild = guildData.get(message.guild.id)
    
    if (!args.length) {
      let allEmbed = new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setTitle(`Configuration | ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .addField("Prefix", `\`${guild.prefix} ${}`)
        .setFooter(client.user.username, client.user.avatarURL)
      return message.channel.send(allEmbed)
    }
  }
}