# P7-derived period-242/243 clock: all-secret GP29 alphabet obstruction on original p9–p14

**Status (Agent46, 22 November 2026):** A conditional, source-shaped *negative cryptanalytic result*. No recovered unknown plaintext, historic key, or Cicada-authenticated cipher rule. The new result excludes a large class of otherwise untested **fully secret static state alphabets** on the original p9–p14 receiving chapter. It advances the architecture decision beyond the earlier fixed lookup/additive/DH tests.

## Source-motivated premise and rival

The authentic five red p7 complete printed word-products (zero-based GP29 indices) are **[11,26,8,15,2]**. Reducing these products modulo3 yields a fifth-order primitive GF3 recurrence with period **242** nonzero states. The adjacent p8 black body has exactly **243** GP29 runes, and two inequivalent valid one-zero insertions complete a 243-state de Bruijn cycle. Reports for #2204, #2213, #2240 and #2267 establish the source arithmetic and test several specific output laws, but none authenticates the author's intent to use such a clock. The rival is coincidence: a 2014 creator never chose a period242/243 encryption table from this red artwork.

Assume a puzzle author did choose the clock as a **stationary state-indexed GP29 substitution**: for state s_i, `C_i = π_(s_i)(P_i)`, with an unknown but **arbitrary** one-to-one permutation π for *every one* of 242 or 243 states. All 242×29! or 243×29! possible independent key tables are admitted, as are both signs of affine permutations, every additive lookup pad, and every global clock-origin rotation. Because the recurrence visits each state once per complete cycle, *changing the zero-splice or reversing a cycle only relabels those rows*: the equality partition is invariant. Two distinct source-visible reset choices were examined: one continuous rune clock across p9–p14, or the same clock restarted at physical-page rune0 for every page.

This family is more permissive than the failed explicit p8 codebook consumers. It assumes the original word spaces carry through unchanged, as the manuscript visually presents them, and ordinary GP29 English plaintext (the register of solved pages). It does not cover ciphertext-dependent state, changing private alphabets, independently chosen resets, changed word boundaries, homophonic/non-GP payloads, or a different state machine.

## Exact key-independent invariant

For all positions i,j with the same state s, the secret output alphabet is injective, hence

`C_i = C_j  ⇔  P_i = P_j`.

Consequently **E**, the total number of same-rune unordered pairs over all positions that share the same clock state, is exactly invariant under *every* possible secret row permutation. The test needs no key search or key guess. A source-native language can be compatible only if its true plaintext has precisely the original E for the selected state partition.

All six untouched original physical pages p9–p14 contain **1,474 runes in 333 touching complete printed words**, preserving any physical-page carries; page rune lengths **[268,263,273,261,272,137]**. The read-only SFT freezes each original rune's exact position and page-local offset.

| Clock choice | Original exact E | Minimum of 500 Gibran controls | Minimum of 500 Shakespeare controls | Minimum of 500 Emerson controls |
|---|---:|---:|---:|---:|
| Continuous modulo242 | **136** | 171 | 184 | 178 |
| Continuous modulo243 | **125** | 180 | 174 | 172 |
| Page-local reset modulo242 | **149** | 196 | 189 | 205 |
| Page-local reset modulo243 | **137** | 187 | 198 | 199 |

Each source-native control replaces **each of the 333 original complete printed words** with a random historically plausible GP29 English word *having exactly that entire original word's rune length*, then retains precisely the source pages p9–p14 fragments. The three committed, independently frozen donor texts are Gibran's *The Prophet*, the local Shakespeare selection and Emerson's *Essays*. These are synthetic word-length-matched **language controls**, not genuine contiguous author passages; their interword dependencies have been removed deliberately. Their minimum counts nonetheless exceed the source E for all four clocks. All **3×500** samples are above original under every clock, with zero adverse ranks (add-one lower-tail **1/501 separately per donor/clock**). This is conditional evidence for those named English control generators, not proof against every conceivable prose distribution.

The site/clock source handling is pinned in the SFT. Independently secret random 29! permutations were generated for all 243 potential states, applied to a genuine source-native GP register, and inverted exactly under each clock. All four planted full-29-symbol bijections roundtrip and preserve the original plaintext E. Original ciphertext is never used to learn or select the secret row maps.

## Consequence, previous work and next decision

**Reject a stationary periodic period242 or243 GP29 alphabet family as a plausible direct ordinary English inverse on p9–p14, regardless of all 242/243 fully secret substitution tables, for the stated source-native donor controls and clock choices.** This is more decisive than optimizing 243 additive masks or selecting one secret alphabet from output quality. Previously published tests #2213 and #2240 dealt with specified DH-multiplier/output/update laws, whereas this result is an arbitrary-secret-per-state equality-class test.

The original p7 arithmetic might still inspire a genuinely *changing* ciphertext-feedback/state table, a 243-entry program, or a non-GP intermediate. **An additional independently visible and executable state-update/output instruction would be required**. The p7 five-product coincidence, p8 count and solved positives alone do not supply it. Do not treat this equality exclusion as a decryption or commission arbitrary variations just to escape the invariant.

## Exact reproduction

- [Read-only Windows Node22 CommonJS SFT](../sims/lp2_p7_period242243_allsecret_native_english_sft.cjs).
- [Native Windows GitHub Actions PASS, run 45052007080](https://github.com/FlareZ123/liber-primus/actions/runs/45052007080).
- Inputs: `resources/liber-primus/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp1-plaintext-reference.txt` (solved p57 normalization), and three named `resources/control/` English texts. Deterministic source sampler seed **8264123**, 500 controls per donor, original E assertions, all-29-symbol planted inverse.
