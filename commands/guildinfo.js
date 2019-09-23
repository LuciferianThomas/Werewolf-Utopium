const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "guildinfo",
  usage: "guildinfo",
  description: "Guild Information",
  category: "Utility",
  aliases: ["serverinfo"],
  guildPerms: ["SEND_MESSAGES"],
  run: async (client, message, args, shared) => {
    let guild = message.guild
    if (shared.user.botStaff && args.length) guild = client.guilds.find(g => g.id == args[0] || g.name.toLowerCase().startsWith(args.join(' ').toLowerCase()))
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${guild} | Information`)
      .setThumbnail(guild.iconURL)
      .addField("Name", `${guild}`, true)
      .addField("Owner", `${guild.owner}`, true)
      .addField("Created", `${fn.date(guild.createdAt)}\n${fn.ago(guild.createdAt)}`, true)
      .addField("Joined", `${fn.date(guild.joinedAt)}\n${fn.ago(guild.joinedAt)}`, true)
      .addField(`Member${guild.members.size == 1 ? "" : "s"} [${guild.members.size}]`, `${guild.members.filter(member => !member.user.bot).size} Human${guild.members.filter(member => !member.user.bot).size == 1 ? "" : "s"} (${guild.members.filter(member => !member.user.bot && member.user.presence.status != 'offline').size} Online)\n${guild.members.filter(member => member.user.bot).size} Bot${guild.members.filter(member => member.user.bot).size == 1 ? "" : "s"}`, true)
      .addField(`Channel${guild.channels.size == 1 ? "" : "s"} [${guild.channels.size}]`, `${guild.channels.filter(channel => channel.type == 'text' || channel.type == 'news' || channel.type == 'store').size} Text Channel${guild.channels.filter(channel => channel.type == 'text' || channel.type == 'news' || channel.type == 'store').size == 1 ? "" : "s"}\n${guild.channels.filter(channel => channel.type == 'voice').size} Voice Channel${guild.channels.filter(channel => channel.type == 'voice').size == 1 ? "" : "s"}\n${guild.channels.filter(channel => channel.type == 'category').size} Categor${guild.channels.filter(channel => channel.type == 'category').size == 1 ? "y" : "ies"}`, true)
      .addField(`Role${guild.roles.size == 1 ? "" : "s"}${guild.channels.size <= 44 ? ` [${guild.roles.size}]` : ""}`, `${guild.roles.size <= 43 ? guild.roles.sort((a, b) => {if (a.position < b.position) return 1; if (a.position > b.position) return -1}).map(r => `${r}`).join(' ') : guild.roles.size - 1}`, true)
      .setFooter(`ID: ${guild.id} | ${client.user.username}`, client.user.avatarURL)
    
    message.channel.send(embed)
  }
}