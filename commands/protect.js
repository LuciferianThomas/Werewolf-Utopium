const Discord = require("discord.js"),
  moment = require("moment"),
  db = require("quick.db")

const games = new db.table("Games"),
  players = new db.table("Players"),
  nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require("/home/utopium/wwou/util/fn.js"),
  roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "protect",
  aliases: ["heal", "prot"],
  gameroles: [
    "Doctor",
    "Witch",
    "Flower Child",
    "Guardian Wolf",
    "Bodyguard",
    "Tough Guy"
  ],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame)
      return await message.author.send(
        "**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!"
      )

    let QuickGames = games.get("quick"),
      game = QuickGames.find(g => g.gameID == player.currentGame),
      index = QuickGames.indexOf(game),
      gamePlayer = game.players.find(player => player.id == message.author.id)

    if (
      gamePlayer.role !== "Doctor" &&
      gamePlayer.role !== "Witch" &&
      shared.commandName == "heal"
    )
      return await message.author.send(
        "You do not have the abilities to heal a player."
      )

    if (["Flower Child", "Guardian Wolf"].includes(gamePlayer.role)) {
      if (!gamePlayer.alive)
        return await message.author.send(
          "You are dead. You can no longer protect a player from being lynched."
        )

      if (game.currentPhase % 3 == 0)
        return await message.author.send(
          "You can only protect a player from being lynched during the day."
        )

      if (game.currentPhase >= 999)
        return await message.author.send(
          "The game is over! You can no longer use your actions."
        )

      if (!gamePlayer.abil1)
        return await message.author.send("You have already used your ability.")

      let target = parseInt(args[0])
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")

      let targetPlayer = game.players[target - 1]
      if (!game.players[target - 1].alive)
        return await message.author.send(
          "You cannot protect a dead player from being lynched."
        )
      
      message.author.send(
        `${
          gamePlayer.role == "Flower Child"
            ? fn.getEmoji(client, "Flower Child Petal")
            : fn.getEmoji(client, "Guardian Wolf Protect")
        } You selected to protect **${targetPlayer.number} ${nicknames.get(
          targetPlayer.id
        )}** from being lynched.`
      )
      
      fn.addLog(
        game,
        `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
          gamePlayer.id
        )} selected to protect ${targetPlayer.number} ${nicknames.get(
          targetPlayer.id
        )} (${targetPlayer.role}) from being lynched.`
      )

      targetPlayer.preventLynch = targetPlayer.number
    } else if (
      ["Doctor", "Witch", "Bodyguard", "Tough Guy"].includes(gamePlayer.role)
    ) {
      if (game.currentPhase % 3 != 0)
        return await message.author.send(
          "You can only protect a player at night."
        )
      if (!gamePlayer.alive)
        return await message.author.send(
          "You are dead. You can no longer protect a player."
        )

      if (gamePlayer.jailed)
        return await message.author.send(
          "You are currently jailed and cannot use your abilities."
        )
      if (gamePlayer.nightmared)
        return await message.author.send(
          "You are having a nightmare and cannot use your abilities!"
        )
      if (game.currentPhase >= 999)
        return await message.author.send(
          "The game is over! You can no longer use your actions."
        )

      if (gamePlayer.role == "Witch" && !gamePlayer.abil1)
        return await message.author.send("You have already used your elixir!")

      let target = parseInt(args[0])
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")

      let targetPlayer = game.players[target - 1]
      if (!game.players[target - 1].alive)
        return await message.author.send("You cannot protect a dead player.")
      if (target == gamePlayer.number)
        return await message.author.send("You cannot protect yourself.")

      gamePlayer.usedAbilityTonight = targetPlayer.number

      message.author.send(
        `${
          gamePlayer.role == "Doctor"
            ? fn.getEmoji(client, "Doctor Protect")
            : gamePlayer.role == "Witch"
            ? fn.getEmoji(client, "Witch Elixir")
            : fn.getEmoji(client, "Bodyguard Protect")
        } You selected **${target} ${nicknames.get(
          game.players[target - 1].id
        )}** to be protected.`
      )
      fn.addLog(
        game,
        `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
          gamePlayer.id
        )} chose ${target} ${nicknames.get(
          targetPlayer.id
        )} (${targetPlayer.role}) to be protected.`
      )
    } else
      return await message.author.send(
        "You do not have the abilities to protect a player."
      )

    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}
