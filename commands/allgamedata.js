const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games")

const fn = require("/home/utopium/wwou/util/fn.js")

module.exports = {
  name: "allgamedata",
  aliases: [],
  run: async (client, message, args) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    )
      return undefined
    
    let id = args[0]
    if(parseInt(id)) id = parseInt(id)
    if(!id) return
    let game = games.get("quick").filter(g => g.gameID == id)
    if(game) message.author.send(JSON.stringify(game, null, 2), {"split": ","})

  }
}
