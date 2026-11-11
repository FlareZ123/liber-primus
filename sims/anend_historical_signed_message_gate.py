#!/usr/bin/env python3
"""Check whether the p56 AN END digest is a direct digest of 2016/2017 signed messages."""
from __future__ import annotations
import argparse
import base64
import hashlib
from pathlib import Path

TARGET = bytes.fromhex(
    "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a84"
    "25893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
)
EXPECTED = {
    "2016": "fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010",
    "2017": "c0e4adbd8aab8e85e9976d6a06c889d415e83cf1e76a0f8b56cad10406eea800",
}


def parse_clear_signed(raw: bytes):
    marker = b"-----BEGIN PGP SIGNATURE-----"
    at = raw.index(marker)
    signed_prefix, sig_armor = raw[:at], raw[at:]
    if b"\r\n\r\n" in signed_prefix:
        header_end = signed_prefix.index(b"\r\n\r\n") + 4
    else:
        header_end = signed_prefix.index(b"\n\n") + 2
    clear = signed_prefix[header_end:]
    encoded, started = [], False
    for line in sig_armor.splitlines()[1:]:
        if line.startswith(b"-----END PGP SIGNATURE-----") or line.startswith(b"="):
            break
        if not started and b":" in line:
            continue
        started = True
        encoded.append(line.strip())
    sig_packet = base64.b64decode(b"".join(encoded), validate=True)
    if len(sig_packet) < 3 or sig_packet[0] != 0x89:
        raise ValueError("Expected old-format OpenPGP signature packet")
    if int.from_bytes(sig_packet[1:3], "big") != len(sig_packet) - 3:
        raise ValueError("OpenPGP packet length mismatch")
    packet = sig_packet[3:]
    if packet[0] != 4:
        raise ValueError("Expected version-4 signature packet")
    hashed_len = int.from_bytes(packet[4:6], "big")
    hashed_end = 6 + hashed_len
    hashed_material = packet[:hashed_end]
    unhashed_len = int.from_bytes(packet[hashed_end:hashed_end + 2], "big")
    digest_prefix_at = hashed_end + 2 + unhashed_len
    digest_prefix = packet[digest_prefix_at:digest_prefix_at + 2]
    hash_id = packet[3]
    canonical = b"\r\n".join(line.rstrip(b" \t") for line in clear.splitlines())
    hash_fn = {2: hashlib.sha1, 10: hashlib.sha512}.get(hash_id)
    if hash_fn is None:
        raise ValueError(f"Unsupported OpenPGP hash algorithm id {hash_id}")
    trailer = b"\x04\xff" + len(hashed_material).to_bytes(4, "big")
    canonical_candidates = {}
    for n in range(5):
        candidate = canonical[:-2 * n] if n and canonical.endswith(b"\r\n" * n) else canonical
        digest = hash_fn(candidate + hashed_material + trailer).digest()
        if digest[:2] == digest_prefix:
            canonical_candidates[candidate] = digest
    if len(canonical_candidates) != 1:
        raise ValueError(f"Expected one canonical signed text, found {len(canonical_candidates)}")
    signed_text, signature_digest = next(iter(canonical_candidates.items()))
    return {
        "signed_prefix": signed_prefix, "sig_armor": sig_armor, "sig_packet": sig_packet,
        "clear": clear, "signed_text": signed_text, "hash_id": hash_id,
        "digest_prefix": digest_prefix, "hashed_material": hashed_material,
        "trailer": trailer, "signature_digest": signature_digest,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--2016", dest="p2016", default="resources/historical/cicada2016-4gq25-outguess.asc")
    ap.add_argument("--2017", dest="p2017", default="resources/historical/cicada2017-yEiTHhvF.asc")
    args = ap.parse_args()
    algs = {
        "SHA-512": lambda b: hashlib.sha512(b).digest(),
        "SHA3-512": lambda b: hashlib.sha3_512(b).digest(),
        "BLAKE2b-512": lambda b: hashlib.blake2b(b, digest_size=64).digest(),
        "SHAKE256-512": lambda b: hashlib.shake_256(b).digest(64),
    }
    total, hits_all = 0, []
    for year, path in (("2016", args.p2016), ("2017", args.p2017)):
        raw = Path(path).read_bytes()
        sha = hashlib.sha256(raw).hexdigest()
        if sha != EXPECTED[year]:
            raise SystemExit(f"{year} source SHA-256 mismatch: {sha}")
        parsed = parse_clear_signed(raw)
        candidates = {
            "full_armour": raw,
            "signed_prefix_including_headers": parsed["signed_prefix"],
            "cleartext_exact": parsed["clear"],
            "cleartext_canonical_signed": parsed["signed_text"],
            "signature_armour": parsed["sig_armor"],
            "signature_packet": parsed["sig_packet"],
            "openpgp_signature_digest_input": parsed["signed_text"] + parsed["hashed_material"] + parsed["trailer"],
            "openpgp_signature_digest": parsed["signature_digest"],
            "openpgp_signature_digest_hex_ascii": parsed["signature_digest"].hex().encode("ascii"),
            "hash_header_plus_cleartext": parsed["signed_prefix"][parsed["signed_prefix"].index(b"Hash:"):],
            "cleartext_lf_only": parsed["clear"].replace(b"\r\n", b"\n"),
            "cleartext_without_trailing_space": b"\r\n".join(x.rstrip(b" \t") for x in parsed["clear"].splitlines()),
        }
        hits = []
        for name, payload in candidates.items():
            for alg, fn in algs.items():
                total += 1
                if fn(payload) == TARGET:
                    hits.append((name, alg))
        hits_all.extend((year, *x) for x in hits)
        print(f"{year}: sha256={sha} bytes={len(raw)} cleartext={len(parsed['clear'])} canonical={len(parsed['signed_text'])}")
        print(f"  OpenPGP hash id={parsed['hash_id']} digest-prefix={parsed['digest_prefix'].hex()} signature-digest={parsed['signature_digest'].hex()}")
        print(f"  representations={len(candidates)} comparisons={len(candidates)*len(algs)} matches={hits}")
    print(f"target={TARGET.hex()}")
    print(f"total_comparisons={total} all_matches={hits_all}")


if __name__ == "__main__":
    main()
