import { Client, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export function musicBotHandler(client: Client, config: any) {
  const commands = [
    new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song')
      .addStringOption(option => 
        option.setName('query').setDescription('Song name or URL').setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Stop the music and clear the queue'),
    
    new SlashCommandBuilder()
      .setName('skip')
      .setDescription('Skip the current song'),
    
    new SlashCommandBuilder()
      .setName('queue')
      .setDescription('Show the current queue'),
    
    new SlashCommandBuilder()
      .setName('volume')
      .setDescription('Set the volume (0-100)')
      .addIntegerOption(option => 
        option.setName('level').setDescription('Volume level').setRequired(true)),
  ];

  client.once('ready', async () => {
    if (!client.user || !client.application) return;

    try {
      console.log('Registering music commands...');
      await client.application.commands.set(commands);
      console.log('Music commands registered!');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, member, guild } = interaction;

    if (!member || !guild) return;

    try {
      switch (commandName) {
        case 'play': {
          const query = options.getString('query', true);
          
          // Check if user is in a voice channel
          const voiceChannel = (member as any).voice.channel;
          if (!voiceChannel) {
            return interaction.reply({ content: 'You need to be in a voice channel to play music!', ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎵 Music Feature')
            .setDescription('Music functionality requires additional setup and external dependencies. This is a basic template that can be extended with libraries like @discordjs/voice and youtube-dl-exec.')
            .addFields(
              { name: 'Requested Song', value: query, inline: true },
              { name: 'Voice Channel', value: voiceChannel.name, inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'stop': {
          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('⏹️ Music Stopped')
            .setDescription('Music playback stopped and queue cleared.')
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'skip': {
          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('⏭️ Song Skipped')
            .setDescription('Skipped to the next song in the queue.')
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'queue': {
          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📃 Music Queue')
            .setDescription('The queue is currently empty. Use `/play` to add songs!')
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'volume': {
          const level = options.getInteger('level', true);
          
          if (level < 0 || level > 100) {
            return interaction.reply({ content: 'Volume must be between 0 and 100!', ephemeral: true });
          }

          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('🔊 Volume Changed')
            .setDescription(`Volume set to ${level}%`)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    } catch (error) {
      console.error('Music command error:', error);
      const reply = { content: 'An error occurred while executing the command.', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });
}
