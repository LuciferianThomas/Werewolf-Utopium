const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn")

module.exports = {
  name: "now",
  run: async (client, message, args, shared) => {
    let tzInput = args.join('')
    
//     if (tzInput.length)
//       tzInput = moment.tz(tzInput)
    
//     if (tzInput.startsWith("Moment Timezone has no data for"))
//       tzInput = null
//     else
//       tz
    
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`Current Time`)
        .setDescription(
          `**Hong Kong Time**: ${moment().utcOffset(8).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          `**Greenwich Mean Time**: ${moment().format("HH:mm [on] MMM D, YYYY (ddd)")}\n` +
          (tzInput ? `**Your Time**: ${moment().utcOffset(tzInput).format("HH:mm [on] MMM D, YYYY (ddd)")}\n` : "")
        )
    )
  }
}
