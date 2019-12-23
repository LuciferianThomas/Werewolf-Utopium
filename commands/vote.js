const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

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
    
    if (gamePlayer.jailed)
      return await message.author.send("You cannot vote while in jail!")
    
    if (game.currentPhase % 3 == 0) {
      if (gamePlayer.role.includes("Werewolf") || 
          (gamePlayer.role == "Wolf Seer" && game.players.filter(player => player.alive && player.role.includes("Werewolf")).length == 0)) {
        let vote = parseInt(args[0])
        if (isNaN(vote) || vote > game.players.length || vote < 1)
          return await message.author.send("Invalid vote.")
        if (game.players[vote-1].role.toLowerCase().includes("wolf")) 
          return await message.author.send("You cannot vote a fellow werewolf.")
        if (!game.players[vote-1].alive) 
          return await message.author.send("You cannot vote a dead player.")
        game.players[gamePlayer.number-1].vote = vote
        
        let wolves = game.players.filter(p => p.role.toLowerCase().includes("wolf") && !p.jailed).map(p => p.id)
        for (var i = 0; i < wolves.length; i++) 
          client.users.get(wolves[i]).send(`${gamePlayer.number} voted ${vote}.`)
      } else 
        return await message.author.send("You cannot vote at night!")
    }
    
    if (game.currentPhase % 3 == 1) {
      message.author.send("There is currently nothing to vote for!")
    }
    
    if (game.currentPhase % 3 == 2) {
      let vote = parseInt(args[0])
      if (isNaN(vote) || vote > game.players.length || vote < 1)
        return await message.author.send("Invalid vote.")
      if (!game.players[vote-1].alive) 
        return await message.author.send("You cannot vote a dead player.")
      if (vote == gamePlayer.number) 
        return await message.author.send("You cannot vote yourself.")
      game.players[gamePlayer.number-1].vote = vote
      fn.broadcast(client, game, `${gamePlayer.number} voted ${vote}.`)
    }
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}