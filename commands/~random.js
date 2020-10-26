
module.exports = {
	help: "Random commands",
	fullHelp: [" "],
	permitted: async (msg, bot) => bot.config.owners.includes(msg.author.id),
	execute: async (msg, bot, args) => {
		switch(args.shift()) {
			case "getbox":
				await bot.addGuildMemberRole(msg.member.guild.id, "431544605209788416", "750115312707305544");
				return "here, take a <@431544605209788416>";
			case "yeetbox":
				await bot.removeGuildMemberRole(msg.member.guild.id, "431544605209788416", "750115312707305544");
				return "The Testing shall be executed.";
			default:
				return "I looked everywhere, but your command was nowhere to be found."
		}
	}
}