#!/usr/bin/env python3
"""Source-matched Q92 F5 neural gate: never scan originals unless fixed controls pass."""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

from filelock import FileLock

SOURCE = Path("resources/liber-primus")
OUT = Path("im-results/f5-q92-neural-probe")
F5 = "f5"
PAGES = (6, 13, 14, 36, 54)   # five visually distinct Q92 color source groups
LENGTHS = (256, 1024, 4096)
PASSWORD = "LP2-F5-Q92-NEURAL-POSITIVE-FROZEN-20261113"


def command(argv: list[str], *, seconds: int = 240) -> str:
    p = subprocess.run(argv, capture_output=True, text=True, timeout=seconds, check=False)
    if p.returncode:
        raise RuntimeError(f"command {argv[1]} failed: {p.stderr[-650:]}")
    return p.stdout


def bytes_of(n: int) -> bytes:
    return b"".join(
        hashlib.sha256(b"LP2-Q92-F5-NEURAL-v1" + i.to_bytes(4, "big")).digest()
        for i in range((n + 31) // 32)
    )[:n]


def gate(path: Path) -> dict[str, object]:
    result = json.loads(command([F5, "gate", str(path), "-tier", "1", "-json"], seconds=180))
    return {
        "verdict": result["verdict"],
        "p_stego": result.get("p_stego"),
        "gate_score": result.get("gate_score"),
        "reason": result.get("reason"),
        "detected": result.get("detected"),
    }


def save(obj: dict[str, object]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / "probe.json"
    with FileLock(str(target) + ".lock"):
        with tempfile.NamedTemporaryFile("w", dir=OUT, encoding="utf-8",
                                         prefix=".q92-neural-", delete=False) as f:
            temp = Path(f.name)
            json.dump(obj, f, indent=2, sort_keys=True)
            f.write("\n")
        os.replace(temp, target)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    result: dict[str, object] = {
        "detector": "0verkilll/f5 v1.0.0, built-in ONNX two-stage neural tier1, frozen default threshold",
        "gating": "all5 Q92 source covers CLEAN and >=5/5 of 4096-byte and >=4/5 of 1024-byte positive carriers F5_DETECTED",
        "originals_examined_only_after_passing_controls": True,
        "controls": [],
    }
    version = command([F5, "version"]).strip()
    result["version"] = version
    for page in PAGES:
        cover = SOURCE / f"{page+17}.jpg"
        row = gate(cover)
        result["controls"].append({
            "page": page, "size": 0, "kind": "original Q92 cover proxy",
            "sha256": hashlib.sha256(cover.read_bytes()).hexdigest(), **row,
        })
        print("COVER",page,json.dumps(row,sort_keys=True),flush=True)
        for size in LENGTHS:
            payload = bytes_of(size)
            p = OUT / f"payload_{size}.bin"
            p.write_bytes(payload)
            stego = OUT / f"p{page}_{size}.jpg"
            recovered = OUT / f"p{page}_{size}.bin"
            if recovered.exists():
                recovered.unlink()
            command([F5, "embed", str(cover), "-p", PASSWORD,
                     "-in", str(p), "-o", str(stego)])
            command([F5, "extract", str(stego), "-p", PASSWORD, "-o", str(recovered)])
            if recovered.read_bytes() != payload:
                raise ValueError(f"F5-control p{page}/{size} did not exactly extract")
            score = gate(stego)
            result["controls"].append({
                "page": page, "size": size, "kind": "authentic F5 stego",
                "sha256": hashlib.sha256(stego.read_bytes()).hexdigest(),
                "payload_sha256": hashlib.sha256(payload).hexdigest(),
                "exact_extraction": True, **score,
            })
            print("POS",page,size,json.dumps(score,sort_keys=True),flush=True)
    controls = result["controls"]
    covers = [x for x in controls if x["size"] == 0]
    positive = [x for x in controls if x["size"] > 0]
    measure = {
        "clean_cover_calls": sum(x["verdict"] == "CLEAN" for x in covers),
        "tp_256": sum(x["verdict"] == "F5_DETECTED" for x in positive if x["size"] == 256),
        "tp_1024": sum(x["verdict"] == "F5_DETECTED" for x in positive if x["size"] == 1024),
        "tp_4096": sum(x["verdict"] == "F5_DETECTED" for x in positive if x["size"] == 4096),
    }
    passed = measure["clean_cover_calls"] == 5 and measure["tp_4096"] == 5 and measure["tp_1024"] >= 4
    result["calibration"] = {**measure, "passed": passed}
    print("CALIBRATION",json.dumps(result["calibration"],sort_keys=True),flush=True)
    if passed:
        screen = []
        for page in range(58):
            source = SOURCE / f"{page+17}.jpg"
            row = gate(source)
            screen.append({"page": page, **row})
            print("ORIGINAL",page,json.dumps(row,sort_keys=True),flush=True)
        result["original_screen"] = screen
        result["flagged"] = [r["page"] for r in screen if r["verdict"] == "F5_DETECTED"]
    else:
        result["original_screen_withheld"] = True
        print("ORIGINAL_SCREEN_WITHHELD: known-positive/specificity calibration failed",flush=True)
    save(result)


if __name__ == "__main__":
    main()
