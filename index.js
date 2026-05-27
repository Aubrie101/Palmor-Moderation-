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

    if (message.content === '!ping') {
        return message.reply('Pong!');
    }

    if (message.content.startsWith('!kick')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.reply("You don't have permission.");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention someone to kick.');

        if (!member.kickable) {
            return message.reply("I can't kick that user.");
        }

        try {
            await member.kick();
            return message.channel.send(`${member.user.tag} was kicked.`);
        } catch (err) {
            console.error(err);
            return message.reply('Failed to kick that user.');
        }
    }

    if (message.content.startsWith('!ban')) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.reply("You don't have permission.");
        }

        const member = message.mentions.members.first();
        if (!member) return message.reply('Mention someone to ban.');

        if (!member.bannable) {
            return message.reply("I can't ban that user.");
        }

        try {
            await member.ban();
            return message.channel.send(`${member.user.tag} was banned.`);
        } catch (err) {
            console.error(err);
            return message.reply('Failed to ban that user.');
        }
    }
});

client.login(process.env.TOKEN);
