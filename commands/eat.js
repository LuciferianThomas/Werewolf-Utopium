const Discord = require('discord.js'),
			moment = require('moment'),
      db = require('quick.db') 
          
const games = new db.table("Games"),
			players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames
      
const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "eat", 
  gameroles: ["Cannibal"],
  aliases: ["munch"], //lmao this is the best alias ever -shadow
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame)
      return await message.author.send("You are not currently in a game!\nDo `w!quick` to join a Quick game.")

    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Cannibal")
      return await message.author.send("You do not have the abilities to eat a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer eat a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your abilities.")
    
    if (args.length > gamePlayer.abil1)
      return await message.author.send(`You can only eat ${gamePlayer.abil1} player${gamePlayer.abil1 == 1 ? "" : "s"} tonight!`)
    
    let yummyHumans = []
    
    for (var target of args) {
      target = parseInt(target)
      if (isNaN(target) || target > game.players.length || target < 1) {
        await message.author.send("Invalid target.")
        continue;
      }
      let targetPlayer = game.players[target-1]
      if (!targetPlayer.alive) {
        await message.author.send(`**${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** is already dead!`)
        continue;
      }
      if (gamePlayer.number == targetPlayer.number) {
        await message.react(fn.getEmoji(client, "harold"))
        continue;
      }
      yummyHumans.push(targetPlayer)
    }
    
    if (!yummyHumans.length) return undefined;
    
    message.author.send(
    	`${fn.getEmoji(client, "Cannibal Eat")} You decided to eat ${yummyHumans.map(x => `**${x.number} ${nicknames.get(x.id)}**`).join(', ')}!`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} decided to eat ${yummyHumans
        .map(x => `${x.number} ${nicknames.get(x.id)} (${x.role})`)
        .join(", ")}.`
    )
    
    gamePlayer.usedAbilityTonight = yummyHumans.map(x => x.number)
    
    QuickGames[index] = game
    games.set("quick", QuickGames)
  } 
} 



