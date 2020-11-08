const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "mute",
  gameroles: ["Grumpy Grandma"],
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
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (gamePlayer.dazzled)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase == 0 || game.currentPhase % 3 != 0)
      return await message.author.send("You cannot select to mute a player now!")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot mute a dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot mute yourself.")
    
    if (!gamePlayer.sect && targetPlayer.role == "President")
      return await message.author.send("You cannot mute the President!")
    if (targetPlayer.number == gamePlayer.prevmute)
      return await message.author.send("You cannot mute the same player twice consecutively!")
    
    gamePlayer.usedAbilityTonight = target
    
    message.author.send(
      `${
        fn.getEmoji(client, "Grumpy Grandma Mute")
      } You selected **${target} ${
        nicknames.get(game.players[target - 1].id)
      }** to be muted the next day.`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected ${targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) to be muted the next day.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}