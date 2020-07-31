const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "watch",
  gameroles: ["Sheriff"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Sheriff")
      return await message.author.send("You do not have the abilities to watch a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer watch a player.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only watch a player during the night.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    let target = parseInt(args[0])
    let targetPlayer = game.players[target-1]
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot watch a dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot watch on yourself.")
    
    message.author.send(
      `${fn.getEmoji(client, "Sheriff")
      } You have chosen to watch **${target} ${nicknames.get(targetPlayer.id)}**.`
    )
    
    gamePlayer.usedAbilityTonight = target
    
    fn.addLog(
      game,
      `[ACTION] Sheriff ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} decided to watch ${
        targetPlayer.number
      } ${nicknames.get(targetPlayer.id)} (${
        targetPlayer.role
      }).`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}