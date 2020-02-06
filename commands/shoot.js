const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "shoot",
  aliases: ["execute"],
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
    if (gamePlayer.role !== "Jailer" && shared.commandName == "execute")
      return await message.author.send("Only the Jailer can execute their prisoners!")
      
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer shoot a player.")
    
    if (!gamePlayer.bullets)
      return await message.author.send("You have no more bullets.")
    
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (gamePlayer.role == "Jailer" && (game.currentPhase % 3 != 0 || !game.players.find(p => p.jailed && p.alive)))
      return await message.author.send("You can only shoot on a player in jail at night.")
    
    if (gamePlayer.role == "Gunner" && (game.currentPhase == 1 || game.currentPhase % 3 == 0 || gamePlayer.shotToday))
      return await message.author.send("You cannot shoot right now.")
    
    let target = parseInt(args[0])
    if (gamePlayer.role == "Jailer") target = game.players.find(p => p.jailed && p.alive).number
    let targetPlayer = game.players[target-1]
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!targetPlayer.alive)
      return await message.author.send("You cannot shoot an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot shoot yourself.")
    
    if (!gamePlayer.sect && targetPlayer.role == "President")
      return await message.author.send("You cannot shoot the President!")
    
    targetPlayer.alive = false
    if (gamePlayer.role == "Gunner") {
      fn.broadcastTo(
        client, game.players.filter(p => !p.left).map(p => p.id), 
        `<:Gunner_Shoot:660666399332630549> Gunner **${gamePlayer.number} ${nicknames.get(message.author.id)}** shot **${target} ${nicknames.get(targetPlayer.id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""}**.`)
      gamePlayer.roleRevealed = gamePlayer.role
    }
    if (gamePlayer.role == "Jailer") {
      fn.broadcastTo(
        client, game.players.filter(p => !p.left).map(p => p.id), 
        `<:Gunner_Shoot:660666399332630549> Jailer executed his prisoner **${target} ${nicknames.get(targetPlayer.id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""})**.`)
      gamePlayer.killedTonight = true
    }
    
    if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
    gamePlayer.bullets -= 1
    game.lastDeath = game.currentPhase
    if (gamePlayer.role == "Gunner") gamePlayer.shotToday = true
    game = fn.death(client, game, targetPlayer.number)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}