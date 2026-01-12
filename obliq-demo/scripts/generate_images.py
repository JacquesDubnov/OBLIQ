#!/usr/bin/env python3
"""
Avatar Image Generator for OBLIQ Demo

This script generates avatar images for all personas using an AI image generation API.
It reads personas from data/personas.json and creates images in client/public/avatars/

Requirements:
- Python 3.8+
- requests library (pip install requests)
- An image generation API key (e.g., DALL-E, Stable Diffusion, etc.)

Usage:
    python scripts/generate_images.py

Environment Variables:
    OPENAI_API_KEY - API key for OpenAI DALL-E (or your preferred provider)
"""

import json
import os
import sys
import hashlib
from pathlib import Path
from typing import Optional

# Try to import requests, provide helpful error if not installed
try:
    import requests
except ImportError:
    print("Error: requests library not installed.")
    print("Install with: pip install requests")
    sys.exit(1)

# Paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
PERSONAS_PATH = PROJECT_ROOT / "data" / "personas.json"
AVATARS_DIR = PROJECT_ROOT / "client" / "public" / "avatars"

# Default placeholder service (generates colored avatars based on name)
PLACEHOLDER_SERVICE = "https://ui-avatars.com/api/"


def load_personas() -> dict:
    """Load personas from JSON file."""
    with open(PERSONAS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_placeholder_avatar(name: str, persona_id: str) -> bytes:
    """
    Generate a simple placeholder avatar using ui-avatars.com
    This is a free service that generates letter-based avatars.
    """
    # Generate a consistent color based on the persona ID
    color_hash = hashlib.md5(persona_id.encode()).hexdigest()[:6]

    # Get initials (max 2 characters)
    initials = "".join([part[0].upper() for part in name.split()[:2]])

    params = {
        "name": initials,
        "size": 256,
        "background": color_hash,
        "color": "ffffff",
        "bold": "true",
        "format": "png",
    }

    response = requests.get(PLACEHOLDER_SERVICE, params=params, timeout=30)
    response.raise_for_status()
    return response.content


def generate_ai_avatar(prompt: str, api_key: str) -> Optional[bytes]:
    """
    Generate an AI avatar using OpenAI DALL-E.

    Args:
        prompt: The image generation prompt
        api_key: OpenAI API key

    Returns:
        Image bytes or None if generation fails
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    data = {
        "model": "dall-e-3",
        "prompt": f"Professional avatar photo: {prompt}. Style: clean, modern, suitable for messaging app profile picture. Square format, centered face.",
        "n": 1,
        "size": "1024x1024",
        "quality": "standard",
        "response_format": "url",
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers=headers,
            json=data,
            timeout=60,
        )
        response.raise_for_status()

        result = response.json()
        image_url = result["data"][0]["url"]

        # Download the image
        image_response = requests.get(image_url, timeout=30)
        image_response.raise_for_status()
        return image_response.content

    except Exception as e:
        print(f"  ⚠️ AI generation failed: {e}")
        return None


def save_avatar(persona_id: str, image_data: bytes) -> Path:
    """Save avatar image to disk."""
    avatar_path = AVATARS_DIR / f"{persona_id}.png"
    with open(avatar_path, "wb") as f:
        f.write(image_data)
    return avatar_path


def main():
    """Main function to generate all avatars."""
    print("🎨 OBLIQ Demo Avatar Generator")
    print("=" * 50)

    # Check for API key
    api_key = os.environ.get("OPENAI_API_KEY")
    use_ai = bool(api_key)

    if use_ai:
        print("✓ OpenAI API key found - using DALL-E for generation")
    else:
        print("ℹ️ No OPENAI_API_KEY found - using placeholder avatars")
        print("   Set OPENAI_API_KEY environment variable for AI-generated avatars")
    print()

    # Create avatars directory
    AVATARS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"📁 Output directory: {AVATARS_DIR}")
    print()

    # Load personas
    personas = load_personas()
    individuals = personas.get("individuals", [])
    groups = personas.get("groups", [])

    # Track additional contacts that need avatars
    additional_contacts = [
        {"id": "lisa-parent", "name": "Lisa (Parent)", "image_prompt": "Friendly mom, 40s, casual, warm smile"},
        {"id": "tom-parent", "name": "Tom (Parent)", "image_prompt": "Friendly dad, 40s, casual, approachable"},
        {"id": "mike-weekend", "name": "Mike", "image_prompt": "Athletic man, 35, casual sporty look, friendly"},
        {"id": "helen-neighbor", "name": "Helen", "image_prompt": "Community-minded woman, 55, friendly, warm"},
        {"id": "dave-neighbor", "name": "Dave", "image_prompt": "Friendly neighbor, 50, casual, likes grilling"},
        {"id": "karen-neighbor", "name": "Karen", "image_prompt": "Garden-loving woman, 48, kind, outdoor lover"},
    ]

    all_personas = individuals + additional_contacts

    print(f"👤 Generating {len(all_personas)} individual avatars...")
    print()

    for i, persona in enumerate(all_personas, 1):
        persona_id = persona["id"]
        name = persona["name"]
        prompt = persona.get("image_prompt", f"Professional headshot of {name}")

        print(f"[{i}/{len(all_personas)}] {name} ({persona_id})")

        # Check if avatar already exists
        existing_path = AVATARS_DIR / f"{persona_id}.png"
        if existing_path.exists():
            print(f"  ⏭️ Avatar already exists, skipping")
            continue

        # Generate avatar
        image_data = None
        if use_ai:
            print(f"  🤖 Generating with DALL-E...")
            image_data = generate_ai_avatar(prompt, api_key)

        if image_data is None:
            print(f"  📝 Using placeholder avatar...")
            image_data = generate_placeholder_avatar(name, persona_id)

        # Save avatar
        save_path = save_avatar(persona_id, image_data)
        print(f"  ✓ Saved to {save_path.name}")

    print()
    print(f"👥 Generating {len(groups)} group avatars...")
    print()

    for i, group in enumerate(groups, 1):
        group_id = group["id"]
        name = group["name"]

        print(f"[{i}/{len(groups)}] {name} ({group_id})")

        # Check if avatar already exists
        existing_path = AVATARS_DIR / f"{group_id}.png"
        if existing_path.exists():
            print(f"  ⏭️ Avatar already exists, skipping")
            continue

        # For groups, always use placeholder (colored icon)
        print(f"  📝 Using placeholder avatar...")
        image_data = generate_placeholder_avatar(name, group_id)

        # Save avatar
        save_path = save_avatar(group_id, image_data)
        print(f"  ✓ Saved to {save_path.name}")

    print()
    print("=" * 50)
    print("✅ Avatar generation complete!")
    print(f"   Avatars saved to: {AVATARS_DIR}")


if __name__ == "__main__":
    main()
