"""Reproduce the two p15 matrix plaintext-fed register tests using the tracked GP29 inputs.
Run from any directory with Python 3 and a C++17 compiler (g++ by default).
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ABC = "0123456789ABCDEFGHIJKLMNOPQRS"

def get_input():
    corpus = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text(encoding="utf-8"))
    native = json.loads((ROOT / "resources/external/relikd-solved-gp29-native-v1.json").read_text(encoding="utf-8"))
    pages = [p for p in corpus["pages"] if 16 <= p["page"] <= 22]
    assert [p["page"] for p in pages] == list(range(16, 23))
    assert [len(p["indices"]) for p in pages] == [267,273,260,271,269,273,131]
    source = "".join(ABC[i] for p in pages for i in p["indices"])
    rune = dict(zip(native["runes"], ABC))
    controls = ["".join(rune.get(ch, "") for ch in s["source_text"]) for s in native["sections"]]
    assert [len(s) for s in controls] == [184,515,157,780,755,319,89,85,95]
    data = ("\n".join([source, *controls]) + "\n").encode("ascii")
    assert hashlib.sha256(data).hexdigest() == "1470d018c26e27ca2e5c6b5ab71e33fd55309077c843d3a9ef37de1fbb22231d"
    return data

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--compiler", default="g++")
    args = parser.parse_args()
    data = get_input()
    with tempfile.TemporaryDirectory() as tmp:
        exe = Path(tmp) / "receiver.exe"
        subprocess.run([args.compiler, "-O3", "-std=c++17", str(Path(__file__).with_suffix(".cpp")), "-o", str(exe)], check=True)
        for matrix in ("literal", "signed"):
            for mode in ("ordinary", "hold", "full"):
                print(f"\n=== {matrix} {mode} ===", flush=True)
                subprocess.run([str(exe), mode, matrix], input=data, check=True)

if __name__ == "__main__":
    main()
