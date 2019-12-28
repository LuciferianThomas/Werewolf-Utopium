const Discord = require("discord.js"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "leave",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.channel.send("You are not in a game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.id == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(p => p.id == message.author.id)
    
    if (game.currentPhase == -1) {
      let m = await message.author.send("Are you sure you want to leave the game?")
      m.react(client.emojis.find(e => e.name == "green_tick"))
      let reactions = await m.awaitReactions(
        (r, u) => r.emoji.id == client.emojis.find(e => e.name == "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 5000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
      game = games.get("quick").find(g => g.id == player.currentGame)
      game.players.splice(game.players.indexOf(gamePlayer), 1)
    }
    QuickGames = games.get("quick")
    QuickGames[QuickGames.indexOf(QuickGames.find(g => g.id == game.id))] = game
    
    games.set("quick", QuickGames)
    
    message.author.send(`You left Game #${game.id}.`)
  }
}