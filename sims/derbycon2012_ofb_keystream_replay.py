#!/usr/bin/env python3
"""Replay the published Derbycon 2012 OFB known-plaintext keystream attack.

This is a source-object -> keystream-state example, NOT a checksum-to-key
example: the state is P2_padded XOR C2, because the same AES-OFB key and
static IV were reused for the target ciphertext.
"""
from hashlib import sha256
import json

plain2 = b"KC57" * 28  # 112 bytes, as published
cipher2 = bytes.fromhex(
    "0bb7b2efebc76a8e5ac651d6507d82af"
    "09800e1c201aaf1ca2e27959558a89d7"
    "8c1aeefc98c7207961693101cdbe9961"
    "03eb8910face67966092d3d7d1a6e155"
    "41d7353c8dc5ad424f65bfff7fdd9135"
    "9556d0f9effaf1bc6742da6992822ec4"
    "ba36ca122c9060bba0addfbc60f5dad2"
    "9b2e0d9412925c43f8de8e4fa494644d"
)
cipher1 = bytes.fromhex(
    "0bb7b2efa5835abe5ac651d61e39b29f"
    "09800e1c6e5e9f2ca2e279591bceb9e7"
    "81159a8ceec0702d58537442d295c910"
    "24c9db73deca37d57fb983abff9c980d"
    "6694000bc686987504268ac8349ea402"
    "9556d0f9a1bec18c6742da69dcc61ef4"
    "ba36ca1262d4508ba0addfbc2eb1eae2"
    "9b2e0d9412925c43f8de8e4fa494644d"
)

# The published encryptor uses BouncyCastle PaddedBufferedBlockCipher; a
# 112-byte input receives a full 16-byte PKCS#7 padding block.
plain2_padded = plain2 + bytes([16]) * 16
assert len(plain2) == 112
assert len(cipher2) == len(cipher1) == 128
assert len(plain2_padded) == 128

keystream = bytes(p ^ c for p, c in zip(plain2_padded, cipher2))
plain1 = bytes(c ^ k for c, k in zip(cipher1, keystream))
flag = b"FLAG=DecryptTheFlagToGetTheKeyLol"
assert flag in plain1

print(json.dumps({
    "cipher_mode": "AES-OFB, reused static IV",
    "source_plaintext_bytes": len(plain2),
    "source_ciphertext_bytes": len(cipher2),
    "target_ciphertext_bytes": len(cipher1),
    "derived_keystream_bytes": len(keystream),
    "derived_keystream_sha256": sha256(keystream).hexdigest(),
    "derived_keystream_hex": keystream.hex(),
    "target_plaintext_hex": plain1.hex(),
    "recovered_flag": flag.decode("ascii"),
}, indent=2))
