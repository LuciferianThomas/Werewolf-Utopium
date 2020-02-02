const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players")

module.exports = {
  name: "nickname",
  aliases: ["nick"],
  run: async (client, message, args) => {
    let player = players.get(message.author.id)
    
    
  }
}