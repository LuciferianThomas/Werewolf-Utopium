const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "delude",
  aliases: ["illusion", "illu"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Illusionist")
      return await message.author.send("You do not have the abilities to avenge on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer avenge on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and you cannot use your abilities!")
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only select a player to be deluded at night!")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot avenge on a dead player.")
    if (roles[gamePlayer.role].team == roles[targetPlayer.role].team == "Werewolves")
      return await message.author.send("You cannot avenge on your fellow werewolves!")
    
    gamePlayer.avenge = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(client, "Illusionist Delude")
      } You selected to delude the identity of **${target} ${nicknames.get(targetPlayer.id)}**.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}