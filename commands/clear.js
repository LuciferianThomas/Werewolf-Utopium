const Discord = require("discord.js"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "clear",
  aliases: ["clr"],
  run: async (client, message, args) => {
    if (!client.guilds.get("522638136635817986").members.get(message.author.id).roles.find(r => r.name == "clr prm"))
      return undefined
    
    
  }
}