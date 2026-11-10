"""Scan LP2 source-JPEG quantized AC bitplanes for unkeyed file framing.

Compile the companion libjpeg coefficient tools into a private temporary
directory. All original images are read-only; the positive plant is temporary.
The result bounds a declared extraction family, not arbitrary steganography.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import subprocess
import tempfile
import zlib

HERE = Path(__file__).resolve().parent
BIT_REVERSE = bytes(int(f"{i:08b}"[::-1], 2) for i in range(256))
SIGNATURES = {
    "gzip": bytes.fromhex("1f8b08"),
    "zip": bytes.fromhex("504b0304"),
    "png": bytes.fromhex("89504e470d0a1a0a"),
    "pdf": b"%PDF-",
    "bzip2": b"BZh",
    "xz": bytes.fromhex("fd377a585a00"),
    "7zip": bytes.fromhex("377abcaf271c"),
    "rar": b"Rar!\x1a\x07",
    "sqlite": b"SQLite format 3\x00",
    "ogg": b"OggS",
    "elf": b"\x7fELF",
    "ascii-pgp": b"-----BEGIN PGP",
    "cicada": b"cicada",
    "CICADA": b"CICADA",
}


def compile_native(source: Path, output: Path, cc: str) -> None:
    subprocess.run(
        [cc, "-std=c11", "-O2", "-Wall", "-Wextra",
         str(source), "-ljpeg", "-o", str(output)],
        check=True
    )


def shift_prefix(data: bytes, shift: int, little_bits: bool, size: int = 132) -> bytes:
    """Reframe packed MSB-first DCT bits by an offset in the range 0..7."""
    n = min(size, (len(data) * 8 - shift) // 8)
    if shift == 0:
        out = data[:n]
    else:
        out = bytes(
            ((data[i] << shift) & 255) | (data[i + 1] >> (8 - shift))
            for i in range(n)
        )
    return out.translate(BIT_REVERSE) if little_bits else out


def whole_reframe(data: bytes, shift: int, little_bits: bool) -> bytes:
    n = (len(data) * 8 - shift) // 8
    if shift == 0:
        out = data
    else:
        out = bytes(
            ((data[i] << shift) & 255) | (data[i + 1] >> (8 - shift))
            for i in range(n)
        )
    return out.translate(BIT_REVERSE) if little_bits else out


def plausible_zlib(a: int, b: int) -> bool:
    return a & 15 == 8 and a >> 4 <= 7 and ((a << 8) | b) % 31 == 0


def scan(inputs: list[Path], temp: Path, reader: Path, prefix_limit: int = 128) -> dict:
    views = 0
    zlib_candidates = 0
    valid_zlib: list[dict] = []
    signature_matches: list[dict] = []
    max_printable: list = [0, None]
    for source in inputs:
        outfile = temp / source.stem
        subprocess.run(
            [str(reader), str(source), str(outfile)],
            check=True, capture_output=True
        )
        for mode in (0, 1):
            for component in range(4):
                stream_file = temp / f"{source.stem}_m{mode}_c{component}.bin"
                raw = stream_file.read_bytes()
                if len(raw) < 132:
                    continue
                for shift in range(8):
                    for little in (False, True):
                        prefix = shift_prefix(raw, shift, little)
                        views += 1
                        preview = prefix[:128]
                        readable = sum(32 <= c <= 126 for c in preview)
                        if readable > max_printable[0]:
                            label = f"{source.name}/m{mode}/c{component}/shift{shift}/LSB{little}"
                            max_printable = [readable, label]
                        for name, magic in SIGNATURES.items():
                            pos = prefix.find(magic, 0, prefix_limit)
                            if pos >= 0:
                                signature_matches.append({
                                    "source": source.name, "mode": mode,
                                    "component": component, "shift": shift,
                                    "little_bits": little, "offset": pos,
                                    "type": name
                                })
                        positions = [
                            i for i in range(prefix_limit)
                            if plausible_zlib(prefix[i], prefix[i + 1])
                        ]
                        zlib_candidates += len(positions)
                        if positions:
                            framed = whole_reframe(raw, shift, little)
                            for pos in positions:
                                try:
                                    d = zlib.decompressobj()
                                    result = d.decompress(framed[pos:])
                                    result += d.flush()
                                except zlib.error:
                                    continue
                                if d.eof:
                                    valid_zlib.append({
                                        "source": source.name, "mode": mode,
                                        "component": component, "shift": shift,
                                        "little_bits": little, "offset": pos,
                                        "decoded_bytes": len(result),
                                        "preview": repr(result[:128])
                                    })
    return {
        "source_images": len(inputs),
        "view_conventions": views,
        "prefix_bytes_tested": prefix_limit,
        "zlib_candidate_headers": zlib_candidates,
        "complete_valid_zlib": valid_zlib,
        "other_signature_matches": signature_matches,
        "best_printable_per_128": max_printable
    }


def positive_control(source: Path, temp: Path, reader: Path, planter: Path) -> dict:
    message = b"LIBER PRIMUS DCT PLANTED POSITIVE 3301"
    payload = zlib.compress(message)
    planted = temp / "planted-control.jpg"
    result = subprocess.run(
        [str(planter), str(source), str(planted), payload.hex()],
        check=True, text=True, capture_output=True
    )
    subprocess.run(
        [str(reader), str(planted), str(temp / "planted-control")],
        check=True, capture_output=True
    )
    bits = (temp / "planted-control_m0_c1.bin").read_bytes()
    if bits[:len(payload)] != payload:
        raise AssertionError("Embedded binary frame not recovered exactly")
    if zlib.decompress(bits) != message:
        raise AssertionError("Embedded compressed plaintext failed to round trip")
    return {
        "original_image": source.name, "bytes": len(payload),
        "recovered_payload_bytes": len(payload),
        "recovered_message": message.decode(),
        "modifications": result.stdout.strip()
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--images", type=Path,
        default=HERE.parent / "resources" / "liber-primus"
    )
    parser.add_argument("--cc", default="gcc", help="C compiler with libjpeg")
    args = parser.parse_args()
    scans = [args.images / f"{i:02d}.jpg" for i in range(17, 75)]
    for source in scans:
        if not source.is_file():
            raise FileNotFoundError(source)
    with tempfile.TemporaryDirectory(prefix="lp2-jpeg-dct-") as scratch:
        temp = Path(scratch)
        reader, planter = temp / "reader", temp / "planter"
        compile_native(HERE / "jpeg_dct_frame_extract.c", reader, args.cc)
        compile_native(HERE / "jpeg_dct_plant_control.c", planter, args.cc)
        control = positive_control(scans[0], temp, reader, planter)
        result = scan(scans, temp, reader)
    print(json.dumps({
        "method": ("MCU-order quantized AC magnitude parity; abs>1 and abs>0; "
            "all or Y,Cb,Cr; eight shifts and two byte-bit orders; "
            "first 128 bytes for framing"),
        "positive_control": control, "original": result
    }, indent=2))


if __name__ == "__main__":
    main()
