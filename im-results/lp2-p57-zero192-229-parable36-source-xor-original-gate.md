# p57 PARABLE's 36-rune zero bracket: source alignment and a complete original-known XOR veto

**Agent37, 18 November 2026. Classification:** original-source arithmetic and one completed known-plaintext cipher decision. The coincidences are exact but retrospectively recognized; the resulting simple XOR decoder is *rejected* by independent source-known runes. **No unknown LP2 plaintext, historical creator key, underlying mechanism or destination is recovered.**

## What a human solver could see

The original p49–51 numerical table is a 32×8 block of 256 printed base60 tokens, including exactly two literal zero bytes at *row-major* zero-based offsets **192** and **229**. The already-clear p57 text is an original 95-rune source, beginning with a seven-rune PARABLE heading followed by 88 body runes. The earlier source-constrained terminal alignment places **p55 76** runes, **p56 85** cipher runes (historically deciphered), and **p57 95** clear runes into exactly the **256** table addresses.

Under this conditional, row-major **terminal256** alignment, the first zero at 192 falls at p57 local rune31, the **U** of `SURFACE`, and the second zero at 229 falls at p57 local rune68, the **I** of `FIND`. The 36 cells strictly between the zeros (table193–228 inclusive) align exactly to the 36 already-clear p57 runes between them, offset32–67:

`RFACEWEMUSTSHEDOUROWNCIRCUMFERENCESF`

This is an unusual way of framing the author's literal imperative **MUST SHED OUR OWN CIRCUMFERENCES**. It is a visual/textual address suggestion, *not* an authenticated byte-to-rune mapping. Both zero cells lie *inside* printed words, and the manuscript never instructs the reader to overlay the terminal pages in this order.

Independently, GP prime sums under the canonical 29-rune alphabet give the original clear red heading **PARABLE =449** and the remaining 88 clear runes **3519**. Since the table has 256 cells, **449 mod256=193** and **3519 mod256=191**. Those two derived addresses straddle the first zero, table[192]=0. The complete clear page GP-prime sum is **3968=31×128**. The separation of the heading and body is source-written; using prime sums as these byte addresses is inferred.

At that zero, the source bytes table[191]=**33**, table[193]=**155** and **33 XOR155 =186**, equal to the original p57 word **MUST**'s GP-prime sum **71+3+53+59=186**. At the second zero, table[228]=**144**, table[230]=**117**, and **144 XOR117=229**, its own table index. The 36 byte values table[193..228] bitwise XOR to **95**, the length of original clear PARABLE. Their explicitly printed sequence is preserved in the earlier [two-zero bracket source report](lp2-grid-two-zero-address-36-punctuation-bridge.md).

These are exact after-the-fact correspondences. They exploit independently visible source divisions and a historically real Cicada XOR operation, but the choice of statistic, modulus, comparison word, and target were discovered during analysis. With so many possible sums and operations, they are **not** an established author-selected instruction, a statistical authorship claim, or multiple independent validations. In particular the 36 GP ordinals between the zeros XOR to19, so the XOR of the 36 inferred key bytes below equals `95 XOR19=76`; the resulting match to p55's 76-rune length is algebraically forced by the two earlier numbers.

## A decoding hypothesis with a truly withheld original plaintext

The addresses provide **36 independently clear rune positions**, which can determine an entire secret 36-byte repeating XOR pad without touching p55 or the rest of the original text. This is a plausible first candidate because the 36-byte table gap, the 256-terminal alignment, historical XOR, and original clear p57 establish the operands.

Define `T_i` as the unchanged original printed byte at table cell `i`, `P_i` as the corresponding terminal GP rune and `E(P_i)` as either the authentic GP **index 0–28** or its source GP **prime value 2–109**. Let the hypothesized direct cipher be:

`T_i = E(P_i) XOR K[(i-193) mod36]`

Derive **all 36 secret key bytes**, at table positions193–228, from the *known* p57 values by `K[j] = T[193+j] XOR E(p57[32+j])`. No key search, language scoring or p55 guess is involved. Reserve all **144 other independently known terminal runes** as holdouts: p56's 85 genuine plaintext runes recovered with the exact consecutive-prime-totient cipher and the true nonconsuming plaintext-F at index56, plus p57's 59 clear runes outside the bracket. The original p55 source remains 76 unknown runes.

| Frozen terminal representation | Training | Exact original-known holdout | GP-legal holdout | GP-legal candidate p55 |
| --- | ---: | ---: | ---: | ---: |
| GP index 0–28 | 36/36 | **1/144** | **11/144** | **9/76** |
| GP prime values 2–109 | 36/36 | **1/144** | **14/144** | **6/76** |

The sole correct index holdout is p56 local offset77; the sole correct prime holdout is p56 local offset55. Thus **neither original source-derived 36-byte pad recovers meaningful known text**. The actual candidate p55 values are mostly outside even the GP alphabet. Their full-register bytewise inversion is algebraically exact, but its printed language interpretation fails immediately.

A separate source-sized *planted positive* keeps p56's 85 authentic clear runes and p57's 95 actual clear runes, conceals 76 known p57 runes in the first register, then encrypts all 256 GP symbols with a genuinely secret 36-byte repeating XOR key. The identical unknown-key recovery from only the original p57 bracket reconstructs all **36 key bytes** and decrypts **256/256** planted symbols in both GP index and prime representations; every one of the 144 original-sized heldout runes passes. This verifies that a true member of the tested cipher class would have been recovered.

## Decision and relationship to the existing frontier

**Retire exactly the constant period-36 XOR pad on the original terminal256 row-major alignment**, using either source-native GP index or GP prime encoding. Do not retune offsets, register order, symbols or periods to rescue a failed holdout without a new clue. The newly noticed p57 marker-address correspondence and straddling source sums remain *unverified hypotheses*. A nonperiodic, stateful or authenticated external-key cipher is outside the tested model, and the earlier [36 physical punctuation marker route](lp2-grid-two-zero-address-36-punctuation-bridge.md) has its own unsolved map/receiver gaps.

**Reproduction:** [read-only original-source CommonJS SFT](../sims/lp2_zero192_229_parable36_known180_xor_sft.cjs), which asserts the exact physical table, original p57 values, historical p56 inverse, arithmetic, both original 144-rune holdouts and 256/256 planted recoveries. [Successful Windows Node22 manual workflow 44205895648](https://github.com/FlareZ123/liber-primus/actions/runs/44205895648). This negative is supporting evidence under `im-results/`, not a new established manuscript decryption.
