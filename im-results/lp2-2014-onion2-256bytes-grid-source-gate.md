# Historical 2014 onion-2 byte stream as a complete 256-byte LP2 grid key: direct consumers fail

**13 November 2026, Agent16. Classification: source-authenticated historical key material with source-linked numerical dimensions; conditional negative under a limited direct decoder.** The historical 256-byte string is authentic public Cicada-served material from January 2014. Its reuse with the 2014 LP2 printed base60 table is a hypothesis without a surviving Cicada instruction. No unknown LP2 plaintext, cipher method or continuation is recovered.

## Independently exposed historical inputs

The January 6–7, 2014 second onion (cu343l33nqaekrnw.onion) progressively appended exactly **256 binary bytes** represented as **512 hexadecimal characters**. A contemporary public walkthrough records the final complete byte string and the original comment "Patience is a virtue." Separately, the archived IRC bot log records a complete 160-byte prefix at length160, an entire 190-byte snapshot after restart, and the last 66 one-byte additions through length256. Reconstructing those bytes yields the exact **512/512** characters in the independent walkthrough. The original onion subsequently replaced that text with another stage. The complete surviving byte value is fixed in [resources/2014-onion2-final-256byte-hex.txt](../resources/2014-onion2-final-256byte-hex.txt).

External supporting original-era witnesses are the [2014 Scream314 walkthrough](https://github.com/Dukotah/cicada3301/blob/master/archive/branches-2026/claude_master-roadmap-libra-qk527u/sources/community/scream314_2014.md) and the [archived January 2014 BotSottile IRC log](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt). The separate inter-byte timing channel has now been reconciled by the external, preregistered F5b-T lane. It contains **112 exact interval values** at one-based byte positions **143–256 except 190 and 191** (zero-based indices 142–255 except 189 and 190), plus a bounded two-interval bridge at positions 190–191 whose sum is 30 minutes and whose five possible 5-minute splits are preserved in the dataset. There are 31 multi-witness cells, 81 single-witness cells, and 9 single-witness values flagged by their witness as unconfirmed. There are **no interval-value disagreements**; one Cripion clock-minute transcription slip at byte 168 creates two dependent clock-difference findings, resolved by the elapsed column and independent wiki table without changing any interval value. The merged rows, confidence, witnesses, and bounded bridge are preserved in [the timing dataset](lp2-2014-onion2-timing-merged-114.json).

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

Each timing row is aligned to the one-based position of the byte appended at the end of that interval; the dataset also records zero-based indices. The 25-value wiki140 sequence aligns to one-based bytes 143–167; the wiki120 and Cripion101 blocks overlap at 152–171, then Cripion101 continues through 182. The original F5b-T merge supplied 112 exact intervals plus a bounded 30-minute bridge at bytes 190–191. A separate contemporary MassoBot site-change witness, cross-referenced to BotSottile's byte-length snapshots, resolves that bridge to **10 and 20 minutes** (five-minute units **[2,4]**). The resulting **114 exact intervals** cover every byte position 143–256. There are 33 multi-witness cells, 81 single-witness cells, and 9 single-witness values flagged as unconfirmed. There are no interval-value disagreements; one Cripion clock-minute transcription slip at byte168 causes two dependent clock-difference findings, resolved by the elapsed column and independent wiki clock. The interval/5 frequency is 1:46, 2:34, 3:21, 4:6, 5:4, 6:2, 7:1 (2.054 bits/value).

The original HTML snapshot contains the comment `<!--Patience is a virtue-->`. The wiki export also records contemporary discussion of the string's gradual appearance, but that commentary is not an authenticated cipher instruction. Treat the timing stream as a candidate, not as an established key.

**Direct LP2 test.** The 114 exact interval/5 values were tested as a repeating 114-symbol key from p0 rune zero. This period is an explicit exploratory assumption. Both signs were tested under (a) a book-continuous clock and (b) a page-reset clock, using either ordinary GP29 addition or a step along the source-derived 28-symbol Möbius cycle. Across the eight outputs, IoC remains **0.034454–0.034514** and top-12 rune mass **0.427987–0.436400**, indistinguishable from the original random-like corpus (**0.034478**, **0.429762**). None yields plaintext. The direct paired-byte operations (add, subtract, XOR, multiply, divide, and remainder) on the observed onion2 bytes or corresponding p50 table bytes likewise produce no readable message or recognizable file signature.

**Decision.** The preregistered interval-derived additive/Beaufort/Atbash key-stream family is decisively negative under the external plant-gated sweep. The local Möbius-cycle interpretation is also negative. Do not repeat these families or expand them into arbitrary arithmetic, phase, or reset searches. Only revisit the timing channel if independent evidence specifies a different operation or links it to a particular LP2 object. Reproducer: [`sims/lp2_2014_onion2_timing_key_gate.cjs`](../sims/lp2_2014_onion2_timing_key_gate.cjs); data: [`im-results/lp2-2014-onion2-timing-merged-114.json`](lp2-2014-onion2-timing-merged-112.json).

---

## Stronger independent timing-key test (F5b-T)

The external [F5b-T preregistration](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/PREREG.md) was written before the witness merge and decode. It treats the interval/5 values as a candidate LP2 keystream and fixes the streams, mappings, modes, thresholds, and positive controls in advance.

The merge alignment is: Cripion block 1 = one-based bytes 152–173; block 2 = 174–182; wiki tables = 152–171; wiki-00140 25-sample = 143–167. BotSottile supplies exact arrivals for 169–189 and 192–256. Restart dumps and off-grid stamps are upper bounds, not arrivals. The first nine wiki-00140 cells are single-witness values explicitly marked “cannot confirm”; one of these has independent corroboration. The offline bridge at bytes 190–191 was initially bounded to a 30-minute total, with five possible interval/5 splits. The later independent MassoBot/BotSottile cross-witness selects **(2,4)**, i.e. 10 then 20 minutes; this exact variant was already among the five streams in the preregistered sweep.

The fixed sweep tested 7 streams (S_A, S_B, and five bridge variants) × 2 directions × 3 mappings (k mod29, 5k mod29, and GP-prime[k] mod29) × 6 configurations (Vigenère ±, Beaufort, each plain and Atbash-composed), under repeating rotations and one-shot page-start suffix alignments of at least 60 runes. This is 34,668 decodes per page across 55 pages: **1,906,740 scored decodes**, plus 104,004 control decodes. All **3/3 planted positive controls** were recovered byte-exactly at their planted cells.

<badge color="danger">Negative result</badge> **Zero crossers.** The global best is pmax **5.364** (page 30, S_B forward, 5k mod29, Beaufort+Atbash, repeating rotation 36, length 263), against the pre-registered bar **18.103**. There were no near-misses. The result is therefore a strong negative for the preregistered interval-derived additive/Beaufort/Atbash key-stream family, not merely a failure of the small local periodic test.

This external sweep does not test byte values themselves as a key, interval-based transposition/permutation/skip/page-selection, interval/byte interleavings, or intervals for bytes 2–142 (not present in the held sources). The local script below additionally tests the 114 resolved values as steps along the p05-derived Möbius 28-cycle; that direct interpretation also remains nonlinguistic. Do not repeat the tested key-stream families. Revisit only if a new source specifies one of the uncovered operations or supplies earlier timing data.

Reproducers and full results:
- [External results](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md)
- [External merge script](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/merge_witnesses.py)
- [External sweep script](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5bT-timing-keystream/run_f5bt.py)
- Local Möbius/additive exploratory gate: [`sims/lp2_2014_onion2_timing_key_gate.cjs`](../sims/lp2_2014_onion2_timing_key_gate.cjs)


## Skip-aware source-key test (Agent39, 16 November 2026)

A separate community hypothesis proposes that the unusually low adjacent-repeat rate is produced by a soft ciphertext collision-rejection filter: when a candidate ciphertext rune equals the preceding ciphertext rune, the encoder sometimes rejects that key draw and advances the key pointer. The external model estimates rejection probability **s = 0.8129**. This is a hypothesis, not an authenticated Cicada instruction. I independently implemented its M1 key-skip inverse using a width-400 GP29 quadgram beam; the method and model are documented in [Dukotah/Cicada3301 Campaign XVIII](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round18/L2-filter-leak/RESULTS.md) and [skipdecode.py](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/campaign18_skip/skipdecode.py) (MIT-licensed source repository).

**Fixed scope:** original p0–p55 corpus (12,956 runes); continuous key clock across pages for full-book tests; forward source order; key starts at offset zero; both arithmetic signs; no p56 transparent-F bypass. Full-book tests repeat the source key. In addition, the 256-byte Onion2 string was tested as a **one-shot** key against the complete 138-rune pre-table sentence: the final 72 runes of p48 plus all 66 runes of p49, as independently segmented in [the #1099 source correction](https://github.com/FlareZ123/liber-primus/issues/1099#issuecomment-6893143467). Maximum skips per rune are bounded by the source key's longest identical-symbol run (2 for the byte string, 3 for the timing sequence). No phase search, page resets, reversal, KDF, or value-rewrite inverse is included.

Each key was first planted into a same-length Gibran English control using the same soft rejection rule and deterministic seed. The width-400 inverse recovered **99.93–100%** of the planted runes, scoring approximately **−4.288** for full-book plants and **−4.361** for the 138-rune one-shot plant; the external English gate is **−5.2**. Thus the decoder is capable of recovering English under the same key-period and skip constraints.

| Source input and GP29 mapping | Use | Positive-control recovery | Actual C=P+K | Actual C=P−K |
|---|---|---:|---:|---:|
| Onion2 byte string, byte mod 29 | Repeated, full p0–p55 | 99.93% | −7.293 (293 skips) | −7.268 (295) |
| Onion2 byte string, byte mod 29 | One-shot, 138-rune p48→49 sentence | 100% | −7.342 (4 skips; 142 bytes consumed) | −7.774 (5 skips; 143 bytes consumed) |
| Timing intervals, k = interval/5 | Repeated, full p0–p55 | 100% | −7.297 (334) | −7.287 (358) |
| Timing intervals, 5k mod 29 | Repeated, full p0–p55 | 99.93% | −7.284 (378) | −7.319 (358) |
| Timing intervals, prime(k) mod 29 | Repeated, full p0–p55 | 100% | −7.270 (326) | −7.286 (379) |

### Transfer of the solved p56 plaintext-F transparency rule to the one-shot p49 sentence

The solved p56 page establishes an additive GP29 operation in which plaintext **F** is emitted unchanged and consumes no key symbol. A human solver could reasonably test that known convention with the historical 256-byte Onion2 string as a one-shot key. I therefore ran a second, independent inverse on the same complete 138-rune p48→49 sentence: forward bytes mod29, key offset zero, no repetition, both arithmetic signs. The decoder branches between transparent plaintext-F and encrypted non-F symbols. Its positive control uses the same key and rule on a 138-rune Gibran plant and recovers **100%** (score **−4.361**, 134 key bytes consumed).

For the original sentence, an **exact reachability DP** over every possible key-pointer state (at most 257 states, with no language-model pruning) proves that no legal inverse path exists: **C=P+K first becomes impossible at rune offset 6; C=P−K at offset 9**. Both failures occur long before the 256-byte key is exhausted. This is a conditional exact exclusion of the direct byte-mod29 one-shot key under the verified p56 plaintext-F rule; transferring that rule to p49 is itself a hypothesis.

The original full-book ciphertext has **86 adjacent doublets**. A deterministic random 256-symbol key null scores **−7.305/−7.316**, essentially the same as the Onion2 byte-string full-book results. All ten original source-key/sign outputs remain below the English threshold and are ciphertext-like. The source-order timing keys' synthetic plants also produce more doublets (102–121) than the original's 86, a further mismatch with this particular filter/key pairing.

**Decision:** these tests reject the specified repeated-key mappings and the one-shot 138-rune p48→49 consumer under the M1 key-skip model; they do not establish that M1 was used. The external work also describes an M2 ciphertext-value-rewrite model with similar ciphertext statistics; that inverse is not tested here. Nor does this exclude a source-selected KDF, a different key source, or a separately evidenced state reset. No first-party source currently links either 2014 Onion2 sequence to LP2 as a key.

**Reproducer:** [Node 22 source-key key-skip SFT](../sims/lp2_2014_onion2_keyskip_beam_sft.cjs), including same-key positive controls, the one-shot p48→49 test, and a deterministic random-key null.
---

## Decision and next actionable requirement

The original 2014 Onion2 page yields two source-authenticated inputs: a **256-byte byte string** and **114 exact timing intervals**. These are durable historical artifacts, not established LP2 keys. The byte string fails the previously tested direct binary and rigid GP29 consumers; the timing stream fails the preregistered additive/Beaufort/Atbash and direct Möbius-cycle families. The new skip-aware M1 beam also finds no English for the source-order repeated-key mappings, despite successful same-key positive controls. Do not describe either artifact as an LP2 key or repeat these mappings without new first-party evidence selecting the operation.

A new route requires an **independently authored pairing/operation**—for example a specifically indicated format, permutation, KDF, or key-state reset—and a locked prediction that transforms original ciphertext into authentic plaintext. The externally proposed M1 filter is not itself established, and the M2 value-rewrite inverse remains a distinct untested model. Avoid further free phase, mapping, or transformation sweeps.

**Reproduction:** [Node22 skip-aware source-key SFT](../sims/lp2_2014_onion2_keyskip_beam_sft.cjs) and [original direct-key SFT](../sims/lp2_2014_onion2_grid256_historical_key_sft.cjs) operating on the committed 256-byte sources and original 12,956-rune corpus. [Manual Windows GitHub Actions run 43392764070](https://github.com/FlareZ123/liber-primus/actions/runs/43392764070).
**Reproduction:** [Node22 CommonJS original-source SFT](../sims/lp2_2014_onion2_grid256_historical_key_sft.cjs) operating on both committed complete 256-byte sources and the original untouched 12,956-runic corpus. [Manual Windows GitHub Actions run 43392764070](https://github.com/FlareZ123/liber-primus/actions/runs/43392764070).
