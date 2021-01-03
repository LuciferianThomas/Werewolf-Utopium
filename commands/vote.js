const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/home/sd/utopium/spyfall/util/fn')

module.exports = {
  name: "vote",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("spyfall"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer place votes.")
    
    
    if (game.currentPhase % 2 == 1) {
      if (!args[0]) return await message.author.send("Please select a player, or choose `cancel` to remove your vote!")
      if (args[0].toLowerCase() == "cancel") {
        gamePlayer.vote = null
        return await message.author.send("You have withdrawn your vote.")
      }
      
      let vote = parseInt(args[0])
      if (isNaN(vote) || vote > game.players.length || vote < 1)
        return await message.author.send("Invalid vote.")
      if (!game.players[vote-1].alive) 
        return await message.author.send("You cannot vote a dead player.")
      if (vote == gamePlayer.number) 
        return await message.author.send("You cannot vote yourself.")
      gamePlayer.vote = vote
      
      message.author.send(
        `You voted to lynch **${vote} ${
          game.players[vote-1].nickname
        }.`
      )
      
      if (!game.shade)
        fn.broadcastTo(
          client, game.players.filter(p => !p.left && p.number !== gamePlayer.number),
          `**${gamePlayer.number} ${gamePlayer.nickname} voted to lynch **${vote} ${
            game.players[vote-1].nickname
          }.`
        )
      
      // fn.addLog(
      //   game,
      //   `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} voted to lynch ${vote} ${
      //   nicknames.get(game.players[vote - 1].id)
      //   } (${game.players[vote - 1].role}).`)
    }
    else {
      
    }
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}