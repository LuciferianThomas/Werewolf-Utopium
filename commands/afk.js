const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require("/home/sd/wwou/util/fn.js")

module.exports = {
  name: "afk",
  run: async (client, message, args) => {
    let player = players.get(message.author.id)
    if (player.currentGame)
      return await message.channel.send("You cannot set your AFK status during a game!")
    
    let reason = args.join(' ')
    if (!reason)
      return await message.channel.send("Please specify why you are AFK!")
    
    reason = reason.replace(/\\?\|\\?\|(?:.|\s)*?\\?\|\\?\|/g, "$1")
      .replace(/\\?~\\?~(?:.|\s)*?\\?~\\?~/g, "$1")
      .replace(/\\?\*\\?\*\\?\*(?:.|\s)*?\\?\*\\?\*\\?\*/g, "$1")
      .replace(/\\?\*\\?\*(?:.|\s)*?\\?\*\\?\*/g, "$1")
      .replace(/\\?\*(?:.|\s)*?\\?\*/g, "$1")
      .replace(/\\?_\\?_(?:.|\s)*?\\?_\\?_/g, "$1")
      .replace(/\\?_(?:.|\s)*?\\?_/g, "$1")
      .replace(/\\?`\\?`\\?`(?:(?:[^\s]*?\n)?(.+?)|((.|\s)*?))\\?`\\?`\\?`/g, "$1$2")
      .replace(/\\?`((?!w\!).*?)\\?`/gi, "$1")
      .replace(/^\\?>\s*/gm, "")
      .replace(/\\?<(?:#|@|@&)[^\s]*?>/g, "")
      .replace(/(https?:\/\/)?((([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+\.)+([^.,\/#!$%\^&\*;:{}=\-_`~()\[\]\s])+|localhost)(:\d+)?(\/[^\s]*)*/gi, "")
      .replace(/([`*_~>])/g, "\\$1")
    
    if (reason.length > 100)
      return await message.channel.send("The AFK reason can only be 100 characters long.")
    
    players.set(`${message.author.id}.afk`, reason)
    
    await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(0x888888)
        .setTitle("AFK")
        .setDescription(`${message.author} is now AFK for **${reason}**.`)
        .setFooter("Your AFK will be automatically cancelled once the bot sees any of your messages.")
    )
  }
}
