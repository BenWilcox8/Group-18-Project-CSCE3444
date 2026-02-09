"""
Generate Majors / Minors / Certificates JSON from the UNT catalog.

Currently implemented:
- majors.json (Undergraduate)

Index page (category lists):
  https://catalog.unt.edu/content.php?catoid=37&navoid=4292
Program pages:
  https://catalog.unt.edu/preview_program.php?catoid=37&poid=...

Notes:
- This scraper is intentionally small + readable (CSCE 3444 project).
- It is designed so you can reuse the same functions later for Minors/Certificates.
- We explicitly stop parsing when we hit the "Four-year degree plan" heading (and ignore everything after).
"""

from __future__ import annotations

import asyncio
import csv
import json
import os
import re
from dataclasses import dataclass
from typing import Any, Iterable
from urllib.parse import parse_qs, urlencode, urljoin, urlparse, urlunparse

try:
    import aiohttp  # type: ignore
except Exception:  # pragma: no cover
    aiohttp = None  # type: ignore

try:
    from bs4 import BeautifulSoup, Tag  # type: ignore
except Exception:  # pragma: no cover
    BeautifulSoup = None  # type: ignore
    Tag = None  # type: ignore

try:
    # tqdm.asyncio.tqdm has a convenient gather() helper.
    from tqdm.asyncio import tqdm as async_tqdm
except Exception:  # pragma: no cover
    async_tqdm = None

# ----------------------------
# Configuration
# ----------------------------

INDEX_URL = "https://catalog.unt.edu/content.php?catoid=37&navoid=4292"

OUTPUT_FILENAME_BY_CATEGORY = {
    "Major": "majors.json",
    "Minor": "minors.json",
    "Certificate": "certificates.json",
}

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}

MAX_CONCURRENT_REQUESTS = 12
REQUEST_DELAY_SECONDS = 0.20
REQUEST_TIMEOUT_SECONDS = 30
RETRIES = 3

STOP_HEADING_PREFIX = "four-year degree plan"

# ----------------------------
# Testing helper
# ----------------------------
# Set to an integer (e.g. 10) to only scrape the first N majors for quicker test runs.
# Set to None to scrape all majors.
MAJOR_SCRAPE_LIMIT: int | None = 10

# ----------------------------
# Optional: extra majors to scrape (manual testing)
# ----------------------------
# Paste any program URLs here to force-include them in the scrape, even if they
# don't appear in the first N majors chosen by MAJOR_SCRAPE_LIMIT.
#
# Example:
#   "https://catalog.unt.edu/preview_program.php?catoid=37&poid=18980"
EXTRA_MAJOR_URLS: list[str] = []

def require_dependencies() -> None:
    missing: list[str] = []
    if aiohttp is None:
        missing.append("aiohttp")
    if BeautifulSoup is None:
        missing.append("beautifulsoup4")
    # tqdm is optional; we can run without it.
    if missing:
        req_path = os.path.join(os.path.dirname(__file__), "requirements.txt")
        raise SystemExit(
            "Missing dependencies: "
            + ", ".join(missing)
            + f"\nInstall with: python3 -m pip install -r {req_path}"
        )


def clean_text(text: str) -> str:
    """Normalize whitespace and common weird spacing."""
    return re.sub(r"\s+", " ", (text or "").replace("\xa0", " ")).strip()


def normalize_heading(text: str) -> str:
    return clean_text(text).lower()


def strip_returnto(url: str) -> str:
    """
    Remove any 'returnto' query param from a URL.

    This covers the case where URLs include `&returnto=4292` (or similar) and ensures
    our saved links are stable/clean.
    """
    parsed = urlparse(url)
    qs = parse_qs(parsed.query, keep_blank_values=True)
    if "returnto" not in qs:
        return url
    qs.pop("returnto", None)
    return urlunparse(parsed._replace(query=urlencode(qs, doseq=True)))


def course_url_from_onclick(onclick: str | None) -> str | None:
    """
    Build a preview_course_nopop URL from onclick="showCourse('catoid','coid',...)"

    showCourse() format (as seen on UNT pages):
      showCourse('37', '170683', this, '...')

    Result:
      https://catalog.unt.edu/preview_course_nopop.php?catoid=37&coid=170683
    """
    if not onclick:
        return None
    m = re.search(
        r"showCourse\(\s*['\"](?P<catoid>\d+)['\"]\s*,\s*['\"](?P<coid>\d+)['\"]",
        onclick,
        flags=re.I,
    )
    if not m:
        return None
    catoid = m.group("catoid")
    coid = m.group("coid")
    return f"https://catalog.unt.edu/preview_course_nopop.php?catoid={catoid}&coid={coid}"


def ensure_abs_url(base_url: str, href: str | None) -> str | None:
    if not href:
        return None
    href = href.strip()
    if not href or href == "#":
        return None
    return strip_returnto(urljoin(base_url, href))


def poid_suffix(url: str) -> str | None:
    """Return a stable suffix like '(18528)' when poid=... is present."""
    try:
        qs = parse_qs(urlparse(url).query)
        poid = (qs.get("poid") or [None])[0]
        return f"({poid})" if poid else None
    except Exception:
        return None


def unique_program_key(existing: dict[str, Any], name: str, url: str) -> str:
    """Key by name, but handle duplicates with a stable suffix."""
    if name not in existing:
        return name
    suffix = poid_suffix(url)
    if suffix:
        candidate = f"{name} {suffix}"
        if candidate not in existing:
            return candidate
    i = 2
    while True:
        candidate = f"{name} ({i})"
        if candidate not in existing:
            return candidate
        i += 1


@dataclass(frozen=True)
class ProgramLink:
    name: str
    url: str


def find_category_ul(index_soup: BeautifulSoup, category_label: str) -> Tag | None:
    """
    Find the <ul class="program-list"> associated with a category label.

    The catalog page typically has a label like "Major"/"Minor"/"Certificate"
    immediately followed by a <ul> list of programs. We search flexibly.
    """
    label_norm = category_label.strip().lower()
    aliases = {label_norm}
    if label_norm.endswith("s"):
        aliases.add(label_norm[:-1])
    else:
        aliases.add(label_norm + "s")

    # Try common patterns first: <p><strong>Majors</strong></p> then <ul class="program-list">
    for strong in index_soup.find_all("strong"):
        if normalize_heading(strong.get_text()) in aliases:
            p = strong.find_parent(["p", "div", "td"])
            if not p:
                continue
            ul = p.find_next("ul", class_="program-list")
            if ul:
                return ul

    # Fallback: any element with exact label text, then next program-list ul.
    for el in index_soup.find_all(["p", "div", "span", "td"]):
        if normalize_heading(el.get_text()) in aliases:
            ul = el.find_next("ul", class_="program-list")
            if ul:
                return ul
    return None


def get_program_links(index_html: str, category_label: str, base_url: str) -> list[ProgramLink]:
    """Extract (name, url) pairs from the index page for a given category."""
    soup = BeautifulSoup(index_html, "html.parser")
    ul = find_category_ul(soup, category_label)
    if not ul:
        raise RuntimeError(f"Could not find program list for category '{category_label}'.")

    links: list[ProgramLink] = []
    for a in ul.find_all("a", href=True):
        name = clean_text(a.get_text())
        url = ensure_abs_url(base_url, a.get("href"))
        if not name or not url:
            continue
        links.append(ProgramLink(name=name, url=url))
    return links


def main_content_container(soup: BeautifulSoup) -> Tag:
    """
    Pick a container that mostly includes the program content (not nav/headers).
    We keep a few fallbacks because the catalog HTML can change.
    """
    # On UNT catalog pages, id="acalog-content" is commonly on the H1 program title,
    # not a wrapper div. Treat it as an *anchor* and climb to the real content.
    anchor = soup.find(id="acalog-content")
    if isinstance(anchor, Tag):
        # Best: the main content cell.
        td = anchor.find_parent("td", class_="block_content")
        if isinstance(td, Tag):
            return td
        # Otherwise, use a parent container (still better than the H1 itself).
        if isinstance(anchor.parent, Tag):
            return anchor.parent

    for selector in ("td.block_content", "div#content", "body"):
        node = soup.select_one(selector)
        if isinstance(node, Tag):
            return node
    return soup.body or soup  # type: ignore[return-value]


def new_section(title: str, level: int) -> dict[str, Any]:
    return {
        "title": title,
        "level": level,
        "hours": None,  # inferred int hours, when detectable
        "paragraphs": [],
        "lists": [],  # each list is [{"text": ..., "href"?: ...}, ...]
        "subsections": [],
    }


def add_list_from_tag(section: dict[str, Any], list_tag: Tag, base_url: str) -> None:
    items: list[dict[str, str]] = []
    for li in list_tag.find_all("li", recursive=False):
        # If a list item contains a link, keep href when meaningful.
        a = li.find("a", href=True)
        text = clean_text(li.get_text(" ", strip=True))
        if not text:
            continue
        item: dict[str, str] = {"text": text}

        # Course list items (li.acalog-course) typically have href="#", but include
        # onclick="showCourse('catoid','coid',...)" which we can convert into a stable URL.
        if a:
            onclick = a.get("onclick") or a.get("onClick")
            is_course = "acalog-course" in (li.get("class") or []) or (
                isinstance(onclick, str) and "showCourse" in onclick
            )
            if is_course:
                course_url = course_url_from_onclick(onclick if isinstance(onclick, str) else None)
                if course_url:
                    item["href"] = course_url
            else:
                href = ensure_abs_url(base_url, a.get("href"))
                if href:
                    item["href"] = href

        items.append(item)
    if items:
        section["lists"].append(items)


HOURS_PATTERNS: list[re.Pattern[str]] = [
    # Common: "48 hours", "46 semester hours", "3 advanced hours", "15 additional hours"
    re.compile(
        r"\b(?P<hours>\d{1,3})\s+(?:(?:total|additional|advanced|upper-division|upper division|semester)\s+)?hours?\b",
        re.I,
    ),
    # "at least 48 hours"
    re.compile(r"\bat\s+least\s+(?P<hours>\d{1,3})\s+hours?\b", re.I),
    # "minimum of 46 semester hours"
    re.compile(r"\bminimum\s+of\s+(?P<hours>\d{1,3})\s+(?:semester\s+)?hours?\b", re.I),
    # "Plus 3 hours ..."
    re.compile(r"\bplus\s+(?P<hours>\d{1,3})\s+hours?\b", re.I),
]


def extract_hours_from_text(text: str) -> list[int]:
    text = clean_text(text)
    out: list[int] = []
    for pat in HOURS_PATTERNS:
        for m in pat.finditer(text):
            try:
                out.append(int(m.group("hours")))
            except Exception:
                continue
    return out


def infer_section_hours(section: dict[str, Any]) -> tuple[int | None, list[int]]:
    """
    Infer a single hours value from a section title + paragraphs.

    Heuristic:
    - Prefer matches from the title.
    - Else, use matches from paragraphs (first match).
    - If multiple distinct values found, return None and list all candidates.
    """
    candidates: list[int] = []
    title_vals = extract_hours_from_text(str(section.get("title", "")))
    para_vals: list[int] = []
    for p in section.get("paragraphs", []) or []:
        para_vals.extend(extract_hours_from_text(str(p)))

    candidates.extend(title_vals)
    candidates.extend(para_vals)

    distinct = list(dict.fromkeys(candidates))  # stable unique
    if not distinct:
        return None, []
    if len(distinct) == 1:
        return distinct[0], distinct
    # Multiple values. If title has exactly one, prefer that (common for "X hours ..." titles).
    title_distinct = list(dict.fromkeys(title_vals))
    if len(title_distinct) == 1:
        return title_distinct[0], distinct
    return None, distinct


def section_contains_course_list(section: dict[str, Any]) -> bool:
    for lst in section.get("lists", []) or []:
        for item in lst or []:
            href = str(item.get("href", ""))
            if "preview_course_nopop.php" in href and "coid=" in href and "catoid=" in href:
                return True
    return False


def walk_sections(sections: list[dict[str, Any]], path: list[str] | None = None) -> Iterable[tuple[list[str], dict[str, Any]]]:
    path = path or []
    for sec in sections:
        title = str(sec.get("title", ""))
        cur_path = [*path, title] if title else path
        yield cur_path, sec
        subs = sec.get("subsections", []) or []
        if subs:
            yield from walk_sections(subs, cur_path)


def program_name_from_html(html: str) -> str | None:
    soup = BeautifulSoup(html, "html.parser")
    h1 = soup.find("h1", id="acalog-content")
    if isinstance(h1, Tag):
        name = clean_text(h1.get_text(" ", strip=True))
        return name or None
    return None


def apply_hours_and_collect_errors(
    *,
    program_name: str,
    program_url: str,
    sections: list[dict[str, Any]],
    errors: list[dict[str, str]],
) -> None:
    for sec_path, sec in walk_sections(sections):
        hours, candidates = infer_section_hours(sec)
        sec["hours"] = hours

        # Only require hours for sections that list course items (per user choice "a").
        if section_contains_course_list(sec) and hours is None:
            errors.append(
                {
                    "type": "missing_hours",
                    "program_name": program_name,
                    "program_url": program_url,
                    "section_path": " > ".join(sec_path),
                    "candidates": ",".join(str(x) for x in candidates) if candidates else "",
                    "message": "Could not infer required hours for a section that contains course list items.",
                }
            )
        elif section_contains_course_list(sec) and hours is not None and len(set(candidates)) > 1:
            errors.append(
                {
                    "type": "ambiguous_hours",
                    "program_name": program_name,
                    "program_url": program_url,
                    "section_path": " > ".join(sec_path),
                    "candidates": ",".join(str(x) for x in candidates),
                    "message": "Multiple hour values detected; heuristics chose one.",
                }
            )


def parse_program_page(html: str, program_url: str) -> list[dict[str, Any]]:
    """
    Parse a program page into a heading tree.

    We capture headings (h2-h6), paragraphs, and lists. We STOP entirely when we
    hit the 'Four-year degree plan' heading (and do not include it).
    """
    soup = BeautifulSoup(html, "html.parser")
    container = main_content_container(soup)

    root_sections: list[dict[str, Any]] = []
    # Stack of (heading_level, section_dict). level 1 is reserved.
    stack: list[tuple[int, dict[str, Any]]] = []

    def current_section() -> dict[str, Any] | None:
        return stack[-1][1] if stack else None

    def push_section(title: str, level: int) -> dict[str, Any]:
        sec = new_section(title=title, level=level)
        while stack and stack[-1][0] >= level:
            stack.pop()
        if stack:
            stack[-1][1]["subsections"].append(sec)
        else:
            root_sections.append(sec)
        stack.append((level, sec))
        return sec

    tags_of_interest = ["h2", "h3", "h4", "h5", "h6", "p", "ul", "ol"]
    for el in container.find_all(tags_of_interest):
        if not isinstance(el, Tag):
            continue

        if el.name and el.name.startswith("h"):
            title = clean_text(el.get_text(" ", strip=True))
            if not title:
                continue
            if normalize_heading(title).startswith(STOP_HEADING_PREFIX):
                break
            level = int(el.name[1])
            push_section(title=title, level=level)
            continue

        sec = current_section()
        if not sec:
            # If the page starts with text before a heading, create a default section.
            sec = push_section(title="Overview", level=2)

        if el.name == "p":
            txt = clean_text(el.get_text(" ", strip=True))
            if txt:
                sec["paragraphs"].append(txt)
        elif el.name in ("ul", "ol"):
            add_list_from_tag(sec, el, base_url=program_url)

    return root_sections


async def fetch_text(session: aiohttp.ClientSession, url: str, sem: asyncio.Semaphore) -> str:
    """Fetch a URL as text with concurrency limiting + small delay + retries."""
    async with sem:
        last_err: Exception | None = None
        for attempt in range(1, RETRIES + 1):
            try:
                await asyncio.sleep(REQUEST_DELAY_SECONDS)
                async with session.get(
                    url,
                    headers=HEADERS,
                    timeout=aiohttp.ClientTimeout(total=REQUEST_TIMEOUT_SECONDS),
                ) as resp:
                    resp.raise_for_status()
                    return await resp.text()
            except Exception as e:  # noqa: BLE001 - keep simple for a school project
                last_err = e
                # Small backoff
                await asyncio.sleep(0.5 * attempt)
        raise last_err or RuntimeError(f"Failed to fetch {url}")


async def scrape_category(index_url: str, category_label: str) -> dict[str, Any]:
    """
    Scrape a category (Major/Minor/Certificate) into the final JSON dict keyed by program name.
    """
    sem = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
    errors: list[dict[str, str]] = []
    async with aiohttp.ClientSession() as session:
        index_html = await fetch_text(session, index_url, sem)
        programs = get_program_links(index_html, category_label, base_url=index_url)
        if category_label == "Major" and MAJOR_SCRAPE_LIMIT is not None:
            programs = programs[: max(0, MAJOR_SCRAPE_LIMIT)]

        if category_label == "Major" and EXTRA_MAJOR_URLS:
            for url in EXTRA_MAJOR_URLS:
                abs_url = strip_returnto(url.strip())
                if abs_url:
                    programs.append(ProgramLink(name="", url=abs_url))

        async def fetch_and_parse(prog: ProgramLink) -> tuple[str, str, list[dict[str, Any]]]:
            try:
                html = await fetch_text(session, prog.url, sem)
                name = prog.name or (program_name_from_html(html) or prog.url)
                sections = parse_program_page(html, prog.url)
                apply_hours_and_collect_errors(
                    program_name=name,
                    program_url=prog.url,
                    sections=sections,
                    errors=errors,
                )
                return name, prog.url, sections
            except Exception as e:  # noqa: BLE001
                errors.append(
                    {
                        "type": "fetch_or_parse_error",
                        "program_name": prog.name or "",
                        "program_url": prog.url,
                        "section_path": "",
                        "candidates": "",
                        "message": f"{e.__class__.__name__}: {e}",
                    }
                )
                return prog.name or prog.url, prog.url, []

        tasks = [fetch_and_parse(p) for p in programs]
        if async_tqdm is not None:
            results = await async_tqdm.gather(*tasks, desc=f"Scraping {category_label}s", unit="program")
        else:  # pragma: no cover
            results = await asyncio.gather(*tasks)

    out: dict[str, Any] = {}
    for name, url, sections in results:
        key = unique_program_key(out, name, url)
        out[key] = {"url": url, "sections": sections}

    # Write errors.csv for debugging.
    errors_path = os.path.join(os.path.dirname(__file__), "errors.csv")
    with open(errors_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["type", "program_name", "program_url", "section_path", "candidates", "message"],
        )
        writer.writeheader()
        writer.writerows(errors)
    return out


def write_json(output_path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


async def main() -> None:
    require_dependencies()
    category = "Major"
    output_filename = OUTPUT_FILENAME_BY_CATEGORY[category]
    output_path = os.path.join(os.path.dirname(__file__), output_filename)

    data = await scrape_category(INDEX_URL, category_label=category)
    write_json(output_path, data)
    print(f"Wrote {len(data)} programs to {output_path}")


if __name__ == "__main__":
    if os.name == "nt":  # pragma: no cover
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
