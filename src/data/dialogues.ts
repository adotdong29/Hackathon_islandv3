import { Dialogue } from '../types/GameTypes';

// Intro sequence dialogues
export const introDialogues: Dialogue[] = [
  {
    text: "Welcome to Hackathon Island! Your road to being a fullstack developer starts now. Coding developers from all around the world come here to participate in the 1980s Decades Hackathon, where we see who is the ultimate developer of the decade (aka the 1980s).",
    speaker: "Captain",
  },
  {
    text: "I'll be leaving you here at the shore. Follow the path to meet Bill up there who will help you out. Competition begins soon, and you must rest up your energy.",
    speaker: "Captain",
  },
  {
    text: "Hello! I am Bill Gates, the founder of Microsoft Corporation. This week I am hosting the 1980s Decades Hackathon.",
    speaker: "TechGuru",
  },
  {
    text: "The island is divided into six regions, each representing a different aspect of '80s technology. Your mission is to complete all the mini-games and become a developer master!",
    speaker: "TechGuru",
  },
  {
    text: "Use the arrow keys to navigate. Click on other people to talk to them and learn more about each region.",
    speaker: "TechGuru",
  },
  {
    text: "Your journey begins now! Explore the island and embrace technology!",
    speaker: "TechGuru",
  },
  {
    text: "Who knows, I may even make you the manager of my new Microsoft Digital department!",
    speaker: "TechGuru",
  },
];

// NPC dialogues for each region
export const npcDialogues: Record<string, Dialogue[]> = {
  hardwareZone: [
    {
      text: "Welcome to the Hardware Zone! I am William Lowe, an executive at IBM. You probably haven't heard of me, but I am known as the father of the IBM PC, having pitched and brought out the idea.",
      speaker: "Hardware Hank",
    },
    {
      text: "Match the parts to the PC and finish it in record time! Good luck and you have Tech-tastic times ahead! HA HA HA",
      speaker: "Hardware Hank",
    },
    {
      text: "HAHAHA",
      speaker: "Hardware Hank",
    }, // <<<< FIXED: Added missing comma here
    {
      text: "Ha...ha...ha",
      speaker: "Hardware Hank",
    },
  ],
  softwareValley: [
    {
      text: "...",
      speaker: "Software Sam",
    },
    {
      text: "...ugh I hate my life... oh hey didn't see you there. So I guess I'll make this short and sweet. I'm Paul Allen who co-founded Microsoft with that Gates kid back there, and was a key figure in the development of software and bringing software to the world.",
      speaker: "Software Sam",
    },
    {
      text: "Now go on and debug this thing, don't disappoint me...",
      speaker: "Software Sam",
    },
    {
      text: "GATES WHERE IS MY COFFEE YOU LITTLE SON OF A GUN",
      speaker: "Software Sam", // Added speaker
    },
  ],
  arcadeCove: [
    {
      text: "Welcome to Arcade Cove! I am Noah Bushnell, the co-founder of Atari Incorporated, and the creator of the revolutionary Pong!",
      speaker: "Arcade Annie",
    },
    {
      text: "Your challenge is a rhythm-based game inspired by '80s arcade classics. Let's see those reflexes!",
      speaker: "Arcade Annie",
    },
  ],
  consoleIsland: [
    {
      text: "Hey there, this is the Console Island. I am John Logie Baird.",
      speaker: "Console Carl",
    },
    {
      text: "Your challenge is to identify console games from their screenshots. Think you know your gaming history?",
      speaker: "Console Carl",
    },
  ],
  mobileBay: [
    {
      text: "Welcome to Mobile Bay! The '80s had 'mobile' phones too - though they were the size of bricks! Remember the Motorola DynaTAC?",
      speaker: "Mobile Molly",
    },
    {
      text: "Your challenge is to guess the weight of various '80s mobile phones. They were pretty hefty back then!",
      speaker: "Mobile Molly",
    },
  ],
  internetPoint: [
    {
      text: "Welcome to Internet Point! The '80s saw the early foundations of what would become the internet with ARPANET and early networking protocols.",
      speaker: "Internet Irene",
    },
    {
      text: "Your challenge is a quiz about early internet and networking concepts. Ready to test your knowledge?",
      speaker: "Internet Irene",
    },
  ],
};

// Completion dialogues
export const completionDialogues: Dialogue[] = [
  {
    text: "Congratulations! You've completed all the mini-games and mastered '80s technology!",
    speaker: "TechGuru",
  },
  {
    text: "The knowledge and skills from this era laid the foundation for all the technology we have today.",
    speaker: "TechGuru",
  },
  {
    text: "From personal computers to early mobile phones, from classic video games to the beginnings of the internet - you've experienced it all!",
    speaker: "TechGuru",
  },
  {
    text: "Feel free to explore the island again and replay any mini-games you enjoyed. The '80s tech spirit will always be here!",
    speaker: "TechGuru",
  },
];
