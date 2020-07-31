
const Discord = require("discord.js"),
      moment = require("moment"),
      fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "feedback",
  run: async (client, message, args, shared) => {
    let feedback = message.content.slice(shared.commandName.length+3).trim()
    if (!feedback.length) {
      let prompt = await message.channel.send("What do you want to give feedback for? You have 120 seconds.")
      let res = (await message.channel.awaitMessages(msg => msg.author.id == message.author.id, { time: 2*60*1000, max: 1, errors: ["time"] })).first()
      if (!res)
        return await message.channel.send(new Discord.MessageEmbed().setColor("RED").setTitle("Prompt timed out."))
      feedback = res.content
    }
    
    if (feedback.length > 1000)
      return await message.channel.send(new Discord.MessageEmbed().setColor("RED").setTitle("Input exceeded character limit (1000)!"))
    
    let embed = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setAuthor(message.author.tag, message.author.avatarURL({format: "png", dynamic: true, size: 1024}))
      .setDescription(feedback)
      .setTimestamp()
    let conf = await message.channel.send(
      "You are about to send this feedback. Confirm?\n" +
      "**⚠ Warning: Abuse of feedback system will result in penalty.**",
      embed
    )
    conf.react(fn.getEmoji(client, "green tick"))

    let reactions = await conf.awaitReactions(
      (r, u) =>
        r.emoji.id == fn.getEmoji(client, "green tick").id &&
        u.id == message.author.id,
      { max: 1, time: 10000, errors: ["time"] }
    )
    if (!reactions)
      return await message.channel.send(new Discord.MessageEmbed().setColor("RED").setTitle("Prompt timed out."))
        .then(m => m.reactions.removeAll().catch(() => {}))
    conf.reactions.removeAll()
    
    let m = await client.channels.cache.get("658924403899236385").send(embed)
    await conf.edit("** **", new Discord.MessageEmbed().setColor("GREEN").setTitle("Your feedback has been sent!"))
    await m.react(fn.getEmoji(client, "upvote"))
    await m.react(fn.getEmoji(client, "downvote"))
  }
}