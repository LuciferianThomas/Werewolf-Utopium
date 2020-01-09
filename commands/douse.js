const Discord = require("discord.js"),
    	moment = require("moment") ,
      db = require("quick.db") 

const games = new db.table("Games"),
      players = new db.table("Players") 

const roles = require('/app/util/roles')

const fn = require('/app/util/fn') 

module.exports = {
  name: 'douse', 
  run: async (client, message, args, shared) => {
  let players = players.get(message.author.id)
  
  } 
} 