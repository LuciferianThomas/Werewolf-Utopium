const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('channelUpdate', async (oldChannel, newChannel) => {
    let logChannelID = guildData.get(`${newChannel.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    if (oldChannel.name != newChannel.name) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Channel Name Updated")
        .setThumbnail(newChannel.guild.iconURL)
        .addField("Before", `${oldChannel.name}`, true)
        .addField("After", `${newChannel.name}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (newChannel.type == 'text' && oldChannel.topic != newChannel.topic) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Text Channel Topic Updated")
        .setThumbnail(newChannel.guild.iconURL)
        .addField("Before", `${oldChannel.topic}`, true)
        .addField("After", `${newChannel.topic}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (newChannel.type == 'text' && oldChannel.nsfw != newChannel.nsfw) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Text Channel NSFW Updated")
        .setThumbnail(newChannel.guild.iconURL)
        .addField("Before", `${oldChannel.nsfw ? "Yes" : "No"}`, true)
        .addField("After", `${newChannel.nsfw ? "Yes" : "No"}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (newChannel.type == 'text' && oldChannel.rateLimitPerUser != newChannel.rateLimitPerUser) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Text Channel Slowmode Updated")
        .setThumbnail(newChannel.guild.iconURL)
        .addField("Before", `${oldChannel.rateLimitPerUser} seconds`, true)
        .addField("After", `${newChannel.rateLimitPerUser} seconds`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (newChannel.type == 'voice' && oldChannel.bitrate != newChannel.bitrate) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Text Channel Topic Updated")
        .setThumbnail(newChannel.guild.iconURL)
        .addField("Before", `${oldChannel.bitrate}`, true)
        .addField("After", `${newChannel.bitrate}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}