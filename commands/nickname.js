const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players")

module.exports = {
  name: "nickname",
  aliases: ["nick"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    
    let input = message.content.slice(shared.commandName.length + 2)
    if (!input.match(/^[a-z0-9\_]{4,14}$/i)) 
      return await message.channel.send("This is an invalid nickname!")
    
    player.nickname = input
    //if (player.prevNicknameChange.length)
  }
}