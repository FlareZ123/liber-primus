# P27↔p55 original 76-rune two-time-pad: exact all-affine word inverse

**Decision (15 November 2026, Agent8):** The unique published p55/p56 → p27 seven-rune seam makes a specific same-pad attack possible. Under **both original word boundaries and source-native CMUdict English vocabulary**, **every shared additive GP29 pad with arbitrarily unknown, separately invertible affine transforms on the two plaintexts is impossible**. This is a new original-input conditional exclusion, not an LP2 decryption, source-selected key or proof that the repeated ciphertext was deliberately paired.

## Authentic input, clue and receiver

The original LP2 p55 ends with six GP29 runes **D-J-U-B-E-I** (two complete printed words). The original p27 at local offset28 contains that exact six-rune pair, followed at local34 by **AE**, whereas the very first rune of p56 is **AE**. Thus p55's final six runes followed by p56's first produce the unique seven-rune directed page-seam bridge to p27 local28–34. Independent enumeration and original-artifact controls: [existing exact seam SFT](../sims/lp2_p55_p56_p27_seam7_sft.cjs). It is a ciphertext duplicate, not plaintext evidence.

The p27–32 visual chapter has **1,433** runes, including its printed heading. The bookend fixes a 76-rune page55 comparison: starting at p27 chapter-local **1391**, read its final42 runes and then its first34 cyclically. In this order both 76-rune strings end in the same six-rune pair. Original source segmentation is preserved: p55 contributes **17 page-local word fragments**, with its leading single rune continuing the preceding p54 word, so **all 29 plaintext runes are permitted at that site**. Its other 16 fragments retain complete printed word boundaries. The aligned p27 section crosses **16** printed word fragments. The first p27 fragment is **the final six symbols of a full nine-rune word**, and the other fragments retain their own complete word boundaries. There are 28 partially overlapping word-pair intervals in the 76-slot alignment.

The cyclic backward walk is motivated by bookend registration and the book's circumference imagery. **Neither a same-pad operation nor a cyclic walk is independently authorized by a Cicada cipher instruction.** These are the strongest conjectural premises.

## Exact lossless family, eliminating all unknown key values

At each aligned slot i, consider two independently printed ciphertexts `A[i]` (p55) and `B[i]` (p27). Grant an entirely arbitrary *reused* pad `K[i] ∈ GF(29)`, as well as wholly unknown separate nonzero plaintext scales and separate intercepts:

```text
A[i] = alpha*Plain55[i] + u + K[i] (mod 29)
B[i] = beta *Plain27[i] + v + K[i] (mod 29)
```

This is reversible given the pad and each nonzero scale. Subtraction cancels **all 76 unknown pad values**:

```text
delta[i] = A[i] - B[i]
         = alpha*Plain55[i] - beta*Plain27[i] + offset (mod 29)
offset   = u - v
alpha,beta ∈ {1,...,28}; offset ∈ {0,...,28}
```

It is enough to show that the resulting exact difference stream cannot be covered by two native-GP English word sequences with the **unchanged** source word boundaries. The dictionary is the pinned `cmudict==1.1.3`; orthography follows the independently solved LP1/p57 GP source register, including ING→NG and IO→IA contractions. Its 115,662 unique rune-encoded word types supply all complete-word domains; the p55 leading page carry is deliberately unconstrained. The six-symbol partial word at the p27 cyclic seam is granted *every six-rune suffix* of a length-nine dictionary word, not incorrectly treated as a complete six-rune word.

For each intersection of one word in each stream, exact arc consistency retains only pairs satisfying the modular difference equation. At the longest first intersection, p55 word index7 and p27 fragment index6 overlap at positions **25–32** (eight GP29 runes). The observed difference is **[20,7,4,18,10,10,10,11]**. For arbitrary affine slopes, subtract its first equation from the next seven: this determines a necessary seven-component vector and eliminates the unknown offset algebraically. Exhaustively testing all **784** slope pairs against both native word domains gives exactly **four candidate pairs** and **three slope/intercept triples**:

| `alpha,beta,offset` | First overlapping candidate word pair |
| --- | --- |
| `1,4,15` | MISUNDERSTAND ↔ BACKPACK |
| `1,4,15` | MISUNDERSTOOD ↔ BACKPACK |
| `14,1,18` | GEOPOLITICALLY ↔ GARAFOLA |
| `15,28,27` | SCHWARTZCHILD ↔ ELDERMAN |

The **ordinary** same-pad model `alpha=beta=1,offset=0` has zero matches already on this eight-rune intersection. Each of the three surviving affine parameter triples is then independently impossible at another **seven-rune intersection, positions48–54**, between p55 word index11 and p27 fragment index10, regardless of any secret pad. This second failure occurs in the first arc-consistency pass; no lexical page completion or pad fit remains possible.

## Original-cipher execution and positive control

The Windows Python 3.12 [single-file original-cipher SFT](../sims/lp2_p27_p55_affine_twotimepad_sft.py) verifies original corpus identity and printed-word parsing, computes the unique anchored window, builds all native GP word domains, exhaustively enumerates every affine first-overlap witness, and performs an exact second-overlap rejection. **It ran successfully on GitHub Actions**: [source run 43688276874](https://github.com/FlareZ123/liber-primus/actions/runs/43689923755), Windows-latest, `cmudict==1.1.3`. The final source-native CI rerun also grants all 29 possible plaintext values to the page55 leading p54 carry. The CI script asserts the exact four witness pairs, three triples, all three second-overlap failures and the first direct-shared-pad failure.

A **fully synthetic 76-rune two-message native-word plant** is encrypted with 76 independently secret uniform GP29 pad values, `alpha=17,beta=6,offset=10`, and is accepted by the very same arc-consistency decoder. Exact forward/reverse rune recovery is separately asserted on that plant. This ensures the original failure cannot be explained by an algorithm that simply rejects all instances.

## Scope, decision and shortest next route

The result excludes one source-anchored **shared** 76-symbol additive pad family, including separately unknown affine plaintext alphabets, *only* for the pinned source-native English dictionary and original observed printed word boundaries. It does not exclude a one-time pad used independently on each page, a nonlinear substitution outside the affine group, alternate source language, changing segmentation, separately encoded null symbols, altered cyclic alignment, or an external key. In particular, it does **not** decrypt any part of p27 or p55 and cannot authenticate the source-intended purpose of the unique seven-rune seam.

The p27↔p55 source echo still supplies a useful **navigation constraint**: a subsequent route should identify an actual Cicada-authored instruction that specifies how to consume this repeated phrase, and should predict fresh original ciphertext without tuning alphabet, pad reuse, phase or traversal. Ordinary fresh guesses about affine pad orientation are now unnecessary. Distinct earlier direct p27-window additive tests are preserved at [reverse76 direct-key gate](../sims/p55_p27_bookend_reverse76_gate.cjs); the different p48/p52 exact-word two-time-pad test is at [p48/p52 gate](../sims/p48_p52_two_time_pad_word_ac_sft.cjs).
