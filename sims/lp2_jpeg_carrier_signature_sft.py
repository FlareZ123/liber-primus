#!/usr/bin/env python3
"""Original JPEG source-control gate for LP2 against known 2014 carriers.

Run against unmodified resources/liber-primus/00.jpg through 74.jpg.
The marker parser reads bytes without recompressing them.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

from lp2_jpeg_marker_audit import audit


def segments(record: dict, name: str) -> tuple[str, ...]:
    return tuple(
        item['payload_sha256']
        for item in record['markers']
        if item['name'] == name
    )


def components(record: dict) -> int:
    sof = [item for item in record['markers'] if item['name'] == 'SOF0']
    assert len(sof) == 1, record['file']
    return len(sof[0]['components'])


def main() -> None:
    base = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('resources/liber-primus')
    images = {n: audit(base / f'{n:02}.jpg') for n in range(75)}
    for n, record in images.items():
        assert record['error'] is None and record['scan_count'] == 1, n
        if n >= 17 or n in (3, 8):
            assert record['trailing_bytes'] == 0, n
    assert images[3]['sha256'] == 'b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f'
    assert images[8]['sha256'] == 'f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557'

    early, lp2 = range(17), range(17, 75)
    expected_gray = {33, 34, 35, 36, 37, 38, 41, 42, 45, 46, 47, 48,
                     58, 59, 60, 61, 62, 63, 64, 65, 67, 68, 69}
    gray = {n for n in lp2 if components(images[n]) == 1}
    rgb = {n for n in lp2 if components(images[n]) == 3}
    assert gray == expected_gray, (sorted(gray), sorted(expected_gray))
    assert len(rgb) == 35 and len(gray) == 23
    assert all(components(images[n]) == 3 for n in early)

    iccs = {segments(images[n], 'APP2') for n in lp2}
    assert len(iccs) == 1 and len(next(iter(iccs))) == 1
    assert all(not segments(images[n], 'APP2') for n in early)
    assert all(b'Artifex Software sRGB ICC Profile' in (base / f'{n:02}.jpg').read_bytes() for n in lp2)

    lp2_dqt = Counter(segments(images[n], 'DQT') for n in lp2)
    lp2_dht = Counter(segments(images[n], 'DHT') for n in lp2)
    assert sorted(lp2_dqt.values()) == [23, 35], lp2_dqt
    assert len(lp2_dht) == 58, lp2_dht
    positive_huffman = segments(images[8], 'DHT')
    assert segments(images[3], 'DHT') == positive_huffman
    matching_early = [n for n in early if segments(images[n], 'DHT') == positive_huffman]
    matching_lp2 = [n for n in lp2 if segments(images[n], 'DHT') == positive_huffman]
    assert matching_early == [0, 1, 2, 3, 8, 10, 11, 12, 13], matching_early
    assert matching_lp2 == [], matching_lp2

    result = {
        'input_count': len(images), 'lp2_count': len(lp2),
        'lp2_grayscale_archive_indices': sorted(gray),
        'lp2_color_count': len(rgb),
        'lp2_shared_icc_sha256': next(iter(iccs))[0],
        'lp2_distinct_dqt_profiles': len(lp2_dqt),
        'lp2_dqt_profile_counts': sorted(lp2_dqt.values()),
        'lp2_distinct_dht_profiles': len(lp2_dht),
        'lp1_known_outguess_carriers': [3, 8],
        'lp1_matching_known_carrier_dht': matching_early,
        'lp2_matching_known_carrier_dht': matching_lp2,
        'interpretation': 'No marker-level selector; shared Huffman templates cannot authenticate steganography.'
    }
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
