const Discord = require('discord.js'),
      fs = require('fs'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

module.exports = (client) => {
  let loggingModules = fs.readdirSync('/app/util/logging').filter(file => file.endsWith(".js")), logs = {}
  for (const file of loggingModules) {
    require(`/app/util/logging/${file}`)(client)
  }
}