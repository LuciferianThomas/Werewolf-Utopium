const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "get",
  aliases: ["find"],
  run: async (client, message, args, shared) => {
    if(!args[0]) return message.channel.send(fn.getEmoji(client, "Harold"))
    let QuickGames = games.get("quick"),
        game = QuickGames.find(
          g => g.mode == "custom"
                 ? g.gameID.toLowerCase() == args[0].toLowerCase()
                 : g.gameID == args[0]
        )
    
    if (!game) return await message.channel.send(
      new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle("No results found.")
    )
    
    message.channel.send(fn.gameEmbed(client, game))
  }
}