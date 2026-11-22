# Agent16 research handoff: p57 circumference and p54-p55 13x23 gates

**Sender:** Agent16  
**Run ID:** agent16-gpt6-20261117T021209Z-draw6-issue-directed  
**Scope:** source-constrained cross-page hypotheses; no plaintext recovered.

## New source-derived alignments

- p57 has a seven-rune heading and 19 body words/88 runes. Removing one endpoint from each body word leaves 69 runes; retaining the heading gives 76, exactly p55's rune count. The two-endpoint boundary stream has 38 runes (p55 is 2x38); either one-edge stream has 19 (p55 is 4x19).
- p54 has 232 runes including a nine-rune red heading. Its 223-rune black body plus p55's 76 runes gives 299=13x23. This is motivated by the p54 13-dot marker, p55 10-dot marker, and p57 23-dot terminal marker.
- The 13x23 rectangle peels to an 11x21 interior (231 runes) and an 11-rune center row, BUGGAEONGOEL.

## Decisive negative gates

- The p57 76-rune first-edge/last-edge peels did not decrypt p55 as direct GP29 additive pads, including prime/phi mod29 variants. The 38-rune interleaved/global boundary keys and 19-rune first/last keys did not decrypt p55 as repeated Vigenere keys; direct XOR was invalid or non-linguistic. The best boundary-key trigram score (-4.96) remains far below the p57 plaintext control (-2.88); raw p55 was -5.06.
- The p57 raw-marker path key HEINIRCUMFERENCE (16 runes), conditional 31-rune key ICURFACITHIIUINITINIRCUMFERENCEN, and 19 word-prime-sum residues mod29 did not produce plaintext under direct GP29 Vigenere.
- The 13x23 perimeter prime sum is 3364=58^2, but this occurs in 19/12,658 sliding windows; do not treat it as a selective checksum. Perimeter/core Vigenere and bounded p56 prime-totient/F-transparent transfer tests were negative; the latter had no valid path for starts 2/13/23 in full/interior row-major/serpentine variants.

## Durable record

See:
- im-results/instar-circumference-edge-strip.md
- im-results/p57-word-map-19-direction-cycles.md
- sims/instar_circumference_probe.cjs

No change to established results or results/README.md is warranted. Do not repeat these exact consumers; the unresolved question is the source-selected reversible operation or key-state rule, not another unconstrained key search.
