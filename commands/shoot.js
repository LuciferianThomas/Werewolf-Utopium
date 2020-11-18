const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "shoot",
  aliases: ["execute"],
  gameroles: ["Gunner", "Jailer", "Marksman"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (!["Gunner","Jailer","Marksman"].includes(gamePlayer.role))
      return await message.author.send("You do not have the abilities to shoot a player.")
    if (gamePlayer.role !== "Jailer" && shared.commandName == "execute")
      return await message.author.send("Only the Jailer can execute their prisoners!")
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
      
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer shoot a player.")
    
    if (!gamePlayer.abil1)
      return await message.author.send("You have no more bullets.")
    
    if (gamePlayer.role == "Jailer" && (game.currentPhase % 3 != 0 || !game.players.find(p => p.jailed && p.alive)))
      return await message.author.send("You can only shoot on a player in jail at night.")
    
    if (gamePlayer.role == "Gunner" && (game.currentPhase == 1 || game.currentPhase % 3 == 0 || gamePlayer.shotToday))
      return await message.author.send("You cannot shoot right now.")
    
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (gamePlayer.role == "Marksman") {
      if (game.currentPhase == 0)
        return await message.author.send(
          "You can only mark a player on the first night!"
        )

      let target = gamePlayer.target
      if (!target)
        return await message.author.send(
          "Please use `w!mark` to mark a player first."
        )

      if ((gamePlayer.tgtAct || 999) > game.currentPhase)
        return await message.author.send(
          "You can only shoot your arrow next night or after!"
        )

      let targetPlayer = game.players[target - 1]
      if (roles[targetPlayer.role].team == "Village") {
        gamePlayer.alive = false
        if (game.config.deathReveal) gamePlayer.roleRevealed = gamePlayer.role

        fn.broadcastTo(
          client,
          game.players.filter(p => !p.left).map(p => p.id),
          `${fn.getEmoji(client, "Marksman_Shoot")} Marksman **${
            gamePlayer.number
          } ${nicknames.get(
            message.author.id
          )}** tried to shoot **${target} ${nicknames.get(targetPlayer.id)}**, but their shot backfired and killed themself!`
        )
        gamePlayer.roleRevealed = gamePlayer.role

        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
            gamePlayer.id
          )} tried to shoot ${targetPlayer.number} ${nicknames.get(
            targetPlayer.id
          )} (${
            targetPlayer.role
          }), but the shot backfired and killed themself instead!.`
        )
        game = fn.death(client, game, gamePlayer.number)
      } else {
        targetPlayer.alive = false
        if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
        
        fn.broadcastTo(
          client, game.players.filter(p => !p.left).map(p => p.id), 
          `${fn.getEmoji(client, "Marksman_Shoot")} Marksman shot **${target} ${nicknames.get(targetPlayer.id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""}**.`)
        targetPlayer.roleRevealed = targetPlayer.role
        
        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} shot ${
          targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
        )
        game = fn.death(client, game, targetPlayer.number)   
      }
        
      gamePlayer.abil1 -= 1
      game.lastDeath = game.currentPhase
      delete gamePlayer.target
      delete gamePlayer.tgtAct
    }
    else {
      let target = parseInt(args[0])
      if (gamePlayer.role == "Jailer") target = game.players.find(p => p.jailed && p.alive).number
      let targetPlayer = game.players[target-1]
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")
      if (!targetPlayer.alive)
        return await message.author.send("You cannot shoot a dead player.")
      if (target == gamePlayer.number)
        return await message.react(fn.getEmoji(client, "harold"))

      if (!gamePlayer.sect && targetPlayer.role == "President")
        return await message.author.send("You cannot shoot the President!")

      targetPlayer.alive = false
      if (gamePlayer.role == "Gunner") {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left).map(p => p.id), 
          `${fn.getEmoji(client, "Gunner_Shoot")} Gunner **${gamePlayer.number} ${nicknames.get(message.author.id)}** shot **${target} ${nicknames.get(targetPlayer.id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""}**.`)
        gamePlayer.roleRevealed = gamePlayer.role
      }
      if (gamePlayer.role == "Jailer") {
        fn.broadcastTo(
          client, game.players.filter(p => !p.left).map(p => p.id), 
          `${fn.getEmoji(client, "Gunner_Shoot")} Jailer executed his prisoner **${target} ${nicknames.get(targetPlayer.id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, targetPlayer.role)}` : ""}**.`)
        gamePlayer.killedTonight = true
        targetPlayer.killedBy = gamePlayer.number
      }

      fn.addLog(
        game,
        `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} shot ${
        targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
      )

      if (game.config.deathReveal) targetPlayer.roleRevealed = targetPlayer.role
      gamePlayer.abil1 -= 1
      game.lastDeath = game.currentPhase
      if (gamePlayer.role == "Gunner") gamePlayer.shotToday = true
      game = fn.death(client, game, targetPlayer.number)
    }
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}