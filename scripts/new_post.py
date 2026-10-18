#!/usr/bin/env python3
"""
scripts/new_post.py — Academic Post Generator for adeemharis.github.io

Usage:
    python3 scripts/new_post.py "Your Article Title" --category "AI Security" --tags "Security, LLMs"
"""

import sys
import os
import re
import json
import argparse
from datetime import datetime

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def main():
    parser = argparse.ArgumentParser(description="Create a new academic article draft")
    parser.add_argument("title", help="Title of the article")
    parser.add_argument("--category", default="Research Notes", help="Category name")
    parser.add_argument("--tags", default="", help="Comma-separated tags")
    parser.add_argument("--reading-time", default="5 min read", help="Estimated reading time")

    args = parser.parse_args()

    slug = slugify(args.title)
    today = datetime.now()
    date_str = today.strftime("%Y-%m-%d")
    formatted_date = today.strftime("%B %d, %Y")

    tags = [t.strip() for t in args.tags.split(",") if t.strip()]
    if not tags:
        tags = [args.category]

    template_path = os.path.join("articles", "_template.html")
    target_path = os.path.join("articles", f"{slug}.html")
    json_path = os.path.join("articles", "articles.json")

    if not os.path.exists(template_path):
        print(f"Error: Template {template_path} not found.")
        sys.exit(1)

    if os.path.exists(target_path):
        print(f"Error: Target article {target_path} already exists.")
        sys.exit(1)

    with open(template_path, "r", encoding="utf-8") as f:
        template = f.read()

    lead = f"This is an introductory note exploring {args.title.lower()}."

    content = (
        template.replace("{{TITLE}}", args.title)
        .replace("{{SLUG}}", slug)
        .replace("{{EXCERPT}}", lead)
        .replace("{{DATE}}", date_str)
        .replace("{{FORMATTED_DATE}}", formatted_date)
        .replace("{{CATEGORY}}", args.category)
        .replace("{{READING_TIME}}", args.reading_time)
        .replace("{{LEAD_PARAGRAPH}}", lead)
    )

    with open(target_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✓ Created new article at: {target_path}")

    # Update articles.json if present
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                articles = json.load(f)
        except Exception:
            articles = []

        articles.insert(0, {
            "id": slug,
            "slug": slug,
            "title": args.title,
            "date": date_str,
            "category": args.category,
            "tags": tags,
            "readingTime": args.reading_time,
            "excerpt": lead,
            "url": f"articles/{slug}.html"
        })

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(articles, f, indent=2)

        print(f"✓ Added entry to: {json_path}")

    print("\nNext steps:")
    print(f"1. Open {target_path} to write your content.")
    print("2. Test locally using: python3 -m http.server 8000")
    print("3. Check http://localhost:8000/blogs.html")

if __name__ == "__main__":
    main()
