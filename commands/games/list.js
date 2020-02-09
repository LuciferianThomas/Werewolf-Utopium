const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "list",
  run: async (client, message, args, shared) => {
    let allGames = games.get("quick")
    
    let embeds = [new Discord.RichEmbed()], i = 0
    switch (args[0].toLowerCase()) {
      case "quick":
        if (!allGames.filter(g => g.mode == 'quick').length)
          return await message.channel.send(
            new Discord.RichEmbed()
              .setColor("RED")
              .setTitle("No results found.")
          )
        else for (var game of allGames.filter(g => g.mode == 'quick')) {
          if (i == 25) { i = 0; embeds.push(new Discord.RichEmbed()) }
          ++i
          embeds[embeds.length - 1].addField(
            `Game #${game.gameID}`,
            `**Status:** ${
              game.currentPhase >= 999
                ? "Ended"
                : game.currentPhase == -1
                ? "Not started"
                : `${game.currentPhase % 3 == 0 ? "Night" : "Day"} ${Math.floor(
                    game.currentPhase / 3
                  ) + 1}`
            }\n` +
            `**Players:**`
          )
        }
    }
  }
}