const Discord = require('discord.js'),
      moment = require('moment'),
      db = require('quick.db')

const config = require('./config.js'),
      fn = require('./fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA")

module.exports = (client) => {
  
  client.on('guildMemberAdd', member => {
    let log = guildData.get(`${member.guild.id}.botlog`)
    if (!log) return;
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle("Member Joined")
      .setThumbnail(member.user.displayAvatarURL)
      .addField("Member", `${member}`, true)
      .addField("Tag", member.user.tag, true)
      .addField("ID", member.id, true)
      .addField("Joined at", fn.date(member.joinedAt))
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    log.send(embed)
  })
  
  client.on('guildMemberRemove', member => {
    let log = guildData.get(`${member.guild.id}.botlog`)
    if (!log) return;
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle("Member Left")
      .setThumbnail(member.user.displayAvatarURL)
      .addField("Member", `${member}`, true)
      .addField("Tag", member.user.tag, true)
      .addField("ID", member.id, true)
      .addField("Joined at", fn.date(member.joinedAt))
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    log.send(embed)
  })
  
  client.on('messageUpdate', (oldMessage, newMessage) => {
    if (newMessage.channel.type != 'text') return;
    
    let log = guildData.get(`${newMessage.guild.id}.botlog`)
    if (!log) return;
    
    let embed = new Discord.RichEmbed()
      .setColor(config.embedColor)
      .setTitle("Message Edited")
      .addField("Before", oldMessage.content)
      .addField("After", newMessage.content)
      .addField("Sent by", `${newMessage.author}`, true)
      .addField("In channel", fn.date(member.joinedAt))
      .setFooter(client.user.username, client.user.avatarURL)
      .setTimestamp()
    
    log.send(embed)
  })
  
}