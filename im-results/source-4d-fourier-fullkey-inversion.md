# Exhaustive crib-free source-matrix F29 state inversion

**Evidence classification, 10 November 2026 (Agents 7 and 14):** the four-matrix 4D F29 language tests are original-negative for GP and Latin prose under the transparent-EA/15-step and direct-additive output channels. The separate author-prime and raw-byte 4D tests remain original-negative only for their original three-matrix scope. The strict five-rune/three-byte fixed-alphabet transport also has a key-independent original-source impossibility proof even allowing an arbitrary separate substitution alphabet on every physical page. **No original unknown LP2 plaintext, historical key or complete mechanism recovered.** Every exclusion is finite and conditional on its stated output model, source segmentation, and evolving-state assumptions.

## Why this attack is a meaningful extension

Earlier original-source red16 and printed-page15 4D studies used solved-native EA-containing word cribs to solve keys, giving only hundreds of original candidate states. This attack instead scores **all 29^4 = 707,281 possible initial states** under each independently selected matrix, using no fitted plaintext word or original key prior. Each candidate state is globally continuous across the original physical-page layout. All original page indices 0–27 (6,761 runes) select the key; pages28–55 (6,195 runes) are never used during optimization.

Original sources, forward and inverse assumptions are the existing [red16 original-input study](red16-fibonacci-spiral-inverse.md). The four exact source-derived 4×4 transition matrices now covered by the GP-language state tests are (i) 16 original red-span GP-prime sums placed along the p15 4×4 Fibonacci spiral, (ii) the 16 printed original p15 square entries reduced modulo29, (iii) the 16 original visually red rune-span lengths [13,16,3,11,14,12,9,11,16,19,10,8,3,8,51,9] in physical manuscript order placed clockwise along the same spiral, and (iv) the elementwise Euler totients of the 16 underlying Fibonacci-indexed primes in the p15 square. For (iv), the recovered prime matrix is [[43,79,149,263],[23,2,3,463],[13,7,5,829],[7817,4507,2593,1481]]; applying φ cellwise and reducing modulo29 gives A=[[13,20,3,1],[22,1,2,27],[12,6,4,16],[15,11,11,1]], with det(A)=28 mod29, so it is invertible. This fourth candidate is motivated by LP1 p05's explicit prime/totient instruction and its MOBIUS cell (GP-prime sum226), for which φ(226)=112=4×28=4φ(29); the 4×4 shape and 28-step output group suggest, but do not establish, a four-coordinate F29 state. The original span counts are in [the pinned visual ink annotations](../resources/liber-primus/lp2-ink-annotations.json). The differential output convention is unchanged: for non-page-initial symbols, GP-EA (index28) emits an adjacent-equal ciphertext rune, whereas GP p∈0..27 emits the nonzero step 15^((p+K)%28) modulo29. The key tap is the first coordinate of A^t S reduced modulo29, then modulo28 for nonzero steps. Page heads use GP29 addition. The unknown key S contains exactly four F29 coordinates and has no individually fitted location, page offset, or crib.

## New algorithm: exact finite-field ridge Fourier optimization

For an original ciphertext position t, the observed nonzero step exponent e_t gives decoded GP index p_t=(e_t - (v_t⋅S mod29 mod28)) mod28, where v_t=e0 A^t. Let f_t(k) be the fixed solved-Cicada GP unigram log likelihood for p_t under projected state k∈F29. Then

    L(S) = sum_t f_t(v_t⋅S)
         = sum_{u∈F29^4} H(u) exp(2πi u⋅S/29),

with only 29 nonzero possible frequencies per original training position. For adjacent nonzero steps, the joint-source bigram objective is

    B(S) = sum_t g_t(v_(t-1)⋅S, v_t⋅S),

whose Fourier coefficients lie on two-dimensional subspaces: u=m v_(t-1)+n v_t. The attack aggregates 29² coefficients per eligible source pair, then performs four successive exact-definition 29-point complex Fourier syntheses to obtain the score of **every** S in F29^4. Numerical equality with direct likelihood summation is asserted at independent states to 1e−5. No heuristic random walk, local search, word-crib alignment or early termination occurs.

The unigram score uses 0.5-smoothed GP frequencies from the 796 previously solved Cicada source words, conditioning on non-EA for nonzero steps. The bigram score uses a 0.5-smoothed 28×28 solved-source adjacent GP frequency matrix and ignores pairs containing a ciphertext EA-step or a page head. The two objectives are independent ranking experiments against the **same frozen training/heldout split**, without using the original heldout pages for key selection.

## Executed exact full-key results

| Matrix / objective | Best original training state S | Original training log-ratio/rune | Frozen original heldout log-ratio/rune | Original heldout GP IoC |
| --- | --- | ---: | ---: | ---: |
| Red16 unigram | [12,26,5,26] | −0.811645 | **−0.916692** | 0.035329 |
| Printed p15 unigram | [24,3,18,8] | −0.811420 | **−0.930148** | 0.035307 |
| Visible-red-count unigram | [8,6,3,11] | −0.814951 | **−0.925797** | 0.035233 |
| p15 φ(prime) unigram | [6,27,1,13] | −0.824824 | **−0.896837** | 0.035275 |
| Red16 bigram | [7,26,0,27] | −1.021958 | **−1.104237** | 0.035281 |
| Printed p15 bigram | [19,6,22,24] | −1.014708 | **−1.074075** | 0.035307 |
| Visible-red-count bigram | [3,8,24,26] | −1.025466 | **−1.123101** | 0.035268 |
| p15 φ(prime) bigram | [18,27,20,15] | −1.014195 | **−1.109899** | 0.035254 |

Source GP positive controls encrypt 12,956 runes drawn cyclically from the established solved-Cicada GP reference using hidden states [11,7,22,3], [5,12,19,27], [1,9,18,27], and [17,5,23,9] for the red16 prime-sum, printed p15, visibly red count, and p15 φ(prime) matrices respectively, on exactly the original printed-page boundaries and continuous source clocks. In all eight objective/matrix combinations, exhaustive blind search identifies the true initial state at **rank 1/707,281**. Each positive yields **12,956/12,956 exact GP runes recovered and re-encrypted**, GP heldout IoC **0.062342**, and heldout log-ratios **+0.419661 unigram / +1.292815 bigram**. The native source used for the plant is also the source for its frequency model, so this is a genuine key-recovery positive, not an independent heldout author-detection experiment.

The source-negative original heldout IoCs are near the GP29 uniform baseline 1/29 = 0.034483. No candidate recovers sustained source-native GP text under either fitted objective. The original 12,956 symbols can be exactly re-encrypted under any state; this exactness is a necessary implementation check, not evidence of an authentic historical key.

## Independent Latin-original 4D exhaustion (same cipher states, new source register)

The original red heading has a published but unauthenticated Latin reading. As a language-specific challenge, freeze **the same four source matrices, 29⁴ states, complete original page split, field output transform, and independent Fourier unigram/bigram objectives**, replacing the GP reference only with the independent previously established **203,357-rune Latin Vulgate training corpus** (Luke/John/Acts/Romans) and its 2,400-rune Revelation GP holdout for the blind source-key plant. No Latin ciphertext crib is fitted, and no source positional parameter is changed.

| Matrix / Latin objective | Training-selected state | Original heldout mean log ratio / rune | Heldout IoC | Source-matched blind-plant heldout score |
| --- | --- | ---: | ---: | ---: |
| Red16 Latin unigram | [2,26,26,12] | **−1.383865** | 0.035305 | +0.526902 |
| Printed p15 Latin unigram | [15,10,28,5] | **−1.323108** | 0.035313 | +0.526902 |
| Visible-red-count Latin unigram | [22,1,6,19] | **−1.363608** | 0.035308 | +0.526902 |
| p15 φ(prime) Latin unigram | [8,25,8,8] | **−1.317965** | 0.035297 | +0.526902 |
| Red16 Latin bigram | [11,1,28,0] | **−2.855965** | 0.035306 | +1.386850 |
| Printed p15 Latin bigram | [6,12,10,26] | **−2.972565** | 0.035259 | +1.386850 |
| Visible-red-count Latin bigram | [3,28,16,9] | **−2.895259** | 0.035249 | +1.386850 |
| p15 φ(prime) Latin bigram | [16,1,6,0] | **−2.880988** | 0.035230 | +1.386850 |

The unmodified full enumeration places the correct hidden key first among **707,281** states for **all eight** Latin native-source cipher controls, reconstructing and exactly re-encrypting **12,956/12,956** runes. The 2,400 independent Latin heldout runes are recycled to fill the original 12,956-symbol layout; this is a *synthetic key-recovery positive*, so the repeated plaintext itself does not create independent evidence for Cicada intent. The original source remains near uniform and no original Latin is recovered. The independent source-register check is a **finite two-language negative** for the declared four-matrix cipher architecture, and no stronger assertion about arbitrarily encoded non-prose is implied.

The current workflow executes both transparent-EA/15-step and direct-GP29-additive channels under native-GP and Latin source registers. The four JSON outputs are retained as the seven-day `source-4d-fourier-fullkey` workflow artifact. [Four-matrix English/Latin exhaustive run 42902884936](https://github.com/FlareZ123/liber-primus/actions/runs/42902884936).

## Direct GP29-additive 4D source-state inversion

The same four matrices were also tested under a distinct direct-additive channel,
\[
C_t=P_t+e_0A^tS\pmod{29},
\]
which enciphers every rune directly, including page heads and repeated symbols; it does not use the transparent-EA marker or the 15-step nonzero-difference register. For each matrix, all 707,281 initial states were exhaustively scored by GP unigram and adjacent-bigram likelihood, with the same physical-page 0–27 training / 28–55 frozen holdout split. The independent Latin register repeats the full enumeration without changing the matrix or clock.

| Source matrix | Native GP unigram heldout (IoC) | Native GP bigram heldout (IoC) | Latin unigram heldout (IoC) | Latin bigram heldout (IoC) |
| --- | ---: | ---: | ---: | ---: |
| Red16 prime-sum | −0.954804 (0.034465) | −1.111116 (0.034510) | −1.386324 (0.034482) | −2.838345 (0.034513) |
| Red16 visible-count | −0.923013 (0.034467) | −1.095299 (0.034467) | −1.249910 (0.034533) | −2.801364 (0.034533) |
| Printed p15 square | −0.915563 (0.034503) | −1.101212 (0.034438) | −1.279063 (0.034535) | −2.948798 (0.034429) |
| p15 φ(prime) | −0.945018 (0.034464) | −1.097671 (0.034510) | −1.332887 (0.034518) | −2.935452 (0.034512) |

Every one of the 16 direct-channel matrix/register/objective positive controls recovers its predetermined hidden state at **rank 1/707,281**, restores **12,956/12,956** plaintext runes, and exactly re-encrypts the original-length ciphertext. The original heldout IoCs remain at the GP29 uniform baseline; all heldout language log-ratios remain negative. The φ-derived p15 matrix therefore supplies no English/Latin plaintext under either the transparent-EA/15-step model or this distinct direct-additive model. The small training-score advantage of some fitted states does not generalize to the frozen pages.

**Scope boundary:** The author-prime-clause and binary-packet sections below retain their earlier **three-matrix** scope (red16 prime-sum, red16 visible-count, printed p15 square). They have not yet been rerun with the new p15 φ(prime) matrix; their three-matrix exclusions must not be read as four-matrix results.

## Author-prime clause complete state inversion: six original full-key tests

**Agent 7, 10 November 2026.** The independently authenticated 2013 Cicada audio metadata product **1,595,277,641 = 1,259 × 1,031 × 1,229** corresponds to the GP-prime sums of the three solved *Parable* body clauses. Agent43's [author-native source discriminator](author-native-prime-clause-discriminator.md) records **13 prime-valued among 16** printed clauses in three solved Cicada passages. This supplies a language-independent, author-specific plaintext criterion distinct from the previously exhausted GP-English/Latin unigram and bigram models.

The [exact author-prime inverter](../sims/source_4d_prime_clause_fullkey.cjs) aligns all original 12,956 cipher runes and printed period punctuation against the master. Of **168** nonempty dot-delimited clauses, the source-specified solved-Cicada maximum length of **76** gives **101** clauses of length 3–76. Freeze **50 training clauses (1,590 runes)** wholly in physical pages 0–27 and **51 heldout clauses (1,759 runes)** wholly in pages 28–55. A clause crossing the split is excluded. Original page and word positions, physical-page initials, and a globally continuous state clock are preserved in the inverse.

For each of the three previously source-fixed 4×4 matrices, enumerate **all 29⁴ = 707,281 initial-state keys**, choosing the state with the greatest number of prime-valued training clause sums and then scoring the later clauses with the key frozen. Two independently specified original forward/inverse channels are checked:

- Transparent GP EA (28) produces a repeated ciphertext rune; all other runes are primitive-root-15 nonzero predecessor steps with a state mask reduced mod28. Page initials use GP29 addition.
- Direct addition in GP29 uses the same four-coordinate matrix state, with every plaintext symbol decoded as ciphertext minus the state projection mod29.

Both are reversible. Reencryption of any chosen original-state candidate is an algebraic sanity check and does not authenticate that candidate.

| Frozen matrix | Output rule | Highest train primes / 50 | Heldout primes / 51 | Heldout GP IoC |
| --- | --- | ---: | ---: | ---: |
| Red16 prime-value spiral | EA / 15-step | **20** (7 tied) | **1** | 0.035251 |
| Red16 visible-count spiral | EA / 15-step | **20** (3 tied) | **8** | 0.035252 |
| Printed Fibonacci prime square | EA / 15-step | **21** (2 tied) | **10** | 0.035198 |
| Red16 prime-value spiral | GP29 direct addition | **21** (unique) | **10** | 0.034542 |
| Red16 visible-count spiral | GP29 direct addition | **22** (unique) | **8** | 0.034547 |
| Printed Fibonacci prime square | GP29 direct addition | **21** (unique) | **8** | 0.034497 |

The apparent training maxima are expected to be inflated by **707,281-way key selection**. Frozen validation never exceeds **10 of 51**, and the decoded heldout unigram collision rates remain close to uniform. No original state gives independent source-authenticated plaintext.

**Author-prime control with exact key recovery.** A separate native solved-Cicada GP corpus (3,248 runes) was recycled over the exact 12,956-position original page layout. A predetermined 13-of-16 selection of original-shaped short clauses received at most two GP symbol edits where necessary, enforcing **83 prime clauses** and yielding **84/101** prime clause sums in total, with **70 changed runes**. Independently keyed copies were forward encrypted under each of the six matrix/output families. The same 707,281-key scorer, blinded to the secret state, recovered the actual planted key **at rank 1 in all six families**. Their independently withheld score is **43/51**, compared with **41/50** on training. Each planted plaintext decoded and reencrypted exactly, **12,956/12,956 symbols**. This demonstrates recovery power for the declared author-prime signal; no synthetic authoring rule is claimed for the unknown manuscript.

**Scope and decision.** All **4,243,686 source-model original keys**, plus equivalent positive controls, were evaluated exactly. The complete direct-addition and transparent-EA four-state families lack the independent author-prime signal under the frozen matrix, global clock, period segmentation, GP value map and length criterion. Alternative plaintext registers, editorial segmentation, key schedules, source matrices or nonlinear output channels remain open. Retuning length limits on the same original key scores would amount to fitting the observed negative and requires a new independent source rule.

[Six-job original-input and planted-control successful CI 42841743152](https://github.com/FlareZ123/liber-primus/actions/runs/42841743152) provides exact original training score histograms, the ten top frozen keys and holdout counts per model. [Manual parallel workflow](../.github/workflows/source-4d-prime-clause-manual.yml) and [complete CommonJS SFT](../sims/source_4d_prime_clause_fullkey.cjs) make the full finite search reproducible.

## Original binary intermediate: exact radix29 codeword exclusions

**Agent 7, 10 November 2026.** English, Latin and author-prime-sum tests could overlook an encrypted or compressed binary intermediate. Ordinary fixed-block binary encodings, however, have exact GP29 digit-capacity requirements independent of the contents of those bytes. This extension consumes the **unchanged 12,956 original LP2 runes**. Its strongest conclusion is an original-input, **key-independent** exclusion of an entire arbitrary **per-page fixed substitution** class for a specified high-density binary transport. No original plaintext, historical key or complete mechanism was recovered.

### Full keyspace inverse: two GP29 digits per raw byte

If one byte is represented by two base29 digits (h,l), the value **29h+l** must be at most 255. Therefore its high digit h is at most **8**, regardless of any entropy, source language, encryption or compression in the byte payload. For each of the three source-defined 4×4 matrices previously studied above, exhaust **all 29^4=707,281 unknown initial states** under the reversible GP29 additive output rule. Check **eight** complete source-aligned binary frames: both digit orientations, both packet phases and global vs physical-page restart. Across all **24 original source-matrix/frame combinations**, every key fails **within the first 12–14 original high-digit checks**, before any plaintext interpretation or heuristic score is considered. The full inverse checks the complete encoded byte capacity for any preliminary survivor, but none exists.

A separate key-independent constraint concerns the **transparent-EA** predecessor-feedback output. An adjacent repeated ciphertext rune requires GP plaintext EA, index28, at its noninitial position. Such a high digit would exceed the byte's maximum of8. The original has **14 physical pages** (0,3,4,8,9,19,24,25,27,34,35,41,43,44) each containing *nonterminal* adjacent repeated glyphs at **both local rune parities**. Even independently resetting the two-rune packet alignment on each page cannot place every such EA marker in a low-byte position. This excludes strict unmodified two-rune byte transport under this declared EA-feedback rule, regardless of key schedule, while leaving separate marker channels outside the claim.

### Full keyspace inverse: five GP29 digits per three raw bytes

A more space-efficient byte code packs three raw bytes into **five base29 digits**. Because **29^5=20,511,149** exceeds **256^3=16,777,216**, the first GP29 digit of every complete packet must be in **0..23**. Freeze **20 natural packet frames**, from all five start phases, forward/reversed order and continuous-book/physical-page restarts. For each of the same three independently sourced 4×4 transition matrices, the complete **707,281-key** original sieve eliminates **every** initial state under **all 20 frames** using only **64–95 first-digit observations**. That gives **60** additional exact original finite source-matrix/framing exclusions, with no language, cryptographic marker, or file header assumption.

### Stronger all-keys theorem: arbitrary independent secret alphabet per page

For the five-digit/three-byte model, the initial GP29 digit is restricted to **24 possible values**. Assume now that each physical page may have **its own completely arbitrary hidden bijective substitution alphabet** of all 29 GP symbols, fixed only within that page. Every output glyph at a packet-leading position is the image of one of the 24 valid first digits. Under a fixed bijection, no page can exhibit **25 or more distinct ciphertext glyphs at those positions**.

On the original source, each of the same **20 packet phase, digit-order, page/global grouping conventions** has between **14 and 25 distinct physical pages** that actually contain **25–28 distinct observed leading ciphertext glyphs**. Every one of the 20 frameworks is therefore impossible for **every combination of 55 independent unknown 29-permutation alphabets**. Even a single common bookwide permutation fails, because each of the 20 original leading-position streams contains all **29** distinct ciphertext symbols. This is an exact pigeonhole theorem over all possible secret alphabets; it makes **no F29-matrix, cryptographic key, grammar or byte-content assumption**.

The proof assumes a **fixed bijection per physical page and a strict five-rune codeword frame**. It cannot rule out within-page key evolution, hidden markers, secret resegmentation, arithmetic coding, extra layers, arbitrary-length encodings or an encoded nonbyte intermediate. The strong conclusion is conditional on this particular transport mechanism, rather than a universal binary-message exclusion.

### Stronger predecessor-dependent row-alphabet theorem

The per-page fixed-alphabet capacity proof can be strengthened to a *position-dependent* cipher without assuming the three source matrices: allow **29 completely independent, otherwise arbitrary hidden GP29 bijections**, one for each possible *preceding published ciphertext rune*. That is, the secret alphabet used at position t may change according to the visible glyph at t−1. Each row is fixed throughout the book; pageheads with no known within-page predecessor are exempt. This grants an unrestricted 29×(29!) state-dependent key space, far wider than GP29 Caesar, affine, source-matrix, or static per-page substitution models.

For a five-rune/three-byte packet, every high digit lies in 0..23. Condition on one particular preceding ciphertext symbol a. Since its row is a bijection, it can produce **at most 24 different next ciphertext symbols** at packet-leading positions. For each of the **20** original packet phases, directions and book/page clocks, collect all actual successive ciphertext pairs ending at packet-leading positions wholly within physical pages. **Every framing has 27–29 separate preceding-rune states whose observed next-symbol sets already contain 25–29 distinct ciphertext glyphs.** At least one such row contradicts the 24-digit capacity, hence **every possible collection of 29 arbitrary book-fixed predecessor rows is eliminated** for all 20 strict binary packet framings. The argument neither requires nor learns the 29 secret rows.

A separately encoded real gzip byte plant, fitted to original page lengths and packing, used the reversible predecessor-dependent rule C[t]=(7P[t]+C[t−1]) mod29, with a fresh predecessor seed at every physical page head. All **29** hidden substitution rows are bijections. The original source counting routine correctly finds **zero** forced-overcapacity rows in this plant and exactly reconstructs **12,956** GP runes plus **7,704** byte positions including the complete **6,440-byte** gzip stream. It validates the necessary condition on a genuine state-dependent secret alphabet.

**Analogous stronger one-byte result:** With two GP29 digits per byte, the leading digit has only **9 allowed values (0..8)**. Exhaustively grouping the original high-slot positions by their immediately preceding published ciphertext rune shows **all 29 predecessor rows each have 27–29 distinct observed next glyphs under every one of the eight original two-rune byte frames**. Therefore every book-fixed collection of 29 arbitrary predecessor-indexed substitution alphabets is also impossible for strict 2-rune/1-byte coding, independently of a GF29 key or fixed static alphabet. The same original-input SFT now checks all eight high-digit row bounds and reports source group sizes.

The source-exact proof and positive controls are implemented in the previously linked [key-independent all-alphabet SFT](../sims/radix29_packed3_page_permutation_invariant.cjs). The updated [six-job CI run 42846361151](https://github.com/FlareZ123/liber-primus/actions/runs/42846361151) passed the stronger previous-rune row bound alongside all source-matrix and page-alphabet tests. This excludes *book-fixed preceding-ciphertext indexed rows* for the strict 5-to-3 byte codec. A further secret phase, dynamic state beyond the immediate published predecessor, or arbitrary repacketization remains possible.

### Original-size controls and exact forward inversion

The complete key sieve is independently tested on **authentic gzip-compressed source bytes** prepared from the original master transcription. Its member has **6,440 encoded octets**. Across the three independently keyed two-rune and three independently keyed five-rune synthetic manuscripts, each solver blindly recovers **the exact one correct four-state secret key**, decrypts and forward reencrypts all **12,956 GP runes**, reconstructs the encoded bytes and decompresses the genuine gzip member. The five-rune controls recover **7,773** encoded bytes over 2,591 packet positions.

A separate positive for the **key-independent page-alphabet theorem** encrypts a genuine gzip-packed 12,956-rune source using **55 separately chosen invertible per-page affine GP29 substitutions**. The original-input necessary-condition scorer correctly reports **zero source-page alphabet-capacity violations** on that plant, every single GP rune roundtrips, and **7,704** source bytes reconstruct, of which the 6,440-byte gzip member expands to 19,471 UTF-8 source bytes. Thus source-only exclusion is not an artifact of silently fitting the unknown secret alphabets to the original ciphertext.

**Reproduce:** [source-exact two-rune byte full-key inverse](../sims/source_4d_radix29_bytes.cjs), [five-rune packed-binary full-key inverse](../sims/source_4d_radix29_packed3.cjs), [key-independent per-page all-alphabets proof](../sims/radix29_packed3_page_permutation_invariant.cjs), and [successful six-job original-source CI 42845217481](https://github.com/FlareZ123/liber-primus/actions/runs/42845217481). All programs are CommonJS, use native Node 22 packages, preserve original page offsets, and include exact source-size positive inversion and decompression checks. They run in the existing [manual six-configuration workflow](../.github/workflows/source-4d-prime-clause-manual.yml).

**Implication:** A literal static-symbol GP29 byte encoding with fixed packets at these two capacity ratios cannot hide the original manuscript under the declared matrix or per-page key families. Further key searches under those same fixed-ratio assumptions are already mathematically exhausted. Future direct byte recovery requires independently evidenced within-page state evolution or a different recoverable byte framing.

## Reproduce and next decision

- [Exact CommonJS full-state Fourier engine](../sims/source_4d_fourier_fullkey_inverse.cjs): three source-defined matrices, unconditional all-key enumeration, exact direct-score comparisons, heldout original inverses, native GP blind-key positives and exact whole-book forward re-encryption.
- [Dispatch-only CI](../.github/workflows/source-4d-fourier-fullkey-manual.yml), [successful full unigram run 42817630661](https://github.com/FlareZ123/liber-primus/actions/runs/42817630661), [successful unigram + bigram run 42818399747](https://github.com/FlareZ123/liber-primus/actions/runs/42818399747), and [all three matrices in both English and Latin, CI 42821696704](https://github.com/FlareZ123/liber-primus/actions/runs/42821696704). The final run is the reproducible current source test.

The source-locked constant-matrix four-state/transparent-EA cipher can now be rejected as a *recovery path using the supplied source-native English and independent Latin GP models* for all three source-fixed clue matrices, rather than merely being tested against a handful of fitted cribs. The exhaustive method generalizes to source-constrained hidden linear state with arbitrary per-rune and pairwise GP emission scores, providing a useful algorithm when a stronger independent source rule fixes A and the output register. Do not interpret the finite failure as a mathematical exclusion of every possible plaintext; alternate languages and nonnative registers were not tested. The new author-prime clause scorer supplies a separate, independently motivated observation criterion and has also been exhausted for the six original source-matrix/output combinations above. Repeated search using these same matrices and channels is low-value without an independently grounded change to state construction or source assumptions.
