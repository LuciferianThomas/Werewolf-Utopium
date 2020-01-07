const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players")

module.exports = {
  name: "xp",
  aliases: ["exp", "experience"],
  run: async (client, message, args) => {
    let player = players.get(message.author.id)
    
    return await message.reply(`you have ${player.xp} XP!`)
  }
}