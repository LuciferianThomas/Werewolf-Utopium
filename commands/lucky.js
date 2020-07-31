const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "lucky",
  run: async (client, message, args, shared) => {
    await message.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`Ugh so lucky`)
      .setImage("https://cdn.glitch.com/982524cd-c5d8-43be-9bdc-9decfa8ff79b%2Flucky.png?v=1588972888352")
    )
  }
}
