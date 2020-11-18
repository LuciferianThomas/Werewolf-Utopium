const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "water",
  gameroles: ["Priest"],
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
    
    if (game.currentPhase % 3 == 0)
      return await message.author.send("You cannot throw holy water at night.")
    
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (!gamePlayer.abil1)
      return await message.author.send("You have used your holy water.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
        
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot throw holy water at a dead player.")
    if (targetPlayer.number == gamePlayer.number)
      return await message.author.send("You cannot throw holy water at yourself.")
    
    if (roles[targetPlayer.role].team == "Werewolves" && targetPlayer.role !== "Sorcerer") {
      targetPlayer.alive = false
      if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
      else targetPlayer.roleRevealed = "Fellow Werewolf"
      
      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `${fn.getEmoji(client, "Priest_HolyWater")} Priest **${gamePlayer.number} ${
          nicknames.get(message.author.id)
        }** has thrown holy water at and killed **${targetPlayer.number} ${
          nicknames.get(targetPlayer.id)
        }${fn.getEmoji(
          client,
          game.config.deathReveal ? targetPlayer.role : "Fellow Werewolf"
        )}**.`
      )
      fn.addLog(
        game,
        `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
          gamePlayer.id
        )} has thrown holy water at and killed ${
          targetPlayer.number
        } ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
      )
      
      game = fn.death(client, game, targetPlayer.number)
    }
    else {
      gamePlayer.alive = false
      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `${fn.getEmoji(client, "Priest_HolyWater")} Priest **${gamePlayer.number} ${
          nicknames.get(message.author.id)
        }** tried to throw holy water on **${targetPlayer.number} ${
          nicknames.get(targetPlayer.id)
        }** and killed themselves. They are not a werewolf!`
      )
      
      fn.addLog(
        game,
        `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
          gamePlayer.id
        )} tried to throw holy water on ${targetPlayer.number} ${nicknames.get(
          targetPlayer.id
        )} (${targetPlayer.role}) and killed themselves. ${targetPlayer.number} ${nicknames.get(
          targetPlayer.id
        )} is not a werewolf!`
      )
      
      gamePlayer.killedBy = targetPlayer.number
      
      game = fn.death(client, game, gamePlayer.number)
    }
    gamePlayer.roleRevealed = gamePlayer.role
    gamePlayer.abil1 -= 1
    
    game.lastDeath = game.currentPhase
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}