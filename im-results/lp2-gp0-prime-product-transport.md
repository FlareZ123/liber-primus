# Literal GP0 BASE29 transport of Gematria prime products (#2629)

**Decision, 24 November 2026 (Agent 2): rejected.** A nonempty product of chart primes must be >1 and divide completely by those primes. Of 2,896 original groups, 2,192 have a residual factor outside the chart, one is zero, and four are one. The resulting 2,197/2,896 (75.86%) incompatible groups exclude this exact transport before any linguistic inference. No unknown plaintext/key recovered.

## Operation and evidence

Historical BASE29 and the chart motivate a reversible integer-to-multiset operation; neither the signed 2013 BASE29 instruction nor the 2016 words/numbers message specifies word-prime multiplication. The [historical PARABLE prime-product evidence](../results/2013-761-parable-prime-products.md) is a product of clause sums, a distinct operation. The [factor-direction](lp2-word-factor-direction-gate.md), [word-power](lp2-signed2013-base29-wordpower-allsecret-terminal-gate.md) and [NUMBER factor-index](lp2-2013-number-word-sum-factor-index-gate.md) studies do not decide this exact transport.

Freeze conventional big-endian GP0: N = sum(d_i 29^(L-1-i)). Factor with the first 29 chart primes (2..109) only, retaining multiplicities. A nonempty source word encodes as the minimal BASE29 digits of its prime product. Zero is invalid; one is the empty multiset, invalid for a nonempty group. Leading F in a multirune group is noncanonical. No shifts, arbitrary padding, alternate factor bases or key search.

Input: image-corrected transcription blob f7b534a33edeb212d427329798438325307463d7, corpus/GP chart blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, external solved reference blob 1b064ef6d85819b7d96adaff31a82d1ec551598f. Remove line/page breaks without splitting carries, preserve all other group delimiters, exclude numeric-only p50 and solved p56–57. All 57 rune-bearing physical page tapes match the corpus, and p0–55 parses to 2,896 groups/12,956 runes.

## Exact outcomes

| Printed length | Groups | Fully chart-factorable (>1) | Residual factor outside chart |
| --- | ---: | ---: | ---: |
| 1 | 83 | 79 | 0 |
| 2 | 448 | 344 | 103 |
| 3 | 720 | 220 | 500 |
| 4 | 513 | 43 | 470 |
| 5 | 317 | 10 | 307 |
| 6 | 256 | 3 | 253 |
| 7–14 | 559 | 0 | 559 |
| Total | 2896 | 699 | 2192 |

First original group ᛋᚻᛖᚩᚷᛗᛡᚠ has N=263878216824 and residual 379135369 after all chart divisions; the next two residuals are 1433 and 14557. The maximum consecutive run of fully chart-factorable groups anywhere is four. Of 116 leading-zero multirune groups, 50 are otherwise factorable; only 649 groups meet canonical nonempty representation (22.41%). No consecutive full-prefix decryption is possible.

Native positive controls: all 740 groups across nine pinned solved reference sections reproduce their exact integer and sorted factor multiset. This is a constructed forward/inverse control, not an authentic historical use of the product codec. The union register contains 272 distinct rune spellings in 266 product classes. Six exact ambiguity classes (BELIEUE/BELEIUE, FROM/FORM, WIDSOM/WISDOM, OWN/NOW, THREE/THERE, NO/ON) account for 19 ambiguous group instances; 721/740 are uniquely mapped within this small register. Original factorable groups match a register class only 20 times (including noncanonical encodings); these are isolated coincidences. Broader dictionaries can change lexical coverage, not the arithmetic impossibility. No language fitting or withheld scoring is warranted after the hard rejection.

## Reproduction and next decision

Run `node sims/lp2_gp0_prime_product_transport_sft.cjs` in a checkout. Core executed on the pinned inputs in the JS tool runtime; the standalone CJS wrapper is provided for reproduction. Output lists all factorable groups and factor vectors, native controls, first counterexamples and per-length counts. Stop this exact receiver: a different numeric representation requires a new independently supported source rule. This does not reject arbitrary encrypted prime products or other numeric grammars.
