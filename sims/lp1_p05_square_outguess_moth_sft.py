#!/usr/bin/env python3
"""Source-exact LP1 p05 179-byte square as OutGuess key for repeated-moth LP2 JPEGs.

Single-file test with the existing original-source OutGuess 0.4 bitmap/ARC4
extractor; requires libjpeg and a C compiler to read original JPEG coefficients.
Run: python sims/lp1_p05_square_outguess_moth_sft.py
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from outguess_extract import build_bitmap, extract, header_is_source_forced

ROOT = Path(__file__).resolve().parents[1] / "resources" / "liber-primus"
HASHES = {
    "03": "b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f",
    "05": "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7",
    "70": "4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548",
    "71": "dbc2cfca46a150689e60ea83015dcd54ace81245711fefe114d6076b96412ec4",
    "72": "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba",
}
EXPECTED_179_SHA = "82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa"
PGP_SHA = "a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1"


def source_keys() -> dict[str, str]:
    data = (ROOT / "05.jpg").read_bytes()
    assert hashlib.sha256(data).hexdigest() == HASHES["05"]
    assert len(data) == 673066
    prefix, embedded, suffix = data[:336353], data[336353:336713], data[336713:]
    assert suffix == prefix[::-1]
    assert embedded[:2] == b"\n\n" and len(embedded) == 360
    raw_hex = embedded[2:].decode("ascii")
    assert re.fullmatch(r"[0-9a-fA-F]{358}", raw_hex)
    payload = bytes.fromhex(raw_hex)
    assert hashlib.sha256(payload).hexdigest() == EXPECTED_179_SHA
    swapped = bytes(((b & 15) << 4) | (b >> 4) for b in payload).decode("ascii")
    square = re.sub(r"[0-9]+", lambda match: match.group()[::-1], swapped)
    assert len(square) == 179 and square.startswith("\n272     138")
    return {"recovered_square_179_ASCII": square, "original_hex_358_ASCII": raw_hex}


def load_bitmap(number: str) -> tuple[bytes, int]:
    image = ROOT / f"{number}.jpg"
    assert hashlib.sha256(image.read_bytes()).hexdigest() == HASHES[number]
    return build_bitmap(image)


def main() -> None:
    keys = source_keys()
    report = {"key_SHA256": {label: hashlib.sha256(value.encode("ascii")).hexdigest()
                             for label, value in keys.items()}, "images": {}}
    bits, n = load_bitmap("03")
    control, meta = extract(bits, n, "Default key")
    assert len(control) == 31809
    assert hashlib.sha256(control).hexdigest() == PGP_SHA
    assert control.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
    assert not header_is_source_forced(bits, n)
    report["historical_positive"] = {"image": "03.jpg", "key": "Default key",
                                      "PGP_bytes": len(control), "sha256": PGP_SHA}
    expected_square_digests = {
        "05": "cf3c82cd0a89f5c80c2584c31786d53202e2c5b3293ea8d5686ebcbbb2854e0b",
        "70": "d5a0a9025dc6d3d628fcd4d567cb941d7658a5cae45197aa30913fda2845ff51",
        "71": "12f6973a335f9be4bb6723e51041c5fe660104ee903c56e1ccca05d86e0ee6ed",
        "72": "02db0a488263ae38bbd0bd7fd11a27491b8b0f0e44d3f70d7c554623b98a6dc2",
    }
    for number in ("05", "70", "71", "72"):
        bits, n = load_bitmap(number)
        assert header_is_source_forced(bits, n)
        first_change = next(i for i, value in enumerate(bits) if value != 255)
        assert first_change >= 3168
        row = {"eligible_bits": n, "initial_forced_one_bytes": first_change}
        for label, key in keys.items():
            try:
                payload, metadata = extract(bits, n, key)
            except ValueError as error:
                row[label] = {"rejected": str(error)}
                continue
            assert metadata["header_is_source_forced"] is True
            row[label] = {
                "header_hex": metadata["header_hex"], "length": len(payload),
                "sha256": metadata["payload_sha256"],
                "entropy": round(metadata["entropy_bits_per_byte"], 5),
                "printable_fraction": round(metadata["printable_fraction"], 5),
                "possible_openpgp_armor": metadata["possible_openpgp_armor"],
                "magic": metadata["magic"],
            }
            assert not metadata["possible_openpgp_armor"]
            assert not metadata["magic"]
            if label == "recovered_square_179_ASCII":
                assert metadata["header_hex"] == "9721b90a"
                assert len(payload) == 2745
                assert metadata["payload_sha256"] == expected_square_digests[number]
                assert metadata["entropy_bits_per_byte"] > 7.9
                assert metadata["printable_fraction"] < 0.42
        report["images"][number] = row
    assert report["images"]["70"]["recovered_square_179_ASCII"]["header_hex"] == (
        report["images"]["71"]["recovered_square_179_ASCII"]["header_hex"])
    print(json.dumps(report, indent=2, sort_keys=True))
    print("PASS: authentic Stage04 PGP recovered; source-square header is forced "
          "by blank-top coefficient planes even on the wrong-image control. "
          "No authenticated LP2 hidden file or text.")


if __name__ == "__main__":
    main()
