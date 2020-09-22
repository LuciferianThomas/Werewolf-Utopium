const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "spectate",
  aliases: [],
  run: async (client, message, args, shared) => {
    if (
      !client.guilds.cache
      .get("522638136635817986")
      .members.cache.get(message.author.id)
      .roles.cache.find(r =>
                        [
        "*",
        "Bot Helper",
        "Developer"
      ].includes(r.name)
                       )
    )
      return undefined
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
    
    let activeGames = Games.filter(game => game.currentPhase < 999 && game.players.length)
    if (!activeGames.length)
      return await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("RED")
          .setTitle(`There aren't any active games right now!`)
      )
    
    if (activeGames.length && !args.length)
      return await message.channel.send(
        new Discord.MessageEmbed({
          fields: activeGames.map(x => {
            return {
              name: x.mode == "custom" ? `${
                !x.config.private ? "" : fn.getEmoji(client, "Private")
              } **${x.name}**${
                x.config.private ? "" : ` [\`${x.gameID}\`]`
              }` : `Game #${x.gameID}`,
              value: `${x.originalRoles.map(y => fn.getEmoji(client, y)).join("")}\n` +
                      `Night ${x.config.nightTime}s / Day ${x.config.dayTime}s / Voting ${x.config.votingTime}s\n` +
                      `**Death Reveal:** ${x.config.deathReveal}`
            }
          })
        })
          .setColor("GOLD")
          .setTitle("Active Games")
      )

    let currentGame = activeGames.find(game => `${game.gameID}`.toLowerCase() == args[args.length-1].toLowerCase())
    if (!currentGame) 
      return await message.channel.send(`${fn.getEmoji(client, "red_tick")} \`${args[args.length-1]}\` is not a valid game ID!`)
      
    Games[Games.indexOf(currentGame)].spectators.push(message.author.id)
    currentGame = Games.find(game => game.gameID == currentGame.gameID)
    
    if (!client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.some(r => ["βTester", "Verified Alts"].includes(r.name)) &&
        currentGame.gameID.match(/^betatest_.*?$/i))
      return await message.channel.send("Only βTesters can spectate βTest Games!")
    
    if (!currentGame.players.length)
      return await message.channel.send("This game lobby is currently empty!")
    
    let embed = new Discord.MessageEmbed()
        .setAuthor(`You are now spectating ${currentGame.name}.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    if(currentGame.spectators.length > 0) embed.addField(`Current Spectators [${currentGame.spectators.length}]`, currentGame.spectators.map(id => nicknames.get(id)).join("\n"))
    let m = message.author.send(embed).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    
    if (!m) return undefined
        
    let m2 = message.author.send(
      new Discord.MessageEmbed().setTitle("Welcome to the game! Here are some useful commands to get started:")
      .setDescription(`\`w!game\` - See the player list and the list of roles in the game\n\`w!leave\` - Stop spectating the game.`)
    )
    
    let embed2 = new Discord.MessageEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} is now spectating.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    if(currentGame.spectators.length > 0) embed2.addField(`Current Spectators [${currentGame.spectators.length}]`, currentGame.spectators.map(id => nicknames.get(id)).join("\n"))
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      embed2
    )
    fn.addLog(currentGame, `${nicknames.get(message.author.id)} is now spectating the game.`)
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}
