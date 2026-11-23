# P15's sixteen Fibonacci-prime cells as the next sixteen pages' direct prime/totient seeds

**Decision (23 November 2026, Agent4):** A concrete source-led transfer of the authenticated solved p56 prime/totient additive decipherment to the 16 contiguous following pages p16–p31 **does not recover unknown LP2 prose**. The exact p15 16-cell Fibonacci-ordinal spiral provides sixteen real primes, and p16–p31 are exactly sixteen physical pages before the next distinctive p32 tree plate. The **one cell per next page** assignment remains a conjectured reading instruction rather than author-authenticated. This is a finite direct-prime-stream negative, not an exclusion of a more complicated changing-state/word-boundary cipher or all possible uses of p15.

## Source-derived receiver and actual ciphertext

From the original image `resources/liber-primus/32.jpg` (LP2 physical p15), the red-center-first spiral is:

`[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]`

The already-established exact identity `cell_i = abs(3301 - prime[F_i + 1])` for *distinct* Fibonacci values `F=[0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987]` recovers source primes:

`[2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817]`.

The prime and totient vocabulary is authentic Cicada, and the actual solved p56 starts with the exact cipher `P_i=C_i-(prime[i]-1) mod29` (0-based GP29). This source-and-solved-page transfer selects one candidate per-page cipher without fitting ciphertext keys: physical `p(16+j)` starts at prime ordinal `F_j+1`; the next rune uses the next prime. Each page resets the prime index to its own spiral-derived start. Use the same fixed zero-based GP29 symbols as `resources/liber-primus/lp2-corpus.json`. Both stated additive sign orientations are evaluated with the **entire original rune sequence**, no fitted phase, language-selected offset, inserted symbols or changed word lengths.

The actual target includes **4,077 unchanged original GP29 rune values** across 16 complete printed physical pages, with original per-page lengths `267,273,260,271,269,273,131,213,270,273,265,234,269,277,263,269`. The first eight pages p16–23 are 1,957 runes; disjoint latter eight p24–31 are 2,120 runes.

## Outcome and source-native control

| Frozen direct receiver | Page-IoC range across p16–31 | Weighted mean p16–23 | Weighted mean p24–31 |
|---|---:|---:|---:|
| `P=C−(prime−1)` | 0.03337464–0.03746330 | 0.03519415 | 0.03447055 |
| `P=C+(prime−1)` | 0.03266366–0.03795151 | 0.03445274 | 0.03505285 |

The original p16 decryption begins `BNGLMGLEOFGSRNGCMGJEAWYMCOJN...`; the best single-page direct candidate's IoC is only 0.03795151, with no continuous native-GP prose. This is a stringent rejection of these **two exact, unmodified all-page receivers** under the ordinary-language premise, without any key-search or model selection.

The same source code and arithmetic reproduce the **first 55 original p56 ciphertext runes** as the actual established solved text `ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTY` with IoC 0.07676768, so the prime clock/sign and GP29 direction are independently calibrated on a genuinely solved source. The first 55 stop before later plaintext-F interrupter complications. Full original inverse→forward replay is exact in both orientations for all 4,077 original runes. A separate known-solved p57 native-GP plaintext plant, tiled only for the codec's functional test, returns exactly all 4,077 known symbols through both encoders. These round-trips are necessary correctness checks and cannot identify a historical key.

**Important boundary:** Some solved-LP1 and p56 modes treat *plaintext F* as an interrupter with nonconsuming key state, requiring a source-provided plaintext-F mask to invert unambiguously. The direct transfer above consumes each original ciphertext rune, calibrated on p56's uninterrupted first55; it does **not** claim to exhaust secret F-mask choices or variants with new clocks. In particular, interpreting any ciphertext F as necessarily literal plaintext F is false, and this study does not rely on that assumption. No 2014 source demonstrates one prime seed per successive physical page or instructs the reader to use a p56 decryption mode there.

**Research decision:** Do not search p15 page-prime offsets/signs until new evidence names a changing-state operator or recipient. The p15 figure's exact 16 original Fibonacci-prime values remain established. A stronger next step would locate an original instruction explaining how these sixteen seeds generate *a recoverable changing key or control path*, rather than brute-forcing another direct additive stream.

## Reproduction

- `sims/lp2_p15_16prime_pagekey_original_sft.cjs`: one Windows Node22/CommonJS runnable test, reading existing canonical source JSON; prints all sixteen page IoCs, asserts the actual first55 p56 known text, all original inverse/forward replays and the source-native p57 planted controls.
- Source corpus: `resources/liber-primus/lp2-corpus.json` with original LP2 p16–31 and solved p56–57 indices.
- CI validation: [manual read-only Node22 run 45130083392](https://github.com/FlareZ123/liber-primus/actions/runs/45130083392) (consult run status; link identifies the dispatched source test).
