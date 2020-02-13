const Discord = require('discord.js'),
      moment = require('moment'),
      fn = require('/app/util/fn')

module.exports = {
  name: "beta",
  run: async (client, message, args, shared) => {
    if (message.guild.id !== "522638136635817986") return;
    if (!message.member.roles.find(r => ["βTester Helper","Developer"].includes(r.name))) return;
    
    let input = moment(new Date(args.join(' '))).utcOffset(8)
    if (input == "Invalid date")
      return await message.channel.send("You inputted an invalid date. Please try again.")
    
    let time = input.format("HH:mm"),
        date = input.format("MMM D, YYYY (ddd)")
    
    let embed = new Discord.RichEmbed()
      .setColor(0xe4b400)
      .setTitle("βTesting Session")
      .setDescription(`${message.author} will be hosting a βTesting Session at [${time} HKT](https://www.thetimezoneconverter.com/?t=${time}&tz=Hong%20Kong&) on ${date}.`)
      .setFooter("React to this message to show your availability.")
    
    let m = await message.channel.send("Please confirm if this is correct.", embed)
    await m.react(fn.getEmoji(client, "green tick"))
    let reactions = await m.awaitReactions(
      (r, u) => r.emoji.id == client.emojis.find(e => e.name == "green_tick").id &&
                u.id == message.author.id,
      { max: 1, time: 10000, errors: ["time"] }
    ).catch(() => {})
    if (!reactions) return await m.edit(
      new Discord.RichEmbed()
        .setColor("RED")
        .setTitle("Prompt cancelled.")
    ).then(m => m.clearReactions().catch(() => {}))
    
    let βTester = fn.getRole(message.guild, "βTester"),
        βtest_announcements = message.guild.channels.find(c => c.name == "βtest-announcements")
    await βTester.setMentionable(true, "βTest Announcement").catch(() => {})
    let n = await βtest_announcements.send(`${βTester}`, embed)
    await βTester.setMentionable(false).catch(() => {})
    
    await n.react(fn.getEmoji(client, "green tick"))
    await n.react(fn.getEmoji(client, "gray tick"))
    await n.react(fn.getEmoji(client, "red tick"))
    
    await m.edit(
      new Discord.RichEmbed()
        .setColor("GREEN")
        .setTitle(`Announcement has been sent.`)
        .setDescription(`Check ${βtest_announcements}!`)
    )
    await m.clearReactions().catch(() => {})
  }
}