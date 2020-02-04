const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db"),
      fs = require('fs')

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

let commands = new Discord.Collection()

const commandFiles = fs.readdirSync('/app/commands/shop').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`/app/commands/shop/${file}`)
  commands.set(command.name, command)
}

module.exports = {
  name: "custom",
  run: async (client, message, args, shared) => {
    var args = message.content.trim().slice(shared.commandName.length+2).split(/\s+/u)
    
		const commandName = args.shift().toLowerCase()
		const command = commands.get(commandName) || commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
		try {
			await command.run(client, message, args)
		} catch (error) {
			console.log(error)
		}
    return
    
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You are already in a game!")
    
    // if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    let activeGames = Games.filter(game => game.players.length <= 16 && game.currentPhase < 0 && game.mode == "custom")
    if (!activeGames.length)
      return await message.channel.send(
        new Discord.RichEmbed()
          .setColor("RED")
          .setTitle(`There aren't any custom games right now!`)
      )
    
    if (activeGames.length && !args.length)
      return await message.channel.send(
        new Discord.RichEmbed({fields: activeGames.map(x => { return { name: `**${x.name}** [\`${x.gameID}\`]`, value: x.originalRoles.map(y => fn.getEmoji(client, y)).join('') } })})
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
        .setAuthor(`You have joined Game #${currentGame.gameID}.`, message.author.displayAvatarURL)
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
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
    )
      
    if (currentGame.players.length == currentGame.roles.length) require('/app/process/start')(client, currentGame)
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}