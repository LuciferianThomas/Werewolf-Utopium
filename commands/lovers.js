const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

module.exports = {
  name: "lovers",
  aliases: ["couple"],
  gameroles: ["Cupid"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Cupid")
      return await message.author.send("You do not have the abilities to make a player fall in love.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer make players fall in love.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only make players fall in love during the night!")
    
    let targetA = parseInt(args[0]),
        targetB = parseInt(args[1])
    if (isNaN(targetA) || targetA > game.players.length || targetA < 1 ||
        isNaN(targetB) || targetB > game.players.length || targetB < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[targetA-1].alive || !game.players[targetB-1].alive)
      return await message.author.send("You cannot make a dead player fall in love.")
    if (targetA == gamePlayer.number || targetB == gamePlayer.number)
      return await message.author.send("You cannot make yourself fall in love.")
    if (targetA == targetB)
      return await message.author.send("You have to select different players to fall in love!")
    
    let targetPlayerA = game.players[targetA-1],
        targetPlayerB = game.players[targetB-1]
    
    gamePlayer.usedAbilityTonight = [targetPlayerA.number, targetPlayerB.number]
    message.channel.send(
      new Discord.MessageEmbed()
        .setTitle("Couple in Love")
        .setThumbnail(fn.getEmoji(client, "Cupid Lovers").url)
        .setDescription(`You have selected **${targetA} ${nicknames.get(targetPlayerA.id)})** and **${targetB} ${nicknames.get(targetPlayerB.id)})**`)
    )
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected ${targetA} ${nicknames.get(targetPlayerA.id)}) (${targetPlayerA.role}) and ${targetB} ${nicknames.get(targetPlayerB.id)} (${targetPlayerB.role}) to be lovers.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}