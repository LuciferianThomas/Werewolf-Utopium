const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "quick",
  aliases: ["joingame", "q"],
  run: async (client, message, args, shared) => {
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You are already in a game!")
    
    if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let QuickGames = games.get("quick")
    
    let currentGame = QuickGames.find(game => game.players.length <= 16)
    if (currentGame) {
      QuickGames[QuickGames.indexOf(currentGame)].players.push({ id: message.author.id })
      currentGame = QuickGames.find(game => game.gameID == currentGame.gameID)
    } else {
      currentGame = {
        gameID: games.add("count", 1),
        nextDay: null,
        nextNight: null,
        roles: ["Aura Seer", "Medium", "Jailer", "Werewolf", "Doctor", "Alpha Werewolf", "Seer", Math.random() < 0.5 ? "Fool" : "Headhunter",
                "Bodyguard", "Gunner", "Werewolf Shaman", "Serial Killer", "Cursed", "Priest", "Wolf Seer", "Aura Seer"],
        players: [{
          id: message.author.id
        }]
      }
      QuickGames.push(currentGame)
    }
    
    let m = await message.author.send(
      new Discord.RichEmbed()
        .setAuthor(`You have joined Game #${currentGame.gameID}.`, message.author.displayAvatarURL)
        .addField(`Current Players [${currentGame.playsers.length}]`, currentGame.players.map(player => client.users.get(player.id).username).join("\n"))
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
    
    for (var i = 0; i < currentGame.players.length; i++) {
      await client.users.get(currentGame.players[i].id).send(
        new Discord.RichEmbed()
          .setAuthor(`${message.author.username} joined the game.`, message.author.displayAvatarURL)         
          .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => client.users.get(player.id).username).join("\n"))
      )
    }
    
    games.set("quick", QuickGames)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}