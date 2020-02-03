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
  run: async (client, message, args, shared) => { return;
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
        .setTitle("Custom Game Setup")
        .setDescription(
          `Select roles for your custom game by inputting their names or aliases.\n` +
          "Type `end` to end your selection."
        )
    )
    
    for (var i = 0; i < 16; i++) {
      let inputRole = rolePrompt.channel
        .awaitMessages(msg => msg.author.id == message.author.id, { time: 30*1000, max: 1, errors: ["time"] })
        .catch(() => {})
      
      if (i < 4 && !inputRole)
        return await message.author.send(
          new Discord.RichEmbed()
            .setColor("RED")
            .setTitle("Prompt timed out.")
        )
      else if (!inputRole || inputRole.first().content.toLowerCase() == "end")
        break;
      
      let role = Object.values(roles).find((data) => data.name.toLowerCase().startsWith(inputRole.toLowerCase()) || (data.abbr && data.abbr.startsWith(inputRole.toLowerCase())))
      if (!role) {
        await message.author.send("Unknown role.")
        i--; continue;
      }
      currentGame.originalRoles.push(role.name)
    }
    await message.author.send(
      new Discord.RichEmbed()
        .setTitle("Custom Game Setup")
        .setDescription(
          currentGame.originalRoles.map(r => `${fn.getEmoji(client, r)} ${r}`).join('\n')
        )
    )
    
    let gameCode
    while (!gameCode) {
      let gcPrompt = await message.author.send(
        new Discord.RichEmbed()
          .setTitle("Custom Game Setup")
          .setDescription(
            `Select a join code for your game.`
          )
      )
      
      // gcPrompt.channel.awaitMessages()
    }
    
    fn.broadcastTo(
      client, currentGame.players.filter(p => p.id !== message.author.id),
      new Discord.RichEmbed()
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL)         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        .setFooter(`Custom Game Code: `)
    )
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
  }
}