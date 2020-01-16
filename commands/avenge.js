const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "avenge",
  aliases: ["tag"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (!["Junior Werewolf","Avenger"].includes(gamePlayer.role))
      return await message.author.send("You do not have the abilities to avenge on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer avenge on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and you cannot use your abilities!")
    if (game.currentPhase == 0)
      return await message.author.send("You cannot select a player to be avenged on right now!")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot avenge on a dead player.")
    if (roles[gamePlayer.role].team == roles[targetPlayer.role].team == "Werewolves")
      return await message.author.send("You cannot avenge on your fellow werewolves!")
    
    gamePlayer.avenge = targetPlayer.number
    
    message.author.send(`${fn.getEmoji(client, gamePlayer.role == "Avenger" ? "Avenger Select" : "Junior Werewolf Select")
                        } You selected **${target} ${client.users.get(game.players[target-1].id).username}** to be avenged on when you die.`)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}