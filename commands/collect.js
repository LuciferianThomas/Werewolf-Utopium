const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "collect",
  gameroles: ["Soul Collector"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Soul Collector")
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (gamePlayer.dazzled)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
    
    gamePlayer.box = []
    if (game.players.filter(p => p.boxed).length + args.length > Math.round(game.players.length/4)) 
      return await message.author.send(`You can only select ${Math.round(game.players.length/4)-game.players.filter(p => p.boxed).length} players!`)
    else {
      for (var i = 0; i < args.length; i++) {
        let target = parseInt(args[i])
        if (isNaN(target) || target > game.players.length || target < 1) {
          message.author.send("Invalid target.")
          continue;
        }

        let targetPlayer = game.players[target-1]
        if (!targetPlayer.alive) {
          message.author.send("You cannot target an dead player.")
          continue;
        }
        if (target == gamePlayer.number) {
          message.react(fn.getEmoji(client, "harold"))
          continue;
        }
        
        gamePlayer.box.push(targetPlayer.number)
      }
    }
    message.channel.send("You have selected players " + args.map(x => `**${game.players[x-1].number} ${nicknames.get(game.players[x-1].id)}**`).join(", ") + " to collect their souls if they die!")
    fn.addLog( game,
      `[ACTION] Soul Collector ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} selected ${game.players
        .filter(p => gamePlayer.box.includes(p.number))
        .map(p => `${p.number} ${nicknames.get(p.id)}`)
        .join(", ")} to collect their souls when they die.`
    )
    // QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}