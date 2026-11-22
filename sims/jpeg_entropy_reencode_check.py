"""Exact JPEG coding reconstruction of the 58 LP2 source images.

Needs the libjpeg-compatible C headers/compiler. This checks container coding
and entropy table freedom, not deliberate pixel/DCT coefficient steganography.
"""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / 'resources' / 'liber-primus'
SOURCE = ROOT / 'sims' / 'jpeg_entropy_reencode.c'


def strip_app2_before_scan(jpeg):
    """Discard the original ICC APP2 segment while retaining all other bytes."""
    assert jpeg.startswith(b'\xff\xd8')
    pos = 2
    output = bytearray(jpeg[:2])
    count = 0
    while pos < len(jpeg):
        start = pos
        assert jpeg[pos] == 0xff, 'invalid marker boundary'
        while jpeg[pos] == 0xff:
            pos += 1
        marker = jpeg[pos]
        pos += 1
        if marker in (0xd9, 0xda):
            output.extend(jpeg[start:])
            return bytes(output), count
        assert marker != 0x01 and not 0xd0 <= marker <= 0xd7
        length = int.from_bytes(jpeg[pos:pos+2], 'big')
        assert length >= 2
        end = pos + length
        assert end <= len(jpeg)
        if marker == 0xe2:
            assert jpeg[pos+2:pos+14] == b'ICC_PROFILE\x00'
            assert end - start == 2594
            count += 1
        else:
            output.extend(jpeg[start:end])
        pos = end
    raise AssertionError('missing SOS/EOI marker')


def run():
    with tempfile.TemporaryDirectory(prefix='lp2-jpeg-entropy-') as temp:
        executable = Path(temp) / 'reencode'
        subprocess.run(['cc', '-O2', str(SOURCE), '-ljpeg', '-o', str(executable)], check=True)
        matches = []
        for number in range(17, 75):
            original = (IMAGES / f'{number:02}.jpg').read_bytes()
            sans_icc, icc_count = strip_app2_before_scan(original)
            assert icc_count == 1
            output = Path(temp) / f'{number:02}-optimized.jpg'
            subprocess.run([str(executable), str(IMAGES / f'{number:02}.jpg'), str(output), '1'], check=True)
            reconstructed = output.read_bytes()
            matches.append(sans_icc == reconstructed)
            if not matches[-1]:
                raise AssertionError(f'image {number:02}: distinct entropy coding after ICC removal')
        original = (IMAGES / '17.jpg').read_bytes()
        alternative = Path(temp) / '17-nonoptimized.jpg'
        reoptimized = Path(temp) / '17-reoptimized.jpg'
        subprocess.run([str(executable), str(IMAGES / '17.jpg'), str(alternative), '0'], check=True)
        subprocess.run([str(executable), str(alternative), str(reoptimized), '1'], check=True)
        assert alternative.read_bytes() != reoptimized.read_bytes(), 'control did not introduce coding variation'
        assert reoptimized.read_bytes() == strip_app2_before_scan(original)[0], 'control DCT changed unexpectedly'
        print(json.dumps({
            'LP2_images': len(matches),
            'exact_after_ICC_removal': sum(matches),
            'removed_bytes_each': 2594,
            'positive_control_nonoptimized_detected': True,
            'first_image_sha256': hashlib.sha256(original).hexdigest(),
        }, indent=2))


if __name__ == '__main__':
    run()
