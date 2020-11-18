const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "start",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame)
    if (game.currentPhase !== -1)
      return await message.author.send("Your game has started!")
    if (game.players.length < 4) 
      return await message.author.send("**There are insufficient players to start a game!**\nInvite your friends to join the game! You need a minimium of 4 players, but 6 or more is recommended")
    
    if (!QuickGames[QuickGames.indexOf(game)].startVotes) QuickGames[QuickGames.indexOf(game)].startVotes = []
    let votes = QuickGames[QuickGames.indexOf(game)].startVotes
    
    if (!QuickGames[QuickGames.indexOf(game)].startVotes.includes(message.author.id)) 
      QuickGames[QuickGames.indexOf(game)].startVotes.push(message.author.id)
    else
      await message.author.send(`You have already voted to start.`)
    fn.broadcastTo(
      client, game.players,
      `**${nicknames.get(message.author.id)}** voted to start! (${votes.length}/${game.players.length})\n` +
      "Do \`w!start\` if you want the game to start."
    )
    fn.addLog(game, `[ACTION] ${nicknames.get(message.author.id)} voted to start. (${votes.length}/${game.players.length})`)
    
    
    games.set("quick", QuickGames)
    
    if (QuickGames[QuickGames.indexOf(game)].startVotes.length == game.players.length)
      require('/home/utopium/wwou/process/start')(client, game)
  }
}