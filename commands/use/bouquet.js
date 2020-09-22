const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      shop = require("/home/utopium/wwou/util/shop")

module.exports = {
  name: "bouquet",
  aliases: ["rose bouquet"],
  run: async (client, message, args, shared) => {
    if(!message.author.id === "439223656200273932") return await message.channel.send("Sorry! Roses are unable to be given to people right now")
    let rb = players.get(message.author.id+".inventory.rose bouquet")
    if(!rb || rb < 1) return await message.channel.send(`Hey there! You can't give out ${fn.getEmoji(client, "Rose_Bouquet")} Rose Bouquets if you haven't bought any! Go buy some in the shop first!`)
    let player = players.get(message.author.id)
    if (!player.currentGame) return await message.channel.send(`You can only give out ${fn.getEmoji(client, "Rose_Bouquet")} Rose Bouquets when you are in a game!`)
    let QuickGames = games.get("quick"),
          game = QuickGames.find(g => g.gameID == player.currentGame),
          index = QuickGames.indexOf(game),
          gamePlayer = game.players.find(player => player.id == message.author.id)
    game.players.forEach(p => {
      if(p.id === message.author.id) return
      client.users.cache.get(p.id).send(
      new Discord.MessageEmbed()
      .setTitle("Roses for you")
      .setDescription(
        `You were given a rose from a bouquet by ${nicknames.get(message.author.id)} in Game #${player.currentGame}!`
      )
      .setThumbnail(fn.getEmoji(client, "Rose Bouquet").url)
    )
      players.add(player.id+".roses", 1)
      fn.addLog("roses", `${nicknames.get(message.author.id)} gave ${1} Rose to ${nicknames.get(p.id)}, leaving them with a total of ${players.get(`${message.author.id}.inventory.rose`)} Rose(s). ${nicknames.get(p.id)} now has ${players.get(p.id+".roses")} Roses.`)
    })
    await message.channel.send(`Success! You've given a ${fn.getEmoji(client, "Rose Bouquet")} rose to everyone in Game #${player.currentGame}!`)
    players.subtract(message.author.id+".inventory.rose bouquet", 1)
    fn.addLog("items", `${nicknames.get(message.author.id)} used 1 Rose Bouquet, leaving them with a total of ${players.get(`${message.author.id}.inventory.rose bouquet`)} Rose Bouquet(s)`)
  },
  run2: async (client, message, args, shared) => {
    let msg = message.channel.send(new Discord.MessageEmbed().setTitle("Rose Bouquet").setDescription(`${nicknames.get(message.author.id)} is giving out a bouquet, react with ${fn.getEmoji(client, "Rose")} to claim yours!`).setThumbnail(fn.getEmoji(client, "Rose Bouquet").url))
  }
}
