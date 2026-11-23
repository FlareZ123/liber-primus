# Original LP2 two-edge Fibonacci word-state inverse, frozen negative

**Agent31, 23 November 2026.** This report retires one fully specified, source-executable word-local inverse under [Director Issue #2417](https://github.com/FlareZ123/liber-primus/issues/2417). It does not establish a general ban on evolving word-state systems and recovers no new LP2 plaintext or missing key.

## Original motivation and independent rival

LP2 source images retain word dividers and the earlier LP1 text emphasizes an arithmetic/Fibonacci-prime thread. The final clear LP2 parable repeatedly instructs readers to shed an enclosing circumference, suggesting the word's *outer runes* could initialize a subsequent operation. These are **weak, unconfirmed selection clues**: neither explicitly specifies the law below. The rival is a missing external key/one-time pad or a different plaintext register, which would also explain the 12,956 unknown runes' low doubles and high apparent entropy.

We froze **one** reversible operation in [the issue before reading decrypted original output](https://github.com/FlareZ123/liber-primus/issues/2417). Given the complete physical previous ciphertext word `W=(c0,…,cN)`, seed next word's registers with `(a,b)=(c0,cN)`; the very first word seeds `(0,0)`. For every current GP29 ciphertext rune `c` in original print order:

```text
plaintext p = (c - a) mod 29
next a     = b
next b     = (a + b + c) mod 29    [simultaneous update]
```

The inverse encoder computes `c=(p+a) mod29` and applies the identical ciphertext-dependent update. All keys/inputs derive from the **printed ciphertext itself**. Printed `-` and `.` terminate words; line, physical page and chapter marks do not split the 32 source cross-page words. No Latin alphabet shortening, special-F bypass, added pad, dictionary-directed spacing, or tunable phase enters the receiver.

## Actual original corpus decision

| Data | Complete printed words | Runes | Decoded GP29 IoC | Original ciphertext IoC |
| --- | ---: | ---: | ---: | ---: |
| Unknown LP2 physical p16–21, fully internal words | 372 | 1,605 | **0.034236061** | 0.034515736 |
| Untouched unknown LP2 p40–53, fully internal words | 669 | 3,008 | **0.034497299** | 0.034542627 |

The first 25 decoded p16–21 words begin `RIHTHJHEOREAJONM XWYIWSUD L EOTJNAE EHDBY WH POEO`. The independent p40–53 opening is `EOIAL YTWPS IACXCTH BLBAE ROJ RJITNG EAAAP`. Neither yields contiguous connected GP29-native English. Both distributions remain at random-character IoC, approximately `1/29`, and well below the plaintext source-donor IoCs of 0.0525–0.0640. The full **12,956 original unknown runes** can be exactly regenerated from this operation's output, showing that reversibility does not imply decryption success.

For clarity, the p16–21 pages contain 1,613 original runes in total; this report assesses 1,605 **whole-word-contained** runes and leaves the eight runes belonging to boundary-crossing words out of the interval statistic, while processing all 12,956 in the global decoder. LP2 p50 has no runes. There are **2,896 source-printed unknown words** and **2,941 across the full 58-page source**.

## Real source-native positives, wrong-operation contrast

We planted four original solved GP29 donor texts from `resources/external/relikd-solved-gp29-native-v1.json` under the **same law**, taking the encoder's actual ciphertext endpoints (not plaintext endpoints), and recovered every rune with the frozen inverse:

| Donor section | Known GP29 runes | Correct receiver | Wrong receiver (`p=c-a-b`) | Native text IoC |
| --- | ---: | ---: | ---: | ---: |
| 0 (WARNING) | 184 | 184/184 | 2/184 | 0.064029 |
| 2 (SOME WISDOM) | 157 | 157/157 | 7/157 | 0.052507 |
| 4 (THE LOSS OF DIVINITY) | 755 | 755/755 | 34/755 | 0.061215 |
| 8 (PARABLE) | 95 | 95/95 | 2/95 | 0.062710 |

The plants verify that a genuinely correct key-free GP29 word-state law would be detected and perfectly invertible, even when its **ciphertext** IoC becomes approximately 0.035. They are artificial encryptions of independently recovered original author text, not a fit or candidate solution to original encrypted pages.

**Reproduce:** `node sims/lp2_agent31_twoedge_fibonacci_word_sft.cjs`. This CJS SFT reads unchanged canonical page indices and rune tape, asserts full input integrity, asserts original forward replay, prints both original intervals and four native donor plants. It makes no file writes.

## Research choice

The source-inspired *specific* Fibonacci/previous-word-two-edge state law fails the precommitted original plaintext gate. No new source clue or recovered operand justifies turning its seed, sign, keying, recurrence or word delimiters into a brute-force parameter menu. Retire this law, leaving open the larger source-selected evolving-state question.
