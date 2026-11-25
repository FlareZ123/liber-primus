"""Source-coordinate ambiguity witness for LP2 p22 (Director #2846).

Run with a path to the original JPEG archive or the directory of JPEGs.
Optionally supply an output PNG path for the annotated original page.
No language scoring, skeletonization, or path search is performed.
"""
from collections import Counter
from hashlib import sha256
from io import BytesIO
from pathlib import Path
import json
import sys
from zipfile import ZipFile
from PIL import Image, ImageDraw

P22_SHA = 'e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7'
# Manually annotated centers of the visible three transverse strokes. The
# pale junction interiors are intentional landmarks, not foreground seeds.
UPPER = [(726, 2263), (1010, 2270), (1500, 2270)]
JUNCTION = [(769, 2410), (1030, 2420), (1490, 2430)]
LOWER = [(810, 2552), (1060, 2580), (1488, 2580)]
SPINE_ENDS = [(640, 2440), (1730, 2465)]
# Coordinates of the last actual rune row, not the art. The row has twenty
# GP glyphs (canonical image-corrected source), plus small punctuation.
LAST_ROW = (570, 1680, 1800, 1805)
ROW_OFFSET = 111


def load_source(path):
    if path.is_dir():
        return (path / '39.jpg').read_bytes()
    with ZipFile(path) as z:
        names = [n for n in z.namelist() if Path(n).name == '39.jpg']
        assert len(names) == 1
        return z.read(names[0])


def spans(image):
    x0, y0, x1, y1 = LAST_ROW
    pixels = image.convert('L').load()
    xs = [x for x in range(x0, x1) if any(pixels[x, y] < 125 for y in range(y0, y1))]
    runs = []
    for x in xs:
        if not runs or runs[-1][1] + 1 != x:
            runs.append([x, x])
        else:
            runs[-1][1] = x
    # Fixed ordinary-glyph vs dot-run gap: on this row every full-width
    # glyph is >=33px and every punctuation island <=10px. No rune identity.
    assert all(b-a+1 <= 10 or b-a+1 >= 33 for a, b in runs)
    glyphs = [(a, b) for a, b in runs if b-a+1 >= 25]
    assert len(glyphs) == 20
    return glyphs


def addresses(glyphs, points):
    output = []
    for x, _ in points:
        hits = [ROW_OFFSET+i for i, (a, b) in enumerate(glyphs) if a <= x <= b]
        assert len(hits) == 1
        output.extend(hits)
    return output


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('resources/liber-primus')
    raw = load_source(path)
    assert sha256(raw).hexdigest() == P22_SHA
    source = Image.open(BytesIO(raw)).convert('RGB')
    assert source.size == (2400, 3600)
    glyphs = spans(source)
    groups = {'upper': UPPER, 'junction': JUNCTION, 'lower': LOWER}
    projection = {k: addresses(glyphs, v) for k, v in groups.items()}
    assert projection == {'upper': [113, 118, 128], 'junction': [114, 119, 128], 'lower': [115, 120, 128]}
    # Idealized visible stroke graph: one main spine, three transverse bars.
    # This is a manual human-level graph, not a pixel skeleton.
    spine = [SPINE_ENDS[0], *JUNCTION, SPINE_ENDS[1]]
    edges = list(zip(spine, spine[1:])) + list(zip(UPPER, JUNCTION)) + list(zip(JUNCTION, LOWER))
    degree = Counter(v for e in edges for v in e)
    assert Counter(degree.values()) == {1: 8, 4: 3}
    odd_vertices = sum(v % 2 for v in degree.values())
    assert odd_vertices == 8  # no edge-exact Euler trail, regardless of start
    result = {'page': 22, 'sha256': P22_SHA, 'manual_landmarks': groups,
              'spine_endpoints': SPINE_ENDS, 'last_row_crop': LAST_ROW,
              'last_row_glyph_x_intervals_inclusive': glyphs,
              'last_row_offset': ROW_OFFSET, 'projection_page_offsets': projection,
              'vertices': len(degree), 'edges': len(edges), 'odd_vertices': odd_vertices,
              'branch_visit_orders_even_with_fixed_spine_direction': 2**3}
    print(json.dumps(result, indent=2))
    if len(sys.argv) > 2:
        draw = ImageDraw.Draw(source)
        for a, b in edges:
            draw.line((a, b), fill='cyan', width=5)
        for (label, points), color in zip(groups.items(), ['blue', 'green', 'orange']):
            for (x, y), index in zip(points, projection[label]):
                draw.ellipse((x-9, y-9, x+9, y+9), outline=color, width=5)
                draw.line((x, y, x, LAST_ROW[3]), fill=color, width=3)
                draw.text((x+5, LAST_ROW[3]+12), str(index), fill=color, stroke_width=1)
        source.save(sys.argv[2])


if __name__ == '__main__':
    main()
