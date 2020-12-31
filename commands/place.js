const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "place",
  aliases: ["totem"], 
  gameroles: ["Totem Wolf"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    let target = parseInt(args[0])
    
    if (gamePlayer.role !== "Totem Wolf")
      return await message.author.send("You do not have the abilities to place a totem on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer place a totem on a player.")
    if (!gamePlayer.abil1)
      return await message.author.send("You have placed a totem twice already.")
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    if (gamePlayer.placed)
      return await message.author.send("You have already placed a totem tonight!")
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only place a totem during the night!")
    
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.channel.send("Invalid target!")
    
    let targetPlayer = game.players[target-1]
    
    if (!targetPlayer.alive) 
      return await message.channel.send("You cannot place a totem on a dead player!");
    if (targetPlayer.totem) 
      return await message.channel.send("That player already has a totem!");
    
    gamePlayer.toPlace = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(client, "Totem_Wolf_Totem")} You have placed a totem on **${targetPlayer.number} ${nicknames.get(targetPlayer.id)}**!`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} placed a totem on  (${targetPlayer.role})${targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
    )
    
    gamePlayer.abil1 -= 1
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}