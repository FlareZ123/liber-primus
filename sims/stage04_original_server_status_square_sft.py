"""Byte-pin Stage04 original captured server-status and recover the square without a guessed key.

Original participant archive exact Git blob, size, extraction position from contemporaneous
stage04 README. Print all 180 recovered bytes and possible plain numeric lines.
"""
from __future__ import annotations
import hashlib
import re
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
    print("SOURCE_HEAD",repr(data[:500]))
    print("SOURCE_TAIL",repr(data[-500:]))
    for name, motif in [("ffd8ffe0",b"ffd8ffe0"), ("ffd8ffe1",b"ffd8ffe1"),("e0ffd8ff",b"e0ffd8ff"),("ffd9",b"ffd9"),("Apache",b"Apache"),("<pre>",b"<pre>")]:
        print("MOTIF",name,data.lower().find(motif.lower()))
    import re
    runs = list(re.finditer(rb"[0-9a-fA-F]{60,}",data))
    print("HEX_RUNS",len(runs),"FIRST",[(m.start(),len(m.group()),m.group()[:65]) for m in runs[:6]],"LAST",[(m.start(),len(m.group())) for m in runs[-4:]])
    frame = data[336353:336353 + 360]
    assert len(frame) == 360
    print("PINNED_ORIGINAL",len(data),git_sha(data))
    print("SOURCE_HEADHEX",data[:100].hex())
    print("FRAME_HEX",frame.hex())
    print("FRAME_REPR",repr(frame))
    forward = re.sub(r"[^0-9a-fA-F]", "", frame.decode("ascii"))
    backward = re.sub(r"[^0-9a-fA-F]", "", frame[::-1].decode("ascii"))
    print("HEX_DIGITS",len(forward),len(backward))
    for name, seq in (("REVERSED", backward), ("FORWARD", forward)):
        decoded = bytes.fromhex(seq[:len(seq)//2*2])
        print(name,"DECODED_BYTES",len(decoded),"HEX",decoded.hex(),"REPR",repr(decoded))
        print(name,"FIRST32",decoded[:32],"LAST32",decoded[-32:])
    rd = get("README.md")
    print("README_SHA",git_sha(rd),"README",rd.decode("utf8"))

if __name__ == "__main__":
    main()
