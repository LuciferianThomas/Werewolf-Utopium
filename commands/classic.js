const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const fn = require('/app/util/fn')
module.exports = {
  name: "quick",
  aliases: ["q"],
  run: async (client, message, args, shared) => {
    if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    if (Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`))) {
      let prevGame = Games.find(g => g.gameID == players.get(`${message.author.id}.currentGame`)),
          prevGamePlayer = prevGame.players.find(p => p.id == message.author.id)
      if (prevGame.currentPhase < 999 && !prevGamePlayer.left)
        return await message.author.send("You are already in a game!")
      else prevGamePlayer.left = true
    }
    
    let currentGame = Games.find(game => game.players.length <= 16 && game.currentPhase < -0.5 && game.mode == "quick")
    if (currentGame) {
      Games[Games.indexOf(currentGame)].players.push({ id: message.author.id, lastAction: moment() })
      currentGame = Games.find(game => game.gameID == currentGame.gameID)
    } else {
      let count = games.add("count", 1)
      // await fn.addLog(count, `New game: ${count}`)
      // await fn.addLog(count, `Game roles: ${roles.join(", ")}`)
      currentGame = {
        mode: "classic",
        gameID: count,
        nextPhase: null,
        currentPhase: -1,
        players: [{
          id: message.author.id,
          lastAction: moment()
        }],
        logs: "",
        logMsgs: [],
        spectators: [],
        config: {
          deathReveal: true,
          talismans: true
        }
      }
      Games.push(currentGame)
    }
    
    let m = message.author.send(
      new Discord.MessageEmbed()
        .setAuthor(`You have joined Game #${currentGame.gameID}.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => player.nickname))
    ).catch(async error => {
      await message.channel.send("**I cannot DM you!**\nPlease make sure you enabled Direct Messages on at least one server the bot is on.")
      return undefined
    })
    if (!m) return undefined
    
    let m2 = message.author.send(
      new Discord.MessageEmbed().setTitle("Welcome to the game! Here are some useful commands to get started:")
      .setDescription(`\`w!start\` - Vote to start the game (4 people required)\n\`w!game\` - See the player list and the list of roles in the game\n\`w!leave\` - Leave the game. **Warning: Doing this after the game starts is considered suiciding**`)
    )
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      new Discord.MessageEmbed()
        .setAuthor(`${player.nickname} joined the game.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
    )
    
    fn.addLog(currentGame, `${nicknames.get(message.author.id)} joined the game.`)
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
      
    if (currentGame.players.length == 16) require('/app/process/start')(client, currentGame)
  }
}