const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('channelCreate', async channel => {
    if (!channel.guild) return;
    let logChannelID = guildData.get(`${channel.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Channel Created", channel.guild.iconURL)
        .addField((channel.type == "text" || channel.type == "news" || channel.type == "store") ? "Text Channel" : channel.type == 'voice' ? "Voice Channel" : "Category", `${channel} (${channel.name})`, true)
        .addField("ID", channel.id, true)
        .addField("Created", fn.time(channel.createdTimestamp))
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}