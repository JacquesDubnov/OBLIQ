# OBLIQ Demo - Media Seeding Plan & Prompt

## Overview

Generate contextual AI images, create placeholder videos/audio, and seed them across all chats with relevant messages. Each chat should have 3-4+ images minimum plus other media types.

---

## Media Requirements by Chat

### Individual Chats (14 contacts)

| Contact | Required Media | Context |
|---------|---------------|---------|
| **Sarah Chen** (Wife) | 5-6 images | House photos (listings), selfie together, Jake's school event photo, home interior, restaurant they discussed |
| **Michael Torres** (Real Estate Agent) | 6-8 images | 4-5 house listing photos, property exterior, interior shots, neighborhood photo |
| **David Kim** (Buyer 1) | 3-4 images | House exterior he's interested in, comparable property, his current home |
| **Emily Watson** (Buyer 2) | 3-4 images | Different house listing, backyard photo, kitchen shot |
| **Robert Hansen** (Business NYC) | 3-4 images | Office/workspace photo, presentation slide screenshot, NYC skyline, team photo |
| **Yuki Tanaka** (Japanese) | 3-4 images | Tokyo office photo, product mockup, cherry blossom scenery, team celebration |
| **Pierre Dubois** (French) | 3-4 images | Paris office, wine/dinner photo, business document, Eiffel Tower |
| **Mom/Linda** | 4-5 images | Family photo, garden/flowers, recipe dish, grandkids, her pet |
| **Jake (Son)** | 4-5 images | Video game screenshot, school project, selfie with friends, sports/soccer |
| **Dr. Foster** | 2-3 images | Medical building exterior, prescription/pill bottle, health chart |
| **Chris Miller** (Friend) | 4-5 images | Sports game on TV, BBQ/grill, golf course, beer/bar, selfie outdoors |
| **Jennifer Lee** (Colleague) | 3-4 images | Office meeting room, project dashboard, coffee shop, presentation |
| **Alex Thompson** (Gym) | 4-5 images | Gym selfie, workout equipment, protein shake, running trail, fitness tracker |
| **Maria Garcia** (Housekeeper) | 2-3 images | Cleaning supplies, organized closet, home interior |

### Group Chats (6 groups)

| Group | Required Media | Context |
|-------|---------------|---------|
| **House Sale Team** | 4-5 images | House photos, offer document screenshot, comparable sales chart |
| **Chen Family** | 5-6 images | Family dinner, vacation throwback, Jake's achievement, holiday photo, pet |
| **Project Alpha** | 4-5 images | Presentation slides, whiteboard diagram, office team, Zoom screenshot |
| **Lincoln High Parents** | 4-5 images | School event flyer, kids group photo, school building, fundraiser poster |
| **Weekend Warriors** | 4-5 images | Hiking trail, camping, group selfie, sports game, BBQ |
| **Oak Street Neighbors** | 3-4 images | Neighborhood street, community event, lost pet poster, construction notice |

---

## Media Types to Generate

### 1. Images (AI-Generated via Stable Diffusion)

**Categories:**
- **Selfies**: Portrait photos of people (realistic, varied ages/ethnicities)
- **House/Property**: Exteriors, interiors, kitchens, backyards, neighborhoods
- **Family/Social**: Group photos, celebrations, dinners, events
- **Business**: Offices, meeting rooms, presentations, city skylines
- **Food**: Restaurant dishes, home-cooked meals, BBQ
- **Activities**: Gym, sports, hiking, gaming screenshots
- **Documents**: Charts, flyers, medical docs (generic/blurred)
- **Pets/Nature**: Dogs, cats, gardens, landscapes
- **Travel**: Tokyo, Paris, NYC landmarks

### 2. Voice Notes (Generated/Placeholder)

**Contexts:**
- Mom: "Just checking in honey, call me back!"
- Sarah: "Running late, pick up Jake please"
- Chris: "Dude, you watching the game?"
- Michael Torres: "Great news about the offer!"
- Jake: "Dad can you pick me up?"

### 3. Video Thumbnails (Static placeholder with play button)

**Contexts:**
- Jake: Gaming clip, school play snippet
- Chris: Sports highlight
- Family Group: Birthday celebration
- Alex: Workout form check

### 4. Document Previews

**Contexts:**
- Michael Torres: Property listing PDF
- Robert Hansen: Project proposal
- Jennifer: Meeting notes
- Dr. Foster: Lab results (blurred)

---

## Image Generation Prompts (Stable Diffusion)

```python
MEDIA_PROMPTS = {
    # HOUSE/PROPERTY
    "house_exterior_modern": "Modern suburban house exterior, well-maintained lawn, sunny day, real estate listing photo style, 4K quality, realistic",
    "house_exterior_colonial": "Colonial style house exterior, white siding, black shutters, mature trees, professional real estate photography",
    "house_interior_kitchen": "Modern kitchen interior, granite countertops, stainless steel appliances, bright natural lighting, real estate photo",
    "house_interior_living": "Spacious living room interior, hardwood floors, large windows, neutral decor, real estate photography",
    "house_backyard": "Beautiful backyard with patio, green grass, wooden fence, outdoor furniture, sunny day",
    "house_bathroom": "Modern bathroom interior, white fixtures, clean tiles, natural light, real estate photography",
    
    # SELFIES/PORTRAITS
    "selfie_woman_30s": "Casual selfie of a smiling woman in her 30s, natural lighting, indoor setting, smartphone photo quality",
    "selfie_man_30s": "Casual selfie of a man in his 30s, friendly expression, outdoor setting, natural lighting",
    "selfie_teen_boy": "Teenage boy selfie, casual clothes, smiling, bedroom background, smartphone photo",
    "selfie_elderly_woman": "Warm selfie of elderly woman in her 60s, kind smile, home setting, grandmotherly",
    "selfie_gym": "Gym mirror selfie, athletic person, workout clothes, gym equipment in background",
    "selfie_couple": "Happy couple selfie, casual setting, warm expressions, natural lighting",
    
    # BUSINESS/OFFICE
    "office_meeting": "Modern office meeting room, glass walls, people in business casual around table, professional setting",
    "office_workspace": "Clean office desk workspace, computer monitors, coffee cup, professional environment",
    "nyc_skyline": "New York City skyline at sunset, view from office building, Manhattan skyscrapers",
    "tokyo_office": "Modern Tokyo office interior, Japanese business setting, clean minimalist design",
    "paris_office": "Elegant Parisian office with large windows, Haussmann building interior, European business style",
    "presentation_screen": "Business presentation on large screen, charts and graphs, conference room setting",
    
    # FOOD/RESTAURANT
    "restaurant_dish": "Gourmet restaurant dish, beautifully plated food, fine dining presentation, food photography",
    "homemade_dinner": "Homemade family dinner, comfort food, dining table setting, warm lighting",
    "bbq_grill": "Backyard BBQ grill with steaks, summer cookout, outdoor setting",
    "wine_dinner": "Elegant dinner setting with wine glasses, French cuisine, romantic atmosphere",
    "coffee_shop": "Coffee shop table with latte and laptop, cafe atmosphere, casual work setting",
    
    # FAMILY/SOCIAL
    "family_dinner": "Family gathered around dinner table, multi-generational, warm home atmosphere, candid photo",
    "kids_soccer": "Youth soccer game action shot, children playing, outdoor sports field",
    "school_event": "School auditorium event, parents and children, performance or ceremony",
    "birthday_party": "Birthday party celebration, cake with candles, happy family gathering",
    "graduation": "Graduation celebration, cap and gown, proud family moment",
    
    # ACTIVITIES/HOBBIES
    "hiking_trail": "Beautiful hiking trail, forest path, outdoor adventure, nature scenery",
    "golf_course": "Golf course green, sunny day, scenic golf landscape",
    "gym_equipment": "Modern gym interior, workout machines, clean fitness center",
    "gaming_setup": "Gaming PC setup, RGB lighting, multiple monitors, gamer room",
    "sports_bar": "Sports bar interior, TV screens showing game, friends watching sports",
    
    # TRAVEL/LANDMARKS
    "eiffel_tower": "Eiffel Tower view from cafe terrace, Parisian atmosphere, travel photography",
    "cherry_blossom_tokyo": "Cherry blossom trees in Tokyo park, spring scenery, Japanese landscape",
    "central_park_nyc": "Central Park New York, autumn colors, city skyline in background",
    
    # PETS/NATURE
    "golden_retriever": "Friendly golden retriever dog, outdoor setting, happy pet portrait",
    "cat_indoor": "Cute cat lounging on couch, indoor home setting, pet photography",
    "flower_garden": "Beautiful home flower garden, colorful blooms, well-maintained yard",
    
    # DOCUMENTS/SCREENSHOTS (stylized)
    "chart_graph": "Business analytics chart, colorful bar graph, professional data visualization",
    "calendar_screenshot": "Digital calendar app screenshot, weekly view, meeting appointments",
    "text_document": "Professional document on screen, business letter, slightly blurred text"
}
```

---

## Claude Code Prompt

```
## Task: Generate and Seed Contextual Media for OBLIQ WhatsApp Demo

### Overview
Create a media generation and seeding system that:
1. Generates contextual AI images using Stable Diffusion (or downloads stock photos as fallback)
2. Creates placeholder voice notes and video thumbnails
3. Seeds all media into the SQLite database with appropriate messages

### Step 1: Create Media Generation Script

Create `scripts/generate-media.py`:

```python
import os
import json
import sqlite3
from pathlib import Path

# Try Stable Diffusion, fallback to placeholder images
try:
    from diffusers import StableDiffusionPipeline
    import torch
    USE_SD = True
except ImportError:
    USE_SD = False
    print("Stable Diffusion not available, using placeholder images")

# Media output directory
MEDIA_DIR = Path("public/media")
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Create subdirectories
for subdir in ["images", "voice", "video", "documents"]:
    (MEDIA_DIR / subdir).mkdir(exist_ok=True)

# Define all media to generate per chat
CHAT_MEDIA = {
    "sarah_chen": {
        "images": [
            {"id": "sarah_house_1", "prompt": "Modern suburban house exterior, well-maintained lawn, sunny day, real estate photo, 4K", "context": "What do you think of this one? 4 bed, 3 bath, great school district"},
            {"id": "sarah_house_2", "prompt": "Spacious kitchen interior, granite counters, stainless appliances, bright lighting", "context": "The kitchen is amazing!"},
            {"id": "sarah_selfie", "prompt": "Happy couple selfie, restaurant setting, evening lighting, natural smile", "context": "Date night! 😊"},
            {"id": "sarah_jake_school", "prompt": "School auditorium, children performing on stage, parents watching", "context": "Jake's performance was so good!"},
            {"id": "sarah_restaurant", "prompt": "Elegant restaurant dish, gourmet food presentation, candlelit table", "context": "You have to try this place"}
        ],
        "voice": [
            {"id": "sarah_voice_1", "duration": 8, "context": "Voice message about picking up Jake"}
        ]
    },
    
    "michael_torres": {
        "images": [
            {"id": "listing_1_exterior", "prompt": "Beautiful colonial house exterior, white siding, mature trees, for sale sign, real estate photography", "context": "Just listed! 2847 Oak Street - $525,000"},
            {"id": "listing_1_kitchen", "prompt": "Modern updated kitchen, white cabinets, marble counters, pendant lights, real estate photo", "context": "Recently renovated kitchen"},
            {"id": "listing_1_backyard", "prompt": "Large backyard with patio, green lawn, wooden fence, outdoor dining set", "context": "Perfect for entertaining"},
            {"id": "listing_1_master", "prompt": "Master bedroom interior, large windows, neutral colors, en-suite bathroom visible", "context": "Master suite with walk-in closet"},
            {"id": "listing_2_exterior", "prompt": "Modern contemporary house, clean lines, large windows, professional landscaping", "context": "New listing just came in - might be perfect for your clients"},
            {"id": "comp_sales", "prompt": "Real estate market chart, bar graph showing home prices, professional data visualization", "context": "Comparable sales in the area"}
        ]
    },
    
    "david_kim": {
        "images": [
            {"id": "david_interested", "prompt": "Colonial house exterior, front porch, American flag, suburban neighborhood", "context": "This is the one we saw on Saturday, right?"},
            {"id": "david_current", "prompt": "Small apartment interior, city view from window, modern furniture", "context": "Here's our current place - definitely need more space"},
            {"id": "david_neighborhood", "prompt": "Quiet suburban street, tree-lined, children playing, safe neighborhood feel", "context": "Love the neighborhood feel"}
        ]
    },
    
    "emily_watson": {
        "images": [
            {"id": "emily_house", "prompt": "Craftsman style house exterior, covered porch, stone accents, landscaped yard", "context": "Can we schedule a viewing for this one?"},
            {"id": "emily_backyard", "prompt": "Backyard with swimming pool, lounge chairs, privacy fence, sunny day", "context": "The pool is a huge plus!"},
            {"id": "emily_kitchen", "prompt": "Farmhouse style kitchen, butcher block island, open shelving, natural light", "context": "This kitchen! 😍"}
        ]
    },
    
    "robert_hansen": {
        "images": [
            {"id": "robert_office", "prompt": "Manhattan office interior, floor-to-ceiling windows, city skyline view, modern workspace", "context": "View from the new office"},
            {"id": "robert_presentation", "prompt": "Business presentation screen, quarterly results chart, conference room", "context": "Deck for tomorrow's call"},
            {"id": "robert_team", "prompt": "Business team group photo, diverse professionals, modern office lobby", "context": "The NYC team sends their regards!"},
            {"id": "robert_nyc", "prompt": "New York City skyline at dusk, Empire State Building, urban landscape", "context": "NYC never gets old"}
        ],
        "voice": [
            {"id": "robert_voice_1", "duration": 15, "context": "Quick update on the Henderson deal"}
        ]
    },
    
    "yuki_tanaka": {
        "images": [
            {"id": "yuki_tokyo", "prompt": "Modern Tokyo office building exterior, Japanese architecture, cherry blossoms", "context": "東京オフィスからこんにちは！"},
            {"id": "yuki_team", "prompt": "Japanese business team meeting, professional setting, bowing greeting", "context": "チームミーティング完了"},
            {"id": "yuki_sakura", "prompt": "Cherry blossom trees in full bloom, Tokyo park, spring scenery, beautiful pink flowers", "context": "桜が満開です 🌸"},
            {"id": "yuki_product", "prompt": "Product prototype on desk, tech gadget, sleek design, office background", "context": "新製品のプロトタイプ"}
        ]
    },
    
    "pierre_dubois": {
        "images": [
            {"id": "pierre_paris", "prompt": "Eiffel Tower view from office window, Parisian rooftops, golden hour lighting", "context": "Vue du bureau ce soir"},
            {"id": "pierre_dinner", "prompt": "French restaurant table, wine glasses, gourmet French cuisine, elegant setting", "context": "Dîner d'affaires hier soir"},
            {"id": "pierre_office", "prompt": "Elegant Parisian office, Haussmann building interior, classic French design", "context": "Notre nouveau bureau"},
            {"id": "pierre_doc", "prompt": "Business contract document on desk, pen, coffee cup, professional setting", "context": "Le contrat est prêt à signer"}
        ]
    },
    
    "mom_linda": {
        "images": [
            {"id": "mom_garden", "prompt": "Beautiful home flower garden, roses and tulips, elderly hands gardening", "context": "My garden is blooming! 🌷"},
            {"id": "mom_recipe", "prompt": "Homemade apple pie, golden crust, kitchen counter, home baking", "context": "Made your favorite!"},
            {"id": "mom_family_old", "prompt": "Vintage family photo, 1990s style, family gathered, nostalgic feeling", "context": "Found this cleaning out the attic!"},
            {"id": "mom_pet", "prompt": "Cute tabby cat on couch, cozy home interior, pet portrait", "context": "Whiskers says hello!"},
            {"id": "mom_selfie", "prompt": "Warm selfie elderly woman 60s, kind smile, home kitchen background, grandmotherly", "context": "Learning to take selfies! 😄"}
        ],
        "voice": [
            {"id": "mom_voice_1", "duration": 12, "context": "Hi honey, just calling to check in..."}
        ]
    },
    
    "jake_son": {
        "images": [
            {"id": "jake_gaming", "prompt": "Gaming PC setup, RGB lighting, video game on screen, teenager room", "context": "Check out my new setup!"},
            {"id": "jake_friends", "prompt": "Group of teenage friends selfie, casual clothes, outdoor park setting", "context": "Hanging with the boys"},
            {"id": "jake_soccer", "prompt": "Youth soccer action shot, teenager kicking ball, sports field, dynamic", "context": "We won 3-1! ⚽"},
            {"id": "jake_school", "prompt": "School science project display, poster board, student work, classroom", "context": "Got an A on my project!"},
            {"id": "jake_selfie", "prompt": "Teenage boy selfie, headphones around neck, casual bedroom background", "context": "New haircut 💇"}
        ],
        "video": [
            {"id": "jake_video_1", "thumbnail": "Gaming screen capture, action game, HUD visible", "duration": 45, "context": "Check out this clip!"}
        ]
    },
    
    "dr_foster": {
        "images": [
            {"id": "dr_building", "prompt": "Modern medical office building exterior, healthcare facility, professional", "context": "Our new location on Main Street"},
            {"id": "dr_chart", "prompt": "Health chart graph, positive trend line, medical data visualization, professional", "context": "Your numbers are looking great!"}
        ]
    },
    
    "chris_miller": {
        "images": [
            {"id": "chris_sports", "prompt": "Sports bar TV screens, football game on multiple screens, bar atmosphere", "context": "Game day! You coming?"},
            {"id": "chris_bbq", "prompt": "Backyard BBQ grill, steaks cooking, smoke rising, summer cookout", "context": "Firing up the grill 🔥"},
            {"id": "chris_golf", "prompt": "Golf course scenic view, green fairway, sunny day, beautiful landscape", "context": "Perfect day for 18 holes"},
            {"id": "chris_selfie", "prompt": "Man 30s selfie outdoors, sunglasses, casual weekend clothes, friendly smile", "context": "Living the dream"},
            {"id": "chris_beer", "prompt": "Craft beer flight, brewery tasting room, wooden paddle with glasses", "context": "New brewery downtown - must try"}
        ],
        "voice": [
            {"id": "chris_voice_1", "duration": 6, "context": "Dude, you watching the game tonight?"}
        ]
    },
    
    "jennifer_lee": {
        "images": [
            {"id": "jennifer_meeting", "prompt": "Modern office meeting room, people collaborating, whiteboard with diagrams", "context": "Strategy session this morning"},
            {"id": "jennifer_coffee", "prompt": "Coffee shop laptop workspace, latte art, casual work environment", "context": "Working remotely today"},
            {"id": "jennifer_presentation", "prompt": "Woman presenting to team, conference room, professional business setting", "context": "Presentation went well!"},
            {"id": "jennifer_dashboard", "prompt": "Project management dashboard on screen, colorful charts, task boards", "context": "Q4 progress looking good"}
        ]
    },
    
    "alex_thompson": {
        "images": [
            {"id": "alex_gym", "prompt": "Gym mirror selfie, fit person workout clothes, modern gym equipment background", "context": "Leg day complete 💪"},
            {"id": "alex_running", "prompt": "Running trail through park, morning sunlight, jogging path, nature", "context": "Morning run route - 5K"},
            {"id": "alex_protein", "prompt": "Protein shake in shaker bottle, post-workout, gym bag, fitness lifestyle", "context": "Post-workout fuel"},
            {"id": "alex_tracker", "prompt": "Fitness smartwatch on wrist, workout stats displayed, sweaty arm", "context": "New PR! 🎉"},
            {"id": "alex_weights", "prompt": "Heavy dumbbells rack, weight room, gym equipment, fitness motivation", "context": "Let's get it"}
        ]
    },
    
    "maria_garcia": {
        "images": [
            {"id": "maria_clean", "prompt": "Organized clean closet, neatly folded clothes, home organization", "context": "Finished organizing the master closet"},
            {"id": "maria_supplies", "prompt": "Cleaning supplies organized, bucket, eco-friendly products, professional cleaning", "context": "Restocked supplies"},
            {"id": "maria_before_after", "prompt": "Clean sparkling kitchen, spotless counters, organized space", "context": "All done for today! ✨"}
        ]
    },
    
    # GROUP CHATS
    "house_sale_team": {
        "images": [
            {"id": "team_house", "prompt": "Dream house exterior, sold sign, beautiful landscaping, real estate success", "context": "Sarah: This is the one! 🏠"},
            {"id": "team_offer", "prompt": "Document on table, pen signing, real estate contract, professional", "context": "Michael: Offer submitted!"},
            {"id": "team_comp", "prompt": "Real estate market analysis chart, price comparisons, data visualization", "context": "Michael: Here's the comp analysis"}
        ]
    },
    
    "chen_family": {
        "images": [
            {"id": "family_dinner", "prompt": "Asian family dinner gathering, multiple generations, home dining room, celebration", "context": "Mom: Sunday dinner at our place!"},
            {"id": "family_vacation", "prompt": "Family vacation beach photo, ocean background, happy family, summer", "context": "Sarah: Throwback to last summer ☀️"},
            {"id": "family_jake", "prompt": "Teenager receiving award, school ceremony, proud parents watching", "context": "So proud of Jake!"},
            {"id": "family_holiday", "prompt": "Family Christmas gathering, decorated tree, presents, warm home", "context": "Mom: Can't wait for the holidays!"},
            {"id": "family_pet", "prompt": "Golden retriever with family, backyard, happy dog, family pet", "context": "Jake: Max wants treats"}
        ]
    },
    
    "project_alpha": {
        "images": [
            {"id": "alpha_whiteboard", "prompt": "Whiteboard with business strategy diagrams, arrows, sticky notes, brainstorm", "context": "Robert: Framework from today's session"},
            {"id": "alpha_team", "prompt": "Diverse business team video call grid, Zoom meeting screenshot, remote work", "context": "Jennifer: Great sync everyone!"},
            {"id": "alpha_chart", "prompt": "Project timeline Gantt chart, milestones, progress tracking, professional", "context": "Updated timeline attached"},
            {"id": "alpha_celebration", "prompt": "Office celebration, champagne toast, business success, team achievement", "context": "We hit our Q3 targets! 🎉"}
        ]
    },
    
    "lincoln_parents": {
        "images": [
            {"id": "school_flyer", "prompt": "School event flyer poster, colorful design, family event, education", "context": "Don't forget - Fall Festival this Saturday!"},
            {"id": "school_kids", "prompt": "Group of school children, classroom setting, diverse kids, education", "context": "Class photo day was so fun!"},
            {"id": "school_building", "prompt": "American public school building exterior, flag, educational institution", "context": "New gymnasium construction starting"},
            {"id": "school_fundraiser", "prompt": "Bake sale table, homemade treats, school fundraiser, community event", "context": "Thanks everyone who contributed!"}
        ]
    },
    
    "weekend_warriors": {
        "images": [
            {"id": "warriors_hike", "prompt": "Group hiking mountain trail, friends outdoors, adventure, scenic view", "context": "Chris: Summit selfie! 🏔️"},
            {"id": "warriors_camp", "prompt": "Camping tent under stars, campfire, night outdoor adventure", "context": "Alex: Next trip location?"},
            {"id": "warriors_group", "prompt": "Group of friends selfie, outdoor adventure gear, happy faces, weekend trip", "context": "The crew!"},
            {"id": "warriors_bbq", "prompt": "Backyard party, friends gathered, BBQ cookout, summer celebration", "context": "Chris: My place Saturday?"}
        ]
    },
    
    "oak_neighbors": {
        "images": [
            {"id": "neighbor_street", "prompt": "Quiet suburban street, tree-lined road, nice houses, American neighborhood", "context": "Love our little street 🏘️"},
            {"id": "neighbor_event", "prompt": "Neighborhood block party, families gathered, street closed, community event", "context": "Block party was a success!"},
            {"id": "neighbor_lost", "prompt": "Lost pet poster, cute dog photo, contact information, neighborhood notice", "context": "Has anyone seen this dog? Please share!"},
            {"id": "neighbor_construction", "prompt": "Construction notice sign, road work ahead, neighborhood improvement", "context": "Heads up - water main work next week"}
        ]
    }
}

def generate_placeholder_image(prompt, output_path, size=(512, 512)):
    """Generate a placeholder image with text"""
    from PIL import Image, ImageDraw, ImageFont
    
    # Create gradient background based on content
    img = Image.new('RGB', size, color='#f0f0f0')
    draw = ImageDraw.Draw(img)
    
    # Add text
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    # Wrap text
    words = prompt[:100].split()
    lines = []
    current_line = []
    for word in words:
        current_line.append(word)
        if len(' '.join(current_line)) > 40:
            lines.append(' '.join(current_line[:-1]))
            current_line = [word]
    lines.append(' '.join(current_line))
    
    y = size[1] // 2 - len(lines) * 10
    for line in lines[:5]:
        bbox = draw.textbbox((0, 0), line, font=font)
        x = (size[0] - (bbox[2] - bbox[0])) // 2
        draw.text((x, y), line, fill='#666666', font=font)
        y += 20
    
    img.save(output_path)
    return output_path

def generate_stable_diffusion_image(prompt, output_path):
    """Generate image using Stable Diffusion"""
    if not USE_SD:
        return generate_placeholder_image(prompt, output_path)
    
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16
    )
    pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
    
    image = pipe(prompt, num_inference_steps=30, guidance_scale=7.5).images[0]
    image.save(output_path)
    return output_path

def create_voice_placeholder(duration, output_path):
    """Create a placeholder audio file"""
    # Create silent audio or waveform placeholder
    import wave
    import struct
    
    sample_rate = 44100
    num_samples = int(sample_rate * duration)
    
    with wave.open(output_path, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        # Generate simple tone or silence
        for i in range(num_samples):
            value = int(1000 * (i % 100) / 100)  # Simple waveform
            wav_file.writeframes(struct.pack('h', value))
    
    return output_path

def seed_media_to_database():
    """Insert media messages into database"""
    conn = sqlite3.connect('obliq.db')
    cursor = conn.cursor()
    
    for chat_id, media_data in CHAT_MEDIA.items():
        # Get contact_id from chat_id
        # Insert media messages with appropriate timestamps
        pass
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    print("Starting media generation...")
    
    for chat_id, media_data in CHAT_MEDIA.items():
        print(f"\nProcessing {chat_id}...")
        
        # Generate images
        for img in media_data.get("images", []):
            output_path = MEDIA_DIR / "images" / f"{img['id']}.jpg"
            if not output_path.exists():
                print(f"  Generating: {img['id']}")
                if USE_SD:
                    generate_stable_diffusion_image(img['prompt'], str(output_path))
                else:
                    generate_placeholder_image(img['prompt'], str(output_path))
        
        # Generate voice notes
        for voice in media_data.get("voice", []):
            output_path = MEDIA_DIR / "voice" / f"{voice['id']}.wav"
            if not output_path.exists():
                print(f"  Creating voice: {voice['id']}")
                create_voice_placeholder(voice['duration'], str(output_path))
    
    print("\nMedia generation complete!")
    print("Run seed_media_to_database() to insert into database")
```

### Step 2: Update Database Schema

Add to `server/db/schema.sql`:

```sql
-- Media messages table extension
ALTER TABLE messages ADD COLUMN media_url TEXT;
ALTER TABLE messages ADD COLUMN media_type TEXT; -- 'image', 'video', 'voice', 'document'
ALTER TABLE messages ADD COLUMN media_thumbnail TEXT;
ALTER TABLE messages ADD COLUMN media_duration INTEGER; -- for voice/video in seconds
ALTER TABLE messages ADD COLUMN media_filename TEXT;
```

### Step 3: Create Seeding Script

Create `scripts/seed-media-messages.ts`:

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const MEDIA_MESSAGES = {
  sarah_chen: [
    { type: 'image', url: '/media/images/sarah_house_1.jpg', text: "What do you think of this one? 4 bed, 3 bath, great school district", sender: 'contact', time: -7200 },
    { type: 'image', url: '/media/images/sarah_house_2.jpg', text: "The kitchen is amazing!", sender: 'contact', time: -7100 },
    { type: 'text', text: "I love it! When can we see it?", sender: 'user', time: -7000 },
    { type: 'image', url: '/media/images/sarah_selfie.jpg', text: "Date night! 😊", sender: 'contact', time: -3600 },
    { type: 'image', url: '/media/images/sarah_jake_school.jpg', text: "Jake's performance was so good!", sender: 'contact', time: -1800 },
    { type: 'voice', url: '/media/voice/sarah_voice_1.wav', duration: 8, sender: 'contact', time: -900 },
  ],
  
  michael_torres: [
    { type: 'text', text: "Good morning! I have some exciting listings to share", sender: 'contact', time: -86400 },
    { type: 'image', url: '/media/images/listing_1_exterior.jpg', text: "Just listed! 2847 Oak Street - $525,000", sender: 'contact', time: -86300 },
    { type: 'image', url: '/media/images/listing_1_kitchen.jpg', text: "Recently renovated kitchen", sender: 'contact', time: -86200 },
    { type: 'image', url: '/media/images/listing_1_backyard.jpg', text: "Perfect for entertaining", sender: 'contact', time: -86100 },
    { type: 'image', url: '/media/images/listing_1_master.jpg', text: "Master suite with walk-in closet", sender: 'contact', time: -86000 },
    { type: 'text', text: "This looks perfect! Can we schedule a viewing?", sender: 'user', time: -85000 },
    { type: 'image', url: '/media/images/comp_sales.jpg', text: "Here's the comparable sales in the area", sender: 'contact', time: -43200 },
    { type: 'image', url: '/media/images/listing_2_exterior.jpg', text: "New listing just came in - might be perfect", sender: 'contact', time: -3600 },
  ],
  
  // ... continue for all chats
};

function seedMediaMessages() {
  const db = new Database('./obliq.db');
  
  for (const [chatId, messages] of Object.entries(MEDIA_MESSAGES)) {
    const contact = db.prepare('SELECT id FROM contacts WHERE chat_id = ?').get(chatId);
    if (!contact) continue;
    
    const baseTime = Date.now();
    
    for (const msg of messages) {
      const timestamp = baseTime + (msg.time * 1000);
      
      db.prepare(`
        INSERT INTO messages (chat_id, sender_type, content, media_url, media_type, media_duration, timestamp, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'read')
      `).run(
        contact.id,
        msg.sender === 'user' ? 'user' : 'contact',
        msg.text || '',
        msg.url || null,
        msg.type,
        msg.duration || null,
        timestamp
      );
    }
  }
  
  console.log('Media messages seeded successfully!');
  db.close();
}

seedMediaMessages();
```

### Step 4: Update Message Components

Update `client/src/components/MessageBubble.tsx` to handle media:

```tsx
const MessageBubble = ({ message }) => {
  const renderMedia = () => {
    switch (message.media_type) {
      case 'image':
        return (
          <ImageContainer onClick={() => openImagePreview(message.media_url)}>
            <img src={message.media_url} alt="" />
          </ImageContainer>
        );
      case 'voice':
        return (
          <VoiceNote>
            <PlayButton />
            <Waveform />
            <Duration>{formatDuration(message.media_duration)}</Duration>
          </VoiceNote>
        );
      case 'video':
        return (
          <VideoThumbnail>
            <img src={message.media_thumbnail} alt="" />
            <PlayOverlay />
          </VideoThumbnail>
        );
      default:
        return null;
    }
  };

  return (
    <Bubble outgoing={message.sender_type === 'user'}>
      {message.media_type && renderMedia()}
      {message.content && <Text>{message.content}</Text>}
      <Timestamp>{formatTime(message.timestamp)}</Timestamp>
    </Bubble>
  );
};
```

### Step 5: Run Generation

```bash
# Install dependencies
pip install Pillow torch diffusers transformers accelerate

# Generate media (will use placeholders if SD not available)
python scripts/generate-media.py

# Seed database
npx ts-node scripts/seed-media-messages.ts
```

### Expected Output

Each chat will have:
- 3-8 contextual images
- 1-2 voice notes where appropriate
- Optional video thumbnails
- All media tied to relevant conversation context

Total media files: ~80-100 images, ~10 voice notes, ~5 video thumbnails

### Fallback Options

If Stable Diffusion is not available:
1. Use placeholder images with descriptive text
2. Download from Unsplash API (free stock photos)
3. Use DALL-E API if available
4. Use DiceBear for avatar-style placeholders
```

---

## Quick Reference: Media Count Summary

| Chat | Images | Voice | Video | Total |
|------|--------|-------|-------|-------|
| Sarah Chen | 5 | 1 | 0 | 6 |
| Michael Torres | 6 | 0 | 0 | 6 |
| David Kim | 3 | 0 | 0 | 3 |
| Emily Watson | 3 | 0 | 0 | 3 |
| Robert Hansen | 4 | 1 | 0 | 5 |
| Yuki Tanaka | 4 | 0 | 0 | 4 |
| Pierre Dubois | 4 | 0 | 0 | 4 |
| Mom/Linda | 5 | 1 | 0 | 6 |
| Jake (Son) | 5 | 0 | 1 | 6 |
| Dr. Foster | 2 | 0 | 0 | 2 |
| Chris Miller | 5 | 1 | 0 | 6 |
| Jennifer Lee | 4 | 0 | 0 | 4 |
| Alex Thompson | 5 | 0 | 0 | 5 |
| Maria Garcia | 3 | 0 | 0 | 3 |
| House Sale Team | 3 | 0 | 0 | 3 |
| Chen Family | 5 | 0 | 0 | 5 |
| Project Alpha | 4 | 0 | 0 | 4 |
| Lincoln Parents | 4 | 0 | 0 | 4 |
| Weekend Warriors | 4 | 0 | 0 | 4 |
| Oak Neighbors | 4 | 0 | 0 | 4 |
| **TOTAL** | **82** | **4** | **1** | **87** |
