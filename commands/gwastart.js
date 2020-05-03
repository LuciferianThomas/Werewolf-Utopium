const Discord = require("discord.js"),
      moment = require("moment-timezone"),
      fn = require("/app/util/fn"),
      ms = require("ms")

module.exports = {
  name: "gwastart",
  aliases: ["giveaway"],
  run: async (client, message, args, shared) => {
    if(!message.author.id == "439223656200273932") return
    client.giveawaysManager.start(message.channel, {
      time: ms(args[0]),
      prize: args.slice(2).join(" "),
      embedColorWin: "#36393F",
      winnerCount: parseInt(args[1])
    }).then((gData) => {
      console.log(gData); // {...} (messageid, end date and more)
    });
}
}
