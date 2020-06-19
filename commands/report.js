const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

module.exports = {
  name: "report",
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("You cannot use the `w!report` command ouside a game! Please go to <#690077373089185906> to make your report.")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    let target = parseInt(args[0])
    if (isNaN(target) || target > game.players.length || target < 1)
      return await message.author.send("Invalid target.")
    
    let targetPlayer = game.players[target-1]
    if (target == gamePlayer.number) 
      return await message.channel.send(`Why are you trying to report yourself?`)
    
    if (players.get(`${message.author.id}.prompting`))
      return message.channel.send("You have an active prompt already!")
    players.set(`${message.author.id}.prompting`, true)
    
    let reason
    if (args.length > 1) reason = args.slice(1).join(" ")
    else {
      let reasonPrompt = await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("GOLD")
          .setTitle(`What are you reporting **${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** for?`)
          .setDescription(`Please provide details of the reporting reason in less that 300 characters. You have 60 seconds.`)
          .setFooter(`Abusing of the reporting system may result in a penalty for yourself!`)
      )

      let reasonInput = await reasonPrompt.channel
        .awaitMessages(msg => msg.author.id == message.author.id, { time: 60*1000, max: 1, errors: ["time"] })
        .catch(() => {})
      if (!reasonInput)
        return await message.author.send(
          new Discord.MessageEmbed()
            .setColor("RED")
            .setTitle("Prompt timed out.")
        )
      reason = reasonInput.first().content
    }
    if (reason.length > 300) return await message.channel.send("Your message is too long. Please try again!")
    
    let reportEmbed = new Discord.MessageEmbed()
      .setColor("GOLD")
      .setTitle(`Player Report`)
      .setDescription(
        `**Reporter:** ${message.author} (${nicknames.get(message.author.id)})\n` +
        `**Game:** ${game.mode[0].toUpperCase() + game.mode.slice(1)} - ${game.mode == 'custom' ? `${game.name} [\`${game.gameID}\`]` : `Game #${game.gameID}`}\n` +
        `**Reported Player:** ${targetPlayer.number ? `${targetPlayer.number} ` : ""} ${fn.getUser(client, targetPlayer.id)} (${nicknames.get(targetPlayer.id)})\n` +
        `**Reported for:** ${reason}`
      )
      .setFooter("Reported at")
      .setTimestamp()
    
    let confPrompt = await message.channel.send("This report will be sent. Proceed?", reportEmbed)
    await confPrompt.react(fn.getEmoji(client, "green tick"))
    await confPrompt.react(fn.getEmoji(client, "green_tick"))
    let reactions = await confPrompt.awaitReactions(
      (r, u) => r.emoji.id == fn.getEmoji(client, "green_tick").id &&
                u.id == message.author.id,
      { max: 1, time: 10000, errors: ["time"] }
    ).catch(() => {})
    if (!reactions) return await message.author.send("Prompt cancelled.")
    
    await client.channels.cache.get("708216101179490324").send(
      reportEmbed
    )
    await message.channel.send("Your report has been sent and will be inspected by our moderators.")
  }
}