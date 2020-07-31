const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      shop = require("/home/utopium/wwou/util/shop")

module.exports = {
  name: "info",
  run: async (client, message, args, shared) => {    
    if (!args[0])
      return await message.channel.send("Missing arguments.")
    
    let input = args.join(" "),
        item = shop[input]
    if(!item) return message.channel.send(`${fn.getEmoji(client, "red_tick")} Invalid item.`)
    const red = fn.getEmoji(client, "red_tick")
    const green = fn.getEmoji(client, "green_tick")
    
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`**${item.name}**`)
        .setDescription(
          `${item.description}\n\nAvaliable: ${item.unavaliable ? red : green}`
        )
      .setThumbnail(fn.getEmoji(client, item.emoji).url)
    )
  }
}