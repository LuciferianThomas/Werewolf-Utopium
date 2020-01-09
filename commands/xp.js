const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players")

const fn = require('/app/util/fn')

module.exports = {
  name: "profile",
  aliases: ["prof"],
  run: async (client, message, args) => {
    let target = message.author
    if (args[0]) target = fn.getUser(client, args[0])
    if (message.mentions.users.size) target = message.mentions.users.first()
    
    let player = players.get(target.id)
    
    return await message.channel.send(
      new Discord.RichEmbed()
        .setAuthor(`User Profile | ${target.tag}`)
        .setThumbnail(target.displayAvatarURL)
        .addField("Games played", player.wins.length + player.loses.length, true)
        .addField("Coins", 0, true)
        .addField("XP", player.xp, true)
        .addField("Wins", player.wins.length, true)
        .addField("Loses", player.loses.length, true)
        // .addField(
        //   "Teams",
        //   {}
        // )
    )
  }
}