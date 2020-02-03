const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

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
      return await message.author.send("You do not have the abilities to throw holy water at a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer throw holy water at a player.")
    
    if (!gamePlayer.bullets)
      return await message.author.send("You have used your holy water.")
        
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot throw holy water at an dead player.")
    if (targetPlayer.number == gamePlayer.number)
      return await message.author.send("You cannot throw holy water at yourself.")
    
    if (roles[targetPlayer.role].team == "Werewolves" && targetPlayer.role !== "Sorcerer") {
      targetPlayer.alive = false
      if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
      else targetPlayer.roleRevealed = "Fellow Werewolf"
      
      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `<:Priest_HolyWater:660491433253273630> Priest **${gamePlayer.number} ${
          nicknames.get(message.author.id)
        }** has thrown holy water at and killed **${targetPlayer.number} ${
          nicknames.get(targetPlayer.id)
        }${fn.getEmoji(
          client,
          game.config.deathReveal ? targetPlayer.role : "Fellow Werewolf"
        )}**.`
      )
      
      game = fn.death(client, game, targetPlayer.number)
    }
    else {
      gamePlayer.alive = false
      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `<:Priest_HolyWater:660491433253273630> Priest **${gamePlayer.number} ${
          nicknames.get(message.author.id)
        }** tried to throw holy water on **${targetPlayer.number} ${
          nicknames.get(targetPlayer.id)
        }** and killed themselves. They are not a werewolf!`
      )
      
      game = fn.death(client, game, gamePlayer.number)
    }
    gamePlayer.roleRevealed = gamePlayer.role
    gamePlayer.bullets = 0
    
    game.lastDeath = game.currentPhase
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}