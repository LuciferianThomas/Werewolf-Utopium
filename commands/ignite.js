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
    
    if (game.currentPhase % 3 != 0)
      return await message.author.send("You can only ignite players during the night!")
    
    let doused = game.players.filter(p => p.alive && p.doused.includes(gamePlayer.number))
    
    if (!doused.length)
      return await message.author.send("You haven't doused anyone or every doused player is dead! Do `w!douse [player1] [player2]` first!") 
    
    for (var i = 0; i < doused.length; i++) {
      let dousedPlayer = game.players[doused[i].number-1]
      
      dousedPlayer.alive = false
      if (game.config.deathReveal) dousedPlayer.roleRevealed = dousedPlayer.role
      
      fn.broadcastTo(
        client,
        game.players.filter(p => !p.left),
        `<:Arsonist_Ignite:664263079273431054> The Arsonist <:Arsonist:660365416480243752> has ignited **${
          doused[i].number
        } ${fn.getUser(client, dousedPlayer.id)}${
          game.config.deathReveal
            ? ` ${fn.getEmoji(client, dousedPlayer.role)}`
            : ""
        }**.`
      ) 

      if (["Junior Werewolf","Avenger"].includes(dousedPlayer.role) && dousedPlayer.avenge) {
        let avengedPlayer = game.players[dousedPlayer.avenge-1]

        avengedPlayer.alive = false
        if (game.config.deathReveal) avengedPlayer.roleRevealed = avengedPlayer.role

        fn.broadcastTo(
          client,
          game.players.filter(p => !p.left),
          `${fn.getEmoji(
            client,
            `${dousedPlayer.role} Select`
          )} The ${dousedPlayer.role.toLowerCase()}'s death has been avenged, **${
            avengedPlayer.number
          } ${fn.getUser(client, avengedPlayer.id).username}${
            game.config.deathReveal
              ? ` ${fn.getEmoji(client, avengedPlayer.role)}`
              : ""
          }** is dead!`
        )
      }
    }
    gamePlayer.usedAbilityTonight = true
    
    QuickGames[index] = game
    games.set("quick", QuickGames)
  }
} 