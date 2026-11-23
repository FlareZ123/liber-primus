# Opening 27×27 GP29 square as an actual Hill key: direct original-cipher test

**Agent6, 23 November 2026. Evidence class:** source-selected finite negative, no unknown LP2 plaintext or authentic cipher. This tests a simple, traditional, independently executable cipher consumer of the original opening's **729=27²** GP29 runes without fitting private parameters or adding new source operands.

## Human-visible premise and independent recipient

Physical p0–p2 contain 262+266+201=729 runes. The p0 red 13-dot marker and same page's two 180°-related illustrations plausibly point toward a square and orientation reversal, while solved LP1 uses simple modular arithmetic. If this entire 27×27 material is intended as a **Hill-cipher key matrix** over the original GP29 prime field, a human can decipher subsequent ciphertext blocks with a fully specified, reversible operation. An immediate source-independent receiver is unchanged p3–p19, not any words used to choose the key. The only conventional choice left is whether each 27-rune block is multiplied as a row or column vector; both and their reverse (encipher rather than decipher) are covered.

The entire original source matrix is **invertible modulo29 with determinant17**, so no hidden password, fitted key entries, or regularization is needed. Standard Gauss–Jordan on the untouched original 27×27 key yields its exact inverse; no source transcription is repaired. The main test uses the first 4,104 of original p3–p19 runes, preserving the original rune order in 152 full 27-rune blocks. The few trailing runes cannot explain failure in thousands of fully decoded symbols.

## Frozen original results

| Hill operation on each unchanged 27-rune original block | 4,104-rune IoC |
|---|---:|
| Inverse matrix × column | 0.0344652251312 |
| Row × inverse matrix | 0.0344835163164 |
| Forward matrix × column | 0.0345471791429 |
| Row × forward matrix | 0.0344202098118 |

All four results remain close to **1/29=0.0344827586**, not the appreciably more concentrated native English or raw Latin expected from the assumed direct decoder. The actual GP29 sequences contain no coherent recovered paragraph in any orientation. Every inverse/forward transform exactly round-trips its 4,104-rune original input. A separate **95-rune authentic solved p57** native plaintext padded to108 symbols is encrypted with the source square and recovered **108/108** for both row/column conventions, giving a positive for the exact arithmetic.

**Decision:** The natural complete 27×27 opening as a **literal Hill cipher key** does not decode original p3–p19 as direct raw Latin or native-GP prose under any standard multiplication direction. This is a scoped original-input negative, not an exclusion of the opening square as a map, an entirely different key-derivation mechanism, a hidden transformed 27×27 matrix, nonlinguistic intermediate material or a source-selected external key. The manuscript does not explicitly instruct Hill-cipher arithmetic; the square and title are only clues for this inexpensive test. No new plaintext or key was authenticated.

Read-only Windows 11/Node.js 22 [source-based reproducer](../sims/lp2_p0_square27_hill_original_sft.cjs) reads the canonical original corpus, asserts all source rune counts and determinant, decodes 4,104 untouched source runes, prints all four resulting prefixes, checks the native solved-p57 planted positive and round-trip.