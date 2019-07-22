const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

module.exports = (client) => {
  client.on('guildMemberRemove', member => {
    let logChannelID = guildData.get(`${member.guild.id}.botlog`)
    let logChannel = client.channels.get(logChannelID)
    if (!logChannel) return;
    
    logChannel.send(
      new Discord.RichEmbed()
        .setColor(config.embedColor)
        .setAuthor("Member Left", member.guild.iconURL)
        .setIcon(member.user.displayAvatarURL)
        .addField(member.user.bot ? "Bot" : "User", `${member} (${member.user.tag})`, true)
        .addField("ID", member.id, true)
        .addField("Joined", fn.date(member.joinedTimestamp))
        .setFooter(client.user.username, client.user.avatarURL)
        .setTimestamp()
    )
  })
}