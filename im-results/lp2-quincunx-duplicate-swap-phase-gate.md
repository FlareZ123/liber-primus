# Five-dot quincunx duplicate relocation: source-phase and injectivity obstruction

**Agent8, 22 November 2026. Classification: negative original-cipher architecture decision.** No previously unknown Liber Primus plaintext, key or destination recovered. This is an independent nonclaiming contribution to the active anti-doublet Director #2083, after closing Agent8's original assigned #2216.

## Concrete author-visible premise and locked operation

The original physical p7/p23/p56 five-dot drawings and five original red words on p7 invite the *hypothesis* of a five-position cyclic encoder. Unknown LP2 has 86 original same-page adjacent-equal rune transitions but also 72 equality events at lag five inside the same original physical line and word fragment. A plausible short explanation is to move an otherwise adjacent repeated glyph forward to create a five-back echo. This premise is speculative and was generated after the gross original rates were already known.

The exact [prospective phase contract](../workplace/agent8-quincunx-fivephase-duplicate-relocation-precommit.md), commit `f0cf95e`, was written before inspecting the original phase-conditioned observations:

1. Treat all 12,956 original p0..p55 GP29 runes as one continuous zero-based global position clock, without a page or word reset.
2. The center of the visible five-dot motif supplies the one exempt phase, `i mod 5 = 2`.
3. Traverse one time left to right. At a non-exempt phase, if `X[i]=X[i-1]`, swap `X[i]` with `X[i+4]`, provided that future rune exists. Otherwise leave everything untouched.
4. Retain every source word/line/page mask. Test the exact global phase rather than rotating phases after output.
5. Compare 1,000 fixed-seed GP29 manuscripts formed by Fisher–Yates shuffling *within each original page*, freezing all original page lengths, source rune histograms and physical word/line/lag-five opportunity masks.

This is a simple one-pass model capable in principle of shifting some unwanted adjacent repeats to lag-five sites. It is **not** an authenticated original Cicada encryption instruction, and its future swap introduces a possible noninjective channel that must be checked directly.

The preregistered distinctive original predictions are: remaining adjacent repeats should be strongly enriched in **phase2**, and within-fragment lag-five hits should be depleted in **phase1**, since a 4-step relocation from any eligible trigger cannot land in phase1.

## Decisive original phase observations

The immutable corpus has **86** same-page adjacent-repeat events, binned by the *second rune's global index mod5*:

`[18,21,16,11,20]`.

Only **16** occur in the proposed exempt phase2. This is **18.6%** of the original repeats, rather than the concentration expected when only that 1/5 phase systematically bypasses repair.

The original has **1,645** eligible within-physical-line and within-printed-word-fragment lag-five comparisons; **72** are equal, with ending global phase counts:

`[14,16,16,14,12]`.

The supposed forbidden arrival phase1 contains **16** hits, or 22.2% of all hits. These data are contrary to the model's two independently frozen directional predictions.

The source-exact [CJS SFT](../sims/lp2_quincunx_duplicate_relocation_phase_gate_sft.cjs) was committed before the calibration and passed Windows Node22 [run 45012660597](https://github.com/FlareZ123/liber-primus/actions/runs/45012660597). Its 1,000 shuffled-source tests return:

| Observable (original) | Original | Page-preserving shuffled mean [2.5%,97.5%] | Shuffled then frozen relocation mean [2.5%,97.5%] |
|---|---:|---:|---:|
| Same-page adjacent equalities | **86** | 439.40 [400,480] | 99.32 [81,118] |
| Adjacent equalities in phase2 | **16** | 87.80 [70,106] | 87.58 [70,106] |
| Same-line/word lag-five equalities | **72** | 56.08 [43,72] | 98.76 [81,119] |
| Lag-five equalities ending in phase1 | **16** | 11.00 [5,18] | 10.95 [5,18] |

The tempting overall doublet match, 86 observed versus 99 simulated, was already what motivated the design. On the original **held-out phase** the model predicts approximately 88 center-phase doublets, more than five times the actual 16. On the original lag-five opportunities the postrepair simulation overshoots 72 by about 27 events. Thus a five-dot phase-2 one-pass duplicate relocation is decisively inconsistent with the original source at the very properties that distinguish it from other low-repeat encoders. The 1,000 simulated samples are finite page-histogram-preserving controls, not an IID proof.

## A direct mathematical no-go, independent of language fitting

Even without the original phase mismatch, the proposed filter cannot be decrypted uniquely from its ciphertext. These two *distinct six-rune input sequences* both map to the same output under the exact frozen one-pass operation:

```
X = [3,3,4,5,6,7]  →  [3,7,4,5,6,3]
Y = [3,7,4,5,6,3]  →  [3,7,4,5,6,3]
```

At index1 in X, the repeated 3 triggers a swap with index5; in Y there is no duplicate at that site, so it is unchanged. The SFT asserts the collision exactly. Therefore **no standalone inverse exists without an additional source-supplied sideband** recording swap decisions, even if this implementation had replicated the original source statistics. A deterministic reversible swap algorithm whose trigger depends only on current ciphertext would be a separate mechanism and needs a separate independently visible instruction.

## Research decision

Retire the exact **global-phase-2, one-pass, four-position-forward duplicate relocation** as a standalone LP2 encryption/decipherment explanation. Its striking gross anti-doublet match is a discovery-conditioned fit; the phase distribution and independent lag-five result fail, and the operation is mathematically noninjective. Keep the stronger original 86-doublet and 72-lag-five measurements as independent constraints, without asserting that one source-level state controls them both.

An authentic cipher remains free to use evolving alphabets, a reversible anti-repeat transducer, an output alphabet selected by external authenticated material or a multi-symbol payload. Any new proposal should specify the full reversible state and a source-visible clock before testing the same original ciphertext.
