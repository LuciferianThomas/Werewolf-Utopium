const Discord = require("discord.js"),
    	moment = require("moment") ,
      db = require("quick.db") 

const games = new db.table("Games"),
      players = new db.table("Players") 

const roles = require('/app/util/roles')

const fn = require('/app/util/fn') 

module.exports = {
  name: 'douse', 
  run: async (client, message, args, shared) => {
  let player = player.get(message.author.id)
  if (!player.currentGame)
    return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick game.")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == players.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role == "Arsonist")
      return await message.author.send("You do not have the abilities to douse a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    }   
} 