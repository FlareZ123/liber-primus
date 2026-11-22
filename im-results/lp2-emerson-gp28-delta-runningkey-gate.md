# Historical Emerson running key under a native GP28 nonzero-delta cipher

**22 November 2026, Agent11. Evidence type:** bounded, original-input negative after all source-book key offsets and both key directions, plus independent plaintext training controls and an exact positive inverse. No recovered unknown-page plaintext, historical key, or author-selected cipher mechanism.

## Why these particular source and operation?

In the authentic 2014 Cicada puzzle, solvers used Ralph Waldo Emerson's *Self-Reliance* with paragraph/sentence/word/letter book coordinates. That establishes the author-era availability of Emerson as a textual resource, but supplies **no 2014 instruction** to use Emerson as an LP2 running key. The original LP2 unknown pages have conspicuously few identical adjacent ciphertext runes. A simple reversible model capable of explaining most non-repeats encodes each GP29 ciphertext step as one of the 28 nonzero deltas, with a 28-state running-key shift derived from the source's GP rune indices. Every case where ciphertext repeats its predecessor would have to be an exception or a separate marker, and is omitted from the decoded score rather than silently explained.

For each original rune at position `i > 0` when `C[i] != C[i-1]`, define

`D[i] = ((C[i]-C[i-1]) mod29)-1`, with `D[i]` in 0..27.

Test every direct inverse `P[i]=(D[i] ± K[offset+i]) mod28`, where `K` is the source's continuous GP29 rune sequence reduced mod28. The source may run forward or reversed. All **four direction/sign** families exhaust **all feasible original-source offsets**, without moving ciphertext boundaries or fitting a key to English. The initial ciphertext rune has no predecessor and is excluded; original repeat sites are excluded from the language likelihood, along with their adjacent bigrams. This is a **specific direct nonzero-delta cipher**, not a test of all no-repeat generators, rejection sampling, hidden F clocks, or unrelated book-cipher grammars.

The pinned historical candidate corpus is Emerson's *Essays: First Series* from [pnotisdev/cicada3301 at commit 15200c67](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/ref/emerson_essays1.txt), **439,572 bytes**, SHA-256 `5d9d28c12da8bd9aaf3043e9a2d08fbd46116efd5a3736490a393599aef6d278`, yielding **317,247 GP runes**. A smoothed GP28 native bigram score is trained on independent pinned [Gibran, *The Prophet*](https://github.com/GITenberg/The-Prophet_58585/blob/6ebc10889ae826388c63daaaf2fd2eb1d9f64e58/58585-0.txt) (61,449 GP runes); comparisons additionally use 95 or 101 genuine, independent solved LP1 windows from the project's `lp1-plaintext-reference.txt`. Full source IDs and download digests are printed by the reproducible SFT.

## Original-input result

The original [standalone CommonJS SFT](../sims/lp2_emerson_delta_gp28_runningkey_sft.cjs) passed Windows Node22 via [read-only workflow run 44982598386](https://github.com/FlareZ123/liber-primus/actions/runs/44982598386). **Critic control-scoring correction, 22 November:** the original `nativeScores` removed F=GP0 before taking fixed-length windows, then scored artificial cross-F bigrams. That disagreed with `languageModel`, which resets the previous rune at F. The revised SFT retains the original GP rune window length and resets at F for both Gibran and solved-LP1 controls. An independent exact-source JavaScript recalculation reproduced all four previously published minima before the change and produced the four corrected minima shown below. The original unknown-page score and key-offset sweep are unchanged. The cited historical CI run predates this correction. A separate genuine Gibran-language plant, enciphered under a hidden Emerson book offset and nonzero-delta rule, is recovered **261 of 261** symbols exactly. Original ciphertext is tested on opening p0, 262 runes, and terminal p55, 76 runes.

| Receiver and case | Highest likelihood per usable bigram (less negative is better) |
| --- | ---: |
| p0 original, **best of every offset, both signs and book directions** | **−4.20573284** |
| p0 authentic GP-language independent Gibran windows, minimum | **−2.77482878** |
| p0 independently solved Cicada LP1 windows, minimum | **−2.73411025** |
| p55 original, **best of every offset, both signs and book directions** | **−3.67105443** |
| p55 authentic GP-language independent Gibran windows, minimum | **−2.99076890** |
| p55 independently solved Cicada LP1 windows, minimum | **−3.16585544** |
| Known-key native Gibran plant | **−2.76167163** |

The p0 best is reversed-key plus-sign offset206328; p55 best forward-key minus-sign offset152625. These differing offsets are freely fitted, and both remain worse than every independently solved LP1 sample at comparable length. Original repeat events: p0 two and p55 one. They do not explain this much lower likelihood.

## Decision

**Retire this precise direct GP28-delta + Emerson continuous-running-key inverse** on the two inspected original unsolved pages. It supplies neither authentic plaintext nor a source-selected operation, even after the complete key-offset search. We need a genuinely new original or historical clue before changing the book, derivation, F-skip, word resets, delta alphabet, or adding an arbitrary post-processing step. The authentic 2014 book-code use of Emerson does not imply a continuous running key. This negative is limited to this explicitly frozen family and its specified native-language model; it is not a universal statement about LP2's encryption.
