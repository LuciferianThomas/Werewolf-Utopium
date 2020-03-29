const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn")

module.exports = {
  name: "now",
  run: async (client, message, args, shared) => {
    message.channel.send("")
  }
}
