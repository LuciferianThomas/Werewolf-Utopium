const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: 'douse',
  gameroles: ["Arsonist"],
  run: async (client, message, args, shared) => {
		let player = players.get(message.author.id)
    if (!player.currentGame)
    return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick game.")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Arsonist")
      return await message.author.send("You do not have the abilities to douse a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer douse a player.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only douse players during the night!")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (gamePlayer.usedAbilityTonight == "ignite")
      return await message.author.send("You already ignited doused players tonight!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (args.length == 2 && args[0] == args[1])
      return await message.author.send("You must select different targets!")
    
    let successfulDouses = []
    
    for (var target of args) {
      target = parseInt(target)
      if (isNaN(target) || target > game.players.length || target < 1) {
        await message.author.send("Invalid target.")
        continue;
      }
      let targetPlayer = game.players[target-1]
      if (!targetPlayer.alive) {
        await message.author.send(`**${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** is already dead!`)
        continue;
      }
      if ((gamePlayer.doused || []).includes(targetPlayer.number)) {
        await message.author.send(`You doused **${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** already!`)
        continue;
      }
      if (gamePlayer.number == targetPlayer.number) {
        await message.react(fn.getEmoji(client, "harold"))
        continue;
      }
      if (targetPlayer.role == "President") {
        await message.channel.send("You cannot douse the President!")
        continue;
      }
      successfulDouses.push(targetPlayer)
    }
    
    if (!successfulDouses.length) return undefined;
    
    message.author.send(
    	new Discord.MessageEmbed()
        .setTitle(`Doused Players`)
        .setThumbnail(fn.getEmoji(client, "Arsonist Doused").url)
        .setDescription(
          `You chose to douse ${successfulDouses.map(x => `**${x.number} ${nicknames.get(x.id)}**`).join(' and ')}!`
        )
    )
    
    fn.addLog(
      game,
      `[ACTION] Arsonist ${gamePlayer.number} ${nicknames.get(
        gamePlayer.id
      )} chose to douse ${successfulDouses
        .map(x => `${x.number} ${nicknames.get(x.id)} (${x.role})`)
        .join(" and ")}.`
    )
    
    gamePlayer.usedAbilityTonight = successfulDouses.map(x => x.number)
    
    QuickGames[index] = game
    games.set("quick", QuickGames)
  }
} 