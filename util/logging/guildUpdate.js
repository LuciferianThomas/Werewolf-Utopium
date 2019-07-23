const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildUpdate', async (oldGuild, newGuild) => {
    let logChannelID = guildData.get(`${newGuild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    if (oldGuild.afkChannelID != newGuild.afkChannelID) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Guild AFK Channel Updated")
        .setIcon(newGuild.iconURL)
        .addField("Before", `${oldGuild.afkChannel}`, true)
        .addField("After", `${newGuild.afkChannel}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldGuild.afkTimeout != newGuild.afkTimeout) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Guild AFK Channel Updated")
        .setIcon(newGuild.iconURL)
        .addField("Before", `${oldGuild.afkTimeout / 60} minutes`, true)
        .addField("After", `${newGuild.afkTimeout / 60} minutes`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldMember.user.avatarURL != newMember.user.avatarURL) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Avatar Updated")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .addField("Before", `[Link](${oldMember.user.avatarURL})`, true)
        .addField("After", `[Link](${newMember.user.avatarURL})`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Updated")
        .setDescription("Something changed, but I'm not sure...")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}