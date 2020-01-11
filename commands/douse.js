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
    
    if (gamePlayer.role != "Arsonist")
      return await message.author.send("You do not have the abilities to douse a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer douse a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (typeof gamePlayer.usedAbilityTonight == "array") {
      let prevA = game.players[gamePlayer.dousedTonight[0]-1]
      let prevB = game.players[gamePlayer.dousedTonight[1]-1]
      prevA.doused.splice(prevA.doused.indexOf(gamePlayer.number), 1)
      prevB.doused.splice(prevB.doused.indexOf(gamePlayer.number), 1)
    }
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only douse players during the night!")
    
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
      .setAuthor(`Doused Players`, fn.getEmoji(client, "Arsonist").url)
      .setThumnail(fn.getEmoji(client, "Arsonist_Doused").url)
      .setDescription(
        `You have doused **${targetA} ${fn.getUser(client, targetPlayerA.id).username}** and **${targetA} ${fn.getUser(client, targetPlayerB.id).username}**!`
      )
    )

    targetPlayerA.doused.push(gamePlayer.number)
    targetPlayerB.doused.push(gamePlayer.number)
    gamePlayer.usedAbilityTonight = [targetA, targetB]
    //gamePlayer.usedAbilityTonight = true
    
    QuickGames[index] = game
    games.set("quick", QuickGames)
  }
} 