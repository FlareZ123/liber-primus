#!/usr/bin/env python3
"""Frozen 2014 Stage09 OutGuess audit of the previously unextracted first JPEG.

Archive README extracts index.4.jpg twice. Controls: images 2/3/4 must
reproduce their preserved 1234-byte signed outputs byte-for-byte. This SFT
asks precisely what image 1 emits under that same original zero-key command.
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path
import re
import subprocess
import tempfile
import urllib.request

ROOT = ("https://raw.githubusercontent.com/krisyotam/cicada3301/"
        "76d3ee8c762f60025822c8c05edbf31351636469/"
        "puzzles/2014/assets/stage09/")
PINS = {
    "index.1.jpg": ("bd270e45c58dfb6f0c50f9af60cf7104cf78e78e", 754662),
    "index.2.jpg": ("d80bea5ec6aac4eee0eebeaaed31840cb24c029d", 712733),
    "index.3.jpg": ("49253cf8e4c1cacda601c9507111f0c4bfe318b3", 703428),
    "index.4.jpg": ("754a18ce2d0b2f8bcdd03e0a0e458e2bc4912a0a", 2070134),
    "index.1.outguess": ("4cff459f0d0d6abb4c1d8879591fd085e420877a", 1234),
    "index.2.outguess": ("2f825249d5d37555053abf3b07d2fe8fb1def56b", 1234),
    "index.3.outguess": ("7d883e03ece7823fbfcfe906461084c55ea1525b", 1234),
    "index.4.outguess": ("4cff459f0d0d6abb4c1d8879591fd085e420877a", 1234),
}


def original(name: str) -> bytes:
    with urllib.request.urlopen(ROOT + name, timeout=35) as response:
        data = response.read()
    digest = hashlib.sha1(
        b"blob " + str(len(data)).encode("ascii") + b"\0" + data
    ).hexdigest()
    assert (digest, len(data)) == PINS[name], (name, len(data), digest)
    return data


def extract(image_path: Path, out_path: Path) -> tuple[int, bytes]:
    result = subprocess.run(
        ["outguess", "-r", str(image_path), str(out_path)],
        capture_output=True, text=True, timeout=45, check=False,
    )
    content = out_path.read_bytes() if out_path.exists() else b""
    print(f"EXTRACT {image_path.name}: return={result.returncode}, "
          f"bytes={len(content)}, sha256={hashlib.sha256(content).hexdigest()}, "
          f"stderr={result.stderr.strip()[:1300]!r}")
    return result.returncode, content


def main() -> None:
    folder = Path("stage09-first-image-output")
    folder.mkdir(exist_ok=True)
    images = {}
    archived = {}
    for index in range(1, 5):
        key = f"index.{index}.jpg"
        images[index] = original(key)
        (folder / key).write_bytes(images[index])
        marker = f"index.{index}.outguess"
        archived[index] = original(marker)
        print(f"SOURCE {key}: {len(images[index])} bytes; "
              f"archived {marker}: {len(archived[index])} bytes")
    assert archived[1] == archived[4]
    assert archived[1] != archived[2] != archived[3]
    print("ARCHIVE_INVARIANT first extracted file is byte-identical to fourth, "
          "as the archived README's duplicate index.4.jpg command predicts")
    recovered_by_index = {}
    for index in (4, 2, 3, 1):
        in_file = folder / f"index.{index}.jpg"
        out_file = folder / f"actual-index.{index}.outguess"
        code, recovered = extract(in_file, out_file)
        recovered_by_index[index] = recovered
        if index != 1:
            assert code == 0 and recovered == archived[index], (
                index, "archived original positive control failed"
            )
            print(f"POSITIVE index.{index}: exact {len(recovered)} "
                  "archived original signed bytes")
        else:
            if code == 0 and recovered.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----"):
                body = recovered.split(b"-----BEGIN PGP SIGNATURE-----", 1)[0]
                border = re.findall(rb"(?m)^([0-9])\1{15}\s*$", body)
                print(f"FIRST_IMAGE_NEW_SIGNED_MESSAGE sha256="
                      f"{hashlib.sha256(recovered).hexdigest()} "
                      f"first_border_digits={[x.decode() for x in border]}")
                print("FIRST_IMAGE_BODY_BEGIN", body.decode("utf-8")[:900])
            else:
                print("FIRST_IMAGE_NO_SIGNED_OUTPUT: explicit original result, "
                      "no unsigned text promoted")
    assert all(x.startswith(b"-----BEGIN PGP SIGNED MESSAGE-----")
               for x in recovered_by_index.values())
    def signed_body(raw: bytes) -> bytes:
        return raw.split(b"-----BEGIN PGP SIGNATURE-----", 1)[0]
    assert signed_body(recovered_by_index[1]) == signed_body(recovered_by_index[2])
    assert recovered_by_index[1] != recovered_by_index[2], (
        "The first image must retain its distinct 2014 signed packet"
    )
    expected_digits = {1: b"3", 2: b"3", 3: b"0", 4: b"1"}
    for i, raw in recovered_by_index.items():
        border = re.findall(rb"(?m)^([0-9])\1{15}\s*$", signed_body(raw))
        assert border == [expected_digits[i], expected_digits[i]], (i, border)
    print("FOUR_SOURCE_DIGITS=3301; archived duplicate image4 for image1 gives 1301")
    with tempfile.TemporaryDirectory(prefix="cicada2014-stage09-gpg-") as home:
        os.chmod(home, 0o700)
        key_path = Path("resources/control/cicada-3301-public-key.asc")
        importer = subprocess.run(
            ["gpg", "--homedir", home, "--batch", "--import", str(key_path)],
            capture_output=True, text=True, check=False,
        )
        assert importer.returncode == 0, importer.stderr
        for i in range(1, 5):
            fp = folder / f"actual-index.{i}.outguess"
            verify = subprocess.run(
                ["gpg", "--homedir", home, "--batch", "--status-fd", "1",
                 "--verify", str(fp)],
                capture_output=True, text=True, check=False,
            )
            assert verify.returncode == 0, (i, verify.stderr)
            assert ("[GNUPG:] VALIDSIG "
                    "6D854CD7933322A601C3286D181F01E57A35090F") in verify.stdout, (
                i, verify.stdout
            )
            print(f"PGP_VALID {i}: original Cicada key 6D854CD7933322A601C3286D181F01E57A35090F")
    print("PASS: independently restored original 2014 Stage09 source-order 3301 "
          "and four authentic verified PGP signatures")


if __name__ == "__main__":
    main()
