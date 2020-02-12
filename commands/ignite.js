const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "ignite",
  run: async (client, message, args, shared) => {
    let player = player.get(message.author.id)
    if (!player.currentGame)
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick game.")

    let QuickGames = games.get("quick"),
      game = QuickGames.find(g => g.gameID == players.currentGame),
      index = QuickGames.indexOf(game),
      gamePlayer = game.players.find(player => player.id == message.author.id)

    if (gamePlayer.role != "Arsonist")
      return await message.author.send("You do not have the abilities to ignite players.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer ignite players.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (typeof gamePlayer.usedAbilityTonight == 'array')
      return await message.author.send("You already decided to douse players tonight!")

    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only ignite players during the night!")

    let doused = gamePlayer.doused.map(p => game.players[p-1] && p.alive)

    if (!doused.length)
      return await message.author.send("You haven't doused anyone or every doused player is dead! Do `w!douse [player1] [player2]` first!")

    for (var i = 0; i < doused.length; i++) {
      let dousedPlayer = game.players[doused[i].number - 1]

      dousedPlayer.alive = false
      if (game.config.deathReveal) dousedPlayer.roleRevealed = dousedPlayer.role

      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `<:Arsonist_Ignite:664263079273431054> The Arsonist <:Arsonist:660365416480243752> has ignited **${
          doused[i].number
        } ${nicknames.get(dousedPlayer.id)}${
          game.config.deathReveal
            ? ` ${fn.getEmoji(client, dousedPlayer.role)}`
            : ""
        }**.`
      )

      game = fn.death(client, game, dousedPlayer.number)
    }
    gamePlayer.killedTonight = true
    gamePlayer.usedAbilityTonight = true

    QuickGames[index] = game
    games.set("quick", QuickGames)
  }
} 