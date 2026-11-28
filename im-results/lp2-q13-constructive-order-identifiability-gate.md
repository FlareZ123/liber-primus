# q13 pair-feedback order and opposite-ciphertext traversal — Director #3259 / #3264

**Decision (28 November 2026):** Exact algebra reduces the invertible-matrix version of *backward ciphertext feedback* to the previously tested previous-ciphertext receiver with **plaintext delayed by one digraph**. It is **not** a fixed-coordinate reversal gauge: the same-position models are genuinely different, and an explicit 52-block counterexample is supplied below. The only backward matrices outside the invertible algebraic reduction are **nonzero rank-one matrices** (the zero-matrix case is the already-tested no-feedback receiver). None is selected by an authentic LP2 instruction. No unknown plaintext, authenticated key or new original fit is claimed.

## Existing model: what its negative result actually establishes

For consecutive GP29 ciphertext digraphs `C_i ∈ GF(29)^2`, the earlier ordinary-clock model fixes the *physical* predecessor:

```
C_i = pi_{i mod 13}(P_i) + A_{i mod 13} C_{i-1}    (mod 29)
```

Each of 13 lanes has its own arbitrary 841-way digraph permutation `pi_r` and independently chosen 2×2 matrix `A_r`. The [all-matrix original-input projective search](lp2-digraph-arbitrary-bijection-linear-feedback-gate.md#authentic-key-length-periodic-extension-all-matrices-and-all-permutations-per-lane) grants all **707,281** matrices, including singular ones, both pair phases and arbitrary lane substitutions. On the original 12,956 runes, the strongest original individual residual collision rate is below every matched native lane; every lane's optimal support lower bound is at least **258**, excluding a fixed 256-symbol residual codebook under that fixed receiver. Planted native controls infer 13/13 matrices uniquely and decode the held pairs *when supplied an oracle pair permutation*. No native q13 plaintext, selector or table was obtained.

The [arbitrary plaintext transport bound](lp2-digraph-arbitrary-bijection-linear-feedback-gate.md#arbitrary-plaintext-transport-exact-weighted-collision-capacity-agent40-27-november) is only a relaxed necessary histogram-capacity test: q13 passes that bound, but has no selected transport inverse.

## New theorem: backwards ciphertext generation with invertible feedback

A genuinely opposite-direction sender has the **successor** as its feedback operand:

```
C_i = pi_{i mod 13}(P_i) + B_{i mod 13} C_{i+1}.  (1)
```

This is distinct from merely reading plaintext backwards while retaining the fixed predecessor. Suppose each `B_r` is invertible. For every interior transition define `j=i+1`, `A'_{r+1}=B_r^{-1}`, `Q_j=P_{j-1}`, and `sigma_{r+1}(x)=-B_r^{-1}pi_r(x)` (indices modulo13). Then

```
C_j = sigma_{j mod 13}(Q_j) + A'_{j mod 13} C_{j-1}.       (2)
```

Because `-B_r^{-1}` is bijective, `sigma` remains an arbitrary 841-way permutation. More strongly, the backward residual `D_i=C_i-B_r C_{i+1}` and the previous-feedback residual `E_{i+1}=C_{i+1}-B_r^{-1}C_i` obey **`D_i=-B_r E_{i+1}`**. Thus their complete equality partitions, collision counts and support sizes are **identical**, not merely similar. No re-estimation of original ciphertext collision maxima is needed for this invertible subclass. The q13 lane label changes from r to r+1, already free in the original search. The boundary changes from a free initial pair to a free terminal pair, leaving the same n−1 interior transitions.

Of all 29⁴=707,281 matrices, `|GL(2,29)|=(29²−1)(29²−29)=682,080` are invertible. The other 25,201 comprise 25,200 nonzero rank-one matrices plus zero. The zero case `C_i=pi_r(P_i)` is a stationary no-feedback digraph substitution already covered by `A_r=0`. Only a genuine rank-one backwards lane is outside this **universal state-inversion identity**. This is a statement about exact model inclusion *after one-block plaintext transport*. It does **not** identify a native plaintext or automatically transfer every finite English calibration without checking its one-block endpoint alignment.

## Exact counterexample: same-position direction is not a gauge

Take 52 GP29 digraphs and `C_52=(0,0)`; let all `C_i=(0,0)` except

```
C_5=C_6=(1,0), C_18=C_19=(2,0),
C_31=C_32=(3,0), C_44=C_45=(4,0).
```

Choose `B_r=I`, `pi_r=identity`, and `P_i=C_i-C_{i+1}`. This is an exact backwards sender. At the four positions `i=5,18,31,44` (all lane5), `P_i=0` and `C_{i-1}=0`, but `C_i` takes four different values. In the *same-position* predecessor model, `C_i-A_5 C_{i-1}=C_i` cannot equal the single required `pi_5(0)` for any `A_5` or arbitrary lane permutation. The sender direction **cannot** be equated by simply relabeling lanes while fixing the plaintext coordinate.

Nevertheless, set `Q_{i+1}=P_i`, `A'=I`, `sigma=-identity`. Then every predecessor transition exactly replays. This demonstrates both halves of the theorem and corrects the earlier unqualified description of plaintext reversal as a full positional gauge. Reversing a plaintext tape preserves per-lane *histograms* up to lane relabeling and within-pair swap, but generally changes **which repeated plaintext positions align with residual equalities**. The previously negative native collision-capacity screen remains a necessary bound under such histogram-preserving transformations; it is not an exact located-crib proof.

## Direction selectors in the actual source: what survives

The original p40–p53 artwork uses mirrored ornamental trees around the runes. The genuine source-selected horizontal reflection `column c→7−c` belongs to the **32×8 numeric panel** on p49–p51, not the chapter's cipher pair clock; moving it into `C_i`/ `C_{i+1}` is an untyped additional operation.

A potentially misleading clue is the striking red **up-arrow-shaped** glyph at the end of the sixth rune line of original `70.jpg` (physical p53). In Gematria Primus it is simply the ordinary **Tiwaz rune `ᛏ`**, which is shaped like an arrow. The canonical page text includes it exactly after the stop `...ᛞᛗᛖ.ᛏ/`, before the red continuation beginning `ᛈᚹᛇ...`. It is an inline red rune and a red/black transition, **not an independent direction arrow**. The p50 rune-free page makes this physical p53 the 53rd rune-bearing section at zero-based transcription index52; direct physical-image comparison avoids the indexing trap.

Cicada did demonstrably employ byte reversal in image carriers: the original LP1 `05.jpg` includes a reversed JPEG copy and intermediate numeric payload [source corpus](../resources/liber-primus/README.md#jpeg-container-details); a 2014 Onion3 JPEG was also stored with bytes reversed, recoverable from JPEG header/trailer markers ([historical walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29)). Those cases are *self-identifying file-format reversals*, not a rune-cipher instruction or a selector for a 13-lane terminal-IV feedback equation.

**Current source verdict:** no original p40–p53 mark, period-authentic instruction or known ciphertext anchor ties backward *pair feedback*, its 13-lane period, its terminal state, and a rank-one matrix together. Running a fresh rank-one original sweep would introduce an unselected cipher after the invertible subclass has been shown redundant. Defer it until a real GP text-direction/operand instruction or an independently placed native crib identifies the receiver.

## Reproduction / next decision

Run `python3 sims/lp2_q13_reverse_feedback_identity_sft.py` with Python ≥3.8 (stdlib only). It exactly checks 104 seeded independent backward transitions across all 13 lanes, their converted forward equations, the full matrix-count theorem by enumeration, and the 52-block same-position counterexample. It does **not** fit original LP2 or claim anything from a synthetic plant.

If a future source **independently selects a backwards feedback state**, first test whether its matrix is invertible; do not rerun the already-covered 682,080-matrix subclass as a new cipher. Only a selected rank-one action merits new directional projective-incidence inference, matched native controls and a frozen original continuation. Until then, retire this direction branch rather than substituting another arbitrary permutation.
