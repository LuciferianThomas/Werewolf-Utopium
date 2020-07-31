const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      fs = require("fs")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js"),
      shop = require("/home/utopium/wwou/util/shop")

const bouquet = require("/home/utopium/wwou/commands/use/bouquet")

module.exports = {
  name: "bouquet",
  run: async (client, message, args, shared) => {
    await bouquet.run(client, message, args, shared)
  }
}