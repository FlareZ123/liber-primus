"""Original-JPEG/source-layout gate for Director issue #1728.

This audit uses only original LP2 page images, the canonical rune alphabet and
the physical transcription. It asks whether p28 visibly selects the exact
center-to-line-edge READ OUT object or its cube-layer operation. It does not
use any downstream p0/DH receiver, language score, MAP, ROAD, LEAD, or NEXT.

Python 3.12, NumPy and Pillow.
"""

from pathlib import Path
import json
import re

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "resources" / "liber-primus"

corpus = json.loads((RES / "lp2-corpus.json").read_text(encoding="utf-8"))
transcription = (RES / "lp2-transcription.txt").read_text(encoding="utf-8").replace("\r", "")
parts = transcription.split("%")[:55]
rune_index = {rune: i for i, rune in enumerate(corpus["runes"])}
rune_set = set(rune_index)


def physical_part(page: int) -> str:
    assert 0 <= page <= 55 and page != 50
    return parts[page if page <= 49 else page - 1]


def parse_words(source: str) -> list[list[int]]:
    words: list[list[int]] = []
    current: list[int] = []
    for char in source:
        if char in rune_set:
            current.append(rune_index[char])
        elif char == "/" or char.isspace():
            continue
        elif current:
            words.append(current)
            current = []
    if current:
        words.append(current)
    return words


def physical_lines(page: int) -> list[str]:
    return [line for line in physical_part(page).strip().split("/") if line.strip()]


def line_values(line: str) -> list[int]:
    return [rune_index[char] for char in line if char in rune_set]


def first_fragment(line: str) -> str:
    match = re.search(r"[\u16A0-\u16FF]+", line)
    if not match:
        return ""
    return "".join(corpus["translit"][rune_index[r]] for r in match.group(0))


def page_geometry(page: int) -> dict:
    source = physical_part(page)
    values = [rune_index[char] for char in source if char in rune_set]
    words = parse_words(source)

    offset = 0
    word_spans = []
    for number, word in enumerate(words, 1):
        row = {
            "number": number,
            "start": offset,
            "end": offset + len(word) - 1,
            "length": len(word),
        }
        word_spans.append(row)
        offset += len(word)
    assert offset == len(values)

    line_spans = []
    offset = 0
    for number, line in enumerate(physical_lines(page), 1):
        length = len(line_values(line))
        line_spans.append({
            "number": number,
            "start": offset,
            "end": offset + length - 1,
            "length": length,
        })
        offset += length
    assert offset == len(values)

    center = (len(values) - 1) / 2
    successor = next(
        (row for row in word_spans if row["start"] == center + 1),
        None,
    )
    predecessor = next(
        (row for row in word_spans if row["end"] == center),
        None,
    )
    center_line = next(
        (row for row in line_spans
         if row["start"] <= center <= row["end"]),
        None,
    )

    return {
        "page": page,
        "runes": len(values),
        "odd": len(values) % 2 == 1,
        "center": center,
        "word_count": len(words),
        "line_count": len(line_spans),
        "successor": successor,
        "predecessor": predecessor,
        "center_line": center_line,
        "values": values,
        "words": words,
    }


def line_bands(image: np.ndarray, left: int = 580, right: int = 1800) -> list[tuple[int, int, int]]:
    profile = np.count_nonzero(image[:, left:right] < 128, axis=1).astype(float)
    strong = profile[profile > 0.2 * profile.max()]
    threshold = 0.45 * np.median(strong)
    active = np.flatnonzero(profile > threshold)
    groups = np.split(active, np.where(np.diff(active) > 1)[0] + 1)
    return [
        (int(group[0]), int(group[-1]) + 1, int(profile[group].max()))
        for group in groups
        if group.size >= 40
    ]


def image_stats(page: int) -> dict:
    source = RES / f"{page + 17:02d}.jpg"
    original = Image.open(source)
    gray = np.asarray(original.convert("L"))
    bands = line_bands(gray)

    line_boxes = []
    for number, (y0, y1, _) in enumerate(bands, 1):
        ys, xs = np.where(gray[y0:y1, :] < 128)
        assert xs.size > 0
        line_boxes.append({
            "line": number,
            "y0": y0,
            "y1": y1,
            "height": y1 - y0,
            "xmin": int(xs.min()),
            "xmax": int(xs.max()),
            "width": int(xs.max() - xs.min() + 1),
        })

    margin_mask = np.zeros(gray.shape, dtype=bool)
    margin_mask[:, :500] = True
    margin_mask[:, 1900:] = True
    outside_dark = int(np.count_nonzero((gray < 128) & margin_mask))

    return {
        "mode": original.mode,
        "size": original.size,
        "bands": bands,
        "line_boxes": line_boxes,
        "outside_dark": outside_dark,
    }


geometries = [page_geometry(page) for page in range(56) if page != 50]
matched = [
    row for row in geometries
    if row["odd"] and row["successor"] is not None
]
assert [row["page"] for row in matched] == [3, 17, 25, 28]

matched_summary = []
for row in matched:
    center_line = row["center_line"]
    successor = row["successor"]
    assert center_line is not None and successor is not None
    reaches_same_line_edge = (
        successor["end"] == center_line["end"]
        and successor["start"] <= center_line["end"]
    )
    matched_summary.append({
        "page": row["page"],
        "runes": row["runes"],
        "center": row["center"],
        "center_line": center_line["number"],
        "center_line_length": center_line["length"],
        "successor_word": successor["number"],
        "successor_length": successor["length"],
        "successor_reaches_line_edge": reaches_same_line_edge,
    })

assert [row["page"] for row in matched_summary if row["successor_reaches_line_edge"]] == [28]

p28 = next(row for row in geometries if row["page"] == 28)
assert p28["runes"] == 269
assert p28["center"] == 134
assert p28["line_count"] == 12
assert p28["successor"] == {"number": 28, "start": 135, "end": 139, "length": 5}
assert p28["predecessor"] == {"number": 27, "start": 131, "end": 134, "length": 4}
assert p28["center_line"] == {"number": 6, "start": 117, "end": 139, "length": 23}

line6 = physical_lines(28)[5]
fragments = re.findall(r"[\u16A0-\u16FF]+", line6)
fragment_lengths = [len(fragment) for fragment in fragments]
fragment_text = [
    "".join(corpus["translit"][rune_index[r]] for r in fragment)
    for fragment in fragments
]
assert fragment_lengths == [2, 3, 9, 4, 5]
assert fragment_text[0] == "DH"

center_value = p28["values"][134]
assert corpus["translit"][center_value] == "N"
assert p28["values"].count(center_value) == 11
assert physical_part(28).count("-") == 56

dh_starts = []
physical_line_count = 0
for page in range(56):
    if page == 50:
        continue
    for line_number, line in enumerate(physical_lines(page), 1):
        physical_line_count += 1
        if first_fragment(line) == "DH":
            dh_starts.append((page, line_number))
assert physical_line_count == 604
assert dh_starts == [(28, 6)]

visual = {page: image_stats(page) for page in [3, 17, 25, 28]}
assert {page: visual[page]["mode"] for page in visual} == {
    3: "RGB",
    17: "L",
    25: "L",
    28: "L",
}
assert {page: visual[page]["outside_dark"] for page in visual} == {
    3: 79526,
    17: 0,
    25: 28232,
    28: 0,
}

p28_visual = visual[28]
assert len(p28_visual["bands"]) == 12
p28_boxes = p28_visual["line_boxes"]
line6_box = p28_boxes[5]
assert line6_box == {
    "line": 6,
    "y0": 1616,
    "y1": 1729,
    "height": 113,
    "xmin": 601,
    "xmax": 1757,
    "width": 1157,
}
starts = [box["y0"] for box in p28_boxes]
start_deltas = np.diff(starts).tolist()
assert min(start_deltas) == 185
assert max(start_deltas) == 190
assert starts[5] - starts[4] == 188
assert starts[6] - starts[5] == 187
widths = [box["width"] for box in p28_boxes]
assert min(widths) == 1138
assert max(widths) == 1193
assert line6_box["width"] not in (min(widths), max(widths))
assert line6_box["xmax"] not in (
    min(box["xmax"] for box in p28_boxes),
    max(box["xmax"] for box in p28_boxes),
)

print(json.dumps({
    "status": "PASS: p28 source pixels do not visibly select the READ OUT transform",
    "matched_center_boundary_pages": matched_summary,
    "p28_source_geometry": {
        "center_rune": {
            "index0": 134,
            "translit": corpus["translit"][center_value],
            "same_rune_page_count": 11,
        },
        "center_line": p28["center_line"],
        "successor_word": p28["successor"],
        "line6_fragment_lengths": fragment_lengths,
        "line6_first_fragment": fragment_text[0],
        "ordinary_hyphen_delimiters_on_page": physical_part(28).count("-"),
        "unique_DH_line_start": dh_starts,
    },
    "p28_original_pixel_controls": {
        "jpeg_mode": p28_visual["mode"],
        "margin_dark_pixels_outside_x500_1899": p28_visual["outside_dark"],
        "line6_box": line6_box,
        "line_start_delta_range": [min(start_deltas), max(start_deltas)],
        "line6_adjacent_start_deltas": [
            starts[5] - starts[4],
            starts[6] - starts[5],
        ],
        "line_width_range": [min(widths), max(widths)],
    },
    "matched_original_pixel_controls": {
        str(page): {
            "mode": visual[page]["mode"],
            "outside_dark": visual[page]["outside_dark"],
        }
        for page in visual
    },
    "decision": (
        "The counted center-to-right-edge geometry is source-real and uniquely "
        "forms a one-rune predecessor plus one complete successor word on p28. "
        "Line6 is independently recognizable by its unique DH start. The original "
        "pixels do not mark the center boundary or ray: the page is grayscale, "
        "has no marginal illustration, line6 spacing and width are ordinary, the "
        "center rune and delimiter repeat, and no visual nested/cubic/layer motif "
        "selects the frozen cube transform. Treat local appearance as a negative "
        "selector gate for READ OUT layering."
    ),
}, indent=2))
