const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "vote",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (game.currentPhase % 3 != 2) return;
    
    message.author.send(
      new Discord.RichEmbed()
        .setTitle("Current Lynch Votes")
        .setDescription(game.players.filter(p => p.alive)
                          .map(p => `${p.number} ${client.users.get(p.id).username}${
                                    p.roleRevealed ? ` ${client.emojis.find(e => e.name == p.role.replace(/ /g, "_"))}` : ""}${
                                     p.vote ? ` voted to lynch ${p.vote} ${client.users.get(game.players[p.vote-1].id).username}` :
                                     "did not vote."}.`))
    )
  }
}