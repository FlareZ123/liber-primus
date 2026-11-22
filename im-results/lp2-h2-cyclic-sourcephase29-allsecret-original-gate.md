# First 29 prime origins and one-exception native-GP exclusion for cyclic H2

**17 November 2026, Agent15. Classification:** exact, source-original necessary-condition exclusions for 29 key origins, including an allowed exceptional singleton and a key-independent plaintext-frequency bound. **No unknown LP2 plaintext, original key, author-selected cipher, or final destination was recovered.** [Standalone Windows Node22 SFT](../sims/lp2_h2_primephase29_ftransparent_original_sft.cjs) · [passing original-corpus Windows run 44140671825](https://github.com/FlareZ123/liber-primus/actions/runs/44140671825).

## Concrete question and prior boundary

The solved original physical p56 uses consecutive-prime totients modulo29 with a literal plaintext-F bypass. The unknown original LP2 ciphertext has very few adjacent repeated GP29 runes, suggesting a *possible*, historically unselected rejection/feedback construction. The earlier [Agent43 source-only cyclic-H2/F test](lp2-h2-cyclic-allsecret-ftransparent-black-original-gate.md) proved that **the prime-2 starting point** fails the original black p15–p22 span under a completely secret fixed 29-way alphabet, even allowing all lawful hidden collision retries and all legitimate literal-F bypasses.

This extension asks whether moving the **start of the known prime sequence through any of its first 29 ordinals** rescues that model. The interval is fixed by the 29-symbol GP alphabet, encompassing the small historical numerical phase candidates 5, 6 and 15, without claiming that any historical instruction chooses prime *ordinal* as an index. The 2013 signed small DH example contains values 5, 6 and 15 but does **not** explicitly transfer any of them to LP2 as a start index. A start beyond the first 29 primes or a different cipher family is outside this bounded decision. The independent p28 result below guards against assuming that this constraint automatically rejects all source spans.

## Complete unknown-secret model

An arbitrary but **fixed** unknown 29-symbol bijection `τ` is shared by the tested interval. Initialize a prime key pointer at ordinal `j∈{0,...,28}`, with ordinary prime number `prime[j]` and row value `K[j]=(prime[j]−1) mod29`.

For any plaintext rune `P`:
- If `P=F`, emit `C=F` without consuming a prime, precisely the type of bypass independently established on solved p56.
- Otherwise propose `C=(τ(P)+K[j]) mod29`, consuming that key row if emitted.
- A proposal equal to the **previous accepted ciphertext glyph** may be discarded by consuming its prime and retrying the *same* plaintext rune. Other proposals must be emitted. A discard is optional; no assumed rejection probability is needed for the inverse.

All initial `τ`, all legal silent collision-rejection histories and all possible literal plaintext-F event placements are left free. There are **no fitted key letters, no statistical dictionary score and no candidate plaintext output**. Every original printed one-rune word is assumed to be one English GP29 rune `A`, `I`, or `O` with preserved printed word boundary. That necessary orthographic condition means its hidden unshifted labels `τ(A/I/O)` can take **at most three distinct values** across the entire interval.

The dynamic program stores each reachable pair `(M,d)`: `M` is the mask of these at most three labels and `d` is the current key-pointer drift relative to the visible rune count and declared start. For every original non-singleton printed `F` it admits both encrypted and transparent branches. For each encrypted glyph it grants 0, 1 or 2 invisible collision retries, requiring every rejected proposal to equal the actual predecessor. The first **16,000 authentic prime-totient residues** have no three consecutive identical values, which makes this rejection bound **exhaustive** under this additive row rule, including the 29 start choices. It even admits some possibilities that would violate a true globally fixed `τ(F)`, making the contradiction conservative.

Original input is exactly [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) cross-checked rune-for-rune with the original punctuation and carried-word transcription [`lp2-transcription.txt`](../resources/liber-primus/lp2-transcription.txt). The program asserts **12,956 unknown-page runes, 2,896 complete printed words, 83 one-rune words**, the p15 original **9+11 red-rune headings**, and the black-source span boundaries.

## Exact original-cipher results

| Original black or independent source span | Source-global rune range | Starts surviving /29 | Earliest contradiction or surviving origins |
| --- | --- | ---: | --- |
| p15 after 20 red heading runes through p22 | **[3623,5506)**, 1,883 runes | **0** | Start ordinals 0–15 fail at original rune **4176**; 16–21 at **4217**; 22–28 at **4233** |
| Entire black p16–p22, independent new clock | **[3762,5506)**, 1,744 runes | **0** | Contradictions by original rune **4358** for all 29 |
| Black p17–p21, independently restarted clock | **[4029,5375)**, 1,346 runes | **9** | The nine start ordinals **6–14** survive this *necessary* gate; 0–5 and 15–28 fail |
| Physical p28 alone, fresh clock | **[6761,7030)**, 269 runes | **29** | All first-29 prime origins survive this *necessary* gate, not necessarily any actual plaintext |

The **phase-zero** p15 contradiction at global rune **4176** reproduces Agent43's preexisting result verbatim. The remaining **28 initial prime origins** are the new finite coverage. Starting afresh on the black p16 page is independently excluded even though the previous p15 red heading is excluded in both tests. The p17 and p28 observations are intentionally retained as counterexamples to a blanket claim that an arbitrary short black span necessarily fails this family.

The correct source-only conclusion is: **no single fixed secret `τ` and no legal F/collision hidden path can map the complete original black p15–p22 or black p16–p22 word-boundary pattern into ordinary GP29 English when the successive-prime-totient clock starts at any ordinal 0–28.** This conclusion uses **only the one-rune-word alphabet** and is independent of every remaining unknown plaintext rune.

## Stronger original-input gate: allow one arbitrary one-rune word and bound EVERY secret plaintext symbol

**17 November, same Agent15 invocation.** The [separate all-secret original-source SFT](../sims/lp2_h2_oneexception_unigram_capacity_original_sft.cjs) successfully ran its full Windows Node22 test, including a blinded synthetic English positive, in [run 44144589741](https://github.com/FlareZ123/liber-primus/actions/runs/44144589741). This is a stronger independent extension of the 29-start test above; it changes the finite family's interpretation but **still recovers zero original unknown-page plaintext**.

### One source-singleton exception granted *anywhere*, all 29 clock starts

A skeptic can reasonably question the strict A/I/O assumption: one printed one-rune word may be a symbol, initial, untranslated token or deliberate exception. Grant such an exception **without preselecting its site**, preserving all other original singleton words as at most three unknown labels under one arbitrary, fixed secret `τ`. In the exhaustive state machine, the exception may have *any* underlying secret label and consumes its key in the ordinary encrypted branch; no plaintext letters, literal strings or hidden skip positions are guessed. The state records the mask of up to three ordinary singleton labels, the number of exceptions used (0 or 1) and every legal hidden prime-pointer drift.

The exact unchanged source results are:

| Model / span | Surviving start prime ordinals out of 29 | Exact remaining freedom |
| --- | ---: | --- |
| Black original p15–p22, 18 singleton sites, **one optional free exception at any site** | **1/29** | Only ordinal **28** survives; phases 0–5 fail by global rune **4794** and phases 6–27 by **5336** |
| Same span, start ordinal 28, try every one of the **18 original exception sites** | **1/18** | Only global rune **4217** can be exceptional |
| Same surviving source span and exceptional site | **15 complete prime-pointer states** | All survivors have exactly the same three ordinary secret base labels **{2,15,18}** |

The unique exceptional source rune is physical p17, original ciphertext transliteration **T** (GP index16). The three source-forced *ordinary singleton labels* {2,15,18} are **unshifted secret-substitution values**, respectively coincident with GP transliterations TH/S/E in the conventional index order; **they are not decoded plaintext**. Exact forward/backward reachability under every remaining legal hidden key clock forces the one exceptional unshifted label to **20**, with all 17 other singleton labels uniquely determined. The full original coordinate-to-hidden-label array is printed in the SFT output. No arbitrary phase, plaintext string or hidden `τ` was fitted to obtain these forced labels.

**Stronger exact ordinary-orthography corollary, independent of E rates:** Across the seventeen nonexceptional printed one-rune words, the exact viable-label multiplicities are **{2:4, 15:5, 18:8}**. Hence **three distinct plaintext letters** must occur as standalone words among those seventeen under any fixed bijective `τ`. If ordinary English one-letter words are restricted to **A** and **I**, *all* 29 possible prime starts are mathematically impossible **even with one freely exceptional word**, without any Shannon score, lexical dictionary or native-literature frequency assumption. Even granting standalone **O**, its forced multiplicity is at least **four** of these seventeen, whichever bijection assigns the three ordinary labels. This is a source-only structural burden, separate from the exact E-frequency ceiling below.

### All-alphabet upper bound rules out ordinary reference GP29 English

With these now source-implied constraints fixed, the program computes a stronger, **key- and secret-alphabet-independent exact ceiling**. For **each possible underlying symbol** `b∈{0,…,28}`, a separate dynamic program retains at every source rune the maximum count of accepted encrypted base values equal to `b` for each reachable key-pointer drift. It includes all ciphertext-F transparent branches and all legal optional rejected-prime histories. The end-state maximum is an **upper bound**, since this relaxation does not even enforce the globally fixed bijection on nonsingleton positions.

Across **all 1,883 original black source runes**:

- The largest possible count of **any** fixed nontransparent plaintext symbol under every compatible unknown `τ` and key path is exactly **113/1,883 = 6.00%**. The cap reaches 113 for unshifted base label12; the cap for label18 is 105; all other 27 base labels are at most 112.
- Independent GP29 conversion of the full original-source-sized **Shakespeare** control contains **217,106 runes**. Among **every one** of its **215,224 contiguous 1,883-rune windows**, even the least-E window contains **147** GP-index18 E runes.
- Independent GP29 conversion of the **Gibran** control contains **62,492 runes**. Among **every one** of its **60,610 contiguous 1,883-rune windows**, even the least-E window contains **185** E runes.
- **Authentic-author prose check:** the 95 source-clear GP29 runes of solved p57 *PARABLE* contain **15 E** runes (**15/95 = 15.79%**), more than twice this proposed model's 6.00% symbol ceiling. This original-Cicada sample is shorter than 1,883, so it serves as a register indication, not as an independently length-matched 1,883-rune control.
- Therefore no actual ciphertext inverse in this exact 29-origin, fixed-cyclic-`τ`, transparent-F, ≤1-singleton-exception family can produce *any* of those original-size native GP29 reference passages, regardless of the unknown key label assigned to plaintext **E**. This is stronger than rejecting a fitted decoder output based on a visually nonlinguistic prefix.
- A frozen independent plant of **1,883 genuine Shakespeare GP29 runes**, with source-shaped 18 singleton sites, one special singleton, an independently shuffled unknown 29-symbol bijection, optional real collision skips and literal-F bypass, retains its **true hidden key-pointer and alphabet history at every rune**. Its plaintext-E count exceeds 113; the same all-secret count dynamic program correctly permits at least that many copies of its hidden E label. The original failure is therefore an original-cipher constraint rather than an inherent impossibility of the proposed encoder.

The language conclusion is **reference-register conditional**: an adversarially written English passage with unusually few E runes, an alternate orthography, a binary intermediate, altered source word boundaries or a language in which a fourth singleton category is normal is not eliminated. The original source never authenticates a cyclic hidden substitution, this H2 retry rule, or one-exception cipher mode. A completely unrelated nonadditive transducer is unaffected.

**Causal research decision:** Even a single arbitrary one-rune-word rescue does not make the first 29 prime starts into a plausible direct-GP-English decoder for the original black p15–p22 passage. Stop investing in more nearby phase choices or a single custom exception as a mechanism rescue. A truly independent creator-specified secret-state architecture or original plaintext witness is necessary before further variants are useful. [Exact original source, 18-site scan, 29-phase scan, 29-letter capacity, exhaustive native-window controls and positive](../sims/lp2_h2_oneexception_unigram_capacity_original_sft.cjs).

## Positive controls and scope of the decision

The exact Windows CI SFT also generates five independent source-shape native-GP29 positive ciphertexts under freshly shuffled secret `τ` permutations, starts at phases **0, 5, 6, 15 and 28**, authentic literal plaintext-F bypass, and seeded optional q=0.81 collision rejection. Its planted cleartext uses real p57 GP runes and original p28 one-rune positions fixed to A/I/O/A; the inverse receives none of the planted `τ`, plaintext, bypasses, rejected-key rows, or pointer history. **All five tests retain the actual hidden three-label mask and exact prime-pointer drift at every rune**, showing that the phase extension has not pruned valid model-generated paths. The original phase-zero contradiction, p17 surviving starts, and all 29 p28 survivals are likewise asserted exactly.

**Decision:** The natural prime2 clock and every one of its first 28 shifted origins fail the broad unknown-secret *cyclic Latin* H2 model on either complete tested black p15–p22 source span. Further searching nearby prime origins without a genuinely authored reset/phase rule adds little causal value. The result does **not** eliminate independent 29×29 secret row permutations, non-cyclic tables, unknown chapter/page rekeys, different first-prime indices, extra hidden cipher states or non-English/unpreserved source word boundaries. It does not justify promoting a speculative alternate decoder or claiming a partial decryption.
