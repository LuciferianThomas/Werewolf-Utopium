const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "game",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    message.author.send(
      new Discord.RichEmbed()
        .setTitle(`Game #${game.gameID}`)
        .addField(`Players [${game.players.length}]`, 
                  game.currentPhase == -1 ? game.players.map(p => client.users.get(p.id).username).join('\n') :
                  game.players
                    .map(p => 
                           `${p.alive ? "" : "*"}${p.number} ${client.users.get(p.id).username}${p.roleRevealed ? ` (${p.role})` : ""}${p.alive ? "" : "*"}`)
                    .join('\n')
                 )
        .addField(`Roles`, game.roles.join(', '))
    )
  }
}