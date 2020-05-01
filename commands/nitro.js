const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn")

module.exports = {
  name: "nitro",
  run: async (client, message, args, shared) => {
    await message.author.send(
      new Discord.MessageEmbed()
        .setTitle(`Here's your Nitro:`)
      .setImage("https://cdn.glitch.com/982524cd-c5d8-43be-9bdc-9decfa8ff79b%2Fnitro.png?v=1588300861771")
    )
  }
}
