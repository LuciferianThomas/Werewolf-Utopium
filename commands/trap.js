const Discord = require("discord.js"),
  moment = require("moment"),
  db = require("quick.db")

const games = new db.table("Games"),
  players = new db.table("Players"),
  nicknames = new db.table("Nicknames")

const fn = require("/home/sd/wwou/util/fn.js"),
  roles = require("/home/sd/wwou/util/roles.js")

module.exports = {
  name: "trap",
  gameroles: ["Beast Hunter"],
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
    if (gamePlayer.role !== "Beast Hunter")
      return await message.author.send(
        "You do not have the abilities to make a trap."
      )
    if (!gamePlayer.alive)
      return await message.author.send(
        "You are dead. You can no longer make a trap."
      )

    if (game.currentPhase % 3 != 0)
      return await message.author.send(
        "You can only make a trap during the night."
      )
    if (gamePlayer.jailed)
      return await message.author.send(
        "You are currently jailed and cannot use your abilities."
      )
    if (gamePlayer.nightmared)
      return await message.author.send(
        "You are having a nightmare and cannot use your abilities!"
      )
    if (game.currentPhase >= 999)
      return await message.author.send(
        "The game is over! You can no longer use your actions."
      )

    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    let targetPlayer = game.players[target - 1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot trap a dead player.")
   // if (targetPlayer.number == gamePlayer.number)
   //   return await message.author.send("You cannot trap on yourself.")

    message.author.send(
      `${fn.getEmoji(
        client,
        "Beast_Hunter_TrapInactive"
      )} You have chosen to trap **${target} ${nicknames.get(targetPlayer.id)}**. Your trap will activate next night.`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} chose to trap ${targetPlayer.role} ${
        targetPlayer.number
      } ${nicknames.get(targetPlayer.id)}.`
    )

    gamePlayer.trap = target
    gamePlayer.trapAct = game.currentPhase + 3
    
    // QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}
