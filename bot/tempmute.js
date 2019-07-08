const Discord = require('discord.js')
const db = require('quick.db')
const moment = require('moment')

const guildData = new db.table("GUILDDATA"),
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
            let muteRole = client.guilds.getguildData.get(`${guilds[i]}.muteRole`)
          }
        }
      }
    }, 5*1000)
  })
}