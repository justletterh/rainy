const config = require("./config.json");
class Rainy extends require("eris") {

    constructor() {

        super("Bot " + config.bot_token, {restMode: true});
        this.config = config;
        require("./utils")(this);

        this.autoproxyChannels = {};

        this.commands = {
            "at-everyone": "https://media.tenor.co/videos/bbbbd04ae1f620d862febdb241d375c6/mp4",
        }

        this.load("commands");

        this.on("error", console.error);
        this.on("ready", () => {
            console.log("Connected to Discord.")
            this.guilds.map(x => x.fetchMembers());
            this.editStatus("dnd",{name:"lgs's personal bot lmao"});
        });
        this.on("messageCreate", async (msg) => {
            if (!await this.messageCreate(msg) && !msg.author.bot) await this.proxy(msg);
        });

        this.on("messageDelete", async (msg) => {
            if (msg.channel.id == "381887113391505410") console.log(msg);
        })
        
        this.on("guildCreate", (guild) => console.log(`Received guild ${guild.id} with ${guild.members.size} members.`))
        this.on("guildAvailable", (guild) => console.log(`Received guild ${guild.id} with ${guild.members.size} members.`))

        this.members = 0;
        this.on("guildMemberPush", () => {
            this.members++;
        });

    }
}

new Rainy().connect();