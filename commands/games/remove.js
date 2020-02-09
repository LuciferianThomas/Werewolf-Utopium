const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "remove",
  aliases: ["delete"],
  run: async (client, message, args, shared) => {
    let Games = games.get("quick"),
        game = Games.find(
          g => g.mode == "custom"
                 ? g.gameID.toLowerCase() == args[0].toLowerCase()
                 : g.gameID == args[0]
        )
    
    if (!game) return await message.channel.send(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("No results found.")
    )
    
    let m = await message.channel.send("Are you sure to remove this game?" + game.currentPhase >= 0 && game.currentPhase < 999 ? "\nThis game is currently in progress!" : "")
    await m.react(fn.getEmoji(client, "green tick"))
    let reactions = await m.awaitReactions(
      (r, u) => r.emoji.id == client.emojis.find(e => e.name == "green_tick").id &&
                u.id == message.author.id,
      { max: 1, time: 5000, errors: ["time"] }
    ).catch(() => {})
    if (!reactions) return await message.channel.send(
      new Discord.RichEmbed()
        .setTitle("Prompt cancelled.")
    )
    let removedGame = Games.splice(Games.indexOf(Games.find(g => g.gameID == game.gameID)), 1)
    
    if (removedGame.phase < 999) fn.broadcastTo(
      client, removedGame.players.filter(p => !p.left),
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Game Terminated")
        .setDescription(`This game has been terminated by staff. Please contact staff members for more information.`)
    )
    message.
    games.set("quick", Games)
  }
}