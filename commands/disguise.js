const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "disguise",
  gameroles: ["Illusionist"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Illusionist")
      return await message.author.send("You do not have the abilities to disguise a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer disguise a player.")
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only select a player to be disguised at night!")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and you cannot use your abilities!")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot disguise a dead player.")
    if (target == gamePlayer.number)
      return await message.react(fn.getEmoji(client, "harold"))
    
    if (gamePlayer.deluded && gamePlayer.deluded.includes(targetPlayer.number))
      return await message.author.send(`You already disguised **${targetPlayer.number} ${nicknames.get(targetPlayer.id)}**!`)
    
    gamePlayer.usedAbilityTonight = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(client, "Illusionist Delude")
      } You selected to disguise the identity of **${target} ${nicknames.get(targetPlayer.id)}**.`
    )
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} disguised {
      targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}