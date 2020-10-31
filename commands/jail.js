const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "jail",
  gameroles: ["Jailer"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Jailer")
      return await message.author.send("You do not have the abilities to jail a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer jail a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (gamePlayer.role == "Jailer" && game.currentPhase % 3 == 0)
      return await message.author.send("You can only select a player to be jailed during the day.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot jail a dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot jail yourself.")
    
    // if (!gamePlayer.sect && targetPlayer.role == "President")
    //   return await message.author.send("You cannot jail the President!")
    
    for (var i = 0; i < game.players.length; i++) game.players[i].jailed = false
    targetPlayer.jailed = true
    // targetPlayer.protectors.push(gamePlayer.number)
    message.author.send(
      `${fn.getEmoji(
        client, "Jailer Handcuffs"
      )} You selected ${target} ${nicknames.get(
        targetPlayer.id
      )} to be jailed.`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected ${target} ${nicknames.get(
        targetPlayer.id
      )} (${targetPlayer.role}) to be jailed.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}