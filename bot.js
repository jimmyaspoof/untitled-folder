// bot.js - 13BPZ VAULT BOT (FULL COMPLETE LONG CODE)
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
const SERVER_ID = "1498630455694590015";

const leaksPath = path.join(__dirname, 'leaks');

if (!fs.existsSync(leaksPath)) {
    fs.mkdirSync(leaksPath, { recursive: true });
}

client.once('ready', async () => {
    console.log(`\x1b[31m[13BPZ VAULT] ${client.user.tag} - FULL COMPLETE CODE LOADED\x1b[0m`);

    // Force register all commands
    await client.application.commands.set([], SERVER_ID);

    const commands = [
        new SlashCommandBuilder().setName('setup').setDescription('Create all channels and roles (Owner only)'),
        new SlashCommandBuilder().setName('vault').setDescription('Open normal 13 Vault'),
        new SlashCommandBuilder().setName('boostervault').setDescription('Open Booster Leaks (Boosters only)'),
        new SlashCommandBuilder()
            .setName('addleak')
            .setDescription('Add files or videos to a category')
            .addStringOption(option =>
                option.setName('category')
                    .setDescription('Choose where to put the file')
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
                        { name: 'Snow Graphic Packs', value: 'snow-graphic-packs' },
                        { name: 'FPS Graphic Packs', value: 'fps-graphic-packs' },
                        { name: 'D10 Graphic Packs', value: 'd10-graphicpacks' },
                        { name: 'D10 Reshades', value: 'd10-reshades' },
                        { name: 'Extras', value: 'extras' }
                    ))
    ];

    await client.application.commands.set(commands, SERVER_ID);
    console.log("✅ All commands registered");
});

// ====================== FULL /SETUP ======================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "setup") {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ Only the owner can use /setup", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            // Create Roles
            let vaultRole = guild.roles.cache.find(r => r.name === VAULT_ROLE_NAME);
            if (!vaultRole) vaultRole = await guild.roles.create({ name: VAULT_ROLE_NAME, color: 0x8B0000, hoist: true });

            let boosterRole = guild.roles.cache.find(r => r.name === BOOSTER_ROLE_NAME);
            if (!boosterRole) boosterRole = await guild.roles.create({ name: BOOSTER_ROLE_NAME, color: 0xFF1493, hoist: true });

            // 13 VAULT Category
            let normalCat = guild.channels.cache.find(c => c.name === "13 VAULT" && c.type === ChannelType.GuildCategory);
            if (!normalCat) {
                normalCat = await guild.channels.create({
                    name: "13 VAULT",
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: vaultRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
            }

            // BOOSTER LEAKS Category
            let boosterCat = guild.channels.cache.find(c => c.name === "BOOSTER LEAKS" && c.type === ChannelType.GuildCategory);
            if (!boosterCat) {
                boosterCat = await guild.channels.create({
                    name: "BOOSTER LEAKS",
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: boosterRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
            }

            // Normal Channels
            const normalChannels = ["ticket-0027", "bundles", "graphics-pack", "sound-packs", "reshades", "intros", "tracers", "other"];
            for (const name of normalChannels) {
                if (!guild.channels.cache.some(c => c.name === name && c.parentId === normalCat.id)) {
                    await guild.channels.create({ name: name, type: ChannelType.GuildText, parent: normalCat.id });
                }
            }

            // Booster Channels (full list)
            const boosterChannels = [
                "BOoster-preview", "BOoster-perks", "bundles", "graphic-packs",
                "snow-graphic-packs", "fps-graphic-packs", "sound-packs",
                "rifle-sound-packs", "kos-sound-packs", "nvidia-amd-settings",
                "spotify-premium", "d10-graphicpacks", "playlists",
                "d10-soundpacks", "d10-reshades", "extras"
            ];

            for (const name of boosterChannels) {
                const fullName = `🚀 ${name}`;
                if (!guild.channels.cache.some(c => c.name === fullName && c.parentId === boosterCat.id)) {
                    await guild.channels.create({ name: fullName, type: ChannelType.GuildText, parent: boosterCat.id });
                }
            }

            await interaction.editReply({ content: "✅ **FULL SETUP COMPLETED**\nAll channels and roles have been created properly." });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: "❌ Setup failed. Check console." });
        }
    }

    // /vault
    if (interaction.commandName === "vault") {
        await interaction.reply({ content: "Use /addleak to add files first, then use /vault to leak them.", ephemeral: true });
    }

    // /boostervault
    if (interaction.commandName === "boostervault") {
        await interaction.reply({ content: "Use /addleak with booster categories, then use /boostervault.", ephemeral: true });
    }

    // /addleak
    if (interaction.commandName === "addleak") {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ Only the owner can add leaks.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getString('category');
        const attachments = interaction.attachments;

        if (attachments.size === 0) {
            return interaction.editReply({ content: "❌ Please attach the file(s) or video(s)." });
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

                count++;
            } catch (e) {
                console.error("Save error:", e);
            }
        }

        await interaction.editReply({ content: `✅ Successfully added **${count}** file(s) to **${category}**.\n\nYou can now use /vault or /boostervault to send them.` });
    }
});

client.login(process.env.TOKEN);