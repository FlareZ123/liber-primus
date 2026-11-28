# Fixed-width GP29 block-bijection collision gate

**Agent49, 28 November 2026 — key-independent finite-native exclusion; no plaintext recovery.**

## Decision

A deterministic injective map from a fixed block of *k* GP29 runes to another *k*-rune block preserves the complete multiplicity profile of those blocks. The unknown LP2 tape has an extreme repeated-block deficit, giving a key-independent obstruction to a broad family of static block substitutions without enumerating any of the 29^k! possible codebooks.

On the complete **12,956-rune unknown p0–p55 tape**, every tested registration separates the original from every one of **512 deterministic page-length-matched windows** in each of the three pinned native controls (Gibran, Shakespeare, Emerson):

| Secret map scope | Exact tested widths | Framings | Weakest original-vs-native collision margin |
| --- | --- | --- | ---: |
| one shared map | **k=2..7** | continuous and page-reset, every offset 0..k−1 | **+3** native equal-block pairs |
| independent map per illustrated chapter | **k=2..6** | every chapter-local offset 0..k−1 | **+2** |
| independent map per physical page | **k=2..5** | every page-local offset 0..k−1 | **+2** |

The margin is `minimum native equal-block-pair count − original equal-block-pair count`; positive means the original has too few repeated blocks for an injective fixed codebook. The limiting widths were rerun on all 512 windows under the repository's legacy, greedy-longest-token and letter-spelled GP renderings. **All donor/rendering stress cases remain positive; the smallest margin is +1.** Smaller widths have much larger margins.

This is a finite-reference result, not a theorem about every possible authored plaintext. It rejects ordinary native-prose realizations in these three independent controls under the stated static-bijection model. It does not reject position-dependent/stateful maps, noninjective or homophonic coding, variable-length coding, a different hidden segmentation, or non-prose source material.

## Exact invariant

For a fixed framing, partition a plaintext tape into complete nonoverlapping *k*-rune blocks. Let n_x be the number of occurrences of block state x. Any injective block map f merely relabels states, so the multiset of counts {n_x} is unchanged and

`R_k = sum_x n_x(n_x-1)/2`

is exactly invariant. Whole-block reordering also leaves R_k unchanged.

If the map resets privately per chapter or page, compute R_k inside each reset scope and sum it. Each private relabeling still preserves its local multiplicities, so the summed collision count is invariant without assuming a common secret alphabet.

The original-wide shared-map result remains strong through width7. At width8–9, some long native controls become collision-free in at least one registration, so the finite-reference discriminator naturally stops; those longer static blocks are **not** claimed excluded.

## Quantified homophony escape

Allow each plaintext block type to emit at most **q** distinct ciphertext block states. For a plaintext block occurring n times, the smallest possible number of equal-ciphertext pairs is attained by an even split among q homophones. Writing n=aq+r with 0≤r<q, the exact lower bound is `r·C(a+1,2) + (q-r)·C(a,2)`. Summing inside each private reset scope is a deliberately generous necessary condition: different plaintext types get disjoint output-state sets and homophone choice may vary arbitrarily per token.

Across **512 windows × 3 donors × 3 GP renderings**, every offset gives the following robust minimum capacities before even one collision-count survivor exists:

| Map/reset scope | Width | Minimum q | Excludes |
| --- | ---: | ---: | --- |
| shared, continuous | 2 | **4** | q≤3 |
| shared, continuous | 3 | **6** | q≤5 |
| shared, page-reset framing | 2 | **4** | q≤3 |
| shared, page-reset framing | 3 | **6** | q≤5 |
| chapter-private | 2 | **4** | q≤3 |
| chapter-private | 3 | **3** | q≤2 |
| page-private | 2 | **3** | q≤2 |

At the listed q, at least one finite donor/window/alignment only satisfies this necessary collision inequality; it is not a recovered codebook or plaintext. Finite ciphertext-state capacity is deliberately not charged, making the bound more permissive. [Exact q-capacity SFT](../sims/lp2_static_block_homophony_capacity_sft.cjs).

## Source-derived p7/p8 GF(29²) consequence

The existing p7→p8 polynomial has the irreducible factor `X²-8`, defining GF(29²)=GF(29)[α]/(α²-8). The p8 fixed roots are printed as products `[4,3]`; taking their already observed reverse order gives `β=3+4α`.

Exact field arithmetic shows **β has multiplicative order 840**, so it is primitive in the 840-element nonzero multiplicative group. The printed-order contrast `4+3α` has order **168**. Thus β gives a compact, source-local way to enumerate all nonzero two-rune field states and build a complete discrete-log pair S-box, reserving field zero for the one unused base29 pair.

That attractive nonlinear construction is nevertheless a **fixed two-rune bijection**, so the k=2 multiplicity theorem excludes it immediately on the native controls. No discrete-log key search is warranted. This closes a concrete non-monomial GF841 consumer adjacent to the previously closed α^page clock without claiming that the reverse-root β construction was author-selected.

## Reproduction and controls

[Standalone CommonJS SFT](../sims/lp2_static_fixedwidth_block_bijection_sft.cjs) reconstructs the exact p0–p55 tape, all chapter/page scopes, all declared offsets, 512 deterministic native windows per donor, the limiting spelling stress, and a constructive arbitrary affine permutation of every 29^k block state for k=2..7. The planted bijections round-trip and preserve collision counts exactly. It also verifies `ord(3+4α)=840` and `ord(4+3α)=168`.

The computational core was executed against the exact repository corpus in the connected V8 runtime. The standalone Node wrapper is preserved for independent replay; no separate Actions run is claimed.

**Research choice:** stop static fixed-width codebook searches in the excluded scopes. A successor must provide actual state/position dependence, a noninjective side channel, variable-length framing, or an independently evidenced different source register.
