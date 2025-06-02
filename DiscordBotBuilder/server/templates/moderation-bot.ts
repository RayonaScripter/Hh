import { Client, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export function moderationBotHandler(client: Client, config: any) {
  const prefix = config.prefix || '!';

  // Slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Warn a user')
      .addUserOption(option => 
        option.setName('user').setDescription('User to warn').setRequired(true))
      .addStringOption(option => 
        option.setName('reason').setDescription('Reason for warning')),
    
    new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kick a user')
      .addUserOption(option => 
        option.setName('user').setDescription('User to kick').setRequired(true))
      .addStringOption(option => 
        option.setName('reason').setDescription('Reason for kick')),
    
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Ban a user')
      .addUserOption(option => 
        option.setName('user').setDescription('User to ban').setRequired(true))
      .addStringOption(option => 
        option.setName('reason').setDescription('Reason for ban')),
    
    new SlashCommandBuilder()
      .setName('purge')
      .setDescription('Delete multiple messages')
      .addIntegerOption(option => 
        option.setName('amount').setDescription('Number of messages to delete (1-100)').setRequired(true)),
  ];

  client.once('ready', async () => {
    if (!client.user || !client.application) return;

    try {
      console.log('Registering moderation commands...');
      await client.application.commands.set(commands);
      console.log('Moderation commands registered!');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  });

  // Handle slash commands
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild } = interaction;

    // Check permissions
    if (!member || !guild) return;
    
    const memberPermissions = member.permissions as any;
    
    try {
      switch (commandName) {
        case 'warn': {
          if (!memberPermissions.has(PermissionFlagsBits.ModerateMembers)) {
            return interaction.reply({ content: 'You need Moderate Members permission to use this command.', ephemeral: true });
          }

          const user = options.getUser('user', true);
          const reason = options.getString('reason') || 'No reason provided';

          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('⚠️ User Warned')
            .addFields(
              { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true },
              { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'kick': {
          if (!memberPermissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.reply({ content: 'You need Kick Members permission to use this command.', ephemeral: true });
          }

          const user = options.getUser('user', true);
          const reason = options.getString('reason') || 'No reason provided';
          const targetMember = guild.members.cache.get(user.id);

          if (!targetMember) {
            return interaction.reply({ content: 'User not found in this server.', ephemeral: true });
          }

          if (!targetMember.kickable) {
            return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
          }

          await targetMember.kick(reason);

          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('👢 User Kicked')
            .addFields(
              { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true },
              { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'ban': {
          if (!memberPermissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({ content: 'You need Ban Members permission to use this command.', ephemeral: true });
          }

          const user = options.getUser('user', true);
          const reason = options.getString('reason') || 'No reason provided';
          const targetMember = guild.members.cache.get(user.id);

          if (targetMember && !targetMember.bannable) {
            return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
          }

          await guild.members.ban(user, { reason, deleteMessageDays: 1 });

          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🔨 User Banned')
            .addFields(
              { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
              { name: 'Moderator', value: interaction.user.tag, inline: true },
              { name: 'Reason', value: reason, inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'purge': {
          if (!memberPermissions.has(PermissionFlagsBits.ManageMessages)) {
            return interaction.reply({ content: 'You need Manage Messages permission to use this command.', ephemeral: true });
          }

          const amount = options.getInteger('amount', true);

          if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
          }

          const channel = interaction.channel;
          if (!channel || !channel.isTextBased()) {
            return interaction.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
          }

          await interaction.deferReply({ ephemeral: true });

          const deleted = await channel.bulkDelete(amount, true);

          await interaction.editReply(`Successfully deleted ${deleted.size} messages.`);
          break;
        }
      }
    } catch (error) {
      console.error('Moderation command error:', error);
      const reply = { content: 'An error occurred while executing the command.', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });

  // Handle prefix commands
  client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const member = message.guild.members.cache.get(message.author.id);
    if (!member) return;

    // Check for prefix commands
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift()?.toLowerCase();

      try {
        switch (command) {
          case 'warn': {
            if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
              return message.reply('You need Moderate Members permission to use this command.');
            }

            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';
            
            if (!userMention) {
              return message.reply('Please mention a user to warn. Usage: `!warn @user [reason]`');
            }

            const targetUserId = userMention.replace(/[<@!>]/g, '');
            const targetUser = await client.users.fetch(targetUserId).catch(() => null);
            
            if (!targetUser) {
              return message.reply('User not found.');
            }

            const embed = new EmbedBuilder()
              .setColor('#FEE75C')
              .setTitle('⚠️ User Warned')
              .addFields(
                { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
              )
              .setTimestamp();

            await message.reply({ embeds: [embed] });
            break;
          }

          case 'kick': {
            if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
              return message.reply('You need Kick Members permission to use this command.');
            }

            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';
            
            if (!userMention) {
              return message.reply('Please mention a user to kick. Usage: `!kick @user [reason]`');
            }

            const targetUserId = userMention.replace(/[<@!>]/g, '');
            const targetMember = message.guild.members.cache.get(targetUserId);
            
            if (!targetMember) {
              return message.reply('User not found in this server.');
            }

            if (!targetMember.kickable) {
              return message.reply('I cannot kick this user.');
            }

            await targetMember.kick(reason);

            const embed = new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('👢 User Kicked')
              .addFields(
                { name: 'User', value: `${targetMember.user.tag} (${targetMember.user.id})`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
              )
              .setTimestamp();

            await message.reply({ embeds: [embed] });
            break;
          }

          case 'ban': {
            if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
              return message.reply('You need Ban Members permission to use this command.');
            }

            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';
            
            if (!userMention) {
              return message.reply('Please mention a user to ban. Usage: `!ban @user [reason]`');
            }

            const targetUserId = userMention.replace(/[<@!>]/g, '');
            const targetUser = await client.users.fetch(targetUserId).catch(() => null);
            
            if (!targetUser) {
              return message.reply('User not found.');
            }

            const targetMember = message.guild.members.cache.get(targetUserId);
            if (targetMember && !targetMember.bannable) {
              return message.reply('I cannot ban this user.');
            }

            await message.guild.members.ban(targetUser, { reason, deleteMessageDays: 1 });

            const embed = new EmbedBuilder()
              .setColor('#ED4245')
              .setTitle('🔨 User Banned')
              .addFields(
                { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false }
              )
              .setTimestamp();

            await message.reply({ embeds: [embed] });
            break;
          }

          case 'purge': {
            if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
              return message.reply('You need Manage Messages permission to use this command.');
            }

            const amount = parseInt(args[0]);
            
            if (!amount || amount < 1 || amount > 100) {
              return message.reply('Please provide a number between 1 and 100. Usage: `!purge <amount>`');
            }

            const channel = message.channel;
            if (!channel.isTextBased()) {
              return message.reply('This command can only be used in text channels.');
            }

            const deleted = await channel.bulkDelete(amount + 1, true); // +1 to include the command message

            const replyMessage = await message.channel.send(`Successfully deleted ${deleted.size - 1} messages.`);
            
            // Delete the reply after 5 seconds
            setTimeout(() => {
              replyMessage.delete().catch(() => {});
            }, 5000);
            break;
          }

          case 'help': {
            const embed = new EmbedBuilder()
              .setColor('#5865F2')
              .setTitle('🛡️ Moderation Bot Commands')
              .setDescription('Available moderation commands:')
              .addFields(
                { name: `${prefix}warn @user [reason]`, value: 'Warn a user', inline: false },
                { name: `${prefix}kick @user [reason]`, value: 'Kick a user from the server', inline: false },
                { name: `${prefix}ban @user [reason]`, value: 'Ban a user from the server', inline: false },
                { name: `${prefix}purge <amount>`, value: 'Delete multiple messages (1-100)', inline: false },
                { name: 'Slash Commands', value: 'You can also use `/warn`, `/kick`, `/ban`, `/purge` slash commands', inline: false }
              )
              .setFooter({ text: 'Use slash commands (/) for a better experience!' })
              .setTimestamp();

            await message.reply({ embeds: [embed] });
            break;
          }
        }
      } catch (error) {
        console.error('Prefix command error:', error);
        await message.reply('An error occurred while executing the command.');
      }
    }

    // Auto-moderation for spam
    const userId = message.author.id;
    const now = Date.now();
    const userData = userMessageCounts.get(userId) || { count: 0, lastMessage: 0 };

    // Reset count if last message was more than 10 seconds ago
    if (now - userData.lastMessage > 10000) {
      userData.count = 0;
    }

    userData.count++;
    userData.lastMessage = now;
    userMessageCounts.set(userId, userData);

    // If more than 5 messages in 10 seconds, warn about spam
    if (userData.count > 5) {
      const memberForSpam = message.guild.members.cache.get(userId);
      if (memberForSpam && memberForSpam.moderatable) {
        try {
          await memberForSpam.timeout(60000, 'Auto-moderation: Spam detected');
          
          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('🚨 Auto-Moderation Action')
            .setDescription(`${message.author.tag} has been timed out for 1 minute due to spam detection.`)
            .setTimestamp();

          await message.channel.send({ embeds: [embed] });
        } catch (error) {
          console.error('Auto-moderation error:', error);
        }
      }
      
      // Reset count after action
      userMessageCounts.delete(userId);
    }
  });

  // Store user message counts for spam detection
  const userMessageCounts = new Map<string, { count: number; lastMessage: number }>();
}
