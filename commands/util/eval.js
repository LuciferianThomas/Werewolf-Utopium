const Discord = require('discord.js')
const Commando = require('discord.js-commando')

class c_eval extends Commando.Command {
	constructor(client) {
		super(client, {
			name: 'eval',
			memberName: 'eval',
			group: 'util',
			description: 'Evaluates JavaScript expression.',
			ownerOnly: true,
			args: [{
				key: 'expr',
				label: 'expression',
				prompt: 'What expression do you want to evaluate?',
				type: 'string'
			}]
		})
	}

	async run(msg, { expr }) {
		var res = eval(expr)
		msg.channel.send(res)
	}
}

module.exports = c_eval