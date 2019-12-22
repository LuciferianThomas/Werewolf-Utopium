const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "start",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    console.log(player)
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame)
    if (game.players.length < 4) 
      return await message.author.send("**There are insufficient players to start a game!**\nInvite your friends to join the game!")
    
    if (!game.startVotes) game.startVotes = 0
    let votes = game.startVotes
    
    for (var i = 0; i < game.players.length; i++) {
      await client.users.get(game.players[i].id).send(`**${message.author.username}** voted to start! (${votes+1}/${game.players.length})\nDo \`w!start\` if you want the game to start.`)
    }
    
    QuickGames[QuickGames.indexOf(game)].startVotes += 1
    games.set("quick", QuickGames)
    //games.add(`${player.currentGame}.startVotes`, 1)
    
    //if (votes+1 == game.players.length)
  }
}