const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    let logChannelID = guildData.get(`${newMember.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    // Check for given roles
    newMember.roles.forEach(role => {
      if (!oldMember.roles.find(r => r.id == role.id)) {
        return logChannel.send(
          new Discord.RichEmbed()
            .setColor(config.embedColor)
            .setAuthor("Role Given", newMember.guild.iconURL)
            .setIcon(newMember.user.displayAvatarURL)
            .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`, true)
            .addField("Role", `${role} (${role.name})`, true)
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp()
        )
      }
    })
    
    // Check for removed roles
    oldMember.roles.forEach(role => {
      if (!newMember.roles.find(r => r.id == role.id)) {
        return logChannel.send(
          new Discord.RichEmbed()
            .setColor(config.embedColor)
            .setAuthor("Role Removed", newMember.guild.iconURL)
            .setIcon(newMember.user.displayAvatarURL)
            .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`, true)
            .addField("Role", `${role} (${role.name})`, true)
            .setFooter(client.user.username, client.user.avatarURL)
            .setTimestamp()
        )
      }
    })
    
    if (oldMember.user.tag != newMember.user.tag) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("User Tag Updated")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .addField("Before", `${oldMember.user.tag}`, true)
        .addField("After", `${newMember.user.tag}`, true)
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
    
    if (oldMember.displayName != newMember.displayName) return logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Member Nickname Updated")
        .setIcon(newMember.user.displayAvatarURL)
        .addField(newMember.user.bot ? "Bot" : "User", `${newMember} (${newMember.user.tag})`)
        .addField("Before", `${oldMember.displayName}`, true)
        .addField("After", `${newMember.displayName}`, true)
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