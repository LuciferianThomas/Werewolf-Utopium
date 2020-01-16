const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "avenge",
  aliases: ["tag"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Medium")
      return await message.author.send("You do not have the abilities to avenge on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer avenge on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and you cannot use your abilities!")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (game.players[target-1].alive)
      return await message.author.send("You cannot revive an alive player.")
    if (roles[game.players[target-1].role].team.includes("Village"))
      return await message.author.send("You can only revive villagers!")
    
    // game.players[gamePlayer.number-1].revUsed = true
    if (game.players.find(p => p.revive && p.revive.includes(gamePlayer.number))) {
      let prevRev = game.players.find(p => p.revive && p.revive.includes(gamePlayer.number)).number - 1
      game.players[prevRev].revive.splice(game.players[prevRev].revive.indexOf(gamePlayer.number),1)
    }
    if (!game.players[target-1].revive) game.players[target-1].revive = []
    game.players[target-1].revive.push(gamePlayer.number)
    
    message.author.send(`${client.emojis.find(e => e.name == "Medium_Revive")
                        } You selected **${target} ${client.users.get(game.players[target-1].id).username}** to be revived.`)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}