const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js"),
      logs = new db.table("Logs")

module.exports = {
  name: "instructions",
  run: async (client, message, args, shared) => {
    if (
      !client
        .guilds.cache.get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r => ["βTester Helper", "Developer"].includes(r.name))
    )
      return;
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(
          g => g.gameID == args[0]
        );
    game.instructions = args.slice(1).join(" ")
    let index = QuickGames.indexOf(game);
    QuickGames[index] = game;
    games.set("quick", QuickGames);
    message.react("✅")
  }
}