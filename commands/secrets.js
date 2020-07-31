const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "secrets",
  run: async (client, message, args, shared) => {
    const cmds = ["nitro", "platers", "lucky", "bernie", "allhail"]
    await message.channel.send(
      new Discord.MessageEmbed()
      .setDescription(`\`w!${cmds.join(`\`, \`w!`)}\``)
    )
  }
}
