const Discord = require("discord.js"),
      moment = require("moment"),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const roles = require('/app/util/roles')

const fn = require('/app/util/fn')

module.exports = {
  name: "givecards",
  aliases: ["givecard", "cards", "card"],
  run: async (client, message, args, shared) => {
    let player = players.get(message.author.id)
    if (!player.currentGame) 
      return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick Game!")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == player.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    if (!gamePlayer.role.includes("Seer"))
      return await message.author.send("You do not have the abilities to check on a player.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer check on a player.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only check on a player at night.")
    
    if (args.length > 2 || !gamePlayer.cardsLeft || (args.length > 1 && gamePlayer.cardsLeft == 1)) 
      return await message.author.send("You can only give cards to two players!")
    else {
      for (var i = 0; i < args.length; i++) {
        let target = parseInt(args[0])
        if (isNaN(target) || target > game.players.length || target < 1) {
          await message.author.send("Invalid target.")
          continue;
        }

        let targetPlayer = game.players[target-1]
        if (!targetPlayer.alive) {
          await message.author.send("You cannot give cards to an dead player.")
          continue;
        }
        if (target == gamePlayer.number) {
          await message.author.send("You cannot give cards to yourself.")
          continue;
        }
        if (targetPlayer.card) {
          await message.author.send(`**${targetPlayer.number} ${fn.getUser(client, targetPlayer.id).username}** already has a card!`)
          continue;
        }
        
        targetPlayer.card = 2-gamePlayer.cardsLeft
        message.author.send(
          new Discord.RichEmbed()
            .setTitle("Card given!")
            .setThumbnail(fn.getEmoji(client, `Fortune Teller Card${targetPlayer.card}`).url)
            .setDescription(`You gave `)
        )
      }
    }

    QuickGames[index] = game

    games.set("quick", QuickGames)
  }
}