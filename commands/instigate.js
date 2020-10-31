const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "instigate",
  gameroles: ["Instigator"],
  aliases: ["inst","hate"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Instigator")
      return await message.author.send("You do not have the abilities to instigate players.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer instigate player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only instigate a player at night.")
    
    if (args.length < 2)
      return await message.author.send("You have to select two players.")
    
    let targetA = parseInt(args[0]),
        targetB = parseInt(args[1])
    if (isNaN(targetA) || targetA > game.players.length || targetA < 1 ||
        isNaN(targetB) || targetB > game.players.length || targetB < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[targetA-1].alive || !game.players[targetB-1].alive)
      return await message.author.send("You cannot detect on a dead player.")
    if (targetA == gamePlayer.number || targetB == gamePlayer.number)
      return await message.author.send("You cannot detect on yourself.")
    if (targetA == targetB)
      return await message.author.send("You need to select **__two different targets__** for our ability to work!")
    
    let targetPlayerA = game.players[targetA-1],
        targetPlayerB = game.players[targetB-1]

    message.channel.send(`You have instigated hate between **${targetPlayerA.number} ${nicknames.get(targetPlayerA.id)}** and **${targetPlayerB.number} ${nicknames.get(targetPlayerB.id)}**.`)
    fn.addLog( game,
      `[ACTION] Instigator ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} instigated hate between ${targetPlayerA.number} ${nicknames.get(
        targetPlayerA.id
      )} (${targetPlayerA.role}) and ${targetPlayerB.number} ${nicknames.get(
        targetPlayerB.id
      )} (${targetPlayerB.role}).`
    )
    gamePlayer.instigate = [targetPlayerA.number, targetPlayerB.number]
    // QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}