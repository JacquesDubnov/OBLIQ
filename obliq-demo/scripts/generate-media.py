#!/usr/bin/env python3
"""
OBLIQ Demo - Media Generation Script

Generates placeholder images for the WhatsApp demo.
Uses PIL to create styled placeholders with text descriptions.
Falls back to colored rectangles if PIL not available.
"""

import os
import random
from pathlib import Path

# Output directories
PROJECT_ROOT = Path(__file__).parent.parent
MEDIA_DIR = PROJECT_ROOT / "client" / "public" / "media"
IMAGES_DIR = MEDIA_DIR / "images"
VOICE_DIR = MEDIA_DIR / "voice"

# Ensure directories exist
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
VOICE_DIR.mkdir(parents=True, exist_ok=True)

# Color schemes for different categories
COLORS = {
    "house": ["#8B7355", "#D2B48C", "#F5DEB3"],  # Brown tones
    "selfie": ["#DDA0DD", "#FFB6C1", "#FFC0CB"],  # Pink tones
    "business": ["#4682B4", "#5F9EA0", "#708090"],  # Blue/gray tones
    "food": ["#CD853F", "#DEB887", "#F5DEB3"],  # Warm food tones
    "family": ["#9370DB", "#BA55D3", "#E6E6FA"],  # Purple tones
    "activity": ["#228B22", "#32CD32", "#90EE90"],  # Green tones
    "travel": ["#4169E1", "#6495ED", "#87CEEB"],  # Sky blue tones
    "pet": ["#D2691E", "#CD853F", "#F4A460"],  # Tan/brown tones
    "document": ["#808080", "#A9A9A9", "#D3D3D3"],  # Gray tones
    "medical": ["#20B2AA", "#66CDAA", "#E0FFFF"],  # Teal tones
    "gym": ["#FF6347", "#FF7F50", "#FFA07A"],  # Red/orange tones
    "cleaning": ["#87CEEB", "#ADD8E6", "#E0FFFF"],  # Light blue tones
}

# Media definitions per chat
CHAT_MEDIA = {
    "sarah-chen": {
        "images": [
            {"id": "sarah_house_1", "label": "House Exterior", "category": "house", "desc": "Modern suburban house, sunny day"},
            {"id": "sarah_house_2", "label": "Kitchen", "category": "house", "desc": "Renovated kitchen, granite counters"},
            {"id": "sarah_selfie", "label": "Couple Selfie", "category": "selfie", "desc": "Happy couple at restaurant"},
            {"id": "sarah_jake_school", "label": "School Event", "category": "family", "desc": "Jake's school performance"},
            {"id": "sarah_restaurant", "label": "Restaurant", "category": "food", "desc": "Gourmet dinner plate"},
        ],
        "voice": [{"id": "sarah_voice_1", "duration": 8}],
    },
    "michael-torres": {
        "images": [
            {"id": "listing_1_exterior", "label": "2847 Oak St", "category": "house", "desc": "Colonial house, for sale"},
            {"id": "listing_1_kitchen", "label": "Kitchen", "category": "house", "desc": "White cabinets, marble counters"},
            {"id": "listing_1_backyard", "label": "Backyard", "category": "house", "desc": "Large patio, green lawn"},
            {"id": "listing_1_master", "label": "Master Suite", "category": "house", "desc": "Master bedroom, walk-in closet"},
            {"id": "listing_2_exterior", "label": "New Listing", "category": "house", "desc": "Modern contemporary house"},
            {"id": "comp_sales", "label": "Comp Sales", "category": "document", "desc": "Market comparison chart"},
        ],
    },
    "david-kim": {
        "images": [
            {"id": "david_interested", "label": "House View", "category": "house", "desc": "Colonial house, front porch"},
            {"id": "david_current", "label": "Current Apt", "category": "house", "desc": "Small apartment, city view"},
            {"id": "david_neighborhood", "label": "Neighborhood", "category": "house", "desc": "Tree-lined street, quiet"},
        ],
    },
    "emily-watson": {
        "images": [
            {"id": "emily_house", "label": "Craftsman House", "category": "house", "desc": "Stone accents, covered porch"},
            {"id": "emily_backyard", "label": "Pool", "category": "house", "desc": "Swimming pool, lounge chairs"},
            {"id": "emily_kitchen", "label": "Kitchen", "category": "house", "desc": "Farmhouse style, butcher block"},
        ],
    },
    "robert-hansen": {
        "images": [
            {"id": "robert_office", "label": "NYC Office", "category": "business", "desc": "Manhattan skyline view"},
            {"id": "robert_presentation", "label": "Presentation", "category": "document", "desc": "Q4 results chart"},
            {"id": "robert_team", "label": "Team Photo", "category": "business", "desc": "NYC team, office lobby"},
            {"id": "robert_nyc", "label": "NYC Skyline", "category": "travel", "desc": "Manhattan at dusk"},
        ],
        "voice": [{"id": "robert_voice_1", "duration": 15}],
    },
    "yuki-tanaka": {
        "images": [
            {"id": "yuki_tokyo", "label": "Tokyo Office", "category": "business", "desc": "Modern building, cherry blossoms"},
            {"id": "yuki_team", "label": "Team Meeting", "category": "business", "desc": "Japanese business meeting"},
            {"id": "yuki_sakura", "label": "Cherry Blossoms", "category": "travel", "desc": "Sakura full bloom, park"},
            {"id": "yuki_product", "label": "Prototype", "category": "business", "desc": "New product on desk"},
        ],
    },
    "pierre-dubois": {
        "images": [
            {"id": "pierre_paris", "label": "Paris View", "category": "travel", "desc": "Eiffel Tower from office"},
            {"id": "pierre_dinner", "label": "French Dinner", "category": "food", "desc": "Wine glasses, gourmet cuisine"},
            {"id": "pierre_office", "label": "Paris Office", "category": "business", "desc": "Elegant Haussmann interior"},
            {"id": "pierre_doc", "label": "Contract", "category": "document", "desc": "Business contract on desk"},
        ],
    },
    "mom": {
        "images": [
            {"id": "mom_garden", "label": "Garden", "category": "pet", "desc": "Flower garden, roses, tulips"},
            {"id": "mom_recipe", "label": "Apple Pie", "category": "food", "desc": "Homemade pie, golden crust"},
            {"id": "mom_family_old", "label": "Old Photo", "category": "family", "desc": "Vintage family photo 1990s"},
            {"id": "mom_pet", "label": "Whiskers", "category": "pet", "desc": "Tabby cat on couch"},
            {"id": "mom_selfie", "label": "Mom Selfie", "category": "selfie", "desc": "Learning to take selfies!"},
        ],
        "voice": [{"id": "mom_voice_1", "duration": 12}],
    },
    "jake-son": {
        "images": [
            {"id": "jake_gaming", "label": "Gaming Setup", "category": "activity", "desc": "RGB PC, multiple monitors"},
            {"id": "jake_friends", "label": "Friends", "category": "selfie", "desc": "Group selfie, outdoor park"},
            {"id": "jake_soccer", "label": "Soccer", "category": "activity", "desc": "Action shot, kicking ball"},
            {"id": "jake_school", "label": "Project", "category": "family", "desc": "Science project, got an A"},
            {"id": "jake_selfie", "label": "New Haircut", "category": "selfie", "desc": "Headphones, bedroom"},
        ],
    },
    "dr-foster": {
        "images": [
            {"id": "dr_building", "label": "Medical Office", "category": "medical", "desc": "Healthcare facility exterior"},
            {"id": "dr_chart", "label": "Health Chart", "category": "medical", "desc": "Positive trend, good numbers"},
        ],
    },
    "chris-miller": {
        "images": [
            {"id": "chris_sports", "label": "Sports Bar", "category": "activity", "desc": "Football on multiple TVs"},
            {"id": "chris_bbq", "label": "BBQ", "category": "food", "desc": "Steaks on grill, smoke rising"},
            {"id": "chris_golf", "label": "Golf Course", "category": "activity", "desc": "Green fairway, sunny day"},
            {"id": "chris_selfie", "label": "Selfie", "category": "selfie", "desc": "Outdoors, sunglasses, weekend"},
            {"id": "chris_beer", "label": "Craft Beer", "category": "food", "desc": "Beer flight at brewery"},
        ],
        "voice": [{"id": "chris_voice_1", "duration": 6}],
    },
    "jennifer-lee": {
        "images": [
            {"id": "jennifer_meeting", "label": "Meeting", "category": "business", "desc": "Team collaboration, whiteboard"},
            {"id": "jennifer_coffee", "label": "Coffee Shop", "category": "food", "desc": "Laptop, latte art, working"},
            {"id": "jennifer_presentation", "label": "Presenting", "category": "business", "desc": "Giving presentation to team"},
            {"id": "jennifer_dashboard", "label": "Dashboard", "category": "document", "desc": "Project management charts"},
        ],
    },
    "alex-thompson": {
        "images": [
            {"id": "alex_gym", "label": "Gym Selfie", "category": "gym", "desc": "Workout clothes, gym equipment"},
            {"id": "alex_running", "label": "Running Trail", "category": "activity", "desc": "Morning run, park path"},
            {"id": "alex_protein", "label": "Protein Shake", "category": "gym", "desc": "Post-workout, shaker bottle"},
            {"id": "alex_tracker", "label": "Fitness Watch", "category": "gym", "desc": "New PR on smartwatch"},
            {"id": "alex_weights", "label": "Weights", "category": "gym", "desc": "Heavy dumbbells, gym rack"},
        ],
    },
    "maria-garcia": {
        "images": [
            {"id": "maria_clean", "label": "Organized", "category": "cleaning", "desc": "Clean closet, folded clothes"},
            {"id": "maria_supplies", "label": "Supplies", "category": "cleaning", "desc": "Cleaning products organized"},
            {"id": "maria_kitchen", "label": "Kitchen", "category": "cleaning", "desc": "Sparkling clean kitchen"},
        ],
    },
    # Group chats
    "house-sale-team": {
        "images": [
            {"id": "team_house", "label": "Dream House", "category": "house", "desc": "Beautiful house, sold sign"},
            {"id": "team_offer", "label": "Offer Doc", "category": "document", "desc": "Contract being signed"},
            {"id": "team_comp", "label": "Analysis", "category": "document", "desc": "Market comparison chart"},
        ],
    },
    "family-group": {
        "images": [
            {"id": "family_dinner", "label": "Family Dinner", "category": "family", "desc": "Multi-generational gathering"},
            {"id": "family_vacation", "label": "Vacation", "category": "travel", "desc": "Beach family photo, summer"},
            {"id": "family_jake_award", "label": "Jake's Award", "category": "family", "desc": "Award ceremony, proud family"},
            {"id": "family_holiday", "label": "Holiday", "category": "family", "desc": "Christmas gathering, tree"},
            {"id": "family_pet", "label": "Max", "category": "pet", "desc": "Golden retriever, backyard"},
        ],
    },
    "work-project-alpha": {
        "images": [
            {"id": "alpha_whiteboard", "label": "Strategy", "category": "business", "desc": "Whiteboard diagrams, brainstorm"},
            {"id": "alpha_team", "label": "Video Call", "category": "business", "desc": "Zoom meeting grid, remote work"},
            {"id": "alpha_chart", "label": "Timeline", "category": "document", "desc": "Gantt chart, milestones"},
            {"id": "alpha_celebration", "label": "Celebration", "category": "business", "desc": "Champagne toast, success"},
        ],
    },
    "jakes-school-parents": {
        "images": [
            {"id": "school_flyer", "label": "Fall Festival", "category": "document", "desc": "School event flyer, colorful"},
            {"id": "school_kids", "label": "Class Photo", "category": "family", "desc": "Group of school children"},
            {"id": "school_building", "label": "School", "category": "house", "desc": "School building exterior"},
            {"id": "school_fundraiser", "label": "Bake Sale", "category": "food", "desc": "Homemade treats table"},
        ],
    },
    "weekend-warriors": {
        "images": [
            {"id": "warriors_hike", "label": "Summit", "category": "activity", "desc": "Mountain trail, scenic view"},
            {"id": "warriors_camp", "label": "Camping", "category": "activity", "desc": "Tent under stars, campfire"},
            {"id": "warriors_group", "label": "The Crew", "category": "selfie", "desc": "Group friends selfie, outdoor"},
            {"id": "warriors_bbq", "label": "Party", "category": "food", "desc": "Backyard party, friends gathered"},
        ],
    },
    "neighborhood-watch": {
        "images": [
            {"id": "neighbor_street", "label": "Our Street", "category": "house", "desc": "Tree-lined suburban street"},
            {"id": "neighbor_event", "label": "Block Party", "category": "family", "desc": "Families gathered, street closed"},
            {"id": "neighbor_lost", "label": "Lost Dog", "category": "pet", "desc": "Lost pet poster, cute dog"},
            {"id": "neighbor_construction", "label": "Notice", "category": "document", "desc": "Road work ahead sign"},
        ],
    },
}


def create_placeholder_image(filepath: Path, label: str, category: str, desc: str, size=(400, 400)):
    """Create a styled placeholder image with text."""
    try:
        from PIL import Image, ImageDraw, ImageFont

        # Get colors for category
        colors = COLORS.get(category, ["#666666", "#888888", "#AAAAAA"])
        bg_color = random.choice(colors)

        # Create image
        img = Image.new("RGB", size, color=bg_color)
        draw = ImageDraw.Draw(img)

        # Try to load a font, fall back to default
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
        except Exception:
            try:
                font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
                font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
            except Exception:
                font_large = ImageFont.load_default()
                font_small = ImageFont.load_default()

        # Draw label (centered, top)
        text_color = "#FFFFFF" if sum(int(bg_color[i:i+2], 16) for i in (1, 3, 5)) < 400 else "#333333"

        # Draw a semi-transparent overlay for text area
        overlay = Image.new("RGBA", size, (0, 0, 0, 0))
        overlay_draw = ImageDraw.Draw(overlay)
        overlay_draw.rectangle([(0, size[1]//2 - 50), (size[0], size[1]//2 + 50)], fill=(0, 0, 0, 80))
        img.paste(Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB"))

        # Draw label
        draw = ImageDraw.Draw(img)
        bbox = draw.textbbox((0, 0), label, font=font_large)
        text_width = bbox[2] - bbox[0]
        draw.text(((size[0] - text_width) // 2, size[1]//2 - 30), label, fill=text_color, font=font_large)

        # Draw description (wrap if needed)
        words = desc.split()
        lines = []
        current_line = []
        for word in words:
            current_line.append(word)
            test_line = " ".join(current_line)
            bbox = draw.textbbox((0, 0), test_line, font=font_small)
            if bbox[2] - bbox[0] > size[0] - 40:
                current_line.pop()
                lines.append(" ".join(current_line))
                current_line = [word]
        if current_line:
            lines.append(" ".join(current_line))

        y = size[1]//2 + 5
        for line in lines[:2]:
            bbox = draw.textbbox((0, 0), line, font=font_small)
            text_width = bbox[2] - bbox[0]
            draw.text(((size[0] - text_width) // 2, y), line, fill=text_color, font=font_small)
            y += 18

        # Draw a small icon/indicator based on category
        icon_map = {
            "house": "🏠", "selfie": "📸", "business": "💼", "food": "🍽️",
            "family": "👨‍👩‍👧‍👦", "activity": "🏃", "travel": "✈️", "pet": "🐾",
            "document": "📄", "medical": "⚕️", "gym": "💪", "cleaning": "✨"
        }
        icon = icon_map.get(category, "📷")
        try:
            icon_font = ImageFont.truetype("/System/Library/Fonts/Apple Color Emoji.ttc", 28)
            draw.text((20, 20), icon, font=icon_font, embedded_color=True)
        except Exception:
            pass

        img.save(filepath, "JPEG", quality=85)
        return True

    except ImportError:
        # PIL not available - create a simple colored file
        print(f"  PIL not available, creating simple placeholder for {label}")
        # Create a minimal valid JPEG (just colored pixels)
        create_simple_placeholder(filepath, category)
        return True


def create_simple_placeholder(filepath: Path, category: str):
    """Create a very simple placeholder without PIL."""
    colors = COLORS.get(category, ["#888888"])
    color = colors[0].lstrip("#")
    r, g, b = int(color[0:2], 16), int(color[2:4], 16), int(color[4:6], 16)

    # Create a minimal BMP file (simpler than JPEG)
    width, height = 100, 100
    bmp_path = filepath.with_suffix(".bmp")

    # BMP header
    import struct

    row_size = ((width * 3 + 3) // 4) * 4
    pixel_array_size = row_size * height
    file_size = 54 + pixel_array_size

    with open(bmp_path, "wb") as f:
        # BMP header (14 bytes)
        f.write(b'BM')
        f.write(struct.pack('<I', file_size))
        f.write(struct.pack('<HH', 0, 0))
        f.write(struct.pack('<I', 54))

        # DIB header (40 bytes)
        f.write(struct.pack('<I', 40))
        f.write(struct.pack('<i', width))
        f.write(struct.pack('<i', height))
        f.write(struct.pack('<HH', 1, 24))
        f.write(struct.pack('<I', 0))
        f.write(struct.pack('<I', pixel_array_size))
        f.write(struct.pack('<i', 2835))
        f.write(struct.pack('<i', 2835))
        f.write(struct.pack('<I', 0))
        f.write(struct.pack('<I', 0))

        # Pixel data (BGR format)
        row = bytes([b, g, r] * width)
        padding = bytes(row_size - width * 3)
        for _ in range(height):
            f.write(row + padding)

    # Rename to .jpg (won't work in browser but placeholder exists)
    import shutil
    shutil.move(bmp_path, filepath)


def create_voice_placeholder(filepath: Path, duration: int):
    """Create a placeholder WAV file."""
    import struct
    import wave

    sample_rate = 22050
    num_samples = sample_rate * duration

    with wave.open(str(filepath), 'w') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)

        # Generate a simple sine wave at 440Hz
        import math
        for i in range(num_samples):
            # Simple tone with fade in/out
            t = i / sample_rate
            fade = min(t * 4, (duration - t) * 4, 1)  # Fade in/out
            value = int(10000 * fade * math.sin(2 * math.pi * 440 * t))
            wav.writeframes(struct.pack('<h', value))


def main():
    print("🎨 OBLIQ Demo - Media Generation Script")
    print("=" * 50)

    total_images = 0
    total_voice = 0

    for chat_id, media_data in CHAT_MEDIA.items():
        print(f"\n📁 Processing: {chat_id}")

        # Generate images
        for img in media_data.get("images", []):
            filepath = IMAGES_DIR / f"{img['id']}.jpg"
            if filepath.exists():
                print(f"   ✓ {img['id']}.jpg (exists)")
            else:
                success = create_placeholder_image(
                    filepath,
                    img["label"],
                    img["category"],
                    img["desc"]
                )
                if success:
                    print(f"   + {img['id']}.jpg")
                    total_images += 1

        # Generate voice notes
        for voice in media_data.get("voice", []):
            filepath = VOICE_DIR / f"{voice['id']}.wav"
            if filepath.exists():
                print(f"   ✓ {voice['id']}.wav (exists)")
            else:
                create_voice_placeholder(filepath, voice["duration"])
                print(f"   + {voice['id']}.wav ({voice['duration']}s)")
                total_voice += 1

    print("\n" + "=" * 50)
    print(f"✅ Generation complete!")
    print(f"   New images: {total_images}")
    print(f"   New voice notes: {total_voice}")
    print(f"\n   Output: {MEDIA_DIR}")


if __name__ == "__main__":
    main()
