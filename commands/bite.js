const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "bite",
  aliases: ["zombify"],
  gameroles: ["Zombie"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame)
      return await message.author.send(
        "**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!"
      )

    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)

    if (gamePlayer.role !== "Zombie")
      return await message.author.send("You cannot use this ability!")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer bite players.")

    if (game.currentPhase % 3 !== 0)
      return await message.author.send("You can only sect a player during the night!")
    if (gamePlayer.jailed)
      return await message.author.send("You cannot bite other players while in jail!")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")

    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")

    let targetPlayer = game.players[target - 1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot bite a dead player!")
    if (targetPlayer.bitten)
      return await message.author.send("This player is already bitten!")
    if (targetPlayer.role == "Zombie") 
      return await message.channel.send("You can't bite other zombies!") 
    
    
    gamePlayer.killedTonight = true
    gamePlayer.usedAbilityTonight = targetPlayer.number
    
    message.author.send(
      `${fn.getEmoji(client, "Zombie_Bitten")} You selected **${targetPlayer.number} ${
      nicknames.get(targetPlayer.id)}** to be zombified!`
    )
    
    fn.addLog(
      game,
      `[ACTION] Zombie ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} chose to bite ${
        targetPlayer.role
      } ${
        targetPlayer.number
      } ${nicknames.get(targetPlayer.id)} so that they could be zombified.`
    )
    
    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}