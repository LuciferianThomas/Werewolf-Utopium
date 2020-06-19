const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js"),
      shop = require("/home/sd/wwou/util/shop")

module.exports = {
  name: "shop",
  run: async (client, message, args) => {
    let embeds = [new Discord.MessageEmbed().setTitle("Werewolf Utopium | Shop").setColor(0x7289da)]
    
    for (let shopitem in shop){
      let item = shop[shopitem]
      if(!item.hidden){
      if (embeds[embeds.length-1].fields.length == 10)
        embeds.push(new Discord.MessageEmbed().setTitle("Werewolf Utopium | Shop").setColor(0x7289da))
      // console.log(fn.getEmoji(client, (item.emoji ? item.emoji : item.name)))
      embeds[embeds.length - 1].addField(
        `${
        fn.getEmoji(client, item.emoji ? item.emoji : item.name) ? fn.getEmoji(client, item.emoji ? item.emoji : item.name) : ""
        } ${item.unavailable ? "~~" : ""}**${item.name}**${item.unavailable ? "~~" : ""} - ${item.price} ${fn.getEmoji(client, (item.currency == "coins" ? "Coin" : "Rose"))}`,
        `${item.description}`
      )
      }
    }
    
    for (var [i, embed] of embeds.entries()) {
      embed.setFooter(`Page ${i + 1}/${embeds.length} | Buy the items with \`w!buy [item] [amount]\`!`)
    }
    
    let m = await message.channel.send(embeds[0])
    fn.paginator(message.author.id, m, embeds, 0)
  }
}