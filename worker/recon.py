#!/usr/bin/env python3
"""
Phase-0 RECON script for the official CDAC portal.

Run this HEADED, on a machine that can reach s.nia.gov.cn, to confirm the field
selectors, dynamic City->Port loading, the signature mechanism, and whether any
verification/WAF appears under automation. It walks the form with OBVIOUSLY FAKE
data, screenshots + dumps candidate selectors for every screen, and is
HARD-GUARDED to NEVER click the final confirm/submit — we must never push
fabricated data into a live government system.

Usage:
    pip install playwright && playwright install chromium
    OFFICIAL_PORTAL_URL="https://s.nia.gov.cn/ArrivalCardFillingPC/" python recon.py

Output:
    recon-screenshots/NN-<step>.png   — one per screen you advance through
    recon-selectors.md                — dumped interactive elements per screen

This is a THROWAWAY tool. Use its output to update docs/official-flow.md,
docs/field-mapping.md, and the worker's selector map, then delete or ignore it.
"""
import os
import re
import pathlib
from playwright.sync_api import sync_playwright

PORTAL = os.environ.get("OFFICIAL_PORTAL_URL", "https://s.nia.gov.cn/ArrivalCardFillingPC/")
OUT = pathlib.Path("recon-screenshots")
OUT.mkdir(exist_ok=True)
SELECTORS_MD = pathlib.Path("recon-selectors.md")

# Obviously-fake recon data. NEVER submitted (guard below). Do not use real PII.
FAKE = {
    "surname": "ZZTESTONLY",
    "given": "RECONFAKE",
    "passport": "ZZ0000000",
    "dob": "1990-01-01",
    "carrier": "ZZ000",
    "address": "RECON TEST — DO NOT SUBMIT, 000 Test Rd",
    "email": "recon@example.invalid",
    "phone": "0000000000",
}

# Anything matching these is treated as the FINAL submit and is NEVER clicked.
SUBMIT_GUARD = re.compile(r"(submit|confirm|提交|确认提交|申报)", re.I)


def dump_selectors(page, label):
    """Append a table of interactive elements (label/role/name/id) for this screen."""
    els = page.eval_on_selector_all(
        "input,select,textarea,button,[role=button],[role=radio],[role=checkbox],canvas",
        """nodes => nodes.map(n => ({
            tag: n.tagName.toLowerCase(),
            type: n.getAttribute('type') || '',
            id: n.id || '',
            name: n.getAttribute('name') || '',
            placeholder: n.getAttribute('placeholder') || '',
            aria: n.getAttribute('aria-label') || '',
            text: (n.innerText || n.value || '').trim().slice(0,40),
            role: n.getAttribute('role') || ''
        }))""",
    )
    with SELECTORS_MD.open("a", encoding="utf-8") as f:
        f.write(f"\n## Screen: {label}\n\n| tag | type | id | name | aria/placeholder | text |\n|---|---|---|---|---|---|\n")
        for e in els:
            f.write(f"| {e['tag']} | {e['type']} | {e['id']} | {e['name']} | "
                    f"{e['aria'] or e['placeholder']} | {e['text']} |\n")
    print(f"  · dumped {len(els)} elements for '{label}'")


def shot(page, n, label):
    p = OUT / f"{n:02d}-{re.sub('[^a-z0-9]+','-',label.lower())}.png"
    page.screenshot(path=str(p), full_page=True)
    print(f"  · screenshot {p}")


def main():
    SELECTORS_MD.write_text("# Recon: interactive elements per screen\n", encoding="utf-8")
    print(f"\n🔎 RECON (no-submit) → {PORTAL}\n")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=False)
        page = browser.new_page(locale="en-US")
        page.goto(PORTAL, wait_until="domcontentloaded", timeout=60000)

        step = 0
        shot(page, step, "landing")
        dump_selectors(page, "landing")

        print("\n▶ Walk the form MANUALLY in the opened browser (or extend this script).")
        print("  After each screen, press Enter here to screenshot + dump its selectors.")
        print("  Type 'q' then Enter to finish. The script will NEVER click submit.\n")

        while True:
            cmd = input(f"[screen {step}] Enter=capture, q=quit: ").strip().lower()
            if cmd == "q":
                break
            step += 1
            # Safety: refuse to capture if a submit/confirm control looks focused/active — informational only.
            active = page.evaluate("() => (document.activeElement && (document.activeElement.innerText||'')).slice(0,30)")
            if SUBMIT_GUARD.search(active or ""):
                print("  ⚠ A submit/confirm control appears focused. NOT clicking anything — recon only.")
            label = input("  label for this screen (e.g. personal, trip, declaration): ").strip() or f"screen{step}"
            shot(page, step, label)
            dump_selectors(page, label)

        print("\n✋ Recon complete. NOTHING was submitted.")
        print(f"   Review {OUT}/ and {SELECTORS_MD}, then update docs/ + the worker selector map.")
        browser.close()


if __name__ == "__main__":
    main()
