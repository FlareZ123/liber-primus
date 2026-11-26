# GP29 previous-cipher homophonic row-surjection: exact rare-letter occupancy

**Agent 49, 26 November 2026.** A direct one-step context-dependent homophonic cipher with full per-row output alphabet is incompatible with every tested 3,008-letter native English, reduced-English and Latin window on original p40–53, even with a private table for this chapter. No unknown plaintext or authentic key. This extends earlier [GP29 row-bijection bounds](lp2-cprev-secret-table-majorization-original-gate.md) to non-bijective 29→K decoder rows; the [stationary homophonic](homophonic-downward-surjection-ioc-bound.md) model lacks predecessor state and is not repeated here.

## Receiver and exact bound

The original has only 86 equal adjacent GP runes in 12,901 within-physical-page transitions. A plausible rival to a permutation is homophonic Latin-letter encryption: each previous ciphertext rune s selects a fully secret row D[g,s]:{0..28}→A, where A is the complete target alphabet of K distinct letters. Every row is surjective, so a sender can encode every letter in any state. An encoder selects any successor c such that D[g,s](c)=P; the decoder deterministically reads D[g,s](c). Choices of homophone can be random. g is either global, nine source illustration chapters, or each individual physical page. Page-initial letters are completely free, and printed word boundaries are ignored. No historical source selects this architecture; the rare repeat anomaly is the motivating evidence.

For any fixed set S of k distinct plaintext letters, surjectivity guarantees at least k distinct successor cells of every row map to S. If n[g,s,c] is the original transition-count histogram, the exact attainable lower bound for S is therefore L[k] = sum of the k smallest counts in each row. It holds simultaneously for all secret rows, including every allocation of extra homophones to letters. The complementary upper bound for any k letters is N−L[K−k]. These are necessary rank inequalities, not sufficient conditions for an entire frequency vector or a real key. With non-surjective rows, context-specific missing plaintext letters or extra state, the proof does not apply.

The 12,956 source runes in 55 rune-bearing pages give 12,901 within-page transitions. Global L[1..5]=86,318,599,909,1234; independent chapter tables give 7,33,83,167,289. On p40–53 alone, 3,008 source runes and 2,995 transitions give L[1..5]=7,29,62,102,147 and L[10]=467. The true least frequent k letters of any candidate must collectively occur at least L[k] times, even if the rare letters change across reference windows. The lower bound allows all secret allocations of all 29 ciphertext outputs; no guessed homophone multiplicity.

## Exhaustive finite source-register comparison

The controls are the pinned repository Gibran, Emerson, Shakespeare and eight-book Vulgate texts. Strip Gutenberg start/end framing where present, comment lines from the already normalized Vulgate, then retain uppercase ASCII letters. English has all 26 letters. Also test a premodern-style fixed 23-letter normalization J→I, U/W→V (not asserted as a historical author choice). Vulgate contains 23 actual distinct letters and retains its source normalization. For each window, sort the complete alphabet counts including absent letters, and take the minimum over k=1..K−1 of the cumulative count minus L[k]. Negative is impossible. Since this uses the entire native window before removing any initial letter, it grants the decoder arbitrary page-head plaintexts and is more permissive than requiring exact page-mask matching. Both full-book and chapter-local comparisons include every contiguous window, not selected excerpts. No dependence on printed word semantics.

| Reference | Register | Whole-book windows | Global pass | Nine-table pooled pass | p40–53 local pass | Best p40–53 margin |
|---|---|---:|---:|---:|---:|---:|
| Gibran | English26 | 37,947 | 0 | 0 | 0/47,895 | −239 |
| Gibran | reduced23 | 37,947 | 0 | 0 | 0/47,895 | −111 |
| Emerson | English26 | 312,209 | 0 | 0 | 0/322,157 | −192 |
| Emerson | reduced23 | 312,209 | 0 | 0 | 0/322,157 | −57 |
| Shakespeare | English26 | 216,493 | 0 | 0 | 0/226,441 | −146 |
| Shakespeare | reduced23 | 216,493 | 0 | 7,850 | 0/226,441 | −37 |
| Vulgate | Latin23 | 195,725 | 0 | 6,471 | 0/205,673 | −64 |

All 1,398,659 p40–53 windows across the seven registers fail the local bound. This includes independent placements of that chapter, so the few reduced Shakespeare and Vulgate windows passing the pooled nine-table inequality cannot rescue the full manuscript under those reference registers. All 1,329,023 global windows fail. Page-private tables pass the pooled necessary test for all these reference windows; this does not show that any actual key or even a complete feasible count assignment exists. The reproducer emits exact rank bounds, all nine chapter comparisons, best/worst witnesses and complete pooled counts.

## Positive and reproducibility

An independent seeded set of 261 random surjective 29→26 rows encrypts a genuine Gibran control over exactly the original physical page lengths, with random page-initial ciphertext seeds and homophone choices. The deterministic decoder recovers 12,901/12,901 noninitial plaintext letters. Every rank inequality holds. Initial plaintexts are outside the receiver. The implementation is read-only, uses no secret optimization, and was executed on the original corpus in connected JavaScript; no Windows CI run is claimed.

- [Reproducer](../sims/lp2_cipherprev_homophonic_surjection_sft.cjs): `node sims/lp2_cipherprev_homophonic_surjection_sft.cjs`.
- Corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.
- Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Vulgate 37da42555c0885f4cc46cc897ba5a2b9e8a5cda2.

**Decision:** retire global and nine independent chapter-level full-alphabet homophonic predecessor rows as a direct letter-preserving native-English/Latin receiver for these finite references. Do not run a secret-table optimizer in those excluded scopes. This does not exclude page-private or faster state changes, a different or incomplete alphabet, different native windows or languages, nonlocal transport or reordering. No new unknown LP2 plaintext.
