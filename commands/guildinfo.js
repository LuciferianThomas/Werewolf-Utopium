const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "guildinfo",
  usage: "guildinfo",
  description: "Guild Information",
  category: "Utility",
  guildPerms: ["SEND_MESSAGES"],
  run: async (client, message, args, shared) => {
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${message.guild} | Information`)
      .setThumbnail(message.guild.iconURL)
      .addField("Name", `${message.guild}`, true)
      .addField("Created", fn.date(message.guild.createdAt), true)
      .addField(`Member${message.guild.members.size == 1 ? "" : "s"} [${message.guild.members.size}]`, `${message.guild.members.size}\n${message.guild.members.filter(member => !member.user.bot).size} Humans (${message.guild.members.filter(member => !member.user.bot && member.user.presence.status == ).size})\n${message.guild.members.filter(member => member.user.bot).size} Bots`, true)
      .addField('Current Activity', target.user.presence.game ? `${activities[target.user.presence.game.type]} ${target.user.presence.game.name}` : "None", true)
      .addField(`${client.user.username} Tags`, (user.botStaff || user.blacklisted) ? (user.botStaff ? "Bot Staff" : "" + '\n' + user.blacklisted ? "Blacklisted" : "") : "None", true)
      .addField(`${client.user.username} Commands Used`, user.commandsUsed, true)
    if (target.roles.size > 1) embed.addField(`Role${target.roles.size == 2 ? "" : "s"} [${target.roles.size-1}]`, target.roles.map(r => `${r}`).slice(1).join(' '), true)
    
    message.channel.send(embed)
  }
}