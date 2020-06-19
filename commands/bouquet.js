const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      fs = require("fs")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js"),
      shop = require("/home/sd/wwou/util/shop")

const bouquet = require("/home/sd/wwou/commands/use/bouquet")

module.exports = {
  name: "bouquet",
  run: async (client, message, args, shared) => {
    await bouquet.run(client, message, args, shared)
  }
}