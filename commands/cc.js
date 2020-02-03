const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/app/util/fn'),
      roles = require("/app/util/roles")

module.exports = {
  name: "createcustom",
  aliases: ["cc"],
  run: async (client, message, args, shared) => {
    if (!players.get(`${message.author.id}.custom`))
      return await message.author.send("You cannot create custom games!")
    
    if (players.get(`${message.author.id}.currentGame`)) 
      return await message.author.send("You are already in a game!")
    
    // if (!games.get("count")) games.set("count", 0)
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    
    let currentGame = {
      mode: "custom",
      gameID: "",
      nextPhase: null,
      currentPhase: -1,
      originalRoles: [],
      players: [{
        id: message.author.id,
        lastAction: moment()
      }],
      spectators: [],
      config: {
        deathReveal: true,
        nightTime: 45,
        dayTime: 60,
        votingTime: 45
      }
    }
    
    let rolePrompt = await message.author.send(
      new Discord.RichEmbed()
        .setTitle("Custom Game")
        .setDescription(`Select roles for your custom game by inputting their names or aliases.`)
    )
    
    for (var i = 0; i < 16; i++) {
      let inputRole = rolePrompt.channel.awaitMessages(msg => msg.author.id == message.author.id, { time:  })
    }
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      new Discord.RichEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL)         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
    )
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}