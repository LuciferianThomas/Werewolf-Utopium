const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "detect",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Detective")
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
      
    if (gamePlayer.usedAbilityTonight)
      return await message.author.send("You have already checked on a player tonight.")
    
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
      return await message.author.send("You cannot detect the same player.")
    
    let targetPlayerA = game.players[targetA-1],
        targetPlayerB = game.players[targetB-1]
    
    let roleA = roles[targetPlayerA.enchanted ? "Wolf Shaman" : targetPlayerA.role], 
        roleB = roles[targetPlayerB.enchanted ? "Wolf Shaman" : targetPlayerB.role]
    
    message.author.send(
      new Discord.RichEmbed()
        .setAuthor(`Detection Results`, fn.getEmoji(client, "Detective").url)
        .setThumbnail(fn.getEmoji(client, roleA.team == roleB.team && roleA.team !== "Solo" ? "Detective_Equal" : "Detective_NotEqual").url)
        .setDescription(
          `**${targetA} ${nicknames.get(targetPlayerA.id)}** and **${targetB} ${nicknames.get(targetPlayerB.id)}**` +
          ` belong to ${roleA.team == roleB.team && roleA.team !== "Solo" ? "the same team" : "different teams"}.`
        )
    )
    
    game.players[gamePlayer.number-1].usedAbilityTonight = true
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}