
module.exports = {
    name: 'avatar',
    help: "Some avatar stuff",
    permitted: () => true,
    execute: async (msg, bot, args) => {
        bot.sendChannelTyping(msg.channel.id, 5000);
        let user = !args[0] ? msg.author : await bot.matchMentionUser(args[0]);
        if (!user) return "that's not a valid user!"
        let img = user.dynamicAvatarURL('png', 1024);
        let decimal = await bot.imageColour(img);
        return {
                embed: {
                    description: `__**${user.username}'s Avatar**__`,
                    color: decimal,
                    image: {
                        url: user.dynamicAvatarURL(null, 2048).includes('a_')
                            ? user.dynamicAvatarURL(null, 2048)
                            : user.dynamicAvatarURL('png', 2048),
                    },
                },
            };    
    }
}
