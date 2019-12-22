const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "start",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    let game = games.get(player.currentGame)
    if (!game.startVotes)
    
  }
}