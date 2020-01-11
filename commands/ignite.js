const Discord = require("discord.js"),
    	moment = require("moment") ,
      db = require("quick.db") 

const games = new db.table("Games"),
      players = new db.table("Players") 

const roles = require('/app/util/roles')

const fn = require('/app/util/fn') 

module.exports = {
  name: 'ignite', 
  run: async (client, message, args, shared) => {
  let player = player.get(message.author.id)
  if (!player.currentGame)
    return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick game.")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == players.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Arsonist")
      return await message.author.send("You do not have the abilities to ignite players.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer ignite players.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (gamePlayer.usedAbilityTonight) {
      let prevA = game.players[gamePlayer.dousedTonight[0]-1]
      let prevB = game.players[gamePlayer.dousedTonight[1]-1]
      prevA.doused.splice(prevA.doused.indexOf(gamePlayer.number), 1)
      prevB.doused.splice(prevB.doused.indexOf(gamePlayer.number), 1)
    }
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only ignite players during the night!")
    
    let doused = game.players.filter(p => p.alive && p.doused.includes(gamePlayer.number))
    if (doused == 0)
      return await message.author.send("You haven't doused anyone or every doused player is dead! Do `w!douse [player1] [player 2]` first!") 
    
		let targetA = parseInt(args[0]),
        targetB = parseInt(args[1])
    if (isNaN(targetA) || targetA > game.players.length || targetA < 1 ||
       isNaN(targetB) || targetB > game.players.length || targetB < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[targetA-1].alive || !game.players[targetB-1].alive)
      return await message.author.send("You cannot douse dead players!")
    if (targetA == targetB) 
      return await message.author.send("You cannot douse the same player!")
    if (targetA == gamePlayer.number || targetB == gamePlayer.number)
      return await message.author.send("You cannot douse yourself.") 
    if (game.players[targetA-1].doused.includes(gamePlayer.number))
      return await message.author.send(`You doused **${game.players[targetA-1]} ${fn.getUser(client, game.players[targetA-1]).username}** already!`) 
    if (game.players[targetB-1].doused.includes(gamePlayer.number))
      return await message.author.send(`You doused **${game.players[targetB-1]} ${fn.getUser(client, game.players[targetB-1]).username}** already!`)
    
    let targetPlayerA = game.players[targetA-1],
        targetPlayerB = game.players[targetB-1]
    
    message.author.send(
    	new Discord.RichEmbed()
      ) 
    gamePlayer.usedAbilityTonight = true
    
    QuickGames[index] = game
    games.set("quick", QuickGames)
    
  }
} 