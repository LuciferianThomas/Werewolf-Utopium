  /* --- ALL PACKAGES --- */

require('es6-shim')

const Discord = require('discord.js'),
      express = require('express'),
      fs = require("fs"),
      http = require('http'),
      moment = require('moment'),
      fetch = require('node-fetch')
      // db = require("quick.db")

/* --- ALL PACKAGES --- */

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

const client = new Discord.Client(),
      config = require('/app/util/config'),
      fn = require('/app/util/fn')

const app = express()
app.use(express.static('public'));

app.get("/", function(request, response) {
  response.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT, function() {
  setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`)
  }, 225000)
});

client.commands = new Discord.Collection()
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

const token = process.env.DISCORD_BOT_TOKEN

/* --- ALL GLOBAL CONSTANTS & FUNCTIONS --- */

client.login(token)

client.once('ready', async () => {
  client.allinvites = await client.guilds.cache.get("522638136635817986").fetchInvites()
  console.log(`${fn.time()} | ${client.user.username} is up!`)
})

client.on('inviteCreate', async invite => {
  client.allinvites = await client.guilds.cache.get("522638136635817986").fetchInvites()
})
client.on('inviteDelete', async invite => {
  client.allinvites = await client.guilds.cache.get("522638136635817986").fetchInvites()
})

client.on('guildMemberAdd', async member => {
  if (member.guild.id != "522638136635817986") return;
  member.guild.channels.cache.get("640530363587887104").send(
    `${member}, welcome to **Werewolf Utopium**!`
  )
  member.guild.fetchInvites().then(guildInvites => {
    const oldinv = client.allinvites
    client.allinvites = guildInvites
    const invite = guildInvites.find(inv => inv.uses > oldinv.get(inv.code).uses)
    const inviter = client.users.cache.get(invite.inviter.id)
    const logChannel = member.guild.channels.cache.get("677414620436103169")
    logChannel.send(`${member.user.tag} joined using invite code ${invite.code} from ${inviter.tag}. Invite was used ${invite.uses} times since its creation.`);
  });
})

client.on('guildMemberRemove', async member => {
  if (member.guild.id != "522638136635817986") return;
  member.guild.channels.cache.get("640530363587887104").send(
    `Hope to see you again in the near future, **${member.user.username}**!`
  )
})

client.on('message', async message => {
  
  if (message.author.bot) return;
  
  const msg = message.content.trim().toLowerCase()
  
  const prefix = "w!"
  
  let shared = {}
    
  if (message.content.toLowerCase().startsWith(prefix)) {
    
    var args = message.content.trim().slice(prefix.length).split(/\s+/u)
    shared.prefix = prefix
    
		const commandName = args.shift().toLowerCase()
		shared.commandName = commandName
		const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

		if (!command) return;
    
		try {
			await command.run(client, message, args, shared)
		} catch (error) {
			console.log(error)
		}
    
    message.delete().catch(error => {})
	}
})

