const Discord = require('discord.js'),
      moment = require('moment'),
      db = require("quick.db"),
      fs = require("fs")

const config = require('/app/util/config'),
      fn = require('/app/util/fn')

module.exports = {
	name: "reload",
	usage: "reload <command>",
	description: "Reload a command, without restarting!",
 // category: "Bot Staff",
 // botStaffOnly: true,
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
    
    let command = args[0];
    
    if (!args[0]) return await message.channel.send(`***Bruh***`)
    
    if(command.startsWith("/")){
      command = args.join(" ")
      
      try {
        require(command)
      } catch (e) {
        message.channel.send(`\`${command}\` is not a valid path!`)
        return undefined
      }
      
      delete require.cache[require.resolve(command)]
      message.channel.send(`File \`${command}\` is ready to be used. Be sure to reload any commands that need this file to fully apply the changes.`)
      
      // fn.addLog("MAIN", `${message.author.tag} reloaded \`${command}\`.`)
    } else {
    
      let commandfile = client.commands.get(command);
      if (!commandfile) return message.author.send("Unable to find that command.");
      client.commands.delete(command);

      delete require.cache[require.resolve(`/app/commands/${commandfile.name}.js`)]

      // if(command === "shop") delete require.cache[require.resolve(`/app/util/shop.js`)]
      // if(command === "roles") delete require.cache[require.resolve(`/app/util/roles.js`)]
      // if (["coins","custom","games","items","logs","roses","talisman","use"].includes(command)) {
      //   let filesInFolder = fs.readdirSync(`/app/commands/${command}`).filter(file => file.endsWith('.js'))
      //   filesInFolder.forEach(file => delete require.cache[require.resolve(`/app/commands/${command}/${file}`)])
      // }

      let props = require(`/app/commands/${commandfile.name}`);
      // console.log(`Reload: Command "${command}" loaded`);
      client.commands.set(props.name, props);    

      message.channel.send(`Command \`${command.toLowerCase()}\` successfully reloaded.`);
      // fn.addLog("MAIN", `${message.author.tag} reloaded \`${command}\`.`)
    }
    
	}
}

