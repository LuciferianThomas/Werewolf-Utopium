const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const roles = require('/app/util/roles')

const fn = require('/app/util/fn')

module.exports = {
  name: "givecards",
  aliases: ["givecard", "cards", "card"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.role.includes("Seer"))
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
      
    if (gamePlayer.usedAbilityTonight)
      return await message.author.send("You have already checked on a player tonight.")
    
    if (args.length == 1) {
      
    }
    else {
      let targetA = parseInt(args[0]),
          targetB = parseInt(args[1])
      if (isNaN(targetA) || targetA > game.players.length || targetA < 1 ||
          isNaN(targetB) || targetB > game.players.length || targetB < 1)
        return await message.author.send("Invalid target.")
      if (!game.players[targetA-1].alive || !game.players[targetB-1].alive)
        return await message.author.send("You cannot give cards to a dead player.")
      if (targetA == gamePlayer.number || targetB == gamePlayer.number)
        return await message.author.send("You cannot give cards to yourself.")
      if (targetA == targetB)
        return await message.author.send("You cannot give cards to the same player.")

      let targetPlayerA = game.players[targetA-1],
          targetPlayerB = game.players[targetB-1]
      
      if (!targetPlayerA.card) {
        
      }
      else {
        message.author.send(`**${targetPlayerA.number} ${fn.getUser(client, targetPlayerA.id).username}** already has a card!`)
      }

      game.players[gamePlayer.number-1].usedAbilityTonight = true

      QuickGames[index] = game

      games.set("quick", QuickGames)
    }
  }
}