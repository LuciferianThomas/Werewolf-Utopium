const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "config",
  usage: "config [item] [set <newValue>]",
  description: "User Information",
  category: "Utility",
  run: async (client, message, args, shared) => {
    
  }
}