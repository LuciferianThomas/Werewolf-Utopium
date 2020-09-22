const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      logs = new db.table("Logs")

module.exports = {
  name: "broadcast",
  run: async (client, message, args, shared) => {
    if (
      !client
        .guilds.cache.get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r => ["βTester Helper", "Developer"].includes(r.name))
    )
      return;
    
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
    
    let content = message.content.slice(13+args[0].length)
    
    if(content.startsWith("imageembed")){
      content = content.slice(10)
      fn.broadcastTo(
        client, game.players.filter(p => !p.left),
        new Discord.MessageEmbed()
          .setColor("GOLD")
          .setTitle("📢 Broadcast")
          .setImage(content)
      ) 
    } else {
    
    fn.broadcastTo(
      client, game.players.filter(p => !p.left),
      new Discord.MessageEmbed()
        .setColor("GOLD")
        .setTitle("📢 Broadcast")
        .setDescription(content)
    )

    }
    
    fn.addLog(game, `[BROADCAST] ${nicknames.get(message.author.id)}: ${content}`)
    
    await message.channel.send(
      "You have sent"
    )
  }
}