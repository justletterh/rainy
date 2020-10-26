const axios = require('axios');
const ytdl = require('ytdl-core');

module.exports = {
	help: "Spiral's personal commands",
	fullHelp: "Spiral's personal commands",
	permitted: async (msg, bot, args) => bot.config.owners.includes(msg.author.id) || args[0] == "reinstall" && msg.author.id == "666317117154525185",
	execute: async (msg, bot, args) => {
		switch(args.shift()) {
			case "reinstall":
				await axios("https://api.vultr.com/v1/baremetal/reinstal", {
					method: 'POST',
					body: 'SUBID=41380623',
					headers: {
						"API-Key":"yeet"
					}
				})
				return 'Ok';
			case "status":
				let emoji;
				if (!isNaN(args[0])) emoji = args.shift();
				if (e = args[0].match(/^<a?:(\w+):(\d+)>$/)) {
					emoji = e[2];
					args.shift();
				}
				let text = args ? args.join(" ") : undefined;
				if (!emoji && !text) return "No text or emoji.";
				let data = {};
				if (emoji) data.emoji_id = emoji;
				if (text) data.text = text;
				if (data.text == "clear") data = null;
				let ret = await axios(`https://discord.com/api/v8/users/@me/settings`, {
					method: "PATCH",
					headers: {
						'authorization': bot.config.owner_token,
						'content-type': 'application/json'
					},
					data: {custom_status: data}
				});
				console.log(ret.data);
				return "undefined";
			case "steal":
				let local;
				let url;
				if (args[0] == "local") {
					local = true;
					args.shift();
				}
				if (args[0] == "url") {
					url = true;
					args.shift();
				}
				if (!args.length) return "Missing emoji ID or URL.";
				if (args.length == 1) return "Missing emoji name.";
				let e = args.shift();
				let resp = await axios.get(url ? e : `https://cdn.discordapp.com/emojis/${e}.png?s=1`, {responseType: 'arraybuffer'});
				if (resp.status != 200) return "Something broke, sorry...";
				try {
					e = await bot.createGuildEmoji(local ? msg.channel.guild.id : "701634761013329920", { name: args.shift(), image: `data:${resp.headers["content-type"]};base64,${Buffer.from(resp.data).toString('base64')}` });
				} catch(err) {
					if (err.message.includes("Missing Permissions")) return "I'm not allowed to do that here.";
					else throw err;
				}
				return `<:a:${e.id}>`;
			case "music":
				if (args[0] == "channel") return await module.exports.channel(msg, bot, args);
				let member = args.shift();
				let video = args.shift();
				let timestamp;
				if (args) timestamp = args.shift();
		
				await bot.sendChannelTyping(msg.channel.id);
		
				member = await bot.getPkMember(member);
				video = await ytdl.getInfo(video);
		
				await bot.createMessage("753391857051893800", { embed: { 
					url: video.videoDetails.video_url,
					timestamp: timestamp ? new Date(bot.snowflakeTimestamp(timestamp)) : new Date(msg.timestamp),
					image: { url: `https://i.ytimg.com/vi/${video.videoDetails.videoId}/maxresdefault.jpg` },
					title: video.videoDetails.title,
					footer: { text: `Added by ${member.name}`},
					color: await bot.imageColour(`https://i.ytimg.com/vi/${video.videoDetails.videoId}/maxresdefault.jpg`),
				}})
				return "Done!"
			default:
				return "I looked everywhere, but your command was nowhere to be found."
		}
	}
}