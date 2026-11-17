"""Original 75-page OutGuess gate for the single conditional 32-seam-byte HEX key.

Windows Python 3.12; requires C compiler and libjpeg. Source-native extraction
is delegated to sims/outguess_extract.py and sims/outguess_bitmap_dump.c.
Read-only. No guessed passwords, altered JPEGs, or fitted file signatures.
"""
from collections import Counter
from hashlib import sha256
from pathlib import Path
import json
import re
import subprocess
import tempfile

from outguess_extract import extract, header_is_source_forced

BASE = Path(__file__).resolve().parents[1]
KEY = ("61f9cac6505456feff728edc483f49ed"
       "780ad221c0f0839c007f063b446a1671")
EXPECTED = {
    31: "e8096bc31d40828946d636a42b7f5e735a5038d4ee4919ee5919d1e1491a82b0",
    49: "aff3adcfcc9bbd14a319d035f9c59327e772a2b7398b3e15e5f0ac48d3463cec",
    72: "94e0c8cf7692e82fd2ad6cd35e81b36a83567719adb551060df730c79606f63d"
}


def bitmap(binary, file):
    proc = subprocess.run([str(binary), str(file)], capture_output=True,
                          check=True)
    match = re.search(rb"eligible_coefficients=(\d+) bitmap_bytes=(\d+)",
                      proc.stderr)
    assert match
    bits = int(match[1])
    assert len(proc.stdout) == int(match[2])
    return proc.stdout, bits


def test():
    with tempfile.TemporaryDirectory(prefix="lp2-native-outguess-") as dirname:
        binary = Path(dirname) / "bitmap"
        subprocess.run(["cc", "-O2", "-o", str(binary),
                        str(Path(__file__).with_name("outguess_bitmap_dump.c")),
                        "-ljpeg"], check=True, capture_output=True)
        signed = BASE / "resources/historical/cicada2016-4gq25.jpg"
        original, bitcount = bitmap(binary, signed)
        decoded, _ = extract(original, bitcount, "")
        expected = (BASE / "resources/historical/cicada2016-4gq25-outguess.asc").read_bytes()
        assert decoded == expected and len(decoded) == 1136

        forced, completed, rejected = 0, 0, 0
        headers = Counter()
        sample = {}
        credible = []
        for page in range(75):
            source = BASE / "resources/liber-primus" / f"{page:02}.jpg"
            original, bitcount = bitmap(binary, source)
            forced += int(header_is_source_forced(original, bitcount))
            try:
                payload, metadata = extract(original, bitcount, KEY)
            except ValueError:
                rejected += 1
                continue
            completed += 1
            headers[metadata["header_hex"]] += 1
            if metadata["magic"] or metadata["printable_fraction"] > .9:
                credible.append(page)
            if page in EXPECTED:
                sample[page] = sha256(payload).hexdigest()
    assert len(expected) == 1136
    assert forced == 65
    assert completed == 73 and rejected == 2
    assert not credible
    assert headers["53362e31"] >= 64
    assert sample == EXPECTED
    return {"test": "original 75 JPEGs, one exact seam-key text password",
            "signed2016PositiveBytes": len(expected),
            "forcedEncryptedHeaders": forced, "apparentCompletions": completed,
            "failures": rejected, "recoveredFileHeaders": credible,
            "headersOnCompleted": dict(headers),
            "result": "No valid file or text; source-forced FFFFFFFF is a false positive"}


if __name__ == "__main__":
    print(json.dumps(test(), indent=2))
