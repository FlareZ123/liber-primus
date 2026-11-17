# Source-native known-plaintext period-k delta crib against original LP2

**17 November 2026, Agent48. Classification: intermediate original-source gate, no authenticated unknown plaintext or key.**

An editor-Latin crib appeared to give a sixteen-rune match between LP1 *WELCOME* and encrypted LP2 physical p36. Rechecking the authentic solved **runes** reduced it to an isolated fifteen-rune match. This records the bounded all-key search and the correction so that the coincidence cannot be mistaken for a decipherment.

## Fixed original evidence and source texts

The original ciphertext consists of **12,956 GP29 signs on 55 rune-bearing unknown physical p0–55 pages**, read without editing from resources/liber-primus/lp2-corpus.json. Page 50 contains the numerical grid and no rune text.

The known sources comprise **nine original solved-GP29 sections, 2,979 runes**, independently transcribed in resources/external/relikd-solved-gp29-native-v1.json, plus **15 historically signed Cicada source-message bodies, 4,791 runes**. The complete historical file list is frozen in the SFT. The last 95-rune solved section reproduces the original LP2 p57 rune indices exactly. Signed English is encoded using the demonstrated source-native rules ING→NG, IO→IA, QU→CW, V→U, K/Q→C, Z→S. Original encrypted word/page breaks are never rearranged.

## Complete unknown-period signed and reflected Vigenère crib

For any hidden periodic additive key and either fixed plaintext multiplier 1 or −1,

\[
C_i = sP_i + K_{i\bmod k}\pmod{29},\qquad s\in\{+1,-1\}.
\]

The **key-independent** necessary condition is

\[
C_{i+k}-C_i\equiv s(P_{i+k}-P_i)\pmod{29}.
\]

Index seven consecutive GP29 difference symbols from every frozen known source, search for exact matches across each intact original ciphertext page and extend all matches. Enumerate **every period k=1..256**, both multipliers, and both entire-message source orientations. This admits an entirely unknown key with k unconstrained GP29 values, without fitting those values to candidate plaintext. If k exceeds seven, a seven-difference seed constrains the two ends of a window while leaving some internal key residues unseen.

**Original result: exactly one seven-difference collision across all 24 sources and all tested periods/signs/orientations.**

| Feature | Actual values |
| --- | --- |
| Cipher | LP2 physical p36, zero-based rune indices 131–145 |
| Known source | Solved LP1 WELCOME, native record 0_welcome, source indices 148–162 |
| Period, multiplier, direction | Eight, +1, forward |
| Longest consecutive repeated differences | Seven; the eighth fails |
| Fifteen candidate native GP plain signs | R U G G L E A N D S U F F E R |
| Fifteen original cipher signs | F I O I R S X N M A IA R P S D |
| Inferred unselected eight-symbol key | GP indices [25,9,26,4,13,26,19,0]; AE N Y R P Y M F |
| First contradicted native plain rune | NG (the one-runic ING ending of SUFFERING) |
| Observed next cipher versus model-required | I (GP index 10) versus NG (index 21) |

The original solved LP1 passage uses the single rune ᛝ for *ING*. The editor-normalized English conversion originally used I+NG, producing the apparent sixteenth match; source-native spelling **falsifies that extension**. The candidate begins inside *STRUGGLE*, and its printed LP2 word segmentation does not select the known source phrase. The eight-key values are inferred entirely from the matched segment and do not match any cyclic phase of historically known DIVINITY. None of the original p50 numeric grid's 32 modulo-29 eight-cell rows supplies this key under reversal, rotation, either sign (best partial agreement only 3/8). Fixed-key decoding across the 238-rune original p36 produces no readable sentence and fails immediately beyond the fifteen-position crib.

The candidate cannot use the original solved p56 **plaintext-F-transparent** rule without another independently authored layer: two plaintext F signs inside this putative source segment would have to remain literal ciphertext F, whereas the actual p36 symbols at those positions are R and P.

For perspective, the nine runic references alone yield **3,437,373,218 source-target candidate pairs** of seven-difference windows across k1..256, or a crude iid-uniform mean **0.199** accidental matches under 29 independent rune symbols. This is only an illustration; the real ciphertext has non-IID structure, messages reuse language, and the source/period/multiplier searches were broad. One short match is insufficient to support a new key or decryption.

## Positive control and decision

A genuine **64-rune solved source-native LP1 excerpt** was encrypted with the actual eight-symbol DIVINITY key. The same key-blind difference matcher discovers its authentic 56-difference run and the exact inverse returns all 64 original plaintext signs. Independently, the solved p57 reference recovers the original 95-rune string without normalization errors.

The [complete read-only CJS SFT](../sims/lp2_periodic_knownsource_deltacrib_sft.cjs) asserts original/source lengths, the sole original match, the precise source-native sixteenth-rune mismatch, and the planted full 64-rune inverse. No unknown original plaintext, key, or destination was recovered.

**Next evidence gate:** a new author-authenticated source passage or a first-party specified cipher key/clock that independently predicts adjacent original unknown plaintext. The current fifteen-rune p36 coincidence has no such selector and should not be extended with free parameters.
