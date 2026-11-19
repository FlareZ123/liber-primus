from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "resources" / "liber-primus"

C_SOURCE = r"""
#include <stdio.h>
#include <stdlib.h>
#include <jpeglib.h>

int main(int argc, char **argv) {
  if (argc != 3) return 2;
  FILE *in = fopen(argv[1], "rb");
  if (!in) return 3;
  FILE *out = fopen(argv[2], "wb");
  if (!out) { fclose(in); return 4; }

  struct jpeg_decompress_struct src;
  struct jpeg_compress_struct dst;
  struct jpeg_error_mgr srcerr, dsterr;
  src.err = jpeg_std_error(&srcerr);
  jpeg_create_decompress(&src);
  jpeg_stdio_src(&src, in);
  if (jpeg_read_header(&src, TRUE) != JPEG_HEADER_OK) return 5;
  jvirt_barray_ptr *coef = jpeg_read_coefficients(&src);

  dst.err = jpeg_std_error(&dsterr);
  jpeg_create_compress(&dst);
  jpeg_stdio_dest(&dst, out);
  jpeg_copy_critical_parameters(&src, &dst);
  dst.optimize_coding = TRUE;
  jpeg_write_coefficients(&dst, coef);
  jpeg_finish_compress(&dst);
  jpeg_finish_decompress(&src);
  jpeg_destroy_compress(&dst);
  jpeg_destroy_decompress(&src);
  fclose(out);
  fclose(in);
  return 0;
}
"""


def strip_app2(data: bytes) -> bytes:
    if data[:2] != b"\xff\xd8":
        raise AssertionError("not JPEG SOI")
    out = bytearray(data[:2])
    i = 2
    while i < len(data):
        if data[i] != 0xFF:
            raise AssertionError("unexpected byte before SOS")
        start = i
        while i < len(data) and data[i] == 0xFF:
            i += 1
        if i >= len(data):
            break
        marker = data[i]
        i += 1
        if marker == 0xDA:
            seglen = int.from_bytes(data[i:i + 2], "big")
            end = i + seglen
            out.extend(data[start:end])
            out.extend(data[end:])
            return bytes(out)
        if marker == 0xD9 or marker == 0x01 or 0xD0 <= marker <= 0xD8:
            out.extend(data[start:i])
            continue
        if i + 2 > len(data):
            raise AssertionError("truncated JPEG segment")
        seglen = int.from_bytes(data[i:i + 2], "big")
        end = i + seglen
        if end > len(data):
            raise AssertionError("truncated JPEG segment payload")
        if marker != 0xE2:
            out.extend(data[start:end])
        i = end
    raise AssertionError("SOS not found")


def main() -> None:
    missing = [p for p in (IMAGES / f"{i:02d}.jpg" for i in range(17, 75)) if not p.exists()]
    if missing:
        raise AssertionError(f"missing original JPEGs: {missing[:3]}")

    cc = shutil.which("cc") or shutil.which("gcc")
    if not cc:
        raise RuntimeError("C compiler not found; install a C compiler and libjpeg development headers")

    hashes: list[dict[str, object]] = []
    with tempfile.TemporaryDirectory(prefix="lp2-jpeg-reopt-") as tmp_name:
        tmp = Path(tmp_name)
        c_path = tmp / "reopt.c"
        exe = tmp / ("reopt.exe" if os.name == "nt" else "reopt")
        c_path.write_text(C_SOURCE, encoding="utf-8")
        subprocess.run([cc, "-O2", str(c_path), "-ljpeg", "-o", str(exe)], check=True)

        for scan in range(17, 75):
            source = IMAGES / f"{scan:02d}.jpg"
            rebuilt = tmp / f"{scan:02d}.jpg"
            subprocess.run([str(exe), str(source), str(rebuilt)], check=True)
            original = source.read_bytes()
            regenerated = rebuilt.read_bytes()
            without_icc = strip_app2(original)
            if without_icc != regenerated:
                first = next((i for i, (a, b) in enumerate(zip(without_icc, regenerated)) if a != b), None)
                raise AssertionError(
                    f"scan {scan:02d} differs after ICC removal at {first}; "
                    f"lengths {len(without_icc)} vs {len(regenerated)}"
                )
            hashes.append({
                "scan": scan,
                "original_sha256": hashlib.sha256(original).hexdigest(),
                "without_icc_sha256": hashlib.sha256(without_icc).hexdigest(),
                "bytes_without_icc": len(without_icc),
            })

    summary = {
        "tool": "libjpeg coefficient-domain transcode with optimize_coding=TRUE",
        "lp2_scans_checked": len(hashes),
        "byte_exact_after_removing_app2_icc": len(hashes),
        "mismatches": 0,
        "interpretation": (
            "For all LP2 originals, APP0/DQT/DHT/SOF0/SOS and entropy-coded scan bytes "
            "are exactly regenerated from the original quantized DCT coefficients by standard "
            "optimized libjpeg coding. Page-specific Huffman tables are therefore determined by "
            "image coefficients, not independent metadata payload bytes."
        ),
        "samples": [hashes[0], hashes[-1]],
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
