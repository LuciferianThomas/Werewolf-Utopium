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
    
    if (gamePlayer.role !== "Witch")
      return await message.author.send("You do not have the abilities to poison a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer reveal yourself.")
    
    if (gamePlayer.roleRevealed)
      return await message.author.send("Your mayorship has already been revealed!")
    
    if (game.currentPhase % 3 == 0)
      return await message.author.send("You cannot reveal yourself at night.")
    
    fn.broadcastTo(
      client, game.players.filter(p => !p.left).map(p => p.id), 
      `<:Mayor_Reveal:660495261042475036> **${gamePlayer.number} ${message.author.username}** revealed themselves as Mayor!.`)
    
    gamePlayer.roleRevealed = true
    gamePlayer.poisonUsed = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}