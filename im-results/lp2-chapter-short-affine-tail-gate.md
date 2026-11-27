# Whole-chapter short signed BASE29 affine inverse: exact offset-tail quotient

**Decision:** no original plaintext or key recovered. The complete short decoder-side affine family has been optimized over the opening chapter without a printed-word assumption; the frozen continuation is nonprose. This is a bounded language-ranked attack, not an exact mathematical impossibility of all affine decoders.

## Distinct mechanism

The historical signed BASE29 worked example and modular arithmetic motivate considering a chapter-wide integer. They do not select an affine offset, a bound, or either digit order. The [existing short multiplier](lp2-chapter-base29-short-multiplier-exact.md) and [short exponent](lp2-chapter-base29-short-exponent-exact.md) studies use endpoint lexical anchors; #3162's [16-rune block affine inverse](lp2-p15-block16-affine-integer-gate.md) repeats one block key. This study instead allows a short **unknown offset** and one full-chapter integer. It is invariant to relocation of printed separators alone.

Freeze original p0–2, exclude the physical 13-rune red heading at the beginning, retain all 716 body runes including all other F and punctuation-independent runes; no bypass or rearrangement. Test both digit orders, with the low-end physical page for ranking (249 p0 body runes or 201 p2 runes), and the remaining physical pages for continuation. No origin, chapter, length or parameter sweep. Let q=29, M=q^3, Q=q^716. Decoder:

    P = (A*C+B) mod Q
    -M < A < M, A mod29 != 0, 0 <= B < M.

For the three low ciphertext digits c=C mod M, define S=A*c, h=floor(S/M), T=(h+1)*M-S. Offsets B in [0,T-1] yield carry h; offsets B in [T,M-1] yield carry h+1 (omit empty intervals). All offsets in one interval give exactly the same remaining 713 plaintext digits. Thus all 47,096 signed unit multipliers and 1,148,624,344 integer key pairs reduce to at most 94,192 high-tail candidates per direction. For every candidate use integer carry arithmetic, including negative A; low three digits are intentionally not scored. Every fit candidate is evaluated (no beam or crib filter). A,B are not assumed to be individually identifiable: only the high-tail equivalence class can be recovered from this score. After ranking, freeze the winning interval and its smallest B as a mechanical representative. The low three decoded digits are arbitrary within that class; any apparent text there is not evidence.

The same smoothed GP29 unigram/bigram/trigram model is fit on seven native solved records, excluding KOAN1 and LOSS OF DIVINITY. Score all fit trigrams entirely beyond the low three digits; held scores start fresh at the physical cut (no train/holdout transition). The low-end fit is independently reversed when appropriate. Full BigInt modular inverse re-encryption checks the representative, not key authenticity.

## Executed results

| Tape | Order (first rune) | Fit mean logp | Held mean logp | Winning A | Winning B interval |
|---|---|---:|---:|---:|---|
| native KOAN1 plant | LE | -2.448976 | -2.655298 | 1033 | 14967–24388 |
| native LOSS OF DIVINITY plant | BE | -2.710109 | -2.793610 | -3301 | 15829–24388 |
| original p0–2 | LE | -3.387606 | -3.487280 | -10925 | 3319–24388 |
| original p0–2 | BE | -3.374140 | -3.491689 | -8391 | 0–13612 |

Both synthetic native plants recover their exact multiplier, an offset interval containing the true B (17659 and 22001 respectively), and every scored fit and held rune: 246/246 + 467/467, and 198/198 + 515/515. The interval itself cannot identify the true offset. In the BE original case the other carry interval for the same multiplier ties exactly on fit, as expected when a low-end carry merges; the deterministic ordering selects the lower interval. This does not identify a distinct authentic key.

All four re-encrypt exactly. The original fit winners are nonprose; the original held scores are worse than uniform GP29 (-ln29 = -3.3673). LE original begins (first three arbitrary representative digits) F F F F J NG OE TH X IA J F U T I E C EO OE R D Y C A P...; BE reading order begins C NG I N E T I I E G M D S W I U EA A T J C H U I E S C AE... Neither is an unknown plaintext candidate. Only two planted controls were used; no calibrated universal language threshold is claimed.

The exact quotient is reusable when a short decoder offset would otherwise force an expensive Cartesian key sweep. It does not cover a short multiplier/offset on the *encryption* side, larger coefficients, full-width offsets, cipher-specific page clocks, or another representation. Do not extend the same domain absent an independent clue selecting integer orientation, scale or receiving interval.

## Reproduction

Run `node sims/lp2_chapter_short_affine_tail_sft.cjs` from the repository root. The identical JS function was executed through connected V8 with actual canonical corpus and native reference inputs; standalone Node wrapper not executed. [Code](../sims/lp2_chapter_short_affine_tail_sft.cjs) frozen commit d48a037c31f982a002307e011ae2364edbbe5e05; [raw executed output and input blob IDs](lp2-chapter-short-affine-tail-output.json) commit c0caec11fda9fc5f838da9b79d02bc08458b2f71.
