"""Exact SHA-512/Whirlpool p56 comparison of the recovered cu343 761 carrier."""
import argparse
import hashlib
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"

def whirlpool(data: bytes) -> str:
    return subprocess.check_output(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data,
    ).decode("ascii").split()[-1]

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, help="Original JPEG ZIP instead of preserved HTML")
    args = parser.parse_args()
    if args.archive:
        with zipfile.ZipFile(args.archive) as z:
            a, b, c = [z.read(f"liber-primus-jpegs/{i:02}.jpg") for i in range(3)]
        packed = (a + b + c[::-1]).translate(bytes(range(255, -1, -1)))
        raw = b"<!--761-->\n" + packed.hex().encode("ascii") + b"\n"
    else:
        raw = (ROOT / "resources/historical/cicada2014-cu343-761.html").read_bytes()
    assert len(raw) == 3641310
    assert hashlib.sha256(raw).hexdigest() == "0b642c3e25a9d19626e1f218797b96012b1f3865bf644980e690d8b1df0b4a81"
    assert hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest() == "dca24d10a0d6b1cc1b44451624454d64353f254e"
    match = re.fullmatch(rb"<!--761-->\n([0-9a-f]+)\n", raw)
    assert match is not None
    body = match[1]
    packed = bytes.fromhex(body.decode("ascii"))
    assert len(body) == 3641298 and len(packed) == 1820649
    assert whirlpool(b"abc") == "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5"
    matches = 0
    for name, data in [("HTML", raw), ("hex body", body), ("packed binary", packed)]:
        for algorithm, digest in [("SHA-512", hashlib.sha512(data).hexdigest()), ("Whirlpool", whirlpool(data))]:
            hit = digest == TARGET
            matches += int(hit)
            print(name, len(data), algorithm, digest, "MATCH" if hit else "no match")
    print(f"{matches}/6 matches")
if __name__ == "__main__":
    main()
