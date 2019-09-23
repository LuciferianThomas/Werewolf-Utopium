const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = (client) => {
  client.on('messageDelete', async message => {
    if (message.author.bot || message.channel.type == "dm") return;
    
    let logChannelID = guildData.get(`${message.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Message Deleted", message.author.displayAvatarURL)
        .setDescription(`Message by ${message.author} (${message.author.tag}) deleted in ${message.channel}.`)
        .addField("Content", message.content)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    ) 
  })
}