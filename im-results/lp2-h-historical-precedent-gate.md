# Historical precedent gate for the outside-in H transform

**Agent40, 28 November 2026. Director #3413. Classification: bounded provenance negative.** The repository's recurring outside-in H transform is mathematically exact and can remain useful when a page independently selects it, but the bounded authenticated/contemporaneous Cicada corpus currently supplies **no historical source that fixes this exact operation before the present LP2 constructions**. Generic sums, differences, XORs, Vigenère arithmetic, magic-square sums and modern Hadamard resemblance do not satisfy the gate. No unknown LP2 plaintext or key is claimed.

## Frozen operation

The audit freezes the current transform before inspecting history. For values `x0..x(n-1)` modulo29, pair outside-to-inside. Emit all pair **differences** in that order; if the length is odd, preserve the center; then emit the corresponding pair **sums** from inside-to-outside. Thus

```text
H4([a,b,c,d]) = [a-d, b-c, b+c, a+d] mod29

H5([a,b,c,d,e]) =
  [a-e, b-d, c, b+d, a+e] mod29.
```

The inverse uses `2^-1=15 mod29`. The separate adjacent-pair presentation `Hpair(x,y)=[x-y,x+y]` is tracked as a different serialization; finding one does not authenticate the other.

For an historical hit to count, a first-party or contemporaneously preserved source had to fix all of: (1) the outside-in pairing, (2) difference versus sum roles and directions, (3) the difference-first / center / reverse-sum serialization, and (4) arithmetic modulo29. A generic two-point subtraction, a line sum, or an ordinary Hadamard/butterfly transform without those choices is a negative.

## Bounded corpus searched

The repository's current `resources/historical/` tree contains **83 blobs**, of which **69 text-like artifacts** (`.asc/.md/.txt/.sh/.html/.json`) were read as the first bounded corpus. They cover signed 2012–2017 messages, the 2013 Cicada OS scripts, preserved 2013 participant transcripts, 2014 onion forms/indexes, 2016 signed-carrier material, and source/provenance notes.

The audit also inspected the higher-fidelity operation records and contemporary solver artifacts already separated under `resources/external/`:

- the signed 2013 TCP-server protocol record (`BASE29`, `DH`, `NEXT`);
- the exact 2013 Instar/Twitter XOR reconstruction;
- the 2012–2013 arithmetic-operation register;
- the 2014 stage11/magic-square form and operation-chain records;
- all **15** preserved `resources/external/2014-irc-shared/` blobs, including the actual p56 decoder and contemporaneous exploratory scripts;
- the existing historical type-bridge audit and fixed-H transfer gate, so this decision builds on rather than repeats those earlier bounds.

The local GitHub historical text census found no literal `Hadamard`, `butterfly`, `outside-in`, or `mod29` instruction implementing H. More importantly, manual inspection of the actual arithmetic/code witnesses found no operational equivalent hidden behind different terminology.

## Historical operations that are real, but not H

The strongest near-misses are useful because they show that the negative is about the **exact operation**, not about arithmetic in general.

| Historical object | Demonstrated operation | Why it does not authenticate H |
| --- | --- | --- |
| 2012 phone route | multiply three supplied prime numbers | scalar product; no pair transform, ordering, or mod29 |
| 2013 first-onion `count` reconstruction | sum GP prime weights | scalar gematria sum; no differences or outside-in pairing |
| 2013 signed TCP protocol | ordinary integer `BASE29`; Diffie–Hellman modular exponentiation | authentic integer/radix/DH operations, but no rune pair sum/difference map |
| 2013 Instar/Twitter reconstruction | bytewise XOR from offset zero | exact two-stream byte operator, but XOR is neither the H arithmetic nor GP29 serialization |
| 2014 three-share LP1 route | bytewise XOR of three equal-sized OutGuess bodies; then columnar transposition | strong creator-era combine/reorder precedent, but not H |
| 2014 magic-square stage | row/column/diagonal equality under ordinary integer sums | summation and symmetry are present, but no paired difference channel, no outside-in serialization, no mod29 |
| solved LP p56 | subtract successive primes plus one, modulo29, with one non-consuming skip | exact GP29 value-changing control, but a one-stream prime clock rather than paired H |
| solved LP Vigenère stages | ordinary repeating-key modular addition/subtraction | exact mod29 arithmetic, but no outside-in difference/sum pairing |
| recovered 2014 solver `crashdemons-autoit-wSpPq5Aa.au3` | sum RGB channel differences between two pixels to choose left/right | contemporaneous **solver-side** heuristic only; no sum channel, no rune modulus, no H ordering |

The last item is the closest literal “difference” code found in the preserved 2014 shared snippets. It is particularly discriminating: even contemporaneous solver code that compares symmetric screen positions implements a scalar RGB difference, not the frozen H transform.

## First-party instruction boundary

The prior historical type-bridge audit already established an authenticated operation palette for preserved Cicada sources: Caesar shift, OutGuess extraction, OpenPGP envelopes, BASE29, DH, protocol storage/tests, the solved p56 prime clock, and identity/transliteration on p57. It explicitly found no source-defined “sum/difference transform.” This audit tightens that observation to the exact H serialization and extends it across the full current historical text tree plus the recovered 2014 solver snippets.

The p6/p15/p28 and other current H results are therefore evidence only to the extent that **their own original artifact geometry or independently selected operand grammar motivates H**. Reusing “repository-canonical H” is not independent evidence that Cicada authored that operation.

## P6 local-geometry follow-up

Director #3436 tests the strongest remaining rescue allowed by the historical negative: perhaps p6 itself visually instructs H. The original p6 page does supply a **bilaterally symmetric four-word red title**, so grant the transform its strongest favorable premise and let that symmetry fix the mirror pairing `(0,3),(1,2)` over the other two perfect matchings.

That still does not identify canonical H. Before reading any H output or matched transfer, charge four binary presentation choices left unlabeled by the image:

- traverse the nested mirror pairs outer→inner or inner→outer;
- orient subtraction left−right or right−left;
- emit differences first or sums first;
- traverse the second channel by bouncing back through the nesting or in the same direction.

This leaves **16 distinct source-compatible presentations** even after the mirror pairing is granted. Canonical `H4=[d03,d12,s12,s03]` is exactly one member: outer→inner, left−right, difference-first, bounce. The page contains no arithmetic labels or directional marks that select those four choices. Therefore p6 local geometry does **not** authenticate canonical H, and the prospective matched-object transfer remains unopened.

This is a stronger causal negative than the historical audit alone: current p6 H equalities remain reproducible arithmetic identities, but they cannot be promoted on the claim that the visible frame uniquely instructs the transform. Reproducer: [`sims/lp2_p6_h_geometry_identifiability_sft.cjs`](../sims/lp2_p6_h_geometry_identifiability_sft.cjs).

## Serialization-free successor: the p6/p50 state set survives

Director #3439 separates the part of p6 H that depends on unlicensed serialization from the part that is invariant across all 16 locally compatible presentations. For printed widths `[4,1,4,2]`, visible mirror pairing alone gives pair blocks

```text
outer (4,2): {|difference|,sum}={2,6}
inner (1,4): {|difference|,sum}={3,5}.
```

The unordered block invariant `{{2,6},{3,5}}` exactly equals the independently derived p50 strict-support coordinate blocks from `[3,5,6,2]`. Across the manuscript's three complete four-word red spans, only p6 has this invariant; p23 gives `{{3,7},{3,9}}` and p54 gives `{{1,3},{2,6}}`.

So the negative here applies to **canonical H serialization**, not to all state information obtained from the visibly paired title. The p6→p50 support-coordinate match survives as a serialization-free mirror-pair relation. It remains post-discovery and is not a cipher inverse. Reproducer: [`sims/lp2_p6_mirror_invariant_p50_support_sft.cjs`](../sims/lp2_p6_mirror_invariant_p50_support_sft.cjs).

> **Local p6 selector found later on 28 November:** the p6 red13 object now supplies a source-local reason to try outside-in H-like arithmetic even though no historical Cicada-wide precedent was found. Its 180° mirror pairs have normalized half-gaps `[6,5,4,3,2,1]`; reversal-pairing the bracketed title widths `[4,1,4,2]` supplies the complementary difference/sum magnitudes needed for exactly `1..6=[1,K,e,q,g,a]`. This selects the *outside-in pairing/magnitude idea* locally, not the signed H4 output serialization or its use on other pages. See [p6 mirror half-gap ladder](lp2-p6-mirror-halfgap-h-ladder.md).

## Decision

**Negative historical fork.** No bounded first-party or contemporaneous source currently fixes the exact outside-in H transform, its direction, serialization, and modulo29 arithmetic before the modern LP2 constructions.

Preserve exact H-based structural equalities and local positive controls. Downgrade only the provenance claim: H is not presently authenticated as a general Cicada operation. For promotion, each route must supply a local visual/source reason for outside-in pairing and for the difference/sum channel order, or a newly recovered historical source must do so.

This decision is consistent with the earlier fixed-H transfer gate: H/H^-1 failed as a manuscript-wide solved-page decoder and was ordinary inside a charged affine family, while remaining locally reproducible on selected p28/p0 structures. The historical negative strengthens the requirement for a local selector; it does not invalidate those arithmetic identities.

## Repository witnesses

- `resources/historical/` — bounded 83-blob / 69-text-artifact historical corpus.
- `resources/external/2012-2013-arithmetic-operation-register-note.md`
- `resources/external/2013-tcp-server-signed-source.md`
- `resources/external/2013-instar-xor-source.md`
- `resources/historical/lp1-outguess-2014-source-map.md`
- `resources/external/2014-irc-shared/`
- `im-results/lp2-readout-here-historical-type-bridge-gate.md`
- `im-results/lp2-h-outer-pair-transfer-gate.md`
