# q8/q13 independent plaintext-F clock composition: exact p54 exclusion

**Status:** bounded negative result for one source-constrained cipher family. No LP2 plaintext was recovered.

## Hypothesis and source-derived keys

Test whether the two historically solved LP1 additive ciphers could be composed as successive GP29 layers, with each layer maintaining its own plaintext-F hold clock. The two possible orders are q8 then q13, and q13 then q8. Both layers use their historically verified forward direction; no unknown key search, period expansion, arbitrary reset, or extra transform is introduced.

The source-derived key vectors are:

- WELCOME, q8 / DIUINITY: `[23, 10, 1, 10, 9, 10, 16, 26]`
- Second KOAN, q13 / FIRFUMFERENFE: `[0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18]`

These are not guessed key strings. The script replays the q8 vector against the 515-rune WELCOME plaintext in `resources/external/relikd-solved-gp29-native-v1.json` and its Wulfic canonical ciphertext in `resources/transcriptions/lp1_wulfic_canonical.txt`, exactly, ending at q8 phase 0. It likewise replays the q13 vector against the 319-rune second KOAN, exactly, ending at q13 phase 5. These checks establish the key vectors and the additive direction used in this test.

## Exact two-clock model

Let F be GP29 index 0. For the first layer, plaintext P=F emits intermediate M=F and leaves clock 1 unchanged; otherwise M=P+K1[i] mod 29 and clock 1 advances. The second layer applies the same rule to M, with its own key K2 and clock 2. Thus clock 2 advances only when the intermediate M is non-F; it is not synchronized to clock 1 or to the final ciphertext.

The inverse transition set is exhaustive:

- For a non-F final ciphertext rune, both layers must consume, so M=C-K2[j] and P=M-K1[i], with both intermediate and plaintext required non-F.
- For a final F, there are exactly three possible cases: both layers hold (P=F); layer 1 consumes to M=F while layer 2 holds; or layer 1 produces non-F M and layer 2 consumes M to F. Invalid cases where a purported consuming input is F are excluded.

The reproducer tests every one-symbol plaintext and every phase pair for both orders: 3,016 cases per order, zero inverse-transition failures. The full Viterbi state also carries the previous two plaintext runes for the fixed GP29 trigram score. Crucially, the original-ciphertext rejection below does not depend on the language model: a separate phase-pair reachability pass keeps every valid phase pair and dies only when the exact inverse transition set is empty.

## Frozen LP2 geometry

The source corpus records 232 runes on LP2 p54 and 76 on p55. The tested p54 black-body is the established 213-rune fit after the leading 19-rune header/lead-in; see the original [p54 image](../resources/liber-primus/71.jpg), the associated [47-group/213-rune p54 fit issue](https://github.com/FlareZ123/liber-primus/issues/3027), and the [LP2 corpus](../resources/liber-primus/lp2-corpus.json). The continuation is the complete 76-rune [p55 image](../resources/liber-primus/72.jpg). All 104 initial phase pairs are allowed at the start of the p54 body, so the unknown effect of the omitted lead-in is not forced to a guessed phase. No reset is allowed between p54 and p55.

## Original-ciphertext result

| Layer order | First impossible p54-body rune | Cipher rune | Phase pairs remaining immediately before it | Maximum reachable phase pairs |
|---|---:|---|---|---:|
| q8 → q13 | 96 | T / ᛏ | (6, 3) | 104 |
| q13 → q8 | 77 | I / ᛁ | (4, 1), (6, 1), (7, 1) | 104 |

For q8→q13, after the first 95 body runes only phase pair (6,3) remains, and it has no inverse transition for the 96th ciphertext rune. For q13→q8, after the first 76 body runes only the three listed phase pairs remain, and none can produce the 77th rune. The full phase/history Viterbi independently reaches the same dead ends: one active state before the q8→q13 failure and three before q13→q8. The phase-only reachability and full-state results agree exactly.

There is therefore no valid p54 plaintext path and no pair of exiting clocks to carry into p55. Decoding p55 from a fresh phase pair would introduce a page reset that this hypothesis does not permit; it was not attempted as a rescue.

## Matched native controls

The same receiver was checked on synthetic two-layer ciphertexts generated from authentic solved LP1 plaintext sections. Each control is 289 consecutive runes split into the same 213+76 geometry, encrypted with the same two keys and independent F-hold clocks, then inverted while searching all 104 initial phase pairs.

| Native plaintext source | Layer order | Generated starting phases | p54 recovery | p55 recovery | Forward replay |
|---|---|---|---|---|---|
| `0_koan_1` | q8 → q13 | (2, 5) | 213/213 exact | 76/76 exact | exact |
| `0_loss_of_divinity` | q8 → q13 | (6, 3) | 213/213 exact | 76/76 exact | exact |
| `0_koan_1` | q13 → q8 | (2, 5) | 213/213 exact | 76/76 exact | exact |
| `0_loss_of_divinity` | q13 → q8 | (6, 3) | 213/213 exact | 76/76 exact | exact |

The controls use native plaintexts from the Relikd solved-GP29 reference; their composite ciphertexts are synthetic calibration data, not claimed historical Cicada ciphertexts. All four recoveries reproduce the generated plaintext exactly, including the uninterrupted 76-rune continuation and the correct clock phases. The fixed smoothed GP29 character-trigram model is built from `resources/control/english_wordfreq_textblob.txt` (29,157 rows; total weight 1,105,285) and is used only to select among valid paths in these controls.

## Reproduction and scope

Run with Node 22 from the repository root:

```sh
node sims/lp2_q8_q13_independent_f_clock_composition_sft.cjs
```

The exact CI reproduction is [workflow run 45865166800](https://github.com/FlareZ123/liber-primus/actions/runs/45865166800). The script reads the original corpus and solved-text controls, validates both historical one-layer key replays, checks all single-symbol inverse transitions, searches all initial phase pairs, verifies the four native controls, and records the two original-ciphertext dead ends. The bounded task is [issue #3031](https://github.com/FlareZ123/liber-primus/issues/3031).

**Conclusion:** the two source-authenticated q8/q13 keys, in either successive-layer order with independently advancing plaintext-F clocks, cannot generate the 213-rune p54 black body for any initial phase pair under the stated operation. This excludes only these two fixed-key compositions and this exact clock law. It does not exclude different keys, non-additive or transposed layers, additional source-selected transformations, or a separately evidenced section-reset mechanism. No LP2 plaintext has been recovered.
