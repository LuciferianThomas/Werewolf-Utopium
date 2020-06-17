const Discord = require("discord.js"),
      db = require("quick.db")

const players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js')

module.exports = {
  name: "profile",
  aliases: ["prof", "p"],
  run: async (client, message, args) => {
    let target
    if (!args[0]) target = message.author
    else if (message.mentions.users.size) target = message.mentions.users.first()
    if (!target && args[0]) 
      target = fn.getUser(
        client, 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")) ? 
        nicknames.all().find(x => JSON.parse(x.data).toLowerCase() == args[0].toLowerCase().replace(/_/g, "\\_")).ID : args[0]
      )
    if (args[0] && !target)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} User \`${args[0]}\` not found.`)
    if (!target)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    
    let player = players.get(target.id)
    if (!player)
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} Target not found.`)
    
    let allGamesPlayed = fn.clone(player.wins)
    allGamesPlayed.push(...player.loses)
    
    return await message.channel.send(
      new Discord.MessageEmbed({fields: []})
        .setAuthor(`User Profile | ${nicknames.get(target.id) ? nicknames.get(target.id).replace(/\\_/g, "_") : `\* ${target.username}`}`)
        .setThumbnail(target.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .addField("Coins", player.coins, true)
        .addField("XP", player.xp, true)
        .addField("Roses", player.roses, true)
        .addField("Gems", player.gems ? player.gems : "0", true)
        .addField(
          "**Statistics**",
          `**Games played:** ${allGamesPlayed.length + player.suicides}\n` +
          `**Wins:** ${player.wins.length} (${Math.floor(player.wins.length/(allGamesPlayed.length + player.suicides)*10000)/100}%)\n` +
          `**Defeats:** ${player.loses.length} (${Math.floor(player.loses.length/(allGamesPlayed.length + player.suicides)*10000)/100}%)\n` +
          `**Suicides:** ${player.suicides} (${Math.floor(player.suicides/(allGamesPlayed.length + player.suicides)*10000)/100}%)`
        )
        .addField(
          "**Teams**",
          `**Wins as Village:** ${player.wins.filter(x => x.team == "Village").length} (${Math.floor(player.wins.filter(x => x.team == "Village").length/allGamesPlayed.filter(x => x.team == "Village").length*10000)/100}%)\n` +
          `**Defeats as Village:** ${player.loses.filter(x => x.team == "Village").length} (${Math.floor(player.loses.filter(x => x.team == "Village").length/allGamesPlayed.filter(x => x.team == "Village").length*10000)/100}%)\n` +
          `**Wins as Werewolves:** ${player.wins.filter(x => x.team == "Werewolves").length} (${Math.floor(player.wins.filter(x => x.team == "Werewolves").length/allGamesPlayed.filter(x => x.team == "Werewolves").length*10000)/100}%)\n` +
          `**Defeats as Werewolves:** ${player.loses.filter(x => x.team == "Werewolves").length} (${Math.floor(player.loses.filter(x => x.team == "Werewolves").length/allGamesPlayed.filter(x => x.team == "Werewolves").length*10000)/100}%)\n` +
          `**Wins as Solo:** ${player.wins.filter(x => x.team == "Solo").length} (${Math.floor(player.wins.filter(x => x.team == "Solo").length/allGamesPlayed.filter(x => x.team == "Solo").length*10000)/100}%)\n` +
          `**Defeats as Solo:** ${player.loses.filter(x => x.team == "Solo").length} (${Math.floor(player.loses.filter(x => x.team == "Solo").length/allGamesPlayed.filter(x => x.team == "Solo").length*10000)/100}%)`
        )
      // .addField("\u200b", 
      //           `[Click here to see ${
      //           target == message.author ? "your" : nicknames.get(target.id) + "'s"
      //           } personal profile on our website](https://werewolf-utopium.glitch.me/profile/${nicknames.get(
      //   target.id
      // )} "${nicknames.get(target.id)}\'s Profile on Werewolf Utopium")`
      //           `[Click here to see ${
      //           target == message.author ? "your" : nicknames.get(target.id) + "'s"
      //           } personal profile on our website](https://werewolf-utopium.glitch.me/profile/${nicknames.get(
      //   target.id
      // )} "${nicknames.get(target.id)}\'s Profile on Werewolf Utopium")`)
    )
  }
}