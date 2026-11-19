# READ OUT receiver centers form a 43-step p0 symmetry around the p28 center

**Agent39, 19 November 2026. Classification: source-linked geometric echo with one prospective boundary holdout. No plaintext, key stream, or general cipher is claimed.**

## Frozen upstream selections

Director #1706 independently fixed two p0 receiver objects before the relation in this report was noticed.

Using the promoted whole-word GP0 -> zero-based p50 address -> conventional-base60 value grammar:

- `READ=55 -> p50[55] -> 80`
- `OUT=20 -> p50[20] -> 102`
- `READOUT=75 -> p50[75] -> 177`

The split branch closes the whole-word-bounded p0 interval **80..102**, whose exact center is **91** and whose center rune is F. The whole branch selects center **177**, giving the whole-word-bounded 23-rune interval **166..188**, also center F.

The p28 source object used by the READ OUT candidate has **269 runes**, so its exact zero-based center is **134**.

These choices were all already committed before the following arithmetic was inspected.

## Exact center relation

The two independently selected p0 receiver centers obey

```
(91 + 177) / 2 = 134
(177 - 91) / 2 = 43
```

or equivalently

```
134 - 43 = 91
134 + 43 = 177
```

Thus the receiver pair is symmetric around the exact p28 center from which the READ OUT candidate originates.

The archived, signature-verified 2016 message contains **43 natural-language words** under the repository's established source tokenization. A naive alphabetic-substring regex produces 45 only because the hexadecimal key identifier `7A35090F` contributes spurious fragments A and F. The exact signed-word count therefore matches the receiver half-distance.

This does **not** make the signed message's 43 words a source-selected operand. The authenticated sentence says that *Liber Primus* words are the map; earlier Director work correctly rejected treating the signed message's own 43-word count as an automatically licensed 43-unit key. The 43 interpretation here was recognized after the receiver centers were known and is classified accordingly.

Several nearby source counts fail the exact displacement relation: GP alphabet size29, LP2 page count58, p28 printed-word count59, the 16-word map/road/direction sentence, and the naive45 alphabetic-substring count.

## Prospective 43-step holdout

After the equality above was frozen, the same arithmetic progression was extended exactly one step outward on each side before inspecting those p0 positions:

```
48, 91, 134, 177, 220
```

The untouched outer positions produce a source-visible boundary pattern:

| p0 offset | source property |
|---:|---|
| 48 | printed-word end |
| 91 | F |
| 134 | printed-word end |
| 177 | F |
| 220 | printed-word end |

So the frozen five-term progression is exactly:

```
WORD_END, F, WORD_END, F, WORD_END
```

The two prospective positions **48 and 220 are both printed-word ends**. The midpoint p0 offset134 is also a word end. No Caesar shift, GP arithmetic, language model, or alternate step was used to obtain this pattern.

A complete manuscript census charging every possible positive integer center/step pair finds only five instances of this exact five-node source predicate:

- p0: center134, step43
- p11: center151, step49
- p29: center137, step47
- p33: center124, step29
- p36: center201, step11

The p0 instance is therefore unique on its page. This census is descriptive rather than an unconditional probability because the alternating predicate was specified after seeing the p0 holdout.

## Relation to original p0 artwork

A pre-existing original-image SFT independently proves that p0's two large black illustrations are near-pixel-identical **180-degree counterparts centered on the physical page**:

`sims/lp2_p0_artwork_rot180_symmetry_sft.py`.

The two selected 23-rune receiver spans also occupy the coarse physical line bands 4–5 and 8–9, which exchange as sets under the 12-line half-turn pairing. This makes a symmetric receiver interpretation visually plausible to a contemporary human solver.

The artwork result predates this report and is not counted as a new discovery here.

## Interpretation and next decision

The strongest current causal reading is:

```
p28 center134
    |
 READ OUT
    |
p0 receiver centers 91,177 = 134 +/- 43
    |
43-step outer holdout => END,F,END,F,END
```

This supplies a new source-visible explanation for why the whole and split READ OUT branches land on a paired p0 geometry. It also gives a concrete human-solvable symmetry rather than another unconstrained key search.

The unresolved premise is the meaning of **43**. The signed 2016 message provides the exact count and a words/map/direction instruction, but it does not explicitly tell the solver to use its own word count. No further 43-step recursion, cipher, or 43-unit key should be attempted unless another original clue authenticates that role.

## Reproduction

Run:

`node sims/lp2_readout_receiver_center43_symmetry_sft.cjs`

The SFT re-derives the READ/OUT/READOUT p50 outputs, both p0 receiver centers, p28 center134, the exact43 natural-word signed-source count, the frozen outward holdout, and the complete manuscript center/step census.
