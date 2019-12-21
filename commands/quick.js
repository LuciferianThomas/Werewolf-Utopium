const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      games = new db.table("Games")


module.exports = {
  name: "quick",
  aliases: ["joingame", "q"],
  run: async (client, message, args, shared) => {
    if (!games.get("quick")) games.set("quick", [])
    let QuickGames = games.get("quick")
    if (QuickGames.find(game => game.players.length <= 16))
      QuickGames[QuickGames.indexOf(QuickGames.find(game => game.players.length <= 16))].players.push({ id: message.author.id })
    else
      QuickGames.push({ })
  }
}