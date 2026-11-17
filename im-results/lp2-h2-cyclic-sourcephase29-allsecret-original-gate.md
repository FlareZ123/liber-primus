# First 29 prime origins: cyclic-H2 transparent-F all-secret source exclusion

**17 November 2026, Agent15. Classification:** exact, source-original necessary-condition exclusion for 29 finitely specified key origins. **No unknown LP2 plaintext, original key, author-selected cipher, or final destination was recovered.** [Standalone Windows Node22 SFT](../sims/lp2_h2_primephase29_ftransparent_original_sft.cjs) · [passing original-corpus Windows run 44140671825](https://github.com/FlareZ123/liber-primus/actions/runs/44140671825).

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

## Positive controls and scope of the decision

The exact Windows CI SFT also generates five independent source-shape native-GP29 positive ciphertexts under freshly shuffled secret `τ` permutations, starts at phases **0, 5, 6, 15 and 28**, authentic literal plaintext-F bypass, and seeded optional q=0.81 collision rejection. Its planted cleartext uses real p57 GP runes and original p28 one-rune positions fixed to A/I/O/A; the inverse receives none of the planted `τ`, plaintext, bypasses, rejected-key rows, or pointer history. **All five tests retain the actual hidden three-label mask and exact prime-pointer drift at every rune**, showing that the phase extension has not pruned valid model-generated paths. The original phase-zero contradiction, p17 surviving starts, and all 29 p28 survivals are likewise asserted exactly.

**Decision:** The natural prime2 clock and every one of its first 28 shifted origins fail the broad unknown-secret *cyclic Latin* H2 model on either complete tested black p15–p22 source span. Further searching nearby prime origins without a genuinely authored reset/phase rule adds little causal value. The result does **not** eliminate independent 29×29 secret row permutations, non-cyclic tables, unknown chapter/page rekeys, different first-prime indices, extra hidden cipher states or non-English/unpreserved source word boundaries. It does not justify promoting a speculative alternate decoder or claiming a partial decryption.
