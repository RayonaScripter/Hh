import { Client, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export function utilityBotHandler(client: Client, config: any) {
  const commands = [
    new SlashCommandBuilder()
      .setName('serverinfo')
      .setDescription('Display information about the server'),
    
    new SlashCommandBuilder()
      .setName('userinfo')
      .setDescription('Display information about a user')
      .addUserOption(option => 
        option.setName('user').setDescription('User to get info about')),
    
    new SlashCommandBuilder()
      .setName('poll')
      .setDescription('Create a poll')
      .addStringOption(option => 
        option.setName('question').setDescription('Poll question').setRequired(true))
      .addStringOption(option => 
        option.setName('options').setDescription('Poll options separated by commas').setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('remind')
      .setDescription('Set a reminder')
      .addStringOption(option => 
        option.setName('time').setDescription('Time (e.g., 5m, 1h, 2d)').setRequired(true))
      .addStringOption(option => 
        option.setName('message').setDescription('Reminder message').setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('roleassign')
      .setDescription('Assign a role to yourself or another user')
      .addRoleOption(option => 
        option.setName('role').setDescription('Role to assign').setRequired(true))
      .addUserOption(option => 
        option.setName('user').setDescription('User to assign role to')),
  ];

  client.once('ready', async () => {
    if (!client.user || !client.application) return;

    try {
      console.log('Registering utility commands...');
      await client.application.commands.set(commands);
      console.log('Utility commands registered!');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, guild, member } = interaction;

    if (!guild || !member) return;

    try {
      switch (commandName) {
        case 'serverinfo': {
          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📊 ${guild.name} Server Information`)
            .setThumbnail(guild.iconURL())
            .addFields(
              { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
              { name: 'Members', value: guild.memberCount.toString(), inline: true },
              { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
              { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
              { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
              { name: 'Boost Level', value: guild.premiumTier.toString(), inline: true }
            )
            .setFooter({ text: `Server ID: ${guild.id}` })
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'userinfo': {
          const user = options.getUser('user') || interaction.user;
          const guildMember = guild.members.cache.get(user.id);

          if (!guildMember) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`👤 ${user.tag} User Information`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
              { name: 'Username', value: user.tag, inline: true },
              { name: 'ID', value: user.id, inline: true },
              { name: 'Nickname', value: guildMember.nickname || 'None', inline: true },
              { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
              { name: 'Joined Server', value: guildMember.joinedAt ? `<t:${Math.floor(guildMember.joinedTimestamp! / 1000)}:F>` : 'Unknown', inline: true },
              { name: 'Roles', value: guildMember.roles.cache.filter(r => r.id !== guild.id).map(r => r.toString()).join(', ') || 'None', inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'poll': {
          const question = options.getString('question', true);
          const optionsString = options.getString('options', true);
          const pollOptions = optionsString.split(',').map(opt => opt.trim()).slice(0, 10);

          if (pollOptions.length < 2) {
            return interaction.reply({ content: 'Please provide at least 2 options separated by commas.', ephemeral: true });
          }

          const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
          
          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📊 Poll')
            .setDescription(question)
            .addFields(
              pollOptions.map((option, index) => ({
                name: `${emojis[index]} Option ${index + 1}`,
                value: option,
                inline: false
              }))
            )
            .setFooter({ text: `Poll by ${interaction.user.tag}` })
            .setTimestamp();

          const message = await interaction.reply({ embeds: [embed], fetchReply: true });
          
          // Add reactions
          for (let i = 0; i < pollOptions.length; i++) {
            await message.react(emojis[i]);
          }
          break;
        }

        case 'remind': {
          const timeString = options.getString('time', true);
          const message = options.getString('message', true);

          // Simple time parsing (could be enhanced)
          const timeMatch = timeString.match(/^(\d+)([mhd])$/);
          if (!timeMatch) {
            return interaction.reply({ content: 'Invalid time format. Use format like: 5m, 1h, 2d', ephemeral: true });
          }

          const amount = parseInt(timeMatch[1]);
          const unit = timeMatch[2];
          
          let milliseconds = 0;
          switch (unit) {
            case 'm': milliseconds = amount * 60 * 1000; break;
            case 'h': milliseconds = amount * 60 * 60 * 1000; break;
            case 'd': milliseconds = amount * 24 * 60 * 60 * 1000; break;
          }

          if (milliseconds > 7 * 24 * 60 * 60 * 1000) { // 7 days max
            return interaction.reply({ content: 'Reminder cannot be longer than 7 days.', ephemeral: true });
          }

          await interaction.reply(`⏰ Reminder set for ${timeString} from now: "${message}"`);

          setTimeout(async () => {
            try {
              await interaction.followUp(`🔔 **Reminder:** ${message}`);
            } catch (error) {
              console.error('Failed to send reminder:', error);
            }
          }, milliseconds);
          break;
        }

        case 'roleassign': {
          const role = options.getRole('role', true);
          const targetUser = options.getUser('user') || interaction.user;
          const targetMember = guild.members.cache.get(targetUser.id);

          if (!targetMember) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
          }

          // Check permissions
          const memberPermissions = (member as any).permissions;
          if (!memberPermissions.has(PermissionFlagsBits.ManageRoles) && targetUser.id !== interaction.user.id) {
            return interaction.reply({ content: 'You need Manage Roles permission to assign roles to others.', ephemeral: true });
          }

          if (targetMember.roles.cache.has(role.id)) {
            await targetMember.roles.remove(role);
            await interaction.reply(`✅ Removed role ${role.name} from ${targetUser.tag}`);
          } else {
            await targetMember.roles.add(role);
            await interaction.reply(`✅ Added role ${role.name} to ${targetUser.tag}`);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Utility command error:', error);
      const reply = { content: 'An error occurred while executing the command.', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });

  // Welcome messages
  client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome' || ch.name === 'general');
    
    if (welcomeChannel && welcomeChannel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor('#57F287')
        .setTitle('👋 Welcome!')
        .setDescription(`Welcome to **${member.guild.name}**, ${member.user}!`)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: 'Member #', value: member.guild.memberCount.toString(), inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();

      try {
        await welcomeChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Failed to send welcome message:', error);
      }
    }
  });
}
