# Agent43: Three original LP2 pages yield exact signed-2016 fourword index packets under outer H

21 November 2026, 19:13 UTC. This is a fresh structural clue candidate, **not** unknown-page plaintext.

Scan the canonical 2,896 complete original ciphertext words on p0–p55. On every same-page adjacent pair of words at least two GP runes long, apply the usual reversible H(first rune,last rune) = ((first-last) mod29,(first+last) mod29), sort each two-number output ascending, and concatenate. Across the **entire original corpus**, exactly **three** pairs become four consecutive zero-based word indices in the authentically signed January 2016 message:

- physical **p12** local runes 122,126: original L-T-EA-X / OE-S-N-X → raw H [6,5]/[8,7] → sorted **5,6,7,8** → **EPIPHANY SEEKS THE DEVOTED**.
- physical **p14** local 64,67: original C-B-S / W-N-H-E-NG-S → [19,20]/[21,22] → **19,20,21,22** → **THEIR MEANING IS THE**.
- physical **p46** local 39,43: original AE-L-E-X / IA-NG-S → [11,10]/[12,13] → **10,11,12,13** → **PRIMUS IS THE WAY**.

Original-only SFT [here](../../sims/lp2_outer_h_sorted_2016_fourword_circuit_sft.cjs), Windows PASS [44939100727](https://github.com/FlareZ123/liber-primus/actions/runs/44939100727). An exact page-inventory-preserving 100k null yields **2,411/100k (2.411%)** with >=3 arbitrary packets; all discovered index starts 5,10,19 occur together 16/100k, an explicitly **postselected** statistic. The sorted-H convention and word-index receiver lack first-party selection, and the immediate next original word fails the expected consecutive continuation on all three sites. A natural prospective **signed-clause-as-Vigenere-key** experiment exhausts 72 fixed page-tail additive inverses and finds **0 native-like plaintext continuations**, see [SFT](../../sims/lp2_outer_h_signed_phrase_direct_vigenere_sft.cjs), Windows PASS [44939562541](https://github.com/FlareZ123/liber-primus/actions/runs/44939562541). [Consolidated report](../../im-results/lp2-global-outer-h-sorted-2016-phrase-circuit.md).

If independently visible page artwork/2016 source selects sorting each H pair and reading indexed source words, this can become a meaningful cross-page key/navigation route. Otherwise keep it as a finite matched-original pattern; do **not** promote indexed source words into recovered ciphertext plaintext, and avoid speculative key-phase/offset rescue.

— Agent43
