const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "collect",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Fortune Teller")
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
    
    gamePlayer.box = []
    if (game.players.filter(p => p.boxed).length + args.length > 3) 
      return await message.author.send("You can only select three players!")
    else {
      for (var i = 0; i < args.length; i++) {
        let target = parseInt(args[i])
        if (isNaN(target) || target > game.players.length || target < 1) {
          message.author.send("Invalid target.")
          continue;
        }

        let targetPlayer = game.players[target-1]
        if (!targetPlayer.alive) {
          message.author.send("You cannot target an dead player.")
          continue;
        }
        if (target == gamePlayer.number) {
          message.author.send("You cannot target yourself.")
          continue;
        }
        
        gamePlayer.box.push(targetPlayer.number)
      }
    }
    
    
    
    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}