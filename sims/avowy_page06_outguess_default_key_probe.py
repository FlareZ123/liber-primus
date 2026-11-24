#!/usr/bin/env python3
"""Compare source-authenticated default-key OutGuess retrieval on the Avowy
page-06 render and the repository's original LP1 page 06.

The operation is deliberately bounded to the historically used literal
password "Default key". This is a carrier-specific check, not a key search.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
from outguess_extract import build_bitmap, extract


def probe(path: pathlib.Path, label: str, out_path: pathlib.Path) -> dict:
    result = {"label": label, "image": str(path)}
    result["image_sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()
    try:
        bitmap, bit_count = build_bitmap(path)
        payload, meta = extract(bitmap, bit_count, "Default key")
        out_path.write_bytes(payload)
        result.update(meta)
        result.update({
            "status": "retrieved",
            "bitmap_bits": bit_count,
            "bitmap_bytes": len(bitmap),
            "output_file": str(out_path),
            "output_bytes": len(payload),
            "output_sha256": hashlib.sha256(payload).hexdigest(),
            "output_prefix_hex": payload[:64].hex(),
            "pgp_signed_message": payload.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----"),
            "pgp_signature": payload.startswith(b"-----BEGIN PGP SIGNATURE-----"),
        })
    except Exception as exc:
        result.update({"status": "failed", "error_type": type(exc).__name__,
                       "error": str(exc)[:500]})
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("avowy_image", type=pathlib.Path)
    parser.add_argument("--control", type=pathlib.Path,
                        default=pathlib.Path("resources/liber-primus/06.jpg"))
    parser.add_argument("--out-dir", type=pathlib.Path, default=pathlib.Path("."))
    args = parser.parse_args()
    args.out_dir.mkdir(parents=True, exist_ok=True)
    avowy = probe(args.avowy_image, "Avowy XOR-FF/gzip recovered page", args.out_dir / "avowy-default-key.bin")
    control = probe(args.control, "Original LP1 page 06", args.out_dir / "page06-default-key.bin")
    same = (
        avowy.get("status") == "retrieved"
        and control.get("status") == "retrieved"
        and avowy.get("output_sha256") == control.get("output_sha256")
    )
    result = {
        "question": "Does the Avowy render contain a distinct, recognizable default-key OutGuess payload relative to original LP1 page 06?",
        "password": "Default key",
        "selection_basis": "same literal key used in verified original LP1 OutGuess message carriers",
        "avowy": avowy,
        "original_page06_control": control,
        "same_recovered_payload": same,
        "interpretation_guard": "A nonempty or accepted header alone is not evidence of embedding; require a recognizable/authenticated payload or independent source confirmation.",
    }
    print(json.dumps(result, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
