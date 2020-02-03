const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "revive",
  aliases: ["rev"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Medium")
      return await message.author.send("You do not have the abilities to revive a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer revive a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and you cannot use your abilities!")
    
    if (gamePlayer.revUsed)
      return await message.author.send("You have already revived a player.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only revive on a player at night.")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (targetPlayer.alive)
      return await message.author.send("You cannot revive an alive player.")
    if (roles[targetPlayer.role].team !== "Village" && targetPlayer.role == "Headhunter")
      return await message.author.send("You can only revive villagers!")
    
    // game.players[gamePlayer.number-1].revUsed = true
    if (game.players.find(p => p.revive && p.revive.includes(gamePlayer.number))) {
      let prevRev = game.players.find(p => p.revive && p.revive.includes(gamePlayer.number)).number - 1
      game.players[prevRev].revive.splice(game.players[prevRev].revive.indexOf(gamePlayer.number),1)
    }
    if (!targetPlayer.revive) targetPlayer.revive = []
    targetPlayer.revive.push(gamePlayer.number)
    
    message.author.send(
      `${fn.getEmoji(client, "Medium Revive")
      } You selected **${target} ${nicknames.get(targetPlayer.id)}** to be revived.`
    )
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}