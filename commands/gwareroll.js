const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn"),
      ms = require("ms")

module.exports = {
  name: "gwastart",
  aliases: ["giveaway"],
  run: async (client, message, args, shared) => {
    if(!message.author.id == "439223656200273932") return
    let messageID = args[0];
    client.giveawaysManager.reroll(messageID).then(() => {
      message.channel.send("Success! Giveaway rerolled!");
    }).catch((err) => {
      message.channel.send("No giveaway found for "+messageID+", please check and try again");
    });
}
}
