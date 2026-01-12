#!/usr/bin/env python3
"""
OBLIQ Demo - Stable Diffusion Image Generator

Generates realistic images for the WhatsApp demo using SDXL-Turbo.
Uses Apple Silicon GPU (MPS) for fast generation.
"""

import os
from pathlib import Path
import torch
from diffusers import AutoPipelineForText2Image
from PIL import Image

# Output directory
PROJECT_ROOT = Path(__file__).parent.parent
IMAGES_DIR = PROJECT_ROOT / "client" / "public" / "media" / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Image generation settings
WIDTH = 512
HEIGHT = 512
STEPS = 4  # SDXL-Turbo only needs 1-4 steps

# All images to generate with realistic prompts
IMAGES = [
    # Sarah Chen - Wife/Partner
    {"id": "sarah_house_1", "prompt": "Beautiful modern suburban house exterior, sunny day, green lawn, two-story home, real estate photography, high quality"},
    {"id": "sarah_house_2", "prompt": "Modern renovated kitchen interior, granite countertops, stainless steel appliances, white cabinets, natural lighting, real estate photography"},
    {"id": "sarah_selfie", "prompt": "Happy couple selfie at upscale restaurant, romantic dinner, warm lighting, candid photo, smartphone selfie style"},
    {"id": "sarah_jake_school", "prompt": "School auditorium stage, children performing in school play, parents watching, colorful costumes, school event photography"},
    {"id": "sarah_restaurant", "prompt": "Gourmet dinner plate, fine dining, beautifully plated food, restaurant table setting, food photography"},

    # Michael Torres - Real Estate Agent
    {"id": "listing_1_exterior", "prompt": "Colonial style house for sale, front yard, FOR SALE sign, suburban neighborhood, real estate listing photo, professional photography"},
    {"id": "listing_1_kitchen", "prompt": "Luxury kitchen, white cabinets, marble countertops, modern appliances, pendant lights, real estate interior photography"},
    {"id": "listing_1_backyard", "prompt": "Large backyard with patio, green grass lawn, outdoor furniture, barbecue area, sunny day, real estate photography"},
    {"id": "listing_1_master", "prompt": "Master bedroom suite, king bed, walk-in closet door visible, neutral colors, large windows, real estate interior photo"},
    {"id": "listing_2_exterior", "prompt": "Modern contemporary house exterior, flat roof, large windows, minimalist design, architectural photography"},
    {"id": "comp_sales", "prompt": "Real estate market analysis document, charts and graphs, property comparison spreadsheet, business document on desk"},

    # David Kim - First-time Homebuyer
    {"id": "david_interested", "prompt": "Charming colonial house with front porch, white columns, American flag, tree-lined street, suburban home"},
    {"id": "david_current", "prompt": "Small city apartment interior, compact living space, city view through window, urban lifestyle"},
    {"id": "david_neighborhood", "prompt": "Beautiful tree-lined suburban street, houses with manicured lawns, quiet neighborhood, autumn leaves"},

    # Emily Watson - Client
    {"id": "emily_house", "prompt": "Craftsman style bungalow, stone accents, covered front porch, landscaped yard, charming home exterior"},
    {"id": "emily_backyard", "prompt": "Backyard swimming pool, lounge chairs, pool deck, sunny day, residential pool, luxury home"},
    {"id": "emily_kitchen", "prompt": "Farmhouse style kitchen, butcher block counters, open shelving, rustic decor, cozy kitchen interior"},

    # Robert Hansen - CEO Boss
    {"id": "robert_office", "prompt": "Corner office with Manhattan skyline view, floor to ceiling windows, executive desk, modern office interior"},
    {"id": "robert_presentation", "prompt": "Business presentation slide on screen, Q4 results chart, conference room, corporate meeting"},
    {"id": "robert_team", "prompt": "Corporate team photo, business professionals in office lobby, group portrait, corporate photography"},
    {"id": "robert_nyc", "prompt": "Manhattan skyline at dusk, city lights, Empire State Building, urban photography, golden hour"},

    # Yuki Tanaka - Tokyo Colleague
    {"id": "yuki_tokyo", "prompt": "Modern Tokyo office building exterior, cherry blossom trees, Japanese corporate architecture, spring day"},
    {"id": "yuki_team", "prompt": "photorealistic photograph, Japanese business meeting, professionals around conference table, modern office, Tokyo corporate culture, DSLR photo, 35mm lens, natural lighting, high resolution photograph"},
    {"id": "yuki_sakura", "prompt": "Cherry blossoms in full bloom, sakura trees, Japanese park, pink petals, spring in Japan, beautiful scenery"},
    {"id": "yuki_product", "prompt": "New tech product prototype on desk, sleek design, product photography, innovation, startup"},

    # Pierre Dubois - Paris Partner
    {"id": "pierre_paris", "prompt": "Eiffel Tower view from office window, Paris cityscape, evening golden hour, French architecture"},
    {"id": "pierre_dinner", "prompt": "French fine dining, wine glasses, gourmet French cuisine, elegant restaurant, candlelit dinner"},
    {"id": "pierre_office", "prompt": "Elegant Parisian office interior, Haussmann style building, high ceilings, ornate details, European business"},
    {"id": "pierre_doc", "prompt": "Business contract documents on desk, pen, official papers, signing ceremony, professional"},

    # Mom - Parent
    {"id": "mom_garden", "prompt": "Beautiful flower garden, roses and tulips, colorful blooms, backyard garden, spring flowers, gardening"},
    {"id": "mom_recipe", "prompt": "Homemade apple pie, golden crust, lattice top, freshly baked, kitchen counter, comfort food"},
    {"id": "mom_family_old", "prompt": "Vintage family photo from 1990s, slightly faded colors, family portrait, nostalgic, old photograph style"},
    {"id": "mom_pet", "prompt": "Cute tabby cat lounging on couch, domestic cat, cozy home, pet photography, adorable feline"},
    {"id": "mom_selfie", "prompt": "Middle-aged woman taking selfie, learning technology, friendly smile, casual home setting, candid"},

    # Jake - Son (Teenager)
    {"id": "jake_gaming", "prompt": "Gaming PC setup, RGB lighting, multiple monitors, gaming chair, teenager bedroom, tech enthusiast"},
    {"id": "jake_friends", "prompt": "Group of teenage friends selfie, outdoor park, sunny day, hanging out, youth, friendship"},
    {"id": "jake_soccer", "prompt": "Youth soccer game action shot, teenager kicking ball, green field, sports photography, athletic"},
    {"id": "jake_school", "prompt": "Science fair project display, student achievement, A grade paper, school project, education"},
    {"id": "jake_selfie", "prompt": "Teenage boy selfie, new haircut, headphones around neck, bedroom mirror, casual style"},

    # Dr. Amanda Foster - Doctor
    {"id": "dr_building", "prompt": "Modern medical office building exterior, healthcare facility, clean architecture, medical center"},
    {"id": "dr_chart", "prompt": "Health chart showing positive trends, medical data visualization, good test results, healthcare"},

    # Chris Miller - Best Friend
    {"id": "chris_sports", "prompt": "Sports bar interior, multiple TV screens showing football game, beer on table, game day atmosphere"},
    {"id": "chris_bbq", "prompt": "Backyard BBQ, steaks on grill, smoke rising, outdoor cooking, summer barbecue, grilling"},
    {"id": "chris_golf", "prompt": "Golf course fairway, sunny day, green grass, beautiful golf landscape, country club"},
    {"id": "chris_selfie", "prompt": "Man outdoor selfie, sunglasses, weekend casual, happy smile, leisure time, relaxed"},
    {"id": "chris_beer", "prompt": "Craft beer flight, four small glasses, brewery tasting room, beer sampling, pub atmosphere"},

    # Jennifer Lee - Colleague
    {"id": "jennifer_meeting", "prompt": "photorealistic photograph, team collaboration meeting, whiteboard with diagrams, office brainstorming session, corporate teamwork, DSLR photo, 35mm lens, natural lighting, stock photography style"},
    {"id": "jennifer_coffee", "prompt": "Woman working at coffee shop, laptop open, latte art coffee, remote work, cafe atmosphere"},
    {"id": "jennifer_presentation", "prompt": "Professional woman giving presentation to team, conference room, business meeting, corporate"},
    {"id": "jennifer_dashboard", "prompt": "Project management dashboard on computer screen, charts and metrics, business analytics, KPIs"},

    # Alex Thompson - Gym Buddy
    {"id": "alex_gym", "prompt": "Gym selfie, workout clothes, gym equipment in background, fitness, exercise, healthy lifestyle"},
    {"id": "alex_running", "prompt": "Morning trail run, park path, jogging, fitness activity, outdoor exercise, nature trail"},
    {"id": "alex_protein", "prompt": "Protein shake in shaker bottle, post-workout, gym bag, fitness nutrition, healthy drink"},
    {"id": "alex_tracker", "prompt": "Fitness smartwatch showing workout stats, new personal record, fitness tracking, wearable tech"},
    {"id": "alex_weights", "prompt": "Weight room, heavy dumbbells on rack, gym interior, strength training, fitness center"},

    # Maria Garcia - Housekeeper
    {"id": "maria_clean", "prompt": "Perfectly organized closet, neatly folded clothes, clean storage, home organization, tidy"},
    {"id": "maria_supplies", "prompt": "Cleaning supplies organized in caddy, spray bottles, brushes, household cleaning products"},
    {"id": "maria_kitchen", "prompt": "Sparkling clean kitchen, spotless counters, organized space, freshly cleaned, immaculate"},

    # Group: House Sale Team
    {"id": "team_house", "prompt": "Beautiful house with SOLD sign, real estate success, dream home purchase, celebration"},
    {"id": "team_offer", "prompt": "Real estate contract being signed, pen in hand, paperwork, home buying documents"},
    {"id": "team_comp", "prompt": "Real estate market comparison chart, property analysis, spreadsheet, market data"},

    # Group: Family Group
    {"id": "family_dinner", "prompt": "Multi-generational family dinner, large dining table, holiday gathering, family celebration"},
    {"id": "family_vacation", "prompt": "Family beach vacation photo, sandy beach, summer holiday, ocean background, happy family"},
    {"id": "family_jake_award", "prompt": "photorealistic photograph, school award ceremony, child receiving certificate on stage, proud parents watching, school gymnasium, DSLR photo, event photography, candid moment, natural lighting"},
    {"id": "family_holiday", "prompt": "photorealistic photograph, Christmas family gathering around decorated tree, living room, holiday celebration, cozy home, warm lighting, DSLR photo, family portrait, festive decorations"},
    {"id": "family_pet", "prompt": "Golden retriever dog in backyard, happy pet, family dog, sunny day, playful"},

    # Group: Work Project Alpha
    {"id": "alpha_whiteboard", "prompt": "Strategy session whiteboard, diagrams and flowcharts, brainstorming, business planning"},
    {"id": "alpha_team", "prompt": "Video conference call grid, remote team meeting, Zoom style layout, virtual meeting"},
    {"id": "alpha_chart", "prompt": "Project timeline Gantt chart, milestones, project management, business planning document"},
    {"id": "alpha_celebration", "prompt": "photorealistic photograph, office champagne toast celebration, business team toasting glasses, corporate achievement, modern office, DSLR photo, 35mm lens, natural lighting, candid corporate event"},

    # Group: Jake's School Parents
    {"id": "school_flyer", "prompt": "Colorful school event flyer, Fall Festival announcement, school newsletter, parent communication"},
    {"id": "school_kids", "prompt": "Elementary school class photo, group of children, school uniforms, education, class portrait"},
    {"id": "school_building", "prompt": "Elementary school building exterior, playground visible, American school, education facility"},
    {"id": "school_fundraiser", "prompt": "School bake sale table, homemade treats, cupcakes and cookies, fundraiser, community event"},

    # Group: Weekend Warriors
    {"id": "warriors_hike", "prompt": "Mountain summit selfie, hikers at peak, scenic vista, outdoor adventure, hiking achievement"},
    {"id": "warriors_camp", "prompt": "Camping tent under stars, campfire glow, night sky, outdoor camping, wilderness adventure"},
    {"id": "warriors_group", "prompt": "Group of friends outdoor selfie, hiking gear, adventure buddies, nature background, friendship"},
    {"id": "warriors_bbq", "prompt": "photorealistic photograph, backyard BBQ party, friends gathered around grill, outdoor summer celebration, sunny day, DSLR photo, social gathering, candid moment, natural lighting"},

    # Group: Neighborhood Watch
    {"id": "neighbor_street", "prompt": "Tree-lined suburban street, nice houses, quiet neighborhood, American suburb, peaceful"},
    {"id": "neighbor_event", "prompt": "photorealistic photograph, neighborhood block party, neighbors gathered on suburban street, tables with food, community celebration, DSLR photo, 35mm lens, sunny day, candid street photography"},
    {"id": "neighbor_lost", "prompt": "Lost dog poster on pole, cute dog photo, LOST PET sign, neighborhood notice, missing pet"},
    {"id": "neighbor_construction", "prompt": "Road construction sign, WATER MAIN WORK ahead notice, utility work, street construction"},
]

# Negative prompt to avoid common issues - strengthened to prevent illustration style
NEGATIVE_PROMPT = "blurry, low quality, distorted, deformed, ugly, bad anatomy, watermark, text overlay, logo, cartoon, anime, illustration, painting, drawing, art, artificial, digital art, 3d render, cgi, vector, clipart, sketch, graphic design, stylized, artistic, painted, drawn, cel shaded"


def load_pipeline():
    """Load SDXL-Turbo pipeline with MPS (Apple Silicon) support."""
    print("Loading SDXL-Turbo model...")

    pipe = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sdxl-turbo",
        torch_dtype=torch.float16 if torch.backends.mps.is_available() else torch.float32,
        variant="fp16" if torch.backends.mps.is_available() else None,
    )

    if torch.backends.mps.is_available():
        pipe = pipe.to("mps")
        print("Using Apple Silicon GPU (MPS)")
    else:
        print("Using CPU (will be slower)")

    print("Model loaded!")
    return pipe


def generate_image(pipe, prompt: str, output_path: Path):
    """Generate a single image."""
    image = pipe(
        prompt=prompt,
        negative_prompt=NEGATIVE_PROMPT,
        num_inference_steps=STEPS,
        guidance_scale=0.0,  # SDXL-Turbo uses guidance_scale=0
        width=WIDTH,
        height=HEIGHT,
    ).images[0]

    # Save as JPEG
    image.save(output_path, "JPEG", quality=90)


def main():
    print("=" * 60)
    print("OBLIQ Demo - Stable Diffusion Image Generator")
    print("=" * 60)
    print(f"\nOutput directory: {IMAGES_DIR}")
    print(f"Total images to generate: {len(IMAGES)}")
    print(f"Image size: {WIDTH}x{HEIGHT}")
    print()

    # Load the model
    pipe = load_pipeline()

    # Generate images
    generated = 0
    skipped = 0

    for i, img_data in enumerate(IMAGES):
        img_id = img_data["id"]
        prompt = img_data["prompt"]
        output_path = IMAGES_DIR / f"{img_id}.jpg"

        # Skip if already exists
        if output_path.exists():
            print(f"[{i+1}/{len(IMAGES)}] {img_id}: Already exists, skipping")
            skipped += 1
            continue

        print(f"[{i+1}/{len(IMAGES)}] Generating: {img_id}")
        print(f"    Prompt: {prompt[:60]}...")

        try:
            generate_image(pipe, prompt, output_path)
            generated += 1
            print(f"    Saved: {output_path.name}")
        except Exception as e:
            print(f"    ERROR: {e}")

    print()
    print("=" * 60)
    print(f"Complete!")
    print(f"  Generated: {generated}")
    print(f"  Skipped: {skipped}")
    print(f"  Total: {len(IMAGES)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
