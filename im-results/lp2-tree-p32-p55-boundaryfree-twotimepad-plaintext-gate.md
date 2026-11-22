# Art-linked p32/p55: direct two-plaintext recovery attempt without printed-word preservation

**Agent8, 18 November 2026. Original-cipher negative for a source-linked, postselected no-skip placement; no unknown plaintext or authentic key recovered.** This investigates an actual decoder for the distinct possibility left open by the [earlier all-secret printed-word dictionary obstruction](lp2-p32-p55-shared-tree-pad-lexicon-gate.md): that two illustrated manuscript pages reuse one additive rune pad but have **plaintext word boundaries unrelated to the printed punctuation**. The tested original 76-rune pair does not behave like independently held-out native-English positive controls. An exact joint-language inverse returns attractive word fragments even for invalid pad matches, which rules out treating those fragments as plaintext.

## Source choice and source limitation

Original source scan `49.jpg` p32 contains a blurred tree, and `72.jpg` p55 contains its pale sharp counterpart. The [image alignment](lp2-p32-p55-blurred-tree-correspondence.md) singles out this physical pair before cryptanalysis. Source p32 prints **121** GP29 runes and p55 **76**, the latter beginning with a one-rune carry from physical p54. The [earlier conditional difference report](lp2-tree-p32-p55-offset19-conditional-samepad.md) selected a p32 starting offset of **19**, maximizing a 46-offset IoC comparison after seeing the original ciphertext. That choice is expressly **postselected**, so it has no independent source-key authority. The present test freezes that exact placement and does not re-optimize it.

For the physical source vectors, define

```text
D[i] = (C32[19+i] - C55[i]) mod 29, i=0..75.
```

Under an identical additive per-symbol key `K[i]` and equal page Caesar phases, `C32=P32+K`, `C55=P55+K`, so `D=P32−P55`. The unknown key cancels **even if every K[i] is unrelated to every other**. That would allow *both* underlying plaintexts to be recovered jointly from their English statistics without knowing K. This is a strong, reversible candidate if it works. There is no manuscript instruction authenticating a reused pad, equal phases, the offset, no literal-F bypass, or the English/plain-rune domain.

## Actual constructive inverse

The [Windows Node22 CommonJS source](../sims/lp2_tree_twotimepad_boundaryfree_viterbi_sft.cjs) reads the canonical 29-rune original page indices and the pinned [Shakespeare first 300k English reference](../resources/control/shakespeare_first300k.txt). It normalizes that source text to GP29 with documented simplified spelling rules and uses the first 67% for training. A smooth, interpolated GP29 tetragram model has three-symbol context, so an **exact Viterbi dynamic program** over all `29³=24,389` hidden states and 29 next-rune possibilities maximizes

```text
log Pr(P32) + log Pr(P55)
subject to P55[i] = P32[i] - D[i] (mod29).
```

The decoder uses **no original printed word breaks**, and its returned optimum is global for the fixed tetragram score, rather than the best result of an arbitrary search seed. It prints *both* candidate text streams and their unconstrained joint score. Its fixed English controls are held out from the training corpus and form two genuine 76-rune GP-encoded English passages encrypted by the same nonconstant GP29 additive pad `K[i]=(7i²+11i+3+j) mod29`. The pad cancels exactly. Eight fixed independent plaintext-pair controls vary their held-out source positions and key phase `j`.

As an original-dependent null, **13 circular rotations** of physical p55's **unchanged rune sequence** shift the paired start by fixed amounts `1,7,13,...,73` while preserving the source's intrinsic symbol order and all but one neighboring transition. This preserves considerably more original ciphertext structure than shuffling p55's rune multiset.

## Original result and comparison

| Original/source-shaped class | Source cases | Exact maximized paired-English score (larger is better) |
| --- | ---: | --- |
| Real p32[19..94] paired with real p55 | **1** | **−271.3850760580** |
| Held-out genuine English pair controls | **8** | **−270.1160 to −256.4527** |
| Original p55 circular-rotation controls | **13** | **−279.7503 to −267.8711** |

**Every one of the eight positive English controls scores higher than the unmodified original.** Five of the 13 source-preserving rotations also score higher than the original. The real score therefore does not separate from this modestly calibrated wrong-alignment null, and it falls below even the weakest held-out true-English pair under this chosen model.

The exact original Viterbi output is:

```text
p32 candidate: AUEPLYMASOLUMNIANAYLOODASTHEGOODHONELIFEBEIANSECONSEALYTHECNGCOMINASCALLFOLLOUCORN
p55 candidate: ERUNGMANCETOWINSGOODUISHOWYOUARENDUSHOWNGINTHEEASUREDANDHIMSMALICESMYHANDERLOUCE
```

The apparent fragments `THEGOOD`, `HOWYOUARE` and `FOLLOW` are **optimizer artefacts**, not decrypted text. The held-out positives reveal why: despite genuine English input under a key that cancels perfectly, this purely character-level Viterbi model exactly identifies between **7 and 37 of 76 positions per passage** across eight controls. It can recover convincing short windows while substituting other fluent-looking substrings. Scores, not eye-catching fragments, determine the decision.

The original-input and positive-control code was executed unchanged on the **Windows GitHub Actions runner, passing [run 44298910732](https://github.com/FlareZ123/liber-primus/actions/runs/44298910732)**, taking about five seconds for all 22 complete 76-rune paired inverses. The source SFT pins the exact original score and original source lengths; the manual runner is [here](../.github/workflows/agent8-tree-twotimepad-viterbi.yml).

## Cryptanalytic decision

This is a serious **attempt to decrypt two previously unsolved source-linked passages** under a single key-free paired inverse. Unlike the older dictionary test, it accommodates *completely changed plaintext word breaks* and optimizes entire, genuinely unknown text. It fails to recover independently intelligible p32 or p55 plaintext and yields no score evidence of the proposed shared additive pad at the previously preferred offset19.

**Do not advance this p32/p55 two-time-pad branch on the old IoC coincidence or the model-generated English fragments.** The result is not an all-key impossibility theorem: a different key-consumption clock with plaintext-F escapes, page-dependent Caesar phase, original-specified noncontiguous alignment, alternate plaintext language or more powerful language prior may behave differently. Those extensions require an independent manuscript- or historical-source selector. This result does not affect the [strong source-image association](lp2-p32-p55-blurred-tree-correspondence.md), which remains a real visual clue without an authenticated plaintext operation. Keep the complete LP2 unknown plaintext unrecovered.
