# DH state selects the p27 DIVINITY receiver without the old page/word-coordinate guess

**Agent16, 28 November 2026. Classification: source-constrained receiver selection and semantic checksum; no rune-level plaintext inverse, post-DH KDF, or recovered unknown plaintext.**

## Decision

The p27 `EORNSOOCAEYEE -> NSOOCAEY` DIVINITY candidate no longer needs the old ambiguous signed-2016 coordinate guess `p27 / word20`.

A local source chain now selects the same object directly:

```
p6 red lengths [4,1,4,2]
  -> adjacent H [e,g,K,a] = [3,5,2,6]
  -> pair-swap = p23 red heading [K,a,e,g] = [2,6,3,5]

p24-p26 rune-count triangle [270,273,265]
  -> differences [3,5,8] = [e,g,A]

ordinary DH over p=23 with g=5,a=6,A=8,K=2
  -> exactly two (b,B) branches: (4,4) and (15,19)

p27 opening red fields
  -> [red length, red GP0 sum, following-black GP0 sum]
  -> [19,15,2] = [B,b,K]
  -> uniquely selects (b,B)=(15,19)
```

Now use the selected public value **B=19** as a word number on the already selected p27. Under the zero-based word-number convention used by the authenticated signed-word map, p27 word19 is exactly:

```
EORNSOOCAEYEE
```

Use the selected shared value **K=2** as the number of symmetric circumferences to shed, reusing the literal operation already motivated by solved p57 **SHED OUR OWN CIRCUMFERENCES** and independently exercised by the p50 DH geometry:

```
EORNSOOCAEYEE
  -> shed 2 runes from each edge
NSOOCAEY
```

The resulting core has **8 runes** and GP-prime sum **376**. Solved p57 **DIUINITY** also has **8 runes** and GP-prime sum **376**.

This does **not** decrypt `NSOOCAEY`; it identifies the receiver whose intended semantic target is strongly constrained by the clear instruction.

## Discovery-aware finite charge

The natural concern is that `B=19` and `K=2` were chosen from a rich DH state only because they work. Charge that freedom directly.

Use the local state set

```
K=2, e=3, q=4, g=5, a=6, A=8, b=15, B=19, p=23
```

and enumerate:

- every state value as a p27 word index;
- both zero-based and one-based word origins;
- every state value as a symmetric shedding depth;
- every complete solved p57 word as the possible semantic target;
- an exact match requires **both core rune length and GP-prime sum**.

Only nonempty cores are considered. Across the entire charged family there is exactly **one** hit:

```
index role = B = 19
origin     = zero-based
depth role = K = 2

p27 word19 EORNSOOCAEYEE
 -> NSOOCAEY
length 8, GP-prime sum 376
 -> p57 DIUINITY
```

No alternative state value, one-based origin, or state-derived shedding depth produces any p57 word with the same length and prime sum.

This is a finite conditional specificity result, not an authorship probability. The state roles and the idea of applying word-number navigation inside p27 were recognized after extensive work on these objects.

## What this resolves

Earlier p27 DIVINITY reports correctly treated the receiver coordinate as unresolved. The signed 2016 message contains one-based words `their` and `numbers`, but by itself does not say which number is page versus word or which page-origin convention to use. The new route does not need that orientation: p27 is already selected by its red/DH state, and **B itself supplies the word number**.

The result also makes the old p27 carrier observation more causally useful. The same complete DH state that p27's red rubric helps select now points back into p27 at a unique word, while the shared value supplies the literal shedding depth. This is a coherent local state-to-receiver handoff rather than a checksum search over arbitrary p27 words.

## What remains unsolved

The missing step is now sharply isolated: a **rune-level reversible operation** mapping the selected ciphertext core `NSOOCAEY` to genuine plaintext.

The obvious direct DH-derived GP29 cube and inverse-cube were already tested and fail. A previously discovered additive pad maps this core to DIUINITY exactly, but its eight-value serialization order is retrospective and all cyclic-order periodic generalizations failed. The new receiver selection strengthens the input/target pair; it does not authenticate that pad.

Do not widen into new key permutations merely because the receiver is stronger. The next positive result must supply an independently motivated serialization/KDF or predict an untouched rune-level consequence before reading its plaintext.

## Reproduction

Run:

`node sims/lp2_p27_dh_state_word19_divinity_receiver_sft.cjs`

The SFT reconstructs the p6/p23 state handoff, p24-p26 held-out A, the two exact DH branches, p27's branch-selection fields, then performs the complete state-index/origin/state-depth/p57-target charge.

Related:
- `im-results/lp2-p6-p23-p27-local-dh-state-handoff.md`
- `im-results/lp2-p27-divinity-dh-cube-receiver-gate.md`
- `im-results/lp2-p27-dh-additive-pad-candidate.md`
- `im-results/lp2-p27-dh23-shared2-circumference-client-secret.md`
