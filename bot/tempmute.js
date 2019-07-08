const Discord = require('discord.js')
const db = require('quick.db')

const guildData = new db.table("GUILDDATA"),
      config = require('./config.js'),
      fn = require('./fn.js')

module.exports = (client) => {
  client.on('ready', () => {
    setInterval(() => {
      
    }, 5*1000)
  })
}