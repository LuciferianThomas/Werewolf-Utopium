const Discord = require('discord.js'),
      moment = require('moment'),
      fn = require('')

module.exports = {
  name: "beta",
  run: async (client, message, args, shared) => {
    let time = moment(args.join(' ')).utcOffset(8).format("YYYY/MM/DD HH:mm:ss")
    if (time == "Invalid date")
      return await message.channel.send("You inputted an invalid date. Please try again.")
    
    let embed = new Discord.RichEmbed()
      .setColor(0xe4b400)
      .setTitle("βTesting Session")
      .setDescription(`${message.author} will be hosting a βTesting Session at 21:00 HKT on Feb 12, 2020.`)
    
    let m = await message.channel.send(
      "Please confirm if this is correct."
    )
  }
}