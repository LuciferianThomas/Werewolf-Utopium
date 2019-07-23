const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildBanAdd', async (guild, user) => {
    let logChannelID = guildData.get(`${guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Banned", guild.iconURL)
        .setIcon(user.displayAvatarURL)
        .addField(user.bot ? "Bot" : "User", `${user} (${user.tag})`, true)
        .addField("ID", user.id, true)
        .addField("Joined", fn.date(user.joinedTimestamp))
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}