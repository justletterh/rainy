const fs = require("fs");
const axios = require("axios");
const Vibrant = require('node-vibrant');

const discord_epoch = 1420070400000;

module.exports = bot => {

    bot.load = name => {
        if (bot[name] === undefined) bot[name] = {}
        fs.readdirSync("./" + name).forEach(f => {
            if (bot[name][f.slice(0, -3)]) delete require.cache[require.resolve(`./${name}/${f}`)];
            try { bot[name][f.slice(0, -3)] = require(`./${name}/${f}`); }
            catch (err) { console.log(`Error loading ${name.slice(0, -1)} ${f.slice(0, -3)}: ${err}`) }
        });
        return `Finished loading ${name}. Check your console for errors.`
    };

    bot.isOwner = async(user) =>
        bot.getRESTGuildMember(bot.config.guild, user).then(user => user.roles.has(bot.config.role))

    bot.blacklistAdd = async(user, reason) => {
        if (reason) await bot.db.blacklist.set(user.id, reason);
        else await bot.db.blacklist.set(user.id, "No reason provided");
    };

    bot.blacklistRemove = async(user) => {
        await bot.db.blacklist.delete(user.id);
    };

    bot.matchMentionUser = async (mentionString) => {
        let mention = mentionString.match(/^<@!?(\d+)>$/);
        try {return await bot.getRESTUser(mention ? mention[1] : mentionString); }
        catch (e) { return null; }
    };

    bot.matchMentionChannel = async (mentionString, guildId) => {
        let mention = mentionString.match(/^<#(\d+)>$/);
        let channel;
        try { channel = await bot.getRESTChannel(mention ? mention[1] : mentionString); } catch (e) { return null; }
        if (channel && channel.guild.id == guildId) return channel;
        return null;
    };

	bot.getMatches = (string, regex) => {
		let matches = [];
		let match;
		while (match = regex.exec(string)) {
			match.splice(1).forEach(m => { if(m) matches.push(m); });
		}
		return matches;
	};

    // ok, this one is actually stolen from discordjs (Copyright 2015 - 2020 Amish Shah)
    const idToBinary = (num) => {
        let bin = '';
        let high = parseInt(num.slice(0, -10)) || 0;
        let low = parseInt(num.slice(-10));
        while (low > 0 || high > 0) {
          bin = String(low & 1) + bin;
          low = Math.floor(low / 2);
          if (high > 0) {
            low += 5000000000 * (high % 2);
            high = Math.floor(high / 2);
          }
        }
        return bin;
      }

    // inspired by discordjs
    bot.snowflakeTimestamp = (snowflake) => 
        parseInt(idToBinary(snowflake).toString(2).padStart(64, '0').substring(0, 42), 2) + discord_epoch;

    bot.imageColour = async (img) => {
        let v = new Vibrant(img);
        let colors = await v.getPalette((err, palette) =>
            palette.Vibrant._rgb
        );
        let r = colors.Vibrant._rgb[0];
        let g = colors.Vibrant._rgb[1];
        let b = colors.Vibrant._rgb[2];
        let decimal = (r << 16) + (g << 8) + b;
        if (decimal === 16777215) decimal = 16711422;
        return decimal;
    };

    bot.getPkMember = async (query) => {
        let members = await axios(`https://api.pluralkit.me/v1/s/${bot.config.pluralkit_system}/members`, { headers: { authorization: bot.config.pluralkit_api_token } });
        if (members.status == 200) return members.data.find(member => member.name.toLowerCase() == query.toLowerCase() || member.id == query.toLowerCase());
    }

    bot.getPkMessage = async (id) => {
        let msg = await axios(`https://api.pluralkit.me/v1/msg/${id}`);
        if (msg.status == 200) return msg.data;
    }

    // totally not stolen from tupperbox
	bot.fetchWebhook = async (channel) => {
		if (!channel.permissionsOf(bot.user.id).has("manageWebhooks"))
			throw { permission: "Manage Webhooks" };
        let hook = (await channel.getWebhooks()).filter(x => x.name == "Tupperhook").shift();
        if (!hook) hook = await channel.createWebhook({ name: "Tupperhook" });
        return hook;
    };
    
    bot.messageCreate = async (msg) => {
        if (msg.content.startsWith(bot.config.prefix) && (!msg.author.bot || msg.author.discriminator == "0000")) {
            let args = msg.content.substr(bot.config.prefix.length).trim().split(" ");
            msg.args = args;
            let cmd = bot.commands[args.shift()];
            if (cmd) {
                if (typeof cmd == 'string' || await cmd.permitted(msg, bot)) try { await bot.createMessage(msg.channel.id, typeof cmd == 'string' ? cmd : await cmd.execute(msg, bot, args)); }
                    catch (e) { await bot.createMessage(msg.channel.id, "There was an error: `" + e.message + "`"); throw e;}
                else bot.createMessage(msg.channel.id, "You do not have the required permissions to use this command.");
            }
            return true;
        }
    }

    bot.proxy = async (msg) => {
        if (!bot.config.owners.includes(msg.author.id) || !Object.keys(bot.autoproxyChannels).includes(msg.channel.id) || msg.content.startsWith("\\")) return;
        let member = await bot.getPkMember(bot.autoproxyChannels[msg.channel.id].username);
        await bot.executeWebhook(bot.autoproxyChannels[msg.channel.id].hook, bot.autoproxyChannels[msg.channel.id].token, {
            content: msg.content,
            avatarURL: bot.autoproxyChannels[msg.channel.id].avatar,
            username: bot.autoproxyChannels[msg.channel.id].username,
        })
        await msg.delete();
    };
}
