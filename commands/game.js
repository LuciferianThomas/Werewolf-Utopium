const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

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
    
    if (game.currentPhase == -0.5)
      return await message.channel.send("Please wait until the game has complete its starting sequence!")
    
    let embed = new Discord.MessageEmbed()
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
                    p.alive ? "" : ` ${fn.getEmoji(client, "Death")}`
                  }${
                    p.id == message.author.id
                      ? ` ${fn.getEmoji(client, p.role)}`
                      : p.roleRevealed
                      ? ` ${fn.getEmoji(client, p.roleRevealed)}`
                      : (roles[gamePlayer.role].team == "Werewolves" &&
                        roles[p.role].team == "Werewolves" && gamePlayer.role !== "Sorcerer") ||
                        (gamePlayer.role == "Sorcerer" && p.role == "Sorcerer") || (gamePlayer.role == "Mason" && p.role == "Mason") ||
                        (gamePlayer.role == "Sibling" && p.role == "Sibling") ||(gamePlayer.role == "Zombie" && p.role == "Zombie") 
                      ? ` ${fn.getEmoji(client, p.role)}`
                      : gamePlayer.couple && p.couple
                      ? ` ${fn.getEmoji(client, p.roleRevealed || p.initialRole)} ${fn.getEmoji(client, "Cupid Lovers")}`
                      : ""
                  }${
                    gamePlayer.sect && p.sect && p.role !== "Sect Leader"
                      ? ` ${fn.getEmoji(client, "Sect Member")}`
                      : ""
                  }${
                    p.boxed && game.players.find(pl => pl.role == "Soul Collector" && pl.alive)
                      ? ` ${fn.getEmoji(client, "Soul")}` : ""
                  }${p.left ? " *off*" : ""}${
                    p.id == message.author.id ? "**" : ""
                  }`
              ).join("\n")
        )
    
    if (game.spectators.length) embed.addField(`Spectators [${game.spectators.length}]`, game.spectators.map(id => nicknames.get(id)).join("\n"))
        embed.addField(
          `Roles`,
          game.originalRoles
            // .sort((a, b) => {
            //   if (a > b) return 1
            //   if (a < b) return -1
            // })
            .map(r => `${fn.getEmoji(client, r)} ${r}`)
            .join("\n")
        )
      message.author.send(embed)
    
  }
}