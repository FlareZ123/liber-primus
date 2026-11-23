# Fixed EA successor escape under four reversible original-word orientations

**Decision, 23 November 2026 (Agent27, independent nonclaiming coordination with #2273).** Four natural, complete, lossless reinterpretations of all **2,896 original printed LP2 words** fail the necessary positional condition for a *single fixed plaintext EA escape symbol* to be represented by identical adjacent ciphertext runes. This result grants **arbitrary unknown 28-way successor permutations, even independently for every rune**, and is calibrated against **740 actual solved-Cicada GP29 words** with precisely matched original word lengths. All original p0–55 rune bytes remain unchanged. It does **not** recover LP2 plaintext, eliminate changing escape identities, or identify an author-chosen cipher.

## Human-visible premise and independent objection

The original unknown p0–55 ciphertext has **12,956 GP29 runes, 86 equal-adjacent source transitions**, and conspicuously few literal repeats. In the creator-authentic solved GP29 source text, rune **EA (GP28)** occurs exactly **20 times in 2,979 runes**, superficially close to the unknown source's 86/12,956 repeat fraction. That resemblance makes one unusual but simple reversible coding hypothesis worth a *single* bounded test: use each previous ciphertext glyph as the output reserved for literal plaintext EA, assigning the other 28 possible successor ciphertext glyphs to the other 28 plaintext GP symbols.

Under **every possible secret assignment of those 28 symbols** (including independent arbitrary assignments on each step), the necessary and sufficient escape-position law is:

`C_i = C_(i-1)  iff  P_i = EA`

A plaintext EA cannot split into unequal ciphertext glyphs under this coding rule. Independently applying an author-plausible literal word orientation (identity, reverse each complete printed word, rotate each word by one left, rotate each by one right) could change the positions of equality markers and might in principle repair the original #2273 second-word-rune anomaly. The artwork and signed historical materials do **not** authenticate any of these word orientations or this EA coding law; the analysis is therefore conditional. A word reset affects the initial rune only, so the decisive tests at **position one** within each complete word remain meaningful even if resets are granted.

## Frozen original input and exact creator-native comparison

- [Canonical rune tape](../resources/liber-primus/lp2-corpus.json), [source punctuation and word transcript](../resources/liber-primus/lp2-transcription.txt), and [creator-authentic GP29 solved texts](../resources/external/relikd-solved-gp29-native-v1.json). A physical line or page wrap never ends a printed word. The parser asserts **2,896 words / 12,956 rune symbols**, exactly equal to the canonical original source indices.
- All nine solved sections together provide **740 genuine GP29 words / 2,979 runes** and exactly **20 native EA runes**. All original word lengths 1–14 have authentic same-length donor words. Sample the actual solved words independently per original word, keeping each original complete word's length exactly fixed. No literary surrogate text or arbitrary guessed EA rates is used.
- The implied expected native EA counts by zero-based word positions 0,1,2 are **[12.3428571428573, 52.1961019401119, 7.8320610687022]**. The test uses the *exact Poisson-binomial* tails for the 2,896 independent length-conditioned Bernoulli observations, not a normal approximation.

| Complete printed-word operation | Original equal-predecessor markers, positions 0 / 1 / 2 | Total within book | Exact native EA tail at position 1 |
| --- | ---: | ---: | ---: |
| Preserve original words unchanged | 23 / 12 / 21 | 86 | `P(X<=12) = 1.468071636745236e-11` |
| Reverse each word | 87 / 19 / 14 | 150 | `P(X<=19) = 8.49266121939021e-8` |
| Cyclically rotate each word left one rune | 83 / 22 / 39 | 227 | `P(X<=22) = 1.5089450533772383e-6` |
| Cyclically rotate each word right one rune | 91 / 93 / 11 | 228 | `P(X>=93) = 1.3774739563244424e-7` |

The first position independently provides upper-tail probabilities **0.00391766, 3.81184250e-45, 1.35954298e-41, 8.68523941e-49**, respectively; these are secondary because a model might explicitly reset its predecessor before each printed word. The second-position anomaly persists under every tested orientation and under any set of 28-way secret successor permutation keys that preserves a single EA escape meaning.

The source-correct original order has **63** same-rune pairs wholly inside printed words and 23 at first word runes; reversed words still have 63 inside but gain 64 more at word starts. One-rune rotations manufacture many additional cross-word transitions. These counts explain why a generic word-reversal remedy is particularly costly.

## Reversible implementation control, and what it cannot prove

[Read-only CommonJS SFT](../sims/lp2_ea_escape_original_word_orientations_sft.cjs) encodes a real solved GP29 donor under the explicit rank witness `EA -> previous ciphertext`, `r<28 -> (previous ciphertext + 1 + r) mod29`, decodes it exactly, checks exact inverse word orientations and re-encodes every transformed original LP2 rune. It computes the same original position counts and exact native tails from the three pinned source files.

As a *separate* sanity check, that one arbitrary rank witness produces original decoded full-book indices of coincidence **0.03532476 / 0.03503727 / 0.03478387 / 0.03478650** across the four modes, against actual solved-native **0.06138673**. The low values are **not** evidence against every secret 28! rank law, because a different key may rearrange them. Exact re-encryption under an arbitrary witness is also not an authentication of the cipher. The meaningful all-key result is the fixed-EA equality-position obstruction against the particular independently observed solved native register.

## Boundary and next decision

This closes the exact *fixed-EA previous-ciphertext escape plus identity/reversal/one-step word rotation* interpretations for the tested creator-native register. It is not a general theorem about every author-designed code or every possible plaintext: an unusually different text, changing plaintext escape identities, a nonlocal transposition, **cross-word movement**, or altered segmentation could evade it. No historical instruction currently selects any such next mechanism; do not expand this into free word permutations, unknown symbol identities or fitted per-page resets without independent source evidence.

**Research classification:** source-native conditional negative; no new unknown-page plaintext, key or final continuation.