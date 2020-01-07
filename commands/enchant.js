const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "enchant",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer place votes.")
    
    if (game.currentPhase % 3 == 0) 
      return await message.author.send("You can only enchant a player at day!")
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    if (!game.players[target-1].alive) 
      return await message.author.send("You cannot target a dead player.")
    if (target == gamePlayer.number) 
      return await message.author.send("You cannot target yourself.")

    if (game.players.find(p => p.enchanted && p.enchanted.includes(gamePlayer.number))) {
      let prevRev = game.players.find(p => p.enchanted && p.enchanted.includes(gamePlayer.number)).number - 1
      game.players[prevRev].enchanted.splice(game.players[prevRev].enchanted.indexOf(gamePlayer.number),1)
    }
    
    game.players[target-1].enchanted.push(gamePlayer.number)
    
    message.author.send(`${fn.getEmoji(client, "Wolf_Shaman_Select")
                        } You selected **${target} ${client.users.get(game.players[target-1].id).username}** to be enchanted at night.`)
    
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}