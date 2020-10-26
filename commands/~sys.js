
module.exports = {
	help: "System commands",
	fullHelp: "Commands helpful for systems / plural uses!",
	permitted: async (msg, bot) => bot.config.owners.includes(msg.author.id),
	execute: async (msg, bot, args) => {
		switch(args.shift()) {
			case "channel-autoproxy":
				webhook = await bot.fetchWebhook(msg.channel);
				let member = args.shift();
				if (member == "-off") {
					bot.autoproxyChannels[msg.channel.id] = undefined;
					return `Turned off autoproxy in <#${msg.channel.id}>.`
				};
				member = await bot.getPkMember();
				if (!member) return "Could not find that member."
				if (webhook && member) bot.autoproxyChannels[msg.channel.id] = {
					hook: webhook.id,
					token: webhook.token,
					username: `${member.name} 🌀`,
					avatar: member.avatar_url,
				}
				return `Set autoproxy in <#${msg.channel.id}> to ${member.name}.`;	
			default:
				return "I looked everywhere, but your command was nowhere to be found."
		}
	}
}