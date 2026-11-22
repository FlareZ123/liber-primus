# Floral p40–53 mixed 64×51 register: original red51 is not direct GP29 column parity

**Agent 27 · 22 November 2026 · Director [#2218](https://github.com/FlareZ123/liber-primus/issues/2218).** Classification: source-visible **hypothetical layout**, original-cipher negative for a simple deterministic parity family. There is **no recovered plaintext, source-authenticated key, deciphering mechanism, or destination**.

## Causal clue, rival, and bounded candidate

Original physical pages p40–53 are a 3,008-rune floral-framed sequence. Page p40 opens with eight red runes, p49–51 contains 256 two-character numeral cells (no GP runes on p50), and the final 51 runes of p53 are separately red followed by a 13-dot mark. The source counts are independently verified by the canonical corpus, ink register and original-image atlas.

A hypothetical human route would treat the distinct numeral field as a 256-symbol insertion into the chapter register and the final red51 as an integrity row. Removing **only** the source-marked terminal 51 red runes leaves 2,957 GP29 runes; inserting all 256 source table cells at their actual physical location after chapter GP rune offset2,474 yields **3,213=63×51** input positions. Reattaching the separately printed red51 gives exactly **3,264=64×51** positions. This arithmetic requires no skipped original rune. The table's **base60 byte values or missing-f base59 values** remain distinct from GP29, however. Interpreting them as parity inputs modulo29 is a new operation, **not an authorial instruction**.

The genuinely independent rival is a compositor-delimited encrypted red sentence, with p49–51 simply another ciphertext page; the observed dimensions may be accidental. In particular the manuscript never prints a 64×51 grid, a checksum sign, a GP29 codec for two-character table tokens, or a direction for reading rows/columns. Do not interpret an integer coincidence as a recovered message.

## Frozen direct parity and secret-output-alphabet gate

The strongest cheap, decisive interpretation treats each of the red51 glyphs as a common **GF29 column checksum** over the preceding 63 rows, with original row-major reading throughout. For each position \`j=0..50\`, let \`S[j]\` be the sum mod29 of mixed entries \`j,51+j,...,62×51+j\`. The literal hypothesis predicts \`red[j]=S[j]\`. A natural sign alternative predicts \`red[j]=−S[j]\`.

A much more permissive version grants an **arbitrary unknown deterministic 29-symbol output substitution** \`red[j]=f(S[j])\` shared across columns, even when every output alphabet label is secret. It requires equal checksum residues to yield equal red symbols. The exact minimum mismatches achievable by any such function are computed from majority counts within each residue class. This gives an all-secret necessary bound; it includes every affine post-sum key and secret GP29 alphabet permutation. It does **not** exclude independently keyed columns or order-dependent cryptographic hashes, which are unconstrained by this particular statistic.

The source-canonical base60 alphabet comprises digits0–9, uppercase A–Z and lowercase a–x. The exact numeral field contains **no lowercase f**; for the base59 alternative remove that one absent character, keeping the other digit order. Both choices decode every source cell in0–255. Unlike a tempting but incorrect shortcut, the base59 reading must remove and reindex the absent f before converting a token.

| Original table numeral interpretation | Direct checksum matches /51 | Negative checksum matches /51 | Distinct sum residues | Residues with incompatible red outputs | **Minimum mismatches even with arbitrary secret output map** |
| --- | ---: | ---: | ---: | ---: | ---: |
| Conventional base60 | **1** | **1** | 26 | 16 | **25/51** |
| Source-missing-f base59 | **5** | **2** | 24 | 15 | **24/51** |

Every one of the 51 original red glyphs is included. Literal parity cannot hold in either radix; even an unknown deterministic static output alphabet cannot repair the conflicts. A proposed secret function fitted separately at each column would trivially fit arbitrary data and is not an independently motivated solution.

## Calibration and complete exact plant

The [read-only source-original CommonJS SFT](../sims/lp2_floral_red51_mixed_64x51_parity_source_sft.cjs) checks all page counts, p40/p53 ink spans, the original 256-table-byte SHA256, both radix parsers, the full 64×51 occupancy and all exact mismatch counts. Its positive control generates a **complete 51-symbol planted checksum** with invertible \`red[j]=(13×S[j]+31) mod29\`. The inverse \`9×(red[j]−31) mod29\` recovers every original column checksum (**51/51**) and the all-secret-consistency test returns zero edits. This verifies that the rejection is not an implementation inability to decode a valid source-shaped positive.

For a conditioned no-key comparison, 50,000 fixed-seed trials permute **the actual red51 GP-rune multiset** while holding the 63×51 data matrix fixed. Base60 random trailers yield at least the one original direct match in **42,190/50,000** trials. Base59 randomized trailers reach at least the five original direct matches in **2,049/50,000** trials (about4.10%). This modest base59 match is an exploratory post-recognition observation across multiple proposed readings, **not** a corrected significance claim, an intact 51-symbol receiver, or a key discriminator. An additional independent 10,000-shuffle consistency check gives base59 median-like behavior, with original minimum24 edits against mean25.81, lower tail about0.109. The model fails exact parity irrespective of that calibration.

## Research decision and next meaningful input

**Retire** the exact contiguous row-major GP29 column-sum trailer, its negative sign and **every shared deterministic output relabeling** under either original-supportable numeral radix. The shape and the 59 red bookend runes remain a *conditional* source observation; they are insufficient to authenticate a cipher architecture. Do not rescue the model with arbitrary column-specific keys, phase rotations or nonlinear checksums invented to fit the red51.

The unsolved problem for #2218 is still a source-selected **reversible mechanism** that produces an independently meaningful paragraph and survives a held-out floral page. A successful successor would need an original instruction assigning the p50 numeric cells a **typed role**, including the radix, output domain, update law, and why one state runs through word/page seams. No original floral plaintext or source-derived state has been obtained from this candidate.

The more directly source-complete eight-column Vigenère/ChaCha20/Hill and global affine-feedback proposals were already negatively tested in [the eight-column source-key inverse](lp2-p40-red8-grid32-columnar-inverse.md), [the eight-lane ChaCha gate](lp2-floral-red8-eight-chacha-column-source-gate.md), and [the all-secret affine feedback gate](lp2-floral-continuous-affine-feedback-allsecret-gate.md). They are distinct prior work and are not repackaged as new experiments here.
