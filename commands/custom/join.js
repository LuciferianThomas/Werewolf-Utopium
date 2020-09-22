const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "join",
  run: async (client, message, args, shared) => {
    // if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    if (Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`))) {
      let prevGame = Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`)),
          prevGamePlayer = prevGame.players.find(p => p.id == message.author.id)
      if (prevGame.currentPhase < 999 && !prevGamePlayer.left)
        return await message.author.send("You are already in a game!")
      else prevGamePlayer.left = true
    }
    
    let activeGames = Games.filter(game => game.players.length <= 16 && game.currentPhase < -0.5 && game.mode == "custom")
    if (!activeGames.length)
      return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`There aren't any custom games right now!`)
      )
    
    if (activeGames.length && !args.length)
      return await message.channel.send(
        new Discord.MessageEmbed({
          fields: activeGames.map(x => {
            return {
              name: `${
                !x.config.private ? "" : fn.getEmoji(client, "Private")
              } **${x.name}**${
                x.config.private ? "" : ` [\`${x.gameID}\`]`
              }`,
              value: `${x.originalRoles.map(y => fn.getEmoji(client, y)).join("")}\n` +
                      `Night ${x.config.nightTime}s / Day ${x.config.dayTime}s / Voting ${x.config.votingTime}s\n` +
                      `**Death Reveal:** ${x.config.deathReveal}`
            }
          })
        })
          .setColor("GOLD")
          .setTitle("Active Custom Games")
      )

    let currentGame = activeGames.find(game => game.gameID.toLowerCase() == args[args.length-1].toLowerCase())
    if (!currentGame) 
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} \`${args[args.length-1]}\` is not a valid custom game code!`)
      
    Games[Games.indexOf(currentGame)].players.push({ id: message.author.id, lastAction: moment() })
    currentGame = Games.find(game => game.gameID == currentGame.gameID)
    
    if (!client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.some(r => ["βTester", "Verified Alts"].includes(r.name)) &&
        currentGame.gameID.match(/^betatest_.*?$/i))
      return await message.channel.send("Only βTesters can participate in βTest Games!")
    
    let m = message.author.send(
      new Discord.MessageEmbed()
        .setAuthor(`You have joined ${currentGame.name}.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
        
    let m2 = message.author.send(
      new Discord.MessageEmbed().setTitle("Welcome to the game! Here are some useful commands to get started:")
      .setDescription(`\`w!start\` - Vote to start the game (4 people required)\n\`w!game\` - See the player list and the list of roles in the game\n\`w!leave\` - Leave the game. **Warning: Doing this after the game starts is considered suiciding**`)
    )
    
    let embed = 
      new Discord.MessageEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    if (currentGame.spectators.length)
      embed.addField(`Current Spectators [${currentGame.spectators.length}]`, currentGame.spectators.map(id => nicknames.get(id)).join("\n"))
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      embed
    )
    let alt = false
    if (client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.find(r => r.name == "Verified Alts")) alt = true
    fn.addLog(currentGame, `${nicknames.get(message.author.id)} joined the game.${alt ? " (Verified Alt)" : ""}`)
    
    if (message.guild) message.channel.send(`**${nicknames.get(message.author.id)}** has now joined **Custom Game ${currentGame.name} ${currentGame.config.private ? "" : `[\`${currentGame.gameID}\`]`}**.`)
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
      
    if (currentGame.players.length == currentGame.originalRoles.length) require('/home/utopium/wwou/process/start')(client, currentGame)
  }
}