const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn")

module.exports = {
  name: "now",
  run: async (client, message, args, shared) => {
    let tzInput = args.join('')
    
    console.log(moment.tz)
    
    await message.channel.send(
      new Discord.RichEmbed()
        .setTitle(`Current Time`)
        .setDescription(
          `**Hong Kong Time**: ${moment().utcOffset(8).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          `**Greenwich Mean Time**: ${moment().format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          (tzInput ? `**Your Time**: ${moment().utcOffset(tzInput).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` : "")
        )
    )
  }
}
