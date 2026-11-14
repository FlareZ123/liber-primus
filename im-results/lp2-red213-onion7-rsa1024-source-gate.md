# Unsolved LP2 red-rune stream as the 2014 Onion7 RSA-1024 public modulus: exact original-source test

**Agent 3, 14 November 2026. Original-input key-recovery attempt; bounded negative.** No previously unknown plaintext or authentic creator-selected cryptographic key was recovered.

## Independent original clues and predicted success

The original LP2 page images mark an unusual subset of glyphs in **red ink**. The canonical annotations identify 225 red runes; excluding the five solved p56 *AN END* and seven clear p57 *PARABLE* header runes leaves **213 unknown-page red runes** in source order. At 29 possible glyphs, 213 digits have sufficient numerical capacity to hold a 1024-bit integer. Their proximity to the 211 base-29 digits sufficient to store a typical RSA-1024 modulus motivates a *single-source* key-material hypothesis, without asserting the original designer intended it.

A contemporary solver retrieving LP2 through the original signed Onion7 address \`ky2khlqdf7qdznac.onion\` would have encountered that service's **RSA-1024 public identity** in its 2014 Tor-v2 hidden-service descriptor. The base32 hostname authenticates the first **80 bits of SHA-1 of the PKCS#1 DER-encoded RSA public key**. This makes a candidate red-rune-derived modulus decidable by exact independent cryptography rather than an English-language fit. The source separately fixes the target public identity \`5634a3ae032fe03cb402\`; earlier work recovered its historical descriptor *locators*, but not the modulus itself. [Descriptor specification and independent historical gate](../workplace/2014-signed-onion7-hsdesc-public-key-recovery.md).

**Weakest premise:** nothing printed instructs the reader to concatenate all red ink or to interpret GP29 values as an RSA modulus. The 213-versus-211 numeric capacity is an exploratory motivation only. A full identity match would have been a genuine direct recovery of the original, externally authenticated public key. A failure retires precisely these no-key-fit readings.

## Frozen input, finite extraction, and exact result

The test uses these untouched source files and verifies their **Git blob SHA-1s** before parsing:

- \`resources/liber-primus/lp2-corpus.json\`: \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`.
- \`resources/liber-primus/lp2-ink-annotations.json\`: \`3c52f209ce6bd7b138eaa2d4a9323526952ba9f9\`.

For every original red span, the script asserts the exact corresponding source rune indices. It uses only original unsolved pages p0–p55; p56/p57 titles are excluded because they are already solved under different methods. It interprets each ordered GP29 index as a digit in radix 29, in both printed and fully reversed rune order. For each orientation, exactly ten literal presentations are checked: the entire 213-digit integer; its first or last 128-byte blocks after minimal big-endian byte rendering; all four contiguous 210-digit windows; and all three contiguous 211-digit windows. Total: **20 explicit candidates**, with no other omitted-rune combinations, arbitrary permutations, fitted key phases, compression, or KDFs.

Only mathematically valid 1024-bit **odd** candidates can serve as a conventional RSA-1024 public modulus. The original full-run streams have bit lengths **1034** (printed order) and **1035** (reverse), and are both even. Across all 20 representations, **only \`reverse/window211@2\` is 1024-bit and odd**. With the exact candidate modulus and the three conventional small public exponents listed below, construct the real PKCS#1 DER public key, compute SHA-1, take its first ten bytes, and base32-encode them.

| Public exponent | Recovered candidate onion address | Matches authentic Onion7? |
| ---: | --- | --- |
| 3 | \`ktnpmwgxvagogpv5\` | No |
| 17 | \`lqr73kos6n4w2bzv\` | No |
| 65537 | \`pixpoosan75hitlc\` | No |

**Exact original-key matches: 0 of 3 eligible modulus/exponent combinations.** The program also generates a genuine new RSA-1024 public key, encodes its full modulus losslessly in 211 GP29 digits, reconstructs it and checks the resulting RSA PKCS#1 DER/SHA-1 identity against Node's independent native public-key export. That constructive end-to-end control passes.

## Decision

**Retire direct source-order or reverse-order base29 extraction of the 213 original unsolved red runes into the historical Onion7 RSA-1024 modulus under these 20 explicitly declared representations and exponents.** The direct complete-stream reading does not even have the required modulus length/parity; the sole admissible trimmed reading fails the external 80-bit identity check. There is no justification for adding unselected digit removals, offsets, digit bases, private-key inventions, or KDF layers merely to force a match.

This does **not** exclude another use of red text as a key, another hidden-service identity, an RSA key not associated with the original distributor, or a creator-selected but currently missing transform. Source-derived raw descriptor acquisition remains independent and potentially valuable. The test does not establish that the red ink contains *no* information or that LP2 is unsolvable.

**Reproduction:** \`node sims/lp2_red213_onion7_rsa1024_original_sft.cjs\` (Node 22, standard library only, Windows-compatible). The same complete red-index stream and all 20 candidate moduli were independently evaluated with Python big integers and the \`cryptography\` PKCS#1 export, yielding the 3 onion identifiers above. **Verified Windows Node22 execution:** [manual-only Actions run 43563218628](https://github.com/FlareZ123/liber-primus/actions/runs/43563218628) passed every original-source and generated real RSA-1024 positive-control assertion. An initial Windows run 43563113267 exposed CRLF checkout expansion in the source Git-blob check; normalization to LF was corrected in commit `c164f0ae` before the successful rerun. The source-derived 213 values and all three original-fingerprint failures were unchanged.
