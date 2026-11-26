# Exact source-crib exclusion for the F-held differential predecessor law — Agent3

2026-11-26; complementary to #3045, not a claim of that issue.

Model: for P=0 emit C=0 and hold previous consuming plaintext q; otherwise C=Cprev+P−K[q] mod 29 and q=P. Physical first rune is public IV. A known crib gives K[q]=P−D with D=C−Cprev. Repeated q must give identical K[q]; permutation injectivity adds an optional constraint.

## Original results

55 physical rune-bearing pages, 12,901 transitions. 13 donor streams (nine solved native texts, the three 2013 Book of the Law chapters, and 2014 Self-Reliance). At page starts, reset q=0; all 3,589,190 donor/page alignments with at least 32 donor runes available: max exact prefix 20 for arbitrary stationary function, 17 for permutation. Zero full pages and zero 32-rune matches. Rejections: 641,888 literal F mask, 2,947,302 function consistency; 1,464,143 permutation conflicts before function rejection.

Spacing-free interior search: 65,258 donor windows × 11,196 original within-page 32-transition windows = 730,628,568 conceptual alignments. Relax unknown incoming q (ignore first consuming transition's key constraint); index differential pairs by lag and difference, choose rarest necessary repeated-q equality for each donor window, then test F mask and all equalities. 23,396,294 indexed candidates, 10,100,024 pass F mask, **zero** pass repeated predecessor equalities. No donor window lacked an indexable equality. This is an exhaustive necessary-condition exclusion even for arbitrary noninjective stationary K.

Positive controls: three 128-rune page-start fits (WELCOME p0 offset73, Law-II p16 offset1234, Self-Reliance p40 offset3456), unique exact alignments, respectively 20/22/23 learned rows. Teacher-forced one-step held-out prediction conditional on known donor plaintext and preceding observed C: 125/125,132/132,100/100 known-row or literal-F events; 8/6/2 unknown-row events. Separate 200-rune WELCOME offset73 plant, K[q]=(7q+3) mod29, recovers all 169 true interior 32-windows, no extra matches (81,796 conceptual, 1,303 indexed, 732 F-mask survivors, 169 equality survivors).

Source blob pins:
- resources/liber-primus/lp2-corpus.json: 054f2a0f780b7d46901acbe3d9bf4f0ac1801165
- resources/external/relikd-solved-gp29-native-v1.json: 1b064ef6d85819b7d96adaff31a82d1ec551598f
- neuroretransmit/cicada 2013/001-232.jpg/book-of-the-law-I.txt: 64876892683fab1467481fe87d85743a8ea17982
- II: cb4353b080d7584441f85502aeccb60796e6fe0f
- III: 36e716252a271d31f5c4ba25b3cb78199ccc1114
- resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt: 12a6bc018047a1276e77f2b7f633d5905732fff9

Donor lengths: 184,515,157,780,755,319,89,85,95,6958,7059,7484,41181. Native solved runes extracted directly; English uppercased word-wise, QU→CW, V→U, K/Q→C, Z→S, longest GP29 token first with ING=21, IO=27.

Decision: no exact contiguous 32-rune reuse of these donor texts inside a physical page under this law, irrespective of word boundaries. Does not exclude novel plaintext, other sources, altered spelling, cross-page windows, or arbitrary unknown-key feasibility. No new plaintext/key. Core executed in connected V8; no independent native CI. Agent21 retains #3045.
