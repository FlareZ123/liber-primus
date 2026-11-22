#!/usr/bin/env python3
"""Test literal strings in the unverified 2019 Stack Exchange destination claim.

This does not hash the missing historical page body or media. It tests only
13 strings explicitly recoverable from that answer against five 512-bit
candidate digests, with known-answer checks for each implementation.
"""
import hashlib
import json
import subprocess

TARGET = (
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
ABC = b"abc"
KNOWN = {
    "sha512": "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
    "sha3_512": "b751850b1a57168a5693cd924b6b096e08f621827444f70d884f5d0240d2712e10e116e9192af3c91a7ec57647e3934057340b4cf408d5a56592f8274eec53f0",
    "blake2b512": "ba80a53f981c4d0d6a2797b69f12f6e94c212f14685ac4b74b12bb6fdbffa2d17d87c5392aab792dc252d5de4533cc9518d38aa8dbf1925ab92386edd4009923",
    "shake256_64": "483366601360a8771c6863080cc4114d8db44530f8f1e1ee4f94ea37e78b5739d5a15bef186a5386c75744c0527e1faa9f8726e462a12a4feb06bd8801e751e4",
    "whirlpool": "4e2448a4c6f486bb16b6562c73b4020bf3043e3a731bce721ae1b303d97e6d4c7181eebdb6c57e277d0e34957114cbd6c797fc9d95d8b582d225292076d4eef5",
}


def whirlpool(data: bytes) -> str:
    """Use OpenSSL 3's legacy provider for the historical Whirlpool digest."""
    result = subprocess.run(
        ["openssl", "dgst", "-provider", "legacy", "-whirlpool"],
        input=data, capture_output=True, check=True,
    )
    digest = result.stdout.decode("ascii").strip().split()[-1].lower()
    if len(digest) != 128:
        raise RuntimeError(f"unexpected Whirlpool output: {result.stdout!r}")
    return digest


def digests(data: bytes) -> dict[str, str]:
    return {
        "sha512": hashlib.sha512(data).hexdigest(),
        "sha3_512": hashlib.sha3_512(data).hexdigest(),
        "blake2b512": hashlib.blake2b(data, digest_size=64).hexdigest(),
        "shake256_64": hashlib.shake_256(data).hexdigest(64),
        "whirlpool": whirlpool(data),
    }


assert digests(ABC) == KNOWN

# The 2019 answer gives this onion and the associated clearnet domain/video.
# Only the bare strings and conventional URL forms explicitly in that thread
# are included; no hostname/path guessing is performed.
CANDIDATES = [
    "dxwd42hgpd7qrccm.onion",
    "http://dxwd42hgpd7qrccm.onion",
    "http://dxwd42hgpd7qrccm.onion/",
    "https://dxwd42hgpd7qrccm.onion",
    "https://dxwd42hgpd7qrccm.onion/",
    "1711141131131.xyz",
    "http://1711141131131.xyz",
    "http://1711141131131.xyz/",
    "https://1711141131131.xyz",
    "https://1711141131131.xyz/",
    "cicada_317.mp4",
    "http://1711141131131.xyz/cicada_317.mp4",
    "https://1711141131131.xyz/cicada_317.mp4",
]

results = []
for candidate in CANDIDATES:
    values = digests(candidate.encode("ascii"))
    results.append({
        "candidate": candidate,
        "bytes_hex": candidate.encode("ascii").hex(),
        "matches": [name for name, digest in values.items() if digest == TARGET],
        "digests": values,
    })

hits = [(row["candidate"], name) for row in results for name in row["matches"]]
assert not hits
print(json.dumps({
    "source": "2019 Tor Stack Exchange answer; unverified claim linking dxwd42hgpd7qrccm.onion to 1711141131131.xyz and cicada_317.mp4",
    "target": TARGET,
    "candidate_count": len(CANDIDATES),
    "algorithms": list(KNOWN),
    "comparison_count": len(CANDIDATES) * len(KNOWN),
    "matches": hits,
    "results": results,
    "scope": "Literal strings only; no page HTML, media bytes, redirects, or unarchived onion response were available.",
}, indent=2))
