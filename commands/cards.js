const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames

const fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require("/home/utopium/wwou/util/roles.js")

module.exports = {
  name: "cards",
  aliases: ["card"],
  gameroles: ["Fortune Teller"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (gamePlayer.role !== "Fortune Teller")
      return await message.author.send("You do not have the abilities to give cards.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer give cards to other players.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    if (gamePlayer.nightmared)
      return await message.author.send("You are having a nightmare and cannot use your abilities!")
    if (gamePlayer.dazzled == game.currentPhase)
      return await message.author.send("You are dazzled and cannot use your abilities!")
    if (game.currentPhase >= 999)
      return await message.author.send("The game is over! You can no longer use your actions.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only give cards during the night.")
    
    if (args.length > 2 || gamePlayer.cards.length == 2 || (args.length > 1 && gamePlayer.cards.length == 1)) 
      return await message.author.send("You can only give cards to two players!")
    else {
      for (var i = 0; i < args.length; i++) {
        let target = parseInt(args[i])
        if (isNaN(target) || target > game.players.length || target < 1) {
          message.author.send("Invalid target.")
          continue;
        }

        let targetPlayer = game.players[target-1]
        if (!targetPlayer.alive) {
          message.author.send("You cannot give cards to a dead player.")
          continue;
        }
        if (target == gamePlayer.number) {
          message.react(fn.getEmoji(client, "harold"))
          continue;
        }
        if (gamePlayer.cards.includes(targetPlayer.number)) {
          message.author.send(`**${targetPlayer.number} ${nicknames.get(targetPlayer.id)}** already has your card!`)
          continue;
        }
        
        gamePlayer.cards.push(targetPlayer.number)
        message.author.send(
          new Discord.MessageEmbed()
            .setTitle("Card given!")
            .setThumbnail(fn.getEmoji(client, `Fortune Teller Card1`).url)
            .setDescription(`You gave **${targetPlayer.number} ${fn.getUser(client, targetPlayer.id)}** a card to reveal their roles.`)
        )
        
        fn.getUser(client, targetPlayer.id).send(
          new Discord.MessageEmbed()
            .setTitle("Fortune Teller's Card")
            .setThumbnail(fn.getEmoji(client, `Fortune Teller Card1`).url)
            .setDescription(
              "The Fortune Teller gave you a card to reveal your identity (`w!reveal card`)." +
              " You can use your card at any time."
            )
        )
                
        fn.addLog(
          game,
          `[ACTION] ${gamePlayer.role} ${gamePlayer.number} ${nicknames.get(gamePlayer.id)} gave a card to ${
          targetPlayer.number} ${nicknames.get(targetPlayer.id)} (${targetPlayer.role}).`
        )
      }
    }
    
    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}