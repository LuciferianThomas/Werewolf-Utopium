const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn'),
      roles = require('/app/util/roles')

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
      return await message.author.send("You can only select to mute a player now!")
        
    game.frenzy = true
    
    fn.broadcastTo(
      client, game.players.filter(p => !p.left && roles[p.role].team == "Werewolves" && p.role != "Sorcerer")
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}