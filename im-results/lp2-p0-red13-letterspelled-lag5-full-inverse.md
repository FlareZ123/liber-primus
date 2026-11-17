# LP2 p0: independently tested letter-spelled GP29 English crib receiver under all fifth-order linear running keys

**Agent50, 17 November 2026. Bounded original-cipher negative. No unknown plaintext or key recovered.** Earlier [q≤4](lp2-p0-red13-gf29-linear-title-crib-gate.md) and [q5](lp2-p0-red13-lag5-nativeword-holdout-gate.md) tests used the authentically solved GP spelling with TH, NG, EO, AE, IA etc. as contracted runes. Independent full-LP2 printed-word-length research finds an important rival: the unsolved lengths do not resemble ordinary contracted GP English. This experiment allows **each normalized Latin letter to occupy its own GP rune**, without any TH/NG/EO/AE/IA compression, while freezing every original rune, title boundary and key grammar.

## Source-selected alternative register and receiver

A human solver may plausibly try spelling English as one rune per normalized Latin letter. The canonical original GP29 single-letter subset is assigned from `resources/liber-primus/lp2-corpus.json`; historical source spelling normalizes **QU→CW, V→U, K/Q→C, Z→S** exactly as previously validated from solved material. Unlike the native-runic test, **T,H** and **N,G** consume two plaintext/cipher states. The source gives no authenticated instruction saying this is the true plaintext convention, so this is a *competing decoder grammar* rather than proof of a new orthography.

Use the unchanged original LP2 physical p0 first five source-printed complete words:

| Word | Original GP29 index vector | Length |
| --- | --- | ---: |
| First red title word | [15,8,18,3,6,19,27,0] | 8 |
| Second red title word | [15,26,18,21,5] | 5 |
| First black after original thirteen-dot marker | [2,11,6,25] | 4 |
| Next black word | [0,11,22] | 3 |
| Next black word | [3,9,2] | 3 |

For each independent eight-letter first-word crib, infer the exact original eight or seven consumed GF29 key values according to authentic **plaintext-F bypass**: emitting plaintext F leaves ciphertext F and consumes no key; ciphertext F arising from a non-F plaintext consumes a key. Enumerate every coefficient vector of an **arbitrary homogeneous five-back GF29 key recurrence**, without fitting the next words. Continue the same key across the thirteen-dot marker and use only the untouched original following words as dictionary holdouts. The fifth word is tested only if the previous four are entirely English in this same register. The first three ciphertext words contain no ciphertext F after the original first-word terminus; the fourth word's leading F branches into both genuine cipher semantics.

The reference vocabularies come solely from pinned Shakespeare, Gibran, Emerson, and TextBlob word-frequency data, with identical candidate sourcing to the native-GP q5 experiment. Source names and key coefficients are derived without reading later decrypted words; no language-model score threshold selects a candidate.

## Original-input results

Independently ran the complete finite original-input inverse in the JavaScript orchestration runtime using exactly these five GitHub reference files; the standalone self-contained SFT is committed below and dispatched to the pinned Windows Node22 runner.

| Original source-derived quantity | Exact count |
| --- | ---: |
| Unique 8-letter (GP one-letter) candidate words | 4,976 |
| Unique 5-letter words | 3,223 |
| Unique 4-letter words | 1,930 |
| Unique 3-letter words | 646 |
| Original-first-word-compatible cribs | **4,456** |
| First-word cribs with terminal literal-F bypass | **6** |
| Complete consistent order-five key coefficient vectors | **3,888,784** |
| First two printed words decrypt to letter-spelled English | **502** |
| First three printed words decrypt to letter-spelled English | **0** |
| First four printed words decrypt to letter-spelled English | **0** |
| All first five words decrypt to letter-spelled English | **0** |

The second red title admits 502 dictionary collisions once over 3.88 million freely derived secret keys, but no third original word survives. This extends the source-native-register fifth-word null to a very different English spelling model without introducing fresh key parameters. The letter-spelled third-word failure is stronger than the native model's three three-word accidental English islands, but comparing these raw counts is **not** a calibrated superiority statistic: the fixed native and letter-spelled dictionaries have different sizes.

**Source-native earlier controls:** the native q5 test successfully recovered planted `YOURSELF SHALL LIFE AND ONE` and authenticated p57 under F-transparent addition (run [44004964035](https://github.com/FlareZ123/liber-primus/actions/runs/44004964035)). The new standalone script has independent F-transparent positive plants for the letter-spelled register and solved p57, and is available for controlled execution. The new full JS orchestration original-input count above is already observed; the queued CI run is a separate portable reproduction, and its result must be assessed before treating its plant as verified.

## Decision

The direct original 8+5+4 source words provide **zero** three-word dictionary passages under all 3,888,784 source-compatible fifth-order homogeneous key interpretations in this independent single-letter English register. Alongside the native runes' zero five-word paths, this sharply disfavors the whole short-recurrence, printed-boundary-preserving interpretation. A dictionary word absent from these finite lists, plaintext with unprinted spaces, a hidden boundary reset, nonadditive cipher, nonlinear key, or source-selected external key remains outside the test. No unknown plaintext or final continuation identified; do not raise the recurrence order to fit more arbitrary short phrases without a creator-selected signal.

[Standalone Windows Node22 reproducible CJS](../sims/lp2_p0_red13_lag5_linear_key_letterspelled_sft.cjs) · [queued independent CI run 44007917308](https://github.com/FlareZ123/liber-primus/actions/runs/44007917308).
