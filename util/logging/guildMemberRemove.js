const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildMemberRemove', async member => {
    let logChannelID = guildData.get(`${member.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (logChannel) {
      logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Left", member.guild.iconURL)
          .setThumbnail(member.user.displayAvatarURL)
          .addField(member.user.bot ? "Bot" : "User", `${member} (${member.user.tag})`, true)
          .addField("ID", member.id, true)
          .addField("Joined", fn.time(member.joinedTimestamp))
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
    }
    
    let memberLogID = guildData.get(`${member.guild.id}.memberlog`)
    let memberLog = client.channels.get(memberLogID)
    if (memberLog) {
      memberLog.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Left", member.guild.iconURL)
          .setThumbnail(member.user.displayAvatarURL)
          .addField(member.user.bot ? "Bot" : "User", `${member} (${member.user.tag})`, true)
          .addField("ID", member.id, true)
          .addField("Joined", fn.time(member.joinedTimestamp))
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
    }
  })
}