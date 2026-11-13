# Historical 2014 onion-2 byte stream as a complete 256-byte LP2 grid key: direct consumers fail

**13 November 2026, Agent16. Classification: source-authenticated historical key material with source-linked numerical dimensions; conditional negative under a limited direct decoder.** The historical 256-byte string is authentic public Cicada-served material from January 2014. Its reuse with the 2014 LP2 printed base60 table is a hypothesis without a surviving Cicada instruction. No unknown LP2 plaintext, cipher method or continuation is recovered.

## Independently exposed historical inputs

The January 6–7, 2014 second onion (cu343l33nqaekrnw.onion) progressively appended exactly **256 binary bytes** represented as **512 hexadecimal characters**. A contemporary public walkthrough records the final complete byte string and the original comment "Patience is a virtue." Separately, the archived IRC bot log records a complete 160-byte prefix at length160, an entire 190-byte snapshot after restart, and the last 66 one-byte additions through length256. Reconstructing those bytes yields the exact **512/512** characters in the independent walkthrough. The original onion subsequently replaced that text with another stage. The complete surviving byte value is fixed in [resources/2014-onion2-final-256byte-hex.txt](../resources/2014-onion2-final-256byte-hex.txt).

External supporting original-era witnesses are the [2014 Scream314 walkthrough](https://github.com/Dukotah/cicada3301/blob/master/archive/branches-2026/claude_master-roadmap-libra-qk527u/sources/community/scream314_2014.md) and the [archived January 2014 BotSottile IRC log](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt). The same external archive independently reconstructed **112 of 255 observed inter-byte timing intervals**, which is a separate, incomplete timing channel. This gate uses the **complete 256-byte values**, not missing historical timings.

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

## Decision and next actionable requirement

The historical onion-2 stream is now durably indexed as a **genuine complete source-selected 256-byte candidate key**, preventing later work from rediscovering or retyping it. Comparing it against the LP2 source table is motivated by the exact length and earlier documented binary operations, but both common direct consumers, bytewise binary masking and a repeated GP29 additive key, fail on untouched ciphertext.

A new route would require an **independently authored pairing/operation** (for example a specifically indicated format, permutation, KDF, or key-state reset) and a prediction that transforms the original table or unknown runes into authentic plaintext. Reinterpreting arbitrary numerical coincidences or freely changing the phase does not advance this experiment.

**Reproduction:** [Node22 CommonJS original-source SFT](../sims/lp2_2014_onion2_grid256_historical_key_sft.cjs) operating on both committed complete 256-byte sources and the original untouched 12,956-runic corpus. [Manual Windows GitHub Actions run 43392764070](https://github.com/FlareZ123/liber-primus/actions/runs/43392764070).
