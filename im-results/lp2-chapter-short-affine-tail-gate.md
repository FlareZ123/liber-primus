# Whole-chapter short signed BASE29 affine inverse: exact offset-tail quotient

**Decision:** no original plaintext or key recovered. The complete short decoder-side affine family has been optimized over the opening chapter without a printed-word assumption; the complementary short encryption-side family was screened by every exact high-prefix class and reranked on a full fit page. Both frozen continuations are nonprose. These are bounded language-ranked attacks, not an exact mathematical impossibility of all affine decoders.

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

The exact quotient is reusable when a short decoder offset would otherwise force an expensive Cartesian key sweep. The complementary encryption-side attack below handles a narrower multiplier bound. Neither attack covers larger coefficients, full-width offsets, cipher-specific page clocks, or another representation. Do not extend the same domain absent an independent clue selecting integer orientation, scale or receiving interval.

## Reproduction

Run `node sims/lp2_chapter_short_affine_tail_sft.cjs` from the repository root. The identical JS function was executed through connected V8 with actual canonical corpus and native reference inputs; standalone Node wrapper not executed. [Code](../sims/lp2_chapter_short_affine_tail_sft.cjs) frozen commit d48a037c31f982a002307e011ae2364edbbe5e05; [raw executed output and input blob IDs](lp2-chapter-short-affine-tail-output.json) commit c0caec11fda9fc5f838da9b79d02bc08458b2f71.

## Complementary encryption-side wrap quotient

A short encryption multiplier need not have a short modular inverse, so the preceding decoder-side result does not cover it. Freeze the same 716-rune source body and native training split. In this test the *high* physical end is the fit page, with the other pages held except the three low digits (offset uncertainty). Use

    C = A*P+B mod Q
    1 <= abs(A) <= 3301, 29 does not divide A
    0 <= B < M = 29^3.

3301 is a historically meaningful integer and a practical bound, not an authenticated coefficient selector. For positive a=A, P=(C+kQ-B)/a with k in 0..a-1. For negative A=-a, write P'=Q-1-P, so C=aP'+(a+B) mod Q. Then the same k range holds for the effective offset. Original and both plant ciphertexts have C>M+3301 and their low suffix beyond the fit page is also >M+3301. Therefore for **all** k,a and legal B, the high fit-page quotient digits are unchanged by subtracting the effective offset: writing the high-prefix division remainder as r*29^(N-fit)+C_low makes its lower bound exceed the largest offset. Negative-sign fit digits are the digitwise 28-minus complement.

For each a,k let D=floor((C+kQ)/a), r=(C+kQ) mod a. All valid offsets are B=r+ja, 0<=j<=floor((M-1-r)/a). The positive plaintext is D-j; the negative plaintext is Q-D+j. Their high 713 digits therefore occupy at most two intervals of j, determined by whether the three low digits cross a radix boundary. This gives exact offset equivalence classes, with independent BigInt forward replay of one representative per class.

Every one of **10,526,324** signed (a,k) high-prefix classes per orientation is scored on its first 32 high digits. Retain the best 512, rerank on the complete high physical fit page, freeze the winner, then compute all possible high-tail offset branches and score each untouched continuation. The prefix shortlist is heuristic: it is not exhaustive full-page ranking. Both synthetic controls' planted signed multiplier and wrap rank **first** at the short-prefix stage, remain first on the full page, and their selected offset class contains the hidden offset.

| Tape | Order | Fit mean logp | Held mean logp | A / wrap k | B progression |
|---|---|---:|---:|---|---|
| Native KOAN1 plant | BE | -2.447426 | -2.655616 | 1033 / 861 | 98..23857 step 1033 |
| Native LOSS OF DIVINITY plant | LE | -2.713768 | -2.792892 | -3301 / 532 | 2195..22001 step 3301 |
| Original p0–2 | BE | -3.374111 | -3.501083 | -1236 / 433 | 1069..23317 step 1236 |
| Original p0–2 | LE | -3.357185 | -3.493996 | -3227 / 837 | 3225..22587 step 3227 |

The controls recover 249/249 and 201/201 fit runes, plus 464/464 and 512/512 held high-tail runes respectively; the three low digits remain unidentifiable from these scores. The B progressions include the planted 17659 and 22001. All four winners have exactly one high-tail branch in these cases and the mechanical representatives replay. The two original continuations are nonprose and score below uniform GP29. The best original BE starts E A N N E NG E NG D L L TH G G O A L O W EA...; the LE rendered opening (includes the three arbitrary representative low digits) starts S AE F I N I A T OE U X T N B G S NG E EA D... . No claim of genuine words or keys. This closes the bounded receiver as a practical solve route absent independent key evidence; the prefix shortlist and two controls do not establish a universal exclusion.

Reproduce with `node sims/lp2_chapter_short_affine_wrap_sft.cjs`. The identical function ran in connected V8; standalone Node wrapper not run. [Code](../sims/lp2_chapter_short_affine_wrap_sft.cjs) 6ffe69ece12f5f1c98c627862b49c76bca68d784; [raw output](lp2-chapter-short-affine-wrap-output.json) 36975125208527ff5e6e0fe832799a8577d78765. No new source selector or unknown plaintext; do not repeat a larger generic scale/offset sweep.
