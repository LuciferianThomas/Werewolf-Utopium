const Discord = require("discord.js"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require("/home/utopium/wwou/util/fn.js")

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
    
    if(game.spectators.includes(message.author.id)){
      let m = await message.author.send(
        "Are you sure you want to stop spectating the game?"
      )
      m.react(fn.getEmoji(client, "green_tick"))
      let reactions = await m.awaitReactions(
        (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 5000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
      QuickGames = games.get("quick")
      game = QuickGames.find(g => g.gameID == player.currentGame)
      game.players.splice(game.spectators.indexOf(game.spectators.find(p => p == message.author.id)), 1)
    } else 
    
    if (game.currentPhase == -1) {
      let m = await message.author.send(
        "Are you sure you want to leave the game?" +
        (game.createdBy == message.author.id ? " The game will be removed if you do so!" : "")
      )
      m.react(fn.getEmoji(client, "green_tick"))
      let reactions = await m.awaitReactions(
        (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 5000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
      QuickGames = games.get("quick")
      game = QuickGames.find(g => g.gameID == player.currentGame)
      game.players.splice(game.players.indexOf(game.players.find(p => p.id == message.author.id)), 1)
      if (game.startVotes && game.startVotes.includes(message.author.id)) game.startVotes.splice(game.players.indexOf(message.author.id), 1)
    }
    else if (game.currentPhase == -0.5) {
      return await message.author.send("You cannot leave the game while the game is starting!")
    }
    else if (game.currentPhase >= 999 || !gamePlayer.alive) {
      gamePlayer.left = true
    }
    else {
      let m = await message.author.send("Are you sure you want to suicide?")
      m.react(fn.getEmoji(client, "green_tick"))
      let reactions = await m.awaitReactions(
        (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
                  u.id == message.author.id,
        { max: 1, time: 5000, errors: ["time"] }
      ).catch(() => {})
      if (!reactions) return await message.author.send("Prompt cancelled.")
      QuickGames = games.get("quick")
      game = QuickGames.find(g => g.gameID == player.currentGame)
      gamePlayer = game.players.find(p => p.id == message.author.id)
      gamePlayer.alive = false
      gamePlayer.left = true
      gamePlayer.suicide = true
      players.add(`${gamePlayer.id}.suicides`, 1)
      if (game.config.deathReveal) {
        if (game.players.filter(p => p.alive && p.role == "Corruptor").map(p => p.number).includes(gamePlayer.mute)) {
          gamePlayer.roleRevealed = "Unknown"
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            `Corrupted player **${gamePlayer.number} ${nicknames.get(gamePlayer.id)} ${fn.getEmoji(client, "Unknown")}** suicided.`, true
          )
        }
        else {
          gamePlayer.roleRevealed = gamePlayer.role
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            `**${gamePlayer.number} ${nicknames.get(gamePlayer.id)} ${fn.getEmoji(client, gamePlayer.roleRevealed)}** suicided.`, true
          )
        }
      }
      else fn.broadcastTo(
        client, game.players.filter(p => !p.left),
        `**${gamePlayer.number} ${nicknames.get(gamePlayer.id)} ${fn.getEmoji(client, "Unknown")}** suicided.`, true
      )

      game = fn.death(client, game, gamePlayer.number, true)
      fn.addLog(game, `${gamePlayer.number} ${nicknames.get(gamePlayer.id)} (${gamePlayer.role}) suicided.`)
    }
    
    fn.addLog(game, `${nicknames.get(message.author.id)} left the game.`)
    message.author.send(`You left Game #${game.gameID}.`)
    if (game.players.length && (game.currentPhase < 0 || game.currentPhase >= 999)){
      fn.broadcastTo(
        client, game.currentPhase == -1 ? game.players : game.players.filter(p => !p.left), 
        game.currentPhase == -1 ?
          new Discord.MessageEmbed()
            .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} left the game.`, message.author.displayAvatarURL())
            .addField(
              `Players [${game.players.length}]`,
              game.players.map(p => nicknames.get(p.id)).join("\n")
            ) :
          `**${gamePlayer.number} ${nicknames.get(message.author.id)}** left the game.`, true
      )
    }
    
    if (game.currentPhase == -1 && game.mode == "custom" && game.createdBy == message.author.id) {
      fn.broadcastTo(
        client, game.players,
        `You have been removed from ${game.name} [\`${game.gameID}\`] as the game creator left.`, true
      )
      game.players.forEach(p => players.set(`${p.id}.currentGame`, 0))
      game.spectators.forEach(p => players.set(`${p}.currentGame`, 0))
      QuickGames.splice(QuickGames.indexOf(QuickGames.find(g => g.gameID == game.gameID)), 1)
    }

    games.set("quick", QuickGames)
    players.set(`${message.author.id}.currentGame`, 0)
  }
}