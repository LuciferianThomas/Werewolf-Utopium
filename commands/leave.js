const Discord = require("discord.js"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

module.exports = {
  name: "leave",
  run: async (client, message, args, shared) => {
    let player = players.get()
  }
}