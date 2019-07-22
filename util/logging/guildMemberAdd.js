const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js')

module.exports = (client) => {
  client.on('guildMemberAdd', member => {
    let logChannelID = guildData.get(`${member.guild.id}.botlogs`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Member Joined", member.guild.iconURL)
        .setIcon(member.user.avatarURL)
        .addField("Member", `${member} (${member.user.tag})`)
    )
  })
}