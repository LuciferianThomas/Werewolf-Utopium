const Discord = require('discord.js'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

module.exports = (client) => {
  client.on('guildMemberAdd', member => {
    let guild = guildData.get(member.guild.id)
  })
}