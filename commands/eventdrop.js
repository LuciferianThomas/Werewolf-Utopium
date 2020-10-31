const fn = require("/home/utopium/wwou/util/fn.js")

module.exports = {
  name: "eventdrop",
  aliases: [],
  run: async (client, message, args) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "Moderator",
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    )
      return undefined
    
    if(args[0]){
      let m = await message.mentions.users.first().send(fn.event())
    } else {
      let m = await message.channel.send(fn.event())
      await fn.sleep(10000)
      await m.edit(`||Bruh why are you looking here, the drop expired ${fn.getEmoji(client, "Harold")}||\nThe event drop has expired!`)
    }
    
  }
}
