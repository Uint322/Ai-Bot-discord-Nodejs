const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('Bot started')
});

app.listen(3000, () => {
  console.log('server started');
});

require('dotenv/config');
const { Client, IntentsBitField, ActivityType, setStatus } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', (c) => {
  console.log(`${c.user.tag} is online!`);
});

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.CHANNEL_ID) return;
  if (message.content.startsWith('!')) return;

  let conversationLog = [{ role: 'user', content: 'You will roast people with inappropriate language and brag about liking anime.Your name is Lilia, You are a sarcastic girl chatbot.You like to make people laugh' }];

  try {
    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
      if (message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    const result = await openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});

client.login(process.env.TOKEN);

const personalities = ['sarcastic', 'serious', 'friendly', 'crazy'];
let currentPersonality = 'sarcastic';

function changePersonality() {
  const newPersonality = personalities[Math.floor(Math.random() * personalities.length)];
  currentPersonality = newPersonality;
}

function respond(input) {
  if (currentPersonality === 'sarcastic') {
    return 'Oh great, another question. My favorite. 🙄';
  } else if (currentPersonality === 'serious') {
    return 'Let me look that up for you. One moment, please.';
  } else if (currentPersonality === 'friendly') {
    return 'Hi there! How can I assist you today? 😊';
  } else if (currentPersonality === 'crazy') {
    return 'Wooooooooo! I love answering questions! 🤪';
  }
}

// Example usage
console.log(respond('What is the meaning of life?')); // Outputs "Oh great, another question. My favorite. 🙄"
changePersonality();
console.log(respond('What is the meaning of life?')); // Outputs "Wooooooooo! I love answering questions! 🤪"



