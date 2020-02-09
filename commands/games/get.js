const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "game",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    message.author.send(
      new Discord.RichEmbed()
        .setTitle(game.mode == 'custom' ? game.name : `Game #${game.gameID}`)
        .addField(
          `Players [${game.players.length}]`,
          game.currentPhase == -1
            ? game.players.map(p => nicknames.get(p.id)).join("\n")
            : game.players.map(
                p =>
                  `${p.id == message.author.id ? "**" : ""}${
                    p.number
                  } ${nicknames.get(p.id)}${
                    p.alive ? "" : " <:Death:668750728650555402>"
                  }${
                    p.id == message.author.id ||
                    p.roleRevealed ||
                    (gamePlayer.couple && p.couple)
                      ? ` ${fn.getEmoji(client, p.roleRevealed || p.role)}`
                      : roles[gamePlayer.role].team == "Werewolves" &&
                        roles[p.role].team == "Werewolves" &&
                        gamePlayer.role !== "Sorcerer" && p.role !== "Sorcerer"
                      ? ` ${fn.getEmoji(client, "Fellow Werewolf")}`
                      : ""
                  }${
                    gamePlayer.couple && p.couple
                      ? ` ${fn.getEmoji(client, "Cupid Lovers")}`
                      : ""
                  }${
                    gamePlayer.sect && p.sect
                      ? ` ${fn.getEmoji(client, "Sect Member")}`
                      : ""
                  }${p.left ? " *off*" : ""}${
                    p.id == message.author.id ? "**" : ""
                  }`
              ).join("\n")
        )
        .addField(
          `Roles`,
          game.originalRoles
            // .sort((a, b) => {
            //   if (a > b) return 1
            //   if (a < b) return -1
            // })
            .map(r => `${fn.getEmoji(client, r)} ${r}`)
            .join("\n")
        )
    )
  }
}