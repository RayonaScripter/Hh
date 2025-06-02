import { Client, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export function funBotHandler(client: Client, config: any) {
  const commands = [
    new SlashCommandBuilder()
      .setName('8ball')
      .setDescription('Ask the magic 8-ball a question')
      .addStringOption(option => 
        option.setName('question').setDescription('Your question').setRequired(true)),
    
    new SlashCommandBuilder()
      .setName('roll')
      .setDescription('Roll dice')
      .addIntegerOption(option => 
        option.setName('sides').setDescription('Number of sides (default: 6)')),
    
    new SlashCommandBuilder()
      .setName('coinflip')
      .setDescription('Flip a coin'),
    
    new SlashCommandBuilder()
      .setName('joke')
      .setDescription('Get a random joke'),
    
    new SlashCommandBuilder()
      .setName('fact')
      .setDescription('Get a random fun fact'),
    
    new SlashCommandBuilder()
      .setName('trivia')
      .setDescription('Start a trivia question'),
    
    new SlashCommandBuilder()
      .setName('rps')
      .setDescription('Play Rock Paper Scissors')
      .addStringOption(option => 
        option.setName('choice')
        .setDescription('Your choice')
        .setRequired(true)
        .addChoices(
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' }
        )),
  ];

  const eightBallResponses = [
    "It is certain", "Reply hazy, try again", "Don't count on it",
    "It is decidedly so", "Ask again later", "My reply is no",
    "Without a doubt", "Better not tell you now", "My sources say no",
    "Yes definitely", "Cannot predict now", "Outlook not so good",
    "You may rely on it", "Concentrate and ask again", "Very doubtful",
    "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes"
  ];

  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
    "Why can't a bicycle stand up by itself? It's two tired!",
    "What do you call a sleeping bull? A bulldozer!",
    "How do you organize a space party? You planet!",
    "Why don't programmers like nature? It has too many bugs!"
  ];

  const facts = [
    "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!",
    "A group of flamingos is called a 'flamboyance'.",
    "Octopuses have three hearts and blue blood.",
    "Bananas are berries, but strawberries aren't!",
    "A shrimp's heart is in its head.",
    "Wombat droppings are cube-shaped.",
    "Sea otters hold hands while sleeping to prevent themselves from drifting apart.",
    "A cloud can weigh more than a million pounds!"
  ];

  const triviaQuestions = [
    {
      question: "What is the largest planet in our solar system?",
      options: ["Jupiter", "Saturn", "Neptune", "Earth"],
      correct: 0
    },
    {
      question: "Which element has the chemical symbol 'Au'?",
      options: ["Silver", "Gold", "Aluminum", "Argon"],
      correct: 1
    },
    {
      question: "What year did the Titanic sink?",
      options: ["1910", "1911", "1912", "1913"],
      correct: 2
    },
    {
      question: "Who painted the Mona Lisa?",
      options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct: 2
    }
  ];

  client.once('ready', async () => {
    if (!client.user || !client.application) return;

    try {
      console.log('Registering fun commands...');
      await client.application.commands.set(commands);
      console.log('Fun commands registered!');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options } = interaction;

    try {
      switch (commandName) {
        case '8ball': {
          const question = options.getString('question', true);
          const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];

          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
              { name: 'Question', value: question, inline: false },
              { name: 'Answer', value: response, inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'roll': {
          const sides = options.getInteger('sides') || 6;
          
          if (sides < 2 || sides > 100) {
            return interaction.reply({ content: 'Please choose between 2 and 100 sides!', ephemeral: true });
          }

          const result = Math.floor(Math.random() * sides) + 1;

          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('🎲 Dice Roll')
            .setDescription(`You rolled a **${result}** out of ${sides}!`)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'coinflip': {
          const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
          const emoji = result === 'Heads' ? '🪙' : '🔄';

          const embed = new EmbedBuilder()
            .setColor('#57F287')
            .setTitle(`${emoji} Coin Flip`)
            .setDescription(`The coin landed on **${result}**!`)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'joke': {
          const joke = jokes[Math.floor(Math.random() * jokes.length)];

          const embed = new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('😂 Random Joke')
            .setDescription(joke)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'fact': {
          const fact = facts[Math.floor(Math.random() * facts.length)];

          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🧠 Fun Fact')
            .setDescription(fact)
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'trivia': {
          const question = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
          
          const embed = new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('🧩 Trivia Time!')
            .setDescription(question.question)
            .addFields(
              question.options.map((option, index) => ({
                name: `${['A', 'B', 'C', 'D'][index]}`,
                value: option,
                inline: true
              }))
            )
            .setFooter({ text: 'You have 30 seconds to answer!' })
            .setTimestamp();

          const message = await interaction.reply({ embeds: [embed], fetchReply: true });
          
          // Add reaction options
          const reactions = ['🇦', '🇧', '🇨', '🇩'];
          for (let i = 0; i < question.options.length; i++) {
            await message.react(reactions[i]);
          }

          // Wait for reactions
          const filter = (reaction: any, user: any) => 
            reactions.includes(reaction.emoji.name) && user.id === interaction.user.id;
          
          try {
            const collected = await message.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });
            const reaction = collected.first();
            const answerIndex = reactions.indexOf(reaction!.emoji.name);
            
            const isCorrect = answerIndex === question.correct;
            const resultEmbed = new EmbedBuilder()
              .setColor(isCorrect ? '#57F287' : '#ED4245')
              .setTitle(isCorrect ? '✅ Correct!' : '❌ Wrong!')
              .setDescription(`The correct answer was: **${question.options[question.correct]}**`)
              .setTimestamp();

            await interaction.followUp({ embeds: [resultEmbed] });
          } catch {
            const timeoutEmbed = new EmbedBuilder()
              .setColor('#FEE75C')
              .setTitle('⏰ Time\'s Up!')
              .setDescription(`The correct answer was: **${question.options[question.correct]}**`)
              .setTimestamp();

            await interaction.followUp({ embeds: [timeoutEmbed] });
          }
          break;
        }

        case 'rps': {
          const userChoice = options.getString('choice', true);
          const choices = ['rock', 'paper', 'scissors'];
          const botChoice = choices[Math.floor(Math.random() * choices.length)];
          
          let result = '';
          let color = '#FEE75C'; // tie color
          
          if (userChoice === botChoice) {
            result = "It's a tie!";
          } else if (
            (userChoice === 'rock' && botChoice === 'scissors') ||
            (userChoice === 'paper' && botChoice === 'rock') ||
            (userChoice === 'scissors' && botChoice === 'paper')
          ) {
            result = 'You win!';
            color = '#57F287';
          } else {
            result = 'You lose!';
            color = '#ED4245';
          }

          const emojiMap: Record<string, string> = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
          };

          const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('✂️ Rock Paper Scissors')
            .addFields(
              { name: 'Your Choice', value: `${emojiMap[userChoice]} ${userChoice}`, inline: true },
              { name: 'My Choice', value: `${emojiMap[botChoice]} ${botChoice}`, inline: true },
              { name: 'Result', value: result, inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    } catch (error) {
      console.error('Fun command error:', error);
      const reply = { content: 'An error occurred while executing the command.', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });
}
