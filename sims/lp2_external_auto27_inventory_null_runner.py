"""Exact-source, frozen auto-27 decoder compared with 5 inventory shuffles.

All upstream code/data come from one immutable Git commit and SHA-verified ZIP.
The repository is read-only. Extraction and child execution occur only in a
temporary directory; child environment contains no repository credentials.
The reviewed upstream decoder imports only ordinary Python standard-library
modules and provides dictionary-constrained route search.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import random
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
REPO = "2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption"
COMMIT = "1b72bdc80d0a9d9727104ad2fe277cbb77523701"
EXPECTED_BLOB = "05a2091f4ec3c98e0352ab344cccb0cb0b015767"
URL = "https://raw.githubusercontent.com/" + REPO + "/" + COMMIT + "/liber_primus_decoder.zip"
LABELS = (
    "F", "U/V", "TH", "O", "R", "C/K", "G", "W", "H", "N",
    "I", "J", "EO", "P", "X", "S/Z", "T", "B", "E", "M",
    "L", "NG/ING", "OE", "D", "A", "AE", "Y", "IA/IO", "EA"
)
ANALYZER = r'''
import json
from pathlib import Path
import sys
import time
sys.path.insert(0, str(Path(__file__).resolve().parent))
import decode

matrix = Path(sys.argv[1])
lexicon = Path(sys.argv[2])
grid = decode.read_matrix(matrix.read_text(encoding="utf-8"))
assert len(grid) == 729
english = decode.English.from_file(lexicon, 1)
began = time.perf_counter()
result = decode.solve(decode.Geometry(grid), english,
                      opening="free", max_depth=128)
elapsed = time.perf_counter() - began
best = result.readings[0] if result.readings else None

def summarize(reading):
    addresses = [(r - 1) * 27 + c - 1
                 for step in reading.steps for r, c in step.cells]
    ordered = sorted(set(addresses))
    def streak(seq):
        current = maximum = 1 if seq else 0
        for a, b in zip(seq, seq[1:]):
            current = current + 1 if b == a + 1 else 1
            maximum = max(current, maximum)
        return maximum
    return {
        "score": reading.score,
        "blocks": len(reading.blocks),
        "runeReads": len(addresses),
        "distinctCipherPositions": len(ordered),
        "maxSequentialOriginalReads": streak(addresses),
        "maxContiguousOriginalPositions": streak(ordered),
        "maxBlockLength": max(len(step.runes) for step in reading.steps),
        "words": " | ".join(" ".join(w) for w in reading.blocks),
        "firstPositions": addresses[:12],
        "lastPositions": addresses[-12:],
    }

print("AUTO27-NULL-RESULT " + json.dumps({
    "seconds": elapsed, "opening": "free", "top": 1,
    "seeds": result.seeds, "depth": result.last_depth,
    "exhausted": result.exhausted,
    "terminalCounts": dict(result.terminal_states),
    "returned": len(result.readings),
    "best": summarize(best) if best else None,
}, sort_keys=True), flush=True)
'''


def execute(case: int) -> None:
    """Case 0 original, 1..5 reproducible fixed-inventory shuffles."""
    assert 0 <= case <= 5
    for attempt in range(8):
        try:
            with urllib.request.urlopen(URL, timeout=45) as response:
                payload = response.read()
            break
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 7:
                raise
            time.sleep(min(6 * (attempt + 1) + case * 2, 35))
    blob_hash = hashlib.sha1(
        ("blob " + str(len(payload)) + "\0").encode("ascii") + payload
    ).hexdigest()
    assert blob_hash == EXPECTED_BLOB, "source ZIP blob mismatch"
    assert len(payload) == 453271

    with tempfile.TemporaryDirectory(prefix="lp2-auto27-") as temporary:
        work = Path(temporary)
        with zipfile.ZipFile(__import__("io").BytesIO(payload)) as archive:
            for name, size in (
                ("decode.py", 30126),
                ("matrix.txt", 1847),
                ("data/english.tsv.gz", 426527),
            ):
                item = archive.getinfo(name)
                assert item.file_size == size
                contents = archive.read(item)
                output = work / name
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(contents)
        decoder_sha256 = hashlib.sha256(
            (work / "decode.py").read_bytes()
        ).hexdigest()
        assert decoder_sha256 == (
            "286583db62dec669d35648c4cfc136b3ebc81c4feba9b408d68cd1afdb479e2d"
        )

        canonical = json.loads(
            (ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8")
        )
        original = [rune for page in canonical["pages"][:3] for rune in page["indices"]]
        assert len(original) == 729
        source = (work / "matrix.txt").read_text(encoding="utf-8")
        names = source.split()
        assert len(names) == len(original)
        identity = {symbol: i for i, label in enumerate(LABELS)
                    for symbol in (label, *label.split("/"))}
        transformed = [identity[symbol] for symbol in names]
        assert transformed == original, "upstream matrix must be original pp0..2 source"

        if case:
            seeded = random.Random(0x3301A00D + case * 0x10001)
            seeded.shuffle(names)
            assert sorted(names) == sorted(source.split())
            shuffled = "\n".join(
                " ".join(names[row * 27 : (row + 1) * 27]) for row in range(27)
            ) + "\n"
            (work / "matrix.txt").write_text(shuffled, encoding="utf-8")

        input_sha256 = hashlib.sha256((work / "matrix.txt").read_bytes()).hexdigest()
        print("AUTO27-CASE " + json.dumps({
            "case": case,
            "original": case == 0,
            "sourceBlob": blob_hash,
            "originalRuneInventory": [original.count(i) for i in range(29)],
            "sourceInputSha256": input_sha256,
        }), flush=True)
        (work / "audit.py").write_text(ANALYZER, encoding="utf-8")
        variables = {
            key: os.environ[key]
            for key in ("PATH", "SystemRoot", "WINDIR")
            if key in os.environ
        }
        variables.update(
            PYTHONDONTWRITEBYTECODE="1",
            PYTHONUTF8="1",
            TEMP=str(work),
            TMP=str(work),
            NO_PROXY="*",
            no_proxy="*",
        )
        child = subprocess.run(
            [
                sys.executable,
                str(work / "audit.py"),
                str(work / "matrix.txt"),
                str(work / "data/english.tsv.gz"),
            ],
            cwd=work,
            env=variables,
            check=True,
            timeout=12 * 60,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        print(child.stdout, flush=True)
        if child.stderr:
            print(child.stderr, file=sys.stderr, flush=True)


if __name__ == "__main__":
    execute(int(sys.argv[1]))
