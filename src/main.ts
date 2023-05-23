import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import * as dotenv from 'dotenv'
import axios from 'axios';

dotenv.config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
if (!TOKEN) throw new Error('Token not found!');
if (!CLIENT_ID) throw new Error('Client id not found!');

const rest = new REST({ version: '10' }).setToken(TOKEN);
const commands =
  [
    {
      name: 'player',
      description: 'Replies informations about your Clash of Clans account',
      options: [
        {
          name: 'id',
          type: 3,
          description: 'Your Clash of Clans player ID',
          value: '#',
          required: true,
        },
      ],
    },
  ];

(async () => {
  try {
    // Envoi d'une requête PUT à l'API Discord pour mettre à jour les commandes slash pour l'application de bot Discord
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Bot up!");
  } catch (error) {
    console.error(error);
  }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.addListener('interactionCreate', async interaction => {

  if (!interaction.isCommand()) return;
  const { commandName, options } = interaction;

  switch (commandName) {

    case 'player':
      let playerTag: string;
      let playerId: string;

      // Si l'option id est fournie, utilisez-la comme id de joueur
      if (options.get('id')) {
        playerId = options.get('id').value as string;
        playerTag = `%23${playerId}`;
      } else {
        await interaction.reply('Please provide either a player tag or your own player ID.');
        return;
      }

      const bisou = await axios.get(`https://api.clashofclans.com/v1/players/${playerTag}`, {
        headers: { Authorization: `Bearer ${process.env.API_KEY}` }
      });

      const data = [
        { label: "Tag", value: bisou.data.tag },
        { label: "Pseudo", value: bisou.data.name },
        { label: "Level", value: bisou.data.expLevel },
        { label: "TH", value: bisou.data.townHallLevel },
        { label: "Trophies", value: bisou.data.trophies },
        { label: "Best Trophy Record", value: bisou.data.bestTrophies },
        { label: "League", value: bisou.data.league.name.replace(/\s*League*/g, '') },
        { label: "Best World Ranking", value: (bisou.data.legendStatistics) ? bisou.data.legendStatistics.bestSeason.rank : "N/A" },
      ];

      let message = "";
      for (let i = 0; i < data.length; i++) {
        if (data[i].value !== undefined && data[i].value !== '') {
          message += `${data[i].label}: ${data[i].value}\n`;
        }
      }

      await interaction.reply("```"+message+"```");

      break;
  }
});

client.login(TOKEN);
