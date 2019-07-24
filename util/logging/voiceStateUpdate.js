const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    let logChannelID = guildData.get(`${newMember.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;if (oldMember.deaf != newMember.deaf) {
      if (newMember.deaf) return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Deafened")
          .setThumbnail(newMember.user.displayAvatarURL)
          .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
      else return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Undeafened")
          .setThumbnail(newMember.user.displayAvatarURL)
          .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
    }
    
    if (oldMember.mute != newMember.mute) {
      if (newMember.mute) return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Muted")
          .setThumbnail(newMember.user.displayAvatarURL)
          .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
      else return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Member Unmuted")
          .setThumbnail(newMember.user.displayAvatarURL)
          .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
    }
    
    // if (oldMember.voiceChannel && !newMember.voiceChannel) return logChannel.send(
    //   new Discord.RichEmbed()
    //     .setColor(config.embedColor)
    //     .setAuthor("Member Unmuted")
    //     .setThumbnail(newMember.user.displayAvatarURL)
    //     .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
    //     .setFooter(client.user.username, client.user.avatarURL)
    //     .setTimestamp()
    // )
  })
}