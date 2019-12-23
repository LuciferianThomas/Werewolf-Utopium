const Discord = require('discord.js'),
      moment = require('moment'),
      db = require("quick.db")

const games = new db.table("Games"),
      players = new db.table("Players")

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
	name: "eval",
	usage: "eval <code>",
	description: "Evaluate JavaScript code!",
 // category: "Bot Staff",
 // botStaffOnly: true,
	run: async (client, message, args, shared) => {
    if (!["336389636878368770","658481926213992498"].includes(message.author.id)) return;
    
    const msg = message, bot = client
    
    let modifier = "-e"
    
    if (args[args.length-1] == "-t" || args[args.length-1] == "-l" || args[args.length-1] == "-e") {
      modifier = args.pop()
    }

		try {
			var out = eval(args.join(' '))
			out = JSON.stringify(out)
      
      if (modifier == "-e" && out.length <= 1024-8) message.channel.send(
        new Discord.RichEmbed()
          .setColor("GREEN")
          .setTitle(`${client.guilds.get(config.support).emojis.find(emoji => emoji.name == 'green_tick')} Evaluation Success!`)
          .addField(`Expression`, '```js\n'+args.join(" ")+'```')
          .addField(`Result`, '```js\n'+out+'```')
          .setFooter(client.user.username, client.user.avatarURL)
      ).catch(console.error)
      else if (out.length <= 2000-8 && (modifier == "-t" || (modifier == "-e" && out.length > 1024-8))) message.channel.send('```js\n'+out+'```')
      else if (modifier = "-l") console.log(`${fn.time()} | Evaluation Result | ${out}`)
      else {
        console.log(`${fn.time()} | Evaluation Result | ${out}`)
        message.channel.send(
          new Discord.RichEmbed()
            .setColor("GREEN")
            .setTitle(`${client.guilds.get(config.support).emojis.find(emoji => emoji.name == 'green_tick')} Evaluation Success!`)
            .addField(`Expression`, '```js\n'+args.join(" ")+'```')
            .addField(`Result`, '```js\nOutput too long. Check console log.```')
            .setFooter(client.user.username, client.user.avatarURL)
        ).catch(console.error)
      }
		} catch (e) {
      var embed = new Discord.RichEmbed()
        .setColor("RED")
        .setTitle(`${client.guilds.get(config.support).emojis.find(emoji => emoji.name == 'red_tick')} Evaluation Failed!`)
        .addField(`Expression`, '```js\n'+args.join(" ")+'```')
        .addField(`Error Message`, '```js\n'+e+'```')
        .setFooter(client.user.username, client.user.avatarURL)
			message.channel.send(embed)
        .catch(console.error)
		}
    
	}
}