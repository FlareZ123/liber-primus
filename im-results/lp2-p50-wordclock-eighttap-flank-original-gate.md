# P50 32×8 word-clock feedback does not decode both intact flanking sentences

**Agent10, 22 November 2026. Bounded original-cipher negative; no recovered unsolved Liber Primus plaintext, author key or destination.** Executed against unmodified source on Windows Node.js 22 ([successful Actions run 44990214927](https://github.com/FlareZ123/liber-primus/actions/runs/44990214927)); self-contained, reproducible CommonJS test: [`sims/lp2_p49_p51_p50_wordclock_eighttap_feedback_sft.cjs`](../sims/lp2_p49_p51_p50_wordclock_eighttap_feedback_sft.cjs).

## Why a solver might try it

The original pp49–51 print exactly **32 rows × 8 two-character numeric tokens**. A full 138-rune, 33-word sentence ends immediately before the table; a separate 170-rune, 40-word sentence begins after it. The authenticated signed 2016 instruction calls **words the map** and **numbers the direction**. One natural—but not independently authenticated—cipher architecture would use each complete printed word to advance through the 32 rows and the eight values in its current row to transform ciphertext with eight-symbol feedback. The original printed rows are observed. Whether they are intended as **GF29 coefficients** of a feedback equation is the weakest and unresolved premise. A rival reading is that the table is an independent numerical puzzle or uses a separate message/codec.

The investigation explicitly avoids the already completed table-byte additive pad, byte-pointer walk, source-period 14-column, P29 polynomial quotient pad, GF257/Fourier/RS code, fixed two-message same-pad and eight-bit table-feedback searches. The present mode is distinct in using a **printed-word clock** and **all eight coefficients of a row as a simultaneous ciphertext-history functional**. No secret starting state, score-selected table rotation, alternate radix or posttable key is fitted.

## Frozen decoder and forward transformation

Original inputs: [canonical source corpus](../resources/liber-primus/lp2-corpus.json), [original physical source word separators](../resources/lp2-transcription.txt), and [original 256-cell table](../resources/liber-primus/lp2-grid-256.json). Use exact conditional 2014 base60 byte values in printed row-major order, then reduce the byte values mod29. Keep all original GP29 rune positions and the real printed word clocks. The p50 numeric table adds no artificial word or rune slots. The original p48→49 carried word is included within its complete sentence.

Define `w(t)` as the complete printed GP word ordinal at rune `t`; `w(0)` is the first word of the intact 138-rune sentence. For row `r=(w(t)-w(0)) mod32`, let `b[r,0..7]` be the eight source byte values in that row reduced mod29. The frozen inverse is:

```text
P[t] = (C[t] - sum(j=1..8) b[r,j-1] * C[t-j]) mod 29
C[t-j] = 0 for t-j < 0
```

The exact forward transform rearranges the same equation:

```text
C[t] = (P[t] + sum(j=1..8) b[r,j-1] * C[t-j]) mod 29
```

The causal ciphertext history crosses the numeric-table insertion unchanged. A complete printed word increments the row clock by one, independent of its rune length. The fixed pretable word count33 means the posttable sentence starts at row `33 mod32 = 1` with context carried from the first passage, a specific model prediction fixed before the posttable output was measured.

## Exact original input and outputs

The entire pretable segment is **138 GP29 runes, 33 source words**: the final72 symbols on original p48 plus all66 runes p49. The untouched posttable segment is **170 runes, 40 words**: all92 runes p51 and initial78 runes p52. Original numeric p50 has zero runes. Their combined 308-rune ciphertext is not resegmented or normalized.

| Frozen readout | Rune count | GP29 index of coincidence | Source-native solved-Cicada GP trigram log-score |
| --- | ---: | ---: | ---: |
| First complete pretable sentence | 138 | **0.0353326986** | **−3.4574000** |
| Later untouched posttable sentence | 170 | **0.0336233902** | **−3.4133328** |
| Independently authored native GP planted pretable control | 138 | — | **−2.3053570** |
| Independently authored native GP planted posttable control | 170 | — | **−2.3764050** |
| Authentic clear original p57 reference | 95 | **0.0627099664** | **−2.4681447** |

First 100 decoded original symbols (historically normalized GP; one-rune ING/IO mappings) are:

```text
PRE:  LTHSWXIOAEINGBIHOMDNYYWYOEYFLXOEYYASFTHIOAYTOJOUNFAELOOINGDTHAEIEAAEALITHMEOPMSXGMMFEOINGYMUUIOCECUTEIYCJROIOFEADNYEATOEOIOXN
POST: RWLHOELAERTEOGRXFFJEBAEDHUCTCTHLOGEAMOINGAOIEOAETHXTGDDSOERIEXEOYOEOTDREOFRJLEAUEAJUHATONINGYGUMHYPUAGPINGHFXEOWTHATHTXPHFN
```

The complete source ciphertext decrypts to nonprose on **both** sentences. Both GP29 IoCs remain at uniform noise levels, with a large gap to native GP text. The independently trained model uses 3,510 original known-LP1 runes; it was frozen prior to inspecting the candidate output. The native positive uses an independent 308-rune span from that source with the **same actual 33+40 word clock**, forward-encrypts under the fixed key/history, and recovers **all 308/308 runes exactly**. The original 308-rune decrypt also **re-encrypts to every original rune identically**, including the true table crossing and the printed word boundaries. These correctness controls demonstrate that failure to obtain language is a real negative of this frozen model rather than an off-by-one programming error.

## Decision

**Retire the one source-motivated GP29 word-clock eight-tap feedback interpretation of the p50 table** for both intact original flanking sentences. The table does not independently instruct the eight-tap ciphertext functional, byte-to-GP29 reduction, eight-zero initial history or the row-clock. Native-text positives invert; the original does not. Changing the initial history, byte order, cipher direction, red-dot handling or alphabet after seeing failure would create a different unsupported model.

The positive causal route still requires an independently authenticated operation specifying how 256 original numeric values affect GP29 ciphertext or identify a new complete intermediate text/file. This experiment does **not** exclude other nonlinear modes, different plaintext registers, independent table meaning or externally supplied encryption keys. No original unknown-page plaintext has been recovered.