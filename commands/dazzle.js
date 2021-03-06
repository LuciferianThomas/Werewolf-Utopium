const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "dazzle",
  aliases: ["dazz"], 
  gameroles: ["Dazzler"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    let target = parseInt(args[0])
    
    if (gamePlayer.role !== "Dazzler")
      return await message.author.send("You do not have the abilities to dazzle a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer dazzle a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase % 3 == 0)
      return await message.author.send("You can only dazzle a player during the day!")
    if (gamePlayer.lastKill != game.currentPhase - 1 && gamePlayer.lastKill != game.currentPhase - 2)
      return await message.author.send("You can only dazzle on the day after you killed!")
    
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.channel.send("Invalid target!")
    
    let targetPlayer = game.players[target-1]
    
    if (!game.players[target-1].alive) 
      return await message.channel.send("You cannot dazzle a dead player!")
    if (gamePlayer.number == target)
      return await message.channel.send("You cannot dazzle yourself!")
    
    gamePlayer.dztarget = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(client, "Dazzler_Dazzle")} You have selected **${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** to be dazzled!`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected ${targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) to be dazzled on the next night.`
    )
    
    gamePlayer.abil1 -= 1
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}