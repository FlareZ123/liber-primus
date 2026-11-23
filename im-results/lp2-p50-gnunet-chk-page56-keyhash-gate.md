# p50 table as GNUnet CHK block against the p56 hash — bounded negative

## Question

The 512-bit value printed on physical p56 is the right size for a GNUnet Content Hash Key (CHK) keyhash. The p50 numeric table is exactly 256 byte-valued cells. Could p56 supply the CHK keyhash while the p50 table supplies the encrypted 256-byte data block (or, in the reverse orientation, plaintext)?

This is a concrete platform/format hypothesis, not evidence that Cicada used GNUnet.

## Source-defined format

GNUnet's `gnunet-chk.py.in` helper (copyright 2013, 2018; GNUnet 0.29.0 source) defines:

- SHA-512 keyhash and queryhash, each 64 bytes;
- 32 KiB data blocks, so a 256-byte file is a single data block;
- AES key = first 32 bytes of SHA-512(plaintext block);
- IV = next 16 bytes of that digest;
- AES-CFB with 128-bit segments;
- queryhash = SHA-512(encrypted block);
- CHK URI fields: keyhash, queryhash, file size.

Sources:
- [GNUnet file-sharing documentation](https://docs.gnunet.org/v0.29.x/users/fs.html)
- [GNUnet gnunet-chk.py.in source](https://fossies.org/linux/misc/gnunet-0.29.0.tar.gz/gnunet-0.29.0/contrib/scripts/gnunet-chk.py.in?m=h), especially constants and `AESKey` at lines 32–47 and 92–132, encryption/hash construction at lines 151–176 and 325–329.

The p56 hash, transcribed from original `resources/liber-primus/73.jpg`, is:

`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`

The p50 byte source is `resources/liber-primus/base60-grid.json`: its 32×8 `byte_rows`, flattened in ordinary row-major reading order, produce 256 bytes. Ten cells have the source's I/l glyph ambiguity, giving 1,024 possible byte readings.

## Frozen tests

A Node SFT, using only built-in `crypto`, reproduces the GNUnet SHA-512/AES-CFB128 construction and first passes a synthetic encrypt/decrypt/hash positive control. For every one of the 1,024 I/l readings, it tests both orientations:

1. **p50 ciphertext / p56 keyhash:** derive AES-256 key and IV from the p56 digest, decrypt the 256-byte table, and require SHA-512(plaintext) to equal the p56 digest.
2. **p50 plaintext / p56 queryhash:** hash the table to obtain its keyhash, encrypt it with the resulting AES-256-CFB128 key/IV, and require SHA-512(ciphertext) to equal the p56 digest.

Results: **0/1,024 keyhash-orientation hits and 0/1,024 queryhash-orientation hits.** The canonical row-major table hash is `bbb14b9db89b0a55fd15e08bcc82238b397bcdaffa43a0bd8463838e69ee6bf13b6a1e36216dd83d159484979e5497d6c2675e791e6e9df7d64ce1b2020b3f20`; it is not the p56 digest. The canonical table-as-plaintext GNUnet queryhash is `0549056bb42a39909467cd304934b255423074e1a0b41033a51c23da387e83bcc13551b7b57e6a1231c98ba82b81338978189e886fe66b2b9335a312be03ca61`.

Reproduce from the repository root:

`node sims/lp2_p50_gnunet_chk_page56_keyhash_sft.cjs`

## Decision and limits

The direct pairing “p56 hash + p50 256-byte table as one GNUnet CHK block” is rejected under the documented GNUnet construction, including all ten glyph ambiguities. This does **not** rule out GNUnet as the historical platform, another source block or serialization, or the possibility that the p56 value is a checksum for an external page rather than a CHK keyhash. No GNUnet URI or page was retrieved, and no plaintext was recovered.
