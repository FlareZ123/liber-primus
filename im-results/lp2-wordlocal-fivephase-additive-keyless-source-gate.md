# Key-independent GP29 word-local period-five cipher exclusion

**Agent20, 16 November 2026. Classification: original-cipher finite-register exclusion.** All 56 unknown Liber Primus pages remain unsolved. This test supplies a necessary algebraic condition that avoids guessing any of the secret keys. It excludes per-word five-phase **additive and independent Atbash/ROT** encoders across three pinned GP29 source-language registers, with the authentic printed cuts preserved. It does not establish plaintext or a first-party cipher.

## The original-data puzzle and why this test is different

Unknown LP2 p0–55 has **12,956 runes across 2,896 physical printed words**, with 32 words continuing over a page boundary. There are **104 within-word repeats at distance five** in 2,105 positions, against relatively scarce adjacent ciphertext repeats. A tempting explanation is that the same five key elements are repeated within each word, perhaps with a new independently generated key at every word. Even **29^5 independent secret shifts per word** are allowed in this experiment. Rather than enumerate those keys, the repeated phase creates a mathematical invariant on the original ciphertext.

This gate is distinguishable from older five-phase arbitrary secret-permutation tests, whose invariant is just same-phase *equality*. Independent Latin Vulgate controls match that weaker equality fingerprint for **107/109** original words of length 10–14. The full difference vector is far more discriminating.

## Invariant A: all per-word five-phase additive shifts

For source rune values and plaintext GP29 values \(C_{w,j},P_{w,j}\in\mathbb Z_{29}\), allow every original printed word its own completely unknown five-symbol key:

\[
 C_{w,j}=P_{w,j}+K_{w,j\bmod 5}\pmod{29}.
\]

Every one of the five unknown shifts cancels at every same-phase pair:

\[
  C_{w,j}-C_{w,j-5}=P_{w,j}-P_{w,j-5}\pmod{29},
  \qquad j\ge 5.
\]

For each original word, generate the complete vector of its differences for \(j=5,\ldots,n-1\), then compare it with every *source-native GP spelling* of the same length. A missing match means **no choice of any five shifts for that word**, independently of all other words, can produce that reference plaintext word.

## Invariant B: independent per-phase shifts and Atbash signs

Real Cicada stages used simple ROT and Atbash operations. An even larger, source-era-compatible family grants a separate **addition or reversal** at each of the five phase lanes, freshly selectable for every word:

\[
 C_{w,j}=\epsilon_{w,j\bmod 5}\,P_{w,j}
          +K_{w,j\bmod5}\pmod{29},
 \quad\epsilon_{w,r}\in\{-1,+1\}.
\]

For each phase \(r\), the complete same-phase fifth-lag difference vector must equal either the plaintext vector or its **whole-vector negation**. Canonicalize each of the five vectors as the lexicographically smaller of itself and its negation, *retaining both successive differences in the same lane for words long enough to contain them*. Thus the test admits all 32 independently selected sign patterns per printed word plus all possible additive shifts, without search. This expands the result from additive Vigenère to per-phase Atbash/ROT. It still excludes scaling other than ±1, nonlinear alphabets and stateful or resegmented emitters.

## Whole-original source results

Input: original pages p0–55 as [source transcription](../resources/liber-primus/lp2-transcription.txt) checked against the [canonical GP rune indices](../resources/liber-primus/lp2-corpus.json). The 29-symbol GP spelling and the project's explicit longest-match ING→NG, IO→IA, K/Q→C, V→U and Z→S normalization are used consistently.

Three finite, independently pinned reference registers were tested: the project's ~29k modern-English word-frequency fixture; **10,885 native GP words** from the corrected *Beowulf* source (48,012 GP runes); and **39,835 original word-preserving GP Latin Vulgate words**. The two historical corpora are finite text samples, not complete dictionaries for their languages.

| Original printed rune length | Original words | Additive matches: English / Old English / Latin | ±Atbash/ROT matches: English / Old English / Latin |
|---:|---:|---:|---:|
| 6 | 256 | 256 / 256 / 256 | 256 / 256 / 256 |
| 7 | 216 | 207 / 71 / 124 | 216 / 159 / 200 |
| 8 | 156 | 24 / 1 / 4 | 100 / 4 / 46 |
| 9 | 78 | 1 / 0 / 1 | 6 / 0 / 2 |
| 10 | 52 | **0 / 0 / 0** | **0 / 0 / 0** |
| 11 | 32 | **0 / 0 / 0** | **0 / 0 / 0** |
| 12 | 18 | **0 / 0 / 0** | **0 / 0 / 0** |
| 13 | 4 | **0 / 0 / 0** | **0 / 0 / 0** |
| 14 | 3 | **0 / 0 / 0** | **0 / 0 / 0** |
| **Total length 10–14** | **109** | **0 in all three** | **0 in all three** |

The full **109 original 10–14-rune words have no plaintext candidate from any of these finite registers under either exact five-period family**, even with an arbitrary five-symbol secret and independently chosen phase orientation for each word.

The signed extension improves on the already strong additive result and directly includes the historically recognized Atbash/ROT operations. In comparison, source-native Latin prose matched the exact *equality-only* secret-phase fingerprint on 107/109 long words in the earlier [independent morphology work](lag5-contiguous-echo-second-order.md). Therefore, these original long-word constraints distinguish the proposed arithmetic operations from the more permissive secret alphabet family under a previously relevant competing language register.

## Positive control, reproduction and decision

The [Windows Node22 CommonJS SFT](../sims/lp2_wordlocal_period5_delta_invariant_sft.cjs) asserts the exact unchanged 12,956-rune sequence, 2,896 printed words, all original word lengths, all support counts in three registers, and authentic native-GP word normalization. To show that the invariant genuinely accepts a ciphertext made by the proposed architecture, it constructs **815** dictionary GP words matching each original long word length and encrypts them with new secret five-period keys. The basic additive test returns **815/815** supported candidates. A separate synthetic control uses different ± signs and shifts across every phase and word, and likewise returns **815/815**. A six-period additive wrong-family control is also output.

The complete [manual Windows/Node22 source-original run 43880833564](https://github.com/FlareZ123/liber-primus/actions/runs/43880833564) passed all three original language registers, both 815-word native positive controls, and all exact original-source assertions.

**Decision:** retire the complete class of GP29 per-printed-word five-period additive or independent Atbash/ROT rekeying as a direct ordinary GP-prose decoder under the three declared source registers. Its keys are mathematically irrelevant to the observed long-word failure. Preserve the genuine lag-five anomaly as a structural observation, without inferring these ruled-out period-five modes. A future live hypothesis would need independent evidence for a different operation, a new register, actual changed segmentation or a recoverable key and plaintext, rather than another unrestricted search through \(29^5\) shifts or 32 sign patterns per printed word.

**Evidence boundary:** these corpus-based necessary-condition tests do not prove a universal impossibility theorem for every English, Latin or Old English word, and they do not address an additional value-changing or transposition layer before/after this model. There is no authenticated unknown-page plaintext, original authorial key or complete cipher recovered.
