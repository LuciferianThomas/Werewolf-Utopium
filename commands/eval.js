const Discord = require('discord.js'),
      moment = require('moment'),
      db = require("quick.db"),
      handybag = require("handybag"),
      os = require('os'),
      osutils = require('os-utils');

const games = new db.table("Games"),
      players = new db.table("Players"),
      nicknames = require("/home/utopium/global/db.js").nicknames,
      temp = new db.table("Temp"),
      authdb = require("/home/utopium/global/db.js").authdb,
      logs = new db.table("Logs"),
      apidb = new db.table("api")

const config = require('/home/utopium/wwou/util/config.js'),
      fn = require('/home/utopium/wwou/util/fn.js'),
      roles = require('/home/utopium/wwou/util/roles.js'),
      tags = require('/home/utopium/wwou/util/tags.js'),
      shop = require("/home/utopium/wwou/util/shop")

const olduwchook = new Discord.WebhookClient("767876902018613258", "Vt617bqzYkLUZVeDLxzHId2QoP-zeXrbyv_0OMIUnxOrq9YYdtc4bsXX3AxcWySOOY7h")
const uwchook = new Discord.WebhookClient("769979833765199903", "_EQgOzAYhiBQS0FXiDa5T8erzOVquXg2LN9clPAcCU4bI8wEXvZOwOYTJV5kqrk0yBf2")


module.exports = {
	name: "eval",
	usage: "eval <code>",
	description: "Evaluate JavaScript code!",
 // category: "Bot Staff",
 // botStaffOnly: true,
	run: async (client, message, args, shared) => {
    if (
      !client.guilds.cache
        .get("522638136635817986")
        .members.cache.get(message.author.id)
        .roles.cache.find(r =>
          [
            "*",
            "Bot Helper",
            "Developer",
            "TheShadow"
          ].includes(r.name)
        )
    )
      return undefined
    
    const msg = message, bot = client
    
    let modifier = "-e"
    
    if (args[args.length-1] == "-t" || args[args.length-1] == "-l" || args[args.length-1] == "-e") {
      modifier = args.pop()
    }

		try {
			var out = eval(args.join(' '))
			out = JSON.stringify(out)
      if (out === undefined) out = "undefined"
      var input = args.join(' ').substring(0, 1024)
      
      if (modifier == "-e" && out.length <= 1024-8) await message.channel.send(
        new Discord.MessageEmbed()
          .setColor("GREEN")
          .setTitle(`${fn.getEmoji(client, 'green_tick')} Evaluation Success!`)
          .addField(`Expression`, `\`\`\`js\n${args.join(" ")}\`\`\``)
          .addField(`Result`, `\`\`\`js\n${out}\`\`\``)
          .setFooter(client.user.username, client.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }))
      ).catch(console.error)
      else if (out.length <= 2000-8 && (modifier == "-t" || (modifier == "-e" && out.length > 1024-8))) message.channel.send('```js\n'+out+'```')
      else if (modifier = "-l") console.log(`${fn.time()} | Evaluation Result | ${out}`)
      else {
        console.log(`${fn.time()} | Evaluation Result | ${out}`)
        await message.channel.send(
          new Discord.MessageEmbed()
            .setColor("GREEN")
            .setTitle(`${fn.getEmoji(client, 'green_tick')} Evaluation Success!`)
            .addField(`Expression`, '```js\n'+args.join(" ")+'```')
            .addField(`Result`, '```js\nOutput too long. Check console log.```')
            .setFooter(client.user.username, client.user.avatarURL({ format: 'png', dynamic: true, size: 1024 }))
        ).catch(console.error)
      }
		} catch (e) {
      let emsg = `\`\`\`js\n${e.stack.replace(
        /(?:(?!\n.*?\(\/home\/utopium\/wwou.*?)\n.*?\(\/.*?\))+/g,
        "\n\t...")}\`\`\``
      var embed = new Discord.MessageEmbed()
        .setColor("RED")
        .setTitle(`${fn.getEmoji(client, "red_tick")} Evaluation Failed!`)
        .addField(`Expression`, "```js\n" + args.join(" ") + "```")
        .addField(
          `Error Message`,
          `${emsg.length > 1024 ? "See below" : e}`
        )
        .setFooter(
          client.user.username,
          client.user.avatarURL({ format: "png", dynamic: true, size: 1024 })
        )
      message.channel.send(embed).catch(console.error)
      if(emsg.length > 1024) message.channel.send(emsg)
		}
    
	}
}
