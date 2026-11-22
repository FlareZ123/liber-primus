"""Read original LP2 glyphs with independent image templates.

Python 3.12+, Pillow, NumPy, OpenCV, scikit-learn.
Source-only segmentation and shape clustering. Only the independently solved
p56 labels the 29 font shapes. The other 56 unknown physical pages and solved
p57 are withheld until the source-image decoding is frozen. Read-only SFT.
"""
from __future__ import annotations

from collections import defaultdict, Counter
from pathlib import Path
import hashlib
import cv2
import numpy as np
from PIL import Image
from sklearn.cluster import DBSCAN

from lp2_round9_cc_line_recovery_sft import recover_rows

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / 'resources' / 'liber-primus'
RUNES = 'ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ'
ORDINAL = {c: i for i, c in enumerate(RUNES)}
# Frozen original-transcript FNV64 witnesses over only the independently
# image-count-exact lines of p0-49 and p51-55, in physical-page order.
# This expected output is never fed into image recognition or class naming.
EXPECTED_FNV = """b1a57d69f63e4e4f e48fd5fdb6c612ff f19eaec38bbfb8e8
de324fcc1098ac76 58c91d9b01ff96ad 8c48b820b06e19aa
dbac095e235afa47 43ccf5ad5ed35d6d 12d918b044e56795
4d63e8b06ccd67d4 7cfc71afe5775e9a 6ea0558747fce0c4
0763da4e4eb3e487 cd6be516b59dca1f 762cbf5096edcd8e
94c3a0b295c726ad 17b43a614de1280d e7ae9b0961b1e114
db506d00a294dcda 71be62d80cbb4f9f 47ecc6dfdec2b8d5
f4b6655667ec3d71 644ec6e7c8fb5602 fab1b3d09f9e3be1
2c692d19d4e4963b 274fc1b4ffd64325 f6c4f0c34f09d28a
55860f1913f2faf9 6ccd88230d14a356 da9a7225311ead12
8a0ad6147da50b89 51877f9771d315ae f209d813e1225892
9a7052dfe44574c9 c8153418c4a858ac c341e4d1c42df868
1278ed54f730a0e3 8b4fe38d46a8bf06 63306163dd072d3b
5a2b4a71b4a193f6 88a518ce454bbdb4 79228a37b4ee4325
ff7265dbde2afd70 ec4eda323698e314 778b237f96a79ce7
5c86329b6d889f15 f17910007c91e3ed bbe339c93fd186c4
be8c205e7dad1257 1349decf054637ba f77972d8d851a9b7
d5121abe922bdd85 29b806aab5b23e9c 1e2d86d48e515120
589f716607e8b0f7""".split()
assert len(EXPECTED_FNV) == 55


def rune_lines(section: str) -> list[str]:
    return [''.join(ch for ch in line if ch in ORDINAL)
            for line in section.split('/')
            if any(ch in ORDINAL for ch in line)]


def fnv64(text: str) -> str:
    h = 0xcbf29ce484222325
    for c in text:
        h = ((h ^ ORDINAL[c]) * 0x100000001b3) & ((1 << 64) - 1)
    return f'{h:016x}'


def main() -> None:
    # An unlabelled exact-source bitmap dictionary, with no transcription
    # touched. Group equal 8-connected glyph component bitmaps by content.
    images: dict[tuple, list[tuple[int, int, int]]] = defaultdict(list)
    masks: dict[tuple, np.ndarray] = {}
    geometry: dict[tuple[int, int], tuple] = {}
    for p in range(58):
        ink_image = np.asarray(
            Image.open(SOURCES / f'{p + 17:02d}.jpg').convert('L')
        )
        assert ink_image.shape == (3600, 2400)
        for li, (top, witnesses, left, right) in enumerate(
                recover_rows(ink_image)):
            geometry[p, li] = (top, witnesses, left, right)
            start = top - 8
            ink = np.ascontiguousarray(
                (ink_image[start:top + 125, 580:1820] < 128).astype(np.uint8)
            )
            _, _, stats, _ = cv2.connectedComponentsWithStats(
                ink, connectivity=8
            )
            for x, dy, width, height, area in stats[1:]:
                if not (108 <= height <= 120 and
                        6 <= width <= 130 and area >= 300):
                    continue
                mask = np.ascontiguousarray(ink[
                    dy:dy + height, x:x + width
                ])
                k = (int(height), int(width),
                     hashlib.blake2b(mask.tobytes(), digest_size=12).hexdigest())
                images[k].append((p, li, int(x + 580)))
                if k not in masks:
                    masks[k] = mask
    assert len(geometry) == 604
    assert len(images) == 855
    assert sum(map(len, images.values())) == 13042

    # Unsupervised native-image glyph classes; min_samples=1 means
    # each 0.03-cosine-distance connected shape family is one class.
    items = sorted(images.items(), key=lambda obj: -len(obj[1]))
    vectors = []
    for (height, width, _), _ in items:
        pass
    for key, _ in items:
        h, w, _ = key
        canvas = np.zeros((128, 136), np.uint8)
        y, x = (128 - h) // 2, (136 - w) // 2
        canvas[y:y + h, x:x + w] = masks[key]
        blur = cv2.GaussianBlur(canvas.astype(np.float32), (5, 5), 1)
        v = cv2.resize(blur, (68, 64),
                       interpolation=cv2.INTER_AREA).ravel()
        vectors.append(v / max(float(np.linalg.norm(v)), 1))
    matrix = np.asarray(vectors, dtype=np.float32)
    distance = np.clip(1 - matrix @ matrix.T, 0, 2)
    cluster = DBSCAN(eps=.03, min_samples=1,
                     metric='precomputed').fit_predict(distance)
    census = Counter()
    for (_, locs), c in zip(items, cluster):
        census[int(c)] += len(locs)
    common = {c for c, n in census.items() if n >= 100}
    assert len(census) == 48 and len(common) == 29
    assert sum(census[c] for c in common) == 12963
    bitmap_class = {key: int(c) if c in common else None
                    for (key, _), c in zip(items, cluster)}
    glyphs: dict[tuple[int, int], list[tuple[int, int | None]]] = defaultdict(list)
    for k, positions in images.items():
        for p, li, x in positions:
            glyphs[p, li].append((x, bitmap_class[k]))
    for g in glyphs.values():
        g.sort()

    # Only after fitting the 29 unlabeled classes do we read the transcript.
    # p56 is the solved calibration; p57 and p0-55 are blind controls.
    txt = (SOURCES / 'lp2-transcription.txt').read_text(encoding='utf8')
    sections = [s for s in txt.replace('\r\n', '\n').split('%') if s]
    assert len(sections) == 57
    known = {}
    for p in range(58):
        if p == 50:
            assert not any(a == 50 for a, _ in geometry)
            continue
        known[p] = rune_lines(sections[p if p < 50 else p - 1])
        assert len(known[p]) == sum(a == p for a, _ in geometry)
    assert sum(len(s) for ls in known.values() for s in ls) == 13136

    # p56 first illustrated red rune is not a regular component;
    # its remaining 19 shapes and the other four intact lines uniquely
    # name all 29 clusters without looking at unknown-page transcripts.
    votes: dict[int, set[str]] = defaultdict(set)
    for li, line in enumerate(known[56]):
        found = glyphs[56, li]
        expect = line[1:] if li == 0 else line
        assert len(found) == len(expect)
        for (_, c), r in zip(found, expect):
            assert c is not None
            votes[c].add(r)
    assert len(votes) == 29
    assert all(len(s) == 1 for s in votes.values())
    mapping = {c: next(iter(s)) for c, s in votes.items()}
    assert len(set(mapping.values())) == 29
    print('PASS: 29 unsupervised GP29 shapes named solely on solved p56')

    exact, runecount, missing, unmatched = 0, 0, 0, []
    fingerprints = []
    for p in range(58):
        if p == 50:
            continue
        page_exact = ''
        for li, target in enumerate(known[p]):
            predicted = ''.join(mapping.get(c, '?') for _, c in glyphs[p, li])
            complete = len(predicted) == len(target) and '?' not in predicted
            if p <= 55:
                if complete:
                    assert predicted == target, ('unknown original rune discrepancy',
                                                 p, li, predicted, target)
                    exact += 1
                    runecount += len(target)
                    page_exact += predicted
                else:
                    top, n, left, right = geometry[p, li]
                    unmatched.append((p, li, top, n, left, right,
                                      len(target), len(predicted),
                                      predicted.count('?')))
                    missing += len(target) - len(predicted)
            elif p == 57 and complete:
                assert predicted == target, ('withheld p57 mismatch', li)
        if p <= 55:
            fingerprints.append(fnv64(page_exact))
    assert fingerprints == EXPECTED_FNV
    assert (exact, runecount, len(unmatched), missing) == (511, 11132, 83, 90)
    print('PASS: 511/594 unknown source rows, all 11,132 independent rune'
          ' identities exactly match canonical input')
    print('PASS: all 55 independent page FNV64 witnesses agree')
    print('PASS: 83 remaining image segmentation rows, coordinates follow')
    for row in unmatched:
        print(*row, sep='\t')


if __name__ == '__main__':
    main()
