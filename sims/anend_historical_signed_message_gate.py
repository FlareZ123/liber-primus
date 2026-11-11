#!/usr/bin/env python3
"""Source-pinned direct-preimage gates for the p56 AN END digest."""
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
EXPECTED_IMAGE_GIT_BLOB = "22027296dcd7df53c5127e6aadbabeaf3223f72d"
EXPECTED_KEY_GIT_BLOB = "d44aec389e2f346c6b9d149d4c61e890f62979c9"
EXPECTED_KEY_FINGERPRINT = "6d854cd7933322a601c3286d181f01e57a35090f"
EXPECTED_KEY_ID = "181f01e57a35090f"


def git_blob_sha1(raw: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(raw)).encode("ascii") + b"\0" + raw).hexdigest()


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

    mpi_at = digest_prefix_at + 2
    mpi_bits = int.from_bytes(packet[mpi_at:mpi_at + 2], "big")
    mpi_size = (mpi_bits + 7) // 8
    mpi_encoded = packet[mpi_at:mpi_at + 2 + mpi_size]
    mpi_value = packet[mpi_at + 2:mpi_at + 2 + mpi_size]
    if mpi_at + 2 + mpi_size != len(packet):
        raise ValueError("Unexpected trailing data after RSA signature MPI")
    return {
        "signed_prefix": signed_prefix, "sig_armor": sig_armor, "sig_packet": sig_packet,
        "clear": clear, "signed_text": signed_text, "hash_id": hash_id,
        "digest_prefix": digest_prefix, "hashed_material": hashed_material,
        "trailer": trailer, "signature_digest": signature_digest,
        "signature_mpi_bits": mpi_bits, "signature_mpi_encoded": mpi_encoded,
        "signature_mpi_value": mpi_value,
    }


def parse_packets(data: bytes):
    packets, pos = [], 0
    while pos < len(data):
        start = pos
        header = data[pos]
        pos += 1
        if not header & 0x80:
            raise ValueError("Invalid OpenPGP packet header")
        if header & 0x40:
            tag = header & 0x3F
            first = data[pos]
            pos += 1
            if first < 192:
                length = first
            elif first < 224:
                length = ((first - 192) << 8) + data[pos] + 192
                pos += 1
            elif first == 255:
                length = int.from_bytes(data[pos:pos + 4], "big")
                pos += 4
            else:
                raise ValueError("Partial packet lengths are not used by this pinned key")
        else:
            tag = (header >> 2) & 0x0F
            length_type = header & 0x03
            if length_type == 0:
                length = data[pos]
                pos += 1
            elif length_type == 1:
                length = int.from_bytes(data[pos:pos + 2], "big")
                pos += 2
            elif length_type == 2:
                length = int.from_bytes(data[pos:pos + 4], "big")
                pos += 4
            else:
                length = len(data) - pos
        body = data[pos:pos + length]
        pos += length
        if len(body) != length:
            raise ValueError("Truncated OpenPGP packet")
        packets.append({"tag": tag, "body": body, "raw": data[start:pos]})
    return packets


def parse_public_key(raw: bytes):
    if git_blob_sha1(raw) != EXPECTED_KEY_GIT_BLOB:
        raise ValueError("Pinned public-key armor Git blob mismatch")
    lines = raw.splitlines()
    encoded, started = [], False
    for line in lines:
        if line.startswith(b"-----BEGIN"):
            continue
        if not started and not line:
            started = True
            continue
        if line.startswith(b"-----END") or line.startswith(b"="):
            break
        if not started and b":" in line:
            continue
        if started:
            encoded.append(line.strip())
    packet_stream = base64.b64decode(b"".join(encoded), validate=True)
    packets = parse_packets(packet_stream)
    primary = next(p for p in packets if p["tag"] == 6)
    uid_packet = next(p for p in packets if p["tag"] == 13)
    body = primary["body"]
    if body[0] != 4 or body[5] != 1:
        raise ValueError("Expected a version-4 RSA primary public key")
    offset = 6

    def read_mpi():
        nonlocal offset
        bits = int.from_bytes(body[offset:offset + 2], "big")
        offset += 2
        size = (bits + 7) // 8
        value = body[offset:offset + size]
        encoded_mpi = body[offset - 2:offset + size]
        offset += size
        return bits, value, encoded_mpi

    modulus_bits, modulus, modulus_mpi = read_mpi()
    exponent_bits, exponent, exponent_mpi = read_mpi()
    fingerprint_input = b"\x99" + len(body).to_bytes(2, "big") + body
    fingerprint = hashlib.sha1(fingerprint_input).digest()
    key_id = fingerprint[-8:]
    uid_text = uid_packet["body"].decode("utf-8")
    if fingerprint.hex() != EXPECTED_KEY_FINGERPRINT or key_id.hex() != EXPECTED_KEY_ID:
        raise ValueError(f"Unexpected key identity: fingerprint={fingerprint.hex()} keyid={key_id.hex()}")
    if not key_id.hex().endswith("7a35090f") or modulus_bits != 4096 or int.from_bytes(exponent, "big") != 65537:
        raise ValueError("Public-key parameters do not match the 7A35090F RSA key")
    if uid_text != "Cicada 3301 (845145127)":
        raise ValueError(f"Unexpected primary key UID: {uid_text!r}")

    candidates = {
        "key_armour": raw,
        "key_packet_stream": packet_stream,
        "primary_key_packet": primary["raw"],
        "primary_key_body": body,
        "fingerprint_bytes": fingerprint,
        "fingerprint_hex_ascii": fingerprint.hex().encode("ascii"),
        "key_id_bytes": key_id,
        "key_id_hex_ascii": key_id.hex().encode("ascii"),
        "key_id_suffix_7A35090F_ascii": b"7A35090F",
        "rsa_modulus_bytes": modulus,
        "rsa_exponent_bytes": exponent,
        "user_id_packet": uid_packet["raw"],
        "user_id_text": uid_text.encode("utf-8"),
        "user_id_number_845145127": b"845145127",
    }
    return {
        "candidates": candidates, "fingerprint": fingerprint.hex(), "key_id": key_id.hex(),
        "uid": uid_text, "modulus_bits": modulus_bits, "exponent": int.from_bytes(exponent, "big"),
        "packet_count": len(packets), "packet_stream_bytes": len(packet_stream),
    }


def digest_families():
    return {
        "SHA-512": lambda b: hashlib.sha512(b).digest(),
        "SHA3-512": lambda b: hashlib.sha3_512(b).digest(),
        "BLAKE2b-512": lambda b: hashlib.blake2b(b, digest_size=64).digest(),
        "SHAKE256-512": lambda b: hashlib.shake_256(b).digest(64),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--2016", dest="p2016", default="resources/historical/cicada2016-4gq25-outguess.asc")
    ap.add_argument("--2017", dest="p2017", default="resources/historical/cicada2017-yEiTHhvF.asc")
    ap.add_argument("--image", default="resources/historical/cicada2016-4gq25.jpg")
    ap.add_argument("--key", default="resources/historical/cicada-3301-2012-public-key.asc")
    args = ap.parse_args()
    algs = digest_families()
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
            "rsa_signature_mpi_encoded": parsed["signature_mpi_encoded"],
            "rsa_signature_mpi_value": parsed["signature_mpi_value"],
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
        print(f"  RSA signature MPI bits={parsed['signature_mpi_bits']} value-bytes={len(parsed['signature_mpi_value'])}")
        print(f"  representations={len(candidates)} comparisons={len(candidates)*len(algs)} matches={hits}")

    image = Path(args.image).read_bytes()
    image_git_blob = git_blob_sha1(image)
    if len(image) != 26342 or image_git_blob != EXPECTED_IMAGE_GIT_BLOB:
        raise SystemExit(f"2016 JPEG source mismatch: bytes={len(image)} git_blob={image_git_blob}")
    image_sha512 = hashlib.sha512(image).digest()
    total += 1
    if image_sha512 == TARGET:
        hits_all.append(("2016-image", "raw-image-bytes", "SHA-512"))
    print(f"2016 image: bytes={len(image)} git_blob={image_git_blob} SHA-512={image_sha512.hex()} match={image_sha512 == TARGET}")

    key_raw = Path(args.key).read_bytes()
    key = parse_public_key(key_raw)
    key_hits = []
    for name, payload in key["candidates"].items():
        total += 1
        if hashlib.sha512(payload).digest() == TARGET:
            key_hits.append(name)
            hits_all.append(("2012-public-key", name, "SHA-512"))
    print(f"2012 public key: bytes={len(key_raw)} git_blob={git_blob_sha1(key_raw)} packets={key['packet_count']} packet-stream-bytes={key['packet_stream_bytes']}")
    print(f"  fingerprint={key['fingerprint']} key-id={key['key_id']} UID={key['uid']!r} RSA={key['modulus_bits']} bits exponent={key['exponent']}")
    print(f"  direct SHA-512 representations={len(key['candidates'])} matches={key_hits}")
    print(f"target={TARGET.hex()}")
    print(f"total_comparisons={total} all_matches={hits_all}")


if __name__ == "__main__":
    main()
