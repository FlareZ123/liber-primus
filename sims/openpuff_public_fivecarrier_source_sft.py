"""Pin a genuine public five-carrier OpenPuff example to original Git blobs.

Source: cyberianwilderness/CMP110 at bc823f0126345bf240e41ca5c918ef2f786666bd.
The author publishes the five-carrier order in Carrier_Files/note.txt,
OpenPuff passwords on https://cyberianwilderness.github.io/openpuffProject.html,
and the encrypted 55105-byte message.txt as a known-output positive target.
No carrier is transformed or re-encoded.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import tempfile

from filelock import FileLock

SOURCE = "https://github.com/cyberianwilderness/CMP110/tree/bc823f0126345bf240e41ca5c918ef2f786666bd"
PUBLISHED_ORDER = [
    "Bible.pdf",
    "aurora_borealis.png",
    "KJ_Bible.pdf",
    "KJ_Bible_Annotated.pdf",
    "Moonlight_Sonata_MP3.mp3",
]
FILES: dict[str, tuple[int, str]] = {
    "Carrier_Files/Bible.pdf": (6255323, "19dad5185766d1097fdaa9922a80139ada3eb039"),
    "Carrier_Files/aurora_borealis.png": (1071256, "491365b22bf2207c8186aceff0566bf690745aca"),
    "Carrier_Files/KJ_Bible.pdf": (9376812, "8d0b0a2b2c9e28aaca4fcea02f35d4bd2397390a"),
    "Carrier_Files/KJ_Bible_Annotated.pdf": (9801255, "0137b4758cda220a3b26da4dfdf60fcb5373d99b"),
    "Carrier_Files/Moonlight_Sonata_MP3.mp3": (6191787, "5b72c907dc001870f40d22f550123e4db6f99f7e"),
    "Carrier_Files/note.txt": (50, "2cc34718646ada1e367f94c15b11f976c70094c2"),
    "message.txt": (55105, "49bc51c2bfd69720173f0232b9e376d96122f781"),
}


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode("ascii") + data).hexdigest()


def atomic_json(path: Path, value: object) -> None:
    data = (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    with FileLock(str(path) + ".lock"):
        with tempfile.NamedTemporaryFile(dir=path.parent, prefix=path.stem + ".", suffix=".tmp", delete=False) as f:
            temp = Path(f.name)
            f.write(data)
            f.flush()
            os.fsync(f.fileno())
        try:
            os.replace(temp, path)
        finally:
            temp.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-root", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    root = Path(args.source_root)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    results = []
    for relative, (size, expected_sha) in FILES.items():
        path = root / relative
        data = path.read_bytes()
        actual_sha = git_blob_sha(data)
        assert len(data) == size and actual_sha == expected_sha, relative
        result = {
            "file": relative,
            "bytes": len(data),
            "git_blob_sha1": actual_sha,
            "sha256": hashlib.sha256(data).hexdigest(),
        }
        print("ORIGINAL_PUBLIC_MULTI_CARRIER", json.dumps(result), flush=True)
        results.append(result)

    note = (root / "Carrier_Files/note.txt").read_text(encoding="utf-8").splitlines()
    assert note == ["Bible", "aurora", "KJBible", "KJBible_annotated", "mp3 1/5"], note
    assert [p.name for p in (root / "Carrier_Files" / name for name in PUBLISHED_ORDER)] == PUBLISHED_ORDER
    report = {
        "source": SOURCE,
        "published_chain_order_note": note,
        "actual_carrier_order": PUBLISHED_ORDER,
        "site_stated_password_A": "Security",
        "site_stated_password_B": "Assignment",
        "site_stated_password_C": "Practical",
        "site_stated_bit_levels": {
            "Pdf (File)": "1/2 (50%) - Maximum",
            "Png (Image)": "1/2 (50%) - Maximum",
            "Mp3 (Audio)": "1/5 (20%) - Medium",
        },
        "expected_message_file": "message.txt",
        "files": results,
    }
    atomic_json(out / "source-identity.json", report)
    print("PUBLIC_FIVE_CARRIER_SOURCE_VALIDATED", json.dumps(report, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
