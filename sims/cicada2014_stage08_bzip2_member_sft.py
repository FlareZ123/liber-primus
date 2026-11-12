#!/usr/bin/env python3
"""SFT: audit the original archived 2014 Stage08 bzip2 stream and payload."""
import bz2
import hashlib
import re
import urllib.request

SOURCE_COMMIT = "76d3ee8c762f60025822c8c05edbf31351636469"
SOURCE_ROOT = (
    "https://raw.githubusercontent.com/krisyotam/cicada3301/"
    f"{SOURCE_COMMIT}/puzzles/2014/assets/stage08/"
)
EXPECTED_GIT_SHA = {
    "index.bz2": "c568e481008fba993741acb77a7f12492b19afa6",
    "index": "57478039d8dbb4b20d16aff7f9c3af0f2f13da8d",
    "index.1": "07d41285504706fabd051d227ef50d1e94cbf3a6",
    "index.2": "9ad6f890e3ea4ae0951c5ba237f2152dbdc16eca",
    "index.3": "c40a65a20cc0dcdad52accec3e816274442c817e",
}

def original(name):
    with urllib.request.urlopen(SOURCE_ROOT + name, timeout=35) as response:
        data = response.read()
    git_sha = hashlib.sha1(b"blob " + str(len(data)).encode()
                           + b"\0" + data).hexdigest()
    assert git_sha == EXPECTED_GIT_SHA[name], (name, git_sha)
    print(f"SOURCE {name}: {len(data)} bytes, Git blob {git_sha}, "
          f"SHA256 {hashlib.sha256(data).hexdigest()}")
    return data

def main():
    packed = original("index.bz2")
    expected = original("index")
    cursor = 0
    members = []
    trailer = b""
    while cursor < len(packed):
        if packed[cursor:cursor + 4] not in tuple(
            ("BZh" + str(i)).encode() for i in range(1, 10)
        ):
            trailer = packed[cursor:]
            break
        decompressor = bz2.BZ2Decompressor()
        plain = decompressor.decompress(packed[cursor:])
        assert decompressor.eof, f"Unterminated bzip2 member at {cursor}"
        used = len(packed) - cursor - len(decompressor.unused_data)
        assert used > 0
        members.append((cursor, used, plain))
        print(f"MEMBER {len(members)}: start={cursor}, compressed={used}, "
              f"uncompressed={len(plain)}, SHA256={hashlib.sha256(plain).hexdigest()}")
        cursor += used
    print(f"MEMBERS={len(members)} TRAILER_LENGTH={len(trailer)} "
          f"TRAILER_HEX={trailer[:64].hex()}")
    assert len(members) == 1 and not trailer, "Additional member/trailer requires investigation"
    assert members[0][2] == expected, "Original stream differs from archived signed plaintext"
    print("EXACT_SOURCE_IDENTITY: bzip2 output equals complete archived Stage08/index")

    text = expected.decode("ascii")
    assert text.startswith("-----BEGIN PGP SIGNED MESSAGE-----\n")
    assert text.rstrip().endswith("-----END PGP SIGNATURE-----")
    assert text.count("-----BEGIN PGP SIGNATURE-----") == 1
    print("SIGNED_ENVELOPE: single clear-signed body, one PGP signature, "
          "no post-signature bytes")

    blocks = []
    buf = []
    for line in text.splitlines():
        line = line.strip()
        if re.fullmatch(r"[0-9a-fA-F]{20,}", line):
            buf.append(line)
        elif buf:
            blocks.append("".join(buf).lower())
            buf = []
    if buf:
        blocks.append("".join(buf).lower())
    print(f"HEX_BLOCKS={len(blocks)} bytes={[len(x) // 2 for x in blocks]}")
    assert len(blocks) == 3, "Unexpected number of original hex objects"
    for n, (content, suffix) in enumerate(zip(blocks, ("index.1", "index.2", "index.3")), 1):
        recorded = original(suffix).decode("ascii")
        normalized = "".join(recorded.split()).lower()
        assert content == normalized, f"Hex object {n} differs from archived split"
        assert len(content) % 2 == 0
        blob = bytes.fromhex(content)
        if n in (1, 2):
            assert blob.startswith(b"\xff\xd8") and blob.endswith(b"\xff\xd9")
        else:
            assert blob.startswith(b"\xff\xf3")
        print(f"PAYLOAD {n}: decoded_bytes={len(blob)} "
              f"SHA256={hashlib.sha256(blob).hexdigest()} "
              f"header={blob[:8].hex()}")
    print("PASS: source-exact Stage08 bzip2 member/trailer and signed payload audit")

if __name__ == "__main__":
    main()
