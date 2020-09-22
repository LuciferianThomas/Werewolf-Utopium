const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "inherit",
  aliases: ["copy"],
  gameroles: ["Doppelganger"],
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

    if (gamePlayer.role !== "Doppelganger")
      return await message.author.send("You cannot use this ability!")

    if (game.currentPhase !== 0)
      return await message.author.send("You can only select a player to inherit on the first night!")

    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")

    let targetPlayer = game.players[target - 1]
    
    
    message.author.send(
      `${fn.getEmoji(client, "Doppelganger")} You selected to inherit **${targetPlayer.number} ${
      nicknames.get(targetPlayer.id)}**'s role when they die!`
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected to inherit ${target} ${nicknames.get(
        game.players[target - 1].id
      )}'s role (${targetPlayer.role}).`
    )
    
    gamePlayer.selected = targetPlayer.number
    
    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}