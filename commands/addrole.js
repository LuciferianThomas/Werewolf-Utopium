const Discord = require('discord.js'),
      db = require('quick.db'),
      moment = require('moment')

const config = require('/app/bot/config.js'),
      fn = require('/app/bot/fn.js')

const userData = new db.table("USERDATA"),
      guildData = new db.table("GUILDDATA"),
      modCases = new db.table("MODCASES")

module.exports = {
  name: "addrole",
  usage: "addrole <user> <role1> [role2...]",
  description: "Give role to users.",
  category: "Utility",
  guildPerms: ["MANAGE_ROLES"],
  run: async (client, message, args, shared) => {
    // ...
    // command code
    // ...
    
    return;
  }
}