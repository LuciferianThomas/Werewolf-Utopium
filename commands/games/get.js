const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "get",
  aliases: ["find"],
  run: async (client, message, args, shared) => {
    let QuickGames = games.get("quick"),
        game = QuickGames.find(
          g => g.mode == "custom"
                 ? g.gameID.toLowerCase() == args[0].toLowerCase()
                 : g.gameID == args[0]
        )
    
    if (!game) return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("No results found.")
    )
    
    message.channel.send(
      new Discord.RichEmbed()
        .setTitle(game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`)
        .addField(
          'Status',
          game.currentPhase >= 999
            ? "Ended"
            : game.currentPhase == -1
            ? "Not started"
            : `${game.currentPhase % 3 == 0 ? "Night" : "Day"} ${Math.floor(game.currentPhase / 3) + 1}`
       )
        .addField(
          `Players [${game.players.length}]`,
          !game.players.length
            ? "-"
            : game.currentPhase == -1
            ? game.players.map(p => nicknames.get(p.id)).join("\n")
            : game.players.map(
                p =>
                  `${p.id == message.author.id ? "**" : ""}${
                    p.number
                  } ${nicknames.get(p.id)}${
                    p.alive ? "" : " <:Death:668750728650555402>"
                  } ${fn.getEmoji(client, p.role)}${
                    p.couple
                      ? ` ${fn.getEmoji(client, "Cupid Lovers")}`
                      : ""
                  }${
                    p.sect
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
            .map(r => fn.getEmoji(client, r))
            .join(" ")
        )
    )
  }
}