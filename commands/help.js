
const key = (object, value) => {
	Object.keys(object).forEach(x => {
		if (object[x] == value) return x;
	})
}

module.exports = {
	help: "Print this message, or get help for a specific command",
	fullHelp: [
		"help - Print the list of commands",
		"help <command> - Get help on a specific command"
	],
	permitted: () => true,
	generateMainpage: () => {
		let embed = {
			author: {
				name: bot.user.username,
				icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
			},
		}
	},
	execute: (msg, bot, args) => {
		let cmdList = Object.keys(bot.commands).map(cmd => cmd.startsWith("~") ? '' : `${bot.config.prefix}${cmd} - ${bot.commands[cmd].help}`).filter(x => x != '');
		let groupList = Object.keys(bot.commands).map(cmd => !cmd.startsWith("~") ? '' : `${bot.config.prefix}${cmd} - ${bot.commands[cmd].help}`).filter(x => x != '');

		if (args.length == 0) return { embed: {
			color: 15105570,
			timestamp: new Date(),
			author: {
				name: bot.user.username,
				icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
			},
			fields: [
				{ name: "Commands", value: cmdList.join("\n") },
				{ name: "Groups", value: groupList.join("\n") }
			],
			footer: { text: "If something is wrapped in <> or [], do not include the brackets when using the command. They indicate whether that part of the command is required <> or optional []." }
		}};
		cmd = args.shift();
		if (!bot.commands[cmd]) return "Could not find command.";
		let helpString = "";
		if (Array.isArray(bot.commands[cmd].fullHelp)) bot.commands[cmd].fullHelp.forEach(cmd => {
			helpString += bot.config.prefix + cmd + "\n"
		});
		else helpString = cmd != "dev" ? bot.config.prefix : "" + bot.commands[cmd].fullHelp;
		return { embed: {
			author: {
				name: bot.user.username,
				icon_url: `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png`
			},
			title: `Bot Command | ${cmd}`,
			description: bot.commands[cmd].help,
			fields: [{
				name: "Usage",
				value: helpString
			}],
			footer: { text: "If something is wrapped in <> or [], do not include the brackets when using the command. They indicate whether that part of the command is required <> or optional []." }
		}};
	}
}