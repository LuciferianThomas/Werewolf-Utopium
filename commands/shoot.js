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
    
    targetPlayer.alive = false
    if (gamePlayer.role == "Gunner") {
      fn.broadcastTo(
        client, game.players.filter(p => !p.left).map(p => p.id), 
        `<:Gunner_Shoot:660666399332630549> Gunner **${gamePlayer.number} ${message.author.username}** shot **${target} ${fn.getUser(client, targetPlayer.id).username}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""}**.`)
      game.players[gamePlayer.number-1].roleRevealed = true
    }
    if (gamePlayer.role == "Jailer")
      fn.broadcastTo(
        client, game.players.filter(p => !p.left).map(p => p.id), 
        `<:Gunner_Shoot:660666399332630549> Jailer executed his prisoner **${target} ${fn.getUser(client, targetPlayer.id).username}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""})**.`)
      
    if (["Junior Werewolf","Avenger"].includes(targetPlayer.role) && targetPlayer.avenge && game.players[targetPlayer.avenge].alive) {
      let avengedPlayer = game.players[targetPlayer.avenge-1]

      avengedPlayer.alive = false
      if (game.config.deathReveal) avengedPlayer.roleRevealed = avengedPlayer.role

      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `${fn.getEmoji(
          client,
          `${targetPlayer.role} Select`
        )} The ${targetPlayer.role.toLowerCase()}'s death has been avenged, **${
          avengedPlayer.number
        } ${fn.getUser(client, avengedPlayer.id).username}${
          game.config.deathReveal
            ? ` ${fn.getEmoji(client, avengedPlayer.role)}`
            : ""
        }** is dead!`
      )
    }
    
    if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
    game.players[gamePlayer.number-1].bullets -= 1
    game.lastDeath = game.currentPhase
    if (gamePlayer.role == "Gunner") game.players[gamePlayer.number-1].shotToday = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}