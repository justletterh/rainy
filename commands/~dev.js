const util = require("util");
const parse = require("minimist");

module.exports = {
    help: "Developer commands",
    fullHelp: [
        "~dev eval <code> - eval inline code",
        "~dev eval <codeblock> - eval a block of code",
        "~dev reload <thing> - reload something"
    ],
    permitted: async (msg, bot) => bot.config.owners.includes(msg.author.id),
    execute: async (msg, bot, args) => {
        switch(args.shift()) {
            case "eval":
                let code = args.join(" ");
                if (e = code.match(/^```js\n([^]*)\n```$/)) code = e[1];
                let out;
                try {
                    code.split("\n").length > 1 ? (out = await eval(`(async () => {${code}})();`)) : (out = await eval(code));
                } catch(e) { out = e.toString(); }
                out = util.inspect(out);
                for (let x of Object.keys(bot.config)) {
                    if (x.toLowerCase().includes("token")) out = out.split(bot.config[x]).join(`[[ ${x.toLocaleUpperCase()} ]]`);
                }
                return out.slice(0,2000);
            case "reload":
                args.forEach(thing => bot.load(thing));
                return "undefined";
            case "parsertest":
                let argList = bot.getMatches(args.join(" "),/“(.+?)”|‘(.+?)’|"(.+?)"|'(.+?)'|(\S+)/gi);
                let parsed = parse(argList);
                console.log(parsed);
                return util.inspect({ argList, parsed }).slice(0,2000);
        }
    }
}