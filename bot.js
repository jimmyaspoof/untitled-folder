// bot.js - 13BPZ VAULT BOT (FULL LONG VERSION - FIXED)
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const VAULT_ROLE_NAME = "13 Vault";
const BOOSTER_ROLE_NAME = "Vault Booster";
const OWNER_ID = "1382370095963312201";
const SERVER_ID = "1499315292889677876";

const leaksPath = path.join(__dirname, 'leaks');
const db = new sqlite3.Database(path.join(__dirname, 'vault.db'));

// Database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE,
        category TEXT,
        filepath TEXT,
        uploaded_by TEXT,
        upload_date TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS downloads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER,
        user_id TEXT,
        username TEXT,
        download_date TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(file_id) REFERENCES files(id)
    )`);
});

if (!fs.existsSync(leaksPath)) fs.mkdirSync(leaksPath, { recursive: true });

client.once('ready', async () => {
    console.log(`\x1b[31m[13BPZ VAULT] ${client.user.tag} - FULL FIXED VERSION LOADED\x1b[0m`);

    await client.application.commands.set([], SERVER_ID);

    const commands = [
        new SlashCommandBuilder().setName('setup').setDescription('Full setup - creates all channels and roles (Owner only)'),
        new SlashCommandBuilder().setName('vault').setDescription('Open normal 13 Vault'),
        new SlashCommandBuilder().setName('boostervault').setDescription('Open Booster Leaks (Boosters only)'),
        new SlashCommandBuilder()
            .setName('addleak')
            .setDescription('Add new leaks (files + videos)')
            .addStringOption(option =>
                option.setName('category')
                    .setDescription('Choose category')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Bundles', value: 'bundles' },
                        { name: 'Graphics Pack', value: 'graphics-pack' },
                        { name: 'Sound Packs', value: 'sound-packs' },
                        { name: 'Reshades', value: 'reshades' },
                        { name: 'Intros', value: 'intros' },
                        { name: 'Tracers', value: 'tracers' },
                        { name: 'Other', value: 'other' },
                        { name: 'Booster Preview', value: 'booster-preview' },
                        { name: 'Graphic Packs', value: 'graphic-packs' },
                        { name: 'D10 Reshades', value: 'd10-reshades' },
                        { name: 'Extras', value: 'extras' }
                    ))
    ];

    await client.application.commands.set(commands, SERVER_ID);
    console.log("✅ Commands registered");
});

// Auto Roles
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const role = newMember.guild.roles.cache.find(r => r.name === BOOSTER_ROLE_NAME);
        if (role) await newMember.roles.add(role);
    }
});

client.on('guildMemberAdd', async (member) => {
    const role = member.guild.roles.cache.find(r => r.name === VAULT_ROLE_NAME);
    if (role) await member.roles.add(role);
});

// ====================== /SETUP - FULL CHANNEL CREATION ======================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "setup") {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: "❌ Owner only", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            let vaultRole = guild.roles.cache.find(r => r.name === VAULT_ROLE_NAME);
            if (!vaultRole) vaultRole = await guild.roles.create({ name: VAULT_ROLE_NAME, color: 0x8B0000, hoist: true });

            let boosterRole = guild.roles.cache.find(r => r.name === BOOSTER_ROLE_NAME);
            if (!boosterRole) boosterRole = await guild.roles.create({ name: BOOSTER_ROLE_NAME, color: 0xFF1493, hoist: true });

            // Normal Category
            let normalCat = guild.channels.cache.find(c => c.name === "13 VAULT" && c.type === ChannelType.GuildCategory);
            if (!normalCat) {
                normalCat = await guild.channels.create({
                    name: "13 VAULT",
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: vaultRole.id, allow: [PermissionsBitField.Flags.ViewChannel] }]
                });
            }

            // Booster Category
            let boosterCat = guild.channels.cache.find(c => c.name === "BOOSTER LEAKS" && c.type === ChannelType.GuildCategory);
            if (!boosterCat) {
                boosterCat = await guild.channels.create({
                    name: "BOOSTER LEAKS",
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, { id: boosterRole.id, allow: [PermissionsBitField.Flags.ViewChannel] }]
                });
            }

            // Normal Channels
            const normalCh = ["ticket-0027", "bundles", "graphics-pack", "sound-packs", "reshades", "intros", "tracers", "other"];
            for (const name of normalCh) {
                if (!guild.channels.cache.some(c => c.name === name && c.parentId === normalCat.id)) {
                    await guild.channels.create({ name, type: ChannelType.GuildText, parent: normalCat.id });
                }
            }

            // Booster Channels
            const boosterCh = [
                "BOoster-preview", "BOoster-perks", "bundles", "graphic-packs", "snow-graphic-packs",
                "fps-graphic-packs", "sound-packs", "rifle-sound-packs", "kos-sound-packs",
                "nvidia-amd-settings", "spotify-premium", "d10-graphicpacks", "playlists",
                "d10-soundpacks", "d10-reshades", "extras"
            ];

            for (const name of boosterCh) {
                const fullName = `🚀 ${name}`;
                if (!guild.channels.cache.some(c => c.name === fullName && c.parentId === boosterCat.id)) {
                    await guild.channels.create({ name: fullName, type: ChannelType.GuildText, parent: boosterCat.id });
                }
            }

            await interaction.editReply({ content: "✅ **FULL SETUP COMPLETED**\nAll channels and roles created." });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: "❌ Setup failed." });
        }
    }

    // /vault
    if (interaction.commandName === "vault") {
        const hasRole = interaction.member.roles.cache.some(r => r.name === VAULT_ROLE_NAME);
        if (!hasRole) return interaction.reply({ content: "❌ You need the **13 Vault** role.", ephemeral: true });

        db.all("SELECT DISTINCT category FROM files ORDER BY category", async (err, rows) => {
            if (!rows || rows.length === 0) {
                return interaction.reply({ content: "No leaks yet. Use /addleak to add files.", ephemeral: true });
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId("normal_vault")
                .setPlaceholder("Select category to leak...")
                .addOptions(rows.map(r => ({ label: r.category.replace(/-/g, " ").toUpperCase(), value: r.category })));

            await interaction.reply({
                embeds: [new EmbedBuilder().setTitle("13 VAULT").setColor(0x000000)],
                components: [new ActionRowBuilder().addComponents(select)]
            });
        });
    }

    // /boostervault
    if (interaction.commandName === "boostervault") {
        const isBooster = interaction.member.roles.cache.some(r => r.name === BOOSTER_ROLE_NAME);
        if (!isBooster) return interaction.reply({ content: "❌ Booster only", ephemeral: true });

        db.all("SELECT DISTINCT category FROM files ORDER BY category", async (err, rows) => {
            if (!rows || rows.length === 0) {
                return interaction.reply({ content: "No booster leaks yet.", ephemeral: true });
            }

            const select = new StringSelectMenuBuilder()
                .setCustomId("booster_vault")
                .setPlaceholder("Select booster category...")
                .addOptions(rows.map(r => ({ label: r.category.replace(/-/g, " ").toUpperCase(), value: r.category, emoji: "🚀" })));

            await interaction.reply({
                embeds: [new EmbedBuilder().setTitle("BOOSTER LEAKS").setColor(0xFF1493)],
                components: [new ActionRowBuilder().addComponents(select)]
            });
        });
    }

    // /addleak - Fixed version
    if (interaction.commandName === "addleak") {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: "❌ Owner only", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getString('category');
        const attachments = interaction.attachments;

        if (attachments.size === 0) {
            return interaction.editReply({ content: "❌ Please attach files or videos." });
        }

        const catPath = path.join(leaksPath, category);
        if (!fs.existsSync(catPath)) fs.mkdirSync(catPath, { recursive: true });

        let count = 0;

        for (const att of attachments.values()) {
            try {
                const safeName = `${Date.now()}-${att.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                const filePath = path.join(catPath, safeName);

                const response = await fetch(att.url);
                const buffer = await response.arrayBuffer();
                fs.writeFileSync(filePath, Buffer.from(buffer));

                db.run(`INSERT OR IGNORE INTO files (filename, category, filepath, uploaded_by) VALUES (?, ?, ?, ?)`,
                    [safeName, category, filePath, interaction.user.id]);

                count++;
            } catch (e) {
                console.error(e);
            }
        }

        await interaction.editReply({ content: `✅ Added **${count}** file(s) to **${category}**` });
    }
});

// Dropdown Handler - Fixed
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    await interaction.deferReply();

    const category = interaction.values[0];
    const folderPath = path.join(leaksPath, category);

    if (!fs.existsSync(folderPath)) {
        return interaction.editReply({ content: "❌ Category not found." });
    }

    const files = fs.readdirSync(folderPath).filter(f => !f.startsWith('.'));

    if (files.length === 0) {
        return interaction.editReply({ content: "❌ No files in this category yet." });
    }

    const isBooster = interaction.customId === "booster_vault";

    const embed = new EmbedBuilder()
        .setTitle(isBooster ? `🚀 BOOSTER ${category.toUpperCase()}` : `13 ${category.toUpperCase()}`)
        .setColor(isBooster ? 0xFF1493 : 0x8B0000)
        .setDescription(`Sending **${files.length}** file(s)...`);

    try {
        await interaction.editReply({
            embeds: [embed],
            files: files.map(f => path.join(folderPath, f))
        });

        // Track downloads
        db.all(`SELECT id FROM files WHERE category = ?`, [category], (err, rows) => {
            if (rows) {
                rows.forEach(row => {
                    db.run(`INSERT INTO downloads (file_id, user_id, username) VALUES (?, ?, ?)`,
                        [row.id, interaction.user.id, interaction.user.tag]);
                });
            }
        });
    } catch (err) {
        console.error(err);
        await interaction.editReply({ content: "❌ Error sending files." });
    }
});

client.login(process.env.TOKEN);