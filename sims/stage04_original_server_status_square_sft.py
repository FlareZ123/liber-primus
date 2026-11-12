"""Exact original 2014 Stage04 5x5 magic square source chain, no LP2 key inference.

Reconstructs the 2014 originally published Stage04 server-status JPEG bytes and
the 178-byte reversed-hex matrix; independently compares contemporaneous
archives and establishes the original *within-2014* transformation.
"""
from __future__ import annotations

import hashlib
import subprocess
from urllib.request import Request, urlopen

K_COMMIT="76d3ee8c762f60025822c8c05edbf31351636469"
N_COMMIT="ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"
K_ROOT=f"https://raw.githubusercontent.com/krisyotam/cicada3301/{K_COMMIT}/puzzles/2014/assets/stage04/"
N_ROOT=f"https://raw.githubusercontent.com/neuroretransmit/cicada/{N_COMMIT}/2014/005-third-onion/"

def obtain(url: str) -> bytes:
    with urlopen(Request(url,headers={"User-Agent":"2014-stage04-original-matrix-audit"}), timeout=120) as resp:
        return resp.read()

def blob_sha(b: bytes) -> str:
    return hashlib.sha1(b"blob "+str(len(b)).encode()+b"\0"+b).hexdigest()

def verify(data: bytes, size: int, sha: str, label: str) -> None:
    assert len(data)==size, (label,len(data),size)
    assert blob_sha(data)==sha,(label,blob_sha(data),sha)
    print("VERIFIED",label,size,sha)

def run_xxd(data: bytes) -> bytes:
    proc=subprocess.run(["xxd","-r","-p"],input=data,capture_output=True,check=True)
    return proc.stdout

def main() -> None:
    original=obtain(K_ROOT+"fv7lyucmeozzd5j4.onion/server-status")
    verify(original,1370852,"071fb34c82ba56c5dfbba376200be43822e31ee0","2014 original server-status response")
    print("ORIGINAL_CONTENT_TYPE",original[:120].decode("ascii",errors="replace"))
    # A separate contemporary participant archive preserved the JPEG's
    # unchanged hex transcription and exact full binary image.
    image_hex=obtain(N_ROOT+"server-status.hex")
    verify(image_hex,1368567,"9d7fda55c29baec7abefa38e224784e015bd7837","2014 preserved status hex")
    image=run_xxd(image_hex)
    verify(image,673066,"2829e13812015601ff1014cb4427587b4a8aa3a6","2014 complete status image")
    jpeg=image[:336353]
    verify(jpeg,336353,"7369644b99426a57d1a41819306bfd7be8935f5f","original LP1 page05 JPEG prefix")
    assert jpeg[:3]==bytes.fromhex("ffd8ff") and jpeg[-2:]==bytes.fromhex("ffd9")
    frame=image[0x521e4:0x521e4+357]
    matrix=run_xxd(frame[::-1])
    verify(matrix,178,"f081bf3bd3cb45b55359fa0e8961b1f033aa10c7","original hidden 5x5 matrix")
    expect=[[272,138,341,131,151],[366,199,130,320,18],[226,245,91,245,226],
            [18,320,130,199,366],[151,131,341,138,272]]
    lines=matrix.decode("ascii").strip().splitlines()
    actual=[[int(n) for n in line.split()] for line in lines]
    assert actual==expect,(actual,expect)
    assert all(sum(row)==1033 for row in actual)
    assert all(sum(actual[r][c] for r in range(5))==1033 for c in range(5))
    assert sum(actual[i][i] for i in range(5))==1033
    assert sum(actual[i][4-i] for i in range(5))==1033
    print("EXACT_5X5_MATRIX",actual)
    print("ORIGINAL_MATRIX_TEXT",repr(matrix))
    print("IMAGE_TRAILER_BYTES",len(image)-len(jpeg),"START",image[336353:336367].hex())
    # The standalone 2013-dated Wisdom source's original provenance is a
    # separate question, not settled by 2014 image-identity evidence.
    print("INSTRUCTION_BOUNDARY","byte reversal + GP prime-sum reconstruct the original 2014 square; no original response directly instructs LP2 page, cipher or cardinal state")

if __name__=="__main__":
    main()
