#!/usr/bin/env python3
"""Read-only census of red square-dot punctuation across original Liber Primus JPEGs.

Usage: python sims/lp_stencil_cross_release.py resources/liber-primus
   or: python sims/lp_stencil_cross_release.py liber-primus-jpegs.zip

Source IDs are archive JPEG numbers 00..74, not LP2 physical-page numbers.
Requires numpy and opencv-python-headless. Does not modify source files.
"""
import hashlib
import json
import sys
from collections import defaultdict
from pathlib import Path
from zipfile import ZipFile

import cv2
import numpy as np


def scan_jpeg(data):
    bgr = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
    assert bgr is not None and bgr.shape[:2] == (3600, 2400)
    blue, green, red = cv2.split(bgr)
    mask = ((red > 85) & (red > green.astype(np.float32) * 1.4)
            & (red > blue.astype(np.float32) * 1.4) & (green < 130)).astype(np.uint8)
    n, _, stats, centers = cv2.connectedComponentsWithStats(mask)
    eligible = [i for i in range(1, n)
                if 7 <= stats[i, cv2.CC_STAT_WIDTH] <= 12
                and 7 <= stats[i, cv2.CC_STAT_HEIGHT] <= 12
                and 55 <= stats[i, cv2.CC_STAT_AREA] <= 120]
    dots = np.asarray([centers[i] for i in eligible], dtype=float).reshape(-1, 2)
    dot_widths = np.asarray([stats[i, cv2.CC_STAT_WIDTH] for i in eligible], dtype=int)
    dot_heights = np.asarray([stats[i, cv2.CC_STAT_HEIGHT] for i in eligible], dtype=int)
    remaining = set(range(len(dots)))
    shapes = []
    while remaining:
        stack = [remaining.pop()]
        members = []
        while stack:
            i = stack.pop()
            members.append(i)
            near = {j for j in remaining if np.linalg.norm(dots[i] - dots[j]) <= 31}
            remaining -= near
            stack.extend(near)
        if len(members) < 5:
            continue
        points = dots[members]
        widths = dot_widths[members]
        heights = dot_heights[members]
        minima = points.min(axis=0)
        maxima = points.max(axis=0)
        if maxima[0] - minima[0] > 90 or maxima[1] - minima[1] > 180:
            continue
        mask_grid = tuple(sorted((round((x - minima[0]) / 15), round((y - minima[1]) / 17))
                                 for x, y in points))
        shapes.append({'count': len(points), 'min_x': round(float(minima[0]), 2),
                       'min_y': round(float(minima[1]), 2),
                       'max_x': round(float(maxima[0]), 2),
                       'max_y': round(float(maxima[1]), 2),
                       'center_span_x': round(float(maxima[0] - minima[0]), 2),
                       'center_span_y': round(float(maxima[1] - minima[1]), 2),
                       'dot_width_range': [int(widths.min()), int(widths.max())],
                       'dot_height_range': [int(heights.min()), int(heights.max())],
                       'mask': mask_grid})
    return sorted(shapes, key=lambda s: (s['min_y'], s['min_x']))


def main(path):
    path = Path(path)
    archive = ZipFile(path) if path.suffix.lower() == '.zip' else None
    by_release = defaultdict(lambda: defaultdict(list))
    highlights = {}
    ten_dot_offsets = {53: (36, 99), 55: (38, 186), 66: (49, 66), 73: (56, 45)}
    ten_dot_occurrences = []
    expected_min_centers = {
        53: (978.0, 1456.5), 55: (605.0, 2545.0),
        66: (1695.5, 1080.5), 73: (1058.5, 1080.5),
    }
    expected_mask = ((0, 0), (0, 2), (0, 3), (1, 0), (1, 1),
                     (1, 2), (1, 3), (2, 0), (2, 2), (2, 3))
    for number in range(75):
        data = (archive.read(f'liber-primus-jpegs/{number:02}.jpg') if archive
                else (path / f'{number:02}.jpg').read_bytes())
        page = scan_jpeg(data)
        rel = 'LP1' if number < 17 else 'LP2'
        if number in ten_dot_offsets:
            matches = [g for g in page if g['count'] == 10]
            assert len(matches) == 1, (number, matches)
            glyph = matches[0]
            assert glyph['mask'] == expected_mask, (number, glyph['mask'])
            expected_x, expected_y = expected_min_centers[number]
            assert abs(glyph['min_x'] - expected_x) < 0.1
            assert abs(glyph['min_y'] - expected_y) < 0.1
            physical_page, rune_offset = ten_dot_offsets[number]
            ten_dot_occurrences.append({
                'physical_page': physical_page, 'archive_jpeg': f'{number:02}.jpg',
                'rune_offset_after': rune_offset, 'dot_count': glyph['count'],
                'occupancy': '###/.#./###/###',
                'min_center': [glyph['min_x'], glyph['min_y']],
                'max_center': [glyph['max_x'], glyph['max_y']],
                'center_span': [glyph['center_span_x'], glyph['center_span_y']],
                'dot_width_range': glyph['dot_width_range'],
                'dot_height_range': glyph['dot_height_range'],
            })
        for glyph in page:
            sig = '/'.join(''.join('#' if (x, y) in glyph['mask'] else '.' for x in range(max(p[0] for p in glyph['mask'])+1))
                           for y in range(max(p[1] for p in glyph['mask'])+1))
            by_release[rel][sig].append((number, glyph['min_x'], glyph['min_y']))
        if number in (5, 24, 53, 55, 66, 73):
            highlights[f'{number:02}.jpg'] = {
                'sha256': hashlib.sha256(data).hexdigest(),
                'source_coordinates': page,
            }
    summarized = {k: {sig: {'count': len(occ), 'locations': occ} for sig, occ in sorted(v.items())}
                  for k, v in by_release.items()}
    assert {k: v['count'] for k, v in summarized['LP1'].items()} == {
        '.#./###/###/###/.#.': 20, '###/.#./###/###': 9}, summarized['LP1']
    assert {k: v['count'] for k, v in summarized['LP2'].items()} == {
        '.#./###/###/###/###': 30, '###/.#./###/###': 4,
        '.###./#####/#####/#####/#####': 1}, summarized['LP2']
    assert [g['count'] for g in highlights['24.jpg']['source_coordinates']] == [13, 13]
    assert [g['count'] for g in highlights['73.jpg']['source_coordinates']] == [13, 10, 13]
    assert [x['physical_page'] for x in ten_dot_occurrences] == [36, 38, 49, 56]
    assert len(ten_dot_occurrences) == 4
    print(json.dumps({'release_groups': summarized, 'selected_original_images': highlights,
                      'lp2_ten_dot_occurrences': ten_dot_occurrences}, indent=2))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'resources/liber-primus')
