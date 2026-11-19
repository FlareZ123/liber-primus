# Historical 2014 Onion2 256-byte stream and LP2 grid: direct consumers fail; source selector absent

**13–19 November 2026, Agents16,12,39 and15. Classification: authentic historical byte/timing observations with a 256-cell numerical analogy; bounded negatives for direct, repeated-key, timing, RC4 and key-skip consumers, plus a source-selector audit that retires the unselected non-additive value-rewrite branch.** The historical 256-byte string is authentic public Cicada-served material from January 2014. Its reuse with the 2014 LP2 printed base60 table is a hypothesis without a surviving Cicada instruction. No unknown LP2 plaintext, cipher method or continuation is recovered.

## Independently exposed historical inputs

The January 6–7, 2014 second onion (cu343l33nqaekrnw.onion) progressively appended exactly **256 binary bytes** represented as **512 hexadecimal characters**. A contemporary public walkthrough records the final complete byte string and the original comment "Patience is a virtue." Separately, the archived IRC bot log records a complete 160-byte prefix at length160, an entire 190-byte snapshot after restart, and the last 66 one-byte additions through length256. Reconstructing those bytes yields the exact **512/512** characters in the independent walkthrough. The original onion subsequently replaced that text with another stage. The complete surviving byte value is fixed in [resources/2014-onion2-final-256byte-hex.txt](../resources/2014-onion2-final-256byte-hex.txt).

External supporting original-era witnesses are the [2014 Scream314 walkthrough](https://github.com/Dukotah/cicada3301/blob/master/archive/branches-2026/claude_master-roadmap-libra-qk527u/sources/community/scream314_2014.md) and the [archived January 2014 BotSottile IRC log](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round43/F5-stored/onion2-timing_BotSottile_qn8jmPJr.txt). The separate inter-byte timing channel has now been reconciled by the external, preregistered F5b-T lane. It contains **112 exact interval values** at one-based byte positions **143–256 except 190 and 191** (zero-based indices 142–255 except 189 and 190), plus a bounded two-interval bridge at positions 190–191 whose sum is 30 minutes and whose five possible 5-minute splits are preserved in the dataset. There are 31 multi-witness cells, 81 single-witness cells, and 9 single-witness values flagged by their witness as unconfirmed. There are **no interval-value disagreements**; one Cripion clock-minute transcription slip at byte 168 creates two dependent clock-difference findings, resolved by the elapsed column and independent wiki table without changing any interval value. The merged rows, confidence, witnesses, and bounded bridge are preserved in [the timing dataset](lp2-2014-onion2-timing-merged-114.json).

The LP2 pp49–51 32×8 printed base60 table supplies its own complete **256-byte** register, separately fixed in [resources/liber-primus/base60-grid.json](../resources/liber-primus/base60-grid.json). The first onion bytes are decimal **99,66,146,186**, versus printed table **203,231,167,186**. There is **one** exact same-position byte equality across the 256 positions. The original onion sequence has **158 distinct bytes**, the table **161**, and their distinct-byte inventories intersect at **100** values. These counts provide no copy or simple permutation identity.

The equal length of the 256-byte stream and the later p50 grid is only a dimensional analogy; the archived 2014 second-onion decode pipeline does not pair them. Its executable script creates 512.bin from the short stream but never reads that file again. The documented bitwise complement operates on the separate later VHRH large-hex object. No examined 2013–2014 page, signed handoff or stage implementation instructs a solver to use the short stream as a key, pad, permutation, or state source for p50/LP2.

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


## Distinct RC4 direct-source key and paired-grid test (Agent12, 17 November)

The direct 256-byte GP29 repeated-key inverses above do not address a **cipher-specific keystream**. Cicada's earlier OutGuess use motivates a narrowly selected historical mechanism: initialize standard RC4 with the *actual 2014 January Onion2 256-byte string*, the independently original LP2 printed table's 256 bytes, or their 256-byte source-order XOR. Decode the untouched 12,956 GP29 rune ciphertext with generated byte streams reduced modulo29 and the two additive signs. Do not derive any extra secret key, and do not tune candidate stream bytes against unknown plaintext.

Original divisions fix three natural key-clock options: book-continuous, reset per physical page, or reset at the nine illustrated chapters. A 3-valued conventional RC4 beginning (byte0, RC4-drop256, RC4-drop512) covers bounded early-output handling; this is a **54-config original-cipher screen**. Independently use each of Onion2 and p50 as an RC4 key on the other's 256 raw bytes to check for direct headers or human-readable instructions (six fixed consumers).

| Fixed exact-original test | Result |
| --- | --- |
| Source byte identities | Onion2 begins `63 42 92 ba`, p50 begins `cb e7 a7 ba`; each exactly 256 bytes |
| Native GP29 56-page ciphertext coincidence | **0.0344783979** |
| Highest GP29 coincidence, 54 keyed-stream variants | **0.0345347475** |
| Highest 8-page / 16-page / 32-page output concentration | **0.0347219175 / 0.0346187935 / 0.0346027909** |
| Native independently solved clear p57 concentration | **0.0627099664** |
| Synthetic original GP29 solved-p56 reversible key plants | **85/85 exact** for Onion, Grid, Onion⊕Grid |
| Standard ARC4 `Key` test vector | **`eb9f7781b734ca72a719`** matched |
| Onion2 RC4-key decrypted p50 grid: first16 / printable among256 | `d5b24f4cbf8f69b06eca359a4f20e9a4`, 96 |
| P50 RC4-key decrypted Onion2 bytes: first16 / printable among256 | `460592e8b921be1326d7afac5c54f26b`, 91 |

No stream-key candidate develops whole-chapter native-language character concentration or consecutive authentic unknown plaintext; the byte outputs lack recognized readable instructions or ordinary file headers. Non-zero historical input provenance does not supply an author instruction selecting RC4 on these particular bytes. The experiment is deliberately limited to **no-keyskip GP29 Vigenère signs**, with the physical page/chapter clocks and small conventional RC4 starts. It cannot exclude a distinct byte-to-rune codec, plaintext-F keyskip, different cryptographic primitive, nonce/key derivation, or a now-lost original author opcode.

**Decision:** retire these particular nonlinear 256-byte historic-stream-key consumers. The original Onion2 data remain authentic 2014 material, and the LP2 table remains a separate 256-cell artifact; their numerical equality is currently insufficient to recover an LP2 key. Avoid widening generic cryptographic algorithm/parameter searches without first-party selection evidence. [Exact read-only original-source CJS SFT](../sims/lp2_2014_onion2_grid256_rc4_original_sft.cjs) · [Passing manual CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/44005443152).

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

**Decision:** these tests reject the specified repeated-key mappings and the one-shot 138-rune p48→49 consumer under the M1 key-skip model; they do not establish that M1 was used. The external M2 ciphertext-value-rewrite model remains mathematically distinct, but source-selector audit #1908 finds no 2013–2014 clue selecting it or any non-additive consumer of the Onion2 bytes/timing against an LP2 rune/table object. Retire M2 as an LP2 research branch; this is a missing-selector decision, not a proof that arbitrary transformations are impossible. Reopen only if new first-party material names the target object and supplies the operation, type conversion, alphabet, key order/initialization/clock, boundary behavior and inverse.

**Reproducer:** [Node 22 source-key key-skip SFT](../sims/lp2_2014_onion2_keyskip_beam_sft.cjs), including same-key positive controls, the one-shot p48→49 test, and a deterministic random-key null.
---

## 2013–2014 source-selector audit (Agent15, Issue #1908; 19 November 2026)

**Question.** Does any original or dated 2013–2014 source select a reversible non-additive operation that consumes the 256-byte Onion2 stream or its reconstructed timing values against a later LP2 rune/table object?

**Result: no source-selected consumer was found.** The strongest apparent candidate is the 2014 second-onion bitwise-complement step, but its executable dataflow binds that operation to a different object:

- The archived decode.sh converts the 512-character short stream 512.txt to 512.bin, then separately converts the later VHRH.txt large hex to VHRH.bin, runs flipbits.py, and extracts three JPEGs from inverted.bin.
- flipbits.py opens only VHRH.bin and rewrites each byte as b XOR 0xff. It never reads 512.bin. A pinned exact search for 512.bin finds its producer and README references, but no consumer.
- The archive README's illustrative shell snippets swap the 512.bin/VHRH.bin output names; the executable decode.sh plus flipbits.py settle the actual dataflow. The README's own 512-character section labels the short stream unresolved and says the archive author knew of no use for it, while relaying a tentative “buy time” explanation from IRC. That is participant reconstruction, not a Cicada statement.
- The documented second-onion route continues from the separate large-hex object: complement bytes, carve JPEGs, run OutGuess on each image, XOR the extracted OutGuess messages, then apply a specified columnar transposition. These operations consume the later image/message payloads, not the short 256-byte stream. This is the genuine non-additive precedent, but its operands are explicit and distinct.
- The 2013 second-onion patience.html repeats “Patience is a virtue” and includes a hidden comment explaining it as a prompt to return soon. The 2014 second-onion page repeats the phrase; the archived chronology records that the short stream stopped, then the comment changed to 761 as a much larger hex block appeared. The archive associates 761 with the phrase's gematria and describes it as a hint for upcoming pieces. The plausible human solve path is to wait for the update and follow the 761/gematria clue into the later large-hex pipeline—not to use the earlier short stream as a key for p50.
- Contemporary IRC records are solver evidence, not author instructions. On 8 January the #3301xor group tested repeating-XOR/key-length and ASCII hypotheses; the log records too many false positives and the channel topic's conclusion that the stream was not XOR-encoded complete ASCII plaintext. Known-plaintext probes for PGP, JPEG, ID3 and Psychomachia against the 2013 ISO did not match.
- On 10 January #cicadaops contains a participant proposal to try the short stream as an image keyfile. The surviving transcript then shows an OutGuess run with -k 1033, binary output and an explicit acknowledgement that wrong keys can still yield data. It does not show a successful extraction with the 256-byte stream and does not identify an LP2 rune/table target.
- The 114 timing intervals are reconstructed from observer/polling logs. The HTML source exposes the growing byte string and page comments, not an author-defined timing-symbol alphabet, timing-to-rune conversion, or instruction to apply the interval sequence to p50/LP2.

**Missing selector.** Within the pinned 2013–2014 artifacts examined here, no page or archived signed handoff identifies p50/another LP2 object as the target, or specifies byte-to-rune conversion, alphabet, key order/reversal, initialization/KDF, phase/clock, page/word boundary behavior, or inverse. The equal 256-byte/256-cell dimensions do not supply those missing semantics. Generic OutGuess/XOR/columnar precedents cannot be transferred to a different operand without a source clue.

**Decision.** Retire the Onion2→LP2 non-additive value-rewrite branch. This is a missing-selector decision, not a mathematical proof that no arbitrary transform could be fitted. Keep the 256-byte string and timing observations as authentic historical resources. Reopen only if new first-party evidence names the LP2 target and supplies the operation semantics needed for a locked reversible prediction.

**Pinned source links:** [2014 second-onion README](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/003-second-onion/README.md) · [executable decode.sh](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/003-second-onion/decode.sh) · [flipbits.py](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/003-second-onion/flipbits.py) · [2014 first-three-pages implementation](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/004-first-three-pages/README.md) · [2013 patience page](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2013/005-second-onion/patience.html) · [2014 #3301xor log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%233301xor.freenode.log) · [2014 #cicadaops log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadaops.freenode.log) · [local 2014 page snapshot](../resources/external/2014-stage03-index.html) · [fixed byte string](../resources/2014-onion2-final-256byte-hex.txt) · [merged timing observations](lp2-2014-onion2-timing-merged-114.json).

## Decision and next actionable requirement

The original 2014 Onion2 page yields two source-authenticated inputs: a **256-byte byte string** and **114 exact timing intervals**. These are durable historical artifacts, not established LP2 keys. The byte string fails the previously tested direct binary and rigid GP29 consumers; the timing stream fails the preregistered additive/Beaufort/Atbash and direct Möbius-cycle families. The new skip-aware M1 beam also finds no English for the source-order repeated-key mappings, despite successful same-key positive controls. Do not describe either artifact as an LP2 key or repeat these mappings without new first-party evidence selecting the operation.

No non-additive Onion2→LP2 route remains authorized by the examined sources: the M2 value-rewrite model is unselected and retired. The 256-byte stream and timing observations remain historical resources, not LP2 keys. Reopen only if new first-party evidence explicitly names a later LP2 target and supplies a reversible operation with fixed conversion, alphabet, order, initialization, clock and boundary semantics; then test only that frozen rule against a preselected original interval and a solved-page positive control. Do not use the equal 256 length, generic 2014 OutGuess/XOR precedents or unselected timing values as selectors.

**Reproduction:** [Node22 skip-aware source-key SFT](../sims/lp2_2014_onion2_keyskip_beam_sft.cjs) and [original direct-key SFT](../sims/lp2_2014_onion2_grid256_historical_key_sft.cjs) operating on the committed 256-byte sources and original 12,956-rune corpus. [Manual Windows GitHub Actions run 43392764070](https://github.com/FlareZ123/liber-primus/actions/runs/43392764070).
**Reproduction:** [Node22 CommonJS original-source SFT](../sims/lp2_2014_onion2_grid256_historical_key_sft.cjs) operating on both committed complete 256-byte sources and the original untouched 12,956-runic corpus. [Manual Windows GitHub Actions run 43392764070](https://github.com/FlareZ123/liber-primus/actions/runs/43392764070).
