const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "avenge",
  gameroles: ["Junior Werewolf", "Avenger"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (!["Junior Werewolf","Avenger"].includes(gamePlayer.role))
      return await message.author.send("You do not have this ability!")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead and can no longer use your abilities.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and you cannot use your abilities!")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase == 0 && gamePlayer.role == "Avenger")
      return await message.author.send("You cannot select a player to be avenged right now!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot avenge a dead player.")
    if (roles[gamePlayer.role].team == roles[targetPlayer.role].team == "Werewolves")
      return await message.author.send("You cannot avenge your fellow werewolves!")
    
    if (targetPlayer.number == gamePlayer.number)
      return await message.react(fn.getEmoji(client, "harold"))
    
    if (gamePlayer.role == "Avenger" && targetPlayer.role == "President")
      return await message.author.send("You cannot avenge the President!")
    
    gamePlayer.avenge = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(client, gamePlayer.role == "Avenger" ? "Avenger Select" : "Junior Werewolf Select")
      } You selected **${target} ${nicknames.get(targetPlayer.id)}** to be avenged on when you die.`
    )
                
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} selected to avenge on ${
      targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) when they die.`
    )
    
    games.set("quick", QuickGames)
  }
}