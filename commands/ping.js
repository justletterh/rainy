
module.exports = {
    help: "Check if the bot is running",
    fullHelp: ["ping"],
    permitted: async (msg) => true,
    execute: async (msg, bot) => "Pong."
}