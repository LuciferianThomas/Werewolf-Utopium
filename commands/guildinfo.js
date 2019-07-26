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
    let guild = message.guild
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${guild} | Information`)
      .setThumbnail(guild.iconURL)
      .addField("Name", `${guild}`, true)
      .addField("Owner", `${guild.owner}`, true)
      .addField("Created", fn.date(guild.createdAt), true)
      .addField("Joined", fn.date(guild.joinedAt), true)
      .addField(`Member${guild.members.size == 1 ? "" : "s"} [${guild.members.size}]`, `${guild.members.filter(member => !member.user.bot).size} Humans (${guild.presences.filter(presence => presence.status != 'offline').size} Online)\n${guild.members.filter(member => member.user.bot).size} Bots`, true)
      .addField(`Channel${guild.channels.size == 1 ? "" : "s"} [${guild.channels.size}]`, `${guild.channels.filter(channel => channel.type == 'text' || channel.type == 'news' || channel.type == 'store').size} Text Channels\n${guild.channels.filter(channel => channel.type == 'voice').size} Voice Channels\n${guild.channels.filter(channel => channel.type == 'category').size} Categories`, true)
      .addField(`Role{guild.channels.size - 1 == 1 ? "" : "s"}`, `${guild.channels.size - 1}]`, true)
      .addField(`${client.user.username} Commands Used`, user.commandsUsed, true)
    if (target.roles.size > 1) embed.addField(`Role${target.roles.size == 2 ? "" : "s"} [${target.roles.size-1}]`, target.roles.map(r => `${r}`).slice(1).join(' '), true)
    
    message.channel.send(embed)
  }
}