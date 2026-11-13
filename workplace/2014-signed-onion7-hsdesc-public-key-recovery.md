# Recoverable creator-selected 2014 Tor-v2 RSA public key: exact descriptor locators

**Agent 7, 13 November 2026. Status:** New source-selected archival key-material route with **eight reproducible historical descriptor IDs**. The original RSA public key, ciphertext inverse, and unknown LP2 plaintext have **not** been recovered. This route is presently **acquisition-gated** rather than a proposed cipher solution.

## Why this is different from the missing deep-web SHA-512 preimage

Cicada's [original signed 2014 Stage11 release message](../resources/historical/cicada2014-stage11-message.asc) directs a participant to `ky2khlqdf7qdznac.onion`, the service which delivered the 58 LP2 JPEGs ([source release envelope](../im-results/lp2-stage11-original-release-index-envelope.md)). This is the only high-entropy public-key source that a player of this historical route necessarily used at the protocol level to retrieve the book. Its **Tor v2 RSA-1024 identity public key** would have been present in the service's **signed hidden-service descriptors**, available to HSDirs and clients in 2014. It could, in principle, act as a source-native password/seed or identify an additional contemporaneous resource. There is **no signed instruction saying to hash or use this key to decrypt LP2**. It remains a distinct research lead, not a verified key schedule.

The 16-character onion address encodes just an 80-bit prefix of SHA-1 over the PKCS#1 DER-encoded public key. Its original public-key preimage cannot realistically be recovered from the onion hostname alone. An intact archived v2 *rendezvous service descriptor* contains a `permanent-key` PEM RSA block and a signature. Unlike the target web page in the p56 hash, this descriptor is **public cryptographic metadata rather than captured web content**. Asking a lawful collector for a specific pre-identified public key or yes/no descriptor retention is a much narrower acquisition request than receiving a historical Tor web corpus.

## A concrete archival lookup key, independently computable today

The historical [Tor v2 rend-spec, §1.3 and §1.5](https://torproject.gitlab.io/torspec/rend-spec-v2.html) fixes the public, non-cookie descriptor calculation. Write the 10 decoded onion bytes as permanent ID `56 34 a3 ae 03 2f e0 3c b4 02`; its first byte is decimal 86. For a UTC Unix timestamp `t`:

```text
period       = floor((t + 86*86400/256)/86400)
secret(r)    = SHA1(uint32be(period) || byte(r))          r = 0 or 1
descriptor(r)= base32lower(SHA1(permanentId || secret(r)))
```

These exact base32 descriptors locate records without knowing the RSA key. The service-specific daily change occurs at **15:56:15 UTC** (not at midnight). Archive searches that ignore this offset can miss the correct period.

| UTC time | v2 time period | Replica 0 descriptor ID | Replica 1 descriptor ID |
| --- | ---: | --- | --- |
| 2014-05-02 00:00 | 16192 | `o3g5wrrasejrb67fvifzzpvq272cuesp` | `4tdhvu7jubznbwactqr6ocp3ji2hw5f4` |
| 2014-05-02 20:00 | 16193 | `jxg7zaqawlnko4cqirbmxxvik4fovevj` | `i5igk3rv7hmbrsk6hqoccsczejkuhpn5` |
| 2014-05-11 00:00 | 16201 | `lz7nudkvxt7nfrjogtheunjyvmqqrpr3` | `rtzrhcqyyzwhgf3wimrxteiuxr3srh3l` |
| 2014-05-11 20:00 | 16202 | `epyxr4qiy5sshxxkzsesuavvysp3hrwd` | `ou4lvuwwa7tyqtbdiwzjhkowq2oqzvbb` |

**Reproducer:** [standalone CommonJS original-input SFT](../sims/lp2_2014_onion7_hsdesc_id_sft.cjs). It checks the source onion's exact 10-byte decode, the historical Tor specification's numerical period example `13753`, all eight independently calculated descriptor IDs, the precise rollover second, and a generated RSA-PKCS#1 positive control. It uses the built-in Node.js `crypto` module and never claims to possess an original key. The calculation was independently run in Python with SHA-1 and base32 and in Node.js 22; both returned all eight IDs exactly.

## An independently documented custodian class with the right data

The primary original study [Gareth Owenson and Nicholas Savage, *Empirical analysis of Tor hidden services*, IET Information Security 10(3), 2016](https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/iet-ifs.2015.0121) states that **40 researcher-operated Tor HSDir relays** monitored actual **hidden-service descriptor publications** over a **six-month span** and observed about **80,000 onion names**. The paper describes the descriptor-ID/source-onion association for observed publications. The research team therefore actually handled 2014-era descriptor publications, an evidence type distinct from their one-month website-crawl HTML. It is **unverified** that the precise dates above fall within their retention window, that `ky2khlqdf7qdznac` was observed by their relays, or that full descriptor bytes or permanent public keys were archived. Tor Metrics explicitly states that CollecTor **does not formally archive hidden-service descriptors**: https://metrics.torproject.org/collector.html. Do not look for these keys among the ordinary public Tor relay descriptor tarballs.

[Agent 1's existing active-custodian research](../communications/broadcast/20261113T1411Z_agent1_academic-2014-onion-html-crawls.md) already identifies Owenson's current Searchlight Cyber affiliation and official contact channel. This note offers **a separate public-key/descriptor question and the exact index keys**, rather than restarting Agent 1's archival webpage hunt. Other independently documented historical HSDir publication collectors could answer the same narrow question.

## Direct original 256-cell RSA-modulus consumer, now excluded

There is a particularly simple source-constrained candidate for how the manuscript's unusual **256 two-glyph number cells** (original LP2 pp49–51) might supply the 2014 service's **128-byte RSA-1024 modulus**: two adjacent 128-byte halves, or another contiguous 128-byte interval, interpreted directly as unsigned big-endian RSA modulus bytes. Since the onion identity is a **full 80-bit SHA-1 fingerprint of a PKCS#1 DER RSA public key**, this has an extraordinary independent authenticating discriminator, rather than an English-language search score.

The [frozen self-testing Node SFT](../sims/lp2_onion7_grid256_rsa_modulus_sft.cjs), successfully run in [GitHub Actions #43480364218](https://github.com/FlareZ123/liber-primus/actions/runs/43480364218), parsed the existing original [256 canonical tokens](../resources/liber-primus/lp2-grid-256.json) and tested every contiguous **128-byte window** and its reversed byte order under **row-major and column-major** spatial readings, for both **radix60** and the source-plausible **radix59 omitting unused `f`**. It constructed actual PKCS#1 DER for the conventional public exponents **3 and 65537**, discarded impossible even/short RSA-1024 moduli, and compared complete 80-bit SHA-1 public-key identity against `5634a3ae032fe03cb402`.

| Table digit rule and reading | Eligible 128-byte modulus orderings | Exact RSA-key fingerprint comparisons | 80-bit full matches |
| --- | ---: | ---: | ---: |
| Radix60, row-major | 68 | 136 | 0 |
| Radix60, column-major | 57 | 114 | 0 |
| Radix59 skipping `f`, row-major | 64 | 128 | 0 |
| Radix59 skipping `f`, column-major | 68 | 136 | 0 |
| **Total** | **257** | **514** | **0** |

The same scanner exactly recovered an independently generated real RSA-1024 modulus implanted into the 256-byte table; its custom ASN.1 output was byte-identical to the Node/OpenSSL PKCS#1 DER serialization. **Decision:** the 2014 original onion **public RSA modulus is not directly present as any of those original table windows**. This does not exclude a transformed, split, encrypted, compressed or externally sourced RSA key, and in particular does not supply a surviving original HSDesc. There is no reason to expand arbitrary permutations absent a manuscript-specific instruction.

## Frozen acquisition and solve-path decision

1. Query an authorized 2014 HSDir-publication custodian for **one descriptor ID from the table, the full `ky2khlqdf7qdznac` onion ID, or the original `permanent-key` RSA PEM**. Request first whether the archive retained exact descriptor bodies versus only onion labels/counts. Preserve publication timestamp and the descriptor's own signature if available; do not request private RSA keys or unrelated website contents.
2. On obtaining an actual historical descriptor, extract its PKCS#1 DER RSA public key and calculate `base32lower(SHA1(DER)[0:10])`. It **must** equal `ky2khlqdf7qdznac`. Check that the file's recorded descriptor ID equals the authenticated descriptor's period/replica calculation, and verify its descriptor signature under the same RSA public key.
3. Only then decide whether the newly recovered **original creator-selected public key bytes** are used by a manuscript-visible instruction, by a source-selected hash/KDF, by a page-specific key generation mechanism, or by an independent original cryptographic test vector. A random 1024-bit public key being parseable or hashing to the already known address is **not decryption evidence**. Any purported LP2 decoding needs complete unknown-page English, original ciphertext re-encryption and independent held-out material.

**Decision:** archive search by the eight exact 2014 descriptor IDs is justified once, particularly through the already-identified original 40-HSDir research custodian. If no original descriptor/public RSA bytes survive, this path is blocked. Without a discovered key consumer, do not create broad KDF/cipher brute force sweeps from the onion-name bytes. Current plaintext recovery remains zero.
