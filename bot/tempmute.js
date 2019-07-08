const Discord = require('discord.js')
const db = require('quick.db')
const moment = require('moment')

const guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES"),
      config = require('./config.js'),
      fn = require('./fn.js')

module.exports = (client) => {
  client.on('ready', () => {
    setInterval(() => {
      let guilds = guildData.all()
        .filter(guild => JSON.parse(guild.data).tempmutes)
      for (var i = 0; i < guilds.length; i++) {
        let guildTMs = JSON.parse(guilds[i].data).tempmutes
        for (var j = 0; j < guildTMs.length; j++) {
          if (moment(guildTMs[j].unmute) > moment()) {
            let guild = client.guilds.get(guilds[i].ID)
            if (!guild) return;
            let muteRole = guild.roles.get(guildData.get(`${guilds[i].ID}.muteRole`))
            let member = guild.members.get(guildTMs[j].user)
            if (!muteRole || !member) return;
            member.removeRole(muteRole).then(() => {
              let modCase = new fn.ModCase(client, modCases.get(guild.id).length, "UNMUTE", member, client.user, "Auto")
              let embed = fn.modCaseEmbed(client, modCase)
              modCases.push(guild.id, modCase)
              
              member.user.send(fn.embed(client, `You have been unmuted on ${guild.name}!`))
              member.user.send(embed)
            }).catch(error => {})
          }
        }
      }
    }, 5*1000)
  })
}