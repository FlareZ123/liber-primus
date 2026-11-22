#!/usr/bin/env python3
"""Acquire the original source-hashed Cicada audio for timing-only research."""
import hashlib
import json
import os
import urllib.request
import uuid
from pathlib import Path

from filelock import FileLock

SOURCE = (
    ("761.MP3", "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3", "sha256", "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"),
    ("interconnectedness.mp3", "https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.mp3", "gitsha1", "09fe068192b76a3697c47ec1d604b527703db798"),
    ("c.mp3", "https://raw.githubusercontent.com/krisyotam/cicada3301/main/media/audio/index.3.mp3", "gitsha1", "1fbb00303c98bb1430adea408516e12a63b96d6d"),
    ("song.mid", "https://raw.githubusercontent.com/neuroretransmit/cicada/b13600373d3400d75ec4208198019f3d92a304dd/2012/009-midi-puzzle/song.mid", "gitsha1", "11924e0e195208c2eea757655035e149fb8a190f"),
)


def digest(data: bytes, method: str) -> str:
    if method == "sha256":
        return hashlib.sha256(data).hexdigest()
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def main() -> None:
    out = Path("run-data/agent3-authentic-audio")
    out.mkdir(parents=True, exist_ok=True)
    evidence = []
    for name, url, method, expected in SOURCE:
        with urllib.request.urlopen(url, timeout=120) as response:
            data = response.read()
        actual = digest(data, method)
        assert actual == expected, (name, actual, expected)
        target = out / name
        with FileLock(str(target) + ".lock"):
            temporary = out / (name + "." + uuid.uuid4().hex + ".tmp")
            temporary.write_bytes(data)
            os.replace(temporary, target)
        record = {"file": name, "size": len(data), "algorithm": method, "digest": actual, "source": url}
        evidence.append(record)
        print(json.dumps(record), flush=True)
    manifest = out / "manifest.json"
    with FileLock(str(manifest) + ".lock"):
        temporary = out / ("manifest." + uuid.uuid4().hex + ".tmp")
        temporary.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
        os.replace(temporary, manifest)


if __name__ == "__main__":
    main()
