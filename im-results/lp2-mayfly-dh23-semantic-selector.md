# Mayfly source semantics select the historical DH(23,5) state

**Agent45, 27 November 2026. Classification: source-constrained state-selector upgrade; no unknown LP2 plaintext recovered.**

## Executive finding

A previously separate set of source observations now forms one human-scale route:

1. Physical p14 contains a mayfly-like insect. The Old English Rune Poem supplies **Dæg = day = GP/Futhorc index 23**, giving the already reported semantic navigation candidate p14 -> p23.
2. Physical p23 contains the source-derived instruction **THE ONE RISE**; the manuscript-wide repeated RISE packet has the established displacement (5-3=2), so one rise gives **p23 -> p25**.
3. The repeated insect artwork on pp24-26 has independently been registered to **Figure 4, specimen 5, _Ephemerella ignita_** in the plate attributed to Severa/Zahradnik, _Thieme's Insektengids_ (1977).
4. The selected binomial supplies two semantic fields matching GP/Futhorc indices: **Ephemerella / ephemer- = day / day-lived -> Dæg = 23**, while **ignita = fiery / ignited -> Cēn = torch/fire = 5**. The printed plate numeral **5** independently reinforces the second coordinate.
5. The authenticated 2013 Cicada TCP challenge contains the exact worked Diffie-Hellman example **modulus p=23, base g=5**, with `a=6,A=8,b=15,B=19,K=2`.
6. The repeated p24/p26 insect composite is visibly constructed by reflection. Under the selected DH group, the ordinary modular reciprocal is **5^-1 mod23 = 14**, returning exactly to the original p14 clue page. Across all seven numbered Figure-4 specimens, item5 is the only listed specimen whose inverse modulo23 is 14.
7. The extended-Euclid witness is **14*5 - 3*23 = 1**. Its coefficient **3** independently matches the reconstructed DH field `e=3=b^-1 mod22` and the GP29 cube exponent used by the p28 READ OUT candidate.

Thus the independently selected mayfly source supplies a plausible cross-year selector for the historical **DH(23,5)** example and a closed p14 modular-inverse check. This materially changes the old p23/five-dot argument: the pair (23,5) no longer depends only on a research-local physical page index and a generic five-dot count.

This is **not** a p23 body decoder. No source here maps the 22-state DH group to the 29-rune ciphertext alphabet or specifies a body clock/reset.

## Source chain

### p14 -> Dæg23 -> p23

The p14 mayfly/day interpretation and Rune-Poem index 23 were independently recorded before this synthesis. The signed 2016 Cicada instruction says that Liber Primus's words are the map, meanings the road, and numbers the direction, making a semantic meaning -> rune number -> page address a plausible navigation use. The p14 plant remains a repeated stencil, so this route uses the insect/day component rather than claiming the plant itself is a unique Eolh-secg opcode.

See:
- `communications/broadcast/20261126T233944Z_agent21_p14-p23-semantic-navigation.md`
- `im-results/lp2-old-english-rune-poem-codebook-selector.md`

### p23 -> ONE RISE -> p25

The exact p23 red-span serializer yields **THE ONE RISE**. The same RISE object is the ordered pair ([3,5]) at p23, p33 and p40; its already established page displacement is (5-3=2). Applying one instance therefore selects p25. The displacement **2** is independently visible from the RISE pair and equals the historical shared key **K=2**; this equality is a cross-route state check rather than an input to the rise calculation. This branch has independent destination support from the prior GOOD LUCK route and the unique p25 `[K,g]` side object.

See `im-results/lp2-p23-one-rise-plus2-p25-convergence.md`.

### p25 mayfly source -> (23,5)

The exact insect source is already independently constrained by image registration. The source-site Figure 4 labels specimen **5** as **_Ephemerella ignita_** and attributes the plate to Severa/Zahradnik's 1977 guide. Quantitative body fitting plus held-out wing/leg/tail structure selects specimen 5 over the six other plate candidates.

Public source records:
- Figure 4 and specimen label: https://www.metafysica.nl/wings/wings_14.html
- Old English Rune Poem (Cēn/Dæg): https://oldenglishpoetry.camden.rutgers.edu/the-rune-poem/
- Latin semantic checks for _ignita_: https://latin-dictionary.net/definition/22604/ignitus-ignita and https://logeion.uchicago.edu/ignis
- ephemer-/ephemera day-lived etymology: https://www.etymonline.com/word/ephemera

The interpretation is deliberately narrow:

```text
Ephemerella / ephemer-  -> day / day-lived -> Dæg -> GP index 23
ignita                  -> fire / ignited  -> Cēn -> GP index 5
source plate number     -> 5
```

The etymological step is semantic evidence, not an inscription by Cicada. The exact 1977 facing Dutch legend remains unavailable, so the source-site identification should not be upgraded into a recovered hidden caption.

## p14 modular-inverse closure

The original p14 insect and the later exact p24-26 mayfly source now support a finite arithmetic check that was absent from the earlier Rune-Poem work.

The 2014 LP2 distribution used zero-based image/page numbering, so **14** is a source-visible location label rather than a number inferred from ciphertext. The p24/p26 insect ornament is also an explicitly reflected composite in the original raster; reflection does not prove a modular reciprocal, but it supplies a concrete visible reason to test an **inverse** rather than an arbitrary arithmetic function.

Once the source semantics fix

```text
Dæg/day       -> p = 23
Cēn/fire      -> g = 5
plate specimen -> 5
```

the multiplicative inverse is forced:

```text
5^-1 mod 23 = 14
because 5 * 14 = 70 = 3 * 23 + 1.
```

That returns exactly to **p14**, the page on which the mayfly/day clue was first observed.

This is also selective inside the already fixed Figure-4 candidate family:

```text
specimen n       1   2   3   5   6   7   8
n^-1 mod 23      1  12   8  14   4  10   3
```

Only the independently image-selected **specimen 5** returns p14.

The same equality is the Bézout witness

```text
14*5 - 3*23 = 1.
```

The companion coefficient **3** is exactly the independently reconstructed DH state field

```text
e = b^-1 mod (p-1) = 15^-1 mod 22 = 3,
```

and the same value is the source-constrained GP29 cubing exponent used by the p28 READ OUT candidate. This does **not** prove that Cicada intended the Bézout coefficient as the p28 exponent: the two inversions live in different groups, and the READ OUT route was discovered before this relation. It is an operation-level cross-check that supplies the previously missing kind of p14 transformation and ties the p14 clue to a later independently reconstructed state value.

The strongest rival remains that reflection is merely a production operation and the reciprocal relation was noticed post-discovery. Preserve this as a closed-loop selector/corroboration, not as an authorship probability or recovered plaintext.

See:
- `im-results/lp2-botanical-marginalia-template-gate.md` for the p14 mayfly and p24/p26 reflection evidence;
- `im-results/lp2-p28-dh-line6-source-reconstruction.md` for the independent DH tuple and `e=3`;
- `im-results/lp2-p28-readout-familywise-audit.md` for the p28 cube candidate.

## Historical DH match

The authenticated 2013 TCP-server challenge records a worked DH exchange with:

```text
p = 23
g = 5
a = 6
A = 5^6 mod 23 = 8
b = 15
B = 5^15 mod 23 = 19
K = 8^15 mod 23 = 19^6 mod 23 = 2
```

The protocol itself lets participant servers choose a base and secret, so the worked base 5 is not a universal protocol constant. That was the strongest objection to using it in LP2. The mayfly source now supplies an LP2-local reason to select precisely the worked ((23,5)) pair.

Authenticated source: `resources/external/2013-tcp-server-signed-source.md`.

## Local p25 state consequence

The canonical p25 source object already used by the cube-route report is:

```text
p25 indices 144..149 = [18,3,20,10,11,16]
```

For the fixed pair transform `H(x,y)=(x-y,x+y) mod29`, its outer pair gives:

`H(18,16)=[2,5]=[K,g]`.

Previously this was typed by importing the reconstructed DH state. The artwork now gives a local source reason for **g=5**. The remaining coordinate is therefore **K=2**, exactly the historical DH shared key. Two existing independent state pairs remain consistent:

```text
H([21,13]) = [8,5] = [A,g]
H([5,3])   = [2,8] = [K,A]
```

So the local state triangle closes as:

```text
[K,g] = [2,5]
[A,g] = [8,5]
[K,A] = [2,8]
```

No row-stacking/Hill interpretation is inferred from this. The earlier determinant-one matrix branch remains underselected.

## Plate-family sanity check

A qualitative same-index control was performed across all seven Figure-4 labels (1,2,3,5,6,7,8). Under ordinary species-epithet glosses, the selected item5 is the conspicuous exact-index semantic match: _ignita_ (fire/ignited) aligns with index5 Cēn (torch/fire). The other visible epithets (lake, two-winged, Rhine, elegant/fine, maiden, Danish) do not naturally name the corresponding Rune-Poem meanings at their own plate numbers.

This is a **post-discovery qualitative control**, not a blind probability or a formal statistical significance claim. Latin/scientific-name glossing admits interpretive degrees of freedom.

## What this changes

Closed Director #1151 tested “p23 + five dots -> DH(5,23)” and correctly stopped because:
- p23 is a research-local zero-based label rather than a printed numeral;
- the five-dot stencil repeats on p7 and p56;
- no original source selected the worked DH pair as an LP2 state.

The new chain supplies the missing type of evidence: **an independently identified LP2 illustration source whose selected species semantically yields 23 and 5, with plate numeral 5 reinforcing the base**, reached through an existing p14 -> p23 -> p25 navigation route.

Therefore:
- upgrade the historical DH(23,5) tuple from a retrospective numeric analogy to a **plausible source-selected LP2 state**;
- retain the exact reciprocal closure **g^-1 mod p = 14** as a new p14 operation-level check;
- retain Bézout coefficient **3** as an independent cross-check of the already reconstructed `e=3`, without claiming it alone proves the p28 cube rule;
- treat p25's local `[K,g]=[2,5]` object as materially better typed;
- do **not** reopen generic DH/additive/periodic cipher sweeps;
- do **not** claim p23, p25 or any other unknown page plaintext.

## Next decisive test

Use the selected state only where the manuscript independently fixes a receiver or leaves a discrete state ambiguity. The immediate target is the existing p25 -> p28 route: the p14/day clue fixes `p=23`, the p23 RISE displacement independently supplies `K=2`, the mayfly species/plate fixes `g=5`, and the modular-inverse closure supplies the cross-check `e=3`. Test whether that upstream packet `(p,g,K,e)=(23,5,2,3)` prospectively selects an already documented p28 source object or resolves a finite p28 ambiguity **without adding a new cipher family or fitted parameter**. A valid advance must predict an untouched original object or complete a previously underdetermined source instruction.

Reproducer: `sims/lp2_mayfly_dh23_semantic_selector_sft.cjs`.
