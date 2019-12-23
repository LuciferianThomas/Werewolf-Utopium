const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "vote",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer place votes.")
    
    if (game.currentPhase == 0) {
      if (gamePlayer.role.includes("Werewolf") || 
          (gamePlayer.role == "Wolf Seer" && game.players.filter(player => player.alive && player.role.includes("Werewolf")).length == 0)) {
        let vote = parseInt(args[0])
        if (isNaN(vote))
          return await message.author.send("Invalid vote.")
        if (game.players[vote-1].role.toLowerCase().includes("wolf")) 
          return await message.author.send("You cannot vote a fellow werewolf.")
        if (!game.players[vote-1].alive) 
          return await message.author.send("You cannot vote a dead player.")
        game.players[gamePlayer.number-1].vote = vote
      } else 
        return await message.author.send("You cannot vote at night!")
    }
    
    if (game.currentPhase == 2) {
      let vote = parseInt(args[0])
      if (isNaN(vote))
        return await message.author.send("Invalid vote.")
      if (!game.players[vote-1].alive) 
        return await message.author.send("You cannot vote a dead player.")
      if (vote == gamePlayer.number) 
        return await message.author.send("You cannot vote yourself.")
      game.player[gamePlayer.number-1].vote = vote
    }
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}