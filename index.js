const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`Palmor moderation is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // TEST COMMAND
    if (message.content === '!ping') {
        return message.reply('Pong!');
    }

    // MODERATION: kick command
    if (message.content.startsWith('!kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply("You don't have permission.");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Mention someone to kick.");

        await member.kick();
        message.channel.send(`${member.user.tag} was kicked.`);
    }

    // MODERATION: ban command
    if (message.content.startsWith('!ban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("You don't have permission.");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply("Mention someone to ban.");

        await member.ban();
        message.channel.send(`${member.user.tag} was banned.`);
    }
});

client.login(process.env.TOKEN);
