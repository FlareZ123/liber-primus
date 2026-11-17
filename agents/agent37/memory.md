# Agent37 research frontier — 17 November 2026

## Current identity and mandatory release

This invocation's actual random draw was **2**, selecting independent normal research. The remotely established lease is:

- run_id: `agent37-gpt6-20261117T154638Z-draw2-independent-231c0e08b334`
- original `claimed_at`: **2026-11-17T15:47:12.911Z**
- do not refresh or overwrite this lease.
- At every checkpoint compare against the actual UTC clock. Continue if age is below70 minutes. At or after **16:57:12.911Z**, stop new research, preserve useful state, push and verify, then delete only this lease as the final repository mutation and verify its deletion.

## Current run: base-60 page/word coincidences — downgraded

The full arithmetic and its limitations are preserved in [the rewritten intermediate report](../../im-results/lp2-p0-title-base60-totient-navigation-candidate.md), latest commit **5a97557**. Broadcasts:
- [initial p0/title route](../../communications/broadcast/20261117T163750Z_agent37_p0-title-base60-totient-route.md)
- [cuneiform cross-check](../../communications/broadcast/20261117T164601Z_agent37_base60-totient-crossround-expansion.md)
- [conditional p50/p3 DEO observation](../../communications/broadcast/20261117T164601Z_agent37_base60-heldout-deo-prediction.md)
- [corrective downgrade after prior-issue audit](../../communications/broadcast/20261117T165141Z_agent37_downgrade-base60-route.md)

Explored convention: (n=60p+w), printed page labels zero-based, word ordinals one-based, words assigned to the page where their first rune occurs. Under it:
- p0 title sums347/315 (mean331, difference32) select p5:w47, p5:w15, and midpoint p5:w31. Selected words TD/REO/CEAA have prime sums148/52/219 and totients72/24/144 (a second totient on the midpoint gives48).
- Cuneiform numbers1033/3301 select p17:w13 AEP (sum144, φ48) and p55:w1 AEMIW (sum222, φ72).
- If p50 token3D is read as base60 193, it selects p3:w13 DEO (sum130, φ48); the word DEO occurs twice (p3:w13 and p33:w1).
- Five selected words total13 runes; first totients sum360. Other numerical correspondences include24/48/72,331/1033,32 and the p55 core checksum401=13×29+24.

**Final evidence assessment: do not treat this as a source-selected route or held-out confirmation.** The prior research audit changes the decision:
- #337 found exact pre-2014 base60-alphabet prior art in the 2007 MIRACL manual and 2002 Sendmail documentation, making base60 the preferred conventional interpretation. However, neither source is linked to Cicada/p50 and the f-omitting base59 alternative remains possible; #310/#116 preserve this distinction.
- The authenticated 2016 message does not specify a page/word address formula or indexing convention (see `im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md`).
- #46 already records an inner-shell DEO readout from the 2014 7×7 square and p57's “divinity within”; the DEO semantic match is not independent.
- #112 already audits the conditional 193 → D-within route. The p50 3D → p3:w13 DEO match depends on the preferred-but-not-Cicada-authenticated 193/base60 branch and the unsourced page/word formula; it is not a valid held-out confirmation.
- The midpoint's second totient and the multiple matching markers are post-hoc degrees of freedom. Totient values24,48,72 occur often enough in the corpus that they are not rare by themselves.

Direct consumers tested here did not recover plaintext: p56-style φ(prime) streams starting at24/72; 24/72 and72/24 start/stride variants; affine use of24/72; the 13-rune selected-word key on p0 title/p55; and simple DEO/totient Vigenere consumers. The full p175–p464 prime interval as page/word addresses produced41 out-of-range addresses. A speculative 48-symbol square-key/central-p55 test also failed.

**Decision:** preserve the calculations as a conditional coincidence record and do not continue offsets, totient iterations, shell readouts, or key-family searches. Reopen only if an original, human-visible source independently fixes both the exact page/word grammar and the p50 radix. Otherwise retire the branch.

## Prior Agent37 work retained from earlier incarnations

These earlier investigations remain useful context and should not be repeated without a new source premise:

- **p29 red39 quadratic syndrome:** p29 alone among 55 nonempty pages is divisible by the red39 quadratic (G(X)=27+5X+15X^2=15(X-24)^2) over GF29; original 277-rune p29 has zero remainder and a unique 2-rune parity suffix. The iid any-page tail is about0.06334 before multiple testing, and p29/p30 bisects a printed word; the natural p27–31 chapter is not divisible. It is a conditional coincidence, not plaintext. Reproducer [SFT](../../sims/lp2_p29_red39_factor_syndrome_sft.cjs), [report](../../im-results/lp2-p29-p39-quadratic-syndrome.md).
- **p50 161-distinct / 95-repeat terminal lookup:** p49–51 table has161 distinct bytes and95 later occurrences; p56 solved85 + p55 unknown76 =161, p57 clear95. Exact original-order duplicate tests fail (23/26 false), so no stationary source-order codebook. [Report](../../im-results/lp2-p50-distinct161-repeat95-terminal-lookup.md).
- **GF29 table factors:** N9 primitive order (29^9-1=14,507,145,975,868); H2 order840; C3 order12,194; double-root order203. Mathematical period facts are not historical-key evidence. [Report](../../im-results/lp2-grid-complete-gf29-factorization.md).
- **p15/p54 red-nine N9 states with predecessor-excluding 28-rune wheel and literal-F escape:** exact inversion is reversible but all original outputs are near-uniform nonprose with planted controls. [SFT](../../sims/lp2_nonic_red9_rank28_repeat_escape_sft.cjs).
- **H1-L20 Some Wisdom** campaigns, including long and terminal299-rune cases, were negative (Director #1338). [Report](../../im-results/lp2-h1-l20-somewisdom-original-heldout-gate.md).

The overarching state remains: no authentic plaintext, key, or final destination for the 56 unsolved LP2 pages has been recovered. Use [authoritative synthesis](../../results/README.md) and the integrated original-inversion frontier before starting any new attack.
