const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "vote",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer place votes.")
    
    if (gamePlayer.jailed && game.currentPhase % 3 == 0)
      return await message.author.send("You cannot vote while in jail!")
    
    if (game.currentPhase % 3 == 0) {
      if (roles[gamePlayer.role].team == "Werewolves" && (gamePlayer.role !== "Sorcerer" || 
          (gamePlayer.role == "Wolf Seer" && (game.players.filter(player => player.alive && roles[player.role].team == "Werewolf").length == 1 || gamePlayer.resigned)))) {
        if (!args[0]) return await message.author.send("Please select a player, or choose `cancel` to remove your vote!")
        if (args[0].toLowerCase() == "cancel") {
          gamePlayer.vote = null
          fn.addLog(
            game,
            `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} withdrew their vote.`)
          return await message.author.send("You have withdrawn your vote.")
        }
        
        let vote = parseInt(args[0])
        if (isNaN(vote) || vote > game.players.length || vote < 1)
          return await message.author.send("Invalid vote.")
        if (roles[game.players[vote-1].role].team == "Werewolves") 
          return await message.author.send("You cannot vote a fellow werewolf.")
        if (game.players[vote-1].role == "Sorcerer") 
          return await message.author.send("You cannot vote a sorcerer.")
        if (!game.players[vote-1].alive) 
          return await message.author.send("You cannot vote a dead player.")
        if (vote == gamePlayer.number) 
        return await message.author.send("You cannot vote yourself.")
        gamePlayer.vote = vote
        
        fn.broadcastTo(
          client,
          game.players.filter(
            p =>
              roles[p.role].team == "Werewolves" &&
              p.role !== "Sorcerer" &&
              !p.jailed &&
              !p.left
          ),
          `${fn.getEmoji(client, "Voting Werewolf")} **${gamePlayer.number} ${nicknames.get(message.author.id)} ${
            fn.getEmoji(client, gamePlayer.role)
          }** voted to kill **${vote} ${nicknames.get(game.players[vote - 1].id)}**${
            game.players[vote - 1].roleRevealed
              ? ` ${client.emojis.cache.find(
                  e => e.name == game.players[vote - 1].role.replace(/ /g, "_")
                )}`
              : ""
          }.`
        )
        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
            gamePlayer.id
          )} voted to kill ${vote} ${nicknames.get(
            game.players[vote - 1].id
          )} (${game.players[vote - 1].role}).`
        )
        
        gamePlayer.killedTonight = true
      } else 
        return await message.author.send("You cannot vote at night!")
    }
    
    if (game.currentPhase % 3 == 1 || (game.currentPhase % 3 == 2 && game.noVoting)) {
      message.author.send("There is currently nothing to vote for!")
    }
    
    if (game.currentPhase % 3 == 2) {
      if (!args[0]) return await message.author.send("Please select a player, or choose `cancel` to remove your vote!")
      if (args[0].toLowerCase() == "cancel") {
        gamePlayer.vote = null
        await message.author.send("You have withdrawn your vote.")
        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(
            gamePlayer.id
          )} withdrew their vote.`
        )
      }
      else {
        if (gamePlayer.mute)
          return await message.author.send("You cannot vote today!")

        if(game.noVoting)
          return await message.author.send("There is no voting today!")

        let vote = parseInt(args[0])
        if (isNaN(vote) || vote > game.players.length || vote < 1)
          return await message.author.send("Invalid vote.")
        if (!game.players[vote-1].alive) 
          return await message.author.send("You cannot vote a dead player.")
        if (vote == gamePlayer.number) 
          return await message.author.send("You cannot vote yourself.")
        game.players[gamePlayer.number-1].vote = vote

        message.author.send(
          `${fn.getEmoji(client, "Voting")} You voted to lynch **${vote} ${
            nicknames.get(game.players[vote - 1].id)
          }${
            game.players[vote - 1].roleRevealed
              ? ` ${client.emojis.cache.find(
                  e => e.name == game.players[vote - 1].role.replace(/ /g, "_")
                )}`
              : ""
          }**.`
        )

        if (!game.shade)
          fn.broadcastTo(
            client, game.players.filter(p => !p.left && p.number !== gamePlayer.number),
            `${fn.getEmoji(client, "Voting")} **${gamePlayer.number} ${nicknames.get(message.author.id)}${
              gamePlayer.roleRevealed
                ? ` ${client.emojis.cache.find(
                    e => e.name == gamePlayer.role.replace(/ /g, "_")
                  )}`
                : ""
            }** voted to lynch **${vote} ${
              nicknames.get(game.players[vote - 1].id)
            }${
              game.players[vote - 1].roleRevealed
                ? ` ${client.emojis.cache.find(
                    e => e.name == game.players[vote - 1].role.replace(/ /g, "_")
                  )}`
                : ""
            }**.`
          )

        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} voted to lynch ${vote} ${
          nicknames.get(game.players[vote - 1].id)
          } (${game.players[vote - 1].role}).`
        )
      }
    }
    QuickGames[index] = game
    
    games.set("quick", QuickGames)
  }
}