const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "revive",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Medium")
      return await message.author.send("You do not have the abilities to revive a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer revive a player.")
    
    if (gamePlayer.revUsed)
      return await message.author.send("You have already revived a player.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only revive on a player at night.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (game.players[target-1].alive)
      return await message.author.send("You cannot revive an alive player.")
    
    game.players[gamePlayer.number-1].revUsed = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}