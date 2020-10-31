const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "detect",
  gameroles: ["Detective"],
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
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
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
      return await message.author.send("You need to select **__two different targets__** for our ability to work!")
    
    let targetPlayerA = game.players[targetA-1],
        targetPlayerB = game.players[targetB-1]
    
    let roleA = roles[targetPlayerA.disguised ? "Illusionist" : targetPlayerA.enchanted ? "Wolf Shaman" : targetPlayerA.role], 
        roleB = roles[targetPlayerB.disguised ? "Illusionist" : targetPlayerB.enchanted ? "Wolf Shaman" : targetPlayerB.role]
    
    message.author.send(
      new Discord.MessageEmbed()
        .setAuthor(`Detection Results`, fn.getEmoji(client, "Detective").url)
        .setThumbnail(fn.getEmoji(client, roleA.team == roleB.team && roleA.team !== "Solo" ? "Detective_Equal" : "Detective_NotEqual").url)
        .setDescription(
          `**${targetA} ${nicknames.get(targetPlayerA.id)}** and **${targetB} ${nicknames.get(targetPlayerB.id)}**` +
          ` belong to ${roleA.team == roleB.team && roleA.team !== "Solo" ? "the same team" : "different teams"}.`
        )
    )
    
    game.players[gamePlayer.number-1].usedAbilityTonight = true
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} checked to see if ${targetPlayerA.number} ${nicknames.get(
        targetPlayerA.id
      )} (${targetPlayerA.role}) and ${targetPlayerB.number} ${nicknames.get(
        targetPlayerB.id
      )} (${
        targetPlayerB.role
      }) were on the same team. It turns out they belong to ${
        roleA.team == roleB.team && roleA.team !== "Solo"
          ? "the same team"
          : "different teams"
      }`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}