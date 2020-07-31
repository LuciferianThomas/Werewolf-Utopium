const Discord = require("discord.js"),
      db = require('quick.db'),
      moment = require('moment')

const fn = require("/home/utopium/wwou-staff/util/fn")

module.exports = {
  name: "gwaclm",
  run: async (client, message, args, shared) => {
    if (message.guild.id !== "522638136635817986" && !message.member.roles.cache.get("678427121701617676"))
      return undefined;
    
    if (!args.length) 
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please mention the user you want to add an giveaway infraction.`)
		let target = message.mentions.members.filter(member => member.user.id != client.user.id).first()
    if (!target)
      target = await fn.getMember(message.guild, args[0])
    if (!target)
      return await message.channel.send(`${fn.getEmoji(client, "red tick")} Please mention the user you want to add an giveaway infraction.`)
    
    let msg = await client.channels.cache.get("704231388592996392").messages.fetch(args[1])
    if (!msg) return await message.channel.send(`${fn.getEmoji(client, "red tick")} Unknown message.`)
    
    await client.channels.cache.get("704231388592996392").send(
      new Discord.MessageEmbed()
        .setColor(0x7289da)
        .setDescription(`${fn.getEmoji(client, "green tick")} ${target.user} claimed their reward for [this giveaway](${msg.url}) of **${msg.embeds[0].author.name}**.`)
    )
  }
}
