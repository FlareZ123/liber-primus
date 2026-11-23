#!/usr/bin/env python3
"""SFT: original-source gate for a putative p43–48 -> p51 72-line key.

Read-only, deterministic. Requires Pillow for exact visual-crop comparisons.
Run from any working directory with the source repository checked out.
"""
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "resources" / "liber-primus"
RUNES = set("ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ")
TEXT = (SOURCE / "lp2-transcription.txt").read_text(encoding="utf-8")
TRANSCRIPTION_PAGES = TEXT.split("%")
WINDOWS = [(8, 13), (16, 21), (41, 46), (42, 47), (43, 48)]
BOXES = {
    "left floral ornament and punctuation dots": (90, 650, 500, 2650),
    "right floral ornament and punctuation dots": (1900, 650, 2300, 2650),
}


def rune_lines(physical_page: int) -> list[str]:
    """Physical p50 is runeless; source omits it, so later indices shift by one."""
    if physical_page == 50:
        return []
    source_page = physical_page if physical_page < 50 else physical_page - 1
    return [
        line.strip()
        for line in TRANSCRIPTION_PAGES[source_page].splitlines()
        if any(rune in line for rune in RUNES)
    ]


def compare_ornament_crops() -> None:
    """Require pixel-for-pixel matches in nonempty original-image ornament crops."""
    for name, box in BOXES.items():
        with Image.open(SOURCE / "58.jpg") as original:
            baseline = original.convert("RGB").crop(box)
        assert ImageChops.difference(
            baseline, Image.new("RGB", baseline.size, "white")
        ).getbbox() is not None, f"{name}: empty/white control region"
        for image_number in range(59, 69):
            with Image.open(SOURCE / f"{image_number:02}.jpg") as source:
                candidate = source.convert("RGB").crop(box)
            assert ImageChops.difference(baseline, candidate).getbbox() is None, (
                f"{name} differs on {image_number:02}.jpg"
            )
        print(f"PASS {name}: original 58.jpg through 68.jpg identical pixels")


def main() -> None:
    assert len(RUNES) == 29
    counts = [len(rune_lines(page)) for page in range(56)]
    actual = [
        (first, first + 5)
        for first in range(51)
        if sum(counts[first:first + 6]) == 72
    ]
    assert actual == WINDOWS, f"Unanticipated 72-line physical spans: {actual}"
    for page in range(41, 49):
        assert counts[page] == 12
    endings = sum(
        line.removesuffix("/").endswith("-")
        for page in range(43, 49)
        for line in rune_lines(page)
    )
    assert endings == 10, f"Original 72-line word-end count changed: {endings}"
    print(f"PASS 72 lines across original p43–48; {endings} printed word-end wraps")
    print(f"PASS {72 - endings} of 72 line ends do not coincide with word boundaries")
    print(f"PASS all original six-page 72-line spans: {actual}")
    compare_ornament_crops()
    print("PASS source audit only: no decoding selector or plaintext is claimed")


if __name__ == "__main__":
    main()
