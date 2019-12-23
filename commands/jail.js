const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "jail",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Jailer")
      return await message.author.send("You do not have the abilities to jail a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer jail a player.")
    
    if (gamePlayer.role == "Jailer" && game.currentPhase % 3 == 0)
      return await message.author.send("You can only select a player to be your prisoner at day.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot jail an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot jail yourself.")
    
    for (var i = 0; i < game.players.length; i++) game.players[i].jailed = false
    game.players[target-1].jailed = true
    message.author.send(`You selected ${target} ${client.users.get(game.players[target-1].id).username} to be jailed.`)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}