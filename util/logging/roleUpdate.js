const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('roleUpdate', async (oldRole, newRole) => {
    let logChannelID = guildData.get(`${newRole.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    if (oldRole.name != newRole.name) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Role Name Updated")
        .setIcon(newRole.guild.iconURL)
        .addField("Role", `${newRole} (${newRole.name})`)
        .addField("Before", `${oldRole.name}`, true)
        .addField("After", `${newRole.name}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldRole.color != newRole.color) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Role Color Updated")
        .setIcon(newRole.guild.iconURL)
        .addField("Role", `${newRole} (${newRole.name})`)
        .addField("Before", `${oldRole.hexColor}`, true)
        .addField("After", `${newRole.hexColor}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldRole.mentionable != newRole.mentionable) {
      if (newRole.mentionable) return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Role Mentionable")
          .setIcon(newRole.guild.iconURL)
          .addField("Role", `${newRole} (${newRole.name})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
      else return logChannel.send(
        new Discord.RichEmbed()
          .setColor(config.embedColor)
          .setAuthor("Role Unmentionable")
          .setIcon(newRole.guild.iconURL)
          .addField("Role", `${newRole} (${newRole.name})`)
          .setFooter(client.user.username, client.user.avatarURL)
          .setTimestamp()
      )
    }
    
    if (oldRole.permissions != newRole.permissions) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Role Permissions Updated")
        .setIcon(newRole.guild.iconURL)
        .addField("Role", `${newRole} (${newRole.name})`)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Role Updated")
        .setDescription("Something changed, but I'm not sure...")
        .addField("Role", `${newRole}`)
        .setIcon(newRole.guild.iconURL)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}