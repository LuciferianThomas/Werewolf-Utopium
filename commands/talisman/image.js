const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      Canvas = require("canvas"),
      probe = require('probe-image-size');

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js"),
      shop = require("/home/sd/wwou/util/shop")

module.exports = {
  name: "image",
  aliases: ["img"],
  run: async (client, message, args) => {
    await message.channel.send(`Here is your talisman:`, await fn.createTalisman(client, args.slice(1).join(' '), args[0]));
  }
}