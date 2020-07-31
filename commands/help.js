const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "help",
  run: async (client, message, args) => {
    if(args[0] === "staff") return
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle("Help Menu")
        .setColor(0x7289da)
        .setThumbnail(client.user.avatarURL())
        .addField(
          "Game Commands",
          "`w!joingame <mode>` | Join a game in a specific gamemode.\n" +
          "`w!quick` | Join a quick game.\n" +
          "`w!custom create` | Create a custom game. (Requires Custom Maker)\n" +
          "`w!custom join <code>` | Join a custom game.\n" +
          "`w!game` | Check the game progress.\n" +
          "`w!username` | Change your username for 100 Coins."
        )
        .addField(
          "Information Commands",
          "`w!help` | Get this help menu.\n" +
          "`w!role <role>` | Get information about a role.\n" +
          "`w!profile [user]` | Get information about you or other user.\n" 
        )
        .addField(
          "Currency Commands",
          "`w!daily` | Get your daily rewards.\n" +
          "`w!balance [user]` | Get the balance of your wallet or other users.\n" +
          "`w!rose <user>` | Give roses to a player.\n" +
          "`w!use bouquet` | (WIP) Give roses to everyone in the game.\n"
        )
        .addField(
          "Item Commands",
          "`w!use <item> [amount]` | Use an item in your inventory.\n" +
          "`w!inventory [user]` | View the inventory of yourself or another player.\n" +
          "`w!shop` | View the shop for Werewolf Utopium.\n" +
          "`w!buy <item> <amount>` | Buy an item from the shop.\n"
        )
        .addField(
          "Role Action Commands",
          "Get the action commands for each role in `w!role`."
        )
    )
  }
}