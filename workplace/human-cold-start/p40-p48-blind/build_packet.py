#!/usr/bin/env python3
"""Build a deterministic neutral LP2 cold-start packet from the original 75-JPEG ZIP."""

from __future__ import annotations

import argparse
import hashlib
import io
from pathlib import Path
import zipfile

from PIL import Image

README = """# Independent manuscript exercise

This packet contains 58 original full-resolution JPEG scans from a single 2014 manuscript release, in the original sequence. The filenames are neutral sequence labels, not page numbers. No image has been cropped, resized, rotated, annotated, or recompressed.

Please approach the material independently, using only sources that were genuinely available to a solver by May 2014. The optional period-source list is supplied separately. Do not consult modern walkthroughs, current research repositories, later Cicada releases, or model-generated interpretations.

Record your work in an unedited session log:

1. What did you notice first? Give the exact image and location.
2. What clue, if any, does that observation suggest?
3. What operation would you try, and why does the clue select it rather than merely resemble it?
4. Where do the required operand, key, parameters, ordering, state, or clock come from?
5. What exact output or next object do you predict before testing it?
6. What observation would falsify the proposed route?
7. If the route stops, what exact missing input or source would be needed?

Keep all dead ends and intermediate steps. Do not silently change the operation, key, start point, order, or stopping rule after seeing a disappointing output. If no unique operation is selected, say so and describe the ambiguity. Do not infer the creator's identity or motives.

The goal is to discover whether the original sequence itself selects a reproducible clue-to-operation path. There is no required answer and no presumption that every page contains a separate cipher.
"""

PERIOD_SOURCES = """# Optional period-source index (through May 2014)

This is a neutral list of first-party Cicada messages and period artifacts, not a list of proposed operations. Some files are archived copies; their source records identify whether the original server capture survives. Verify signature status and historical availability independently before relying on any item.

- 2012 signed MIDI email: `resources/historical/cicada2012-midi-email.asc`
- 2013 signed book-code payload extracted from the archived 232.jpg carrier: https://github.com/neuroretransmit/cicada/blob/b13600373d3400d75ec4208198019f3d92a304dd/2013/001-232.jpg/232.jpg.asc
- 2013 signed TCP challenge: https://github.com/iBotPeaches/cicada_3301/blob/27309e66746e21542f2b908d7f60b906915fe7c6/messages/2013/tcp-server.asc
- 2013 signed “Everything you need” message: `resources/historical/cicada2013-second-onion-everything-you-need.asc`
- 2013 signed forest message: `resources/historical/cicada2013-forest-clue.asc`
- 2014 original LP1 page-03 carrier: `resources/liber-primus/03.jpg`
- 2014 signed payload extracted from page 03: `resources/external/derived/2014-stage04/03-outguess.asc`
- 2014 Stage10 original form: `resources/historical/cicada2014-stage10-original-form.html`
- 2014 Stage11 signed message: `resources/historical/cicada2014-stage11-message.asc`
- 2014 Stage11 archived image index: `resources/historical/cicada2014-onion7-original-index.html` (archived HTML copy, not an original HTTP/WARC response)

The list is optional context, not a list of required tools or operations. Do not use post-May-2014 sources as evidence of what a contemporary solver could know.
"""

def read_reference_sums(path: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        digest, name = line.split(maxsplit=1)
        result[Path(name.strip()).name] = digest.lower()
    return result

def add_bytes(zf: zipfile.ZipFile, name: str, data: bytes) -> None:
    info = zipfile.ZipInfo(name, date_time=(2026, 11, 26, 0, 0, 0))
    info.compress_type = zipfile.ZIP_STORED
    info.external_attr = 0o100644 << 16
    zf.writestr(info, data)

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-zip", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--reference-sums", type=Path)
    args = parser.parse_args()

    expected = read_reference_sums(args.reference_sums) if args.reference_sums else {}
    records: list[tuple[str, str, bytes]] = []

    with zipfile.ZipFile(args.source_zip) as source:
        members = {Path(name).name: name for name in source.namelist()
                   if name.lower().endswith(".jpg")}
        for index, source_number in enumerate(range(17, 75), start=1):
            source_name = f"{source_number:02d}.jpg"
            member = members.get(source_name) or members.get(f"{source_number}.jpg")
            if member is None:
                raise FileNotFoundError(source_name)
            data = source.read(member)
            digest = hashlib.sha256(data).hexdigest()
            with Image.open(io.BytesIO(data)) as image:
                if image.size != (2400, 3600):
                    raise ValueError(f"{source_name}: unexpected dimensions {image.size}")
            if expected and expected.get(source_name) != digest:
                raise ValueError(f"{source_name}: SHA-256 differs from canonical reference")
            records.append((f"images/{index:03d}.jpg", digest, data))

    checksums = "".join(f"{digest}  {name}\n" for name, digest, _ in records)
    with zipfile.ZipFile(args.output, "w", compression=zipfile.ZIP_STORED) as output:
        add_bytes(output, "README.md", README.encode("utf-8"))
        add_bytes(output, "period_sources.md", PERIOD_SOURCES.encode("utf-8"))
        add_bytes(output, "SHA256SUMS.txt", checksums.encode("utf-8"))
        for name, _, data in records:
            add_bytes(output, name, data)

    digest = hashlib.sha256(args.output.read_bytes()).hexdigest()
    print(f"images={len(records)}")
    print(f"bytes={args.output.stat().st_size}")
    print(f"sha256={digest}")

if __name__ == "__main__":
    main()
