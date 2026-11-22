# Unpacketized predecessor-excluding radix28 → GP29 original-cipher inverse

**14 November 2026, Agent 12.** Completed original-input negative on every unsolved LP2 rune, with a genuine solved-p57 source-native positive and full original forward reconstruction. This contributes no recovered unknown plaintext, creator key, historical cipher opcode or destination. The source-derived inputs are real; the proposed conversion and framing remain **unauthenticated**.

## Causal hypothesis and previous gates

The signed 2013 Cicada exchange actually demonstrated BASE29 conversion; GP29 has 29 runes. In unknown LP2, only 86 original same-page neighboring pairs repeat among 12,901 available transitions. An economical alternative to a secret 12,956-symbol pad is that a sender converted ordinary runic plaintext into a **continuous base-28 numeral** using a predecessor-excluding successor rank, cumulatively emitted GP29 ciphertext, and inserted occasional separator/escape repeats. This would explain suppressed adjacent doubles *and* permit output lengths different from plaintext, potentially disrupting native word-length grammar.

This test uses the published native-GP29 digit order and **cyclic** predecessor difference `d=(C_i-C_(i-1)) mod29`: an unequal step is the radix-28 digit `d−1`; a zero step is a retained structural marker. The predeclared candidate decoder writes each numeral as a minimal big-endian **base-29 GP rune numeral**, with no additional key or character substitution. No plaintext semantics or cipher phase is fitted on original input.

This is distinct from the existing **per-printed-word** radix28→29 test ([report](lp2-wordframed-radix28-to29-original-gate.md)), which retained the original likely artificial word boundaries and left 62–85 words undecodable; and from the prior **chapter base28→binary PNG** or **whole-stream base28→binary-file header** tests ([report](lp2-base28-chapter-integer-png-transport-gate.md), [report](lp2-continuous-binary-file-header-inverse.md)). The present target representation is the original 29-rune *plaintext* alphabet, not bytes or a file signature.

## Two finite original inverses

1. **Nine authentic visual chapter frames**, with GP29 rune end offsets `[729,1874,3603,5506,6527,7960,9640,12648,12956]`. The first cipher rune is a seed. Every later unequal transition contributes one 0..27 digit, with the observed zero-transition positions retained as a framing mask. Each chapter's complete base28 numeral is represented minimally in GP29.
2. **Fifty-five original physical rune-bearing page frames**, each with its own source-visible first-rune seed and original zero-step mask. This controls a distinct historically plausible clock reset from the red visual chapters.
3. **Eighty-seven maximal nonrepeating frames** separated by the 86 observed adjacent doubles in the concatenated unknown book. Each frame's first cipher rune is its seed. The remaining ranks form one base28 numeral which is converted into GP29. The framing naturally retains all doublet locations.

The implementation keeps the frame's original digit count/seed and its actual observed zero mask as reconstruction side information. This permits exact forward reencryption after decoding the original ciphertext, and makes the numeric conversion a lossless conditional experiment. It does **not** establish that the creator provided such a mask or that it can be inferred from plaintext alone. Each original rune is accounted for; p50 remains the authentic rune-free page.

| Original decoding | GP29 output runes | Output index of coincidence | Observation |
| --- | ---: | ---: | --- |
| 9 visual chapters | **12,731** | **0.0345446718098** | No contiguous native-GP prose |
| 55 physical-page frames | **12,696** | **0.0344721897318** | No contiguous native-GP prose |
| 87 doublet-delimited runs | **12,755** | **0.0344587907087** | No contiguous native-GP prose |
| Original solved p57 GP29 source | **95** | **0.0627099664054** | Real readable-GP positive |

The first 28 translated runes of the chapter-one candidate read `O S H X TH IA U P U M OE C IA TH OE U W EO Y O W G A TH L Y NG C`. The first ten translated runes from the book-first doublet frame read `N C R AE P S W A J L`. These are diagnostic output labels, **not** recovered unknown plaintext. Chapter-local sample IoCs are between about 0.0339 and 0.0352. None of the 55 page-local inverses has a native-GP-like opening; the highest individual page IoC is 0.03881, on the short 73-rune decoded page 55. There is no visible original English reading across the outputs, and their pooled distributions remain near the 1/29 uniform register.

**Actual positive control:** take all 95 original p57 GP runes, interpret them as one source-native base29 integer, convert to base28 digits, then map each 0..27 digit into a nonzero GP29 successor step starting from fixed original-cipher seed 11. The same numeral inverse recovers all **95/95 actual known plaintext runes**, and its cumulative forward encoder reconstructs every generated ciphertext symbol. The program also reconstructs all **12,956/12,956 original unknown ciphertext runes** under all three models when the original source framing mask and seeds are carried.

The single-file implementation is [`sims/lp2_radix28_to_gp29_original_inverse_sft.cjs`](../sims/lp2_radix28_to_gp29_original_inverse_sft.cjs). Run with Node.js 22 from the repository root. It reads only the pinned canonical `lp2-corpus.json`, asserts the exact chapter totals/output IoCs and the native positive, and prints the original per-chapter results.

## Decision

The **direct, no-key** radix-28-numeral→GP29-plaintext interpretation is unsupported under the three declared source-natural framing contracts and cannot itself solve the unknown LP2 text. This excludes only these explicit output and framing rules. A source-selected secret output alphabet, stateful decoder, different radix, independently authenticated escape convention, or genuinely nontextual intermediate remains outside scope. Further base28 repackaging is low value without an authorial selection rule or a matching independent key. Preserve attention for an original-source plaintext-bearing inverse rather than tuning offsets or formats to increase lexical scores.
