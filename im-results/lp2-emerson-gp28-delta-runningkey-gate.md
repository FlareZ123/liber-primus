# Historical Emerson running-key transfers: GP28 nonzero delta and GP29 transparent F

**22 November 2026, Agent11. Evidence type:** bounded, original-input negative after all source-book key offsets and both key directions, plus independent plaintext training controls and an exact positive inverse. No recovered unknown-page plaintext, historical key, or author-selected cipher mechanism.

The independent 26 November extension below uses the exact historical Self-Reliance witness under GP29 transparent-F consumption; it excludes continuous and seven complete chapter-level inverses by exact reachability, with the remaining four source framings nonprose. The subsequent all-55-page exact receiver relaxation is likewise nonprose on every page. Both results are scoped negatives.

## Why these particular source and operation?

In the authentic 2014 Cicada puzzle, solvers used Ralph Waldo Emerson's *Self-Reliance* with paragraph/sentence/word/letter book coordinates. That establishes the author-era availability of Emerson as a textual resource, but supplies **no 2014 instruction** to use Emerson as an LP2 running key. The original LP2 unknown pages have conspicuously few identical adjacent ciphertext runes. A simple reversible model capable of explaining most non-repeats encodes each GP29 ciphertext step as one of the 28 nonzero deltas, with a 28-state running-key shift derived from the source's GP rune indices. Every case where ciphertext repeats its predecessor would have to be an exception or a separate marker, and is omitted from the decoded score rather than silently explained.

For each original rune at position `i > 0` when `C[i] != C[i-1]`, define

`D[i] = ((C[i]-C[i-1]) mod29)-1`, with `D[i]` in 0..27.

Test every direct inverse `P[i]=(D[i] ± K[offset+i]) mod28`, where `K` is the source's continuous GP29 rune sequence reduced mod28. The source may run forward or reversed. All **four direction/sign** families exhaust **all feasible original-source offsets**, without moving ciphertext boundaries or fitting a key to English. The initial ciphertext rune has no predecessor and is excluded; original repeat sites are excluded from the language likelihood, along with their adjacent bigrams. This is a **specific direct nonzero-delta cipher**, not a test of all no-repeat generators, rejection sampling, hidden F clocks, or unrelated book-cipher grammars.

The pinned historical candidate corpus is Emerson's *Essays: First Series* from [pnotisdev/cicada3301 at commit 15200c67](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/ref/emerson_essays1.txt), **439,572 bytes**, SHA-256 `5d9d28c12da8bd9aaf3043e9a2d08fbd46116efd5a3736490a393599aef6d278`, yielding **323,519 GP runes**. The exact source-orthography encoder is first checked against original p57 and recovers **95/95 rune identities**, including K→C in LIKE and V→U in DIVINITY. K/V/Z map to GP C/U/S, Q is represented as CW, and the printed NG rune absorbs ING. A smoothed GP28 native bigram score is trained on independent pinned [Gibran, *The Prophet*](https://github.com/GITenberg/The-Prophet_58585/blob/6ebc10889ae826388c63daaaf2fd2eb1d9f64e58/58585-0.txt) (62,720 GP runes); comparisons additionally use 96 or 103 genuine, independent solved LP1 windows from the project's `lp1-plaintext-reference.txt`. Full source IDs and download digests are printed by the reproducible SFT.

## Original-input result

The current [standalone CommonJS SFT](../sims/lp2_emerson_delta_gp28_runningkey_sft.cjs) passed Windows Node22 via [read-only workflow run 44983833699](https://github.com/FlareZ123/liber-primus/actions/runs/44983833699). **Critic control-scoring correction, 22 November:** the original `nativeScores` removed F=GP0 before taking fixed-length windows, then scored artificial cross-F bigrams. That disagreed with `languageModel`, which resets the previous rune at F. The revised SFT retains the original GP rune window length and resets at F for both Gibran and solved-LP1 controls. An independent exact-source JavaScript recalculation reproduced all four previously published minima before the change and produced the four corrected minima shown below. The original unknown-page score and key-offset sweep are unchanged. The current cited CI run follows the scoring correction. Its output is authoritative for the values below. A separate genuine Gibran-language plant, enciphered under a hidden Emerson book offset and nonzero-delta rule, is recovered **261 of 261** symbols exactly. Original ciphertext is tested on opening p0, 262 runes, and terminal p55, 76 runes.

| Receiver and case | Highest likelihood per usable bigram (less negative is better) |
| --- | ---: |
| p0 original, **best of every offset, both signs and book directions** | **−4.18551690** |
| p0 authentic GP-language independent Gibran windows, minimum | **−2.80686249** |
| p0 independently solved Cicada LP1 windows, minimum | **−2.73192922** |
| p55 original, **best of every offset, both signs and book directions** | **−3.72800235** |
| p55 authentic GP-language independent Gibran windows, minimum | **−3.06094958** |
| p55 independently solved Cicada LP1 windows, minimum | **−3.13420265** |
| Known-key native Gibran plant | **−2.78330231** |

The p0 best is reversed-key plus-sign offset17019; p55 best reversed-key minus-sign offset118346. These differing offsets are freely fitted, and both remain worse than every independently solved LP1 sample at comparable length. Original repeat events: p0 two and p55 one. They do not explain this much lower likelihood.

## Decision

**Retire this precise direct GP28-delta + Emerson continuous-running-key inverse** on the two inspected original unsolved pages. It supplies neither authentic plaintext nor a source-selected operation, even after the complete key-offset search. We need a genuinely new original or historical clue before changing the book, derivation, F-skip, word resets, delta alphabet, or adding an arbitrary post-processing step. The authentic 2014 book-code use of Emerson does not imply a continuous running key. This negative is limited to this explicitly frozen family and its specified native-language model; it is not a universal statement about LP2's encryption.

## Actual 2014 Self-Reliance witness with authentic transparent-F consumption (Agent17, 26 November 2026)

The prior GP28 delta receiver used the full modern *Essays: First Series* corpus and a nonzero-delta alphabet. This is a distinct, bounded source-directed route: the exact preserved **2014 book-code witness of Self-Reliance itself**, read in printed order and converted to GP29 indices, drives the authentic LP2 plaintext-F consuming convention. Historical book-code use and known LP2 cipher precedent motivate the test; neither authenticates the combination. No extra collision suppression, transposition, arbitrary secret alphabet, clock repair, wrapping, or reverse text was selected.

### Executable inverse

Pinned witness `resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt` (Git blob `12a6bc018047a1276e77f2b7f633d5905732fff9`, 55,376 characters, 10,170 ASCII words) gives **41,181 GP29 runes** using uppercase word-local longest-token matching, QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA. The canonical LP2 corpus blob is `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; native control register is `1b064ef6d85819b7d96adaff31a82d1ec551598f`.

For initial key offset a and sign s∈{+1,−1}, an ordinary step at rune i has key index j=a+i−h (h prior literal-F holds); P=C−sK[j] mod29 must be nonzero, then consume that key symbol. At C=0, independently permit the literal F transition P=0 with h→h+1 and no key consumption. Nonzero C cannot be a hold. The finite key does not wrap. Enumerate every a=0…41,181, including the exhausted endpoint, for each sign. Reachability propagates the exact set of possible h; merged states have identical future feasibility. It does not use English scoring, word boundaries, or an assumed plaintext. A separate max-score DP over (h,last plaintext symbol) gives the exact best GP29 bigram path for each complete legal candidate, with forward reencryption checked. The bigram register is the first five native solved sections, .5 unigram smoothing and 10-count bigram backoff; the remaining four sections supply independent plants.

### Complete original reachability

| Original interval | Runes | Longest legal prefix, + / − | Complete offsets, + / − |
|---|---:|---:|---:|
| p0–55 continuous | 12,956 | 880 / 829 | 0 / 0 |
| p0–2 | 729 | 729 / 729 | 7 / 2 |
| p3–7 | 1,145 | 599 / 513 | 0 / 0 |
| p8–14 | 1,729 | 534 / 593 | 0 / 0 |
| p15–22 | 1,903 | 780 / 570 | 0 / 0 |
| p23–26 | 1,021 | 653 / 699 | 0 / 0 |
| p27–32 | 1,433 | 701 / 711 | 0 / 0 |
| p33–39 | 1,680 | 603 / 598 | 0 / 0 |
| p40–53 | 3,008 | 691 / 633 | 0 / 0 |
| p54–55 | 308 | 308 / 308 | 25 / 10 |
| p0 black→p2 (red13 excluded) | 716 | 716 / 716 | 6 / 3 |
| p54 black→p55 (red9 excluded) | 299 | 299 / 299 | 31 / 17 |

The entire unknown tape is algebraically impossible under this specific source/key clock regardless of start and sign. Independent chapter starts do not rescue seven of nine complete chapters. The opening and terminal framing alternatives are not independent samples; they test whether removing the genuine red rubrics alters feasibility. All surviving offsets are decoded, with no tuning of key symbols. Exact best full-interval scores (an optimistic oracle over all legal offsets and hold paths): p0–2 −4.760467; black opening −4.779363; p54–55 −4.471664; black terminal −4.480578 nats/rune. None is readable. The best original offsets are respectively 4337, 4349, 34899, 34908, all plus-sign encoders. Full best decoded tapes and all complete offsets are in the raw output.

### Authentic and hidden controls

The actual solved p56 prime-minus-one plaintext-F sender exactly reproduces **85/85** original runes using the same hold convention; its key is the prime stream, not Emerson. The key-selection control uses the other four solved sections concatenated (588 GP runes) as target-excluded native prose, three hidden independent key offsets and both signs. Rank all feasible offsets/signs using only the first 320 ciphertext runes, freeze the selected offset/sign, then run the full DP; the final path may revisit earlier F decisions with that frozen key. This calibrates offset recovery and held-out rune recovery, not blind online hold-state prediction.

| Hidden offset / sign | True rank | Training candidates | Whole correct /588 | Held-out correct /268 |
|---|---:|---:|---:|---:|
| 133 / + | 1 | 209 | 586 | 268 |
| 3301 / − | 1 | 24,884 | 588 | 268 |
| 761 / + | 1 | 15 | 588 | 268 |

All plants use the same donor and are not independent text samples. Known donor full score is −2.626198; held-out score −2.602975. Thus the exact receiver strongly distinguishes these native plants from the original surviving alignments, without claiming statistical impossibility of every possible register.

**Decision:** retire direct forward Self-Reliance GP29 running keys under literal-F transparency with continuous, independent chapter or isolated physical-page starts in this pinned normalization. This is a source-selected alternative to the prior full-Emerson GP28 delta experiment, not a duplicate of it. No unknown plaintext or authentic key; no evidence that the historical book-code witness is an LP2 key. Alternate text editions, word clocks, reversals, other transliteration, and other key derivations remain untested and need independent source support before further search.

Reproduction: [CommonJS SFT](../sims/lp2_2014_selfreliance_fhold_runningkey_sft.cjs) and [complete raw output](lp2-2014-selfreliance-fhold-runningkey-output.json). The exact experiment function was executed on the pinned inputs using connected V8; the standalone Node filesystem wrapper was not separately run. The first raw checkpoint truncated plant survivor lists before checking membership, making three control flags falsely negative; the current script and output replace that intermediate with full membership and exact hidden-key ranking. No CI workflow added.

### Isolated physical-page recovery (same frozen key family)

The chapter exclusions alone leave the possibility of a different source offset at every physical page. To seek an actual deciphered page rather than merely reject a global clock, independently allow every finite offset and both signs on **all 55 rune-bearing unsolved physical pages**, including the short p49, p51 and p55 fragments; p50 is numeric-only. This is a deliberately permissive relaxation, not evidence for page resets. The same exact reachability filter and language model are retained. A score-only two-state DP (previous symbol ordinary or literal F, plus cumulative hold count) gives the maximum over all histories; each top-three candidate is checked against the original backtracking Viterbi and exactly re-encrypted. No new key alphabet, extra offsets, source editions or fit parameters.

All **4,530,020** page-offset-sign tests yield 157,362 complete legal alignments. No page is a native-prose candidate: the exact best score on every page is below **every** equal-length sliding window in the 588-rune target-excluded native donor, including the smallest 66-rune page (descriptive matched controls; overlapping windows and the same donor are not independent samples).

| Closest original page candidates by native margin | Runes | Complete alignments | Best original | Minimum native window | Gap (nats/rune) |
|---|---:|---:|---:|---:|---:|
| p49 | 66 | 21,831 | −3.847359 | −2.981273 | 0.866086 |
| p55 | 76 | 27,573 | −3.915143 | −2.952025 | 0.963119 |
| p51 | 92 | 14,420 | −4.035884 | −2.892333 | 1.143551 |
| p22 | 131 | 5,576 | −4.028662 | −2.859059 | 1.169604 |
| p32 | 121 | 10,972 | −4.278305 | −2.832619 | 1.445686 |

All 55 page maxima are nonprose; no credible partial or complete unknown-page recovery. The page-level relaxation does not rescue this particular historically motivated GP29 key family. Do not expand to arbitrary intra-page resynchronization, new key transforms or new carrier editions without independent source clues. This is a native-register likelihood decision for isolated pages, distinct from the algebraic impossibility of the seven full chapter intervals.

Page-mode reproducer: the same [SFT](../sims/lp2_2014_selfreliance_fhold_runningkey_sft.cjs) accepts `--pages 0 55` or the three executed ranges 0–15, 16–39 and 40–55. Raw optimum tapes and legal counts: [p0–15](lp2-2014-selfreliance-fhold-pages-00-15.json), [p16–39](lp2-2014-selfreliance-fhold-pages-16-39.json), [p40–55](lp2-2014-selfreliance-fhold-pages-40-55.json). [Length-matched native comparison](lp2-2014-selfreliance-fhold-page-native-comparison.json). Connected V8 actually executed the page search and native comparison; final standalone wrapper with combined per-page comparison was not independently run in Node.
