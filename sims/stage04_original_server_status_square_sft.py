"""Exact 2014 Stage04 page-05 binary and source boundary, no LP2 key inference.

Verifies the original server-status response, landing-page 512-hex object,
complete forward-JPEG/OOB/reversed-JPEG byte layout, and both equivalent
178/179-byte matrix extractions from pinned contemporaneous archives.
"""
from __future__ import annotations

import hashlib
import subprocess
from pathlib import Path
from urllib.request import Request, urlopen

K_COMMIT="76d3ee8c762f60025822c8c05edbf31351636469"
N_COMMIT="ade9a02889ef8acbc8cde8edbfd0a785c369f4c3"
K_ROOT=f"https://raw.githubusercontent.com/krisyotam/cicada3301/{K_COMMIT}/puzzles/2014/assets/stage04/"
K_ARCHIVE_ROOT=f"https://raw.githubusercontent.com/krisyotam/cicada3301/{K_COMMIT}/archives/cijhho/assets/2014/"
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

    # The adjacent landing page is a separate object: marker plus 512 hex chars.
    landing=obtain(K_ROOT+"fv7lyucmeozzd5j4.onion/index.html")
    verify(landing,524,"81837b8d5e89f6a31731b84a217a6fdeaa62aff8","Stage04 landing page")
    landing_lines=landing.splitlines()
    assert len(landing_lines)==2 and landing_lines[0]==b"<!--1033-->"
    assert len(landing_lines[1])==512 and all(c in b"0123456789abcdefABCDEF" for c in landing_lines[1])
    local_landing=Path(__file__).resolve().parents[1]/"resources/external/2014-stage04-index.html"
    assert local_landing.read_bytes()==landing

    # A preserved companion snapshot shows the ordinary Apache mod_status fields.
    status_snapshot=obtain(K_ARCHIVE_ROOT+"li676-224_server-status_orig.txt")
    verify(status_snapshot,17476,"0f36e924b18642f94b29e719aac5f6a21df0ffd7","archived Apache status snapshot")
    for field in (b"Apache Server Status",b"Server Version: Apache/2.2.22",b"Server Built:",
                  b"Current Time:",b"Restart Time:",b"Parent Server Generation:",
                  b"Server uptime:",b"Total accesses:",b"CPU Usage:",
                  b"requests currently being processed"):
        assert field in status_snapshot, field

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

    # Exhaustive byte layout of the 673,066-byte server-status object:
    # [336,353-byte JPEG][360-byte OOB field][336,353-byte reversed JPEG].
    middle=image[336353:336713]
    tail=image[336713:]
    assert len(image)==673066
    assert len(middle)==360 and len(tail)==336353
    assert middle[:3]==b"\n\na"
    hex_window=middle[3:]
    assert len(hex_window)==357 and all(c in b"0123456789abcdefABCDEF" for c in hex_window)
    assert tail==jpeg[::-1], "the complete suffix must be the exact byte reversal of the first JPEG"
    assert image==jpeg+middle+jpeg[::-1]

    # The pinned Stage04 README extracts all 360 OOB bytes, reverses them,
    # and decodes 179 bytes (the square text plus its final LF).
    full_matrix=run_xxd(middle[::-1])
    verify(full_matrix,179,"faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd","complete 360-byte OOB matrix")
    archived_matrix=obtain(K_ROOT+"matrix")
    verify(archived_matrix,179,"faba9f1780d667a0ecd7d9499b41a1f8fbc5dbbd","pinned 2014 matrix")
    assert full_matrix==archived_matrix==matrix+b"\n"

    # The preserved OOB text copy removes the two leading linefeeds and
    # appends one final LF; it is the same hex stream, not another field.
    oob_archive=obtain(K_ROOT+"server-status.data")
    verify(oob_archive,359,"0caa28ad1f9b32528019a3c27a16f38258ffb51e","archived OOB hex text")
    assert oob_archive==middle[2:]+b"\n"

    # In the shorter 357-character extraction, the final 0 nibble is dropped.
    # In the complete 360-byte extraction, the leading 'a' nibble pairs with
    # that 0 to make the matrix's final 0x0a line terminator.
    reversed_hex=bytes(c for c in middle[::-1] if c in b"0123456789abcdefABCDEF")
    assert len(reversed_hex)==358 and reversed_hex[-2:]==b"0a"
    assert full_matrix==matrix+b"\n"

    print("EXACT_5X5_MATRIX",actual)
    print("ORIGINAL_MATRIX_TEXT_178",repr(matrix))
    print("ORIGINAL_MATRIX_TEXT_179",repr(full_matrix))
    print("IMAGE_LAYOUT",{"jpeg":[0,336353],"oob":[336353,336713],"reversed_jpeg":[336713,673066]})
    print("REVERSED_SUFFIX_EXACT",tail==jpeg[::-1])
    print("OOB_HEX_CHARACTERS",len(hex_window))
    # The standalone 2013-dated Wisdom source's original provenance is a
    # separate question, not settled by 2014 image-identity evidence.
    print("INSTRUCTION_BOUNDARY","byte reversal + GP prime-sum reconstruct the original 2014 square; no original response directly instructs LP2 page, cipher or cardinal state")

if __name__=="__main__":
    main()
