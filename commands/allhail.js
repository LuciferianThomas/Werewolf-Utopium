const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "allhail",
  run: async (client, message, args, shared) => {
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`All hail, all hail!`)
      .setImage("https://cdn.glitch.com/982524cd-c5d8-43be-9bdc-9decfa8ff79b%2Fallhail.gif?v=1591301901198")
    )
  }
}
