const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "protect",
  aliases: ["heal"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Doctor" && shared.commandName == "heal") 
      return await message.author.send("You do not have the abilities to heal a player.")
    if (!["Doctor","Bodyguard","Tough Guy"].includes(gamePlayer.role))
      return await message.author.send("You do not have the abilities to protect a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer protect a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only protect a player at night.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot protect an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot protect yourself.")
    
    for (var i = 0; i < game.players.length; i++) {
      if (gamePlayer.role == "Bodyguard") game.players[target-1].bgProt = null
      else if (gamePlayer.role == "Doctor") game.players[target-1].docProt = null
    }
    if (gamePlayer.role == "Bodyguard") game.players[target-1].bgProt = gamePlayer.number
    else if (gamePlayer.role == "Doctor") game.players[target-1].docProt = gamePlayer.number
    
    message.author.send(`${gamePlayer.role == "Doctor" 
                          ? client.emojis.find(e => e.name == "Doctor_Protect" && e.guild.id == "658631194870677553")
                          : client.emojis.find(e => e.name == "Bodyguard_Shield" && e.guild.id == "658631194870677553")
                         } You selected ${target} ${client.users.get(game.players[target-1].id).username} to be protected.`)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}