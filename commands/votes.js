const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "votes",
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
        .setDescription(
          game.players.filter(p => p.alive)
            .map(
              p =>
                `**${p.number} ${nicknames.get(p.id)}${
                  p.roleRevealed
                    ? ` ${fn.getEmoji(client, p.roleRevealed)}`
                    : ""
                }**${
                  p.vote
                    ? ` voted to lynch **${p.vote} ${
                        nicknames.get(game.players[p.vote - 1].id)
                      }**`
                    : " did not vote"
                }.`
            )
        )
    )
  }
}