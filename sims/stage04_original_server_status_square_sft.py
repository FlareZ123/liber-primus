"""Byte-pin Stage04 original captured server-status and recover the square without a guessed key.

Original participant archive exact Git blob, size, extraction position from contemporaneous
stage04 README. Print all 180 recovered bytes and possible plain numeric lines.
"""
from __future__ import annotations
import hashlib
from urllib.request import urlopen, Request

COMMIT = "76d3ee8c762f60025822c8c05edbf31351636469"
ROOT = f"https://raw.githubusercontent.com/krisyotam/cicada3301/{COMMIT}/puzzles/2014/assets/stage04/"
PATH = "fv7lyucmeozzd5j4.onion/server-status"
SIZE = 1_370_852
SHA = "071fb34c82ba56c5dfbba376200be43822e31ee0"

def get(relative: str) -> bytes:
    with urlopen(Request(ROOT + relative, headers={"User-Agent":"LP2-2014-original-stage04-square"}), timeout=120) as response:
        return response.read()

def git_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()

def main() -> None:
    data = get(PATH)
    assert len(data) == SIZE, (len(data),SIZE)
    assert git_sha(data) == SHA, git_sha(data)
    frame = data[336353:336353 + 360]
    assert len(frame) == 360
    print("PINNED_ORIGINAL",len(data),git_sha(data))
    print("SOURCE_HEADHEX",data[:100].hex())
    print("FRAME_HEX",frame.hex())
    print("FRAME_REPR",repr(frame))
    print("EXACT_180_REVERSED_HEX_DECODE",repr(bytes.fromhex(frame[::-1].decode("ascii"))))
    print("EXACT_180_FORWARD_HEX_DECODE",repr(bytes.fromhex(frame.decode("ascii"))))
    rd = get("README.md")
    print("README_SHA",git_sha(rd),"README",rd.decode("utf8"))

if __name__ == "__main__":
    main()
