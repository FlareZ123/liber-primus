"""Original LP1 known-carrier / LP2 JPEG DQT + ICC source control.

Run from repository root; pass a ZIP of original images as an optional argument.
All parsing uses the original JPEG marker bytes before entropy-coded data.
"""

from collections import defaultdict
import hashlib
from pathlib import Path
import sys
import zipfile

# Pages 00-16 in the supplied 75-image sequence are LP1.
# These nine LP1 pages have documented default OutGuess payloads.
LP1_HISTORICAL_CARRIERS = frozenset((0, 1, 2, 3, 8, 10, 11, 12, 13))


def features(source: bytes) -> tuple[str, int, int, str | None]:
    if source[:2] != b"\xff\xd8":
        raise ValueError("missing JPEG SOI")
    pos = 2
    qt: dict[int, tuple[int, bytes]] = {}
    components: int | None = None
    icc_chunks: dict[int, bytes] = {}
    while pos < len(source):
        if source[pos] != 0xff:
            raise ValueError(f"nonmarker byte at {pos}")
        while source[pos] == 0xff:
            pos += 1
        marker = source[pos]
        pos += 1
        if marker in (0xd9, 0xda):
            break  # EOI or SOS: DQT and ICC metadata are in the header.
        if marker in (0x01, 0xd8) or 0xd0 <= marker <= 0xd7:
            continue
        size = int.from_bytes(source[pos:pos + 2], "big")
        pos += 2
        segment = source[pos:pos + size - 2]
        pos += size - 2
        if marker == 0xdb:
            offset = 0
            while offset < len(segment):
                identity = segment[offset]
                offset += 1
                precision = identity >> 4
                if precision not in (0, 1):
                    raise ValueError("bad JPEG DQT precision")
                width = 64 * (precision + 1)
                qt[identity & 15] = (precision, segment[offset:offset + width])
                offset += width
        elif marker in (0xc0, 0xc1, 0xc2, 0xc3):
            components = segment[5]
        elif marker == 0xe2 and segment.startswith(b"ICC_PROFILE\x00"):
            icc_chunks[segment[12]] = segment[14:]
    if components is None or not qt:
        raise ValueError("missing JPEG SOF or quantization tables")
    tables = b"".join(bytes((i, p)) + raw for i, (p, raw) in sorted(qt.items()))
    q_digest = hashlib.sha256(tables).hexdigest()[:12]
    icc = b"".join(icc_chunks[k] for k in sorted(icc_chunks))
    return q_digest, components, len(icc), hashlib.sha256(icc).hexdigest()[:12] if icc else None


def run(path: Path) -> None:
    if path.is_file() and path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as archive:
            image_names = {Path(name).name: name for name in archive.namelist() if name.endswith(".jpg")}
            all_features = [features(archive.read(image_names[f"{i:02}.jpg"])) for i in range(75)]
    else:
        all_features = [features((path / f"{i:02}.jpg").read_bytes()) for i in range(75)]
    for heading, indices in (("LP1", range(17)), ("LP2", range(17, 75))):
        groups: dict[tuple[str, int, int, str | None], list[int]] = defaultdict(list)
        for i in indices:
            groups[all_features[i]].append(i)
        print(heading)
        for (dqt, components, icc_length, icc_sha), pages in sorted(groups.items()):
            print(f" DQT={dqt} components={components} ICC={icc_length}:{icc_sha} n={len(pages)} pages={pages}")
    positives = {all_features[i][0] for i in LP1_HISTORICAL_CARRIERS}
    negative = {all_features[i][0] for i in range(17) if i not in LP1_HISTORICAL_CARRIERS}
    assert len(positives) == 2 and len(negative) == 1 and positives.isdisjoint(negative)
    assert all(all_features[i][0] not in positives for i in range(17, 75))
    assert len({all_features[i][3] for i in range(17, 75)}) == 1
    assert all(all_features[i][2] == 2576 for i in range(17, 75))
    print("PASS historical-carrier DQT sets absent from all 58 LP2 images; all LP2 ICC identical")


if __name__ == "__main__":
    run(Path(sys.argv[1]) if len(sys.argv) > 1 else Path("resources/liber-primus"))
