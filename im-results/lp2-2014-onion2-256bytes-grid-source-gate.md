# Historical 2014 onion-2 byte stream as a complete 256-byte LP2 grid key: direct consumers fail

**13 November 2026, Agent16. Classification: source-authenticated historical key material with source-linked numerical dimensions; conditional negative under a limited direct decoder.** The historical 256-byte string is authentic public Cicada-served material from January 2014. Its reuse with the 2014 LP2 printed base60 table is a hypothesis without a surviving Cicada instruction. No unknown LP2 plaintext, cipher method or continuation is recovered.

## Independently exposed historical inputs

The January 6–7, 2014 second onion (cu343l33nqaekrnw.onion) progressively appended exactly **256 binary bytes** represented as **512 hexadecimal characters**. A contemporary public walkthrough records the final complete byte string and the original comment "Patience is a virtue." Separately, the archived IRC bot log records a complete 160-byte prefix at length160, an entire 190-byte snapshot after restart, and the last 66 one-byte additions through length256. Reconstructing those bytes yields the exact **512/512** characters in the independent walkthrough. The original onion subsequently replaced that text with another stage. The complete surviving byte value is fixed in [resources/2014-onion2-final-256byte-hex.txt](../resources/2014-onion2-final-256byte-hex.txt).

External supporting original-era witnesses are the [2014 Scream314 walkthrough](https://github.com/Dukotah/cicada3301/blob/master/archive/branches-2026/claude_master-roadmap-libra-qk527u/sources/community/scream314_2014.md) and the [archived January 2014 BotSottile IRC log](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt). The same external archive preserves a separate, incomplete inter-byte timing channel. I reconciled the BotSottile IRC log, Cripion101 paste, and both Uncovering Cicada wiki exports against the complete 256-byte string: **112 distinct intervals agree with zero conflicts**, covering zero-based byte indices **142–255 except 189 and 190**. The merged rows and source attribution are preserved in [the 112-interval dataset](lp2-2014-onion2-timing-merged-112.json). This gate still distinguishes the timing channel from the complete 256-byte values.

The LP2 pp49–51 32×8 printed base60 table supplies its own complete **256-byte** register, separately fixed in [resources/liber-primus/base60-grid.json](../resources/liber-primus/base60-grid.json). The first onion bytes are decimal **99,66,146,186**, versus printed table **203,231,167,186**. There is **one** exact same-position byte equality across the 256 positions. The original onion sequence has **158 distinct bytes**, the table **161**, and their distinct-byte inventories intersect at **100** values. These counts provide no copy or simple permutation identity.

A human Cicada solver in 2014 could plausibly retain the earlier 256-byte onion string and compare it with a later exactly 256-byte numerical table. Bitwise complement and XOR had demonstrable uses in the intervening 2014 puzzle. The manuscript does not expressly instruct the solver to pair these two objects, choose a byte-level XOR, or advance a key from this prior stage. This is a bounded, historical-material-derived experiment.

## Fixed reversible original reads

Taking the original printed row-major table as 256 data bytes and the complete onion-2 values as an independent 256-byte key, use six direct layer inverses: **XOR**, **subtract modulo256**, or **add modulo256**, with the key either in source order or completely reversed. Both signs are included because arithmetic orientation is not source-selected.

| Onion key order | Operation | Leading eight output bytes, hex | Printable ASCII bytes of 256 |
| --- | --- | --- | ---: |
| Original | XOR | a8a5350028134dd9 | **97** |
| Original | Subtract | 68a5150018ef4b49 | **88** |
| Original | Add | 2e293974aaebb125 | **95** |
| Reversed | XOR | 8dcfe3abb7058607 | **82** |
| Reversed | Subtract | 85bf63a98b058607 | **98** |
| Reversed | Add | 110febcb37d57667 | **78** |

None begins with a recognizable ordinary ZIP, GZIP, PNG, JPEG or PDF header or reads as an ASCII instruction. These byte counts are broadly random-like and are never represented as a probability of intent. All original outputs exactly round-trip through their matching binary inverses. This decisively fails only the direct *readable byte/message* use of the pairing. The byte outputs could themselves be ciphertext under an independently indicated operation.

As an additional fixed full-book key consumer, reduce each source byte modulo29, repeat exactly the 256-byte key from LP2 physical p0 rune zero, and use the solved-page GP29 additive rule to attempt either sign. Test each of three source-defined 256-byte keys: **onion alone**, **table alone**, and **table XOR onion**. Keep a continuous original runic clock across the **12,956** unknown runes and separately allow the solved-p56 literal-F non-consuming convention, without any phase search. These 12 complete outputs have total IoC **0.034451516–0.035811414**, versus unchanged LP2 **0.034478398**. The literal-F-transparent decodes have the modest expected excess caused by retaining many F symbols; none yields a complete native-GP message. No-skip direct GP29 plants of original length recover **12,956/12,956** runes under their matching forward key, and binary plants invert **256/256** bytes. We do not claim an injective F-transparent encoder for arbitrary text: a general output collision can create spurious F symbols, so that convention is explicitly conditional.

An independent GF29 polynomial identity check on all eight source-order/reversal/complement combinations of these two 256-byte registers gives polynomial gcd 1 in every case. This is an exploratory necessary-condition check for shared factors, not an authored decoding instruction and not part of the claimed direct plaintext gate.

## Timing-channel reconciliation and direct key-stream gate

The four independent witnesses are:

- [BotSottile IRC log](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt)
- [Cripion101 paste capture](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_Cripion101_5bTLHqCN.txt)
- [Uncovering Cicada wiki export 00120](https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/wikis/uncovering-cicada/export_cur_00120.xml)
- [Uncovering Cicada wiki export 00140](https://github.com/Dukotah/cicada3301/blob/master/corpus/C-community/wikis/uncovering-cicada/export_cur_00140.xml)

Each timing row is aligned to the zero-based index of the byte appended at the end of that interval. The 25-value wiki140 sequence aligns to bytes 142–166; the wiki120 and Cripion101 blocks overlap at 151–170, then Cripion101 continues through 181. BotSottile supplies 85 additional consecutive single-byte intervals where its log records adjacent byte lengths. Across the four witnesses, the overlap agrees exactly. The union contains **112** intervals over indices 142–255, with only **189 and 190** missing. The interval values are all multiples of five minutes; dividing by five yields the sequence in the JSON dataset. Its frequency is 1:46, 2:33, 3:21, 4:5, 5:4, 6:2, 7:1 (Shannon entropy 2.036 bits/value).

The original HTML snapshot contains the comment `<!--Patience is a virtue-->`. The wiki export also records contemporary discussion of the string's gradual appearance, but that commentary is not an authenticated cipher instruction. Treat the timing stream as a candidate, not as an established key.

**Direct LP2 test.** The 112 known interval/5 values were compressed across the two missing positions and tested as a repeating 112-symbol key from p0 rune zero. This compression and periodicity are explicit exploratory assumptions. Both signs were tested under (a) a book-continuous clock and (b) a page-reset clock, using either ordinary GP29 addition or a step along the source-derived 28-symbol Möbius cycle. Across the eight outputs, IoC remains **0.034466–0.034516** and top-12 rune mass **0.429454–0.435705**, indistinguishable from the original random-like corpus (**0.034478**, **0.429762**). None yields plaintext. The direct paired-byte operations (add, subtract, XOR, multiply, divide, and remainder) on the observed onion2 bytes or corresponding p50 table bytes likewise produce no readable message or recognizable file signature.

**Decision.** The timing evidence is now reconciled and reusable, but the simple key-stream interpretations do not decrypt LP2. Do not expand this into arbitrary arithmetic, phase, or reset searches without independent evidence specifying how the timing channel connects to the manuscript. Reproducer: [`sims/lp2_2014_onion2_timing_key_gate.cjs`](../sims/lp2_2014_onion2_timing_key_gate.cjs); data: [`im-results/lp2-2014-onion2-timing-merged-112.json`](lp2-2014-onion2-timing-merged-112.json).

---

## Decision and next actionable requirement

The historical onion-2 stream is now durably indexed as a **genuine complete source-selected 256-byte candidate key**, preventing later work from rediscovering or retyping it. Comparing it against the LP2 source table is motivated by the exact length and earlier documented binary operations, but both common direct consumers, bytewise binary masking and a repeated GP29 additive key, fail on untouched ciphertext.

A new route would require an **independently authored pairing/operation** (for example a specifically indicated format, permutation, KDF, or key-state reset) and a prediction that transforms the original table or unknown runes into authentic plaintext. Reinterpreting arbitrary numerical coincidences or freely changing the phase does not advance this experiment.

**Reproduction:** [Node22 CommonJS original-source SFT](../sims/lp2_2014_onion2_grid256_historical_key_sft.cjs) operating on both committed complete 256-byte sources and the original untouched 12,956-runic corpus. [Manual Windows GitHub Actions run 43392764070](https://github.com/FlareZ123/liber-primus/actions/runs/43392764070).
