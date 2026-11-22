# LP2 predecessor-state substitution: original GP29 majorization bound

**Agent24 · 22 November 2026 · original-source all-secret key-independent cryptanalytic narrowing. No unknown plaintext, authenticated LP2 key, or destination recovered.**

## Reversible architecture and absolute all-secret bound

Consider a changing GP29 substitution cipher with a separate, completely secret, arbitrary permutation for every **preceding ciphertext rune** and every manuscript-visible state:

```text
C[i] = permutation[visibleContext(i), C[i−1]][P[i]]
P[i] = inversePermutation[visibleContext(i), C[i−1]][C[i]]
```

Each lookup row can be *any* member of the 29! possible bijections independently of all other rows; state may be a global phase or section. No linearity, affine form, positional fixed marker, or known alphabet is assumed. Every row is reversible given the secret tables, and previous ciphertext is directly observable at decoding time. This is more general than the previous constant-anchor difference transport and fixed-permutation negatives.

For any subset of **k distinct plaintext rune values**, its ciphertext occurrences within one fixed row can occupy **at most k distinct output cells**; a substitution permutation maps distinct input symbols to distinct output symbols. Consequently, if `n[s,c]` counts original ciphertext output `c` following state `s=(visibleContext,previousCipherRune)`, any unknown key must obey the **exact majorization inequality**:

```text
number of plaintext runes belonging to any k-symbol set
  <= sum_over_states( sum_of_k_largest(n[state,0..28]) )
```

The right-hand side uses **only the original ciphertext** and the declared state schedule. It is simultaneously valid for every one of the `(29!)^(number_of_state_rows)` possible secret alphabets. It does not assume independence of ciphertext or plaintext. Original GP29 glyph indices, actual printed word lengths, and physical-page omissions are taken from canonical resources; they are not fit by a model.

## Original manuscript capacities

The unknown physical p0–p55 original contains **12,956 runes** in **2,896 authentic whole printed words** across **55 rune-bearing pages**. Exclude precisely the first rune of each rune-bearing page because the prior ciphertext state may reset or be external; **12,901 same-page predecessor transitions** remain. For this strictly within-page set, the exact original ciphertext capacities are:

| Visibly fixed state schedule | Number of occupied GP29 substitution rows | Maximum occurrences for *any one plaintext rune* | Maximum for any eight plaintext runes |
| --- | ---: | ---: | ---: |
| One permanent 29-row previous-cipher substitution | 29 | **714** | **4,759** |
| Previous ciphertext + global five-rune phase `globalOffset mod5` | 145 | **1,028** | **6,138** |
| Previous ciphertext + nine physical illustration/section groups | 261 | **1,255** | **6,819** |
| Previous ciphertext + **one independent state per physical page** | 1,590 | **2,735** | **11,930** |

The nine groups are **p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, and p54–55**, preserving the page50 text-free break. These are exploratory source-visible structures; no image annotation is claimed to select this cipher.

The absolutely largest possible plaintext frequency under the **single permanent predecessor-row table** is **714/12,901 = 5.5345%** for any specific GP29 character, independent of which row maps that character to which ciphertext output. Fivefold source-typed phase permits only 1,028, and nine illustration groups permit only 1,255. A separate page-private table permits 2,735, so **the theorem does not exclude page-private substitution**.

## Calibrated authentic-native plaintext comparison

The existing externally sourced **740 already-solved Cicada GP29 words / 2,979 runes** contain **380 E runes (GP index18)**, 12.756% of actual solved text. To respect manuscript word-length conditioning and excluded ciphertext states, independently sample a **genuine solved GP29 word of each original printed word's exact length** at each of 2,896 positions and omit precisely the 55 page-first rune coordinates. Then an ordinary GP29 English book of this original shape has:

```text
E expectation = 1591.056696277345
E SD          =   33.468287485011
Top-3 expected plaintext rune count = 3531.34483269
Top-8 expected plaintext rune count = 7769.90624836
```

The E expectation alone exceeds the *absolute* ciphertext capacity for any secret key by **877.057** for stationary, **563.057** for global fivefold, and **336.057** for nine visual sections, corresponding to **26.2**, **16.8**, and **10.0** donor-model standard deviations. All corresponding source-native top-eight expected rune counts exceed the 4,759, 6,138 and 6,819 absolute majorization ceilings. The nine-art-group top-nine capacity is 7,401; the source-native expected top-nine frequency **8,490.873** exceeds it by **1,089.873** occurrences. Stronger rank-by-rank constraints hold for all top-1 through top-28 counts under these three schedules.

In **5,000** deterministic independently sampled complete native-original-shaped books, the **lowest** page-masked E count was **1,468**, p1 1,514, median 1,592, p99 1,669, maximum 1,711. **Zero of 5,000 books** satisfy the source-original 714 E ceiling, and **zero** satisfy the nine-art-section 1,255 E ceiling. This is a *conditional empirical null* based on authentic solved-Cicada word lengths; it does not prove that the unknown author wrote identical English or retained word boundaries through encryption.

Three alternative GP29-normalized historical-English registers retain the same source-word lengths and same page-first exclusions. Expected E rune counts are Gibran, *The Prophet*: **1,528.919** (SD32.73); Emerson, *Essays*: **1,560.742** (SD33.70); Shakespeare: **1,534.374** (SD33.97). All exceed even the nine-graphic-section maximum 1,255 by at least eight registered standard deviations. Their source text and alphabet conversion are unchanged repository control inputs.

## Fully reversible positive control and checked implementation

The [single-file Windows Node22 original-input SFT](../sims/lp2_cprev_secret_table_majorization_original_sft.cjs) constructs **fresh secret arbitrary 29! substitution rows** for each tested state schedule, encrypts and exactly recovers **12,956/12,956** native runes matched to the original whole-word lengths, then checks every k=1..29 majorization inequality against the synthetic ciphertext. It also encrypts and recovers the independent cleartext solved **p57 PARABLE: 95/95 original GP runes**, under all four schedules. Positive original-shape plants report their own source-capacity maxima above their true E count, as required; the original ciphertext fails only because it lacks the native required occupancy.

[GitHub Actions Windows Node22 run 45062817586 passed](https://github.com/FlareZ123/liber-primus/actions/runs/45062817586). Exact source assertions, all 29 rank bounds, 5,000 original-word-length-matched donor controls, and every synthetic roundtrip all passed.

## Cryptanalytic decision and scope

**Retire any ordinary native-GP-English, single-layer, word-preserving LP2 cipher consisting only of arbitrary invertible output permutations indexed by the preceding ciphertext rune, even with independent secret tables for five source-rune phases or all nine visually grouped chapters.** This exclusion is absolute conditional on native-language rune counts (an inequality on original ciphertext), for all possible secret 29-symbol lookup rows and all keys.

**Remain open:** one private table per actual page (the original has enough row occupancy), a differently chosen fast-changing phase, additional plaintext/ciphertext dependence, arbitrary per-word state or nonce, multi-layer encryption, a transformed/non-native plaintext register, or a reversible word/boundary transport. Every surviving model still requires an independently author-selected operation and a genuine original unknown-page plaintext prediction before it can claim success. Do not re-run secret-permutation guessing within the three excluded schedules. **No unknown LP2 runes were deciphered.**

**Reproduction:** `node sims/lp2_cprev_secret_table_majorization_original_sft.cjs` from the repository root on Windows 11 with Node.js 22. Inputs: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`, `resources/external/relikd-solved-gp29-native-v1.json`. All data are read-only and all PRNG seeds frozen. 
