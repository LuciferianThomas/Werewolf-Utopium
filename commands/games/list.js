const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

module.exports = {
  name: "list",
  run: async (client, message, args, shared) => {
    let allGames = games.get("quick")
    
    let embeds = [new Discord.MessageEmbed()], i = 0
    
    if (!allGames.filter(g => args[0] ? (args[0].toLowerCase() == "beta" && (`${g.gameID}`).toLowerCase().startsWith("betatest_") || (g.mode == args[0].toLowerCase() && !(`${g.gameID}`).toLowerCase().startsWith("betatest_"))) : true).length)
      return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle("No results found.")
      )
    else for (var game of allGames.filter(g => args[0] && args[0].toLowerCase() == "beta" ? (`${g.gameID}`).toLowerCase().startsWith("betatest_") : args[0] ? (g.mode == args[0].toLowerCase() && !(`${g.gameID}`).toLowerCase().startsWith("betatest_")) : true)) {
      // console.log(game.gameID)
      if (i == 6) { i = 0; embeds.push(new Discord.MessageEmbed()) }
      ++i
      embeds[embeds.length-1].addField(
        game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`,
        `**Status:** ${
          game.currentPhase >= 999
            ? "Ended"
            : game.currentPhase == -1
            ? "Not started"
            : `${game.currentPhase % 3 == 0 ? "Night" : "Day"} ${Math.floor(game.currentPhase / 3) + 1}`
        }\n` +
        `**Players:**\n${game.players.map(
          p => { if (p.role == undefined) console.log(game.gameID)
            return (game.currentPhase == -1
              ? `${nicknames.get(p.id)}`
              : `${p.number} ${nicknames.get(p.id)} ${fn.getEmoji(client, p.role)}`)}
        ).join('\n')}`,
        true
      )
    }
    
    embeds.forEach((e, i) =>
      e.setTitle(
        `List of ${
          args[0]
            ? args[0].charAt(0).toUpperCase() + args[0].toLowerCase().slice(1)
            : "All"
        } Games`
      )
      .setFooter(`Page ${i + 1}/${embeds.length}`)
    )
    
    let m = await message.channel.send(embeds[0])
    fn.paginator(message.author.id, m, embeds, 0)
  }
}