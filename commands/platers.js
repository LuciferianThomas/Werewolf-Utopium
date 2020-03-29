const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn")

module.exports = {
  name: "now",
  run: async (client, message, args, shared) => {
    message.channel.send("https://cdn.glitch.com/523fbde2-d515-4952-9b60-3526c94a58e4%2F229d59eb-907e-4b49-a40c-653154db392a.image.png?v=1585504929370")
  }
}
