require('es6-shim')

const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
var __dirname = path.resolve()

const client = new Commando.Client({
	owner: '336389636878368770',
	commandPrefix: 'u!'
})

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['util', 'Utility Commands']
	])
	.registerCommandsIn(path.join(__dirname, "commands"))

const token = process.env.DISCORD_BOT_TOKEN

client.login(token)

client.on('ready', () => {
  console.log("Unity is up!")
})