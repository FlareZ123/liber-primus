# H(2013) × G(p39): bounded codeword-transfer test on original LP2 pages

**18 November 2026, Agent30. Classification: independently executed original-source computational exclusion, not an LP2 decipherment.** All 56 physical LP2 unknown pages remain unsolved. This test identifies one isolated polynomial coincidence and limits a direct existing table mechanism. It yields no authentic plaintext, key or final destination.

## Source-driven premise and competing explanation

The signed 2013 Cicada BASE29 worked example (`3301 → 3QO`) gives the three GP29 values [3,26,24]; the physically red p39 triad gives [27,5,15]. Reading these *conditionally* as ascending polynomial coefficients gives H(X)=3+26X+24X² and G(X)=27+5X+15X²=15(X−24)². Their product in GF(29) is HG(X)=23+21X+11X²+17X³+12X⁴. The 256 authentic printed base60 table cells, reduced modulo29 and treated as descending polynomial coefficients, divide by HG **with zero remainder**. This source relation and its 252-digit quotient predate the present test; see [the complete p50 source/algebra record](lp2-p50-hg-single-residue-correction.md) and [already tested quotient-to-key interpretations](lp2-hg-q252-rc4-original-inverse-gate.md).

A plausible player might discover the product factor and look for the **same structural codeword** in manuscript cipher paragraphs or whole pages. The strongest rival is that the exact H/G table factor is a checksum or an incidental postselected algebraic relation with no application to ordinary unknown-page rune ciphertext. Neither the manuscript nor authenticated historical material instructs using these GF29 factors as a plaintext decoder.

## Original-cipher test and exact outcome

Read the immutable [GP29 LP2 corpus](../resources/liber-primus/lp2-corpus.json) in page and rune order, omitting runeless p50. Each untouched string is evaluated in GF29 by four exact parity coordinates:

- P(24) and P'(24), both zero iff G divides P.
- The two coefficients of P mod (X²+18X+11), both zero iff H divides P.

The [single-file original-source CommonJS reproducer](../sims/lp2_hg_gf29_crosscorpus_codeword_original_sft.cjs) **passed the original Windows Node22 run** [44258959548](https://github.com/FlareZ123/liber-primus/actions/runs/44258959548). It asserts the source table's **four exact zero coordinates**, the historical 252-digit quotient prefix, and a positive control in which multiplication by HG followed by polynomial division recovers **95/95 authentic clear p57 GP29 symbols**.

| Frozen source input or operation | Exact observed outcome |
| --- | --- |
| Original p50 table, 256 residues | HG syndrome [0,0,0,0], quotient length 252 |
| All 12,701 contiguous 256-rune windows of pp0–55 | 11 divisible by G; 22 by H; **0 by HG** |
| All 57 physical rune-bearing pages pp0–57 | Exactly **p29** divisible by G; **zero** pages divisible by H |
| Original physical p29 (277 runes) | G quotient 275 symbols; H remainder [16,20]; quotient IoC **0.034054412740544125** |
| Continuous 12,956-rune unknown-cipher division by HG | 12,952-symbol quotient; remainder [24,14,9,0]; quotient IoC **0.034471523754023396** |
| Independent per-page HG division for all 55 unknown rune pages | Combined 12,736-symbol quotient; IoC **0.03452758985346836** |
| Independently clear p57 positive HG encode/decode | **95/95 symbols exactly recovered**, four zero remainder symbols |

The original untouched ciphertext has IoC **0.03447839786450569**, near the uniform GP29 value 1/29 ≈0.03448276. Both full-corpus inverses remain at essentially the same flat baseline, and neither opens a coherent original-Liber-Primus plaintext message. Their nonzero remainders also show that the exact original table **HG-codeword format does not carry over literally to the full 12,956-rune book**. The 256-window census gives a stronger, length-matched negative for transferring the table's four-parity layout to any contiguous original unknown runes.

### Isolated p29 G factor

Physical p29's 277 original runes give two exactly zero G coordinates. No other original physical page, including clear controls p56/p57, does. This is a reproducible **one-factor source observation selected after scanning all 57 pages**. It is only a necessary condition for a hypothetical G-coded page, and has no second H factor or decoded language. The page's G quotient still has near-uniform symbol frequencies. A natural rough uniform-residue model predicts only ~57/29² ≈0.0678 whole-page G hits; postselection and unknown actual ciphertext dependence make this a poor claim of Cicada authorship. P29's values at independent table-check points 8 and 17 are [18,28], differing from the table's independently proposed [27,15]. No authored original p29 clue identifies the H/G polynomial as its encryption.

## Cryptanalytic decision

**Reject a literal reuse of the table's HG checksum on untouched 256-rune windows and as a whole-book code.** The inverse polynomial division runs, has a known-source positive, but recovers no GP-native unknown plaintext. Preserve p29's isolated exact G divisor only as a low-priority, postselected structural fact. Do not multiply additional speculative GP29 field factors, page phases or key layers in an effort to rescue this branch.

A genuine continuation would require an independently sourced original-player instruction identifying **which actual ciphertext register** is subject to this GF29 code, including its boundaries, coefficient order and how its quotient encodes plaintext. The already negative direct Q252 key and prime-F consumers do not supply that operation. Other encoders, altered page boundaries and non-GP plaintext remain untested.
