# Original LP2 cross-page GF(29) polynomial factors: complete pairwise screen

**Classification:** new bounded exact arithmetic observation and a provisional global-root signal. **No unknown plaintext, key, executable decipherment, or destination has been recovered.** This scan examines whether the existing p29 / numerical-table shared polynomial factor generalizes across the other original LP2 page streams. It replaces speculative pair chasing with a complete literal-factor inventory.

## Source input and question

The authenticated 2013 `BASE29 3301=3QO` example, the original p39 red triad `[27,5,15]` and the original p50 32×8 base60 table already underpin the verified GF(29) source-factor observation. In descending coefficients, `G(X)=15(X−24)² = [15,5,27]` divides both physical p29's 277-rune polynomial and the 256-cell numerical-table polynomial. Those quotients have remained ciphertext-like under direct inversions. See [established synthesis](../results/README.md), [source triad gate](../sims/lp2_red_triads_polynomial_source_gate.cjs), and [p29 quotient inverse](../sims/lp2_page29_grid_quotient_inverse_sft.cjs).

The immediate constructive question is whether **multiple original ciphertext pages share a larger nonconstant polynomial** and thus expose a common encoder, source key, or reversible operation. A nontrivial shared high-degree factor across independent page streams would justify a specialized joint inverse. This test examines that literal multiplicative architecture before undertaking such an inverse.

## Exact original-input result

Using the 55 nonempty ciphertext arrays for physical LP2 pp0–55, plus the 256 numerical-table byte residues modulo29, represent each sequence as a descending-coefficient polynomial over GF(29). Compute all monic Euclidean GCDs, without fitting keys or altering page order.

| Quantity | Observed |
| --- | ---: |
| Original rune symbols | 12,956 |
| Rune-bearing ciphertext pages | 55 |
| Other polynomial | p50 256-byte printed grid |
| Original polynomials | 56 |
| Distinct pairwise GCDs | 1,540 |
| Degree zero | 1,450 |
| Degree one | 88 |
| Degree two | **2** |
| Degree three or higher | **0** |

The *only* quadratic intersections are:

1. **Physical p29 with the numerical grid**, `gcd = X²+10X+25 = (X−24)²`, the already established p39 red-triad factor. There is no additional common polynomial factor.
2. **Physical pp27 and48**, `gcd = X²+6X = X(X+6)`. Their final rune index is zero, so the `X` factor is an immediate visible-terminal-rune consequence. Both also happen to have root `X=23`; no independent original clue currently specifies that pair or selects this second root.

### Direct p27/p48 factor inverse on original ciphertext

The additional common quadratic can be explicitly removed without a guessed key: divide both original rune streams by the source-observed monic factor `X(X+6)`, retaining printed symbol order. The original 234-rune p27 becomes a **232-rune** quotient with GP29 index of coincidence **0.0361621** (raw **0.0339313**); original 271-rune p48 becomes a **269-rune** quotient with IoC **0.0346779** (raw **0.0343037**). Both have exactly zero division remainder and multiply back to every original rune. The p27 and p48 quotient openings remain unrecognizable GP prose. A source-native 95-rune solved-p57 plant is recovered **95/95** by the same polynomial multiply/inverse.

A further frozen control applies both signs of the established solved-p56 prime-totient shift with either no transparent F or a literal-F bypass to both quotients (eight fixed total cases). Their IoCs remain **0.032915–0.037258**; the maximum is below **0.04** and no case resembles native English GP. This does not exclude an intermediate register or a separately keyed downstream layer, but **the literal common-factor inverse and immediately available solved-page primitive do not decrypt either unsolved page**. The [single SFT](../sims/lp2_original_pairwise_gf29_gcd_sft.cjs) tests these inverses, forward plants, and direct consumers. [Updated successful CI](https://github.com/FlareZ123/liber-primus/actions/runs/43114722742).

For independent uniformly random high-degree GF(29) polynomials, the pair count would yield approximately `1540/29² = 1.831` degree-2-or-higher intersections and `1540/29³ = 0.063` degree-3-or-higher intersections. Observing two quadratic and zero cubic intersections is ordinary. The scan therefore **does not support extending the literal shared-factor architecture beyond the known p29/grid relation**. This is a direct original-polynomial statement; it does not exclude higher-order or nonlinear encoders, or shared factors arising only after independently selected transforms.

## Exploratory root-load signal

The scan also evaluates every original polynomial at each of the 29 GF(29) values. There are **75** page-by-root zero incidences, compared with the iid-uniform reference expectation **56**. The sum of paired root coincidences is **91**; one pair can overlap at two roots. The conspicuous root `X=24` is shared by physical pp10,11,29,36 and the grid, with the p29/grid shared root of multiplicity two already established.

To avoid interpreting this source-discovered signal as a cipher, two independent seeded controls preserve source page lengths and rune multisets:

| Conditional control | Replicates | Mean root incidences | Incidences ≥75 | Mean root-pair overlaps | Overlaps ≥91 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Independent within-page Fisher–Yates shuffles | 600 | 55.518 | 2 | 51.173 | 4 |
| Within-page accepted swaps preserving each page's **exact adjacent-equal count** | 400 | 56.450 | 3 | 52.943 | 10 |

Add-one empirical upper tails for root incidences are approximately **0.00499** and **0.00998**, respectively; corresponding pair-overlap tails **0.00832** and **0.02743**. These are **conditional, exploratory, selection-unadjusted** measures from a scan motivated after noticing the p29/grid factor, and the constrained-swap samples are successive states of a local chain, not independent replicates. The small root-load excess could reflect nonrandom source generation or a feature of the original ciphertext statistics unmodeled by these controls. It neither identifies a cipher nor independently proves deliberate page-level polynomial construction.

## Decision and path to plaintext

**Retire general cross-page common-factor division as the immediate decryptor.** A source-motivated proposal that identifies another exact factor should first make a locked prediction on original ciphertext beyond the already examined pp29/grid pair, or specify a forward/inverse operation that recovers native plaintext on an untouched segment.

The only provisional follow-up here is **why independent source-visible roots appear with mild excess**, especially whether the unusually prominent p54 Ac/index24 and the p39 red triad specify a unique operation on the p10/p11/p36 roots. Do not select among those pages post hoc, or turn the 75 zero incidences into a claimed message without an independently justified grammar. The next research investment should preferentially identify a key or reversibly interpret the authentic p29/grid quotient.

**Reproduction:** [one-file CommonJS SFT](../sims/lp2_original_pairwise_gf29_gcd_sft.cjs) · [successful manual GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43113636677). The SFT asserts the full GCD histogram, both exact quadratic factors, both inverse/forward ciphertext reconstructions, 75 zero incidences, 91 pair overlaps, and all planted/swap invariants; all controls use deterministic seeds and original repository resources.
