const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = (client) => {
  client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.author.bot || newMessage.channel.type == "dm") return;
    
    let logChannelID = guildData.get(`${newMessage.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Message Edited", newMessage.author.displayAvatarURL)
        .setDescription(`${newMessage.author} (${newMessage.author.tag}) edited a [message](${newMessage.url}) in ${newMessage.channel}.`)
        .addField("Before", oldMessage.content)
        .addField("After", newMessage.content)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}