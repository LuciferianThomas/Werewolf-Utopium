const Discord = require("discord.js"),
    	moment = require("moment") ,
      db = require("quick.db") 

const games = new db.table("Games"),
      players = new db.table("Players") 

const roles = require('/app/util/roles')

const fn = require('/app/util/fn') 

module.exports = {
  name: 'ignite', 
  run: async (client, message, args, shared) => {
  let player = player.get(message.author.id)
  if (!player.currentGame)
    return await message.author.send("**You are not currently in a game!**\nDo `w!quick` to join a Quick game.")
    
    let QuickGames = games.get("quick"),
        game = QuickGames.find(g => g.gameID == players.currentGame),
        index = QuickGames.indexOf(game),
        gamePlayer = game.players.find(player => player.id == message.author.id)
    
    if (gamePlayer.role != "Arsonist")
      return await message.author.send("You do not have the abilities to ignite players.")
    if (!gamePlayer.alive)
      return await message.author.send("You are dead. You can no longer ignite players.")
    if (gamePlayer.jailed)
      return await message.author.send("You are currently jailed and cannot use your abilities.")
    
    /*
    if (gamePlayer.usedAbilityTonight) {
      let prevA = game.players[gamePlayer.dousedTonight[0]-1]
      let prevB = game.players[gamePlayer.dousedTonight[1]-1]
      prevA.doused.splice(prevA.doused.indexOf(gamePlayer.number), 1)
      prevB.doused.splice(prevB.doused.indexOf(gamePlayer.number), 1)
    }*/
    
    // is that needed? 
    // this? the above is for doused right? 
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only ignite players during the night!")
    
    let doused = game.players.filter(p => p.alive && p.doused.includes(gamePlayer.number))
    //           ^^^^^^^^^^^^^^^^^^^  k
    // this is not the doused var in the player profile,
    // this is the player profiles with the doused var.... ok
    
    if (!doused.length)
      return await message.author.send("You haven't doused anyone or every doused player is dead! Do `w!douse [player1] [player 2]` first!") 
    
    for (var i = 0; i < doused.length; i++) {
      game.players[doused[i].number-1].alive = false
      if (game.config.deathReveal) game.players[doused[i].number-1].roleRevealed = true
      
      fn.broadcastTo(
        client, game.players.filter(p => !p.left),
      	`Arsonist <:Arsonist:> has ignited **${doused[i].number} ${fn.getUser(client, doused[i].id)}${game.config.deathReveal ? ` ${fn.getEmoji(client, doused[0].role)}` : ""}**.`
        //death messaves do not use embeds
        
      ) 
    }
    gamePlayer.usedAbilityTonight = true
    
    QuickGames[index] = game
    games.set("quick", QuickGames)
    
  }
} 