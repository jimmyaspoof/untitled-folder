// bot.js - 13BPZ VAULT BOT with /addleak
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    PermissionsBitField,
    ChannelType,
    SlashCommandBuilder,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
});

const VAULT_ROLE_NAME = "13 Vault";
const CATEGORY_NAME = "13 VAULT";
const OWNER_ID = "1382370095963312201";
const SERVER_ID = "1498630455694590015";

const leaksPath = path.join(__dirname, "leaks");

const categories = [
    "bundles",
    "graphics-pack",
    "rz-soundpacks",
    "rp-soundpacks",
    "tracers",
    "rz-reshade",
    "rp-reshade",
    "roads",
    "intros",
    "intro-temps",
    "other",
];

categories.forEach((cat) => {
    const dir = path.join(leaksPath, cat);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

client.once("ready", async () => {
    console.log(`[13BPZ VAULT] ${client.user.tag} is online`);

    const commands = [
        new SlashCommandBuilder()
            .setName("setup")
            .setDescription("Setup 13 Vault channels and role"),

        new SlashCommandBuilder()
            .setName("vault")
            .setDescription("Open the 13 Vault menu"),

        new SlashCommandBuilder()
            .setName("addleak")
            .setDescription("Add a file/video to a vault category")
            .addStringOption((option) =>
                option
                    .setName("category")
                    .setDescription("Choose category")
                    .setRequired(true)
                    .addChoices(
                        { name: "Bundles", value: "bundles" },
                        { name: "Graphics Pack", value: "graphics-pack" },
                        { name: "RZ Soundpacks", value: "rz-soundpacks" },
                        { name: "RP Soundpacks", value: "rp-soundpacks" },
                        { name: "Tracers", value: "tracers" },
                        { name: "RZ Reshade", value: "rz-reshade" },
                        { name: "RP Reshade", value: "rp-reshade" },
                        { name: "Roads", value: "roads" },
                        { name: "Intros", value: "intros" },
                        { name: "Intro Temps", value: "intro-temps" },
                        { name: "Other", value: "other" }
                    )
            )
            .addAttachmentOption((option) =>
                option.setName("file1").setDescription("Main file").setRequired(true)
            )
            .addAttachmentOption((option) =>
                option.setName("file2").setDescription("Optional file/video")
            )
            .addAttachmentOption((option) =>
                option.setName("file3").setDescription("Optional file/video")
            )
            .addAttachmentOption((option) =>
                option.setName("file4").setDescription("Optional file/video")
            )
            .addAttachmentOption((option) =>
                option.setName("file5").setDescription("Optional file/video")
            ),
    ];

    await client.application.commands.set(commands, SERVER_ID);
    console.log("✅ Slash commands registered");
});

client.on("guildMemberAdd", async (member) => {
    const role = member.guild.roles.cache.find((r) => r.name === VAULT_ROLE_NAME);
    if (role) await member.roles.add(role).catch(() => { });
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "setup") {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: "❌ Only owner can use this.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        let vaultRole = guild.roles.cache.find((r) => r.name === VAULT_ROLE_NAME);
        if (!vaultRole) {
            vaultRole = await guild.roles.create({
                name: VAULT_ROLE_NAME,
                color: 0x8b0000,
                hoist: true,
            });
        }

        let category = guild.channels.cache.find(
            (c) => c.name === CATEGORY_NAME && c.type === ChannelType.GuildCategory
        );

        if (!category) {
            category = await guild.channels.create({
                name: CATEGORY_NAME,
                type: ChannelType.GuildCategory,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    {
                        id: vaultRole.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                        ],
                    },
                ],
            });
        }

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
            { name: "other", emoji: "🔗" },
        ];

        for (const ch of channelsToCreate) {
            const fullName = `${ch.emoji} ${ch.name}`;
            const exists = guild.channels.cache.some(
                (c) => c.name === fullName && c.parentId === category.id
            );

            if (!exists) {
                await guild.channels.create({
                    name: fullName,
                    type: ChannelType.GuildText,
                    parent: category.id,
                });
            }
        }

        return interaction.editReply("✅ Setup complete. Channels + role created.");
    }

    if (interaction.commandName === "vault") {
        const hasRole = interaction.member.roles.cache.some(
            (r) => r.name === VAULT_ROLE_NAME
        );

        if (!hasRole) {
            return interaction.reply({
                content: "❌ You need the **13 Vault** role.",
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("13 VAULT")
            .setDescription("```Select a category```")
            .setColor(0x000000)
            .setFooter({ text: "13BPZ • VAULT NO LEAKING • " });

        const select = new StringSelectMenuBuilder()
            .setCustomId("vault_select")
            .setPlaceholder("Choose category...")
            .addOptions(
                { label: "Bundles", value: "bundles", emoji: "📦" },
                { label: "Graphics Pack", value: "graphics-pack", emoji: "🖼️" },
                { label: "RZ Soundpacks", value: "rz-soundpacks", emoji: "🔊" },
                { label: "RP Soundpacks", value: "rp-soundpacks", emoji: "🎵" },
                { label: "Tracers", value: "tracers", emoji: "🔫" },
                { label: "RZ Reshade", value: "rz-reshade", emoji: "🌫️" },
                { label: "RP Reshade", value: "rp-reshade", emoji: "🎨" },
                { label: "Roads", value: "roads", emoji: "🛣️" },
                { label: "Intros", value: "intros", emoji: "🎬" },
                { label: "Intro Temps", value: "intro-temps", emoji: "🎥" },
                { label: "Other", value: "other", emoji: "🔗" }
            );

        return interaction.reply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(select)],
        });
    }

    if (interaction.commandName === "addleak") {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({
                content: "❌ Only owner can add files.",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const category = interaction.options.getString("category");
        const folderPath = path.join(leaksPath, category);

        const files = ["file1", "file2", "file3", "file4", "file5"]
            .map((name) => interaction.options.getAttachment(name))
            .filter(Boolean);

        let savedCount = 0;

        for (const file of files) {
            const safeName = file.name.replace(/[<>:"/\\|?*]/g, "_");
            const savePath = path.join(folderPath, safeName);

            const response = await fetch(file.url);
            const buffer = Buffer.from(await response.arrayBuffer());

            fs.writeFileSync(savePath, buffer);
            savedCount++;
        }

        const embed = new EmbedBuilder()
            .setTitle("✅ File Added")
            .setDescription(`**Category:** ${category}\n**Saved:** ${savedCount} file(s)`)
            .setColor(0x8b0000)
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "vault_select") return;

    const category = interaction.values[0];
    const folderPath = path.join(leaksPath, category);

    if (!fs.existsSync(folderPath)) {
        return interaction.reply({
            content: `❌ Folder \`leaks/${category}\` not found.`,
            ephemeral: true,
        });
    }

    const files = fs.readdirSync(folderPath).filter((f) => !f.startsWith("."));

    if (files.length === 0) {
        return interaction.reply({
            content: `❌ No files in \`leaks/${category}\`.`,
            ephemeral: true,
        });
    }

    const attachments = files.map((f) => ({
        attachment: path.join(folderPath, f),
        name: f,
    }));

    const embed = new EmbedBuilder()
        .setTitle(`13 ${category.toUpperCase()}`)
        .setDescription(`Sending **${files.length}** file(s).`)
        .setColor(0x8b0000)
        .setTimestamp();

    return interaction.reply({
        embeds: [embed],
        files: attachments,
    });
});

client.login(process.env.TOKEN);