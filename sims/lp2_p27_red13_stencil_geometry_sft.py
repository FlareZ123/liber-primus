"""Original-image and rune control for Director issue #1633.

Tests whether p27's 13-dot stencil has a distinctive 5-center/8-side geometry.
Reads only original LP2 JPEGs, canonical ink annotations, corpus and transcription.

Requires Pillow 12.3.0.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMAGE_DIR = ROOT / "resources" / "liber-primus"

# Fixed 49x98 source crops whose origins were locked from the original pixels
# before applying any GP arithmetic. Physical page p maps to JPEG p+17.
RED13_CROPS = {
    0: [(1400, 681)],
    2: [(1621, 2187)],
    3: [(1554, 681), (1351, 1623), (929, 2110)],
    6: [(738, 1246), (1326, 1733)],
    7: [(718, 2467), (1628, 2467)],
    14: [(992, 1811)],
    15: [(912, 681), (1435, 681), (1276, 1743)],
    22: [(1626, 1694)],
    23: [(1528, 1169)],
    26: [(1630, 2752)],
    27: [(1678, 925)],
    32: [(925, 1623)],
    33: [(1263, 681), (1442, 1434), (1136, 1922)],
    39: [(832, 1623), (940, 1866), (1535, 2808)],
    53: [(818, 2259)],
    54: [(1188, 925)],
    55: [(1030, 1246)],
    56: [(959, 681), (1553, 2085)],
    57: [(1135, 925)],
}
BLACK13_CROP = (7, 1683, 2223)
CROP_W = 49
CROP_H = 98


def red_pixel(pixel: tuple[int, int, int]) -> bool:
    """Source red-ink threshold, intentionally broad against JPEG variation."""
    r, g, b = pixel
    return (
        r > 120
        and 4 * r > 5 * g
        and 4 * r > 5 * b
        and r - g > 20
        and r - b > 20
    )


def dark_pixel(pixel: tuple[int, int, int]) -> bool:
    """Black-ink threshold for the one black p7 13-dot glyph."""
    r, g, b = pixel
    return round(0.299 * r + 0.587 * g + 0.114 * b) < 150


def component_centers(
    image: Image.Image,
    origin: tuple[int, int],
    predicate,
) -> list[tuple[float, float]]:
    """Return centroids of the 13 small square dot components in one crop."""
    ox, oy = origin
    crop = image.crop((ox, oy, ox + CROP_W, oy + CROP_H)).convert("RGB")
    active = [
        [predicate(crop.getpixel((x, y))) for x in range(CROP_W)]
        for y in range(CROP_H)
    ]
    seen = [[False] * CROP_W for _ in range(CROP_H)]
    centers: list[tuple[float, float]] = []

    for y0 in range(CROP_H):
        for x0 in range(CROP_W):
            if not active[y0][x0] or seen[y0][x0]:
                continue

            stack = [(x0, y0)]
            seen[y0][x0] = True
            points: list[tuple[int, int]] = []

            while stack:
                x, y = stack.pop()
                points.append((x, y))
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if (
                        0 <= nx < CROP_W
                        and 0 <= ny < CROP_H
                        and active[ny][nx]
                        and not seen[ny][nx]
                    ):
                        seen[ny][nx] = True
                        stack.append((nx, ny))

            xs = [x for x, _ in points]
            ys = [y for _, y in points]
            width = max(xs) - min(xs) + 1
            height = max(ys) - min(ys) + 1
            area = len(points)

            if 50 <= area <= 130 and 7 <= width <= 12 and 7 <= height <= 12:
                centers.append((sum(xs) / area, sum(ys) / area))

    assert len(centers) == 13
    return centers


def logical_groups(
    centers: list[tuple[float, float]],
) -> tuple[list[tuple[float, float]], list[tuple[float, float]], list[tuple[float, float]]]:
    """Split the printed glyph into center-five, left-four and right-four."""
    center = sorted((p for p in centers if 18 <= p[0] <= 30), key=lambda p: p[1])
    left = sorted((p for p in centers if p[0] < 18), key=lambda p: p[1])
    right = sorted((p for p in centers if p[0] > 30), key=lambda p: p[1])
    assert [len(center), len(left), len(right)] == [5, 4, 4]
    return center, left, right


def geometry_residual(
    reference,
    candidate,
) -> float:
    """Maximum dot-center residual after removing overall translation."""
    ref_points = [p for group in reference for p in group]
    cand_points = [p for group in candidate for p in group]
    ref_mean = (
        sum(x for x, _ in ref_points) / 13,
        sum(y for _, y in ref_points) / 13,
    )
    cand_mean = (
        sum(x for x, _ in cand_points) / 13,
        sum(y for _, y in cand_points) / 13,
    )

    residuals = []
    for ref_group, cand_group in zip(reference, candidate):
        for (rx, ry), (cx, cy) in zip(ref_group, cand_group):
            dx = (rx - ref_mean[0]) - (cx - cand_mean[0])
            dy = (ry - ref_mean[1]) - (cy - cand_mean[1])
            residuals.append(math.hypot(dx, dy))
    return max(residuals)


def is_prime(n: int) -> bool:
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True


def prime_rank(n: int) -> int | None:
    if not is_prime(n):
        return None
    return sum(is_prime(x) for x in range(2, n + 1))


def main() -> None:
    annotations = json.loads(
        (IMAGE_DIR / "lp2-ink-annotations.json").read_text(encoding="utf-8")
    )
    corpus = json.loads((IMAGE_DIR / "lp2-corpus.json").read_text(encoding="utf-8"))
    transcription = (IMAGE_DIR / "lp2-transcription.txt").read_text(encoding="utf-8")

    assert sum(len(v) for v in RED13_CROPS.values()) == 30
    assert annotations["counts"]["red13"] == 30
    assert annotations["counts"]["black13"] == 1

    # Pixel geometry census.
    p27_image = Image.open(IMAGE_DIR / "44.jpg").convert("RGB")
    reference = logical_groups(
        component_centers(p27_image, RED13_CROPS[27][0], red_pixel)
    )

    red_residuals = []
    for page, origins in RED13_CROPS.items():
        image = Image.open(IMAGE_DIR / f"{page + 17:02d}.jpg").convert("RGB")
        for origin in origins:
            groups = logical_groups(component_centers(image, origin, red_pixel))
            red_residuals.append(
                {"page": page, "origin": origin, "maxResidual": geometry_residual(reference, groups)}
            )

    black_page, black_x, black_y = BLACK13_CROP
    black_image = Image.open(IMAGE_DIR / f"{black_page + 17:02d}.jpg").convert("RGB")
    black_groups = logical_groups(
        component_centers(black_image, (black_x, black_y), dark_pixel)
    )
    black_residual = geometry_residual(reference, black_groups)

    assert len(red_residuals) == 30
    assert max(row["maxResidual"] for row in red_residuals) < 0.85
    assert black_residual < 0.65

    # Rune-side control. Reproduce p27's one-shed 13-rune survivor.
    rune_index = {rune: index for index, rune in enumerate(corpus["runes"])}
    raw_pages = transcription.split("%")

    def page_words(physical_page: int):
        source = raw_pages[physical_page if physical_page <= 49 else physical_page - 1]
        offset = 0
        start = -1
        current: list[int] = []
        words = []

        def flush() -> None:
            nonlocal current, start
            if current:
                words.append({"start": start, "end": offset, "inds": current})
                current = []
                start = -1

        for ch in source:
            if ch in rune_index:
                if not current:
                    start = offset
                current.append(rune_index[ch])
                offset += 1
            elif ch == "/" or ch.isspace():
                pass
            else:
                flush()
        flush()
        return words

    p27 = next(page for page in annotations["pages"] if page["page"] == 27)
    span = p27["red_spans"][0]
    heading_words = [
        word
        for word in page_words(27)
        if word["start"] >= span["start"]
        and word["end"] <= span["start"] + span["length"]
    ]
    assert [len(word["inds"]) for word in heading_words] == [3, 12, 4]
    survivor = [
        rune
        for word in heading_words
        for rune in word["inds"][1:-1]
    ]
    assert len(survivor) == 13

    # The printed top-to-bottom glyph has center positions 0,3,6,9,12.
    center_positions = [0, 3, 6, 9, 12]
    center = [survivor[i] for i in center_positions]
    sides = [rune for i, rune in enumerate(survivor) if i not in center_positions]
    center_index_sum = sum(center)
    side_index_sum = sum(sides)
    center_prime_sum = sum(corpus["prime"][rune] for rune in center)
    center_prime_ordinal = prime_rank(center_prime_sum)

    assert center_index_sum == 72
    assert side_index_sum == 115
    assert center_prime_sum == 257
    assert center_prime_ordinal == 55

    # Source-family control: among red spans followed immediately by red13,
    # only p27 yields a one-shed survivor of exactly 13 runes.
    adjacent_survivors = []
    for page in annotations["pages"]:
        words = page_words(page["page"])
        red13_offsets = {
            mark[0]
            for mark in page.get("large_punctuation", [])
            if mark[1] == 13 and mark[2] == "red"
        }
        for red_span in page.get("red_spans", []):
            if red_span["start"] + red_span["length"] not in red13_offsets:
                continue
            span_words = [
                word
                for word in words
                if word["start"] >= red_span["start"]
                and word["end"] <= red_span["start"] + red_span["length"]
            ]
            inner = [
                rune
                for word in span_words
                for rune in word["inds"][1:-1]
            ]
            if len(inner) == 13:
                c = [inner[i] for i in center_positions]
                s = [rune for i, rune in enumerate(inner) if i not in center_positions]
                cps = sum(corpus["prime"][rune] for rune in c)
                adjacent_survivors.append(
                    {
                        "page": page["page"],
                        "start": red_span["start"],
                        "centerIndex": sum(c),
                        "sideIndex": sum(s),
                        "centerPrimeRank": prime_rank(cps),
                    }
                )

    assert adjacent_survivors == [
        {
            "page": 27,
            "start": 0,
            "centerIndex": 72,
            "sideIndex": 115,
            "centerPrimeRank": 55,
        }
    ]

    # Broad comparison only: complete 13-rune words in p0-p55 under the same
    # fixed positional partition. This does not create a second source selector.
    unknown_source = "%".join(raw_pages[:55])
    complete_words: list[list[int]] = []
    current: list[int] = []

    def finish_complete() -> None:
        nonlocal current
        if current:
            complete_words.append(current)
            current = []

    for ch in unknown_source:
        if ch in rune_index:
            current.append(rune_index[ch])
        elif ch == "%" or ch == "/" or ch.isspace():
            pass
        else:
            finish_complete()
    finish_complete()

    assert len(complete_words) == 2896
    length13 = [word for word in complete_words if len(word) == 13]
    comparable_hits = []
    for word_index, word in enumerate(length13):
        c = [word[i] for i in center_positions]
        s = [rune for i, rune in enumerate(word) if i not in center_positions]
        cps = sum(corpus["prime"][rune] for rune in c)
        if sum(c) == 72 and sum(s) == 115 and prime_rank(cps) == 55:
            comparable_hits.append(word_index)

    print(json.dumps({
        "status": "PASS",
        "imageGeometry": {
            "red13Marks": len(red_residuals),
            "black13Marks": 1,
            "maxRedResidualPixels": max(row["maxResidual"] for row in red_residuals),
            "blackResidualPixels": black_residual,
            "shape": "5 center + 4 left + 4 right on every 13-dot glyph",
        },
        "p27": {
            "oneShedSurvivorRunes": 13,
            "fixedCenterPositions": center_positions,
            "centerIndexSum": center_index_sum,
            "sideIndexSum": side_index_sum,
            "centerPrimeSum": center_prime_sum,
            "centerPrimeOrdinal": center_prime_ordinal,
        },
        "sourceCompatibleAdjacentSurvivors": adjacent_survivors,
        "completeLength13WordControl": {
            "count": len(length13),
            "jointHitsUnderSamePartition": comparable_hits,
        },
        "decision": (
            "The p27 arithmetic is selective because p27 alone supplies the "
            "one-shed 13-rune adjacent object. The 5/8 stencil geometry itself "
            "is generic: all 31 original 13-dot marks use the same layout. "
            "Therefore the artwork does not independently select p27's 5+8 split."
        ),
    }, indent=2))


if __name__ == "__main__":
    main()
