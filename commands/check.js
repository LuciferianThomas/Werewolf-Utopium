const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require("/home/utopium/wwou/util/fn.js"),
      roles = require("/home/utopium/wwou/util/roles.js"),
      tags = require('/home/utopium/wwou/util/tags.js')

module.exports = {
  name: "check",
  aliases: ["see"],
  gameroles: ["Seer", "Aura Seer", "Spirit Seer", "Sorcerer", "Wolf Seer"],
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
    if (!["Seer", "Aura Seer", "Spirit Seer", "Sorcerer", "Wolf Seer"].includes(gamePlayer.role))
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")

    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")

    if (
      gamePlayer.role == "Wolf Seer" &&
      (game.players.filter(p => p.alive && roles[p.role].team == "Werewolves")
        .length == 1 ||
        gamePlayer.resigned)
    )
      return await message.author.send(
        "You cannot check on a player if you are the last werewolf."
      )

    if (gamePlayer.role == "Spirit Seer") {
      let targetA = parseInt(args[0]), 
          targetB = parseInt(args[1])
      if (
        (isNaN(targetA) ||
        targetA > game.players.length ||
        targetA < 1) ||
        (targetB ? (isNaN(targetB) ||
        targetB > game.players.length ||
        targetB < 1) : false)
      )
        return await message.author.send("Invalid target.")
      if (!game.players[targetA - 1].alive || (targetB ? !game.players[targetB - 1].alive : false))
        return await message.author.send("You cannot check a dead player.")
      if (targetA == gamePlayer.number || (targetB ? targetB == gamePlayer.number : false))
        return await message.react(fn.getEmoji(client, "harold"))
      if (targetB && targetA == targetB)
        return await message.author.send("You need to select two **__different__** targets for your ability to work!")

      gamePlayer.usedAbilityTonight = [targetA]
      if(targetB) gamePlayer.usedAbilityTonight.push(targetB)
      
      let targetPlayerA = game.players[targetA-1]
      let targetPlayerB
      if(targetB) targetPlayerB = game.players[targetB-1]
                
      fn.addLog(
        game,
        `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} wanted to see the spirits of ${
        targetPlayerA.number} ${nicknames.get(targetPlayerA.id)} (${targetPlayerA.role}) ${targetB ? `and ${
        targetPlayerB.number} ${nicknames.get(targetPlayerB.id)} (${targetPlayerB.role})` : ""}.`
      )
    } else {
      if (gamePlayer.usedAbilityTonight)
        return await message.author.send(
          "You have already checked on a player tonight."
        )

      let target = parseInt(args[0])
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.")
      if (!game.players[target - 1].alive)
        return await message.author.send("You cannot check on a dead player.")
      if (target == gamePlayer.number)
        return await message.author.send("You cannot check on yourself.")

      let targetPlayer = game.players[target - 1]

      if (gamePlayer.role == "Aura Seer") {
        let aura = game.players.find(pl => pl.enchant == targetPlayer.number)
                ? "Evil"
                : targetPlayer.disguised
                ? "Unknown"
                : roles[targetPlayer.role].aura
        
        let embed = new Discord.MessageEmbed()
          .setAuthor(`Seeing Results`, fn.getEmoji(client, "Aura Seer").url)
          .setThumbnail(
            fn.getEmoji(client, aura).url
          )
          .setDescription(
            `**${target} ${nicknames.get(targetPlayer.id)}** has a${
              aura == "Good"
                ? ""
                : "n"
            } ${aura} aura.`
          )
        if (aura == "Unknown")
          embed.description += `\n\nUnknown roles include ${game.originalRoles
            .filter(
              (r, i) =>
                roles[r].aura == "Unknown" &&
                game.originalRoles.indexOf(r) === i
            )
            .map(r => `${fn.getEmoji(client, r)} ${r}`)
            .join(", ")}.${
            game.originalRoles.filter(r => r.includes("Random")).length
              ? `\nPossible unknown roles from random roles include ${Object.values(
                  roles
                )
                  .filter(
                    r =>
                      r.aura == "Unknown" &&
                      (game.originalRoles.find(r => r == "Random")
                        ? true
                        : game.originalRoles
                            .filter(r1 => r1.includes("Random"))
                            .includes(`Random ${r.cat}`))
                  )
                  .map(r => `${fn.getEmoji(client, r.name)} ${r.name}`)
                  .join(", ")}`
              : ""
          }`

        message.author.send(embed)
                
        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} checked the aura of ${
          targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}) and found that they were ${aura}.`
        )
      } else {
        let role = targetPlayer.disguised
                     ? "Illusionist"
                     : gamePlayer.role !== "Wolf Seer" && game.players.find(pl => pl.enchant == targetPlayer.number)
                     ? "Wolf Shaman"
                     : targetPlayer.role
        
        message.author.send(
          new Discord.MessageEmbed()
            .setAuthor(
              `Seeing Results`,
              fn.getEmoji(client, gamePlayer.role).url
            )
            .setThumbnail(
              fn.getEmoji(client, role).url
            )
            .setDescription(
              `**${target} ${nicknames.get(targetPlayer.id)}** is ${
                roles[role].oneOnly
                  ? "the"
                  : /^([aeiou])/i.test(role)
                  ? "an"
                  : "a"
              } ${
                role
              }.`
            )
        )

        if (gamePlayer.role == "Wolf Seer")
          fn.broadcastTo(
            client,
            game.players.filter(
              p =>
                !p.left &&
                roles[p.role].team == "Werewolves" &&
                p.role != "Sorcerer"
            ),
            `The wolf seer checked **${target} ${nicknames.get(
              targetPlayer.id
            )} ${fn.getEmoji(client, role)}**.${
              ["Arsonist","Bomber","Corruptor","Cannibal","Illusionist","Serial Killer"].includes(role)
                ? " The werewolves cannot kill this player!"
                : ""
            }`
          )
        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} checked ${
          targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
        )
      }
      gamePlayer.usedAbilityTonight = true
    }

    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}