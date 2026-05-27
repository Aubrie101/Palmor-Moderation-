const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    ChannelType
} = require('discord.js');
require('dotenv').config();

const PREFIX = process.env.PREFIX || '!';
const TOKEN = process.env.TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

function hasPerm(member, permission) {
    return member.permissions.has(permission);
}

function parseDuration(input) {
    if (!input) return null;

    const match = input.toLowerCase().match(/^(\d+)(s|m|h|d)$/);
    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
}

function getMentionedMember(message) {
    return message.mentions.members.first();
}

function getReason(args, startIndex = 0) {
    return args.slice(startIndex).join(' ').trim() || 'No reason provided';
}

client.once('ready', () => {
    console.log(`Palmor moderation is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    try {
        if (command === 'ping') {
            return message.reply('Pong!');
        }

        if (command === 'help') {
            return message.reply([
                '**Palmor Commands**',
                '`!ping`',
                '`!help`',
                '`!kick @user reason`',
                '`!ban @user reason`',
                '`!unban userId`',
                '`!timeout @user 10m reason`',
                '`!untimeout @user`',
                '`!purge 10`',
                '`!slowmode 5`',
                '`!lock`',
                '`!unlock`',
                '`!say message`',
                '`!warn @user reason`',
                '`!nick @user newname`',
                '`!userinfo @user`',
                '`!serverinfo`',
                '`!avatar @user`',
                '`!coinflip`',
                '`!roll`',
                '`!choose option1 | option2 | option3`'
            ].join('\n'));
        }

        if (command === 'kick') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.KickMembers)) {
                return message.reply("You don't have permission.");
            }

            const member = getMentionedMember(message);
            if (!member) return message.reply('Mention someone to kick.');
            if (!member.kickable) return message.reply("I can't kick that user.");

            const reason = getReason(args, 1);

            await member.kick(reason);
            return message.channel.send(`${member.user.tag} was kicked. Reason: ${reason}`);
        }

        if (command === 'ban') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.BanMembers)) {
                return message.reply("You don't have permission.");
            }

            const member = getMentionedMember(message);
            if (!member) return message.reply('Mention someone to ban.');
            if (!member.bannable) return message.reply("I can't ban that user.");

            const reason = getReason(args, 1);

            await member.ban({ reason });
            return message.channel.send(`${member.user.tag} was banned. Reason: ${reason}`);
        }

        if (command === 'unban') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.BanMembers)) {
                return message.reply("You don't have permission.");
            }

            const userId = args[0];
            if (!userId) return message.reply('Provide a user ID to unban.');

            await message.guild.members.unban(userId);
            return message.channel.send(`User ID ${userId} was unbanned.`);
        }

        if (command === 'timeout') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ModerateMembers)) {
                return message.reply("You don't have permission.");
            }

            const member = getMentionedMember(message);
            if (!member) return message.reply('Mention someone to timeout.');

            const durationText = args[1];
            const duration = parseDuration(durationText);
            if (!duration) {
                return message.reply('Use a valid duration like `10m`, `1h`, `1d`.');
            }

            const reason = getReason(args, 2);

            await member.timeout(duration, reason);
            return message.channel.send(`${member.user.tag} was timed out for ${durationText}. Reason: ${reason}`);
        }

        if (command === 'untimeout') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ModerateMembers)) {
                return message.reply("You don't have permission.");
            }

            const member = getMentionedMember(message);
            if (!member) return message.reply('Mention someone to remove timeout from.');

            await member.timeout(null);
            return message.channel.send(`${member.user.tag} is no longer timed out.`);
        }

        if (command === 'purge' || command === 'clear') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ManageMessages)) {
                return message.reply("You don't have permission.");
            }

            const amount = Number(args[0]);
            if (!amount || amount < 1 || amount > 100) {
                return message.reply('Enter a number from 1 to 100.');
            }

            await message.channel.bulkDelete(amount, true);
            const sent = await message.channel.send(`Deleted ${amount} messages.`);
            setTimeout(() => sent.delete().catch(() => {}), 3000);
            return;
        }

        if (command === 'slowmode') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ManageChannels)) {
                return message.reply("You don't have permission.");
            }

            const seconds = Number(args[0]);
            if (Number.isNaN(seconds) || seconds < 0 || seconds > 21600) {
                return message.reply('Enter seconds from 0 to 21600.');
            }

            await message.channel.setRateLimitPerUser(seconds);
            return message.channel.send(`Slowmode set to ${seconds} second(s).`);
        }

        if (command === 'lock') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ManageChannels)) {
                return message.reply("You don't have permission.");
            }

            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            return message.channel.send('Channel locked.');
        }

        if (command === 'unlock') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ManageChannels)) {
                return message.reply("You don't have permission.");
            }

            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: true
            });

            return message.channel.send('Channel unlocked.');
        }

        if (command === 'say') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ManageMessages)) {
                return message.reply("You don't have permission.");
            }

            const text = args.join(' ').trim();
            if (!text) return message.reply('Say what?');

            await message.delete().catch(() => {});
            return message.channel.send(text);
        }

        if (command === 'warn') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ModerateMembers)) {
                return message.reply("You don't have permission.");
            }

            const member = getMentionedMember(message);
            if (!member) return message.reply('Mention someone to warn.');

            const reason = getReason(args, 1);

            try {
                await member.send(`You were warned in **${message.guild.name}**. Reason: ${reason}`);
            } catch {
                // ignore dm failure
            }

            return message.channel.send(`${member.user.tag} was warned. Reason: ${reason}`);
        }

        if (command === 'nick' || command === 'nickname') {
            if (!hasPerm(message.member, PermissionsBitField.Flags.ManageNicknames)) {
                return message.reply("You don't have permission.");
            }

            const member = getMentionedMember(message);
            if (!member) return message.reply('Mention someone.');
            if (!member.manageable) return message.reply("I can't change that nickname.");

            const newNick = args.slice(1).join(' ').trim();
            if (!newNick) return message.reply('Provide a new nickname.');

            await member.setNickname(newNick);
            return message.channel.send(`${member.user.tag} is now **${newNick}**.`);
        }

        if (command === 'userinfo') {
            const member = getMentionedMember(message) || message.member;

            return message.reply([
                `**User Info**`,
                `Tag: ${member.user.tag}`,
                `ID: ${member.user.id}`,
                `Joined Server: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                `Account Created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`
            ].join('\n'));
        }

        if (command === 'serverinfo') {
            return message.reply([
                `**Server Info**`,
                `Name: ${message.guild.name}`,
                `Members: ${message.guild.memberCount}`,
                `Owner ID: ${message.guild.ownerId}`,
                `Created: <t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`
            ].join('\n'));
        }

        if (command === 'avatar') {
            const member = getMentionedMember(message) || message.member;
            return message.reply(member.user.displayAvatarURL({ size: 1024 }));
        }

        if (command === 'coinflip') {
            const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
            return message.reply(`You flipped **${result}**.`);
        }

        if (command === 'roll') {
            const roll = Math.floor(Math.random() * 6) + 1;
            return message.reply(`You rolled a **${roll}**.`);
        }

        if (command === 'choose') {
            const joined = args.join(' ');
            const options = joined.split('|').map(option => option.trim()).filter(Boolean);

            if (options.length < 2) {
                return message.reply('Use it like: `!choose pizza | burger | tacos`');
            }

            const choice = options[Math.floor(Math.random() * options.length)];
            return message.reply(`I choose: **${choice}**`);
        }
    } catch (error) {
        console.error(error);
        return message.reply('Something went wrong running that command.');
    }
});

client.login(TOKEN);
