const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/utopium/wwou/util/fn.js')

module.exports = {
  name: "leaderboard",
  aliases: ["lb"],
  run: async (client, message, args) => {
    if (args[0] && !["xp","roses","coins"].includes(args[0].toLowerCase()))
      return await message.channel.send("Invalid input. Accepted values: `xp`, `roses`, `coins`.")
    
    if (!args.length) args[0] = 'xp'
    
    let allPlayers = players.all().map(x => {
      if (typeof x.data == 'string') x.data = JSON.parse(x.data)
      let data = {}
      data.roses = x.data.roses || 0
      data.coins = x.data.coins || 0
      data.xp = x.data.xp || 0
      data.id = x.ID
      data.nickname = nicknames.get(x.ID) || (client.users.cache.get(x.ID) ? `* ${client.users.cache.get(x.ID).username}` : "* Unknown User")
      return data
    })
    
    let sortedPlayers = allPlayers.sort((a,b) => {
      if (a[args[0].toLowerCase()] < b[args[0].toLowerCase()]) return 1
      else if (a[args[0].toLowerCase()] > b[args[0].toLowerCase()]) return -1
      if (a.wins < b.wins) return 1
      else if (a.wins > b.wins) return -1
      if (a.nickname == "* Unknown User") return 1
      if (a.nickname.startsWith("*") && !b.nickname.startsWith("*")) return 1
      else if (!a.nickname.startsWith("*") && b.nickname.startsWith("*")) return -1
      if (a.nickname.toLowerCase() > b.nickname.toLowerCase()) return 1
      else if (a.nickname.toLowerCase() < b.nickname.toLowerCase()) return -1
    })
    
    // message.author.send(JSON.stringify(sortedPlayers, null, 2), {code: "fix", split: true})
    
    console.log(sortedPlayers)
    
    let embeds = []
    
    for (var [i, player] of sortedPlayers.entries()) {
      if (i % 10 == 0) embeds.push(new Discord.MessageEmbed().setDescription(""))
      // if(player[args[0].toLowerCase()] == 0 || player[args[0].toLowerCase()] == undefined) continue;
      embeds[embeds.length - 1].description += `${
        i == 0
          ? ":first_place: "
          : i == 1
          ? ":second_place: "
          : i == 2
          ? ":third_place: "
          : `\`${i+1}\` `
    }${player.nickname}${player.id == message.author.id ? " (**you**)" : ""}${args[1] && args[1].toLowerCase() == "debug" ? ` (\`${player.id}\`)` : ""} [\`${player[args[0].toLowerCase()] || 0}\`]\n`
    }
    
    for (var [i, embed] of embeds.entries()) {
      embed
        .setTitle(
          `${
            args[0].toLowerCase() == "xp"
              ? "XP"
              : `${args[0][0].toUpperCase()}${args[0].slice(1).toLowerCase()}`
          } Leaderboard (#${i * 10 + 1}-#${Math.min(
            (i + 1) * 10,
            sortedPlayers.length
          )})`
        )
        .setFooter(
          `Page ${i + 1}/${embeds.length} | Sorted in descending order by ${
            args[0].toLowerCase() == "xp"
              ? "XP"
              : args[0].toLowerCase()
          }.`
        )
    }
    
    let m = await message.channel.send(embeds[0])
    fn.paginator(message.author.id, m, embeds, 0)
    
  }
}