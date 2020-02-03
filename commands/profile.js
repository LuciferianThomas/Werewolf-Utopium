const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn')

module.exports = {
  name: "profile",
  aliases: ["prof"],
  run: async (client, message, args) => {
    let target = message.author
    if (args[0]) 
      target = fn.getUser(
        client, 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")) ? 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")).ID : args[0]
      )
    if (args[0] && !target)
      return await message.channel.send(`<:red_tick:597374220267290624> User \`${args[0]}\` not found.`)
    if (message.mentions.users.size) target = message.mentions.users.first()
    
    let player = players.get(target.id)
    
    return await message.channel.send(
      new Discord.RichEmbed()
        .setAuthor(`User Profile | ${nicknames.get(target.id) || `\* ${target.username}`}`)
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