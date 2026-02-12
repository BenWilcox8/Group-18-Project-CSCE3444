#!/usr/bin/env python3
"""
Build a small JSON index for fast client-side lookup of course hours.

Input:
  public/data/courses.db (SQLite)

Output:
  public/data/courseHoursByMainCatalogId.json

Why:
  courses.db is large (~82MB) and not practical to load/query in the browser.
  This script produces a lightweight map the UI can fetch quickly.
"""

from __future__ import annotations

import json
import os
import sqlite3
from typing import Dict, Optional


def build_index(db_path: str) -> Dict[str, Optional[str]]:
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"courses.db not found: {db_path}")

    conn = sqlite3.connect(db_path)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT main_catalog_id, course_hours
            FROM AllCatalog
            WHERE main_catalog_id IS NOT NULL
            """
        )
        out: Dict[str, Optional[str]] = {}
        for main_catalog_id, course_hours in cur.fetchall():
            if main_catalog_id is None:
                continue
            key = str(int(main_catalog_id))
            # Keep the first value seen; later duplicates should be equivalent.
            out.setdefault(key, course_hours)
        return out
    finally:
        conn.close()


def main() -> None:
    repo_root = os.path.dirname(os.path.dirname(__file__))
    db_path = os.path.join(repo_root, "public", "data", "courses.db")
    out_path = os.path.join(repo_root, "public", "data", "courseHoursByMainCatalogId.json")

    index = build_index(db_path)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(index)} entries to {out_path}")


if __name__ == "__main__":
    main()

