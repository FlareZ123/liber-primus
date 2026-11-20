#!/usr/bin/env python3
"""Read-only verification of the 2014 Cicada Stage 8 square-submission messages."""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KEY = ROOT / "resources" / "cicada-3301-authentic-public-key.asc"
FINGERPRINT = "6D854CD7933322A601C3286D181F01E57A35090F"

SIGNED = {
    "11": {
        "path": "resources/historical/cicada2014-sixth-onion-11.jpg.asc",
        "size": 1234,
        "git_blob_sha1": "2f825249d5d37555053abf3b07d2fe8fb1def56b",
        "sha256": "6f2db751c9d6acd7f17c59679e4313632402a66e7295447781d0de5701894027",
        "timestamp": "2014-01-19T07:39:42Z",
        "matrix": [[310, 12, 103], [312, 14, 123], [310, 12, 103]],
    },
    "12": {
        "path": "resources/historical/cicada2014-sixth-onion-12.jpg.asc",
        "size": 1234,
        "git_blob_sha1": "7d883e03ece7823fbfcfe906461084c55ea1525b",
        "sha256": "78581663e7a5ba77494d1840820098b122217edd13009661f1be2e497db88179",
        "timestamp": "2014-01-19T07:39:50Z",
        "matrix": [[10, 12, 100], [12, 14, 120], [10, 12, 100]],
    },
    "13": {
        "path": "resources/historical/cicada2014-sixth-onion-13.jpg.asc",
        "size": 1234,
        "git_blob_sha1": "4cff459f0d0d6abb4c1d8879591fd085e420877a",
        "sha256": "83835b0e148c1061d42693ea14a5035f54ad41fa45496b00b37311b8e96a2095",
        "timestamp": "2014-01-19T07:39:57Z",
        "matrix": [[110, 12, 101], [112, 14, 121], [110, 12, 101]],
    },
}

FOLLOWUP = {
    "path": "resources/historical/cicada2014-sixth-onion-v2-form.html.asc",
    "size": 1350,
    "git_blob_sha1": "ff4d21ad4e56836070f431a6a297ab14a10a099b",
    "sha256": "8de5d05fccdaa3c087ce70eea44fba27f7cac9db290a46a0672ab717a0ebbfc0",
    "timestamp": "2014-01-25T08:26:57Z",
}


def git_blob_sha1(data: bytes) -> str:
    header = b"blob " + str(len(data)).encode("ascii") + b"\0"
    return hashlib.sha1(header + data).hexdigest()


def verify_one(home: str, meta: dict) -> dict:
    path = ROOT / meta["path"]
    data = path.read_bytes()
    assert len(data) == meta["size"], (path, len(data), meta["size"])
    blob = git_blob_sha1(data)
    sha256 = hashlib.sha256(data).hexdigest()
    assert blob == meta["git_blob_sha1"], (path, blob, meta["git_blob_sha1"])
    assert sha256 == meta["sha256"], (path, sha256, meta["sha256"])

    result = subprocess.run(
        ["gpg", "--homedir", home, "--batch", "--status-fd", "1", "--verify", str(path)],
        check=False, capture_output=True, text=True,
    )
    assert result.returncode == 0, (path, result.stderr)
    body = data.split(b"-----BEGIN PGP SIGNATURE-----", 1)[0].decode("ascii")
    if path.name.endswith((".jpg.asc", ".html.asc")):
        for phrase in ("Create one Tor hidden service", "post the ",
                       "three magic squares", "Work alone", "Good luck.", "3301"):
            if "v2-form" not in path.name:
                assert phrase in body, (path, phrase)
    valid = next((line for line in result.stdout.splitlines()
                  if line.startswith("[GNUPG:] VALIDSIG ")), None)
    assert valid, (path, result.stdout, result.stderr)
    fields = valid.split()
    assert fields[2] == FINGERPRINT, (path, fields)
    actual_time = datetime.fromtimestamp(int(fields[4]), timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    assert actual_time == meta["timestamp"], (path, actual_time, meta["timestamp"])
    return {"path": meta["path"], "bytes": len(data), "git_blob_sha1": blob,
            "sha256": sha256, "fingerprint": fields[2], "signed_at": actual_time}


def sums(matrix: list[list[int]]) -> dict:
    n = len(matrix)
    rows = [sum(row) for row in matrix]
    cols = [sum(matrix[i][j] for i in range(n)) for j in range(n)]
    diagonals = [sum(matrix[i][i] for i in range(n)),
                 sum(matrix[i][n - 1 - i] for i in range(n))]
    return {"rows": rows, "columns": cols, "diagonals": diagonals}


def main() -> None:
    assert KEY.exists(), KEY
    with tempfile.TemporaryDirectory(prefix="cicada-stage08-gpg-") as home:
        os.chmod(home, 0o700)
        imported = subprocess.run(
            ["gpg", "--homedir", home, "--batch", "--import", str(KEY)],
            check=False, capture_output=True, text=True,
        )
        assert imported.returncode == 0, imported.stderr
        reports = [verify_one(home, meta) for meta in SIGNED.values()]
        follow = verify_one(home, FOLLOWUP)

    matrices = {}
    for label, meta in SIGNED.items():
        result = sums(meta["matrix"])
        all_sums = result["rows"] + result["columns"] + result["diagonals"]
        assert len(set(all_sums)) > 1, (label, result)
        matrices[label] = result

    follow_body = (ROOT / FOLLOWUP["path"]).read_text("ascii")
    for token in ("/cgi-bin/upload", "named 'file'", "'/key.asc'"):
        assert token in follow_body, token

    squares_path = ROOT / "resources" / "cicada2014-openpuff-magic-squares.txt"
    blocks = [block for block in re.split(r"\n\s*\n", squares_path.read_text("ascii").strip()) if block.strip()]
    squares = []
    for block in blocks:
        matrix = [[int(x) for x in line.split()] for line in block.splitlines() if line.strip()]
        check = sums(matrix)
        assert all(len(set(check[k])) == 1 for k in ("rows", "columns", "diagonals")), check
        squares.append({"shape": f"{len(matrix)}x{len(matrix[0])}", "entries": sum(map(len, matrix)),
                        "row_sum": check["rows"][0], "column_sum": check["columns"][0],
                        "diagonal_sum": check["diagonals"][0]})
    assert [x["shape"] for x in squares] == ["5x5", "7x7", "5x5"], squares
    assert [x["row_sum"] for x in squares] == [3301, 1033, 1033], squares
    assert sum(x["entries"] for x in squares) == 99, squares

    print(json.dumps({"signed_messages": reports, "followup": follow,
                      "embedded_3x3_sums": matrices, "historical_99_rune_squares": squares},
                     indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
