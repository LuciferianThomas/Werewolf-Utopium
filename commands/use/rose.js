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
  name: "rose",
  run: async (client, message, args, shared) => {
    let rb = players.get(message.author.id+".inventory.rose")
    if(!rb || rb < 1) return await message.channel.send(`Hey there! You can't give people roses if you haven't bought any! Go buy some in the shop first!`)
    let player = players.get(message.author.id)
    if (!player.currentGame) return message.reply("you can only give roses while in a game!")
      let QuickGames = games.get("quick"),
          game = QuickGames.find(g => g.gameID == player.currentGame),
          index = QuickGames.indexOf(game),
          gamePlayer = game.players.find(player => player.id == message.author.id)
      let target = parseInt(args[0])
      if(game.currentPhase < 0) return await message.author.send("You can't send roses until the game starts!")
      if (isNaN(target) || target > game.players.length || target < 1)
        return await message.author.send("Invalid target.") 
      let r = fn.getUser(client, game.players[target-1].id)      
    if (r.id == message.author.id)
      return await message.channel.send("I know you are lonely, but please don't do that. I'm sure we can find you some friends to give roses to.")
    
    await r.send(
      new Discord.MessageEmbed()
      .setTitle("Roses for you")
      .setDescription(
        `You were given a rose by ${nicknames.get(message.author.id)}!`
      )
      .setThumbnail(fn.getEmoji(client, "Rose").url)
    )
    await message.channel.send(`Success! You've given a ${fn.getEmoji(client, "Rose")} rose to ${nicknames.get(r.id)}!`)
    players.add(r.id+".roses", 1)
    players.subtract(message.author.id+".inventory.rose", 1)
    fn.addLog("items", `${nicknames.get(message.author.id)} gave ${1} Rose to ${nicknames.get(r.id)}, leaving them with a total of ${players.get(`${message.author.id}.inventory.rose`)} Rose(s). ${nicknames.get(r.id)} now has ${players.get(r.id+".roses")} Roses.`)
    fn.addLog("roses", `${nicknames.get(message.author.id)} gave ${1} Rose to ${nicknames.get(r.id)}, leaving them with a total of ${players.get(`${message.author.id}.inventory.rose`)} Rose(s). ${nicknames.get(r.id)} now has ${players.get(r.id+".roses")} Roses.`)
    //message.author.send(fn.event())

  }
}
