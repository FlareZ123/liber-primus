"""Original-image JPEG ancillary-carrier census for all 58 LP2 pages.

Read-only, standard-library single-file test for repository-local originals.
"""
from collections import Counter
from hashlib import sha256
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / 'resources' / 'liber-primus'
EXPECTED_PROFILE_SHA256 = '942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0'
EXPECTED_APP0_SHA256 = 'fb259e3d53dc86ac12d161aef88d442454ba017b260166043144cf2378b74f1e'


def markers(data: bytes) -> list[tuple[int, bytes]]:
    assert data.startswith(b'\xff\xd8'), 'Missing JPEG start-of-image'
    result: list[tuple[int, bytes]] = []
    pos = 2
    while pos < len(data):
        assert data[pos] == 255, f'Missing marker at offset {pos}'
        while data[pos] == 255:
            pos += 1
        marker = data[pos]
        pos += 1
        if marker == 0xDA:
            return result
        assert marker not in (0xD8, 0xD9) and not 0xD0 <= marker <= 0xD7
        size = int.from_bytes(data[pos:pos + 2], 'big')
        assert size >= 2 and pos + size <= len(data)
        result.append((marker, data[pos + 2:pos + size]))
        pos += size
    raise AssertionError('Missing start-of-scan marker')


def inspect_lp2() -> None:
    image_components: Counter[int] = Counter()
    profiles: set[bytes] = set()
    app0s: set[bytes] = set()
    for scan in range(17, 75):
        name = SOURCE / f'{scan:02d}.jpg'
        data = name.read_bytes()
        assert data.endswith(b'\xff\xd9'), f'{name} has bytes beyond JPEG EOI'
        entries = markers(data)
        auxiliary = [(tag, payload) for tag, payload in entries if 0xE0 <= tag <= 0xEF or tag == 0xFE]
        assert [tag for tag, _ in auxiliary] == [0xE0, 0xE2], f'{name}: unexpected JPEG metadata markers'
        app0, app2 = auxiliary[0][1], auxiliary[1][1]
        assert app0.startswith(b'JFIF\x00')
        assert app2.startswith(b'ICC_PROFILE\x00\x01\x01')
        profile = app2[14:]
        assert len(profile) == 2576 and sha256(profile).hexdigest() == EXPECTED_PROFILE_SHA256
        assert sha256(app0).hexdigest() == EXPECTED_APP0_SHA256
        assert b'Artifex Software sRGB ICC Profile' in profile
        app0s.add(app0)
        profiles.add(profile)
        frames = [part for tag, part in entries if tag == 0xC0]
        assert len(frames) == 1
        frame = frames[0]
        assert (int.from_bytes(frame[1:3], 'big'), int.from_bytes(frame[3:5], 'big')) == (3600, 2400)
        image_components[frame[5]] += 1
    assert len(app0s) == len(profiles) == 1
    assert image_components == {1: 23, 3: 35}
    print('LP2 original JPEGs: 58/58, scans 17.jpg to 74.jpg, 2400x3600')
    print('Metadata markers: APP0 JFIF and identical APP2 stock Artifex ICC only')
    print('Identical ICC SHA256:', EXPECTED_PROFILE_SHA256)
    print('Grayscale files: 23; RGB files: 35')
    print('Zero LP2 EXIF/COM/other APP fields, zero trailing bytes')

    # A genuine first-book counterexample proves the trailer checker is discriminatory.
    first_book = (SOURCE / '05.jpg').read_bytes()
    eoi = first_book.rfind(b'\xff\xd9')
    assert eoi >= 0 and eoi + 2 < len(first_book)
    trailer = first_book[eoi + 2:]
    assert len(trailer) == 72700 and trailer[::-1] == first_book[:72700]
    print('LP1 positive control: 05.jpg contains a 72,700-byte reversed-prefix trailer')
    print('PASS: no independent LP2 JPEG auxiliary/trailer image channel')


if __name__ == '__main__':
    inspect_lp2()
