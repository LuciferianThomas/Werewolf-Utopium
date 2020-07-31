const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "kill",
  gameroles: ["Illusionist"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame)
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick game.")

    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role !== "Illusionist") return await message.author.send("You cannot use this ability!")
    
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer use your abilities.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your abilities.")
    if (game.currentPhase % 3 != 1)
      return await message.author.send("You can only kill disguised players during the discussion phase!")

    let disguised = game.players.filter(
      p => p.alive && gamePlayer.deluded.includes(p.number)
    )

    if (!disguised.length)
      return await message.author.send("You haven't disguised anyone or every disguised player is dead! Do `w!disguise [player1] [player2]` first!")

    for (var target of disguised) {
      target.alive = false
      if (game.config.deathReveal) target.roleRevealed = target.role

      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `${fn.getEmoji(client, "Illusionist_Kill")} The Illusionist ${fn.getEmoji(client, "Illusionist")} has killed **${target.number
        } ${nicknames.get(target.id)}${
          game.config.deathReveal
            ? ` ${fn.getEmoji(client, target.role)}`
            : ""
        }**.`
      )
    }
    
    fn.addLog(
      game,
      `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} has killed the disguised ${disguised.map(x => `${x.number} ${nicknames.get(x.id)} (${x.role})`).join(", ")}.`
    )
    
    game = fn.death(client, game, disguised.map(x => x.number))

    QuickGames[index] = game
    games.set("quick", QuickGames)
  }
} 