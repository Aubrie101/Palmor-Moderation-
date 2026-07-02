console.log("LOADED NEW PALMOR BOT SCRIPT - HELP FIX VERSION");

const {
    Client,
    GatewayIntentBits,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits,
    AttachmentBuilder,
    Partials
} = require("discord.js");

const fs = require("fs");
const path = require("path");
require('dotenv').config({ override: true });

const PREFIX = process.env.PREFIX || "!";
const TOKEN = process.env.TOKEN;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID || "";
const SUGGESTION_CHANNEL_ID = process.env.SUGGESTION_CHANNEL_ID || "";
const REPORT_CHANNEL_ID = process.env.REPORT_CHANNEL_ID || "";
const DATA_FILE = process.env.DATA_FILE || "./palmor-data.json";
const BOT_OWNER_IDS = new Set(String(process.env.BOT_OWNER_IDS || process.env.OWNER_USER_ID || "").split(/[ ,]+/).map(id => id.trim()).filter(Boolean));

let quarantineRoleId = process.env.QUARANTINE_ROLE_ID || "";

if (!TOKEN) {
    console.error("Missing TOKEN in .env");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember
    ]
});

const STAFF_ROLE_LEVELS = {
    Owner: 1000,
    "Co Owner": 950,
    "Co-Owner": 950,
    "Executive Director": 920,
    Director: 900,
    "Game Management": 875,
    "Game Manager": 875,
    "Game Manage": 875,
    "Head Admin": 850,
    Admin: 800,
    Developer: 750,
    "Development Team": 750,
    "Senior Moderator": 700,
    "Senior Mod": 700,
    Moderator: 600,
     "Server Management": 600,
    "Server Manager": 600,
    Management: 600,
    "Trial Moderator": 500,
    "Trial Mod": 500,
    Helper: 400,
    Support: 400,
    "Game Tester": 350,
    Tester: 350,
    "Staff Member": 300
};

const COMMAND_LEVELS = {
    ping: 0,
    help: 0,
    commands: 0,
    memberhelp: 0,
    funhelp: 0,
    botinfo: 0,
    uptime: 0,
    serverinfo: 0,
    membercount: 0,
    userinfo: 0,
    avatar: 0,
    servericon: 0,
    profile: 0,
    balance: 0,
    bal: 0,
    daily: 0,
    work: 0,
    crime: 0,
    beg: 0,
    pay: 0,
    leaderboard: 0,
    lb: 0,
    rep: 0,
    afk: 0,
    remindme: 0,
    suggest: 0,
    report: 0,
    tickethelp: 0,
    activate: 0,
    license: 0,
    keycreate: 0,
    keylist: 0,
    keyrevoke: 0,
    serverlist: 0,
    serverenable: 0,
    serverdisable: 0,
    joke: 0,
    quote: 0,
    rate: 0,
    ship: 0,
    hug: 0,
    slap: 0,
    meme: 0,
    coinflip: 0,
    roll: 0,
    choose: 0,
    "8ball": 0,

    staffhelp: 300,
    stafflevel: 300,
    permissions: 300,

    say: 400,
    embed: 400,
    poll: 400,
    roleinfo: 400,
    rolelist: 400,
    roles: 400,
    staffroles: 400,
    ticketpanel: 600,
    ticketsupport: 600,
    applicationpanel: 600,
    apppanel: 600,
    applypanel: 600,
    applicationhelp: 300,
    leakpanel: 600,
    leakreaction: 600,

    modhelp: 500,
    warn: 500,
    warnings: 500,
    announce: 500,
    purge: 500,
    clear: 500,
    slowmode: 500,
    topic: 500,
    nick: 500,
    nickname: 500,
    resetnick: 500,
    dm: 500,

    timeout: 600,
    untimeout: 600,
    clearwarnings: 600,
    lock: 600,
    unlock: 600,
    hide: 600,
    unhide: 600,
    renamechannel: 600,
    mute: 600,
    unmute: 600,
    deafen: 600,
    undeafen: 600,
    movevc: 600,
    disconnectvc: 600,
    quarantine: 600,
    unquarantine: 600,

    kick: 800,
    temprole: 700,

    adminhelp: 800,
    ban: 800,
    unban: 800,
    softban: 800,
    tempban: 800,
    addrole: 800,
    rank: 800,
    removerole: 800,
    unrank: 800,
    rolemembercount: 800,
    rolemembers: 800,
    whohas: 800,

    createrole: 900,
    deleterole: 900,
    createchannel: 900,
    deletechannel: 900,

    coowner: 950,
    coownerhelp: 950,
    raidmode: 950,
    antiraid: 950,
    lockdown: 950,
    unlockdown: 950,
    lockall: 950,
    unlockall: 950,
    slowmodeall: 950,
    nuke: 950,
    clonechannel: 950,
    serverannounce: 950,
    staffannounce: 950,
    roleall: 950,
    removeroleall: 950,
    massrole: 950,
    massunrole: 950,
    allowdomain: 950,
    blockdomain: 950,
    removedomain: 950,
    domains: 950,
    recentjoins: 950,
    newaccounts: 950,
    modstats: 950,

    ownerhelp: 1000,
    setrolelevel: 1000,
    reloadlevels: 1000,
    setquarantine: 1000,
    forcerank: 1000,
    forceremoverole: 1000,
    sayin: 1000,
    giveroleall: 1000,
    takeallrole: 1000,
    masspurge: 1000,
    shutdownmsg: 1000
};

const DEFAULT_ALLOWED_DOMAINS = [
    "roblox.com",
    "create.roblox.com",
    "devforum.roblox.com",
    "youtube.com",
    "youtu.be",
    "discord.com",
    "discordapp.com",
    "tiktok.com",
    "x.com",
    "twitter.com",
    "twitch.tv",
    "github.com",
    "docs.google.com",
    "forms.gle",
    "spotify.com",
    "soundcloud.com",
    "instagram.com",
    "reddit.com",
    "wikipedia.org"
];

const DEFAULT_BLOCKED_DOMAINS = [
    "grabify.link",
    "iplogger.org",
    "iplogger.com",
    "2no.co",
    "yip.su",
    "blasze.com",
    "gyazo.nl",
    "ps3cfw.com",
    "bmwforum.co",
    "leancoding.co",
    "stopify.co",
    "freegiftcards.co",
    "discord-nitro.com",
    "discordnitro.info",
    "steamcommunity.ru",
    "roblox-free.com",
    "robuxfree.com",
    "free-robux.com",
    "rbxflip.net",
    "rbxskins.com",
    "rbxgold.com",
    "rbxcase.com",
    "rbxwild.com",
    "bloxbounty.org",
    "blox.land",
    "bit.ly",
    "tinyurl.com",
    "is.gd",
    "cutt.ly",
    "shorturl.at"
];

function loadData() {
    try {
        const fullPath = path.resolve(DATA_FILE);
        if (!fs.existsSync(fullPath)) return {};
        return JSON.parse(fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, ""));
    } catch (error) {
        console.error("Failed to load data file:", error);
        return {};
    }
}

const data = loadData();

const customRoleLevels = new Map(Object.entries(data.customRoleLevels || {}));
const warningStore = new Map(Object.entries(data.warnings || {}));
const economyStore = new Map(Object.entries(data.economy || {}));
const repStore = new Map(Object.entries(data.rep || {}));
const modStats = new Map(Object.entries(data.modStats || {}));
const ticketCounters = new Map(Object.entries(data.ticketCounters || {}));
const leakReactionPanels = new Map(Object.entries(data.leakReactionPanels || {}));
const licenseKeys = new Map(Object.entries(data.licenseKeys || {}));
const licensedServers = new Map(Object.entries(data.licensedServers || {}));
const disabledServers = new Set(data.disabledServers || []);
const afkStore = new Map();

const joinBuckets = new Map();
const recentJoins = [];
const spamBuckets = new Map();

const antiRaid = {
    enabled: data.antiRaid?.enabled ?? true,
    raidMode: data.antiRaid?.raidMode ?? false,
    strictMode: data.antiRaid?.strictMode ?? false,
    joinLimit: data.antiRaid?.joinLimit ?? 6,
    joinWindowMs: data.antiRaid?.joinWindowMs ?? 20 * 1000,
    minimumAccountAgeMs: data.antiRaid?.minimumAccountAgeMs ?? 24 * 60 * 60 * 1000,
    massMentionLimit: data.antiRaid?.massMentionLimit ?? 6,
    duplicateLimit: data.antiRaid?.duplicateLimit ?? 4,
    duplicateWindowMs: data.antiRaid?.duplicateWindowMs ?? 10 * 1000,
    capsRatio: data.antiRaid?.capsRatio ?? 0.86,
    capsMinLength: data.antiRaid?.capsMinLength ?? 18,
    emojiLimit: data.antiRaid?.emojiLimit ?? 18,
    inviteBlock: data.antiRaid?.inviteBlock ?? true,
    linkBlock: data.antiRaid?.linkBlock ?? false,
    autoTimeoutMs: data.antiRaid?.autoTimeoutMs ?? 10 * 60 * 1000
};

const allowedDomains = new Set(data.allowedDomains || DEFAULT_ALLOWED_DOMAINS);
const blockedDomains = new Set(data.blockedDomains || DEFAULT_BLOCKED_DOMAINS);

let saveTimer = null;

function saveDataSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDataNow, 500);
}

function saveDataNow() {
    const payload = {
        customRoleLevels: Object.fromEntries(customRoleLevels),
        warnings: Object.fromEntries(warningStore),
        economy: Object.fromEntries(economyStore),
        rep: Object.fromEntries(repStore),
        modStats: Object.fromEntries(modStats),
        ticketCounters: Object.fromEntries(ticketCounters),
        leakReactionPanels: Object.fromEntries(leakReactionPanels),
        licenseKeys: Object.fromEntries(licenseKeys),
        licensedServers: Object.fromEntries(licensedServers),
        disabledServers: [...disabledServers],
        antiRaid,
        allowedDomains: [...allowedDomains],
        blockedDomains: [...blockedDomains],
        quarantineRoleId
    };

    try {
        fs.writeFileSync(path.resolve(DATA_FILE), JSON.stringify(payload, null, 2));
    } catch (error) {
        console.error("Failed to save data:", error);
    }
}

function normalizeName(value) {
    return String(value || "")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\p{Extended_Pictographic}/gu, "")
        .replace(/[\uFE0F\u200D]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function buildNormalizedRoleMap(source) {
    const map = new Map();
    for (const [roleName, level] of Object.entries(source)) {
        map.set(normalizeName(roleName), level);
    }
    return map;
}

let normalizedStaffLevels = buildNormalizedRoleMap(STAFF_ROLE_LEVELS);

function parseDuration(input) {
    if (!input) return null;

    const match = String(input).toLowerCase().match(/^(\d+)(s|m|h|d|w)$/);
    if (!match) return null;

    const amount = Number(match[1]);
    const unit = match[2];

    const multipliers = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000
    };

    return amount * multipliers[unit];
}

function formatDuration(ms) {
    if (!ms) return "unknown";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
}

function formatMoney(value) {
    return `$${Math.floor(Number(value) || 0).toLocaleString()}`;
}

function getReason(args, startIndex = 0) {
    return args.slice(startIndex).join(" ").trim() || "No reason provided";
}

function makeEmbed(title, description, color = 0x23beff) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

function getMentionedMember(message) {
    return message.mentions.members.first();
}

async function findMember(message, input) {
    if (!input) return null;
    const cleaned = input.replace(/[<@!>]/g, "");

    if (/^\d{15,25}$/.test(cleaned)) {
        return message.guild.members.fetch(cleaned).catch(() => null);
    }

    const lowered = input.toLowerCase();

    return message.guild.members.cache.find(member =>
        member.user.username.toLowerCase().startsWith(lowered) ||
        member.displayName.toLowerCase().startsWith(lowered) ||
        member.user.tag.toLowerCase().startsWith(lowered)
    ) || null;
}

function findRole(guild, input) {
    if (!input) return null;

    const cleaned = input.replace(/[<@&>]/g, "");
    const normalizedInput = normalizeName(input);

    return guild.roles.cache.find(role =>
        role.id === cleaned ||
        normalizeName(role.name) === normalizedInput
    ) || null;
}

function getRoleLevelByName(roleName) {
    const normalized = normalizeName(roleName);

    if (customRoleLevels.has(normalized)) {
        return Number(customRoleLevels.get(normalized)) || 0;
    }

    return normalizedStaffLevels.get(normalized) || 0;
}

function getStaffLevel(member) {
    if (!member) return 0;


    let highest = 0;

    for (const role of member.roles.cache.values()) {
        const level = getRoleLevelByName(role.name);
        if (level > highest) highest = level;
    }

    return highest;
}

function getHighestStaffRole(member) {
    if (!member) return null;

    let best = null;
    let bestLevel = 0;

    for (const role of member.roles.cache.values()) {
        const level = getRoleLevelByName(role.name);

        if (level > bestLevel) {
            best = role;
            bestLevel = level;
        }
    }

    return best;
}

function getCommandLevel(command) {
    return COMMAND_LEVELS[command] ?? 1000;
}

function canRunCommand(member, command) {
    return getStaffLevel(member) >= getCommandLevel(command);
}

function isProtected(actor, target) {
    if (!actor || !target) return false;
    if (actor.id === target.id) return true;
    if (target.id === target.guild.ownerId) return true;

    const actorLevel = getStaffLevel(actor);
    const targetLevel = getStaffLevel(target);

    return targetLevel >= actorLevel && targetLevel > 0;
}

function canManageRole(message, role, force = false) {
    if (!role) return false;

    const botMember = message.guild.members.me;
    if (!botMember) return false;

    if (role.position >= botMember.roles.highest.position) {
        return false;
    }

    if (force) return true;

    const actorLevel = getStaffLevel(message.member);
    const roleLevel = getRoleLevelByName(role.name);

    return actorLevel > roleLevel;
}

async function ensureStaffAccess(message, command) {
    if (canRunCommand(message.member, command)) return true;

    await message.reply(`You cannot use \`${PREFIX}${command}\`. Required staff level: **${getCommandLevel(command)}**.`);
    return false;
}

async function logAction(guild, text) {
    if (!LOG_CHANNEL_ID) return;

    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    await channel.send(text).catch(() => {});
}

function addModStat(userId, key) {
    const stats = modStats.get(userId) || {};
    stats[key] = (stats[key] || 0) + 1;
    modStats.set(userId, stats);
    saveDataSoon();
}

async function getTargetAndRole(message, args) {
    const member = getMentionedMember(message) || await findMember(message, args[0]);
    if (!member) return { error: "Mention someone or provide a user ID/name." };

    const roleName = args.slice(1).join(" ").trim();
    if (!roleName) return { error: "Provide a role name." };

    const role = findRole(message.guild, roleName);
    if (!role) return { error: "Role not found." };

    return { member, role };
}

function getEconomy(userId) {
    if (!economyStore.has(userId)) {
        economyStore.set(userId, {
            cash: 250,
            bank: 0,
            dailyAt: 0,
            workAt: 0,
            crimeAt: 0,
            begAt: 0,
            xp: 0,
            level: 1
        });
    }

    return economyStore.get(userId);
}

function addXp(userId, amount) {
    const account = getEconomy(userId);
    account.xp += amount;

    const needed = account.level * 250;

    if (account.xp >= needed) {
        account.xp -= needed;
        account.level += 1;
    }

    saveDataSoon();
}

function extractDomains(content) {
    const domains = new Set();
    const regex = /(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)(?:\/[^\s]*)?/gi;

    let match;
    while ((match = regex.exec(content)) !== null) {
        domains.add(match[1].toLowerCase().replace(/^www\./, ""));
    }

    return [...domains];
}

function domainMatches(domain, list) {
    const cleaned = domain.toLowerCase().replace(/^www\./, "");

    for (const saved of list) {
        const savedClean = saved.toLowerCase().replace(/^www\./, "");

        if (cleaned === savedClean || cleaned.endsWith("." + savedClean)) {
            return true;
        }
    }

    return false;
}

function hasInvite(content) {
    return /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)/i.test(content);
}

function countEmojis(content) {
    const matches = content.match(/\p{Extended_Pictographic}/gu);
    return matches ? matches.length : 0;
}

function hasCapsSpam(content) {
    const letters = content.replace(/[^a-z]/gi, "");
    if (letters.length < antiRaid.capsMinLength) return false;
    const caps = letters.replace(/[^A-Z]/g, "");
    return caps.length / letters.length >= antiRaid.capsRatio;
}

async function punishSuspiciousMessage(message, reason) {
    await message.delete().catch(() => {});

    if (message.member && message.member.moderatable) {
        await message.member.timeout(antiRaid.autoTimeoutMs, reason).catch(() => {});
    }

    await logAction(message.guild, `Anti-raid action on ${message.author.tag}: ${reason}`);
}

async function handleAntiRaidMessage(message) {
    if (!antiRaid.enabled) return false;
    if (!message.guild || message.author.bot) return false;
    if (!message.member) return false;

    const level = getStaffLevel(message.member);
    if (level >= 300) return false;

    const content = message.content || "";
    const mentions = message.mentions.users.size + message.mentions.roles.size;
    const domains = extractDomains(content);

    for (const domain of domains) {
        if (domainMatches(domain, blockedDomains)) {
            await punishSuspiciousMessage(message, `Blocked bad domain: ${domain}`);
            return true;
        }

        if ((antiRaid.strictMode || antiRaid.linkBlock) && !domainMatches(domain, allowedDomains)) {
            await punishSuspiciousMessage(message, `Unknown link blocked: ${domain}`);
            return true;
        }
    }

    if (antiRaid.inviteBlock && hasInvite(content)) {
        await punishSuspiciousMessage(message, "Discord invite blocked");
        return true;
    }

    if (mentions >= antiRaid.massMentionLimit) {
        await punishSuspiciousMessage(message, "Mass mentions blocked");
        return true;
    }

    if (countEmojis(content) >= antiRaid.emojiLimit) {
        await punishSuspiciousMessage(message, "Emoji spam blocked");
        return true;
    }

    if (hasCapsSpam(content)) {
        await punishSuspiciousMessage(message, "Caps spam blocked");
        return true;
    }

    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const bucket = spamBuckets.get(key) || {
        last: "",
        count: 0,
        timestamps: []
    };

    bucket.timestamps = bucket.timestamps.filter(time => now - time <= antiRaid.duplicateWindowMs);
    bucket.timestamps.push(now);

    const normalizedContent = content.toLowerCase().trim();

    if (normalizedContent && normalizedContent === bucket.last) {
        bucket.count += 1;
    } else {
        bucket.last = normalizedContent;
        bucket.count = 1;
    }

    spamBuckets.set(key, bucket);

    if (bucket.count >= antiRaid.duplicateLimit || bucket.timestamps.length >= antiRaid.duplicateLimit + 2) {
        await punishSuspiciousMessage(message, "Spam blocked");
        return true;
    }

    return false;
}

async function applyQuarantine(member, reason = "Quarantine") {
    if (!member || !quarantineRoleId) return false;

    const role = member.guild.roles.cache.get(quarantineRoleId);
    if (!role) return false;

    if (role.position >= member.guild.members.me.roles.highest.position) {
        return false;
    }

    await member.roles.add(role, reason).catch(() => {});
    return true;
}

const PANEL_GIFS = {
    support: "https://media.giphy.com/media/qwr614iHK9bqdXfeF8/giphy.gif",
    rules: "https://media.giphy.com/media/qwr614iHK9bqdXfeF8/giphy.gif",
    leaks: "https://media.giphy.com/media/qwr614iHK9bqdXfeF8/giphy.gif"
};

const TICKET_BRAND = {
    color: 0x1f6fff,
    purple: 0x8a3ffc,
    green: 0x35e66b,
    red: 0xff4d6d,
    gold: 0xffc644,
    dark: 0x07111f,
    bannerGif: PANEL_GIFS.support,
    rulesGif: PANEL_GIFS.rules,
    leaksGif: PANEL_GIFS.leaks
};

const TICKET_TYPES = {
    general: {
        label: "General Support",
        emoji: "💬",
        color: 0x2f7dff,
        description: "Questions, help, server issues, or anything that does not fit another type.",
        name: "general"
    },
    report: {
        label: "Player Report",
        emoji: "🛡️",
        color: 0xff4d6d,
        description: "Report rule breaking, trolling, exploiting, ramming, bypassing, or misconduct.",
        name: "report"
    },
    appeal: {
        label: "Appeal",
        emoji: "⚖️",
        color: 0xffc644,
        description: "Appeal a warning, timeout, kick, ban, or in-game moderation action.",
        name: "appeal"
    },
    partnership: {
        label: "Partnership",
        emoji: "🤝",
        color: 0x8a3ffc,
        description: "Partnerships, promotions, collaborations, or community relations.",
        name: "partnership"
    },
    staff_report: {
        label: "Staff Report",
        emoji: "⭐",
        color: 0xffa51f,
        description: "Report staff abuse, misconduct, bias, or unprofessional behavior.",
        name: "staff-report"
    }
};

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function progressBar(percent) {
    const total = 14;
    const filled = Math.round((percent / 100) * total);
    return "▰".repeat(filled) + "▱".repeat(total - filled) + `  **${percent}%**`;
}

function getTicketStaffRoles(guild) {
    return guild.roles.cache.filter(role => getRoleLevelByName(role.name) >= 500);
}

function buildTicketPanelEmbed(selectedType = null) {
    const selected = selectedType ? TICKET_TYPES[selectedType] : null;

    const ticketList = Object.entries(TICKET_TYPES).map(([id, type]) => {
        const glow = selectedType === id ? " ✦ **SELECTED**" : "";
        return `${type.emoji} **${type.label}**${glow}\n> ${type.description}`;
    }).join("\n\n");

    return new EmbedBuilder()
        .setAuthor({ name: "Palmor Support Centre" })
        .setTitle(selected ? `✨ ${selected.label} Selected` : "✨ Open a Palmor Support Ticket")
        .setDescription([
            "Need help with Palmor? Choose the ticket type that best matches your issue and the bot will create a private channel for you and staff.",
            "",
            "**Before opening a ticket:**",
            "• Explain what happened clearly.",
            "• Include Roblox usernames, Discord tags, screenshots, clips, links, or other proof when possible.",
            "• Do not spam-ping staff. Someone will answer when available.",
            "",
            "**Ticket Types**",
            ticketList,
            "",
            "Use the dropdown or buttons below to start."
        ].join("\n"))
        .setColor(selected ? selected.color : TICKET_BRAND.color)
        .setImage(TICKET_BRAND.bannerGif)
        .setFooter({ text: "Palmor Support • Select a type below to begin" })
        .setTimestamp();
}

function buildTicketPanelRows(selectedType = null) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choose your ticket type...")
        .addOptions(Object.entries(TICKET_TYPES).map(([id, type]) => ({
            label: type.label,
            value: id,
            description: type.description.slice(0, 100),
            emoji: type.emoji,
            default: selectedType === id
        })));

    const selectRow = new ActionRowBuilder().addComponents(menu);

    const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_open:general")
            .setLabel("Support")
            .setEmoji("💬")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("ticket_open:report")
            .setLabel("Report")
            .setEmoji("🛡️")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("ticket_open:appeal")
            .setLabel("Appeal")
            .setEmoji("⚖️")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("ticket_open:partnership")
            .setLabel("Partner")
            .setEmoji("🤝")
            .setStyle(ButtonStyle.Success)
    );

    return [selectRow, buttonRow];
}

function loadingTicketEmbed(type, step, percent, text) {
    const frames = ["✦", "✧", "✶", "✷", "✸", "✹"];
    const frame = frames[step % frames.length];

    const checklist = [
        percent >= 15 ? "✅ Request received" : "⬛ Request received",
        percent >= 30 ? "✅ Ticket type confirmed" : "⬛ Ticket type confirmed",
        percent >= 45 ? "✅ Private channel prepared" : "⬛ Private channel prepared",
        percent >= 65 ? "✅ Permissions locked" : "⬛ Permissions locked",
        percent >= 85 ? "✅ Staff notified" : "⬛ Staff notified",
        percent >= 100 ? "✅ Ticket ready" : "⬛ Ticket ready"
    ].join("\n");

    return new EmbedBuilder()
        .setTitle(`${frame} ${type.emoji} Creating ${type.label}`)
        .setDescription([
            `**${text}**`,
            "",
            progressBar(percent),
            "",
            checklist,
            "",
            "Please wait. Palmor is building your private support room."
        ].join("\n"))
        .setColor(type.color)
        .setImage(TICKET_BRAND.bannerGif)
        .setFooter({ text: `Palmor Ticket System • Stage ${step}/7` })
        .setTimestamp();
}

function ticketReadyEmbed(type, channel) {
    return new EmbedBuilder()
        .setTitle("✅ Your ticket is ready!")
        .setDescription([
            "Ticket created successfully.",
            "",
            `Channel: ${channel}`,
            "A staff member will be with you shortly."
        ].join("\n"))
        .setColor(TICKET_BRAND.green)
        .setTimestamp();
}

function getTicketOwnerId(channel) {
    const match = String(channel.topic || "").match(/Owner:\s*(\d+)/);
    return match ? match[1] : null;
}

async function createTicketChannel(interaction, typeId) {
    const type = TICKET_TYPES[typeId] || TICKET_TYPES.general;
    const guild = interaction.guild;
    const member = interaction.member;
    const guildKey = `${guild.id}:${typeId}`;
    const nextNumber = (Number(ticketCounters.get(guildKey)) || 0) + 1;

    ticketCounters.set(guildKey, nextNumber);
    saveDataSoon();

    const ticketNumber = String(nextNumber).padStart(4, "0");
    const channelName = `${type.name}-${ticketNumber}`;
    const staffRoles = getTicketStaffRoles(guild);

    const overwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: member.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
            ]
        },
        {
            id: client.user.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageChannels,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
            ]
        },
        ...staffRoles.map(role => ({
            id: role.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks
            ]
        }))
    ];

    const channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: interaction.channel?.parentId || null,
        topic: `Palmor Ticket | Owner: ${member.id} | Type: ${type.label} | Claimed: no`,
        permissionOverwrites: overwrites,
        reason: `Ticket created by ${interaction.user.tag}`
    });

    const ticketEmbed = new EmbedBuilder()
        .setTitle(`${type.emoji} ${type.label}`)
        .setDescription([
            `${member}, your ticket has been created.`,
            "",
            `**Type:** ${type.label}`,
            `**User:** ${interaction.user.tag}`,
            "",
            "Staff can claim, transcript, or close this ticket using the buttons below."
        ].join("\n"))
        .setColor(type.color)
        .setImage(TICKET_BRAND.bannerGif)
        .setTimestamp();

    const controls = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ticket_claim")
            .setLabel("Claim")
            .setEmoji("🙋")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("ticket_transcript")
            .setLabel("Transcript")
            .setEmoji("🧾")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Close")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
        content: `${member} ${staffRoles.size ? staffRoles.map(role => `${role}`).join(" ") : ""}`.trim(),
        embeds: [ticketEmbed],
        components: [controls]
    });

    await logAction(guild, `Ticket created by ${interaction.user.tag}: ${channel.name}`);
    return channel;
}

async function runTicketAnimation(interaction, typeId) {
    const type = TICKET_TYPES[typeId] || TICKET_TYPES.general;

    await interaction.reply({
        embeds: [loadingTicketEmbed(type, 1, 8, "Waking up the ticket system...")],
        ephemeral: true
    });

    await wait(850);
    await interaction.editReply({ embeds: [loadingTicketEmbed(type, 2, 18, "Reading your request type...")] });

    await wait(850);
    await interaction.editReply({ embeds: [loadingTicketEmbed(type, 3, 32, "Preparing the private channel shell...")] });

    await wait(850);
    await interaction.editReply({ embeds: [loadingTicketEmbed(type, 4, 48, "Syncing ticket permissions...")] });

    await wait(850);
    await interaction.editReply({ embeds: [loadingTicketEmbed(type, 5, 67, "Locking the channel from everyone else...")] });

    await wait(850);
    await interaction.editReply({ embeds: [loadingTicketEmbed(type, 6, 84, "Pinging the right staff roles...")] });

    const channel = await createTicketChannel(interaction, typeId);

    await wait(850);
    await interaction.editReply({ embeds: [loadingTicketEmbed(type, 7, 100, "Finalizing your ticket...")] });

    await wait(650);
    await interaction.editReply({
        embeds: [ticketReadyEmbed(type, channel)],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel("Go to Ticket")
                    .setEmoji("➡️")
                    .setStyle(ButtonStyle.Link)
                    .setURL(channel.url)
            )
        ]
    });
}

async function sendTicketPanel(message) {
    await message.channel.send({
        embeds: [buildTicketPanelEmbed()],
        components: buildTicketPanelRows()
    });
}

async function sendLeakPanel(message, args) {
    const role = message.mentions.roles.first() || findRole(message.guild, args.join(" ").trim());
    if (!role) return message.reply("Mention the Game Leaks role or give the role name.");

    if (!canManageRole(message, role, true)) {
        return message.reply("I cannot manage that role. Put my bot role above it first.");
    }

    const text = args
        .filter(arg => !/^<@&\d+>$/.test(arg))
        .join(" ")
        .trim() || "Click the button below to toggle game leak access.";

    const embed = new EmbedBuilder()
        .setTitle("🎮 Game Leaks Access")
        .setDescription([
            text,
            "",
            `Role: ${role}`,
            "",
            "Press the button to get or remove the role."
        ].join("\n"))
        .setColor(TICKET_BRAND.purple)
        .setImage(TICKET_BRAND.leaksGif)
        .setFooter({ text: "Palmor Leaks • Button role panel" })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`leak_toggle:${role.id}`)
            .setLabel("Toggle Game Leaks")
            .setEmoji("🎮")
            .setStyle(ButtonStyle.Success)
    );

    await message.channel.send({ embeds: [embed], components: [row] });
    return message.reply("Game leaks button panel created.");
}

async function sendLeakReactionPanel(message, args) {
    const role = message.mentions.roles.first() || findRole(message.guild, args.join(" ").trim());
    if (!role) return message.reply("Mention the Game Leaks role or give the role name.");

    if (!canManageRole(message, role, true)) {
        return message.reply("I cannot manage that role. Put my bot role above it first.");
    }

    const text = args
        .filter(arg => !/^<@&\d+>$/.test(arg))
        .join(" ")
        .trim() || "React with 🎮 to get or remove the Game Leaks role.";

    const embed = new EmbedBuilder()
        .setTitle("🎮 Game Leaks Access")
        .setDescription([
            text,
            "",
            `Role: ${role}`,
            "",
            "React with 🎮 below to toggle this role."
        ].join("\n"))
        .setColor(TICKET_BRAND.purple)
        .setImage(TICKET_BRAND.leaksGif)
        .setFooter({ text: "Palmor Leaks • Reaction role panel" })
        .setTimestamp();

    const panelMessage = await message.channel.send({ embeds: [embed] });
    await panelMessage.react("🎮");

    leakReactionPanels.set(panelMessage.id, {
        guildId: message.guild.id,
        channelId: message.channel.id,
        roleId: role.id,
        emoji: "🎮"
    });

    saveDataSoon();
    return message.reply("Game leaks reaction panel created.");
}

async function makeTicketTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
    if (!messages) return null;

    const lines = messages
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
        .map(message => {
            const time = new Date(message.createdTimestamp).toISOString();
            const attachments = message.attachments.size ? ` Attachments: ${message.attachments.map(a => a.url).join(", ")}` : "";
            return `[${time}] ${message.author.tag}: ${message.content || ""}${attachments}`;
        });

    return new AttachmentBuilder(Buffer.from(lines.join("\n"), "utf8"), {
        name: `${channel.name}-transcript.txt`
    });
}

async function handleTicketButton(interaction) {
    const ownerId = getTicketOwnerId(interaction.channel);
    const isOwner = ownerId === interaction.user.id;
    const isStaff = getStaffLevel(interaction.member) >= 500;

    if (interaction.customId === "ticket_claim") {
        if (!isStaff) return interaction.reply({ content: "Only staff can claim tickets.", ephemeral: true });

        await interaction.channel.setTopic(String(interaction.channel.topic || "").replace("Claimed: no", `Claimed: ${interaction.user.tag}`)).catch(() => {});
        await interaction.reply(`🙋 Ticket claimed by ${interaction.user}.`);
        return;
    }

    if (interaction.customId === "ticket_transcript") {
        if (!isStaff && !isOwner) return interaction.reply({ content: "Only staff or the ticket owner can make a transcript.", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });
        const transcript = await makeTicketTranscript(interaction.channel);
        if (!transcript) return interaction.editReply("I could not make a transcript.");

        await interaction.editReply({ content: "Transcript created.", files: [transcript] });
        return;
    }

    if (interaction.customId === "ticket_close") {
        if (!isStaff && !isOwner) return interaction.reply({ content: "Only staff or the ticket owner can close this ticket.", ephemeral: true });

        await interaction.reply({ content: "🔒 Closing this ticket in 5 seconds...", ephemeral: true }).catch(() => {});
        await wait(5000);
        await interaction.channel.delete(`Ticket closed by ${interaction.user.tag}`).catch(() => {});
    }
}

async function handleLeakButton(interaction) {
    const roleId = interaction.customId.split(":")[1];
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) return interaction.reply({ content: "That role no longer exists.", ephemeral: true });

    const member = interaction.member;

    if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role).catch(() => null);
        return interaction.reply({ content: `Removed ${role.name}.`, ephemeral: true });
    }

    await member.roles.add(role).catch(() => null);
    return interaction.reply({ content: `Added ${role.name}.`, ephemeral: true });
}


const PALMOR_RULES = [
    {
        title: "Respect All Players",
        text: "All communication and in-game actions must remain respectful. This includes chat, usernames, vehicles, tools, and physical actions in-game."
    },
    {
        title: "No Exploiting, Cheating, or Glitch Abuse",
        text: "Using scripts, bugs, glitches, or unintended mechanics within the game for any advantage is strictly prohibited."
    },
    {
        title: "In-Game Actions Are Subject to Rules",
        text: "All gameplay actions such as driving, blocking, trolling, ramming, spawning, and similar behavior are moderated at all times."
    },
    {
        title: "No Attempting to Bypass Rules or Systems",
        text: "Trying to find loopholes, avoid filters, abuse mechanics, or technically avoid punishment will still be treated as a violation."
    },
    {
        title: "Follow Staff Instructions",
        text: "Staff decisions apply to chat and gameplay. Ignoring, arguing with, or avoiding staff instructions may result in punishment."
    },
    {
        title: "No Disruptive Behavior",
        text: "Do not intentionally ruin gameplay. This includes trolling, random vehicle ramming, blocking areas, abusing mechanics, or interfering with others."
    },
    {
        title: "No Abuse of Game Features",
        text: "Cars, economy, tools, spawning, and other systems must be used as intended. Misuse is not allowed just because it is possible."
    },
    {
        title: "No Scamming, Misleading, or Unfair Advantage",
        text: "Do not deceive players, manipulate systems, or gain unfair advantages through dishonest behavior."
    },
    {
        title: "No Impersonation",
        text: "Do not act as staff, developers, or other players through chat, behavior, display names, avatars, or appearance."
    },
    {
        title: "No Inappropriate or Offensive Content",
        text: "This applies to chat, avatars, vehicles, decals, creations, usernames, and any in-game actions."
    },
    {
        title: "No Punishment Evasion",
        text: "Leaving and rejoining, using alternate accounts, hiding actions, or avoiding moderation will result in harsher penalties."
    },
    {
        title: "Staff Have Final Say",
        text: "Even if something is not specifically listed, staff may act if behavior negatively affects players, the server, or the game."
    },
    {
        title: "Use Tickets Properly",
        text: "Reports, appeals, staff concerns, and serious issues should go through tickets with proof when possible. Do not abuse tickets."
    },
    {
        title: "Keep Palmor Safe",
        text: "Do not share suspicious links, attempt account theft, encourage raids, or help others break server or game rules."
    }
];

function buildRulesEmbed() {
    const rules = PALMOR_RULES.map((rule, index) => {
        return `**${index + 1}. ${rule.title}**\n> ${rule.text}`;
    }).join("\n\n");

    return new EmbedBuilder()
        .setTitle("📜 Palmor Rules & Expectations")
        .setDescription([
            "Welcome to Palmor. These rules apply to the Discord server, in-game behavior, vehicles, tools, economy, and all player interactions.",
            "",
            "Read everything carefully before chatting, playing, reporting, or opening tickets. Staff decisions are based on context, proof, and server safety.",
            "",
            rules,
            "",
            "**By staying in Palmor, you agree to follow these rules and respect staff decisions.**",
            "If something feels unclear, open a support ticket instead of guessing."
        ].join("\n\n"))
        .setColor(TICKET_BRAND.gold)
        .setImage(TICKET_BRAND.rulesGif)
        .setFooter({ text: "Palmor Rules • Staff may act on harmful behavior even if it is not listed word-for-word" })
        .setTimestamp();
}

function buildRulesRows() {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("rules_ack")
            .setLabel("I understand")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("ticket_open:report")
            .setLabel("Report Player")
            .setEmoji("🛡️")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId("ticket_open:appeal")
            .setLabel("Appeal")
            .setEmoji("⚖️")
            .setStyle(ButtonStyle.Secondary)
    );

    return [row];
}

async function sendRulesPanel(message) {
    await message.channel.send({
        embeds: [buildRulesEmbed()],
        components: buildRulesRows()
    });
}

const HELP_PAGES = [
    {
        title: "Palmor Bot Commands - Public",
        lines: [
            "`ping` - Checks if the bot is online and shows ping.",
            "`help` / `commands` - Shows every command list with descriptions.",
            "`memberhelp` / `funhelp` - Shows public/member commands.",
            "`botinfo` - Shows bot name, server count, prefix, and ping.",
            "`uptime` - Shows how long the bot has been online.",
            "`serverinfo` - Shows server name, member count, owner ID, and creation date.",
            "`membercount` - Shows how many members are in the server.",
            "`userinfo [@user/id/name]` - Shows info about a member.",
            "`profile [@user/id/name]` - Shows profile, staff level, cash, XP, and rep.",
            "`avatar [@user/id/name]` - Shows a user's avatar.",
            "`servericon` - Shows the server icon."
        ]
    },
    {
        title: "Palmor Bot Commands - Member & Fun",
        lines: [
            "`balance` / `bal` - Shows your cash and bank balance.",
            "`daily` - Claims your daily cash reward.",
            "`work` - Work for a random cash reward.",
            "`crime` - Risk getting caught for a bigger cash reward.",
            "`beg` - Beg for a small amount of cash.",
            "`pay @user amount` - Gives cash to another member.",
            "`leaderboard` / `lb` - Shows the richest members.",
            "`rep @user` - Gives someone +1 reputation.",
            "`afk [reason]` - Marks you as AFK.",
            "`remindme 10m text` - Sends you a reminder later.",
            "`suggest text` - Sends a suggestion.",
            "`report @user reason` - Reports a member to staff/logs.",
            "`joke` - Sends a random joke.",
            "`quote` - Sends a random quote.",
            "`rate thing` - Rates something out of 10.",
            "`ship @user @user` - Gives a random ship percentage.",
            "`hug @user` - Hugs someone.",
            "`slap @user` - Slaps someone.",
            "`meme` - Sends a random meme-style line.",
            "`coinflip` - Flips heads or tails.",
            "`roll [sides]` - Rolls a dice.",
            "`choose a | b | c` - Picks one option.",
            "`8ball question` - Answers a question."
        ]
    },
    {
        title: "Palmor Bot Commands - Staff Member & Helper",
        lines: [
            "`stafflevel [@user/id/name]` - Shows someone's staff level.",
            "`permissions [@user/id/name]` - Shows someone's permission level.",
            "`say text` - Makes the bot say a message.",
            "`embed text` - Sends a clean embed message.",
            "`poll question | option1 | option2` - Creates a poll.",
            "`roleinfo role` - Shows info about a role.",
            "`rolelist` / `roles` - Lists server roles and configured staff levels.",
            "`staffroles` - Lists roles that count as staff roles."
        ]
    },
    {
        title: "Palmor Bot Commands - Trial Moderator & Moderator",
        lines: [
            "`warn @user reason` - Warns a member.",
            "`warnings @user` - Shows a member's warnings.",
            "`clearwarnings @user` - Clears a member's warnings.",
            "`announce text` - Sends an announcement in the channel.",
            "`purge amount` / `clear amount` - Deletes 1-100 recent messages.",
            "`slowmode seconds` - Sets slowmode in the current channel.",
            "`topic text` - Changes the channel topic.",
            "`nick @user nickname` - Changes someone's nickname.",
            "`nickname @user nickname` - Same as nick.",
            "`resetnick @user` - Resets someone's nickname.",
            "`dm @user message` - Sends a staff DM to a member.",
            "`timeout @user 10m reason` - Times out a member.",
            "`untimeout @user` - Removes timeout.",
            "`lock` - Stops everyone from sending messages in the channel.",
            "`unlock` - Unlocks the channel.",
            "`hide` - Hides the channel from everyone.",
            "`unhide` - Makes the channel visible again.",
            "`renamechannel name` - Renames the current channel.",
            "`mute @user` - Voice mutes someone.",
            "`unmute @user` - Removes voice mute.",
            "`deafen @user` - Voice deafens someone.",
            "`undeafen @user` - Removes voice deafen.",
            "`movevc @user voiceChannelId` - Moves someone to a voice channel.",
            "`disconnectvc @user` - Disconnects someone from voice.",
            "`quarantine @user reason` - Gives the quarantine role.",
            "`unquarantine @user` - Removes the quarantine role."
        ]
    },
    {
        title: "Palmor Bot Commands - Senior Mod, Admin & Game Management",
        lines: [
	"`Game Management` - Level 875. Can use Admin-level commands, but not Director-level commands.",
            "`kick @user reason` - Kicks a member.",
            "`temprole @user role 10m` - Gives a role temporarily.",
            "`ban @user/id reason` - Bans a member or user ID.",
            "`tempban @user/id 1d reason` - Bans someone temporarily.",
            "`softban @user/id reason` - Bans then unbans to clear messages.",
            "`unban userId` - Unbans a user ID.",
            "`addrole @user role` - Adds a role to someone.",
            "`rank @user role` - Same as addrole.",
            "`removerole @user role` - Removes a role from someone.",
            "`unrank @user role` - Same as removerole.",
            "`rolemembercount role` - Shows how many members have a role.",
            "`rolemembers role` - Lists members with a role.",
            "`whohas role` - Same as rolemembers."
        ]
    },
    {
        title: "Palmor Bot Commands - Director / Executive - Level 900+",
        lines: [
            "`createrole name` - Creates a new role.",
            "`deleterole role` - Deletes a role.",
            "`createchannel name` - Creates a text channel.",
            "`deletechannel` - Deletes the current channel."
        ]
    },
    {
        title: "Palmor Bot Commands - Co-Owner+",
        lines: [
            "`coowner` / `coownerhelp` - Shows Co-Owner commands.",
            "`raidmode on/off` - Turns raid mode on or off.",
            "`antiraid` - Shows anti-raid status.",
            "`antiraid on/off` - Enables or disables anti-raid.",
            "`antiraid strict` - Enables stricter link/invite filtering.",
            "`antiraid normal` - Returns anti-raid to normal mode.",
            "`lockdown` / `lockall` - Locks all text channels.",
            "`unlockdown` / `unlockall` - Unlocks all text channels.",
            "`slowmodeall seconds` - Sets slowmode in all text channels.",
            "`nuke` - Deletes the current channel and recreates it empty.",
            "`clonechannel` - Clones the current channel without deleting the old one.",
            "`serverannounce text` - Sends an everyone announcement.",
            "`staffannounce text` - Sends a staff announcement to the log channel.",
            "`roleall role` - Gives a role to all non-bot members.",
            "`massrole role` - Same as roleall.",
            "`removeroleall role` - Removes a role from all members.",
            "`massunrole role` - Same as removeroleall.",
            "`allowdomain domain.com` - Adds a safe domain.",
            "`blockdomain domain.com` - Blocks a bad domain.",
            "`removedomain domain.com` - Removes a domain from both lists.",
            "`domains` - Shows allowed and blocked domains.",
            "`recentjoins` - Shows recent members who joined.",
            "`newaccounts` - Shows recently joined young accounts.",
            "`modstats` - Shows moderation action stats."
        ]
    },
    {
        title: "Palmor Bot Commands - Owner Only",
        lines: [
            "`ownerhelp` - Shows Owner-only commands.",
            "`setrolelevel role number` - Sets a role's staff level.",
            "`reloadlevels` - Reloads default role levels and clears temporary custom levels.",
            "`setquarantine role` - Sets the quarantine role.",
            "`forcerank @user role` - Forces a role onto someone.",
            "`forceremoverole @user role` - Forces a role off someone.",
            "`sayin channelId message` - Sends a message in another channel.",
            "`giveroleall role` - Owner version of roleall.",
            "`takeallrole role` - Owner version of removeroleall.",
            "`masspurge amount` - Deletes up to 100 messages.",
            "`shutdownmsg text` - Sends a shutdown message and turns off the bot."
        ]
    }
];

function getHelpPageByCommand(command) {
    command = String(command || "").toLowerCase();

    if (command === "memberhelp" || command === "funhelp") return [HELP_PAGES[0], HELP_PAGES[1]];
    if (command === "staffhelp") return [HELP_PAGES[2]];
    if (command === "modhelp") return [HELP_PAGES[3]];
    if (command === "adminhelp") return [HELP_PAGES[4], HELP_PAGES[5]];
    if (command === "coowner" || command === "coownerhelp") return [HELP_PAGES[6]];
    if (command === "ownerhelp") return [HELP_PAGES[7]];

    return HELP_PAGES;
}

async function sendHelp(message, command) {
    const normalized = String(command || "").toLowerCase();

    if (normalized === "help" || normalized === "commands") {
        return message.channel.send([
            "**Palmor Bot Commands**",
            "",
            "**Public & Fun**",
            "`ping` `botinfo` `uptime` `serverinfo` `membercount` `userinfo` `profile` `avatar` `servericon`",
            "`balance` `daily` `work` `crime` `beg` `pay` `leaderboard` `rep` `afk` `remindme`",
            "`suggest` `report` `joke` `quote` `rate` `ship` `hug` `slap` `meme` `coinflip` `roll` `choose` `8ball`",
            "",
            "**Staff / Helper+**",
            "`stafflevel` `permissions` `say` `embed` `poll` `roleinfo` `rolelist` `roles` `staffroles`",
            "`ticketpanel` `leakpanel`",
            "",
            "**Moderation / Server management**",
            "`warn` `warnings` `clearwarnings` `announce` `purge` `clear` `slowmode` `topic` `nick` `resetnick` `dm`",
            "`timeout` `untimeout` `lock` `unlock` `hide` `unhide` `renamechannel` `mute` `unmute` `deafen` `undeafen` `movevc` `disconnectvc` `quarantine` `unquarantine`",
            "",
            "**Admin / Game management / Director+**",

            "`kick` `temprole` `ban` `unban` `softban` `tempban` `addrole` `rank` `removerole` `unrank`",
            "`rolemembercount` `rolemembers` `whohas` `createrole` `deleterole` `createchannel` `deletechannel`",
            "",
            "**Co-Owner+**",
            "`raidmode` `antiraid` `lockdown` `unlockdown` `lockall` `unlockall` `slowmodeall` `nuke` `clonechannel`",
            "`serverannounce` `staffannounce` `roleall` `massrole` `removeroleall` `massunrole`",
            "`allowdomain` `blockdomain` `removedomain` `domains` `recentjoins` `newaccounts` `modstats`",
            "",
            "**Owner Only**",
            "`setrolelevel` `reloadlevels` `setquarantine` `forcerank` `forceremoverole` `sayin` `giveroleall` `takeallrole` `masspurge` `shutdownmsg`",
            "",
            "**Detailed Help**",
            "`memberhelp` `staffhelp` `modhelp` `adminhelp` `coowner` `ownerhelp`"
        ].join("\n"));
    }

    const pages = getHelpPageByCommand(command);

    for (const page of pages) {
        await message.channel.send([
            `**${page.title}**`,
            "",
            ...page.lines
        ].join("\n"));
    }
}

client.once("clientReady", () => {
    quarantineRoleId = data.quarantineRoleId || quarantineRoleId;
    console.log(`Palmor moderation is online as ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
    if (!antiRaid.enabled) return;

    const now = Date.now();
    const guildId = member.guild.id;
    const joins = joinBuckets.get(guildId) || [];

    joins.push(now);

    const recent = joins.filter(time => now - time <= antiRaid.joinWindowMs);
    joinBuckets.set(guildId, recent);

    recentJoins.unshift({
        id: member.id,
        tag: member.user.tag,
        createdTimestamp: member.user.createdTimestamp,
        joinedAt: now
    });

    while (recentJoins.length > 50) recentJoins.pop();

    const accountAge = now - member.user.createdTimestamp;
    const youngAccount = accountAge < antiRaid.minimumAccountAgeMs;

    if (recent.length >= antiRaid.joinLimit) {
        antiRaid.raidMode = true;
        saveDataSoon();
        await logAction(member.guild, `Raid mode enabled automatically. ${recent.length} joins in ${formatDuration(antiRaid.joinWindowMs)}.`);
    }

    if (antiRaid.raidMode || antiRaid.strictMode || youngAccount) {
        const quarantined = await applyQuarantine(member, "Anti-raid quarantine");

        if (quarantined) {
            await logAction(member.guild, `Quarantined ${member.user.tag}. Reason: ${youngAccount ? "new account" : "raid mode"}`);
        } else if (member.moderatable) {
            await member.timeout(antiRaid.autoTimeoutMs, "Anti-raid protection").catch(() => {});
            await logAction(member.guild, `Timed out ${member.user.tag}. Reason: ${youngAccount ? "new account" : "raid mode"}`);
        }
    }
});


client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === "rules_select") {
            const categoryId = interaction.values[0];

            await interaction.message.edit({
                embeds: [buildRulesEmbed(categoryId)],
                components: buildRulesRows(categoryId)
            }).catch(() => {});

            await interaction.deferUpdate().catch(() => {});
            return;
        }

        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
            const typeId = interaction.values[0];

            await interaction.message.edit({
                embeds: [buildTicketPanelEmbed(typeId)],
                components: buildTicketPanelRows(typeId)
            }).catch(() => {});

            await runTicketAnimation(interaction, typeId);
            return;
        }

        if (!interaction.isButton()) return;

        if (interaction.customId === "rules_ack") {
            await interaction.reply({ content: "✅ Thanks for reading the rules.", ephemeral: true });
            return;
        }

        if (interaction.customId === "rules_main") {
            await interaction.message.edit({
                embeds: [buildRulesEmbed("main")],
                components: buildRulesRows("main")
            }).catch(() => {});

            await interaction.deferUpdate().catch(() => {});
            return;
        }

        if (interaction.customId.startsWith("ticket_open:")) {
            const typeId = interaction.customId.split(":")[1];
            await runTicketAnimation(interaction, typeId);
            return;
        }

        if (interaction.customId.startsWith("leak_toggle:")) {
            await handleLeakButton(interaction);
            return;
        }

        if (interaction.customId === "ticket_claim" || interaction.customId === "ticket_transcript" || interaction.customId === "ticket_close") {
            await handleTicketButton(interaction);
            return;
        }
    } catch (error) {
        console.error(error);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: "Something went wrong with that interaction." }).catch(() => {});
        } else {
            await interaction.reply({ content: "Something went wrong with that interaction.", ephemeral: true }).catch(() => {});
        }
    }
});

async function handleLeakReaction(reaction, user, removing = false) {
    if (user.bot) return;

    if (reaction.partial) {
        await reaction.fetch().catch(() => null);
    }

    if (reaction.message?.partial) {
        await reaction.message.fetch().catch(() => null);
    }

    const panel = leakReactionPanels.get(reaction.message.id);
    if (!panel) return;

    if (reaction.emoji.name !== panel.emoji) return;

    const guild = reaction.message.guild;
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const role = guild.roles.cache.get(panel.roleId);
    if (!role) return;

    if (role.position >= guild.members.me.roles.highest.position) return;

    if (removing) {
        await member.roles.remove(role).catch(() => null);
    } else {
        await member.roles.add(role).catch(() => null);
    }
}

client.on("messageReactionAdd", async (reaction, user) => {
    await handleLeakReaction(reaction, user, false).catch(console.error);
});

client.on("messageReactionRemove", async (reaction, user) => {
    await handleLeakReaction(reaction, user, true).catch(console.error);
});

const LICENSE_PUBLIC_COMMANDS = new Set([
    "activate",
    "license",
    "ping",
    "help",
    "commands",
    "botinfo",
    "serverinfo"
]);

const LICENSE_OWNER_COMMANDS = new Set([
    "keycreate",
    "keylist",
    "keyrevoke",
    "serverlist",
    "serverenable",
    "serverdisable"
]);

function isBotOwner(userId) {
    return BOT_OWNER_IDS.has(String(userId));
}

function randomLicenseKey() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const part = length => Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    return `PALMOR-${part(4)}-${part(4)}-${part(4)}`;
}

function parseLicenseDuration(input) {
    if (!input || String(input).toLowerCase() === "lifetime") return null;
    return parseDuration(input);
}

function isServerLicensed(guildId) {
    if (!guildId) return false;
    if (disabledServers.has(String(guildId))) return false;

    const license = licensedServers.get(String(guildId));
    if (!license) return false;

    if (license.expiresAt && Date.now() > Number(license.expiresAt)) {
        license.active = false;
        license.expired = true;
        licensedServers.set(String(guildId), license);
        saveDataSoon();
        return false;
    }

    return license.active !== false;
}

function getLicenseStatus(guildId) {
    if (disabledServers.has(String(guildId))) return "Disabled by bot owner";

    const license = licensedServers.get(String(guildId));
    if (!license) return "Not activated";
    if (license.expiresAt && Date.now() > Number(license.expiresAt)) return "Expired";
    if (license.active === false) return "Inactive";

    return license.expiresAt
        ? `Active until <t:${Math.floor(Number(license.expiresAt) / 1000)}:F>`
        : "Lifetime active";
}

function canActivateServer(message) {
    if (!message.guild || !message.member) return false;
    if (message.guild.ownerId === message.author.id) return true;
    if (message.member.permissions?.has(PermissionFlagsBits.ManageGuild)) return true;
    return isBotOwner(message.author.id);
}

async function notifyBotOwnersAboutGuild(guild, reason = "Bot added to server") {
    const owner = await guild.fetchOwner().catch(() => null);
    let invite = "Could not create invite.";

    const inviteChannel = guild.channels.cache.find(channel =>
        channel.isTextBased?.() &&
        channel.viewable &&
        channel.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.CreateInstantInvite)
    );

    if (inviteChannel) {
        const createdInvite = await inviteChannel.createInvite({
            maxAge: 0,
            maxUses: 0,
            unique: true,
            reason: "Palmor license review"
        }).catch(() => null);

        if (createdInvite) invite = createdInvite.url;
    }

    const embed = new EmbedBuilder()
        .setTitle("Palmor Bot Server Notice")
        .setDescription([
            `**Reason:** ${reason}`,
            `**Server:** ${guild.name}`,
            `**Server ID:** ${guild.id}`,
            `**Owner:** ${owner ? `${owner.user.tag} (${owner.id})` : guild.ownerId}`,
            `**Members:** ${guild.memberCount}`,
            `**License:** ${getLicenseStatus(guild.id)}`,
            `**Invite:** ${invite}`
        ].join("\n"))
        .setColor(0x35e66b)
        .setTimestamp();

    for (const ownerId of BOT_OWNER_IDS) {
        const user = await client.users.fetch(ownerId).catch(() => null);
        if (user) await user.send({ embeds: [embed] }).catch(() => {});
    }
}

async function sendLockedNotice(message) {
    const embed = new EmbedBuilder()
        .setTitle("Palmor Bot Locked")
        .setDescription([
            "This server has not been activated yet.",
            "A server owner or manager must activate the bot with a valid owner key.",
            "",
            `Use: \`${PREFIX}activate YOUR-KEY\``,
            `Check status: \`${PREFIX}license\``
        ].join("\n"))
        .setColor(0xffc644)
        .setTimestamp();

    await message.reply({ embeds: [embed] }).catch(() => {});
}

async function handleLicenseCommand(message, command, args) {
    if (command === "license") {
        const license = licensedServers.get(message.guild.id);

        const embed = new EmbedBuilder()
            .setTitle("Palmor License Status")
            .setDescription([
                `**Server:** ${message.guild.name}`,
                `**Server ID:** ${message.guild.id}`,
                `**Status:** ${getLicenseStatus(message.guild.id)}`,
                license?.key ? `**Key:** ${license.key}` : "**Key:** None"
            ].join("\n"))
            .setColor(isServerLicensed(message.guild.id) ? 0x35e66b : 0xffc644)
            .setTimestamp();

        await message.reply({ embeds: [embed] });
        return true;
    }

    if (command === "activate") {
        if (!canActivateServer(message)) {
            await message.reply("Only the server owner, someone with Manage Server, or the bot owner can activate this bot.");
            return true;
        }

        const key = String(args[0] || "").trim().toUpperCase();

        if (!key) {
            await message.reply(`Use: \`${PREFIX}activate PALMOR-XXXX-XXXX-XXXX\``);
            return true;
        }

        const keyData = licenseKeys.get(key);

        if (!keyData) {
            await message.reply("That activation key does not exist.");
            return true;
        }

        if (keyData.revoked) {
            await message.reply("That activation key has been revoked.");
            return true;
        }

        if (keyData.usedByGuildId && keyData.usedByGuildId !== message.guild.id) {
            await message.reply("That activation key was already used on another server.");
            return true;
        }

        const expiresAt = keyData.durationMs ? Date.now() + Number(keyData.durationMs) : null;

        keyData.usedByGuildId = message.guild.id;
        keyData.usedByGuildName = message.guild.name;
        keyData.usedByUserId = message.author.id;
        keyData.usedAt = Date.now();
        licenseKeys.set(key, keyData);

        licensedServers.set(message.guild.id, {
            active: true,
            key,
            guildName: message.guild.name,
            activatedBy: message.author.id,
            activatedAt: Date.now(),
            expiresAt
        });

        disabledServers.delete(message.guild.id);
        saveDataSoon();

        await message.reply(`Palmor Bot activated for **${message.guild.name}**. Status: ${getLicenseStatus(message.guild.id)}`);
        await notifyBotOwnersAboutGuild(message.guild, `Server activated by ${message.author.tag}`);
        return true;
    }

    if (LICENSE_OWNER_COMMANDS.has(command)) {
        if (!isBotOwner(message.author.id)) {
            await message.reply("Only the bot owner can use that license command.");
            return true;
        }

        if (command === "keycreate") {
            const durationArg = args[0] || "lifetime";
            const count = Math.max(1, Math.min(Number(args[1]) || 1, 25));
            const durationMs = parseLicenseDuration(durationArg);
            const keys = [];

            if (durationArg !== "lifetime" && !durationMs) {
                await message.reply(`Invalid duration. Use something like \`${PREFIX}keycreate 30d\` or \`${PREFIX}keycreate lifetime\`.`);
                return true;
            }

            for (let i = 0; i < count; i++) {
                let key = randomLicenseKey();
                while (licenseKeys.has(key)) key = randomLicenseKey();

                licenseKeys.set(key, {
                    createdBy: message.author.id,
                    createdAt: Date.now(),
                    duration: durationArg,
                    durationMs: durationMs || null,
                    revoked: false
                });

                keys.push(key);
            }

            saveDataSoon();

            await message.author.send(
                `Created license key${keys.length > 1 ? "s" : ""}:
${keys.map(key => `\`${key}\``).join("\n")}`
            ).catch(() => {});

            await message.reply(`Created **${keys.length}** key${keys.length > 1 ? "s" : ""}. I DMed them to you.`);
            return true;
        }

        if (command === "keylist") {
            const rows = [...licenseKeys.entries()].slice(-25).reverse().map(([key, data]) => {
                const used = data.usedByGuildName ? `used by ${data.usedByGuildName}` : "unused";
                const revoked = data.revoked ? "revoked" : "active";
                const duration = data.duration || "lifetime";
                return `\`${key}\` - ${used} - ${revoked} - ${duration}`;
            });

            await message.reply(rows.length ? `**Recent License Keys**
${rows.join("\n")}` : "No keys created yet.");
            return true;
        }

        if (command === "keyrevoke") {
            const key = String(args[0] || "").trim().toUpperCase();
            const data = licenseKeys.get(key);

            if (!data) {
                await message.reply("Key not found.");
                return true;
            }

            data.revoked = true;
            data.revokedBy = message.author.id;
            data.revokedAt = Date.now();
            licenseKeys.set(key, data);

            if (data.usedByGuildId) {
                const license = licensedServers.get(data.usedByGuildId);
                if (license?.key === key) {
                    license.active = false;
                    license.revoked = true;
                    licensedServers.set(data.usedByGuildId, license);
                }
            }

            saveDataSoon();
            await message.reply(`Revoked key \`${key}\`.`);
            return true;
        }

        if (command === "serverlist") {
            const rows = [...licensedServers.entries()].slice(-30).reverse().map(([guildId, data]) => {
                const guild = client.guilds.cache.get(guildId);
                return `${guild?.name || data.guildName || "Unknown"} (${guildId}) - ${getLicenseStatus(guildId)}`;
            });

            await message.reply(rows.length ? `**Licensed Servers**
${rows.join("\n")}` : "No licensed servers yet.");
            return true;
        }

        if (command === "serverdisable" || command === "serverenable") {
            const guildId = String(args[0] || "").trim();

            if (!guildId) {
                await message.reply(`Use: \`${PREFIX}${command} SERVER_ID\``);
                return true;
            }

            if (command === "serverdisable") disabledServers.add(guildId);
            else disabledServers.delete(guildId);

            saveDataSoon();
            await message.reply(`${command === "serverdisable" ? "Disabled" : "Enabled"} server **${guildId}**.`);
            return true;
        }
    }

    return false;
}

function shouldBlockForLicense(message, command) {
    if (!message.guild) return false;
    if (isBotOwner(message.author.id)) return false;
    if (LICENSE_PUBLIC_COMMANDS.has(command)) return false;
    if (LICENSE_OWNER_COMMANDS.has(command)) return false;

    return !isServerLicensed(message.guild.id);
}

client.on("guildCreate", async (guild) => {
    await notifyBotOwnersAboutGuild(guild, "Bot added to new server").catch(console.error);

    const channel = guild.systemChannel || guild.channels.cache.find(ch =>
        ch.isTextBased?.() &&
        ch.viewable &&
        ch.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.SendMessages)
    );

    if (channel) {
        const embed = new EmbedBuilder()
            .setTitle("Palmor Bot Installed")
            .setDescription([
                "Thanks for adding Palmor Bot.",
                "This server is currently locked until activated with an owner key.",
                "",
                `Use: \`${PREFIX}activate YOUR-KEY\``,
                `Check status: \`${PREFIX}license\``
            ].join("\n"))
            .setColor(0xffc644)
            .setTimestamp();

        await channel.send({ embeds: [embed] }).catch(() => {});
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (afkStore.has(message.author.id)) {
        afkStore.delete(message.author.id);
        message.reply("Welcome back. I removed your AFK.").catch(() => {});
    }

    for (const user of message.mentions.users.values()) {
        const afk = afkStore.get(user.id);
        if (afk) {
            message.reply(`${user.tag} is AFK: ${afk.reason}`).catch(() => {});
            break;
        }
    }

    const blockedByAntiRaid = await handleAntiRaidMessage(message);
    if (blockedByAntiRaid) return;

    if (!message.content.startsWith(PREFIX)) {
        addXp(message.author.id, 5);
        return;
    }

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

    try {
        if (await handleLicenseCommand(message, command, args)) return;

        if (shouldBlockForLicense(message, command)) {
            await sendLockedNotice(message);
            return;
        }
        if (!(await ensureStaffAccess(message, command))) return;

        if (
            command === "help" ||
            command === "commands" ||
            command === "memberhelp" ||
            command === "funhelp" ||
            command === "staffhelp" ||
            command === "modhelp" ||
            command === "adminhelp" ||
            command === "coowner" ||
            command === "coownerhelp" ||
            command === "ownerhelp"
        ) {
            await sendHelp(message, command);
            return;
        }

        if (command === "rulespanel" || command === "rulepanel") {
            await sendRulesPanel(message);
            return;
        }

        if (command === "tickethelp") {
            return message.reply([
                "**Palmor Ticket Commands**",
                "`!ticketpanel` - Posts the support ticket panel. Server Management+.",
                "`!leakpanel @Role message` - Creates a Game Leaks button role panel. Server Management+.",
                "`!leakreaction @Role message` - Creates a Game Leaks reaction role panel. Server Management+.",
                "",
                "Tickets include select menus, buttons, loading edits, progress bars, claim, transcript, and close."
            ].join("\n"));
        }

        if (command === "ticketpanel" || command === "ticketsupport") {
            await sendTicketPanel(message);
            return;
        }        if (command === "applicationpanel" || command === "apppanel" || command === "applypanel") {
            await sendApplicationPanel(message);
            return;
        }

        if (command === "applicationhelp") {
            return message.reply([
                "**Palmor Application Commands**",
                "`!applicationpanel` - Posts the application panel. Server Management+.",
                "Applicants choose a type, choose a track, answer 12 questions, then staff review with Accept / Interview / Deny / Archive.",
                "Archive marks an application finished and disables the review buttons."
            ].join("\n"));
        }



        if (command === "leakpanel") {
            await sendLeakPanel(message, args);
            return;
        }

        if (command === "leakreaction") {
            await sendLeakReactionPanel(message, args);
            return;
        }
        if (command === "ping") return message.reply(`Pong! ${client.ws.ping}ms`);
        if (command === "uptime") return message.reply(`Online for **${formatDuration(client.uptime)}**.`);

        if (command === "botinfo") {
            return message.reply([
                "**Bot Info**",
                `Name: ${client.user.tag}`,
                `Servers: ${client.guilds.cache.size}`,
                `Prefix: ${PREFIX}`,
                `Ping: ${client.ws.ping}ms`
            ].join("\n"));
        }

        if (command === "serverinfo") {
            return message.reply([
                "**Server Info**",
                `Name: ${message.guild.name}`,
                `Members: ${message.guild.memberCount}`,
                `Owner ID: ${message.guild.ownerId}`,
                `Created: <t:${Math.floor(message.guild.createdTimestamp / 1000)}:F>`
            ].join("\n"));
        }

        if (command === "membercount") return message.reply(`This server has **${message.guild.memberCount}** members.`);

        if (command === "servericon") {
            const icon = message.guild.iconURL({ size: 1024 });
            return message.reply(icon || "This server has no icon.");
        }

        if (command === "avatar") {
            const member = getMentionedMember(message) || await findMember(message, args[0]) || message.member;
            return message.reply(member.user.displayAvatarURL({ size: 1024 }));
        }

        if (command === "userinfo" || command === "profile") {
            const member = getMentionedMember(message) || await findMember(message, args[0]) || message.member;
            const highestRole = getHighestStaffRole(member);
            const eco = getEconomy(member.id);
            const rep = repStore.get(member.id) || 0;

            return message.reply([
                `**Profile: ${member.user.tag}**`,
                `ID: ${member.user.id}`,
                `Display Name: ${member.displayName}`,
                `Staff Level: ${getStaffLevel(member)}`,
                `Highest Staff Role: ${highestRole ? highestRole.name : "None"}`,
                `Cash: ${formatMoney(eco.cash)}`,
                `Bank: ${formatMoney(eco.bank)}`,
                `Level: ${eco.level}`,
                `XP: ${eco.xp}`,
                `Rep: ${rep}`,
                `Joined: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                `Created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`
            ].join("\n"));
        }

        if (command === "stafflevel" || command === "permissions") {
            const member = getMentionedMember(message) || await findMember(message, args[0]) || message.member;
            const highestRole = getHighestStaffRole(member);
            return message.reply(`**${member.user.tag}** has staff level **${getStaffLevel(member)}**. Highest staff role: **${highestRole ? highestRole.name : "None"}**.`);
        }

        if (command === "balance" || command === "bal") {
            const member = getMentionedMember(message) || await findMember(message, args[0]) || message.member;
            const eco = getEconomy(member.id);
            return message.reply(`${member.user.tag} has **${formatMoney(eco.cash)}** cash and **${formatMoney(eco.bank)}** in bank.`);
        }

        if (command === "daily") {
            const eco = getEconomy(message.author.id);
            const now = Date.now();
            const cooldown = 24 * 60 * 60 * 1000;

            if (now - eco.dailyAt < cooldown) {
                return message.reply(`Daily is ready in **${formatDuration(cooldown - (now - eco.dailyAt))}**.`);
            }

            eco.cash += 750;
            eco.dailyAt = now;
            saveDataSoon();
            return message.reply("You claimed your daily reward: **$750**.");
        }

        if (command === "work") {
            const eco = getEconomy(message.author.id);
            const now = Date.now();
            const cooldown = 10 * 60 * 1000;

            if (now - eco.workAt < cooldown) {
                return message.reply(`You can work again in **${formatDuration(cooldown - (now - eco.workAt))}**.`);
            }

            const jobs = ["washed cars", "filed dealership papers", "delivered parts", "helped dispatch", "cleaned the lot"];
            const amount = Math.floor(Math.random() * 451) + 250;

            eco.cash += amount;
            eco.workAt = now;
            saveDataSoon();

            return message.reply(`You ${jobs[Math.floor(Math.random() * jobs.length)]} and earned **${formatMoney(amount)}**.`);
        }

        if (command === "crime") {
            const eco = getEconomy(message.author.id);
            const now = Date.now();
            const cooldown = 20 * 60 * 1000;

            if (now - eco.crimeAt < cooldown) {
                return message.reply(`You can try crime again in **${formatDuration(cooldown - (now - eco.crimeAt))}**.`);
            }

            eco.crimeAt = now;

            if (Math.random() < 0.45) {
                const fine = Math.min(eco.cash, Math.floor(Math.random() * 350) + 150);
                eco.cash -= fine;
                saveDataSoon();
                return message.reply(`You got caught and paid **${formatMoney(fine)}** in fines.`);
            }

            const amount = Math.floor(Math.random() * 900) + 300;
            eco.cash += amount;
            saveDataSoon();
            return message.reply(`You got away with **${formatMoney(amount)}**.`);
        }

        if (command === "beg") {
            const eco = getEconomy(message.author.id);
            const now = Date.now();
            const cooldown = 5 * 60 * 1000;

            if (now - eco.begAt < cooldown) {
                return message.reply(`You can beg again in **${formatDuration(cooldown - (now - eco.begAt))}**.`);
            }

            const amount = Math.floor(Math.random() * 151) + 25;
            eco.cash += amount;
            eco.begAt = now;
            saveDataSoon();
            return message.reply(`Someone gave you **${formatMoney(amount)}**.`);
        }

        if (command === "pay") {
            const target = getMentionedMember(message) || await findMember(message, args[0]);
            const amount = Math.floor(Number(args[1]));

            if (!target) return message.reply("Mention someone or give their Discord ID.");
            if (target.user.bot) return message.reply("You cannot pay bots.");
            if (!amount || amount <= 0) return message.reply("Give a valid amount.");

            const senderEco = getEconomy(message.author.id);
            const targetEco = getEconomy(target.id);

            if (senderEco.cash < amount) return message.reply("You do not have enough cash.");

            senderEco.cash -= amount;
            targetEco.cash += amount;
            saveDataSoon();

            return message.reply(`Paid **${formatMoney(amount)}** to ${target.user.tag}.`);
        }

        if (command === "leaderboard" || command === "lb") {
            const rows = [...economyStore.entries()]
                .sort((a, b) => (b[1].cash + b[1].bank) - (a[1].cash + a[1].bank))
                .slice(0, 10)
                .map(([userId, eco], index) => `${index + 1}. <@${userId}> - ${formatMoney((eco.cash || 0) + (eco.bank || 0))}`);

            return message.reply(rows.length ? `**Cash Leaderboard**\n${rows.join("\n")}` : "No economy data yet.");
        }

        if (command === "rep") {
            const target = getMentionedMember(message) || await findMember(message, args[0]);
            if (!target) return message.reply("Mention someone to rep.");
            if (target.id === message.author.id) return message.reply("You cannot rep yourself.");

            repStore.set(target.id, (repStore.get(target.id) || 0) + 1);
            saveDataSoon();

            return message.reply(`Gave +1 rep to ${target.user.tag}.`);
        }

        if (command === "afk") {
            const reason = args.join(" ").trim() || "AFK";
            afkStore.set(message.author.id, { reason, at: Date.now() });
            return message.reply(`You are now AFK: ${reason}`);
        }

        if (command === "remindme") {
            const durationText = args[0];
            const duration = parseDuration(durationText);
            const reminder = args.slice(1).join(" ").trim();

            if (!duration || !reminder) return message.reply(`Use: \`${PREFIX}remindme 10m check something\``);

            message.reply(`I will remind you in **${durationText}**.`);
            setTimeout(() => message.author.send(`Reminder from **${message.guild.name}**: ${reminder}`).catch(() => {}), duration);
            return;
        }

        if (command === "suggest") {
            const text = args.join(" ").trim();
            if (!text) return message.reply("Write a suggestion.");

            const channel = SUGGESTION_CHANNEL_ID ? message.guild.channels.cache.get(SUGGESTION_CHANNEL_ID) : message.channel;
            if (!channel || !channel.isTextBased()) return message.reply("Suggestion channel not found.");

            const sent = await channel.send({ embeds: [makeEmbed("New Suggestion", `**From:** ${message.author.tag}\n\n${text}`, 0x23beff)] });
            await sent.react("👍").catch(() => {});
            await sent.react("👎").catch(() => {});
            return message.reply("Suggestion sent.");
        }

        if (command === "report") {
            const target = getMentionedMember(message) || await findMember(message, args[0]);
            const reason = args.slice(1).join(" ").trim();

            if (!target) return message.reply("Mention someone or give their Discord ID.");
            if (!reason) return message.reply("Give a report reason.");

            const channel = REPORT_CHANNEL_ID ? message.guild.channels.cache.get(REPORT_CHANNEL_ID) : null;

            if (channel && channel.isTextBased()) {
                await channel.send({ embeds: [makeEmbed("Member Report", `**Reporter:** ${message.author.tag}\n**Target:** ${target.user.tag}\n**Reason:** ${reason}`, 0xff5c5c)] });
            } else {
                await logAction(message.guild, `Report from ${message.author.tag} against ${target.user.tag}: ${reason}`);
            }

            return message.reply("Report sent.");
        }

        if (command === "joke") {
            const jokes = [
                "Why did the Roblox car stop? It ran out of studs.",
                "I told my bot to chill. It timed itself out.",
                "Why did the admin cross the road? To check permissions on the other side.",
                "Palmor Motors called. They said your parking is criminal.",
                "Discord permissions are just escape rooms with extra buttons."
            ];
            return message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
        }

        if (command === "quote") {
            const quotes = [
                "Slow progress is still progress.",
                "If it breaks, we debug. If it works, we pretend it always did.",
                "A clean server is a happy server.",
                "Palmor never sleeps. The bot might, but Palmor does not."
            ];
            return message.reply(quotes[Math.floor(Math.random() * quotes.length)]);
        }

        if (command === "rate") {
            const thing = args.join(" ").trim();
            if (!thing) return message.reply("Rate what?");
            return message.reply(`I rate **${thing}** a **${Math.floor(Math.random() * 11)}/10**.`);
        }

        if (command === "ship") {
            const users = [...message.mentions.users.values()];
            const first = users[0] || message.author;
            const second = users[1] || message.author;
            return message.reply(`${first} x ${second}: **${Math.floor(Math.random() * 101)}%**`);
        }

        if (command === "hug") {
            const target = getMentionedMember(message);
            if (!target) return message.reply("Mention someone to hug.");
            return message.channel.send(`${message.author} hugged ${target}.`);
        }

        if (command === "slap") {
            const target = getMentionedMember(message);
            if (!target) return message.reply("Mention someone to slap.");
            return message.channel.send(`${message.author} slapped ${target}.`);
        }

        if (command === "meme") {
            const memes = [
                "When the bot finally works: certified Palmor moment.",
                "Me fixing permissions for the 37th time.",
                "Discord roles: I am the captain now.",
                "Roblox Studio errors watching you press Play again.",
                "The server after raid mode turns on: suddenly peaceful."
            ];
            return message.reply(memes[Math.floor(Math.random() * memes.length)]);
        }

        if (command === "coinflip") return message.reply(`You flipped **${Math.random() < 0.5 ? "Heads" : "Tails"}**.`);

        if (command === "roll") {
            const sides = Math.max(2, Math.min(Number(args[0]) || 6, 1000));
            return message.reply(`You rolled a **${Math.floor(Math.random() * sides) + 1}** out of ${sides}.`);
        }

        if (command === "choose") {
            const options = args.join(" ").split("|").map(option => option.trim()).filter(Boolean);
            if (options.length < 2) return message.reply(`Use it like: \`${PREFIX}choose pizza | burger | tacos\``);
            return message.reply(`I choose: **${options[Math.floor(Math.random() * options.length)]}**`);
        }

        if (command === "8ball") {
            if (!args.join(" ").trim()) return message.reply("Ask a question.");
            const answers = ["Yes.", "No.", "Maybe.", "Definitely.", "Probably not.", "Ask again later.", "Absolutely.", "Very doubtful.", "Palmor says yes.", "Palmor says absolutely not."];
            return message.reply(`8ball: ${answers[Math.floor(Math.random() * answers.length)]}`);
        }

        if (command === "antiraid") {
            const sub = (args[0] || "status").toLowerCase();

            if (sub === "on") antiRaid.enabled = true;
            if (sub === "off") antiRaid.enabled = false;

            if (sub === "strict") {
                antiRaid.strictMode = true;
                antiRaid.linkBlock = true;
                antiRaid.inviteBlock = true;
            }

            if (sub === "normal") {
                antiRaid.strictMode = false;
                antiRaid.linkBlock = false;
                antiRaid.inviteBlock = true;
            }

            saveDataSoon();

            return message.reply([
                "**Anti-Raid Status**",
                `Enabled: **${antiRaid.enabled}**`,
                `Raid Mode: **${antiRaid.raidMode}**`,
                `Strict Mode: **${antiRaid.strictMode}**`,
                `Join Limit: **${antiRaid.joinLimit} joins / ${formatDuration(antiRaid.joinWindowMs)}**`,
                `Minimum Account Age: **${formatDuration(antiRaid.minimumAccountAgeMs)}**`,
                `Invite Block: **${antiRaid.inviteBlock}**`,
                `Link Block: **${antiRaid.linkBlock}**`,
                `Quarantine Role: **${quarantineRoleId || "Not set"}**`
            ].join("\n"));
        }

        if (command === "raidmode") {
            const sub = (args[0] || "").toLowerCase();

            if (sub === "on") {
                antiRaid.raidMode = true;
                saveDataSoon();
                await logAction(message.guild, `Raid mode enabled by ${message.author.tag}.`);
                return message.reply("Raid mode is now **ON**.");
            }

            if (sub === "off") {
                antiRaid.raidMode = false;
                saveDataSoon();
                await logAction(message.guild, `Raid mode disabled by ${message.author.tag}.`);
                return message.reply("Raid mode is now **OFF**.");
            }

            return message.reply(`Raid mode is **${antiRaid.raidMode ? "ON" : "OFF"}**.`);
        }

        if (command === "allowdomain" || command === "blockdomain" || command === "removedomain") {
            const domain = (args[0] || "").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
            if (!domain) return message.reply("Give a domain.");

            if (command === "allowdomain") {
                allowedDomains.add(domain);
                blockedDomains.delete(domain);
                saveDataSoon();
                return message.reply(`Allowed domain: **${domain}**`);
            }

            if (command === "blockdomain") {
                blockedDomains.add(domain);
                allowedDomains.delete(domain);
                saveDataSoon();
                return message.reply(`Blocked domain: **${domain}**`);
            }

            allowedDomains.delete(domain);
            blockedDomains.delete(domain);
            saveDataSoon();
            return message.reply(`Removed domain from both lists: **${domain}**`);
        }

        if (command === "domains") {
            return message.reply([
                "**Allowed Domains**",
                [...allowedDomains].slice(0, 30).join(", ") || "None",
                "",
                "**Blocked Domains**",
                [...blockedDomains].slice(0, 40).join(", ") || "None"
            ].join("\n"));
        }

        if (command === "recentjoins") {
            const rows = recentJoins.slice(0, 15).map(join => `<@${join.id}> ${join.tag} | joined <t:${Math.floor(join.joinedAt / 1000)}:R>`);
            return message.reply(rows.length ? `**Recent Joins**\n${rows.join("\n")}` : "No recent joins tracked.");
        }

        if (command === "newaccounts") {
            const now = Date.now();
            const rows = recentJoins
                .filter(join => now - join.createdTimestamp < antiRaid.minimumAccountAgeMs)
                .slice(0, 15)
                .map(join => `<@${join.id}> ${join.tag} | created <t:${Math.floor(join.createdTimestamp / 1000)}:R>`);

            return message.reply(rows.length ? `**Recent New Accounts**\n${rows.join("\n")}` : "No new accounts tracked recently.");
        }

        if (command === "setquarantine") {
            const role = findRole(message.guild, args.join(" ").trim());
            if (!role) return message.reply("Role not found.");

            quarantineRoleId = role.id;
            saveDataSoon();
            return message.reply(`Quarantine role set to **${role.name}**.`);
        }

        if (command === "quarantine") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");
            if (isProtected(message.member, member)) return message.reply("You can't quarantine that person.");

            const reason = getReason(args, 1);
            const ok = await applyQuarantine(member, reason);

            if (!ok) return message.reply("Could not quarantine. Set the quarantine role and make sure my bot role is above it.");

            await logAction(message.guild, `${message.author.tag} quarantined ${member.user.tag}: ${reason}`);
            return message.reply(`${member.user.tag} was quarantined.`);
        }

        if (command === "unquarantine") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");

            const ok = await removeQuarantine(member);

            if (!ok) return message.reply("Could not remove quarantine role.");

            await logAction(message.guild, `${message.author.tag} removed quarantine from ${member.user.tag}.`);
            return message.reply(`${member.user.tag} was unquarantined.`);
        }

        if (command === "warn") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");
            if (isProtected(message.member, member)) return message.reply("You can't warn that person.");

            const reason = getReason(args, 1);
            const warnings = warningStore.get(member.id) || [];

            warnings.push({ moderator: message.author.tag, reason, time: Date.now() });
            warningStore.set(member.id, warnings);
            addModStat(message.author.id, "warns");

            await member.send(`You were warned in **${message.guild.name}**. Reason: ${reason}`).catch(() => {});
            await logAction(message.guild, `${message.author.tag} warned ${member.user.tag}: ${reason}`);
            saveDataSoon();

            return message.channel.send(`${member.user.tag} was warned. Reason: ${reason}`);
        }

        if (command === "warnings") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");

            const warnings = warningStore.get(member.id) || [];
            if (!warnings.length) return message.reply(`${member.user.tag} has no warnings.`);

            return message.reply([
                `**Warnings for ${member.user.tag}**`,
                ...warnings.map((warning, index) => `${index + 1}. ${warning.reason} | by ${warning.moderator}`)
            ].join("\n"));
        }

        if (command === "clearwarnings") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");

            warningStore.delete(member.id);
            saveDataSoon();

            await logAction(message.guild, `${message.author.tag} cleared warnings for ${member.user.tag}.`);
            return message.channel.send(`Cleared warnings for ${member.user.tag}.`);
        }

        if (command === "timeout") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");
            if (isProtected(message.member, member)) return message.reply("You can't timeout that person.");
            const durationText = args[1];
            const duration = parseDuration(durationText);
            if (!duration) return message.reply("Use a valid duration like `10m`, `1h`, `1d`, or `1w`.");

            const reason = getReason(args, 2);
            await member.timeout(duration, reason);
            addModStat(message.author.id, "timeouts");
            await logAction(message.guild, `${message.author.tag} timed out ${member.user.tag} for ${durationText}: ${reason}`);

            return message.channel.send(`${member.user.tag} was timed out for ${durationText}. Reason: ${reason}`);
        }

        if (command === "untimeout") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");

            await member.timeout(null);
            return message.channel.send(`${member.user.tag} is no longer timed out.`);
        }

        if (command === "kick") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");
            if (!member.kickable) return message.reply("I can't kick that user.");
            if (isProtected(message.member, member)) return message.reply("You can't kick that person.");

            const reason = getReason(args, 1);
            await member.kick(reason);
            addModStat(message.author.id, "kicks");
            await logAction(message.guild, `${message.author.tag} kicked ${member.user.tag}: ${reason}`);

            return message.channel.send(`${member.user.tag} was kicked. Reason: ${reason}`);
        }

        if (command === "ban" || command === "tempban" || command === "softban") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            const rawId = args[0]?.replace(/[<@!>]/g, "");

            if (!member && !rawId) return message.reply("Mention someone or give their Discord ID.");

            if (member && isProtected(message.member, member)) return message.reply("You can't ban that person.");
            if (member && !member.bannable) return message.reply("I can't ban that user.");

            if (command === "tempban") {
                const durationText = args[1];
                const duration = parseDuration(durationText);
                if (!duration) return message.reply("Use a valid duration like `10m`, `1h`, `1d`, or `1w`.");

                const reason = getReason(args, 2);
                const userId = member ? member.id : rawId;
                const label = member ? member.user.tag : userId;

                await message.guild.members.ban(userId, { reason });
                setTimeout(() => message.guild.members.unban(userId).catch(() => {}), duration);

                addModStat(message.author.id, "bans");
                await logAction(message.guild, `${message.author.tag} tempbanned ${label} for ${durationText}: ${reason}`);
                return message.channel.send(`${label} was tempbanned for ${durationText}. Reason: ${reason}`);
            }

            const reason = getReason(args, 1);
            const userId = member ? member.id : rawId;
            const label = member ? member.user.tag : userId;

            if (command === "softban") {
                await message.guild.members.ban(userId, { deleteMessageSeconds: 60 * 60 * 24, reason });
                await message.guild.members.unban(userId);
                await logAction(message.guild, `${message.author.tag} softbanned ${label}: ${reason}`);
                return message.channel.send(`${label} was softbanned. Reason: ${reason}`);
            }

            await message.guild.members.ban(userId, { reason });
            addModStat(message.author.id, "bans");
            await logAction(message.guild, `${message.author.tag} banned ${label}: ${reason}`);
            return message.channel.send(`${label} was banned. Reason: ${reason}`);
        }

        if (command === "unban") {
            const userId = args[0];
            if (!userId) return message.reply("Provide a user ID to unban.");

            await message.guild.members.unban(userId);
            return message.channel.send(`User ID ${userId} was unbanned.`);
        }

        if (command === "purge" || command === "clear" || command === "masspurge") {
            const amount = Number(args[0]);
            if (!amount || amount < 1 || amount > 100) return message.reply("Enter a number from 1 to 100.");

            await message.channel.bulkDelete(amount, true);
            const sent = await message.channel.send(`Deleted ${amount} messages.`);
            setTimeout(() => sent.delete().catch(() => {}), 3000);
            return;
        }

        if (command === "slowmode") {
            const seconds = Number(args[0]);
            if (Number.isNaN(seconds) || seconds < 0 || seconds > 21600) return message.reply("Enter seconds from 0 to 21600.");

            await message.channel.setRateLimitPerUser(seconds);
            return message.channel.send(`Slowmode set to ${seconds} second(s).`);
        }

        if (command === "slowmodeall") {
            const seconds = Number(args[0]);
            if (Number.isNaN(seconds) || seconds < 0 || seconds > 21600) return message.reply("Enter seconds from 0 to 21600.");

            const channels = message.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);
            for (const [, channel] of channels) await channel.setRateLimitPerUser(seconds).catch(() => {});
            return message.channel.send(`Slowmode set to ${seconds}s in all text channels.`);
        }

        if (command === "lock" || command === "unlock" || command === "hide" || command === "unhide") {
            const overwrite = {};

            if (command === "lock") overwrite.SendMessages = false;
            if (command === "unlock") overwrite.SendMessages = null;
            if (command === "hide") overwrite.ViewChannel = false;
            if (command === "unhide") overwrite.ViewChannel = null;

            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, overwrite);
            return message.channel.send(`Channel ${command} ran.`);
        }

        if (command === "lockdown" || command === "lockall" || command === "unlockdown" || command === "unlockall") {
            const locking = command === "lockdown" || command === "lockall";
            const channels = message.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);

            for (const [, channel] of channels) {
                await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: locking ? false : null }).catch(() => {});
            }

            return message.channel.send(locking ? "All text channels locked." : "All text channels unlocked.");
        }

        if (command === "nuke") {
            const oldChannel = message.channel;
            const clone = await oldChannel.clone({ reason: `Nuked by ${message.author.tag}` });
            await clone.setPosition(oldChannel.position);
            await oldChannel.delete(`Nuked by ${message.author.tag}`);
            return clone.send("Channel nuked.");
        }

        if (command === "clonechannel") {
            const clone = await message.channel.clone({ reason: `Cloned by ${message.author.tag}` });
            return message.reply(`Cloned channel: ${clone}`);
        }

        if (command === "say") {
            const text = args.join(" ").trim();
            if (!text) return message.reply("Say what?");
            await message.delete().catch(() => {});
            return message.channel.send(text);
        }

        if (command === "embed") {
            const text = args.join(" ").trim();
            if (!text) return message.reply("Write embed text.");
            return message.channel.send({ embeds: [makeEmbed("Palmor", text, 0x23beff)] });
        }

        if (command === "poll") {
            const parts = args.join(" ").split("|").map(part => part.trim()).filter(Boolean);
            if (parts.length < 3) return message.reply("Use: `!poll question | option 1 | option 2`");

            const question = parts.shift();
            const options = parts.slice(0, 10);
            const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

            const pollMessage = await message.channel.send({
                embeds: [makeEmbed("Poll", [`**${question}**`, "", ...options.map((option, index) => `${emojis[index]} ${option}`)].join("\n"), 0xffc644)]
            });

            for (let i = 0; i < options.length; i++) await pollMessage.react(emojis[i]).catch(() => {});
            return;
        }

        if (command === "announce" || command === "serverannounce") {
            const text = args.join(" ").trim();
            if (!text) return message.reply("Write an announcement.");

            return message.channel.send({ content: "@everyone", embeds: [makeEmbed("Announcement", text, 0xffc644)] });
        }

        if (command === "staffannounce") {
            const text = args.join(" ").trim();
            if (!text) return message.reply("Write a staff announcement.");
            await logAction(message.guild, `**Staff Announcement from ${message.author.tag}**\n${text}`);
            return message.reply("Staff announcement sent to logs.");
        }

        if (command === "dm") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");
            const text = args.slice(1).join(" ").trim();
            if (!text) return message.reply("Write a DM message.");

            await member.send(`**Message from ${message.guild.name} staff:**\n${text}`);
            return message.reply("DM sent.");
        }

        if (command === "sayin") {
            const channelId = args[0];
            const text = args.slice(1).join(" ").trim();
            const channel = message.guild.channels.cache.get(channelId);

            if (!channel || !channel.isTextBased()) return message.reply("Channel not found.");
            if (!text) return message.reply("Write a message.");

            await channel.send(text);
            return message.reply("Message sent.");
        }

        if (command === "topic") {
            const topic = args.join(" ").trim();
            if (!topic) return message.reply("Write a topic.");
            await message.channel.setTopic(topic);
            return message.channel.send("Channel topic updated.");
        }

        if (command === "renamechannel") {
            const newName = args.join("-").trim();
            if (!newName) return message.reply("Give the channel a new name.");
            await message.channel.setName(newName);
            return message.channel.send(`Channel renamed to **${newName}**.`);
        }

        if (command === "createchannel") {
            const name = args.join("-").trim();
            if (!name) return message.reply("Give the channel a name.");

            const channel = await message.guild.channels.create({ name, type: ChannelType.GuildText, reason: `Created by ${message.author.tag}` });
            return message.channel.send(`Created channel ${channel}.`);
        }

        if (command === "deletechannel") {
            await message.channel.delete(`Deleted by ${message.author.tag}`);
            return;
        }

        if (command === "nick" || command === "nickname" || command === "resetnick") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member) return message.reply("Mention someone or give their Discord ID.");
            if (!member.manageable) return message.reply("I can't change that nickname.");
            if (isProtected(message.member, member)) return message.reply("You can't change that person's nickname.");

            if (command === "resetnick") {
                await member.setNickname(null);
                return message.channel.send(`${member.user.tag}'s nickname was reset.`);
            }

            const newNick = args.slice(1).join(" ").trim();
            if (!newNick) return message.reply("Provide a new nickname.");
            await member.setNickname(newNick);
            return message.channel.send(`${member.user.tag} is now **${newNick}**.`);
        }

        if (command === "addrole" || command === "rank" || command === "forcerank" || command === "removerole" || command === "unrank" || command === "forceremoverole") {
            const data = await getTargetAndRole(message, args);
            if (data.error) return message.reply(data.error);

            const { member, role } = data;
            const force = command === "forcerank" || command === "forceremoverole";
            const removing = command === "removerole" || command === "unrank" || command === "forceremoverole";

            if (!force && isProtected(message.member, member)) return message.reply(removing ? "You can't unrank that person." : "You can't rank that person.");
            if (!canManageRole(message, role, force)) return message.reply("You cannot manage that role, or it is above my bot role.");

            if (removing) {
                await member.roles.remove(role);
                await logAction(message.guild, `${message.author.tag} removed ${role.name} from ${member.user.tag}.`);
                return message.channel.send(`Removed **${role.name}** from ${member.user.tag}.`);
            }

            await member.roles.add(role);
            await logAction(message.guild, `${message.author.tag} added ${role.name} to ${member.user.tag}.`);
            return message.channel.send(`Added **${role.name}** to ${member.user.tag}.`);
        }

        if (command === "temprole") {
            const data = await getTargetAndRole(message, args);
            if (data.error) return message.reply(data.error);

            const durationText = args[args.length - 1];
            const duration = parseDuration(durationText);
            if (!duration) return message.reply("Add a duration at the end, like `10m`, `1h`, or `1d`.");

            const { member, role } = data;
            if (isProtected(message.member, member)) return message.reply("You can't temp-role that person.");
            if (!canManageRole(message, role, false)) return message.reply("You cannot manage that role, or it is above my bot role.");

            await member.roles.add(role);
            setTimeout(() => member.roles.remove(role).catch(() => {}), duration);
            return message.channel.send(`Added **${role.name}** to ${member.user.tag} for **${durationText}**.`);
        }

        if (command === "roleinfo") {
            const role = findRole(message.guild, args.join(" ").trim());
            if (!role) return message.reply("Role not found.");

            return message.reply([
                `**Role Info: ${role.name}**`,
                `ID: ${role.id}`,
                `Color: ${role.hexColor}`,
                `Members: ${role.members.size}`,
                `Position: ${role.position}`,
                `Mentionable: ${role.mentionable ? "Yes" : "No"}`,
                `Configured Staff Level: ${getRoleLevelByName(role.name)}`
            ].join("\n"));
        }

        if (command === "rolelist" || command === "roles") {
            const roles = message.guild.roles.cache
                .filter(role => role.name !== "@everyone")
                .sort((a, b) => b.position - a.position)
                .map(role => `${role.name} - level ${getRoleLevelByName(role.name)}`);

            return message.reply(`**Roles**\n${roles.slice(0, 60).join("\n")}`);
        }

        if (command === "staffroles") {
            const roles = message.guild.roles.cache
                .filter(role => getRoleLevelByName(role.name) > 0)
                .sort((a, b) => getRoleLevelByName(b.name) - getRoleLevelByName(a.name))
                .map(role => `${role.name} - level ${getRoleLevelByName(role.name)}`);

            return message.reply(roles.length ? `**Configured Staff Roles**\n${roles.join("\n")}` : "No configured staff roles found.");
        }

        if (command === "rolemembercount" || command === "rolemembers" || command === "whohas") {
            const role = findRole(message.guild, args.join(" ").trim());
            if (!role) return message.reply("Role not found.");

            if (command === "rolemembercount") return message.reply(`**${role.name}** has **${role.members.size}** members.`);

            const members = role.members.map(member => member.user.tag);
            return message.reply(members.length ? `**Members with ${role.name}**\n${members.slice(0, 50).join("\n")}` : `Nobody has **${role.name}**.`);
        }

        if (command === "roleall" || command === "giveroleall" || command === "massrole" || command === "removeroleall" || command === "takeallrole" || command === "massunrole") {
            const role = findRole(message.guild, args.join(" ").trim());
            if (!role) return message.reply("Role not found.");
            if (!canManageRole(message, role, true)) return message.reply("You cannot manage that role, or it is above my bot role.");

            const removing = command === "removeroleall" || command === "takeallrole" || command === "massunrole";
            await message.guild.members.fetch();

            let count = 0;

            for (const [, member] of message.guild.members.cache) {
                if (member.user.bot) continue;

                if (removing && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role).catch(() => {});
                    count++;
                } else if (!removing && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role).catch(() => {});
                    count++;
                }
            }

            return message.channel.send(`${removing ? "Removed" : "Added"} **${role.name}** ${removing ? "from" : "to"} ${count} members.`);
        }

        if (command === "createrole") {
            const roleName = args.join(" ").trim();
            if (!roleName) return message.reply("Give the role a name.");
            const role = await message.guild.roles.create({ name: roleName, reason: `Created by ${message.author.tag}` });
            return message.channel.send(`Created role **${role.name}**.`);
        }

        if (command === "deleterole") {
            const role = findRole(message.guild, args.join(" ").trim());
            if (!role) return message.reply("Role not found.");
            if (!canManageRole(message, role, false)) return message.reply("You cannot manage that role, or it is above my bot role.");
            await role.delete(`Deleted by ${message.author.tag}`);
            return message.channel.send(`Deleted role **${role.name}**.`);
        }

        if (command === "setrolelevel") {
            const level = Number(args[args.length - 1]);
            const roleName = args.slice(0, -1).join(" ").trim();

            if (!roleName || Number.isNaN(level)) return message.reply(`Use: \`${PREFIX}setrolelevel RoleName Number\``);

            customRoleLevels.set(normalizeName(roleName), level);
            saveDataSoon();
            return message.channel.send(`Set **${roleName}** to staff level **${level}**.`);
        }

        if (command === "reloadlevels") {
            normalizedStaffLevels = buildNormalizedRoleMap(STAFF_ROLE_LEVELS);
            customRoleLevels.clear();
            saveDataSoon();
            return message.reply("Role levels reloaded and temporary custom levels cleared.");
        }

        if (command === "modstats") {
            const rows = [...modStats.entries()].slice(0, 20).map(([userId, stats]) => {
                return `<@${userId}> warns:${stats.warns || 0} timeouts:${stats.timeouts || 0} kicks:${stats.kicks || 0} bans:${stats.bans || 0}`;
            });

            return message.reply(rows.length ? `**Moderator Stats**\n${rows.join("\n")}` : "No moderation stats yet.");
        }

        if (command === "mute" || command === "unmute" || command === "deafen" || command === "undeafen" || command === "disconnectvc") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            if (!member || !member.voice.channel) return message.reply("That user is not in voice.");

            if (command === "mute") await member.voice.setMute(true);
            if (command === "unmute") await member.voice.setMute(false);
            if (command === "deafen") await member.voice.setDeaf(true);
            if (command === "undeafen") await member.voice.setDeaf(false);
            if (command === "disconnectvc") await member.voice.disconnect();

            return message.channel.send(`${command} ran on ${member.user.tag}.`);
        }

        if (command === "movevc") {
            const member = getMentionedMember(message) || await findMember(message, args[0]);
            const channelId = args[1];

            if (!member) return message.reply("Mention someone or give their Discord ID.");
            if (!channelId) return message.reply("Give a voice channel ID.");

            const voiceChannel = message.guild.channels.cache.get(channelId);
            if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) return message.reply("That is not a valid voice channel ID.");

            await member.voice.setChannel(voiceChannel);
            return message.channel.send(`Moved ${member.user.tag} to **${voiceChannel.name}**.`);
        }

        if (command === "shutdownmsg") {
            const text = args.join(" ").trim();
            if (!text) return message.reply("Write a shutdown message.");

            await message.channel.send(`**Server Staff Notice**\n${text}`);
            saveDataNow();
            process.exit(0);
        }

        return message.reply(`Unknown command. Use \`${PREFIX}help\`.`);
    } catch (error) {
        console.error(error);
        return message.reply("Something went wrong running that command.");
    }
});

const palmorApplicationSessions = new Map();

const PALMOR_APPLICATION_TYPES = {
    staff: {
        label: "Staff Application",
        shortLabel: "Staff",
        color: 0x2f7dff,
        channels: ["staff-applications", "staff-application", "applications", "application-review"],
        tracks: ["Trial Staff", "Helper", "Moderator", "Senior Moderator", "Admin", "Head Admin", "Staff Manager", "Community Support"]
    },
    qa: {
        label: "QA Application",
        shortLabel: "QA",
        color: 0x35e66b,
        channels: ["qa-application", "qa-applications", "qa-apps", "applications"],
        tracks: ["QA Tester", "QA Staff", "QA Lead", "QA Manager", "QA Admin", "Bug Reviewer", "Vehicle QA", "Gameplay QA"]
    },
    dev: {
        label: "Developer Application",
        shortLabel: "Developer",
        color: 0x8a3ffc,
        channels: ["dev-application", "dev-applications", "developer-applications", "applications"],
        tracks: ["Scripter", "Builder", "UI Designer", "Vehicle Developer", "Systems Developer", "Map Developer", "Economy Developer", "Optimization Developer", "Full Stack Developer"]
    },
    moderation: {
        label: "Moderation Application",
        shortLabel: "Moderation",
        color: 0xffc644,
        channels: ["staff-applications", "moderation-applications", "applications"],
        tracks: ["Trial Moderator", "Chat Moderator", "Game Moderator", "Discord Moderator", "Senior Moderator", "Appeal Reviewer"]
    },
    management: {
        label: "Management Application",
        shortLabel: "Management",
        color: 0xffc644,
        channels: ["staff-applications", "management-applications", "applications"],
        tracks: ["Community Manager", "Staff Manager", "QA Manager", "Development Manager", "Event Manager", "Operations Manager"]
    },
    support: {
        label: "Support Team Application",
        shortLabel: "Support",
        color: 0x2f7dff,
        channels: ["staff-applications", "support-applications", "applications"],
        tracks: ["Support Agent", "Ticket Support", "Bug Support", "Player Support", "Purchase Support", "New Player Support"]
    },
    events: {
        label: "Event Team Application",
        shortLabel: "Events",
        color: 0xffa51f,
        channels: ["staff-applications", "event-applications", "applications"],
        tracks: ["Event Host", "Event Planner", "Event Moderator", "Tournament Host", "Community Events"]
    },
    partnership: {
        label: "Partnership Application",
        shortLabel: "Partnership",
        color: 0x8a3ffc,
        channels: ["staff-applications", "partnership-applications", "applications"],
        tracks: ["Partnership Manager", "Partnership Staff", "Outreach Team", "Affiliate Contact"]
    },
    creator: {
        label: "Content Creator Application",
        shortLabel: "Creator",
        color: 0xff4d6d,
        channels: ["creator-applications", "media-applications", "applications"],
        tracks: ["YouTuber", "TikToker", "Streamer", "Media Partner", "Trailer Editor", "Shorts Creator"]
    },
    vehicle: {
        label: "Vehicle Team Application",
        shortLabel: "Vehicle",
        color: 0x00c2ff,
        channels: ["dev-application", "vehicle-applications", "applications"],
        tracks: ["Vehicle Modeler", "Vehicle Handling Tuner", "Livery Designer", "Emergency Vehicle Specialist", "Vehicle QA"]
    },
    design: {
        label: "Design Team Application",
        shortLabel: "Design",
        color: 0xff4dcb,
        channels: ["dev-application", "design-applications", "applications"],
        tracks: ["UI Designer", "Graphics Designer", "Icon Designer", "Branding Designer", "Thumbnail Designer"]
    },
    helper: {
        label: "Community Helper Application",
        shortLabel: "Helper",
        color: 0x35e66b,
        channels: ["staff-applications", "helper-applications", "applications"],
        tracks: ["New Player Helper", "Guide Writer", "Community Assistant", "Discord Helper"]
    }
};

const PALMOR_APPLICATION_QUESTIONS = [
    "Discord tag and Roblox username?",
    "Timezone and usual availability?",
    "What position are you applying for and why?",
    "What experience do you have for this role?",
    "What are your biggest strengths?",
    "What weakness are you improving?",
    "How would you handle a rude community member?",
    "How would you handle staff/team disagreement?",
    "What if a friend broke the rules?",
    "How active can you be weekly?",
    "What ideas would you bring to Palmor?",
    "Anything else staff should know?"
];

function buildApplicationPanelEmbed(selectedType = null) {
    const selected = selectedType ? PALMOR_APPLICATION_TYPES[selectedType] : null;

    const list = Object.entries(PALMOR_APPLICATION_TYPES).map(([id, type]) => {
        const selectedText = selectedType === id ? " - SELECTED" : "";
        return `**${type.label}**${selectedText}\n> Tracks: ${type.tracks.slice(0, 5).join(", ")}${type.tracks.length > 5 ? ", more..." : ""}`;
    }).join("\n\n");

    return new EmbedBuilder()
        .setAuthor({ name: "Palmor Applications" })
        .setTitle(selected ? selected.label : "Apply for the Palmor Team")
        .setDescription([
            "Choose an application type below, then pick the exact track you want.",
            "",
            "Applications are reviewed by staff. Answer clearly, honestly, and with detail.",
            "",
            "**Available Applications**",
            list,
            "",
            "Your answers are private until submitted."
        ].join("\n"))
        .setColor(selected ? selected.color : 0x35e66b)
        .setImage(PANEL_GIFS.support)
        .setFooter({ text: "Palmor Applications - Select a type to begin" })
        .setTimestamp();
}

function buildApplicationPanelRows(selectedType = null) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId("palmor_application_type")
        .setPlaceholder("Choose an application type...")
        .addOptions(Object.entries(PALMOR_APPLICATION_TYPES).map(([id, type]) => ({
            label: type.shortLabel,
            value: id,
            description: type.label.slice(0, 100),
            default: selectedType === id
        })));

    return [new ActionRowBuilder().addComponents(menu)];
}

function buildApplicationTrackRows(typeId) {
    const type = PALMOR_APPLICATION_TYPES[typeId] || PALMOR_APPLICATION_TYPES.staff;

    const menu = new StringSelectMenuBuilder()
        .setCustomId(`palmor_application_track:${typeId}`)
        .setPlaceholder(`Choose your ${type.shortLabel} track...`)
        .addOptions(type.tracks.slice(0, 25).map(track => ({
            label: track,
            value: track.slice(0, 100),
            description: `Apply for ${track}`.slice(0, 100)
        })));

    return [new ActionRowBuilder().addComponents(menu)];
}

function buildPalmorApplicationModal(session, page) {
    const start = page * 5;
    const questions = PALMOR_APPLICATION_QUESTIONS.slice(start, start + 5);

    const modal = new ModalBuilder()
        .setCustomId(`palmor_application_modal:${session.id}:${page}`)
        .setTitle(`${session.type.shortLabel} App ${page + 1}/3`.slice(0, 45));

    for (let i = 0; i < questions.length; i++) {
        const questionIndex = start + i;

        const input = new TextInputBuilder()
            .setCustomId(`q${questionIndex}`)
            .setLabel(`Q${questionIndex + 1}: ${questions[i]}`.slice(0, 45))
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(950)
            .setPlaceholder("Write a clear answer.");

        modal.addComponents(new ActionRowBuilder().addComponents(input));
    }

    return modal;
}

function findPalmorApplicationChannel(guild, type) {
    const hints = [...(type.channels || []), "applications", "application-review", "app-review"].map(normalizeName);

    return guild.channels.cache.find(channel => {
        if (!channel.isTextBased || !channel.isTextBased()) return false;
        return hints.includes(normalizeName(channel.name));
    }) || null;
}

function buildPalmorApplicationReviewButtons(applicantId, disabled = false) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`palmor_app_review:accept:${applicantId}`)
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`palmor_app_review:interview:${applicantId}`)
                .setLabel("Interview")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`palmor_app_review:deny:${applicantId}`)
                .setLabel("Deny")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId(`palmor_app_review:archive:${applicantId}`)
                .setLabel("Archive")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        )
    ];
}

async function sendApplicationPanel(message) {
    await message.channel.send({
        embeds: [buildApplicationPanelEmbed()],
        components: buildApplicationPanelRows()
    });

    return message.reply("Application panel created.");
}

client.on("interactionCreate", async (interaction) => {
    try {
        if (interaction.isStringSelectMenu() && interaction.customId === "palmor_application_type") {
            const typeId = interaction.values[0];
            const type = PALMOR_APPLICATION_TYPES[typeId] || PALMOR_APPLICATION_TYPES.staff;

            await interaction.message.edit({
                embeds: [buildApplicationPanelEmbed(typeId)],
                components: buildApplicationPanelRows(typeId)
            }).catch(() => {});

            await interaction.reply({
                content: `You selected **${type.label}**. Now choose the exact track.`,
                components: buildApplicationTrackRows(typeId),
                ephemeral: true
            });
            return;
        }

        if (interaction.isStringSelectMenu() && interaction.customId.startsWith("palmor_application_track:")) {
            const typeId = interaction.customId.split(":")[1];
            const type = PALMOR_APPLICATION_TYPES[typeId] || PALMOR_APPLICATION_TYPES.staff;
            const track = interaction.values[0];
            const sessionId = `${Date.now()}_${interaction.user.id}_${Math.random().toString(36).slice(2, 8)}`;

            const session = {
                id: sessionId,
                userId: interaction.user.id,
                typeId,
                type,
                track,
                page: 0,
                answers: []
            };

            palmorApplicationSessions.set(sessionId, session);
            await interaction.showModal(buildPalmorApplicationModal(session, 0));
            return;
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith("palmor_application_modal:")) {
            const parts = interaction.customId.split(":");
            const sessionId = parts[1];
            const page = Number(parts[2]) || 0;
            const session = palmorApplicationSessions.get(sessionId);

            if (!session || session.userId !== interaction.user.id) {
                await interaction.reply({ content: "That application session expired. Please start again.", ephemeral: true });
                return;
            }

            const start = page * 5;
            const questions = PALMOR_APPLICATION_QUESTIONS.slice(start, start + 5);

            for (let i = 0; i < questions.length; i++) {
                session.answers[start + i] = interaction.fields.getTextInputValue(`q${start + i}`);
            }

            session.page = page + 1;

            if (session.page < Math.ceil(PALMOR_APPLICATION_QUESTIONS.length / 5)) {
                await interaction.reply({
                    content: `Saved page ${page + 1}/3. Continue when ready.`,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`palmor_application_continue:${session.id}`)
                                .setLabel(`Continue to Page ${session.page + 1}`)
                                .setStyle(ButtonStyle.Primary)
                        )
                    ],
                    ephemeral: true
                });
                return;
            }

            const reviewChannel = findPalmorApplicationChannel(interaction.guild, session.type) || interaction.channel;

            const answerText = PALMOR_APPLICATION_QUESTIONS.map((question, index) => {
                return `**${index + 1}. ${question}**\n${session.answers[index] || "No answer."}`;
            });

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Palmor Application" })
                .setTitle(session.type.label)
                .setDescription([
                    `**Applicant:** ${interaction.user} (${interaction.user.tag})`,
                    `**User ID:** ${interaction.user.id}`,
                    `**Track:** ${session.track}`,
                    `**Status:** Pending Review`
                ].join("\n"))
                .setColor(session.type.color)
                .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
                .setFooter({ text: `Applicant ID: ${interaction.user.id} - Pending` })
                .setTimestamp();

            let chunk = "";
            let section = 1;

            for (const line of answerText) {
                if ((chunk + "\n\n" + line).length > 950) {
                    embed.addFields({ name: `Answers ${section}`, value: chunk });
                    section++;
                    chunk = line;
                } else {
                    chunk = chunk ? `${chunk}\n\n${line}` : line;
                }
            }

            if (chunk) {
                embed.addFields({ name: `Answers ${section}`, value: chunk });
            }

            await reviewChannel.send({
                content: `New ${session.type.label} from ${interaction.user}`,
                embeds: [embed],
                components: buildPalmorApplicationReviewButtons(interaction.user.id)
            });

            palmorApplicationSessions.delete(session.id);

            await interaction.reply({
                content: `Application submitted. Staff will review it in ${reviewChannel}.`,
                ephemeral: true
            });
            return;
        }

        if (interaction.isButton() && interaction.customId.startsWith("palmor_application_continue:")) {
            const sessionId = interaction.customId.split(":")[1];
            const session = palmorApplicationSessions.get(sessionId);

            if (!session || session.userId !== interaction.user.id) {
                await interaction.reply({ content: "That application session expired. Please start again.", ephemeral: true });
                return;
            }

            await interaction.showModal(buildPalmorApplicationModal(session, session.page));
            return;
        }

        if (interaction.isButton() && interaction.customId.startsWith("palmor_app_review:")) {
            if (getStaffLevel(interaction.member) < 600) {
                await interaction.reply({ content: "Only Server Management level or higher can review applications.", ephemeral: true });
                return;
            }

            const [, action, applicantId] = interaction.customId.split(":");

            const labels = {
                accept: "Accepted",
                deny: "Denied",
                interview: "Interview Requested",
                archive: "Archived"
            };

            const colors = {
                accept: 0x35e66b,
                deny: 0xff4d6d,
                interview: 0x2f7dff,
                archive: 0x8b95a7
            };

            const embed = EmbedBuilder.from(interaction.message.embeds[0])
                .setColor(colors[action] || 0x35e66b)
                .setFooter({ text: `Applicant ID: ${applicantId} - ${labels[action] || action} by ${interaction.user.tag}` })
                .setTimestamp();

            embed.addFields({
                name: "Review Update",
                value: [
                    `**Status:** ${labels[action] || action}`,
                    `**Reviewed By:** ${interaction.user}`,
                    `**Reviewed At:** <t:${Math.floor(Date.now() / 1000)}:F>`
                ].join("\n")
            });

            const disabled = action === "archive" || action === "accept" || action === "deny";

            await interaction.message.edit({
                embeds: [embed],
                components: buildPalmorApplicationReviewButtons(applicantId, disabled)
            });

            await interaction.reply({
                content: `Application marked as **${labels[action] || action}**.`,
                ephemeral: true
            });
        }
    } catch (error) {
        console.error(error);

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: "Something went wrong with the application system." }).catch(() => {});
        } else {
            await interaction.reply({ content: "Something went wrong with the application system.", ephemeral: true }).catch(() => {});
        }
    }
});

process.on("SIGINT", () => {
    saveDataNow();
    process.exit(0);
});

process.on("SIGTERM", () => {
    saveDataNow();
    process.exit(0);
});

client.login(TOKEN);
