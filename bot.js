// bot.js - 13BPZ VAULT BOT (FULL SAFE VERSION - For Railway)
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionsBitField, ChannelType, SlashCommandBuilder } = require('discord.js');
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
const CATEGORY_NAME = "13 VAULT";
const OWNER_ID = "1382370095963312201";

const leaksPath = path.join(__dirname, 'leaks');

// ====================== READY ======================
client.once('ready', () => {
    console.log(`\x1b[31m[13BPZ VAULT] ${client.user.tag} IS NOW LEAKING 24/7\x1b[0m`);
});

// Auto give "13 Vault" role to new members
client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.find(r => r.name === VAULT_ROLE_NAME);
        if (role) await member.roles.add(role);
    } catch (e) {}
});

// ====================== INTERACTIONS ======================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // ====================== /SETUP ======================
    if (interaction.commandName === "setup") {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ Only the owner can use /setup", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;

            // Create 13 Vault Role
            let vaultRole = guild.roles.cache.find(r => r.name === VAULT_ROLE_NAME);
            if (!vaultRole) {
                vaultRole = await guild.roles.create({
                    name: VAULT_ROLE_NAME,
                    color: 0x8B0000,
                    hoist: true,
                    permissions: []
                });
            }

            // Create 13 VAULT Category
            let category = guild.channels.cache.find(c => c.name === CATEGORY_NAME && c.type === ChannelType.GuildCategory);
            if (!category) {
                category = await guild.channels.create({
                    name: CATEGORY_NAME,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                        { id: vaultRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                    ]
                });
            }

            // Create channels exactly like your screenshot
            const channelsToCreate = [
                { name: "vault-psa", emoji: "📢" },
                { name: "bundles", emoji: "📦" },
                { name: "graphics-pack", emoji: "🖼️" },
                { name: "rz-soundpacks", emoji: "🔊" },
                { name: "rp-soundpacks", emoji: "🎵" },
                { name: "tracers", emoji: "🔫" },
                { name: "rz-reshade", emoji: "🌫️" },
                { name: "rp-reshade", emoji: "🎨" },
                { name: "roads", emoji: "🛣️" },
                { name: "intros", emoji: "🎬" },
                { name: "intro-temps", emoji: "🎥" },
                { name: "other", emoji: "🔗" }
            ];

            for (const ch of channelsToCreate) {
                const fullName = `${ch.emoji} ${ch.name}`;
                const exists = guild.channels.cache.some(c => c.name === fullName && c.parentId === category.id);
                if (!exists) {
                    await guild.channels.create({
                        name: fullName,
                        type: ChannelType.GuildText,
                        parent: category.id
                    });
                }
            }

            await interaction.editReply({ content: "✅ **13 VAULT** setup completed!\nRole + Category + All channels created with emojis." });
            console.log(`Setup completed in ${guild.name}`);
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: "❌ Error during setup. Check console." });
        }
    }

    // ====================== /VAULT ======================
    if (interaction.commandName === "vault") {
        const hasRole = interaction.member.roles.cache.some(r => r.name === VAULT_ROLE_NAME);
        if (!hasRole) {
            return interaction.reply({ content: "❌ You need the **13 Vault** role to access the vault.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("13 VAULT")
            .setDescription("```Select a category to leak```")
            .setColor(0x000000)
            .setFooter({ text: "13BPZ • NO SNITCHING • SYDNEY" });

        const select = new StringSelectMenuBuilder()
            .setCustomId("vault_select")
            .setPlaceholder("Choose leak category...")
            .addOptions([
                { label: "Bundles", value: "bundles", emoji: "📦" },
                { label: "Graphics Pack", value: "graphics-pack", emoji: "🖼️" },
                { label: "RZ Soundpacks", value: "rz-soundpacks", emoji: "🔊" },
                { label: "RP Soundpacks", value: "rp-soundpacks", emoji: "🎵" },
                { label: "Tracers", value: "tracers", emoji: "🔫" },
                { label: "RZ Reshade", value: "rz-reshade", emoji: "🌫️" },
                { label: "RP Reshade", value: "rp-reshade", emoji: "🎨" },
                { label: "Intros", value: "intros", emoji: "🎬" },
                { label: "Intro Temps", value: "intro-temps", emoji: "🎥" },
                { label: "Other", value: "other", emoji: "🔗" },
            ]);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ embeds: [embed], components: [row] });
    }
});

// ====================== DYNAMIC DROPDOWN - SEND FILES ======================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== "vault_select") return;

    const category = interaction.values[0];
    const folderPath = path.join(leaksPath, category);

    if (!fs.existsSync(folderPath)) {
        return interaction.reply({ content: `❌ Folder \`leaks/${category}\` not found.`, ephemeral: true });
    }

    const files = fs.readdirSync(folderPath).filter(f => !f.startsWith('.'));

    if (files.length === 0) {
        return interaction.reply({ content: `❌ No files found in leaks/${category}`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle(`13 ${category.toUpperCase()} LEAK`)
        .setColor(0x8B0000)
        .setDescription(`Sending **${files.length}** file(s)...`)
        .setTimestamp();

    const attachments = files.map(file => ({
        attachment: path.join(folderPath, file),
        name: file
    }));

    await interaction.reply({ embeds: [embed], files: attachments });
});

// ====================== REGISTER COMMANDS ======================
client.once('ready', async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('setup')
            .setDescription('Setup 13 Vault channels and role (Owner only)'),
        new SlashCommandBuilder()
            .setName('vault')
            .setDescription('Open the 13 Vault leak menu')
    ];

    await client.application.commands.set(commands);
    console.log("✅ Slash commands registered.");
});

client.login(process.env.TOKEN);