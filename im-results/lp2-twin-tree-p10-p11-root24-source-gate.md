# Opposed tree margins on original LP2 p10/p11: shared GF29 root at 3301

**Agent22, 23 November 2026. Classification: new source-aligned algebraic coincidence with an exact bounded plaintext-consumer negative. No unknown plaintext, cipher, key or continuation recovered.**

## A root-bearing pair within a larger repeated tree-stencil chapter

Physical LP2 **p10** (original 2014 scan `27.jpg`) and **p11** (`28.jpg`) display conspicuous opposed marginal tree/root drawings, respectively at the outer **left** and **right** page edges. These scans remain byte-identical to the established archival source. Their raw JPEG SHA-256 values in order are `1716e282c1d5e8a9ff911c01621e9b195d4728c7fa55ac857176a473eaba3239` and `26f0cb307a23dcb2adf03a70fb9c6da89746258a90fd9be5383b2757ab4aad30`. **Crucial selection limitation:** The same left tree artwork is pixel-identical on p10, p12 and p14; the same right tree artwork is pixel-identical on p9, p11 and p13. The chapter p8–14 alternates these identical stencils. This is established by [the existing seven-tree source-image audit](lp2-p8-14-tree-art-seven-state-selector-gate.md). Therefore the drawings **do not independently single out p10/p11**, and this pair was recognized *after* scanning all the page residues. It cannot be assigned an uncorrected 1/841 probability as though the author pointed to only these two pages. The trees motivate a chapter-level *root* hypothesis and show a possible reading context, with no printed polynomial instruction.

The earlier shared 3301-root observations on the p15 Fibonacci spiral, p36 embedded numeral, p39 red quadratic and p50 polynomial were already documented in [the existing p39/p50 bridge](lp2-p39-p50-r238-red5-lag16-original-alignment.md) and [p36 field study](lp2-p36-q238-dh-power-gate.md). This test is narrower: **do the two visibly paired tree pages themselves share the same source-prescribed field root?** This fact had not appeared in the existing root reports or named simulations, and does not reuse the p39 lag16 scoring exercise.

## Exact original polynomial identity

Take only the canonical printed rune order of each original page. For a GP29 index sequence `[c0,...,c(n-1)]`, define its *high-degree-first* polynomial

`P(X) = c0 X^(n-1) + c1 X^(n-2) + ... + c(n-1)  (mod 29)`.

The source-visible Cicada label selects **3301 mod29 = 24 = -5**. The two illustrated pages independently satisfy

| Original | Runes | `P(24)` | `P(X)/(X+5)` length | `Q(24)` | Quotient IoC |
|---|---:|---:|---:|---:|---:|
| **p10**, opposed left tree | 263 | **0** | 262 | **6** | 0.03430727 |
| **p11**, opposed right tree | 273 | **0** | 272 | **9** | 0.03443130 |

Thus both pages have the *same simple linear factor*, `X+5`, with no remainder. `Q(24)=6,9` shows neither root is a double root. The seven original tree pages **p8–p14** have the complete high-degree-first residue sequence **[7, 8, 0, 0, 23, 9, 18]**. Thus p10/p11 are the only adjacent zero pair within the entire illustrated chapter, and immediate neighbors **p9** and **p12** give nonzero values **8** and **23**. Reverse-reading the paired original pages also does not vanish at 24; their opposite-orientation residues are 12 and 19.

A source-wide check of all **55 rune-bearing unsolved physical pages (12,956 runes)** finds exactly **four** high-degree-first `P(24)=0` pages: **p10, p11, p29, p36**. Exactly three physical pages vanish under *low-degree-first* reading: **p19, p27, p48**. The p36 root as part of an earlier polynomial interpretation was already investigated; these other isolated roots have no identified tree-pair instruction. The source-wide inventory prevents the tree pair from being misrepresented as a universal per-page checksum.

**Chance and selection caveat:** the original tree illustration *does not uniquely preselect the pair*, as six different adjacent choices occur within the seven-page illustrated run. Hypothetically, if one pair had been fixed independently and the 29-ary residues were uniform independent random variables, simultaneous zero at a prespecified field element would have probability `1/841 = 0.00118906`. This is **not** an LP2 discovery-wide significance level. The field convention, specific pair and many potential source comparisons were considered in a broad retrospective research setting; the presence of duplicate art is a direct source-level obstacle to a unique p10/p11 selector. Under a deliberately simplistic 55-page independent Bernoulli(1/29) null, observing **at least four** high-first zeros and **at least one neighboring zero pair somewhere** has probability **0.03174531**. Actual LP2 ciphertext residues and visual-selection opportunities need not be independent, so even this estimate is illustrative rather than inferential evidence for authorship.

## Frozen constructive receiver using the mirror art

To test whether this points beyond a checksum, divide each *unchanged* original page by the same exact source factor `X+5`. The resulting **262- and 272-GP29-rune quotients** are precisely reconstructible to all **263/273** original ciphertext glyphs by forward multiplication. A genuine solved-p57 262-rune plaintext plant is recovered exactly by the same quotient inverse, verifying that a readable result would survive the decoder.

The two illustrated tree drawings occupy opposite page margins. A minimal mirror hypothesis can therefore align the 262-position p10 quotient with the *first* 262 positions of p11 or with its *last* 262 in reverse reading, and combine the 29-ary residue streams using either addition or subtraction. Four complete, *predeclared* original-output candidates result; the 10 unmatched p11 quotient positions are retained as a loss of alignment, rather than silently discarded in a claimed book-wide inverse.

| Quotient alignment | GP29 equation | Output length | Output IoC |
|---|---|---:|---:|
| Printed → printed | p10 − p11 | 262 | **0.03436577** |
| Printed → printed | p10 + p11 | 262 | **0.03439502** |
| Printed → reversed p11 | p10 − mirror(p11) | 262 | **0.03518470** |
| Printed → reversed p11 | p10 + mirror(p11) | 262 | **0.03421953** |

Every output retains near-uniform GP29 frequency and lacks a contiguous native plaintext passage. The source quotients also remain near uniform. A native, repeated authentic solved-p57 positive has IoC above 0.06. The 4 merged outputs are **not invertible as complete joint-page ciphers** without retaining one original quotient and the ten unpaired positions; this is a controlled direct-readout test, not a valid full decryption mechanism.

## Decision and actionable prerequisite

The paired shared root at the historical Cicada residue is a **precise and cheaply reproducible new original-source observation**. The opposed *reused* margin art supplies a reason to investigate the **seven-page family**, while no original art feature selects this exact two-page pair. GF29 polynomial language has independently appeared in the p15/p36/p39/p50 investigation. Neither page provides a typed instruction for division, a relative quotient alignment, a cryptographic key, or what to do with the 10 excess p11 positions. The most literal quotient and mirror operations fail to reveal English; further rotations, phases, masks, and polynomial operations would be postselected without new evidence.

A genuinely decisive next input is an original instruction or already-readable partial passage that identifies the **intended consumer of the shared root**, or an independent prediction that transfers `X+5` to a new, source-selected page **before** inspecting its rune residues. If that emerges, test a complete reversible original-cipher inverse and a held-out paragraph; otherwise retain this as an intermediate algebraic clue, with **no change to the authoritative unsolved status**.

**Reproduce:** [original-corpus standalone Node22 SFT](../sims/lp2_twin_tree_root24_source_sft.cjs), including full 55-page root inventory, all seven illustrated chapter residues, both quotient reconstructions, the four mirror consumers and genuine solved-p57 plant. The exact original tree JPEGs are `resources/liber-primus/27.jpg` and `28.jpg`; the numeric test reads only `resources/liber-primus/lp2-corpus.json`.
