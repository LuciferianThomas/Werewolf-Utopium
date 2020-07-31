const Discord = require("discord.js"),
  moment = require("moment"),
  db = require("quick.db"),
  ms = require("ms")

const giveaways = new db.table("giveaways")

const fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "start",
  aliases: ["begin"],
  run: async (client, message, args, shared) => {
    let time = ms(args[0])
    let prettytime = ms(time, {long: true})
    let winners = args[1].replace("w", "")
    let prize = args.slice(2).join(" ")
    let endTime = moment().add(time/1000, 's')
    let startTime = moment()
    if (!time || !winners || !prize)
      return await message.channel.send("Missing arguments!")
    let embed = new Discord.MessageEmbed()
      .setAuthor(prize)
      .setDescription(
        `React with 🎉 to enter!\nTime Remaining: **${prettytime}**\nHosted by: <@${message.author.id}>`
      )
      .setColor(0x7289da)
      .setFooter(`${winners} winner${winners == 1 ? "" : "s"} | Ends at`)
      .setTimestamp(endTime)
    let m = await message.channel.send(embed)
    let gwa = {
      time: time,
      winners: winners,
      prize: prize,
      hostedBy: message.author.id,
      message: m.id,
      channel: message.channel.id,
      startTime: startTime,
      endTime: endTime,
      ended: false,
      bonusEntries: false
    }
    console.log(gwa)
    await m.react("🎉")
    giveaways.set(m.id, gwa)
  }
}
