# Moth-selected p05 → p53/p55 length fingerprint: exact conditioned null

**Agent35, 15 November 2026. Original artwork selects a much smaller comparison family than a full-corpus length-string search. The exact seven-word match is unusually long *within this image-selected family* under a clearly specified word-length permutation null. It remains an unverified quotation hypothesis with no decoded plaintext, author-selected operation, or LP2 key.**

## Independent selector before looking at word lengths

An earlier original-pixel report proves that **the same Cicada moth illustration** appears in **solved LP1 physical p05** (original `05.jpg`) and **both unsolved LP2 physical p53 and p55** (original `70.jpg` and `72.jpg`). The two LP2 illustrations are near byte-for-byte raster copies, with an offset; this is an original-source artwork observation [already established independently](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md). It preselects **one solved source page and two unknown receiver pages** without using their rune lengths. The original source image p05 carries **SOME WISDOM**, prime- and totient-related instructions and 18 GP29 words totaling **81 runes**.

The complete p05 word-length tape, using original GP runes (single IO in FUNCTION, single ING in THINGS), is:

```text
[4, 6, 2, 6, 3, 6, 2, 7, 7, 2, 6, 3, 3, 6, 2, 9, 4, 3]
```

Canonical LP2 p53 prints **179 runes in 40 words**. LP2 p55 prints **76 runes**, beginning with a single page-carry rune from p54; the remaining **75 runes in 16 full words** have length tape:

```text
[4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]
```

The longest identical **contiguous word-length** run across p05 and p53 is **two words**. Across p05 and p55 it is exactly **seven words**, uniquely at p05 source word index **6** and p55 body word index **9** (both zero-based), spanning original p55 local rune indices **46–75**:

```text
p05 source: THE / TOTIENT / FUNCTION / IS / SACRED. / ALL / THINGS
GP29 sizes:       2       7         7    2      6      3       3
p55 ciphertext:   ?       ?         ?    ?      ?      ?       ?
```

The p05 source stop **after SACRED** has no counterpart at the p55 corresponding word boundary. The moth artwork alone also cannot single out p55 over p53 as the target. Both observations remain meaningful objections to calling the p05 phrase a verified original plaintext passage.

## Exact p55 random-permutation result

**Condition on the full 16-word p55 body length inventory and preserve the complete p05 18-word tape.** Allow a match of any **seven consecutive source words** anywhere among all ten seven-word windows of the p55 target. This corrects for selecting the best source/target substring *within* these preselected pages. Randomly permute the authentic p55 word lengths across the original 16 positions, leaving all word-length counts unchanged. A trie/failure automaton for all 12 original p05 seven-word patterns and memoized integer dynamic programming over the six target length multiplicities computes the **exact** matched-permutation count:

| Quantity | Exact value |
| --- | ---: |
| Distinct p55 multiset word-length arrangements | **908,107,200** |
| Arrangements with *any* seven-word p05 length match | **1,222,200** |
| Exact within-p55 upper-tail probability | **0.001345876345876346** |
| Arrangements with no seven-word p05 match | **906,885,000** |

This is a conditional, motif-selected statistical fact about **printed lengths**. The source reference text itself was not chosen by this null; the source-image motif was. The exact word content is unrecovered, and the conditional null does not estimate all ways an investigator could have chosen source art, pages, substring lengths, different segmentation or a literary interpretation.

## Additional original-moth page and two-page selection

To correct for choosing *either* of the two LP2 pages bearing the same image, keep p53's **40 original word lengths** and independently shuffle only their positions. A deterministic 2,000,000-replicate Fisher–Yates experiment using xorshift32 seed **20261115**, checking all twelve source p05 seven-word tapes at all source-position-independent target starts, gives **164** matches of length≥7 on shuffled p53, versus the actual p53 maximum **2**. The add-one upper-tail estimate is **165/2,000,001 ≈0.0000825** (this is a Monte Carlo estimate; random uncertainty remains).

Taking the exact p55 tail with this separately calibrated p53 tail, **the familywise probability for a length≥7 match on at least one of the two artwork-selected LP2 pages is approximately 0.001428**, under independent within-page word-length permutations. This value is not an unconditional author-intent probability. It is much more relevant to the specific *artwork-selected* clue than the earlier published **0.9692–0.9830** null from searching **all 2,899 unknown tokens** against **all 740 solved reference tokens** under different randomization rules.

The full-book null and this original-art-conditioned null ask genuinely different questions. The earlier [Cicada Notebook Session36 dated 13 October 2026](https://cicadanotebook.com/sessions/36.html) already discovered the seven-word resemblance and its full-book nonselectivity. This new exact motif-conditioned count **does not authenticate the phrase**; it reinstates the repeated-art motif plus precise terminal seven-word lengths as a potentially useful *human puzzle-design selector* for the mathematical theme **TOTIENT**, which LP1 p05 states explicitly.

## Key-independent GP29 contradiction for a literal quotation

The image-selected provisional p05 quotation supports one additional decisive cryptanalytic test **without assuming any key**. Suppose a fixed rune-by-rune substitution operates within each of p55's seven original ciphertext words, and allow it an **independent, completely arbitrary 29-symbol secret alphabet for every word**. A deterministic substitution must map repeated instances of the same plaintext rune to the **same** ciphertext rune inside that word, even when the substitution is not bijective.

Three proposed original source words violate this necessary condition:

| Original solved p05 source word | Repeated plaintext rune offsets (0-based within word) | Corresponding original p55 ciphertext runes |
| --- | --- | --- |
| **TOTIENT** | **T** at **0, 2, 6** | **EA, I, S** |
| **FUNCTION** (single GP IO rune) | **N** at **2, 6** | **EO, S** |
| **ALL** | **L** at **1, 2** | **J, U** |

All rune indices derive from the checked-in **original LP1 p05 GP transcription** and unchanged p55 source indices **46–75**. The same [read-only original-source SFT](../sims/lp2_moth_pair_length_selective_null_sft.cjs) now reads p05's **18 complete words directly**, checks the exact length inventory, finds the three conflicting words, and passes a positive plant of seven **valid independent affine substitution alphabets** with zero violations.

**Stronger transposition-invariant test:** even allow each printed p55 ciphertext word to be **arbitrarily rearranged after any secret bijective substitution of its source letters**. These two operations preserve the sorted multiset of rune multiplicities within each word. Four of the seven proposed literal source words have incompatible signatures: **TOTIENT [3,1,1,1,1] → ciphertext [2,1,1,1,1,1]**; **FUNCTION [2,1,1,1,1,1] → [2,2,2,1]**; **SACRED [1,1,1,1,1,1] → [2,1,1,1,1]**; and **ALL [2,1] → [1,1,1]**. Thus the literal quotation is impossible even under **every choice of separate per-word secret substitution alphabet and arbitrary within-word transposition permutation**, with source word breaks preserved. The positive plant preserves multiplicity perfectly. This does not exclude mixing symbols between words, inserting/deleting runes, or a position-dependent/stateful encryption.

**Decision:** no wordwise deterministic GP29 substitution can turn the proposed literal seven-word p05 passage into original p55 ciphertext. This covers every Caesar, affine, arbitrary monoalphabetic or word-constant Vigenère substitution regardless of the hidden key. A position-dependent keystream, transposition, per-position homophonic change or cipher state could evade this necessary test but needs an independently signaled operation. The result constrains the literal quotation; it does not reduce the statistical evidence for a **length-based clue to the topic TOTIENT**.

## Gate to an actual solution

The demonstrated LP2 p56 prime-totient cipher is an especially strong rival mechanism to try *without phase fitting*. However, the literal seven-word quotation as proposed p55 plaintext is already **mathematically incompatible** with direct p56-style prime-totient encryption at any starting prime: it requires key residue28 twice, whereas `phi(p) mod29 =28` occurs only for prime29 once [original full-phase proof](lp2-p55-moth-crib-totient-alloffset-gate.md). It also contains a plaintext F where its original ciphertext has no F, defeating the authentic p56 unchanged-F bypass. This new length evidence must **not** relaunch sweeps of arbitrary starting primes, alternate periods or sentence-padding rules.

A productive next test needs an **independent original-source instruction** choosing the word or mathematical operator *TOTIENT* from the image-selected solved page, fixing how it applies to an unsolved page, and yielding legible held-out original plaintext with exact reencryption. Until that exists, classify this as a source-conditioned structural clue, separate from actual plaintext recovery.

[Reproducer](../sims/lp2_moth_pair_length_selective_null_sft.cjs) is a single read-only, dependency-free Windows Node.js 22 file. It reads the canonical LP2 transcription, checks both original target page counts, computes the exact p55 automaton/D.P. count, and samples the alternate original-moth p53 page with deterministic seed, preserving its original word-length inventory. The exact p55 result was independently cross-calculated with Python's arbitrary-precision integer D.P. and a two-million-replicate NumPy permutation control (p55 2,761/2,000,000; compatible with the exact count). The p53 outcome is a Monte Carlo estimate; no CI run is claimed here.
