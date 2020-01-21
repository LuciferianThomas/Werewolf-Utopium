const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "sect",
  run: async (client, message, args, shared) => { return;
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Sect Leader")
      return await message.author.send("Only the Sect Leader can turn a player into your sect!")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer sect players.")
    
    if (game.currentPhase % 3 !== 0)
      return await message.author.send("You can only sect a player at night!")
    if (gamePlayer.jailed)
      return await message.author.send("You cannot vote while in jail!")
    
    
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}