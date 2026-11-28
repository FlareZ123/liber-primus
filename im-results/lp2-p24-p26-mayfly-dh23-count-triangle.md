# P24–26 mayfly rune-count triangle reproduces DH23 e,g,A

**Agent37, 28 November 2026. Classification: new source-level cross-object state lock; no unknown plaintext or cipher receiver recovered.**

## Result

The original p24, p25 and p26 pages form one source-delimited visual family: all three carry the same independently identified mayfly plate artwork. Their exact original GP29 rune counts are:

```
p24 = 270
p25 = 273
p26 = 265
```

The three pairwise absolute differences are therefore:

```
|p24-p25| = 3
|p24-p26| = 5
|p25-p26| = 8
```

These are exactly **[e,g,A] = [3,5,8]** from the independently reconstructed p28 Diffie-Hellman state:

```
p=23, g=5, a=6, b=15, A=8, B=19, K=2
e = g-K = 3
```

The correspondence is edge-specific rather than merely an unordered set:

- p24↔p25 count difference = **3 = e**;
- p24↔p26 count difference = **5 = g**;
- p25↔p26 count difference = **8 = A**.

No plaintext was used to obtain any page count or the p28 tuple.

## Why the p24↔p26 edge is especially constrained

The quantitative artwork study independently established that p24 and p26 have **exactly pixel-identical** left and right mayfly decoration crops; p25 is the same motif with a small (+1,+1) registration difference. The exact-copy pair is therefore p24↔p26.

That exact-copy pair has rune-count difference **5**. Independently:

- the recovered p28 state has generator **g=5**;
- the external mayfly plate identifies the image as Figure4 **specimen5**, *Ephemerella ignita*;
- the chapter opener p23 visibly prints **five black dots**.

Thus the same-art p24↔p26 edge is tied to 5 in three separate source registers: page-length difference, image-source specimen label and visible dot count, while p28 independently labels the same value as DH generator g.

The prior mayfly report already noted the specimen5 / five-dot agreement. The **new** observation is the page-count triangle and its exact [e,g,A] identification.

## Complete contiguous-triple control

The state values [3,5,8] also happen to be consecutive Fibonacci values, so that mnemonic by itself is not evidence for DH. The relevant control asks the exact source question: among all **54 contiguous three-page windows** in original p0–p55, how often do the three pairwise absolute rune-count differences equal the fixed set {3,5,8}?

Exactly one window survives:

```
p24,p25,p26 -> counts 270,273,265 -> differences 3,5,8.
```

No other contiguous triple has that difference set.

This uniqueness is conditional on the already source-selected contiguous mayfly chapter; arbitrary noncontiguous triples are not rare and are not evidence. The manuscript artwork supplies the reason to evaluate this particular consecutive triple.

## Relation to the new Rune-Poem / oak navigation route

A separate source path now points into the same chapter without using these count differences:

- the signed-2016 carrier and p32/p55 share the common oak stock drawing;
- oak -> Rune-Poem **Ac**, GP0=24, GP prime=97;
- p32 has exactly 121 runes, satisfying **97+24=121**, while p55 does not;
- Ac's ordinary stanza ordinal25 / GP0 value24 points naturally to the 25th LP2 page, physical p24.

Thus the p32 oak checksum selects p24 before the p24–26 DH-state triangle is examined. This reduces, but does not eliminate, post-selection risk.

See `im-results/lp2-rune-poem-artwork-ordinal-navigation-gate.md`.

## Independent full-state reconstruction without reading p28

The count triangle can now be used as a finite **independent state-recovery gate** when combined only with source objects outside p28.

The source inputs are:

- **p=23** from the solved p57 terminal 23-dot mark, which is the unique 23-dot large-punctuation object in LP2.
- **13** from the red 13-dot punctuation terminating p22 immediately before the p23–26 illustrated chapter. Thirteen-dot punctuation is common globally, so only its local boundary role is used.
- **g=5** from the chapter's redundant source evidence: p23 has five black dots, the independently registered mayfly is Figure4 specimen5, and the exact-copy p24↔p26 art pair has rune-count difference5.
- The remaining two count-triangle values are **{3,8}**.

Charge the plausible state assignment instead of assuming it:

1. assign {3,8} to `(e,A)` in both orders;
2. define `K = +(g-e)` or `K = -(g-e)` modulo23;
3. interpret the local 13 as either `b-K=13` or `b+K=13`;
4. enumerate every nonzero private exponent `a=1..22`;
5. require the ordinary DH equations
   `g^a=A`, `B=g^b`, and `A^b=B^a=K (mod23)`.

Exactly **one** candidate survives the complete charged family:

```
p = 23
e = 3
g = 5
a = 6
b = 15
A = 8
B = 19
K = 2

K = g-e
b-K = 13
```

This is exactly the independently reconstructed p28 line6 DH state, but **no p28 rune, fragment, line number or plaintext is used by this reconstruction**.

The source-fixed `g=5` discriminator matters. If the three values 3,5,8 are allowed to permute freely over `e,g,A` while also charging both K signs and both 13 relations, two rival g=3 solutions survive in addition to the historical tuple. The external specimen5 / five-dot / exact-copy-edge evidence is therefore doing real selection work rather than merely decorating a prechosen tuple.

The relations `e=g-K` and `b-K=13` were recognized after the DH state was already known elsewhere. This is therefore a **post-discovery independent reconstruction**, not a claim that a blind 2014 solver was already instructed to write those equations. Its evidential value is narrower and strong: four physically separate original-source registers—p22 punctuation, p23–26 art/counts, p57 punctuation, and p28 DH text—encode one internally consistent state.

## Strongest rival

Page rune counts depend on typography and wrapping, so small differences among neighboring illustrated pages can occur accidentally. The three values 3,5,8 are also visually attractive Fibonacci numbers. The p28 variable `e=3` is a derived state value (`g-K`), while g=5 and A=8 are primary DH values. The relation was recognized after both the page lengths and DH state were known.

Therefore this is **not** a calibrated chance probability and not yet proof that Cicada encoded the DH state in page lengths.

What makes it worth preserving is the concentration of independent source constraints: the exact same-art three-page family, exact-copy p24/p26 pair, external specimen5 label, p23 five-dot count, independently source-derived DH23 state and uniqueness among contiguous page triples all agree without fitting ciphertext plaintext.

## Research consequence

Treat p24–26 plus the adjacent p22 boundary and solved p57 terminal mark as a **second original-manuscript reconstruction of the complete p28 DH state candidate**. The triangle itself serializes [e,g,A]; the charged source frame uniquely recovers the remaining a,b,B,K once g=5 is source-fixed. This strengthens the hypothesis that the p28 DH tuple is a real organizing register rather than an isolated arithmetic reconstruction.

Do not infer a new additive/multiplicative key from 3,5,8. The useful next test is source-path discovery: identify whether p24/p25/p26 artwork geometry or an authenticated instruction assigns a direction/order to the three edge labels. Without such an opcode, the triangle is state serialization, not a cipher receiver.

## Reproduction

- Count-triangle census: `sims/lp2_p24_26_mayfly_dh23_count_triangle_sft.cjs`.
- Original mayfly source and pixel identity: `im-results/lp2-p23-26-original-art-source-gate.md`.
- Independent p28 DH reconstruction: `im-results/lp2-p28-dh-line6-source-reconstruction.md`.
