const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('messageDeleteBulk', async messages => {
    let logChannelID = guildData.get(`${messages.first().guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Messages Bulk Deleted", messages.first().guild.iconURL)
        .setDescription(`${messages.size} messages bulk deleted in ${messages.first().channel}.`)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    ) 
  })
}