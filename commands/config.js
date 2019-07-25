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
  usage: "config [item]\nconfig <item> reset\nconfig <item> set <newValue>",
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
      for (let i = 0; i < configItems.length; i++) embed.addField(`${configItems[i].displayName} [\`${configItems[i].name}\`]`,
                                                                  `${configItems[i].type == "channel" ? `<#${shared.guild[configItems[i].name]}>` :
                                                                     configItems[i].type == "role" ? `<@&${shared.guild[configItems[i].name]}>` :
                                                                     shared.guild[configItems[i].name]}`, true)
      return message.channel.send(embed)
    }
    
    if (args.length == 1) {
      let item = args[0]
      if (!configItems.map(i => i.name).includes(item)) return message.channel.send(fn.embed(client, {title: "Accepted Values", description: `${configItems.map(i => `\`${i.name}\``).join(', ')}`}))
      
      item = configItems.find(i => i.name == item)
      let embed = new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setTitle(`Configuration | ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .setFooter(client.user.username, client.user.avatarURL)
        .addField(`${item.displayName} [\`${item.name}\`]`,
                  `${item.type == "channel" ? `<#${shared.guild[item.name]}>` :
                     item.type == "role" ? `<@&${shared.guild[item.name]}>` :
                     shared.guild[item.name]}`)
      return message.channel.send(embed)
    }
    
    if (args.length == 2) {
      let item = args[0]
      if (!configItems.map(i => i.name).includes(item)) return message.channel.send(fn.embed(client, {title: "Accepted Values", description: `${configItems.map(i => `\`${i.name}\``).join(', ')}`}))
      if (args[1] != "reset") return message.channel.send(fn.embed(client, {title: "Usage", description: "`config [item]\nconfig <item> reset\nconfig <item> set <newValue>`"}))
      
      guildData.set(`${message.guild.id}.${item}`, null)
      let embed = new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setTitle(`Configuration | ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .setFooter(client.user.username, client.user.avatarURL)
        .addField(`${item.displayName} [\`${item.name}\`]`,
                  `${item.type == "channel" ? `<#${shared.guild[item.name]}>` :
                     item.type == "role" ? `<@&${shared.guild[item.name]}>` :
                     shared.guild[item.name]} > None set`)
      return message.channel.send(embed)
    }
    
    if (args.length == 3) {
      let item = args[0]
      if (!configItems.map(i => i.name).includes(item)) return message.channel.send(fn.embed(client, {title: "Accepted Values", description: `${configItems.map(i => `\`${i.name}\``).join(', ')}`}))
      if (args[1] != "set") return message.channel.send(fn.embed(client, {title: "Usage", description: "`config [item]\nconfig <item> reset\nconfig <item> set <newValue>`"}))
      
      let cfgItem = configItems.find(i => i.name == item)
      let newVal
      if (cfgItem.type == "channel") newVal = message.mentions.channels.filter(x => x.type == 'text').first()
      else if (cfgItem.type == "role")
      guildData.set(`${message.guild.id}.${item}`, null)
      let embed = new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setTitle(`Configuration | ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL)
        .setFooter(client.user.username, client.user.avatarURL)
        .addField(`${item.displayName} [\`${item.name}\`]`,
                  `${item.type == "channel" ? `<#${shared.guild[item.name]}>` :
                     item.type == "role" ? `<@&${shared.guild[item.name]}>` :
                     shared.guild[item.name]} > None set`)
      return message.channel.send(embed)
    }
  }
}