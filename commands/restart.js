const db = require("quick.db"),
      cmd = require("node-cmd"),
      temp = new db.table("temp"),
      fn = require('/home/utopium/wwou/util/fn.js'),
      games = new db.table("Games")

module.exports = {
	name: "restart",
	usage: "restart",
	description: "Restart the bot!",
	run: async (client, message, args, shared) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "Bot Helper",
            "Developer"
          ].includes(r.name)
        )
    )
      return undefined
    
    if (!games.get("quick")) games.set("quick", [])
    let Games = games.get("quick")
    let activeGames = Games.filter(game => game.currentPhase < 999)
    if (!activeGames.length){
      temp.set("gamealert", false)
    } else {
      activeGames.forEach(game => {
        if (!game.players.length) return;
        game.players.forEach(p => client.users.cache.get(p.id).send("The bot is currently rebooting. It will not respond until it has finished. Don't worry, your game will pick back up right where it left off!"))
        fn.addLog(game, "-divider-")
        fn.addLog(game, `Bot restart in progress, initated by ${message.author.tag}.`)
      })
      temp.set("gamealert", true)
    }
    temp.set("rebootchan", `${message.channel.type == "dm" ? message.author.id : message.channel.id}`)
    temp.set("rebootchantype", `${message.channel.type}`)
    fn.addLog("MAIN", `Bot restart in progress, initated by ${message.author.tag}.`)
    await message.channel.send("Rebooting bot, please wait...")
    await fn.sleep(5000)
    client.user.setStatus('offline')
    cmd.run(`pm2 restart ${process.env.pm_id}`)
	}
}