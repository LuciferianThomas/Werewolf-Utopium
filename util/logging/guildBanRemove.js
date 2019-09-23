const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = (client) => {
  client.on('guildBanRemove', async (guild, user) => {
    let logChannelID = guildData.get(`${guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Unbanned", guild.iconURL)
        .setThumbnail(user.displayAvatarURL)
        .addField(user.bot ? "Bot" : "User", `${user} (${user.tag})`, true)
        .addField("ID", user.id, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}