const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "stab",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Serial Killer")
      return await message.author.send("You do not have the abilities to kill a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer kill a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only protect a player at night.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (!game.players[target-1].alive)
      return await message.author.send("You cannot kill an dead player.")
    if (target == gamePlayer.number)
      return await message.author.send("You cannot kill yourself.")
    
    if (targetPlayer.role == "President")
      return await message.author.send("You cannot stab the President!")
    
    gamePlayer.usedAbilityTonight = target
    message.author.send(
      `<:Serial_Killer_Knife:660823278902050826> You selected to stab **${target} ${
        nicknames.get(game.players[target - 1].id)
      }**.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}