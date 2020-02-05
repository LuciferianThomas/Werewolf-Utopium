const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "mute",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Grumpy Grandma")
      return await message.author.send("You do not have the abilities to mute a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer mute a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase == 0 || game.currentPhase % 3 != 0)
      return await message.author.send("You cannot select to mute a player now!")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot mute an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot mute yourself.")
    
    if (!gamePlayer.sect && targetPlayer.role == "President")
      return await message.author.send("You cannot mute the President!")
    
    gamePlayer.usedAbilityTonight = target
    
    message.author.send(
      `${
        fn.getEmoji(client, "Grumpy Grandma Mute")
      } You selected **${target} ${
        nicknames.get(game.players[target - 1].id)
      }** to be muted the next day.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}