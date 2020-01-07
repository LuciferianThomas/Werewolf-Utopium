const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "water",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Priest")
      return await message.author.send("You do not have the abilities to shoot a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer shoot a player.")
    
    if (gamePlayer.waterUsed)
      return await message.author.send("You have used your holy water.")
        
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot shoot an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot shoot yourself.")
    
    let targetPlayer = game.players[target-1]
    if (roles[targetPlayer.role].team == "Werewolves") {
      game.players[target-1].alive = false
      if (game.config.deathReveal) game.players[target-1].roleRevealed = true
      fn.broadcastTo(
        client, game.players.filter(p => !p.left).map(p => p.id),
        `<:Priest_HolyWater:660491433253273630> Priest **${gamePlayer.number} ${message.author.username}** threw Holy Water at **${targetPlayer.number} ${fn.getUser(targetPlayer.id).username}**.`
      )
    }
    if (gamePlayer.role == "Jailer")
      fn.broadcast(client, game, `${client.emojis.find(e => e.name == "Gunner_Shoot")
                                  } Jailer executed his prisoner **${target} ${client.users.get(game.players[target-1].id).username}** (${game.players[target-1].role}).`)
    
    game.players[target-1].roleRevealed = true
    game.players[gamePlayer.number-1].bullets -= 1
    game.lastDeath = game.currentPhase
    if (gamePlayer.role == "Gunner") game.players[gamePlayer.number-1].shotToday = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}