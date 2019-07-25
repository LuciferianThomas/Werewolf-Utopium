const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

const configItem = ["prefix", "modlog", "botlog", "muteRole"]
const displayNames = {prefix: "Prefix", modlog: "Moderator Log", botlog: "Action Log", muteRole: "Muted Role"}

const configItems = [{
  name: "prefix",
  displayName: "Prefix",
  type: "string"
}, {
  name: "modlog",
  displayName: "Moderator Log",
  type: "channel"
}, {
  name: "botlog",
  displayName: "Action Log",
  type: "channel"
}, {
  name: "muteRole",
  displayName: "Muted Role",
  type: "role"
}, ]

module.exports = {
  name: "config",
  usage: "config [item] [set <newValue>]",
  description: "Get and set configuration of this server.",
  category: "Utility",
  guildPerms: ["ADMINISTRATOR"],
  run: async (client, message, args, shared) => {
    let guild = guildData.get(message.guild.id)
    
    if (!args.length) {
      let embed = new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setTitle(`Configuration | ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .setFooter(client.user.username, client.user.avatarURL)
      for (let i = 0; i < configItems.length; i++) embed.addField(`${configItems[i].displayName} [${configItems[i].name}]`,
                                                                  `${configItems[i].type == "channel" ? `<#${shared.guild[configItems[i].name]}>` :
                                                                     configItems[i].type == "role" ? `<@&${shared.guild[configItems[i].name]}>` :
                                                                     shared.guild[configItems[i].name]}`)
      return message.channel.send(embed)
    }
    
    if (args.length == 1) {
      let item = args[0]
      if (!configItems.includes(item)) return message.channel.send(fn.embed(client, {title: "Accepted Values", description: `${configItems.map(i => `\`${i}\``).join(', ')}`}))
      
      return message.channel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setTitle(`Configuration | ${message.guild.name}`)
          .setThumbnail(message.guild.iconURL)
          .addField(`${item} [${displayNames[item]}]`, `\`${shared.guild.prefix}\` ${client.user}`)
          .setFooter(client.user.username, client.user.avatarURL)
      )
    }
  }
}