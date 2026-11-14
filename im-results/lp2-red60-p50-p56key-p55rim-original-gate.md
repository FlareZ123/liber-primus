# LP2 p53→p54 60-red-rune digit dictionary: p56 key and p55 rim gate

**Agent34, 14 November 2026. Evidence:** a source-visible 60-rune *candidate operand* followed by an original-cipher negative, not an authenticated key, unknown-page decryption or destination. [Complete read-only CommonJS test](../sims/lp2_red60_radix60_p56_key_and_p55_rim_sft.cjs).

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

## Original-source decisions

| Interior traversal | Low | High | Sum | High−low | Low−high |
| --- | ---: | ---: | ---: | ---: | ---: |
| Printed 30×6 | **3/84** | **3/84** | **3/84** | **4/84** | **3/84** |
| Three clockwise shells | **2/84** | **7/84** | **4/84** | **2/84** | **2/84** |

The best original-key count is **7/84**, with exact local key-step matching positions **5,6,11,46,57,63,81**. Every tested rule would need to change at least **77 of 84** independently known key symbols. This is decisive against a *literal, shared source red60 key* under these two preselected table traversals, regardless of plaintext language or secret initial value. It does **not** exclude a different operation or a separately sourced selector.

The Critic correctly noted that a failed interior key does **not** forbid an independently sourced p55 **rim-only** cipher. We therefore also apply each exact red60 readout to the **76-cell clockwise outer table perimeter** as a local additive/subtractive GP29 pad, in either forward or reversed perimeter order. All **20** combinations encrypt/decrypt the 76 original ciphertext runes exactly by construction. The strongest candidate by native-GP rune coincidence has **IoC 0.041052632** (printed-clockwise, digit sum, add sign), with initial transliteration **`AOIAIYEOEONSDDFCIAWBAESAESEOCLMMNGTHIAUISULBFBENMMOE...`**. The source p55's original IoC is **0.037894737**; independently clear p57's is substantially higher. None of the 20 yields recognizable continuous GP29 English on the original intact p55 text. IoC alone cannot prove English absence on only 76 runes, so this is a bounded negative inspection, not an all-secret impossibility.

**Positive controls:** the same five actual red60 keys and two interior walks exactly recover a solved-p56 English plant with the genuine local F bypass (**10/10**), and each of the five original-rim keys exactly decrypts a p57 76-rune English plant (**5/5**). All original operands remain fixed. The original grid byte SHA-256 is **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**.

**Decision:** Retire the direct 60-entry red lookup / two-digit Vigenère key under the ten predeclared p56 mappings and the twenty tested p55 rim consumers. The red60 coincidence alone must not justify a fresh arbitrary phase, polynomial or PRNG search. A new operation would need another original instruction that identifies how the two red spans are meant to be joined and consumed. **No new unknown-page plaintext, authentic key or target digest preimage recovered.**
