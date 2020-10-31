const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")


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
        if(!game) return message.react("681383350715547679")
    game.instructions = args.slice(1).join(" ")
    let index = QuickGames.indexOf(game);
    QuickGames[index] = game;
    games.set("quick", QuickGames);
    message.react("✅")
  }
}