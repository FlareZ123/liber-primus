# Nine-chapter H2: source-word-role blind tableau/clock recovery and original terminal gate

**17 November 2026, Agent 48. Classification: new computational recovery on original-shaped planted ciphers; bounded original-cipher negative.** No unknown LP2 plaintext, historical secret key, or Cicada destination has been recovered.

## A human-visible route and its strongest rival

The original visual chapter boundaries divide the 56 unknown physical pages into nine contiguous segments: p0–2, p3–7, p8–14, p15–22, p23–27, p28–31, p32–39, p40–53, p54–55. Their exact GP29 rune lengths are **[729, 1145, 1729, 1903, 1255, 1078, 1801, 3008, 308]**, totaling **12,956** runes; physical p50 is the runeless numeric table. The continuous original text has **2,896 printed rune words**, including **83 singleton runes** and **32 cross-page carries**. The chapter marks supply a plausible human clue to reset a cryptographic clock. The rival explanation is that the book uses some other cipher and the chapter layout is only manuscript structure.

The **conditional model** is a shared, unknown **29×29 row-permutation tableau** across all nine chapters. It selects successive-prime-totient GP29 key rows starting from prime2 afresh in each chapter. When a proposed ciphertext rune would repeat the previous emitted rune, the source-shaped H2 generator rejects that row with probability q=0.81 and consumes additional key rows until an emission is accepted. The true secret table, the per-rune hidden skips and the original plaintext remain hidden from the decoder. The solved p56 prime/totient operation motivates exploring a prime row clock. **No creator-authored evidence selects this random shared table, q=0.81, or the precise chapter reset rule.**

### New blind inversion mechanism

The original printed word cuts, visible even without decryption, assign one of **four lexical roles** to every rune: singleton, first, last, or interior. GP29 distributions for these roles are learned only from the independent Shakespeare 300k-letter control. A 0.5 pseudocount keeps all 29 output probabilities positive. The unknown row-permutation mapping is first estimated from secret-row ciphertext frequency ranks, then the four role-specific emissions are used to recover unknown skip paths. This adds actual source-observable constraints to the older row-unigram-only bootstrap.

A standard Viterbi decoder with the physical H2 skip penalty can permanently favor zero skips before a secret row has enough observations. The blind decoder now **anneals the log skip penalty**: multiplier 0.35 for chapter prefixes up to 40 runes, 0.55 up to 300, 0.8 up to 900, and 1 afterward. The conservative source-rate bound on possible hidden drift is **d ≤ min(180, ceil(0.06i+8))**. After staged learning, the existing Shakespeare GP29 bigram/Hungarian algorithm fits the tableau. Two frozen test-time inverses are compared, including the prior 8-nat soft skipped-row-consistency penalty. The exact planted secret, true key history and plaintext do not enter training, model selection, or original decoding.

## Eight original-shaped planted controls

For each deterministic seed, the experiment builds a fresh native-GP Gibran 12,956-rune English manuscript using **exactly the original 2,896 GP-rune word lengths**, including all singleton sites, physical chapter lengths and four original apostrophe-word coordinates. Every word is sampled from independent Gibran native-GP words of the corresponding GP length. Its hidden 29×29 secret tableau and H2 skips are independently generated, then all planted truth is withheld from the learner.

**All 308 ciphertext runes on terminal physical pp54–55 are excluded from tableau and key-clock fitting.** The terminal source word-role positions remain visible, so using those positions at test time is legitimate under the preserved-word-shape premise. Only the other **12,648** synthetic ciphertext runes are used for fitting.

| Frozen seed | Recovered heldout GP plaintext / 308 | Correct hidden heldout clock / 308 | Contradicted skip transitions |
| --- | ---: | ---: | ---: |
| Trial0, 855747533 | 287 | 303 | 1 |
| Trial1, 1869651756 | 298 | 306 | 0 |
| Trial2, 2883555979 | 298 | 308 | 0 |
| Trial3, 3897460202 | 293 | 303 | 0 |
| Trial4, 616397129 | 303 | 308 | 2 |
| Trial5, 1630301352 | 302 | 308 | 0 |
| Trial6, 2644205575 | 303 | 308 | 0 |
| Trial7, 3658109798 | 299 | 307 | 0 |

**Recovery: 297.875/308 = 96.7127% mean heldout plaintext; 99.4724% exact heldout clock rows; 686.625/841 (81.6439%) exact secret-table cells on average.** All eight independent-word-length planted manuscripts recovered 287–303 of the fully excluded 308 terminal symbols. Only three total rejected-row contradictions occur across the eight, with six plants free of contradictions. The planted heldout GP-English bigram score averages **−2.673301 nats/rune**, range **−2.725 to −2.609**. Exact generation truth gives a full H2 forward control for every trial. Because some recovered symbols and model collision checks remain wrong, this is a strong blind partial recovery, not a complete deterministic ciphertext inverse.

The earlier nine-chapter unigram bootstrap solved only the first seed robustly and lost key synchronization on other seeds. Source-visible lexical roles rescued trial1; tempered early Viterbi priors rescued trial3. These two seeds are development cases, and six other source-shaped seeds provide stronger untouched synthetic calibration. There is no authentic unknown-page plaintext in these controls.

## Necessary model-identifiability correction: H2's 29! row-label gauge

A full unknown 29×29 H2 permutation tableau has an exact **29! row-label symmetry**: for any permutation σ of the 29 source-clock row labels, define an equally secret tableau T'[σ(r),p]=T[r,p] and clock row R'(k)=σ(R(k)). Every ciphertext symbol and every **collision-rejected intermediate row** is exactly the same under T,R and T',R', given the same source plaintext and coin decisions. This is an exact algebraic key-equivalence, independent of the ciphertext's language or the amount of data.

A concrete frozen source-native wrong-row-label control illustrates this limitation. On the seed0 planted original-shaped cipher, the receiver was supplied the **wrong** fixed permutation σ(r)=(7r+11) mod29 **after generation**, with no access to the correct labels. It still recovered **288/308** withheld plaintext and **303/308** true skip counts, despite only **48/841** raw label-to-label table-cell matches against the *unpermuted* generator table. This does not refute clock recovery: σ is an unobservable relabeling because the hidden table compensates. A key-family negative control must change the **sequence of actual row equivalences**, rather than merely apply one fixed permutation of the row names.

Similarly, when the four synthetic apostrophe-word replacements were disabled while preserving **all original word lengths**, the same seed0 blind recovery remained at **287/308** withheld plaintext and **303/308** key rows, essentially identical to the correct-word-shape source plant. This receiver is driven primarily by the source-visible lexical roles and global native GP distribution; **it has not demonstrated independent cryptanalytic leverage from the four actual LP2 apostrophe cribs**. These two one-seed ablations were executed in-memory against the pinned SFT loaded from GitHub, with no refitting on original ciphertext. They are diagnostic scope qualifications, not separate original-cipher discoveries.

## Frozen original-source terminal test

The same source-authored chapter grouping, printed lexical roles, Shakespeare reference, annealed path estimator, H2 model and inferred 841-entry inverse tableau were applied to the **unchanged canonical original 12,956-rune LP2 source**. Again, original pp54–55 (308 runes) contributed **zero ciphertext symbols to fitting**. The independent original test is:

| Measurement | Exact source result |
| --- | ---: |
| Training unknown source runes p0–53 | 12,648 |
| Heldout original terminal runes p54–55 | 308 |
| Fitted-training GP bigram log-score / rune | **−3.522360** |
| Original raw terminal GP bigram log-score / rune | **−4.424373** |
| Original soft-decoded terminal GP bigram log-score / rune | **−4.097512** |
| Inferred terminal H2 row skips | **11** |
| Rejected-row constraints violated | **7 of 11** |

The terminal begins **OEIPUNPAEOLTHMARAOTHNGRXBPYXWLOTHLM...** after decoding, remains nonlinguistic throughout, and has a heldout English-language score about **1.42 nats/rune worse** than the calibrated positive controls. Each of the eight source training chapters separately scores approximately **−3.56 to −3.49** after fitting and is likewise nonlinguistic; no hidden original chapter visibly resolves as native GP English. This frozen receiver fails both unseen prose and forward skipped-row consistency on the actual manuscript.

**Decision:** Retire the **specific original nine-chapter, same-random-secret-table, q=0.81 H2 English-word-role program** as a decoder of LP2 pp54–55. This is an empirical, source-calibrated inverse failure, not an all-keys impossibility theorem. Further tuning this architecture against the nonprose original would overfit. A first-party tableau/clock selector or source-authenticated alternative output register is needed before reusing the now-powerful blind estimator. Do not promote plausible synthetic output to genuine unknown-page decryption.

## Reproducible assets and prior research

- Deterministic self-contained runner: [nine-chapter H2 joint-blind source SFT](../sims/lp2_h2_nine_chapter_joint_blind_original_sft.cjs). Node.js 22, CommonJS, no network, read-only.
- Original GP29 input: [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [rune/word transcript](../resources/liber-primus/lp2-transcription.txt).
- Existing shared fitting algorithm: [GP29 Hungarian permutation tableau decoder](../sims/gp29_bigram_tableau_decoder.cjs).
- [Manual Windows Node22 Actions workflow, completed SUCCESS 44052350345](https://github.com/FlareZ123/liber-primus/actions/runs/44052350345).
- Earlier evidence: [physical page-reset blind H2](lp2-h2-page-reset-blind-joint-original-p41-gate.md), [original random-table flatness negative](lp2-h2-random-table-marginal-flatness-gate.md), and [blind apostrophe/oracle key-path study](lp2-h2-apostrophe-crib-oracle-identifiability.md). These different assumptions are not independent evidence that any H2 model is the historical cipher.

**Original puzzle status remains unchanged:** all 56 unknown LP2 physical pages p0–55 remain undeciphered.
