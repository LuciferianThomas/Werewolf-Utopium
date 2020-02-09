const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "join",
  run: async (client, message, args, shared) => {
    // if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    if (Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`) && g.currentPhase < 999)) 
      return await message.author.send("You are already in a game!")
    
    let activeGames = Games.filter(game => game.players.length <= 16 && game.currentPhase < 0 && game.mode == "custom")
    if (!activeGames.length)
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle(`There aren't any custom games right now!`)
      )
    
    if (activeGames.length && !args.length)
      return await message.channel.send(
        new Discord.RichEmbed({
          fields: activeGames.map(x => {
            return {
              name: `${
                !x.config.private ? "" : fn.getEmoji(client, "Private")
              }**${x.name}**${
                !x.config.private ? "" : ` [\`${x.gameID}\`]`
              }`,
              value: `${x.originalRoles.map(y => fn.getEmoji(client, y)).join("")}\n` +
                      `Night ${x.config.nightTime}s / Day ${x.config.dayTime}s / Voting ${x.config.votingTime}s\n` +
                      `**Death Reveal:** ${currentGame.config.deathReveal}`
            }
          })
        })
          .setColor("GOLD")
          .setTitle("Active Custom Games")
      )

    let currentGame = activeGames.find(game => game.gameID.toLowerCase() == args[args.length-1].toLowerCase())
    if (!currentGame) 
      return await message.channel.send(`<:red_tick:597374220267290624> \`${args[args.length-1]}\` is not a valid custom game code!`)
      
    Games[Games.indexOf(currentGame)].players.push({ id: message.author.id, lastAction: moment() })
    currentGame = Games.find(game => game.gameID == currentGame.gameID)
    
    let m = message.author.send(
      new Discord.RichEmbed()
        .setAuthor(`You have joined ${currentGame.name}.`, message.author.displayAvatarURL)
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      new Discord.RichEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL)         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: ${currentGame.gameID}`)
    )
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
      
    if (currentGame.players.length == currentGame.originalRoles.length) require('/app/process/start')(client, currentGame)
  }
}