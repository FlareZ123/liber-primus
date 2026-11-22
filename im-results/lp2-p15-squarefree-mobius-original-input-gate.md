# Original p15 Fibonacci-prime square: isolated Möbius row and full-text inversion gate

**22 November 2026, Agent17; status:** new source-arithmetic observation and bounded two-operation original-cipher rejection. **No recovered unknown LP2 plaintext, creator key, authenticated cipher, or continuation destination.** [Windows Node22 PASS 44991086752](https://github.com/FlareZ123/liber-primus/actions/runs/44991086752).

## Plausible human path, source evidence, strongest objection

The original physical LP2 p15 raster `32.jpg` prints sixteen integers in a 4×4 square. The known first-party construction takes the first sixteen distinct Fibonacci values `0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`, uses `p_(F+1)` in one-based prime indexing, and prints `abs(3301-p_(F+1))` in a specified spiral from red3299. See [established source reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md). This exact operation is not new.

An authenticated **2013** Cicada `0_wisdom` rune source independently prints **MOBIUS** as a cell of its 5×5 square, alongside the explicit prime/totient text. Its preserved source rendering is [2013-0-wisdom.txt](../resources/external/2013-0-wisdom.txt). This makes the **arithmetic Möbius function** a plausible mathematical operation to inspect, although the word could also evoke the topological Möbius strip and no direct application to LP2 p15 is instructed.

The **new fixed-source observation** is that applying `μ(n)` to all sixteen physical p15 numbers, without rearranging the square or inventing a key, yields **an entire unique squarefree second row, every other cell non-squarefree**:

```text
Original p15 integers      Arithmetic Mobius mu(n)
3258 3222 3152 3038       0   0   0   0
3278 3299 3298 2838      -1  -1  -1  +1
3288 3294 3296 2472       0   0   0   0
4516 1206  708 1820       0   0   0   0
```

Thus the source-selected 16-cell **nonzero Möbius support is precisely the visually second row**, with signs `[-1,-1,-1,+1]`. The original row arithmetic is grounded by a code assertion of every cell against the author's known Fibonacci-indexed prime formula. This exact structural fact was not a previously recorded p15-source claim in the checked corpus.

**A descriptive rarity comparison, not a p-value.** Hold the *same sixteen* Fibonacci-indexed primes and printed spiral mapping fixed. Replace the particular 3301 subtraction anchor by each one of **1,300 odd counterfactual anchors 2001,2003,...,4599**. Precisely **five** yield the same isolated squarefree second-row support: `2185,3301,3409,3625,4309`. All five retain this row assignment. The comparison is explicitly *post-discovery*, with an arbitrary finite range; it cannot establish intentional authorship or a calibrated probability after competing possible number-theoretic functions were available. It does establish that the row isolation is not a generic property of an arbitrary odd subtraction anchor in that fixed family.

## New literal decoder gate: true Möbius inversion, with no secret parameters

The mathematically canonical operator associated with `μ` is **Dirichlet/Möbius inversion**, a reversible transform on an indexed numeric sequence. If the original underlying GP29 plaintext values are `P(1)..P(N)`, the divisor-sum enciphering operation and its unique inverse are

```text
C(n) = sum_{d divides n} P(d)            mod29
P(n) = sum_{d divides n} mu(d)*C(n/d)    mod29
```

The converse cipher `C=μ*P`, `P=ζ*C` is also a canonical orientation; we test exactly these two directions, one-based `n`, retaining original rune boundaries. No shift, offset, alphabet permutation, phrase crib, fitted seed, matrix, word-frequency optimization, variant start, or hidden byte input is introduced.

**Original input:** start at the first black text after the **two p15 red headings**, physical p15 source offset20; continue through all pp16–22 unchanged. The original p15..22 source pages have exactly **1,903 runes** and after the fixed twenty-rune heading exemption have **1,883 ciphertext runes**. All source runes and the 18 authentic complete printed singleton-word positions are validated against both [canonical 29-index text](../resources/liber-primus/lp2-corpus.json) and [original word-boundary transcription](../resources/lp2-transcription.txt). This physical chapter is the natural receiver of the p15 source table, although the source doesn't tell us to perform Dirichlet inversion in that chapter.

| Original full-span test | Unchanged original | Decode via μ (inverse ζ) | Decode via ζ (inverse μ) |
| --- | ---: | ---: | ---: |
| Runes | 1,883 | **1,883** | **1,883** |
| GP29 index of coincidence | 0.03450922539 | **0.03454647348** | **0.03423437965** |
| Original printed singleton words decoded to A, I or O | **2/18** | **4/18** | **2/18** |
| Exact original re-encoding under its declared cipher | n/a | **1,883/1,883** | **1,883/1,883** |

Both inversions leave letter concentration close to the GP29 uniform level and predict **14 or 16 illegal one-rune English words** under the already-authenticated GP29 English spelling. They produce no coherent contiguous original prose. Their algebraically perfect replay of original ciphertext is necessary for implementation correctness, not evidence the operation is historical.

**Independent native-source positive:** repeat original clear GP29 p57 to the same full 1,883-rune length, overwrite the 18 matching original singleton positions with true A/I/O, encipher once with the authentic divisor sum and once with its Möbius inverse, then use the opposite transform. Both recover **1,883/1,883** native-source runes exactly, including all true 18 singletons. Thus the original negative is not from a broken μ sieve or inversion orientation.

## Cryptanalytic decision

Retain the full second-row Möbius/squarefree support as a **provisional, potentially intentional original-image math clue**, because there is an independent creator-era MOBIUS lexical antecedent. The observation by itself does **not** identify which page, receiver, operation, original key or stopping rule is intended. The expected literal mathematical inversion fails on the original full p15–22 source. **Do not promote the row to a key or unique decoding instruction solely because a small counterfactual comparison looks selective.**

To make this actionable, the next source must tell a human how to consume the four nonzero **positions or signs** in a full-rune cryptographic process, and that process must recover an untouched long original passage with forward replay. Blind four-vector Hill matrices, four-pixel masks, grid transpositions or phase searches would violate this requirement.

Reproducer: [single-file read-only Windows Node22 CJS source SFT](../sims/lp2_p15_mobius_squarefree_dirichlet_original_sft.cjs). Manual Actions [44991086752, success](https://github.com/FlareZ123/liber-primus/actions/runs/44991086752), checked on original source and positive ciphertext.
