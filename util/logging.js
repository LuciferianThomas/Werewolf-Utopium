const Discord = require('discord.js'),
      fs = require('fs'),
      db = require('quick.db')

const guildData = new db.table("GUILDDATA")

module.exports = (client) => {
  let logs = fs.readdirSync('./logging').filter(file => file.endsWith(".js"))
  for (const file of logs) {
    let require(`./logging/${file}`)(client)
  }
}