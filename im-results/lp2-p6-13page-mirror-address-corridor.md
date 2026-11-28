# P6 mirrored 13-page source corridor: six integer-address pairs and a pinned centre

**Agent28, 28 November 2026. Classification: provisional, target-rune-blind full-corridor original-manuscript receiver architecture, with charged visual alternatives.** A shorter, *mirrored* base29 transport connects the six paired page positions of the authenticated source-selected 13-word tail to original ciphertext groups. A separate p6 base29 pointer lands at the centre. The resulting **13-page [K,q,1,q,K] physical structure** is materially more coherent than the earlier forward-only q-block transport, and does not read any signed-source plaintext rune values or fitted cipher keys. All opcode choices were nevertheless inferred *after* the current corridor was studied; **no genuine unknown-page plaintext or complete cipher key is recovered**.

## Human-visible source objects and the 13-page mirror

The actual p6 ink object (physical original scan 23.jpg) prints a unique red run of 11 runes in consecutive complete group lengths `[4,1,4,2]=[q,1,q,K]`, bracketed by two 13-dot ornaments. The large adjacent red Fehu is `F=0`, and four large symmetric spirals decorate its frame. The authenticated Cicada 2016 message has 13 alphabetic words after its DIRECTION sentence boundary. Existing independent source-only work has identified a final 11-word interval and the skipped `K=2`-word prefix. The **13 words** align with physical p30–p42 in the *hypothesized* same-number corridor:

```text
source indices 30–42:
[SEEK AND] [YOU WILL BE FOUND] [GOOD] [LUCK BEWARE FALSE PATHS] [VERIFY OPENPGP]
      K=2              q=4         1             q=4                   K=2
```

The p6 red title itself is **11 runes**, and `11+K=13`, matching the bracketing dot counts. This is physical-plus-first-party structural evidence for investigating a 13-page **palindromic** object, not an instruction signed by Cicada to decode pages in this way. The natural six mirror pairs around p36 are p30↔p42, p31↔p41, p32↔p40, p33↔p39, p34↔p38 and p35↔p37.

The source-derived p6 title operands are:

```text
red W1=[24,16,14,17]  W2=[19]  W3=[6,27,15,17]  W4=[14,12]
printed widths L=[4,1,4,2]
H4(L)=[2,26,5,6]=[K,-e,g,a]    (mod29)
K=2, e=3, g=5, a=6, q=4, u=W4.last=12=aK, F=0
W1.first=24=-g mod29
```

Here `H4([w,x,y,z])=[w−z,x−y,x+y,w+z] mod29` is the previously published outside-in transform; its authoring role is not proven by these correspondences. The midpoint and all six pair transports below use *only* these physical title/Fehu scalars, GP29 alphabet radix 29 and candidate complete-group geometry. Source word **lengths** and independently selected removable q/F marker modes supply the expected raw receiver arities; signed-source target **values** are not consulted.

## Signed-source outer initial H-differences independently select the 13-word window

The p6 **outer K residual** `[u,-a]=[12,-6]=[12,23] mod29` also has a direct *authenticated-first-party source* interpretation. Under the already frozen outside-in H-pair convention, take the GP29 initial rune of the first signed word minus that of the last, then second minus penultimate:

```text
Hdiff(SEEK.first, OPENPGP.first) = 15−3 = 12 = W4.last = u
Hdiff(AND.first, VERIFY.first)   = 24−1 = 23 = −a mod29
```

The full H4 of signed-source outside initials `[15,24,1,3]` is `[12,23,25,18]`: its first two outputs exactly equal the p6 outer-K residual modulo29. The remaining coordinates are the independently known state values `[p+K,B−1]` (still not an authored opcode). **Across all 31 contiguous thirteen-word windows** of the authenticated 43-word 2016 signed message, exactly **one** has the two ordered outer initial differences `[12,23]`: source indices **30..42**, `SEEK AND ... VERIFY OPENPGP`. This selection reads *no unknown LP2 ciphertext* and provides a shorter human-solvable route to the same 13-word tail than the earlier 11-field source identities.

The original 2016 **BE/BEWARE mirrored pair** (source indices34 and38) has *identical first GP29 rune* B=17 on both sides of the centre GOOD: the outside-in H2 result is `[17−17,17+17] mod29=[0,5]=[F,g]`, i.e. the actual large Fehu and the third H4(title-width) coordinate. This gives an independent *source-authored* way to obtain the inner residual scalar magnitudes. Along with the previously noted original 2016 outer differences `[Hdiff(SEEK,OPENPGP),Hdiff(AND,VERIFY)]=[12,23]=[u,-a]`, the **entire six-lane signed residual stream** of the original p6 mirror transport can be constructed from signed-source word initials alone:

```text
source outer pair differences = [12,-6] (balance residue23 to -6)
source Hpair(BE,BEWARE)       = [0,5]   (= F,g)
six page-pair residuals       = [u,-a,u,F,-g,g]
                              = [12,-6,12,0,-5,5]
p6 title-width quotient      = [e,K,1,F,K,q] = [3,2,1,0,2,4]
29*quotient + residual       = [99,52,41,0,53,121].
```

The source 2016 message and p6 physical title thus yield *matching scalar ingredients* before unknown LP2 ciphertext inspection. The **repeated-u, order, sign-lift and mirrored-address opcode** are still analyst-selected after the receiver corridor became known; this is not independently authenticated decryption. The signed source initials and mirrored equality specify a concrete author-clue candidate for #3388's original-p6 human solve path. The same [first-party SFT](../sims/lp2_p6_13source_initials_outer_h_gate_sft.cjs) prints all six signed projected residuals and exact deltas.

Combining those **signed-source-selected residuals** with p6's independent H4 width quotient `[e,K]=[3,2]` yields the outer paired physical address shifts `[99,52]` only when the GP residue23 is interpreted as **balanced −6**, rather than literal unsigned 23 (which would produce 81 and fail). This exact signed-lift choice remains an unproven operand rule; it cannot be silently treated as implied by GP29 residue equality.

**Charge alternatives:** allow either W4 rune (2), either sign, any one of four signed H4 printed-width coordinates and either coordinate order: **64 distinct p6 numeric two-field residual vectors**. Across the same 31 authenticated thirteen-word windows, **four** field/window coincidences survive, at source starts **13,22,27,30**. The literal `[u,-a]` uniquely selects 30 under its frozen role order, but the source field pairing was noticed after the tail had been studied: it is **conditional source-only evidence, not a discovery-wide p-value**. See `sims/lp2_p6_13source_initials_outer_h_gate_sft.cjs` for the exact first-party source, p6 title grammar, 31-window census and 64-vector charge.

## Original 13-dot stencil fixes the mirror topology

The original p6 large red marker supplies more than the column populations `4/5/4`. Map physical p30–p42 onto its thirteen dots in the same **printed column-major, top-down** order already established by the p6 grid schedule:

```text
left   = [p30,p31,p32,p33]
centre = [p34,p35,p36,p37,p38]
right  = [p39,p40,p41,p42].
```

The outer four dots occupy the four vertical gaps of the five-dot centre column. The complete axis-preserving symmetry family of this normalized 4/5/4 stencil is identity, left↔right reflection, top↔bottom reflection, and 180° rotation. Exactly one of those four symmetries realizes the full corridor pairing:

```text
180°:
p30↔p42  p31↔p41
p32↔p40  p33↔p39
p34↔p38  p35↔p37
p36↔p36.
```

That is precisely the independently derived full 13-page mirror architecture below. The earlier forward q-block pairing `p32→p37, p33→p38, p34→p39, p35→p40` is realized by **zero** of the four stencil symmetries. This is a p6-local visual discriminator between the two live address topologies: the page geometry selects the mirror pairing, not the forward pairing.

The visual result does **not** solve the remaining numeric-order problem. Even after the mirror topology is fixed, the inner p6-only quotient/residual field family still has `24×24=576` orderings before receiver structure or checksums are opened. Thus the marker authenticates a topology, not yet the signed `Q/D` field order or a plaintext decoder. Reproducer: [`sims/lp2_p6_red13_stencil_symmetry_address_sft.cjs`](../sims/lp2_p6_red13_stencil_symmetry_address_sft.cjs).

## Two simple mirrored integer-address operators

For the two outermost `K=2` source pages p30,p31, reverse destination order to p42,p41. Use the H4 title-width fields and final red title rune:

```text
Q_K=[e,K]=[3,2]
D_K=[u,-a]=[12,-6]
T_K=29*Q_K+D_K=[99,52].
```

For the inner four-source-page `q=4` block p32–35, reverse the destination p40–37. Use the printed singleton length, the large Fehu, title width K, title width q, the terminal red rune and the third H4 title-width value g:

```text
Q_q=[len(W2),F,K,q]=[1,0,2,4]
D_q=[u,F,-g,g]=[12,0,-5,5]
T_q=29*Q_q+D_q=[41,0,53,121].
```

Both rules are **full zero-based integer rune-address updates**, not coordinatewise GP-value decryptors. For each page lane take every original complete printed group (or contiguous exact-arity concatenation) of the source-selected arity, and retain only those whose **absolute start+delta** is itself an exact-arity complete printed packet on the mirrored page. The two outer K endpoints additionally require **one printed word** per endpoint rather than a multi-group packet, consistent with the existing independently selected K-terminal marker words.

| Source page / raw arity | Mirror page / raw arity | Address delta | Exactly selected original rune starts |
| --- | --- | ---: | --- |
| p30 / 4 | p42 / 8 including F | 99 | 112 → 211 |
| p31 / 3 | p41 / 7 including F | 52 | 126 → 178 |
| p32 / 3 | p40 / 4 | 41 | 30 → 71 |
| p33 / 4 | p39 / 5 | 0 | 132 → 132 |
| p34 / 2 | p38 / 6 | 53 | 4 → 57 |
| p35 / 5 (adjacent 2+3) | p37 / 4 | 121 | 25 → 146 |

**Every one of six literal p6 mirror lanes has exactly one qualifying physical receiver pair**, without using previously derived H4 *start-residue* shells, word labels, candidate plaintext, language scoring or fitted GP keys. The p41 target contains original F at raw index3; p42 contains F at raw index1. Those marker modes were independently reported before this mirror hypothesis; their structural agreement is a cross-check, not a cryptographic inverse.

The centre p36 has its own **base29 p6 absolute-address constructor**. Let its quotient be `g=H4(L)[2]=5`, its remainder the *first printed p6 title rune* `W1[0]=24=-g mod29`:

```text
centre_address = 29*g + W1.first
               = 29*5 + 24
               = 169.
```

The original p36 complete printed five-rune word at **169** is `[2,22,4,1,20]`, and its centre is exactly the p6 width `q=4`. Removing that independently selected centre q yields the prepared four-rune receiver `[2,22,1,20]` (GP0=16). This supplies a physical operator for the **seventh, unpaired centre lane**, so the whole 13-page corridor is structurally accounted for.

## Conditional family charges: alternatives, then independent original-rune checks

The mirror orientation, the four signed residual coordinates and the middle quotient/remainder fields are postselected. To charge them, preserve the source-visible input roles but allow their natural orientation choices.

**Four-lane q family:** permute `[len(W2),F,K,q]=[1,0,2,4]` in **24** ways; independently permute `[u,F,-g,g]=[12,0,-5,5]` in **24** ways. For all 576 full-integer packet pairs, use *all* source and destination exact-arity original complete-group candidates (no source-target GP values or old start residues). **10** packets admit all four mirror lanes and give **27** complete paired receiver configurations. The independently published p6 four-block ciphertext GP0 packet is:

```text
H2(F,W1[1]) || [W1.first,W4.last]
= [13,16,24,12]  mod29.
```

The middle singleton and K-terminal receiver preparations independently supply GP0 `16` and `6+6=12`. Among the 27 surviving four-lane mirror pairings, exactly **one** has first q-block sum13, exactly **one** has second q-block sum24, and both tests select the *same single* literal `Q_q,D_q` and physical starts. These are ciphertext-sum constraints, not imported candidate plaintext values.

**Two-lane outer K family:** take either sign and order of distinct p6 H4 fields `[e,K]`: **8 numeric choices**; independently take either sign and order of distinct p6 source fields `[u,a]`: **8 choices**. Of the **64** Q/D pairs, **2** have complete one-word receivers on both p30→p42 and p31→p41, representing **2** full outer pairings. Only **one** has the independently selected F-position markers on *both* terminal words (p42 F at index1, p41 F at index3). It is the literal `[e,K]`, `[u,-a]` pair above.

**Centre family:** choose the base29 quotient from the four distinct unsigned `H4(L)` field magnitudes `[K,e,g,a]=[2,3,5,6]`, and the remainder from the **9 distinct GP values** among all eleven printed p6 title runes. Of these **36** centre pointers, only **3** hit any one-word five-rune packet on physical p36, and only **one** hits a one-word five-rune packet whose *central* GP rune is `q=4`: quotient5, remainder24, address169.

The charged Cartesian set has **576 × 64 × 36 = 1,327,104** labelled full-13-page operator configurations. After exact original group geometry, there are **10 × 2 = 20** viable six-pair packet combinations and **27 × 2 = 54** complete six-pair physical pairings. The two original-rune checksum tests, the two terminal F-position checks, and the centre q-marker requirement leave the literal **one** joint 13-page configuration. The checks use only original ciphertext symbols **at the receivers**, not the signed-source word spellings or arbitrary key streams. The visual field grammar itself was chosen retrospectively, so this cannot be treated as a discovery-wide likelihood or independent authored decryption proof.

**Physical-page shift control:** lock the literal six shifts, all source/receiver arities and outer one-word rule, then move the 13-page layout over **all 44 admissible manuscript starts 0–43**. Only **base30** has six complete mirror pairs; its six pair counts are all one. This conditional negative excludes the same fixed geometry reproducing the complete 13-page relay in another part of the manuscript, but the source tail/page alignment was known before the shift test.

## Relationship to earlier forward block transport

The earlier [forward p32–p40 q-block address construction](lp2-p6-qblock-uniform-period-receiver-gate.md) also maps all eight inner pages and passes a separately charged checksum; it pairs p32→p37, p33→p38, p34→p39 and p35→p40 with `T=[116,-75,128,46]`. That identity is arithmetically true but demands a **post-selected replacement** of a title-width singleton by an H4 output and a repeated `[F,u,u,-u]` residual. The present **reversed** q-block operator instead matches the full 13-page **palindromic physical frame** and uses a literal permutation of `[1,F,K,q]` plus `[u,F,-g,g]`, so it is the more economical **human-solve-path hypothesis**. The original 4/5/4 stencil now independently selects the **mirrored pairing topology** via its unique 180° symmetry, while it still does not label the numeric vector order. Preserve the forward formula as a conditional arithmetic control rather than treating it as a coequal visual topology or established decryption.

## Reproduction and decisive frontier

```text
node sims/lp2_p6_13page_mirror_address_transport_sft.cjs
node sims/lp2_p6_qblock_integer_address_transport_sft.cjs
```

The new read-only Node22/CommonJS SFT derives the title and both mirror packets from canonical p6 source, parses all original printed groups and rune values on all 56 physical pages, enumerates six exact integer mirror lanes, computes the source-only centre pointer, charges 576 inner, 64 outer and 36 centre alternatives, tests original GP0 and F/q markers, and runs the full 44-window shifted physical control. No loaded resource includes signed-source target rune spellings or target-fitted key vectors.

**The full p30–p42 *receiver-location* dependency now has a compact p6-centred seven-operator schedule: six source/mirror pairs plus a centre pointer.** This is a major reduction from isolated word-by-word selector exceptions, and a concrete clue-driven candidate route for a human solver. However the original p6 title does not explicitly spell `take mirrored base29 addresses`, `permute these specific fields`, or `subtract a complete per-rune key`; source-field saturation and retrospective operator choice remain real. The cryptographic frontier is an independently authorized **ordered key serializer or reversible transform**, preferably producing authentic unseen LP2 plaintext from these receivers. Do not use this selection to promote the aligned 2016 signed words as solved unknown pages.
