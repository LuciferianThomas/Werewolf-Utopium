const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = (client, game) => {
  for (let pl = 0; pl < game.players.length; pl++) {
    if (game.currentPhase == -1) {
      if (!fn.getUser(client, game.players[pl].id) || moment(game.players[pl].lastAction).add(3, 'm') <= moment()) {
        if (fn.getUser(client, game.players[pl].id))
          fn.getUser(client, game.players[pl].id).send(`You are removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)

        players.set(`${game.players[pl].id}.currentGame`, 0)

        let leftPlayer = game.players[pl].id
        game.players.splice(pl--, 1)

        if (game.players.length)
          fn.broadcastTo(
            client, game.players,
            new Discord.RichEmbed()
              .setAuthor(
                `${nicknames.get(leftPlayer)} left the game.`,
                fn.getUser(client, leftPlayer).displayAvatarURL
              )
              .addField(
                `Players [${game.players.length}]`,
                game.players
                  .map(p => nicknames.get(p.id))
                  .join("\n")
              )
        )
      } else if (moment(game.players[pl].lastAction).add(2.5, 'm') <= moment() && !game.players[pl].prompted) {
        game.players[pl].prompted = true
        fn.getUser(client, game.players[pl].id).send(
          new Discord.RichEmbed()
            .setTitle("❗ You have been inactive for 2.5 minutes.")
            .setDescription(
              "Please respond `w!` within 30 seconds to show your activity.\n" +
              "You will be kicked from the game if you fail to do so."
            )
        )
      }
    }
    else if (game.currentPhase >= 999) {
      if (!fn.getUser(client, game.players[pl].id) && moment(game.players[pl].lastAction).add(2, 'm') <= moment()) {
        game.players[pl].left = true
        players.set(`${game.players[pl].id}.currentGame`, 0)

        if (fn.getUser(client, game.players[pl].id))
          fn.getUser(client, game.players[pl].id).send(`You were removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`}.`)
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
        players.add(`${game.players[pl].id}.suicides`, 1)
        players.set(`${game.players[pl].id}.currentGame`, 0)

        if (fn.getUser(client, game.players[pl].id))
          fn.getUser(client, game.players[pl].id).send(`You were removed from ${game.mode == 'custom' ? game.name : `Game #${game.gameID}`} for inactivity.`)
        fn.broadcastTo(
          client, game.players.filter(p => !p.left),
          `**${game.players[pl].number} ${fn.getUser(
            client,
            game.players[pl].id
          )}${
            game.config.deathReveal
              ? ` ${fn.getEmoji(client, game.players[pl].role)}`
              : ""
          }** suicided.`
        )

        game = fn.death(client, game, game.players[pl].number, true)
      } else if (moment(game.players[pl].lastAction).add(1.5, 'm') <= moment() && !game.players[pl].prompted) {
        game.players[pl].prompted = true
        new Discord.RichEmbed()
          .setTitle("❗ You have been inactive for 1.5 minutes.")
          .setDescription(
            "Please respond `w!` within 30 seconds to show your activity.\n" +
            "You will be considered as suicided if you fail to do so."
          )
      }
    }  
  }
  
  return game
}