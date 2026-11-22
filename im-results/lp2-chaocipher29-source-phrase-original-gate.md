# Chaocipher disk-family original-cipher gate

**Decision (12 November 2026): bounded negative for one frozen GP29 Chaocipher extension.** No unknown LP2 plaintext, genuine disk key, complete historical inverse, or destination was recovered. This does not exclude every evolving-alphabet cipher.

## Historical and source gate

The 2010-public [Chaocipher algorithm](https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf), invented by Byrne in 1918, is a reversible two-disk changing-alphabet substitution. A solver might think of rotating alphabets after seeing circular motifs and solved p57's CIRCUMFERENCES / DIVINITY words. **That analogy is not an original cipher instruction.** Closed #469 already finds no rotor key or phase selected by the manuscript's Möbius art. Historical Chaocipher uses **26 Latin letters** and cannot directly emit the 29 distinct original GP29 rune identities. Any 29-symbol adaptation requires extra rules.

The [standalone CJS reproducer](../sims/lp2_chaocipher29_source_phrase_gate_sft.cjs) first validates the actual 26-letter published example: WELLDONEISBETTERTHANWELLSAID, left disk HXUCZVAMDSLKPEFJRIGTWOBNYQ, right disk PTLNBQDEOYSFAVZKGJRIHWXUMC, encrypts to exactly OAHQHCNYNXTSZJRRHJBYHQKSOUJY.

Only for the LP2 experiment, the published rotate/extract/reinsert rule is generalized to 29 GP indices, with a proposed zero-based nadir 14 instead of historical 13. The fixed initial disks are: 

- Left / outer CIRCUMFERENCES = [5,10,4,1,19,0,18,9,15,2,3,6,7,8,11,12,13,14,16,17,20,21,22,23,24,25,26,27,28].
- Right / inner DIVINITY = [23,10,1,9,16,26,0,2,3,4,5,6,7,8,11,12,13,14,15,17,18,19,20,21,22,24,25,27,28].

Each phrase contributes unique Roman letters in first-occurrence order followed by unused canonical GP indices. The Roman V maps to GP U index 1. These are deliberately frozen test conventions rather than authenticated Cicada key material.

All original p0–55 rune indices, including F and printed word/page joins, are deciphered both as a continuous book and with physical-page resets. The runeless p50 contributes no symbol. Each output is fully re-encrypted and checked against the original input. A 529-rune native GP English plant is enciphered and decoded perfectly; the swapped disks fail to recover this plant. Re-encryption of a wrong-key decoded original is still expected for every reversible cipher and is not key evidence.

## Original outcome and controls

The original unknown LP2 has **12,956 runes**, **12,901 within-page transitions**, and **86 same-rune adjacent pairs** (0.6666%). Seventeen fixed nonoverlapping full-book-length Shakespeare GP29 windows, put through the **same** specified reversible GP29 Chaocipher encoder, generate **420–488 repeats each**. Thus this specific named changing-alphabet construction does not naturally recreate the original adjacent-repeat deficit for ordinary GP-native prose.

The original candidate inverse produces index of coincidence **0.03444586** with no readable text. Its first 50 GP transliteration tokens are:

> O J O H P R T AE S Y B X D Y J H EA G X W EA IA I I IA I S R R TH D X Y R P E G OE C W P L G EA EO EA AE J EO M

A GP29 quadgram scorer trained on the first 120,000 Shakespeare symbols (alpha=0.1 additive smoothing), evaluated on a disjoint 12,956-symbol heldout control, returns mean natural-log four-gram scores:

| Exact sequence | Score |
| --- | ---: |
| Native GP English heldout | −10.694608 |
| Raw original LP2 | −14.328743 |
| GP29 Chaocipher inverse, fixed phrase disks, book-continuous | −14.326841 |
| GP29 Chaocipher inverse, wrong swapped disks | −14.333813 |
| GP29 Chaocipher inverse, wrong identity disks | −14.351972 |

The complete original ciphertext is exactly re-encrypted, but this confirms reversibility only. Both the natural-language control gap and the high output entropy remain. The SFT also prints the page-reset model, exact GP wheel arrays, source hashes, all 17 counts, and roundtrip controls.

For any key, any deterministic two-disk permutation maps an iid uniform 29-symbol plaintext to conditionally uniform next outputs, so same-ciphertext-rune probability is exactly 1/29 under that null. Across 12,901 source transitions the expected repeat count is 444.862; the binomial lower tail at 86 is about 10 to the power −97.9703. This is a distributional statement restricted to iid uniform source symbols; it cannot exclude specially structured plaintext or a genuine unidentified key.

## Evidence, limits and research decision

Source corpus: [LP2 canonical original-page indices](../resources/liber-primus/lp2-corpus.json) (blob SHA 054f2a0f780b7d46901acbe3d9bf4f0ac1801165); native register: resources/control/shakespeare_first300k.txt. Cipher history: [Rubin's 2010 historical Chaocipher algorithm](https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf) and independent [2010 reference implementation](https://github.com/kanaka/chaocipher/blob/master/chao.py). Distinct prior tests: [Playfair pair alignment](lp2-polygraphic-pair-alignment-gate.md), [lossless anti-repeat capacity](lp2-anti-repeat-lossless-capacity.md), closed #192/#241/#274/#381, and source-negative circular-art #469.

**Decision:** retire this one phrase-seeded, 29-symbol disk extension without a blind search of arbitrary disk keys, phases or variants. The paper's 26-letter mechanism and the puzzle's 29-rune corpus leave the historically necessary alphabet, key and reset selectors unprovided. An actual next solution requires original-source key/state evidence or a new independently motivated reversible architecture; low doublets by themselves do not identify one.
