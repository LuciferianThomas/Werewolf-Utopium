const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = new db.table("Nicknames")

const fn = require('/home/sd/wwou/util/fn.js'),
      roles = require("/home/sd/wwou/util/roles.js")

const sandboxGameRoles = [
  ["Aura Seer","Bodyguard","Gunner","Junior Werewolf","Mayor","Wolf Seer","Detective","Fool",
   "Random Regular Villager","Wolf Pacifist","Jailer","Shadow Wolf","Random Killer","Doctor","Random Regular Villager","Medium"],
  ["Doctor","Seer","Pacifist","Random Werewolf","Random Regular Villager","Wolf Seer","Gunner","Random Voting",
   "Red Lady","Medium","Junior Werewolf","Loudmouth","Random Killer","Avenger","Guardian Wolf","Random Regular Villager"],
  ["Aura Seer","Beast Hunter","Gunner","Junior Werewolf","Random Regular Villager","Wolf Seer","Detective","Fool",
   "Pacifist","Wolf Pacifist","Random Killer","Jailer","Kitten Wolf","Doctor","Random Regular Villager","Medium"],
  ["Aura Seer","Alpha Werewolf","Beast Hunter","Medium","Random Regular Villager","Wolf Shaman","Handsome Prince","Soul Collector",
   "Jailer","Random Werewolf","Marksman","Random Killer","Flower Child","Guardian Wolf","Detective","Random Strong Villager"],
  [Math.random()<0.5?"Beast Hunter":"Witch","Sheriff","Werewolf","Mayor","Jailer","Wolf Seer","Doppelganger","Detective",
   "Medium","Wolf Shaman","Soul Collector","Random Killer",Math.random()<0.5?"Gunner":"Marksman","Shadow Wolf","Loudmouth","Random Regular Villager"]
]

module.exports = {
  name: "sandbox",
  aliases: ["sb"],
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
    
    let currentGame = Games.find(game => game.players.length <= 16 && game.currentPhase < -0.5 && game.mode == "sandbox")
    if (currentGame) {
      Games[Games.indexOf(currentGame)].players.push({ id: message.author.id, lastAction: moment() })
      currentGame = Games.find(game => game.gameID == currentGame.gameID)
    } else {
      let roles = sandboxGameRoles[Math.floor(Math.random()*sandboxGameRoles.length)]
      currentGame = {
        mode: "sandbox",
        gameID: games.add("count", 1),
        nextPhase: null,
        currentPhase: -1,
        originalRoles: roles,
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
      await fn.addLog(currentGame.gameID, `New game: ${currentGame.gameID}`)
      await fn.addLog(currentGame.gameID, `Mode: ${currentGame.mode}`)
      await fn.addLog(currentGame.gameID, `Game roles: ${roles.join(", ")}`)
      Games.push(currentGame)
    }
    
    let m = message.author.send(
      new Discord.MessageEmbed()
        .setAuthor(`You have joined Game #${currentGame.gameID}.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
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
        .setAuthor(`${nicknames.get(message.author.id).replace(/\\_/g, "_")} joined the game.`, message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))         
        .addField(`Current Players [${currentGame.players.length}]`, currentGame.players.map(player => nicknames.get(player.id)).join("\n"))
        // .addField(`Current Spectators [${currentGame.spectators.length}]`, currentGame.spectators.map(id => nicknames.get(id)).join("\n"))
    )
    let alt = false
    if (client.guilds.cache.get("522638136635817986").members.cache.get(message.author.id).roles.cache.find(r => r.name == "Verified Alts")) alt = true
    fn.addLog(currentGame, `${nicknames.get(message.author.id)} joined the game.${alt ? " (Verified Alt)" : ""}`)
    
    if (message.guild) message.channel.send(`**${nicknames.get(message.author.id)}** has now joined **Sandbox Game #${currentGame.gameID}**.`)
    
    games.set("quick", Games)
    players.set(`${message.author.id}.currentGame`, currentGame.gameID)
      
    if (currentGame.players.length == 16) require('/home/sd/wwou/process/start')(client, currentGame)
  }
}