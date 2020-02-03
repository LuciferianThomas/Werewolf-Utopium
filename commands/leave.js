const Discord = require("discord.js"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require("/app/util/fn")

module.exports = {
  name: "leave",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.channel.send("You are not in a game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
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
      game = games.get("quick").find(g => g.gameID == player.currentGame)
      game.players.splice(game.players.indexOf(game.players.find(p => p.id == message.author.id)), 1)
    }
    else if (!gamePlayer.alive) {
      let m = await message.author.send("Are you sure you want to leave the game?")
      m.react(client.emojis.find(e => e.name == "green_tick"))
      let reactions = await m.awaitReactions(
        (r, u) => r.emoji.id == client.emojis.find(e => e.name == "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 5000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
      game = games.get("quick").find(g => g.gameID == player.currentGame)
      gamePlayer.left = true
    }
    else {
      let m = await message.author.send("Are you sure you want to suicide?")
      m.react(client.emojis.find(e => e.name == "green_tick"))
      let reactions = await m.awaitReactions(
        (r, u) => r.emoji.id == client.emojis.find(e => e.name == "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 5000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
      game = games.get("quick").find(g => g.gameID == player.currentGame)
      gamePlayer.alive = false
      gamePlayer.left = true
      gamePlayer.suicide = true
      players.add(`${gamePlayer.id}.suicides`, 1)
    }

    QuickGames = games.get("quick")
    QuickGames[QuickGames.indexOf(QuickGames.find(g => g.gameID == game.gameID))] = game

    games.set("quick", QuickGames)
    players.set(`${message.author.id}.currentGame`, 0)
    
    message.author.send(`You left Game #${game.gameID}.`)
    if (game.players.length)
      fn.broadcastTo(
        client, game.currentPhase == -1 ? game.players : game.players.filter(p => !p.left), 
        game.currentPhase == -1 ?
          new Discord.RichEmbed()
            .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} left the game.`, message.author.displayAvatarURL)
            .addField(
              `Players [${game.players.length}]`,
              game.players.map(p => nicknames.get(p.id)).join("\n")
            ) :
          `**${gamePlayer.number} ${nicknames.get(message.author.id)}** left the game.`
      )
  }
}