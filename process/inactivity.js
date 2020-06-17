const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames"),
      logs = new db.table("Logs")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

module.exports = (client, game) => {
  if (`${game.gameID}`.match(/^devtest_/i) && game.currentPhase < 999) return;
  for (let pl = 0; pl < game.players.length; pl++) {
    if (game.currentPhase == -1) {
      if (!fn.getUser(client, game.players[pl].id) || moment(game.players[pl].lastAction).add(3, 'm') <= moment()) {
        if (fn.getUser(client, game.players[pl].id)){
          fn.getUser(client, game.players[pl].id).send(`You are removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)
          fn.addLog(game, `${nicknames.get(game.players[pl].id)} was removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)
        }
        players.set(`${game.players[pl].id}.currentGame`, 0)

        let leftPlayer = game.players[pl].id
        game.players.splice(pl--, 1)

        if (game.players.length)
          fn.broadcastTo(
            client, game.players.filter(p => !p.left),
            new Discord.MessageEmbed()
              .setAuthor(
                `${nicknames.get(leftPlayer)} left the game.`,
                fn.getUser(client, leftPlayer).displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
              )
              .addField(
                `Players [${game.players.length}]`,
                game.players
                  .map(p => nicknames.get(p.id))
                  .join("\n")
              ), true
          )
    
        if (game.currentPhase == -1 && game.mode == "custom" && game.createdBy == leftPlayer) {
          fn.broadcastTo(
            client, game.players,
            `You have been removed from ${game.name} [\`${game.gameID}\`] as the game creator left.`, true
          )
          game.players.forEach(p => players.set(`${p.id}.currentGame`, 0))
          game.spectators.forEach(p => players.set(`${p}.currentGame`, 0))
          fn.addLog(game, `All players and spectators were removed from ${game.name} [${game.gameID}] as the game creator left.`)
          let QuickGames = games.get("quick")
          QuickGames.splice(QuickGames.indexOf(QuickGames.find(g => g.gameID == game.gameID)), 1)
          games.set("quick", QuickGames)
        }
      } else if (moment(game.players[pl].lastAction).add(2.5, 'm') <= moment() && !game.players[pl].prompted) {
        game.players[pl].prompted = true
        fn.getUser(client, game.players[pl].id).send(
          new Discord.MessageEmbed()
            .setTitle("❗ You have been inactive for 2.5 minutes.")
            .setDescription(
              "Please respond within 30 seconds to show your activity.\n" +
              "You will be kicked from the game if you fail to do so."
            )
        )
      }
    }
    else if (game.currentPhase >= 999) {
      if (!fn.getUser(client, game.players[pl].id) && moment(game.players[pl].lastAction).add(2, 'm') <= moment()) {
        game.players[pl].left = true
        players.set(`${game.players[pl].id}.currentGame`, 0)

        if (fn.getUser(client, game.players[pl].id)){
          fn.getUser(client, game.players[pl].id).send(`You were removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`}.`)
          fn.addLog(game, `${game.players[pl].number} ${nicknames.get(game.players[pl].id)} was removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`}.`)
        }
      }
    }
    else {
      if (!game.players[pl].alive || game.players[pl].left) continue;

      // AFK SUICIDE
      if (!fn.getUser(client, game.players[pl].id) && moment(game.players[pl].lastAction).add(2, 'm') <= moment()) {
        game.players[pl].alive = false
        game.players[pl].left = true
        game.players[pl].suicide = true
        if (game.config.deathReveal) game.players[pl].roleRevealed = game.players[pl].role
        if (game.players.filter(p => p.alive && p.role == "Corruptor").map(p => p.number).includes(game.players[pl].mute)) game.players[pl].roleRevealed = "Unknown"
        players.add(`${game.players[pl].id}.suicides`, 1)
        players.set(`${game.players[pl].id}.currentGame`, 0)

        if (fn.getUser(client, game.players[pl].id))
          fn.getUser(client, game.players[pl].id).send(`You were removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)
        
        fn.addLog(game, `${game.players[pl].number} ${nicknames.get(game.players[pl].id)} was removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)
        fn.broadcastTo(
          client, game.players.filter(p => !p.left),
          `**${game.players[pl].number} ${fn.getUser(
            client,
            game.players[pl].id
          )}${
            game.config.deathReveal &&
              !game.players.filter(p => p.alive && p.role == "Corruptor").map(p => p.number).includes(game.players[pl].mute)
                ? ` ${fn.getEmoji(client, game.players[pl].role)}`
                : ` ${fn.getEmoji(client, "Unknown")}`
          }** suicided.`, true
        )

        game = fn.death(client, game, game.players[pl].number, true)
      } else if (moment(game.players[pl].lastAction).add(1.5, 'm') <= moment() && !game.players[pl].prompted) {
        game.players[pl].prompted = true
        new Discord.MessageEmbed()
          .setTitle("❗ You have been inactive for 1.5 minutes.")
          .setDescription(
            "Please respond within 30 seconds to show your activity.\n" +
            "You will be considered as suicided if you fail to do so."
          )
      }
    }  
  }
  
  return game
}