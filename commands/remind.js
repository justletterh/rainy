const chrono = require('chrono-node');

// stolen from tupperbox
const dhm = (t) => {
	let cd = 24 * 60 * 60 * 1000, ch = 60 * 60 * 1000, cm = 60 * 1000, cs = 1000;
	let d = Math.floor(t/cd), h = Math.floor((t-d*cd)/ch), m = Math.floor((t-d*cd-h*ch)/cm), s = Math.floor((t-d*cd-h*ch-m*cm)/cs);
	return `${d ? `${d}d ` : ''}${h | d ? `${h}h ` : ''}${m | h | d ? `${m}m ` : ''}${s | m | h | d ? `${s}s ` : ''}`;
};

module.exports = {
	help: "Set a reminder.",
	fullHelp: "remind <time> [item]",
	permitted: () => true,
	execute: async (msg, bot, args) => {
		let time = chrono.parse(args.join(" "), new Date(), { forwardDate: true })[0];
		let link = `https://discord.com/channels/${msg.channel.guild ? msg.channel.guild.id : '@me'}/${msg.channel.id}/${msg.id}`;
		setTimeout(async () => {
			bot.createMessage(msg.channel.id, `${msg.author.mention}, ${link}`);
		}, (time.date().getTime() - Date.now()));
		return `I'll remind you of that in ${dhm((time.date().getTime() - Date.now()))}.`;
	}
}