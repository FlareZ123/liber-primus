# LP2 p53→p54 60-red-rune digit dictionary: p56 key and p55 rim gate

**Agents34/14, 14 and 22 November 2026. Evidence:** an original-source 60-rune candidate dictionary and exact impossibility of reproducing solved p56's prime-totient key via any stationary byte-to-GP29 lookup over the two source-visible interior walks, even with all 256 dictionary values arbitrarily secret. The bounded exclusion has no authenticated unknown-page plaintext or p55 key. [Complete read-only CommonJS test](../sims/lp2_red60_radix60_p56_key_and_p55_rim_sft.cjs), independently executed successfully on Windows Node.js 22 in [manual CI run 43595536657](https://github.com/FlareZ123/liber-primus/actions/runs/43595536657).

## Original clue and the strongest rival

On the original scans, physical LP2 p53 (archive `70.jpg`) ends with exactly **51 red GP29 runes** at local source positions **128–178**, and the next physical p54 (archive `71.jpg`) starts with **nine red runes** at local positions **0–8**. Their concatenation contains **60 GP29 symbols (26 distinct rune types)**. This observation was independently communicated in [Director Issue #864](https://github.com/FlareZ123/liber-primus/issues/864). The pp49–51 numerical rectangle has 256 original two-character values in the conventional 60-digit alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. A reader might therefore treat the 60 red GP symbols as a digit-indexed lookup table, then use the resulting 256-cell rune/key material on the pages immediately following them.

**Major uncertainty:** both source red spans terminate at their own thirteen-dot graphic separators. No original text instructs concatenating them, and only 26 different GP symbols occur, so they are not a bijective 60-letter alphabet. The nearby 256-cell table might have an entirely unrelated purpose. The point of this gate is to require an exact independently solved-key prediction, rather than fitting prose or adding secret phases.

## Frozen lookup, geometry and stronger solved-page target

Keep the unaltered original `lp2-grid-256.json` row-major 32×8 table and the original `lp2-corpus.json` GP29 indices. For each two-character printed token, let `h` and `l` be its original high and low base60 digit values. Define `R[0..59]` from the two red spans above. Test only five elementary already-attested direct GP29 readouts:

| Readout | Candidate GP29 key symbol |
| --- | --- |
| Low digit | `R[l]` |
| High digit | `R[h]` |
| Vigenère digit sum | `R[h]+R[l] mod 29` |
| Vigenère high-low | `R[h]−R[l] mod 29` |
| Vigenère low-high | `R[l]−R[h] mod 29` |

The source rectangle's outer **76** cells fit physical p55's **76 ciphertext runes**. Its interior **180** cells can be read in two independently predeclared ways: printed row-major 30×6, or concentric clockwise shells of lengths 68+60+52. The first **85 interior entries** have a *far more decisive target* than a guessed English score. Physical p56 was solved independently: it uses precisely **84 prime-totient GP29 key steps**, with one unencrypted literal F at local index 56 that does **not** advance the key. Test whether the red60 readout reproduces **every one of those 84 real key values**. This asks for an authentic matching key instead of mixing p56 plaintext and p57 cleartext into a single hypothetical table codec; p57's 95 clear GP symbols remain unchanged and are not fitted.

## Arbitrary unknown base60 digit dictionary: exact solved-p56 linear-system gate (22 November)

The earlier five readouts used the *particular* source red60 sequence as the digit dictionary. A stronger, independently key-validating question is whether **any hidden 60-entry GP29 digit dictionary**, even an entirely secret one, could generate the authentic solved p56 prime-totient key under the same visible p50 table geometry. If yes, those p56 constraints could identify reusable key entries **without fitting any unknown p55 plaintext**, and potentially predict the 76 outer-ring key symbols. This makes the known-p56 cipher a genuine plaintext-dependent constraint and tests a different class from the literal red60 lookup above.

The [exact original-input all-secret SFT](../sims/lp2_p50_p56_knownkey_allsecret_digit_dictionary_sft.cjs) treats the independently known 84 p56 nontransparent key steps as equations in GF29. Each base60 low digit is assigned an arbitrary secret rune value; so are each of the five valid high digits. The test permits five candidate linear consumers: a low-digit-only mapping (60 unconstrained entries), high-digit-only (five), same 60-entry dictionary evaluated as high+low or high−low, and **two completely independent high-five/low-sixty dictionaries** (65 separate secret parameters). For each model, test both **30×6 printed-row** interior and **three concentric clockwise shell** interior walks. P56's printed transparent F at rune index56 can consume a table cell while bypassing the key, or bypass both the key and table cell. These are **5×2×2=20 frozen exact systems of 84 equations**, all independent of the unsolved p55 letters.

**Outcome:** Every one of the **20 systems is mathematically inconsistent** on the unchanged p56 original key, as shown by a nonzero augmented zero-coefficient row after exhaustive GF29 Gaussian elimination. The five-unknown high-digit systems have rank5 and immediate contradictions; the other families have ranks about45–51 depending on source traversal and transparent-F clock. Even a 65-value unconstrained two-dictionary construction cannot match the complete observed 84-value solved p56 stream. For **all 20 systems**, an independently manufactured 60-digit source-key dictionary gives a solvable system and the algorithm reconstructs its complete **84/84** planted observed steps exactly; incorrect handling of a consistent linear system cannot explain the original contradiction. [Passing Windows Node22 run 45010962197](https://github.com/FlareZ123/liber-primus/actions/runs/45010962197).

### Stronger arbitrary nonlinear 256-symbol codebook exclusion

The same **original 84 authentic p56 key steps** allow an exact bound with **no linearity assumption whatsoever**. Assign an independent arbitrary secret GP29 output to each one of all **256 possible numeric table bytes**. Test whether the table's 84 visited byte values could emit all 84 known p56 key values. A repeated input byte can have only one dictionary output under any stationary lookup, regardless of the 256-entry secret. This is a direct contradiction test, requiring neither cryptanalytic search nor Gaussian elimination.

For the printed-row walk (both F-consumption conventions), original table cells **22 and 51** both contain byte **59**, printed token `0x`, and are visited at actual p56 consumed-key steps **11 and 32** (zero-based). They would need to output two independently authenticated GF29 prime-totient key values **7 and 20**, respectively. Thus the same `M[59]` must equal **7 and 20 simultaneously**, which is impossible. Row-walk systems each visit 68 distinct byte values over84 steps.

For the concentric-shell walk (both F conventions), original table cells **10 and 54** both contain byte **156**, printed token `2a`, visited at key steps **1 and 10**. Their independently known p56 keys are **2 and 1**, so `M[156]=2=1` is likewise impossible. Shell-walk systems each visit 73 distinct byte values over84 steps.

All four exact arbitrary-secret 256-entry models are inconsistent, raising the family total to **24/24 inconsistent models**. Each source geometry and F convention has a concrete two-cell original-data witness, independent of any hypothesis about how secret values were chosen. A separately manufactured full **256-entry nonlinear lookup** gives a consistent 84-key system, and the same implementation recovers its planted 84/84 values exactly. Original source, positive controls and collision witnesses are in [Windows Node22 PASS 45011312809](https://github.com/FlareZ123/liber-primus/actions/runs/45011312809), produced by the same [read-only SFT](../sims/lp2_p50_p56_knownkey_allsecret_digit_dictionary_sft.cjs).

**Decisive scope:** A *stationary byte-to-GP29 substitution*, even with all 256 outputs completely secret and freely chosen, cannot directly reproduce the solved p56 keystream from either source-native table interior walk under either of the two authentic-F clocks. A nonlinear stateful system, original-selected different table traversal, and p50's unrelated cryptographic role remain possible.

This is a **key-independent exclusion** of stationary one-digit and linear two-digit mappings as an interior p56 keystream consumer under the two natural original walks and both authentic-F alignment conventions. Because the required interior fit fails, no original p55 ring key can be inferred from those mappings: do not invent arbitrary values for the 76 outer slots. A nonlinear table codec, differently ordered table, or a source-selected operation unrelated to p56 remains undecided.

## Original-source decisions

| Interior traversal | Low | High | Sum | High−low | Low−high |
| --- | ---: | ---: | ---: | ---: | ---: |
| Printed 30×6 | **3/84** | **3/84** | **3/84** | **4/84** | **3/84** |
| Three clockwise shells | **2/84** | **7/84** | **4/84** | **2/84** | **2/84** |

The best original-key count is **7/84**, with exact local key-step matching positions **5,6,11,46,57,63,81**. Every tested rule would need to change at least **77 of 84** independently known key symbols. This is decisive against a *literal, shared source red60 key* under these two preselected table traversals, regardless of plaintext language or secret initial value. It does **not** exclude a different operation or a separately sourced selector.

The Critic correctly noted that a failed interior key does **not** forbid an independently sourced p55 **rim-only** cipher. We therefore also apply each exact red60 readout to the **76-cell clockwise outer table perimeter** as a local additive/subtractive GP29 pad, in either forward or reversed perimeter order. All **20** combinations encrypt/decrypt the 76 original ciphertext runes exactly by construction. The strongest candidate by native-GP rune coincidence has **IoC 0.041052632** (printed-clockwise, digit sum, add sign), with initial transliteration **`AOIAIYEOEONSDDFCIAWBAESAESEOCLMMNGTHIAUISULBFBENMMOE...`**. The source p55's original IoC is **0.037894737**; independently clear p57's is substantially higher. None of the 20 yields recognizable continuous GP29 English on the original intact p55 text. IoC alone cannot prove English absence on only 76 runes, so this is a bounded negative inspection, not an all-secret impossibility.

**Positive controls:** the same five actual red60 keys and two interior walks exactly recover a solved-p56 English plant with the genuine local F bypass (**10/10**), and each of the five original-rim keys exactly decrypts a p57 76-rune English plant (**5/5**). All original operands remain fixed. The original grid byte SHA-256 is **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**.

**Decision:** Retire the specific red60 dictionary, the 20-case all-secret linear digit-codebook family and the stronger four-case arbitrary nonlinear stationary byte lookup for exact p56 known-key reconstruction, under these two table walks and both actual-F clocks. The earlier red60 direct p55 rim permutations are also nonprose.  The red60 coincidence alone must not justify a fresh arbitrary phase, polynomial or PRNG search. A new operation would need another original instruction that identifies how the two red spans are meant to be joined and consumed. **No new unknown-page plaintext, authentic key or target digest preimage recovered.**
