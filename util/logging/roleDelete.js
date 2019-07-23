const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('roleDelete', async role => {
    let logChannelID = guildData.get(`${role.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Role Deleted")
        .setIcon(role.guild.iconURL)
        .addField("Role", `${role} (${role.name})`, true)
        .addField("ID", role.id, true)
        .addField("Created", fn.date(role.createdTimestamp))
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}