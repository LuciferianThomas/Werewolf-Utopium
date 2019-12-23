const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "shoot",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (!["Gunner","Jailer"].includes(gamePlayer.role))
      return await message.author.send("You do not have the abilities to shoot a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer shoot a player.")
    
    if (!gamePlayer.bullets)
      return await message.author.send("You have no more bullets.")
    
    if (gamePlayer.role == "Jailer" && (game.currentPhase % 3 != 0 || !game.players.find(p => p.jailed && p.alive)))
      return await message.author.send("You can only shoot on a player in jail at night.")
    
    if (gamePlayer.role == "Gunner" && (game.currentPhase == 1 || game.currentPhase % 3 == 0 || gamePlayer.shotToday))
      return await message.author.send("You cannot shoot right now.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot shoot an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot shoot yourself.")
    
    game.players[target-1].alive = false
    if (gamePlayer.role == "Gunner")
      fn.broadcast(client, game, `Gunner **${gamePlayer.number} ${message.author}** shot **${target} ${client.users.get(game.players[target-1].id).username}**.`)
    if (gamePlayer.role == "Jailer")
      fn.broadcast(client, game, `Jailer executed his prisoner **${target} ${client.users.get(game.players[target-1].id).username}**.`)
    
    game.players[gamePlayer.number-1].bullets -= 1
    if (gamePlayer.role == "Gunner") game.players[gamePlayer.number-1].shotToday = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}