# Claude Code Prompt: Generate & Seed Contextual Media for OBLIQ Demo

## Task
Generate AI images and seed contextual media (images, voice notes, video thumbnails) across all WhatsApp demo chats. Each chat needs 3-6 media files that fit the conversation context.

## Requirements

### 1. Create Media Generation System

**Option A - Stable Diffusion (Preferred):**
```bash
pip install torch diffusers transformers accelerate Pillow
```

**Option B - Fallback to Unsplash/Placeholders** if SD unavailable

### 2. Media to Generate Per Chat

**Individual Chats:**
- **Sarah Chen (Wife)**: 5 images - house listings, couple selfie, Jake's school event, restaurant
- **Michael Torres (Realtor)**: 6 images - 4 house listing photos (exterior, kitchen, backyard, master), comp sales chart
- **David Kim (Buyer)**: 3 images - house exterior, his apartment, neighborhood
- **Emily Watson (Buyer)**: 3 images - craftsman house, pool backyard, farmhouse kitchen  
- **Robert Hansen (Business)**: 4 images - NYC office view, presentation slide, team photo, skyline + 1 voice note
- **Yuki Tanaka (Japanese)**: 4 images - Tokyo office, team meeting, cherry blossoms 🌸, product prototype
- **Pierre Dubois (French)**: 4 images - Eiffel view, French dinner, Paris office, contract document
- **Mom/Linda**: 5 images - flower garden, apple pie, old family photo, cat, selfie + 1 voice note
- **Jake (Son)**: 5 images - gaming setup, friends selfie, soccer game, school project, haircut selfie + 1 video clip
- **Dr. Foster**: 2 images - medical building, health chart
- **Chris Miller (Friend)**: 5 images - sports bar, BBQ grill, golf course, outdoor selfie, craft beer + 1 voice note
- **Jennifer Lee (Colleague)**: 4 images - meeting room, coffee shop work, presenting, project dashboard
- **Alex Thompson (Gym)**: 5 images - gym selfie, running trail, protein shake, fitness watch, weights
- **Maria Garcia (Housekeeper)**: 3 images - organized closet, cleaning supplies, clean kitchen

**Group Chats:**
- **House Sale Team**: 3 images - dream house, offer doc, comp analysis
- **Chen Family**: 5 images - family dinner, vacation throwback, Jake award, holiday gathering, dog Max
- **Project Alpha**: 4 images - whiteboard strategy, Zoom grid, Gantt chart, celebration toast
- **Lincoln High Parents**: 4 images - school flyer, kids photo, school building, bake sale
- **Weekend Warriors**: 4 images - hiking summit, camping, group selfie, backyard party
- **Oak Street Neighbors**: 4 images - street view, block party, lost dog poster, construction notice

### 3. Implementation Steps

```python
# scripts/generate-media.py

import os
from pathlib import Path

MEDIA_DIR = Path("public/media/images")
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Image prompts - realistic, contextual
PROMPTS = {
    # House/Property
    "sarah_house_1": "Modern suburban house exterior, manicured lawn, sunny day, real estate listing photo, 4K realistic",
    "sarah_house_2": "Modern kitchen, granite counters, stainless appliances, bright natural light, real estate photo",
    "listing_exterior": "Colonial house with white siding, for sale sign, professional real estate photography",
    "listing_kitchen": "Updated kitchen, white cabinets, marble counters, pendant lights, magazine quality",
    "listing_backyard": "Large backyard, stone patio, green grass, outdoor dining set, summer afternoon",
    
    # Selfies/People
    "sarah_selfie": "Happy couple selfie at restaurant, warm lighting, natural smiles, smartphone photo quality",
    "mom_selfie": "Elderly woman 60s taking selfie, warm smile, home kitchen background, learning technology",
    "jake_selfie": "Teenage boy selfie, casual bedroom, headphones, friendly expression",
    "chris_selfie": "Man 30s outdoor selfie, sunglasses, weekend casual, friendly smile",
    "alex_gym": "Gym mirror selfie, athletic person, workout clothes, modern gym background",
    
    # Business
    "robert_office": "Manhattan office, floor-to-ceiling windows, NYC skyline view, modern workspace",
    "tokyo_office": "Modern Japanese office building, cherry blossoms outside, professional",
    "paris_eiffel": "Eiffel Tower view from office window, Parisian rooftops, golden hour",
    "presentation": "Business presentation screen, charts and graphs, conference room",
    
    # Food/Social
    "restaurant_dish": "Gourmet restaurant dish, beautiful plating, fine dining, food photography",
    "bbq_grill": "Backyard BBQ, steaks on grill, smoke rising, summer cookout atmosphere",
    "french_dinner": "French restaurant table, wine glasses, elegant cuisine, candlelit",
    "apple_pie": "Homemade apple pie, golden crust, kitchen counter, cozy home baking",
    
    # Activities
    "hiking_summit": "Group friends hiking, mountain summit, scenic overlook, adventure photo",
    "golf_course": "Golf course fairway, sunny day, beautiful green landscape",
    "gaming_setup": "RGB gaming PC setup, multiple monitors, teenage bedroom, neon lights",
    "soccer_action": "Youth soccer game, teenager kicking ball, action shot, sports photography",
    
    # Family/Groups  
    "family_dinner": "Multi-generational family dinner, Asian family, warm home dining room",
    "school_event": "School auditorium performance, children on stage, proud parents watching",
    "team_photo": "Diverse business team, modern office lobby, professional group photo",
    
    # Misc
    "flower_garden": "Beautiful home garden, roses and tulips, elderly hands gardening",
    "cat_couch": "Tabby cat lounging on couch, cozy home interior, pet portrait",
    "cherry_blossoms": "Cherry blossom trees full bloom, Tokyo park, spring scenery, pink flowers"
}

# Try Stable Diffusion, fall back to placeholders
try:
    from diffusers import StableDiffusionPipeline
    import torch
    
    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16
    ).to("cuda" if torch.cuda.is_available() else "cpu")
    
    for name, prompt in PROMPTS.items():
        output = MEDIA_DIR / f"{name}.jpg"
        if not output.exists():
            print(f"Generating: {name}")
            image = pipe(prompt, num_inference_steps=30).images[0]
            image.save(output)
            
except ImportError:
    print("SD not available - creating placeholders")
    from PIL import Image, ImageDraw
    
    for name, prompt in PROMPTS.items():
        output = MEDIA_DIR / f"{name}.jpg"
        if not output.exists():
            img = Image.new('RGB', (512, 512), '#e0e0e0')
            draw = ImageDraw.Draw(img)
            draw.text((20, 240), name, fill='#666')
            img.save(output)
```

### 4. Seed Messages with Media

```typescript
// scripts/seed-media-messages.ts

const MEDIA_CONVERSATIONS = {
  sarah_chen: [
    { media: '/media/images/sarah_house_1.jpg', text: "What do you think? 4 bed, 3 bath, great school district 🏠", from: 'contact' },
    { media: '/media/images/sarah_house_2.jpg', text: "The kitchen is amazing!", from: 'contact' },
    { text: "I love it! When can we see it?", from: 'user' },
    { media: '/media/images/sarah_selfie.jpg', text: "Date night! 😊", from: 'contact' },
    { media: '/media/voice/sarah_1.wav', voice: true, duration: 8, from: 'contact' },
  ],
  
  michael_torres: [
    { text: "Good morning! New listings to share:", from: 'contact' },
    { media: '/media/images/listing_exterior.jpg', text: "2847 Oak Street - $525,000", from: 'contact' },
    { media: '/media/images/listing_kitchen.jpg', text: "Recently renovated kitchen", from: 'contact' },
    { media: '/media/images/listing_backyard.jpg', text: "Perfect for entertaining", from: 'contact' },
    { text: "This looks perfect!", from: 'user' },
  ],
  
  // Continue for all chats...
};

// Insert into database with proper timestamps spread across conversation
```

### 5. Update Components for Media Display

```tsx
// MessageBubble - add image/voice/video rendering
{message.mediaUrl && message.mediaType === 'image' && (
  <img src={message.mediaUrl} className="message-image" onClick={openPreview} />
)}

{message.mediaType === 'voice' && (
  <VoiceNote duration={message.mediaDuration} url={message.mediaUrl} />
)}
```

### 6. Run Commands

```bash
# Generate images
python scripts/generate-media.py

# Seed to database  
npx ts-node scripts/seed-media-messages.ts

# Or combined
npm run seed:media
```

## Expected Result

- **82 images** across all chats (contextual to conversations)
- **4 voice notes** (Sarah, Robert, Mom, Chris)
- **1 video thumbnail** (Jake gaming clip)
- Each chat has minimum 3 media files
- Media appears naturally within conversation flow
- Images are clickable for preview
- Voice notes have waveform and play button

## Fallback Priority

1. Stable Diffusion local (best quality)
2. DALL-E API (if key available)  
3. Unsplash API (free stock photos)
4. Placeholder images with labels
