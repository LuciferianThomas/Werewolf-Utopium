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

const rose = require("/home/utopium/wwou/commands/use/rose")

module.exports = {
  name: "rose",
  run: async (client, message, args, shared) => {
    await rose.run(client, message, args, shared)
  }
}