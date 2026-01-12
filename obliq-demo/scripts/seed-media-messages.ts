/**
 * OBLIQ Demo - Media Seeding Script
 *
 * This script adds media messages to existing conversation JSON files.
 * Run after generate-media.py to have placeholder images.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = join(__dirname, '../data');
const CONVERSATIONS_DIR = join(DATA_DIR, 'conversations');

interface ConversationMessage {
  sender: string;
  content: string;
  offset_days: number;
  offset_hours: number;
  offset_minutes: number;
  type?: string;
  media_url?: string;
  media_caption?: string;
  call_duration?: number;
  call_type?: string;
}

interface Conversation {
  chat_id: string;
  is_group?: boolean;
  messages: ConversationMessage[];
}

// Media messages to add per chat
const MEDIA_ADDITIONS: Record<string, ConversationMessage[]> = {
  'sarah-chen': [
    {
      sender: 'contact',
      content: 'Look at this house! 4 bed, 3 bath, great school district',
      offset_days: -5,
      offset_hours: 10,
      offset_minutes: 30,
      type: 'image',
      media_url: '/media/images/sarah_house_1.jpg',
      media_caption: 'What do you think?',
    },
    {
      sender: 'contact',
      content: '',
      offset_days: -5,
      offset_hours: 10,
      offset_minutes: 32,
      type: 'image',
      media_url: '/media/images/sarah_house_2.jpg',
      media_caption: 'The kitchen is amazing!',
    },
    {
      sender: 'contact',
      content: '',
      offset_days: -3,
      offset_hours: 20,
      offset_minutes: 15,
      type: 'image',
      media_url: '/media/images/sarah_selfie.jpg',
      media_caption: 'Date night! 😊',
    },
    {
      sender: 'contact',
      content: '',
      offset_days: -2,
      offset_hours: 16,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/sarah_jake_school.jpg',
      media_caption: "Jake's performance was so good!",
    },
  ],

  'michael-torres': [
    {
      sender: 'contact',
      content: 'New listing just came in! 2847 Oak Street - $525,000',
      offset_days: -4,
      offset_hours: 9,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/listing_1_exterior.jpg',
      media_caption: 'Just listed!',
    },
    {
      sender: 'contact',
      content: '',
      offset_days: -4,
      offset_hours: 9,
      offset_minutes: 2,
      type: 'image',
      media_url: '/media/images/listing_1_kitchen.jpg',
      media_caption: 'Recently renovated kitchen',
    },
    {
      sender: 'contact',
      content: '',
      offset_days: -4,
      offset_hours: 9,
      offset_minutes: 4,
      type: 'image',
      media_url: '/media/images/listing_1_backyard.jpg',
      media_caption: 'Perfect for entertaining',
    },
    {
      sender: 'contact',
      content: '',
      offset_days: -4,
      offset_hours: 9,
      offset_minutes: 6,
      type: 'image',
      media_url: '/media/images/listing_1_master.jpg',
      media_caption: 'Master suite with walk-in closet',
    },
    {
      sender: 'contact',
      content: 'Here are the comparable sales in the area',
      offset_days: -2,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/comp_sales.jpg',
      media_caption: 'Market comparison',
    },
    {
      sender: 'contact',
      content: 'Another one just came up - might be perfect!',
      offset_days: -1,
      offset_hours: 11,
      offset_minutes: 30,
      type: 'image',
      media_url: '/media/images/listing_2_exterior.jpg',
      media_caption: 'Modern contemporary',
    },
  ],

  'david-kim': [
    {
      sender: 'contact',
      content: 'Is this the one we saw on Saturday?',
      offset_days: -3,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/david_interested.jpg',
      media_caption: 'Colonial with front porch',
    },
    {
      sender: 'contact',
      content: "Here's our current place - we definitely need more space",
      offset_days: -2,
      offset_hours: 18,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/david_current.jpg',
      media_caption: 'City apartment',
    },
    {
      sender: 'contact',
      content: 'Love the neighborhood feel',
      offset_days: -1,
      offset_hours: 12,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/david_neighborhood.jpg',
      media_caption: 'Tree-lined streets',
    },
  ],

  'emily-watson': [
    {
      sender: 'contact',
      content: 'Can we schedule a viewing for this one?',
      offset_days: -4,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/emily_house.jpg',
      media_caption: 'Craftsman style',
    },
    {
      sender: 'contact',
      content: 'The pool is a huge plus!',
      offset_days: -3,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/emily_backyard.jpg',
      media_caption: 'Pool and patio area',
    },
    {
      sender: 'contact',
      content: 'This kitchen! 😍',
      offset_days: -2,
      offset_hours: 16,
      offset_minutes: 30,
      type: 'image',
      media_url: '/media/images/emily_kitchen.jpg',
      media_caption: 'Farmhouse style',
    },
  ],

  'robert-hansen': [
    {
      sender: 'contact',
      content: 'View from the new office',
      offset_days: -5,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/robert_office.jpg',
      media_caption: 'Manhattan skyline',
    },
    {
      sender: 'contact',
      content: "Deck for tomorrow's call",
      offset_days: -3,
      offset_hours: 17,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/robert_presentation.jpg',
      media_caption: 'Q4 Results',
    },
    {
      sender: 'contact',
      content: 'The NYC team sends their regards!',
      offset_days: -2,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/robert_team.jpg',
      media_caption: 'Team photo',
    },
    {
      sender: 'contact',
      content: 'NYC never gets old',
      offset_days: -1,
      offset_hours: 19,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/robert_nyc.jpg',
      media_caption: 'Evening skyline',
    },
  ],

  'yuki-tanaka': [
    {
      sender: 'contact',
      content: '東京オフィスからこんにちは！',
      offset_days: -4,
      offset_hours: 2,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/yuki_tokyo.jpg',
      media_caption: 'Tokyo Office',
    },
    {
      sender: 'contact',
      content: 'チームミーティング完了',
      offset_days: -3,
      offset_hours: 4,
      offset_minutes: 30,
      type: 'image',
      media_url: '/media/images/yuki_team.jpg',
      media_caption: 'Team Meeting',
    },
    {
      sender: 'contact',
      content: '桜が満開です 🌸',
      offset_days: -2,
      offset_hours: 1,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/yuki_sakura.jpg',
      media_caption: 'Cherry Blossoms',
    },
    {
      sender: 'contact',
      content: '新製品のプロトタイプ',
      offset_days: -1,
      offset_hours: 3,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/yuki_product.jpg',
      media_caption: 'Prototype',
    },
  ],

  'pierre-dubois': [
    {
      sender: 'contact',
      content: 'Vue du bureau ce soir',
      offset_days: -4,
      offset_hours: 18,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/pierre_paris.jpg',
      media_caption: 'Tour Eiffel',
    },
    {
      sender: 'contact',
      content: "Dîner d'affaires hier soir",
      offset_days: -3,
      offset_hours: 21,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/pierre_dinner.jpg',
      media_caption: 'French cuisine',
    },
    {
      sender: 'contact',
      content: 'Notre nouveau bureau',
      offset_days: -2,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/pierre_office.jpg',
      media_caption: 'Paris Office',
    },
    {
      sender: 'contact',
      content: 'Le contrat est prêt à signer',
      offset_days: -1,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/pierre_doc.jpg',
      media_caption: 'Contract',
    },
  ],

  mom: [
    {
      sender: 'contact',
      content: 'My garden is blooming! 🌷',
      offset_days: -5,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/mom_garden.jpg',
      media_caption: 'Spring flowers',
    },
    {
      sender: 'contact',
      content: 'Made your favorite!',
      offset_days: -3,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/mom_recipe.jpg',
      media_caption: 'Apple pie',
    },
    {
      sender: 'contact',
      content: 'Found this cleaning out the attic!',
      offset_days: -2,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/mom_family_old.jpg',
      media_caption: 'Old family photo',
    },
    {
      sender: 'contact',
      content: 'Whiskers says hello!',
      offset_days: -1,
      offset_hours: 11,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/mom_pet.jpg',
      media_caption: 'Tabby cat',
    },
    {
      sender: 'contact',
      content: 'Learning to take selfies! 😄',
      offset_days: 0,
      offset_hours: -4,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/mom_selfie.jpg',
      media_caption: 'Mom selfie',
    },
  ],

  'jake-son': [
    {
      sender: 'contact',
      content: 'Check out my new setup!',
      offset_days: -4,
      offset_hours: 18,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jake_gaming.jpg',
      media_caption: 'Gaming PC',
    },
    {
      sender: 'contact',
      content: 'Hanging with the boys',
      offset_days: -3,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jake_friends.jpg',
      media_caption: 'Friends',
    },
    {
      sender: 'contact',
      content: 'We won 3-1! ⚽',
      offset_days: -2,
      offset_hours: 17,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jake_soccer.jpg',
      media_caption: 'Soccer game',
    },
    {
      sender: 'contact',
      content: 'Got an A on my project!',
      offset_days: -1,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jake_school.jpg',
      media_caption: 'Science project',
    },
    {
      sender: 'contact',
      content: 'New haircut 💇',
      offset_days: 0,
      offset_hours: -2,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jake_selfie.jpg',
      media_caption: 'Selfie',
    },
  ],

  'dr-amanda-foster': [
    {
      sender: 'contact',
      content: 'Our new location on Main Street',
      offset_days: -3,
      offset_hours: 9,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/dr_building.jpg',
      media_caption: 'Medical Office',
    },
    {
      sender: 'contact',
      content: 'Your numbers are looking great!',
      offset_days: -1,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/dr_chart.jpg',
      media_caption: 'Health chart',
    },
  ],

  'chris-miller': [
    {
      sender: 'contact',
      content: 'Game day! You coming?',
      offset_days: -4,
      offset_hours: 12,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/chris_sports.jpg',
      media_caption: 'Sports bar',
    },
    {
      sender: 'contact',
      content: 'Firing up the grill 🔥',
      offset_days: -3,
      offset_hours: 16,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/chris_bbq.jpg',
      media_caption: 'BBQ time',
    },
    {
      sender: 'contact',
      content: 'Perfect day for 18 holes',
      offset_days: -2,
      offset_hours: 8,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/chris_golf.jpg',
      media_caption: 'Golf course',
    },
    {
      sender: 'contact',
      content: 'Living the dream',
      offset_days: -1,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/chris_selfie.jpg',
      media_caption: 'Weekend vibes',
    },
    {
      sender: 'contact',
      content: 'New brewery downtown - must try',
      offset_days: 0,
      offset_hours: -3,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/chris_beer.jpg',
      media_caption: 'Craft beer flight',
    },
  ],

  'jennifer-lee': [
    {
      sender: 'contact',
      content: 'Strategy session this morning',
      offset_days: -4,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jennifer_meeting.jpg',
      media_caption: 'Team meeting',
    },
    {
      sender: 'contact',
      content: 'Working remotely today',
      offset_days: -3,
      offset_hours: 9,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jennifer_coffee.jpg',
      media_caption: 'Coffee shop',
    },
    {
      sender: 'contact',
      content: 'Presentation went well!',
      offset_days: -2,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jennifer_presentation.jpg',
      media_caption: 'Presenting',
    },
    {
      sender: 'contact',
      content: 'Q4 progress looking good',
      offset_days: -1,
      offset_hours: 16,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/jennifer_dashboard.jpg',
      media_caption: 'Dashboard',
    },
  ],

  'alex-thompson': [
    {
      sender: 'contact',
      content: 'Leg day complete 💪',
      offset_days: -4,
      offset_hours: 7,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alex_gym.jpg',
      media_caption: 'Gym selfie',
    },
    {
      sender: 'contact',
      content: 'Morning run route - 5K',
      offset_days: -3,
      offset_hours: 6,
      offset_minutes: 30,
      type: 'image',
      media_url: '/media/images/alex_running.jpg',
      media_caption: 'Trail run',
    },
    {
      sender: 'contact',
      content: 'Post-workout fuel',
      offset_days: -2,
      offset_hours: 8,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alex_protein.jpg',
      media_caption: 'Protein shake',
    },
    {
      sender: 'contact',
      content: 'New PR! 🎉',
      offset_days: -1,
      offset_hours: 7,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alex_tracker.jpg',
      media_caption: 'Fitness tracker',
    },
    {
      sender: 'contact',
      content: "Let's get it",
      offset_days: 0,
      offset_hours: -5,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alex_weights.jpg',
      media_caption: 'Weight room',
    },
  ],

  'maria-garcia': [
    {
      sender: 'contact',
      content: 'Finished organizing the master closet',
      offset_days: -3,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/maria_clean.jpg',
      media_caption: 'Organized closet',
    },
    {
      sender: 'contact',
      content: 'Restocked supplies',
      offset_days: -2,
      offset_hours: 9,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/maria_supplies.jpg',
      media_caption: 'Cleaning supplies',
    },
    {
      sender: 'contact',
      content: 'All done for today! ✨',
      offset_days: -1,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/maria_kitchen.jpg',
      media_caption: 'Clean kitchen',
    },
  ],

  'house-sale-team': [
    {
      sender: 'sarah-chen',
      content: 'This is the one! 🏠',
      offset_days: -4,
      offset_hours: 11,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/team_house.jpg',
      media_caption: 'Dream house',
    },
    {
      sender: 'michael-torres',
      content: 'Offer submitted!',
      offset_days: -2,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/team_offer.jpg',
      media_caption: 'Contract',
    },
    {
      sender: 'michael-torres',
      content: "Here's the comp analysis",
      offset_days: -1,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/team_comp.jpg',
      media_caption: 'Market analysis',
    },
  ],

  'family-group': [
    {
      sender: 'mom',
      content: 'Sunday dinner at our place!',
      offset_days: -5,
      offset_hours: 18,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/family_dinner.jpg',
      media_caption: 'Family gathering',
    },
    {
      sender: 'sarah-chen',
      content: 'Throwback to last summer ☀️',
      offset_days: -4,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/family_vacation.jpg',
      media_caption: 'Beach vacation',
    },
    {
      sender: 'sarah-chen',
      content: 'So proud of Jake!',
      offset_days: -2,
      offset_hours: 16,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/family_jake_award.jpg',
      media_caption: "Jake's award",
    },
    {
      sender: 'mom',
      content: "Can't wait for the holidays!",
      offset_days: -1,
      offset_hours: 12,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/family_holiday.jpg',
      media_caption: 'Holiday photo',
    },
    {
      sender: 'jake-son',
      content: 'Max wants treats',
      offset_days: 0,
      offset_hours: -3,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/family_pet.jpg',
      media_caption: 'Max the dog',
    },
  ],

  'work-project-alpha': [
    {
      sender: 'robert-hansen',
      content: "Framework from today's session",
      offset_days: -4,
      offset_hours: 16,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alpha_whiteboard.jpg',
      media_caption: 'Strategy session',
    },
    {
      sender: 'jennifer-lee',
      content: 'Great sync everyone!',
      offset_days: -3,
      offset_hours: 11,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alpha_team.jpg',
      media_caption: 'Video call',
    },
    {
      sender: 'yuki-tanaka',
      content: 'Updated timeline attached',
      offset_days: -2,
      offset_hours: 3,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alpha_chart.jpg',
      media_caption: 'Project timeline',
    },
    {
      sender: 'robert-hansen',
      content: 'We hit our Q3 targets! 🎉',
      offset_days: -1,
      offset_hours: 17,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/alpha_celebration.jpg',
      media_caption: 'Celebration',
    },
  ],

  'jakes-school-parents': [
    {
      sender: 'lisa-parent',
      content: "Don't forget - Fall Festival this Saturday!",
      offset_days: -4,
      offset_hours: 9,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/school_flyer.jpg',
      media_caption: 'Event flyer',
    },
    {
      sender: 'tom-parent',
      content: 'Class photo day was so fun!',
      offset_days: -3,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/school_kids.jpg',
      media_caption: 'Class photo',
    },
    {
      sender: 'sarah-chen',
      content: 'New gymnasium construction starting',
      offset_days: -2,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/school_building.jpg',
      media_caption: 'School building',
    },
    {
      sender: 'lisa-parent',
      content: 'Thanks everyone who contributed!',
      offset_days: -1,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/school_fundraiser.jpg',
      media_caption: 'Bake sale',
    },
  ],

  'weekend-warriors': [
    {
      sender: 'chris-miller',
      content: 'Summit selfie! 🏔️',
      offset_days: -4,
      offset_hours: 12,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/warriors_hike.jpg',
      media_caption: 'Mountain view',
    },
    {
      sender: 'alex-thompson',
      content: 'Next trip location?',
      offset_days: -3,
      offset_hours: 20,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/warriors_camp.jpg',
      media_caption: 'Camping spot',
    },
    {
      sender: 'mike-weekend',
      content: 'The crew!',
      offset_days: -2,
      offset_hours: 15,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/warriors_group.jpg',
      media_caption: 'Group selfie',
    },
    {
      sender: 'chris-miller',
      content: 'My place Saturday?',
      offset_days: -1,
      offset_hours: 18,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/warriors_bbq.jpg',
      media_caption: 'Backyard party',
    },
  ],

  'neighborhood-watch': [
    {
      sender: 'helen-neighbor',
      content: 'Love our little street 🏘️',
      offset_days: -4,
      offset_hours: 16,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/neighbor_street.jpg',
      media_caption: 'Our street',
    },
    {
      sender: 'dave-neighbor',
      content: 'Block party was a success!',
      offset_days: -3,
      offset_hours: 14,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/neighbor_event.jpg',
      media_caption: 'Block party',
    },
    {
      sender: 'karen-neighbor',
      content: 'Has anyone seen this dog? Please share!',
      offset_days: -2,
      offset_hours: 10,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/neighbor_lost.jpg',
      media_caption: 'Lost dog',
    },
    {
      sender: 'helen-neighbor',
      content: 'Heads up - water main work next week',
      offset_days: -1,
      offset_hours: 9,
      offset_minutes: 0,
      type: 'image',
      media_url: '/media/images/neighbor_construction.jpg',
      media_caption: 'Construction notice',
    },
  ],
};

function loadConversation(chatId: string): Conversation {
  const filePath = join(CONVERSATIONS_DIR, `${chatId}.json`);
  const data = readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function saveConversation(conversation: Conversation): void {
  const filePath = join(CONVERSATIONS_DIR, `${conversation.chat_id}.json`);
  writeFileSync(filePath, JSON.stringify(conversation, null, 2));
}

function mergeMessages(
  existing: ConversationMessage[],
  additions: ConversationMessage[]
): ConversationMessage[] {
  // Combine all messages
  const all = [...existing, ...additions];

  // Sort by timestamp (offset_days, offset_hours, offset_minutes)
  all.sort((a, b) => {
    const aTime = a.offset_days * 24 * 60 + a.offset_hours * 60 + a.offset_minutes;
    const bTime = b.offset_days * 24 * 60 + b.offset_hours * 60 + b.offset_minutes;
    return aTime - bTime;
  });

  return all;
}

function main(): void {
  console.log('📷 OBLIQ Demo - Media Seeding Script');
  console.log('='.repeat(50));

  let totalAdded = 0;

  for (const [chatId, additions] of Object.entries(MEDIA_ADDITIONS)) {
    try {
      const conversation = loadConversation(chatId);

      // Check if media already added (look for media_url in existing messages)
      const hasMedia = conversation.messages.some((m) => m.media_url);
      if (hasMedia) {
        console.log(`⏭️  ${chatId}: Already has media, skipping`);
        continue;
      }

      // Merge messages
      conversation.messages = mergeMessages(conversation.messages, additions);

      // Save updated conversation
      saveConversation(conversation);

      console.log(`✅ ${chatId}: Added ${additions.length} media messages`);
      totalAdded += additions.length;
    } catch (error) {
      console.error(`❌ ${chatId}: Error - ${error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Complete! Added ${totalAdded} media messages total.`);
  console.log('\nRun `npm run seed` in the server directory to apply changes.');
}

main();
