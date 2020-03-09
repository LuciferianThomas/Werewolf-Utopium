const Discord = require("discord.js"),
      moment = require("moment"),
      fn = require("/app/util/fn")

module.exports = {
  name: "now",
  run: async (client, message, args, shared) => {
    let tzInput = args.join(' ')
    let tz = tzInput.match(/(?:GMT|UTC)(.*?)/g)
    
    await message.channel.send(
      new Discord.RichEmbed()
        .setTitle(`Current Time`)
        .setDescription(
          `**Hong Kong Time**: ${moment().utcOffset(8).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          `**Greenwich Mean Time**: ${moment().format("HH:mm [on] MMM D, YYYY (ddd)")}\n` // +
          // `**Your Time**: ${moment().format("HH:mm [on] MMM D, YYYY (ddd)")}\n`
        )
    )
  }
}
