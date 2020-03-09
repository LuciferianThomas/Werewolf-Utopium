const Discord = require("discord.js"),
      moment = require("moment"),
      fn = require("/app/util/fn")

module.exports = {
  name: "now",
  run: async (client, message, args, shared) => {
    let tzInput = args.join(' ')
    let tz = parseInt(tzInput)
    if (!isNaN(tz)) {
      if (tzInput.match(/\+?.*?([.,](5|50)|:30)/)) tz += .5
      if (tzInput.match(/\-.*?([.,](5|50)|:30)/)) tz -= .5
      if (tzInput.match(/\+?.*?([.,](25)|:15)/)) tz += .25
      if (tzInput.match(/\-.*?([.,](25)|:15)/)) tz -= .25
      if (tzInput.match(/\+?.*?([.,](75)|:45)/)) tz += .75
      if (tzInput.match(/\-.*?([.,](75)|:45)/)) tz -= .75
      tz *= 60
      console.log(tzInput.match(/\-.*?([.,](5|50)|:30)/))
    }
    
    await message.channel.send(
      new Discord.RichEmbed()
        .setTitle(`Current Time`)
        .setDescription(
          `**Hong Kong Time**: ${moment().utcOffset(8).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          `**Greenwich Mean Time**: ${moment().format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          (!isNaN(tz) && tz <= 14 && tz >= -12 ? `**Your Time**: ${moment().utcOffset(tz).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` : "")
        )
    )
  }
}
