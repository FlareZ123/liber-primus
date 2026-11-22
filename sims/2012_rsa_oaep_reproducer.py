#!/usr/bin/env python3
"""Reproduce two 2012 Cicada RSA-email plaintexts using Crypt::RSA 1.99 semantics.

Inputs are the archived unknown.pem and another_unknown.pem payloads from
neuroretransmit/cicada@b13600373d3400d75ec4208198019f3d92a304dd.
The script uses the corresponding private-key/factor files from that archive.
It does not verify the PGP signatures or recover the original onion /NUM token.

Compatibility detail: Crypt::RSA::ES::OAEP 1.99 uses an encoded-message length
of k-1 (no leading Y octet), and its DataFormat::mgf1 increments its 4-byte
counter by hLen (20) rather than by 1. This module-specific MGF1 must be
reproduced; standards-compliant MGF1 does not decode these historical blocks.
"""
import base64
import hashlib
import math
import zlib

E = 65537

CASES = {
    "unknown": {
        "n": 5871616005012744251113781121559847071824350263409014769234326809362840408459053493071501259089516974751495136587,
        "p": 60433831317304952107829089528525748126297857797792813661,
        "q": 97157765394421282935600119224516461443128261872439143367,
        "d": 1368971612319677924790859751551558100881579444052821241001152235367945199960186445281078692596044803174415999873,
        "armor": """eJwBzQAy/zEwADE4OABDeXBoZXJ0ZXh0A8IifXB0VyTfteUHraSkmZ65TuXxZ8PBis15fvTp1xJL
KHQlki1StjB/T9omKVQF1JnC0XQ5F8GT96Ac4pM4zCLQb8z3hO+Ibd1BZ94sbJW/j8nDGTqMtiv/
plfS6wSFxlt7Rnyrae8QFpj7eO/UlAq1nGSa4dyZmT+HtvSVVpy2aBlc2jzeydIeSYEfA8Qc3YFH
MqDByhcaVX2CSPJPRi4iE7TiYxjOkWZE46igZNkVwg8uhBeBv0Kx9I1YVmXf
=ChfOBnVaWP2PqyTZT0byXg==""",
        "expected": "29201928111913239376",
    },
    "another_unknown": {
        "n": 7467492769579356967270197440403790283193525917787433197231759008957255433116469460882489015469125000179524189783,
        "p": 94424081139901371883469166542407095517576260048697655243,
        "q": 79084622052242264844238683495727691663247340251867615781,
        "d": 6095845029215954627034931303907142169470229688202235204684671759588136716587612454316830292189081535500929599993,
        "armor": """eJwBzQAy/zEwADE4OABDeXBoZXJ0ZXh0B4KeBtKjJ7hGKC7/zqyzxUoFDTzRuU4+TLFUrw9qDGjk
YI3fjyMn3G/w9WcfkZMGHdGRicbpTsDO3/oqmVtZpmIDY2HPOeWIZChuLfMDwT3FTUkDjQpsq390
OJ90pArd1JRxdIZtnCvnVy/vg+1MjAFH3ta+CuAwHsIY/3lGOKTin1+5M30BKh7NOQMmBcJ8/RuL
TfXMGQT01QVMeAGq6vORk3iw39KOLRU3Lcn1804G1/zd2mdFWvEMaTbu/F+7
=0KfiT9PUe6QkwJXoM36Ukw==""",
        "expected": "25121996842107342310",
    },
}


def crypt_rsa_mgf1(seed: bytes, length: int) -> bytes:
    """Exact Crypt::RSA 1.99 DataFormat::mgf1 behavior (i += hLen)."""
    out = bytearray()
    i = 0
    hlen = hashlib.sha1().digest_size
    while i <= length:
        out.extend(hashlib.sha1(seed + i.to_bytes(4, "big")).digest())
        i += hlen
    return bytes(out[:length])


def decode_block(block: bytes, n: int, d: int) -> bytes:
    k = (n.bit_length() + 7) // 8
    em = pow(int.from_bytes(block, "big"), d, n).to_bytes(k - 1, "big")
    hlen = hashlib.sha1().digest_size
    masked_seed, masked_db = em[:hlen], em[hlen:]
    seed_mask = crypt_rsa_mgf1(masked_db, hlen)
    seed = bytes(a ^ b for a, b in zip(masked_seed, seed_mask))
    db_mask = crypt_rsa_mgf1(seed, len(masked_db))
    db = bytes(a ^ b for a, b in zip(masked_db, db_mask))
    if db[:hlen] != hashlib.sha1(b"").digest():
        raise ValueError("OAEP label hash mismatch")
    rest = db[hlen:]
    delimiter = 0
    while delimiter < len(rest) and rest[delimiter] == 0:
        delimiter += 1
    if delimiter == len(rest) or rest[delimiter] != 1:
        raise ValueError("Crypt::RSA OAEP delimiter not found")
    return rest[delimiter + 1:]


def decrypt_case(name: str, case: dict) -> str:
    n, p, q, d = case["n"], case["p"], case["q"], case["d"]
    if p * q != n:
        raise ValueError(f"{name}: p*q != n")
    if E * d % math.lcm(p - 1, q - 1) != 1:
        raise ValueError(f"{name}: private exponent check failed")
    payload = "".join(
        line for line in case["armor"].splitlines()
        if line and not line.startswith("=")
    )
    packed = zlib.decompress(base64.b64decode(payload, validate=True))
    header = b"10\x00188\x00Cyphertext"
    if not packed.startswith(header):
        raise ValueError(f"{name}: unexpected serialized payload header")
    ciphertext = packed[len(header):]
    k = (n.bit_length() + 7) // 8
    if len(ciphertext) % k:
        raise ValueError(f"{name}: ciphertext is not a whole number of RSA blocks")
    blocks = [ciphertext[i:i + k] for i in range(0, len(ciphertext), k)]
    chunks = [decode_block(block, n, d) for block in blocks]
    if any(len(chunk) != 5 for chunk in chunks):
        raise ValueError(f"{name}: unexpected OAEP chunk lengths {[len(x) for x in chunks]}")
    plaintext = b"".join(chunks).decode("ascii")
    if plaintext != case["expected"]:
        raise ValueError(f"{name}: got {plaintext}, expected {case['expected']}")
    return plaintext


def main():
    for name, case in CASES.items():
        print(f"{name}: {decrypt_case(name, case)}")


if __name__ == "__main__":
    main()
