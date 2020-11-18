const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "shade",
  gameroles: ["Shadow Wolf"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Shadow Wolf")
      return await message.author.send("You do not have the abilities to activate shady voting.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer activate shady voting.")
    if (!gamePlayer.abil1)
      return await message.author.send("You have activated shady voting already.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    // if (game.currentPhase % 3 !== 0)
    //   return await message.author.send("You can only activate shady voting at night!")
        
    game.shade = true
    
    message.author.send(
      `${fn.getEmoji(client, "Shadow Wolf Shade")} You have activated shady voting for today!`
    )
    
    if (game.currentPhase % 3 !== 0)
      fn.broadcastTo(
        client, game.players.filter(p => p.alive && !p.left),
        new Discord.MessageEmbed()
          .setTitle("Shady Things")  
          .setThumbnail(fn.getEmoji(client, "Shadow Wolf Shade").url)
          .setDescription(
            `${fn.getEmoji(client, "Shadow Wolf")} Shadow Wolf manipulated today's voting!`
          )
      )
    
    gamePlayer.abil1 -= 1
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} manipulated voting!`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}