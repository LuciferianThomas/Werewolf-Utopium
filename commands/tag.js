const Discord = require("discord.js"),
  moment = require("moment-timezone"),
  fn = require("/app/util/fn"),
  db = require("quick.db"),
  tags = new db.table("tags")

module.exports = {
  name: "tag",
  run: async (client, message, args, shared) => {
    if (
      args[0] == "create" &&
      client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "βTester Helper",
            "Mini Moderator",
            "Moderator",
            "Helper",
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    ) {
      tags.set(args[1], args.slice(2).join(" "))
      message.channel.send(`Tag \`${args[0]}\` created successfully`)
    } else if(args[0]){
      let tag = tags.get(args[0])
      if(!tag) message.author.send(`Unable to find a tag called \`${args[0]}\``)
      await message.channel.send(
      new Discord.MessageEmbed()
        .setColor(0x708ad7)
        .setTitle(args[0])
        .setDescription(`${tag}`)
        .setFooter("Requested by "+message.author.tag)
    )
    } else {
      let alltags = tags.all()
      let embed = new Discord.MessageEmbed()
        .setColor(0x708ad7)
        .setTitle(args[0])
        .setDescription(``)
        .setFooter("Requested by "+message.author.tag)
      alltags.forEach(tag => embed.description += `\`\``)
    }
  }
}
