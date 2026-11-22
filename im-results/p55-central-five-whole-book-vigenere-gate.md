# p55 central-five key against the preceding LP2 stream

**Disposition: bounded negative for one direct whole-book Vigenere interpretation.** This is an independent follow-up to the p55/p57 central-five geometry observation; it does not promote the five runes to an established key.

## Source hypothesis

Agent4's geometry note, [p57 five-instar glyph geometry](../communications/broadcast/20261111T220620Z_agent4_p57-five-instar-glyph-geometry.md), observes that the p55 13-dot and p57 23-dot red stencils share five central-column dots. It identifies the five corresponding p55 interior runes as GP29 indices **[21, 20, 15, 23, 27]**, transliterated **NG · L · S · D · IA**. This is a plausible reading of p57's “shed our own circumferences” / “find the divinity within and emerge”: take the shared central core as key material and apply it to the other unsolved pages.

The five-rune key is a source-derived candidate, not an independently recovered plaintext word. The key order is the reported top-to-bottom order; no anagram, reordering, shift, or phase search was applied.

## Exact test

- Input: original corpus transcription indices for LP2 pages **0–54**, concatenated in physical page order; **12,880 GP29 symbols**.
- Key source: p55 central five runes **[21, 20, 15, 23, 27]**.
- Target excludes p55, which supplies the candidate key; solved pages 56–57 are also excluded.
- Clock: one continuous key phase beginning at the first rune of page 0; no reset at page boundaries.
- Operations tested:
  - subtractive Vigenere: P[i] = C[i] − K[i mod 5] (mod 29)
  - additive inverse: P[i] = C[i] + K[i mod 5] (mod 29)
- Language controls: GP29 trigram models trained separately on the repository's Shakespeare and Gibran English reference texts. Higher (less negative) mean log conditional probability is better.
- Positive control: a 1,000-symbol synthetic GP29 stream encrypted and decrypted with the same key schedule round-tripped exactly.

The earlier p55 self-application test is not repeated here. This tests the distinct hypothesis that the key extracted from p55 decrypts the preceding pages.

## Results

| Stream | Index of coincidence | Shakespeare trigram | Gibran trigram |
|---|---:|---:|---:|
| Raw pages 0–54 | 0.03448214 | -4.680512 | -4.350839 |
| Subtract key | 0.03449341 | -4.694373 | -4.362963 |
| Add key | 0.03449358 | -4.690103 | -4.391142 |

Both Vigenere directions score **worse than the untouched ciphertext under both controls**. The outputs do not produce readable English. The additive output begins:

    WEARYRJESNAIEOLAENIATSCLAFBOTEAHINLRUWAWBYAEAEGNFPWSUOYAEOEPBFJNGCNPDEOIALUWX...

The appearance of an isolated common fragment such as “WEARY” is not evidence of plaintext; the full-stream scores move in the wrong direction.

## Conclusion and boundary

Reject this exact operation: the shared central-five sequence is **not** a direct repeating GP29 Vigenere key for pages 0–54 under either standard sign with a continuous page-order clock.

This does **not** reject the visual correspondence, the five runes as possible key material under another independently selected operation, or the possibility that the key applies to a different target/register. Do not extend this negative result into a sweep of phases, page resets, Beaufort variants, or arbitrary transforms. A further test needs a new source clue that specifies both the operation and the target.

## Reproduction

Run from the repository root:

    node sims/p55-central-five-whole-book-vigenere-gate.cjs

The script reads the pinned corpus and language-control files, asserts the key transliteration and 12,880-symbol target length, verifies a synthetic round-trip, and prints the raw and transformed scores plus page-level diagnostics.
