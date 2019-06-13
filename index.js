require('es6-shim')

const Discord = require('discord.js')
const Commando = require('discord.js-commando')
const path = require('path')
var __dirname = path.resolve()

const client = new Commando.Client({
	owner: '336389636878368770',
	commandPrefix: 'u!'
})

