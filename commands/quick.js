const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "quick",
  aliases: ["joingame", "q"],
  run: async (client, message, args, shared) => {
    if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let QuickGames = games.get("quick"), gameID
    
    let game = QuickGames.find(game => game.players.length <= 16)
    if (game) {
      gameID = game.gameID
      QuickGames[QuickGames.indexOf(game)].players.push({ id: message.author.id })
    } else {
      gameID = games.add("count", 1)
      QuickGames.push({
        gameID: gameID,
        nextDay: null,
        nextNight: null,
        roles: ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
                "Bodyguard", "Gunner", "Werewolf Shaman", "Serial Killer", "Cursed", "Priest", "Wolf Seer", "Aura Seer"],
        players: [{
          id: message.author.id
        }]
      })
    }
    
    games.set("quick", QuickGames)
    
    if (!players.get(message.author.id)) 
      players.set(message.author.id, {
        xp: 0,
        currentGame: gameID
      })
    
    message.author.send(
      new Discord.RichEmbed()
        .setAuthor(`You have joined Game #${gameID}.`)
    )
  }
}