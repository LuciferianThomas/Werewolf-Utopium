const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      tags = require("/home/utopium/wwou/util/tags.js")

module.exports = {
  name: "scratch",
  aliases: ["meow"],
  gameroles: ["Kitten Wolf"],
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

    if (gamePlayer.role !== "Kitten Wolf")
      return await message.author.send("Only the Kitten Wolf can turn a player into a Werewolf!")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer convert players into Werewolves.")
    if (!gamePlayer.abil1)
      return await message.author.send("You have already attempted to convert a player!")
    if (game.currentPhase % 3 !== 0)
      return await message.author.send("You can only convert a player to a Werewolf during the night!")
    if (gamePlayer.jailed)
      return await message.author.send("You cannot convert other players into Werewolves while in jail!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")

    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")

    let targetPlayer = game.players[target - 1]
    if (!targetPlayer.alive)
      return await message.author.send("You cannot convert a dead player into a Werewolf!")
    if (targetPlayer.number == gamePlayer.number)
      return await message.react(fn.getEmoji(client, "harold"))
    
    if (roles[targetPlayer.role].tag & tags.ROLE.SEEN_AS_WEREWOLF)
      return await message.author.send("This player is already a werewolf!")
    
    if (targetPlayer.role == "President")
      return await message.author.send("You cannot sect the president!")
    
    gamePlayer.killedTonight = true
    gamePlayer.usedAbilityTonight = targetPlayer.number
    
    message.author.send(
      `<:Kitten_Wolf_Convert:660813131718721546> You selected **${targetPlayer.number} ${
      nicknames.get(targetPlayer.id)}** to be converted into a werewolf!`
    )
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} selected ${
      targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) to be converted into a werewolf!`
    )
    
    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}