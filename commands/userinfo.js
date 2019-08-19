const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

let activities = ['Playing', 'Streaming', 'Listening', 'Watching']
let statuses = {online: "Online", idle: "Idle", dnd: "DND", offline: "Offline"}

module.exports = {
  name: "userinfo",
  usage: "userinfo [user]",
  description: "User Information",
  category: "Utility",
  run: async (client, message, args, shared) => {
    let target = message.member
    if (args[0]) target = fn.getMember(message.guild, args[0])
    if ([`<@${client.user.id}> `,`<@!${client.user.id}> `].includes(shared.prefix) && message.mentions.members.first().user.id == client.user.id) target = message.mentions.members.first(2)[1]
    else if (message.mentions.members.size) target = message.mentions.members.first()
    
    if (userData.has(target.user.id)) var user = userData.get(target.user.id)
    else var user = {botStaff: false, blacklisted: false, commandsUsed: 0}
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle(`${target.user.tag} | Information`)
      .setThumbnail(target.user.displayAvatarURL)
      .addField(target.user.bot ? "Bot" : "User", `${target}`, true)
      .addField("Joined Discord", fn.date(target.user.createdAt), true)
      .addField('Current Status', `${statuses[target.user.presence.status]}`, true)
      .addField('Current Activity', target.user.presence.game ? `${activities[target.user.presence.game.type]} ${target.user.presence.game.name}` : "None", true)
      .addField(`${client.user.username} Tags`, (user.botStaff || user.blacklisted) ? (user.botStaff ? "Bot Staff" : "" + '\n' + user.blacklisted ? "Blacklisted" : "") : "None", true)
      .addField(`${client.user.username} Commands Used`, user.commandsUsed, true)
      .setFooter(`ID: ${target.id} • ${client.user.username}`, client.user.avatarURL)
    if (target.roles.size > 1) embed.addField(`Role${target.roles.size == 2 ? "" : "s"} [${target.roles.size-1}]`, target.roles.sort((a, b) => {if (a.position < b.position) return 1; if (a.position > b.position) return -1}).map(r => `${r}`).slice(1).join(' '), true)
    
    message.channel.send(embed)
  }
}