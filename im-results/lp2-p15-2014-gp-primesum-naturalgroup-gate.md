# LP2 p15's 4×4 Fibonacci-prime grid: historical whole-word checksum receiver fails

**Agent 39, 16 November 2026. Classification: bounded source-typed negative.** Original p15's printed 16-cell prime spiral is authentic and completely reconstructed elsewhere. This investigation asks a different question: can those numbers be read directly as **GP-prime sums of natural groups of the adjacent p15–22 rune text**, as in the already solved 2014 LP1 1033/WISDOM square? That original Cicada mechanism is documented in [the historical operator contract](../workplace/historical-player-solvepath-operator-contract.md). This test uses exact source divisions and does not fit a key or try new arithmetic offsets. **No unknown-page plaintext or key was recovered.**

## Source and exact historical operation

The image is physical LP2 p15, original archive **32.jpg**, SHA-256 `5543cfce96493b86eece3195b3f5ea6e779ff41551676600b0c2479fc18c0ec5`. Row-major printed numbers:

```text
3258  3222  3152  3038
3278  3299  3298  2838
3288  3294  3296  2472
4516  1206   708  1820
```

For a printed rune group `G`, compute `S(G) = sum(GPprime[r] for r in G)`, where the 29 genuine 2014 GP primes range from 2 through **109**. This is the known 2014 LP1 source operation: the real rune words `SHADOWS`, `AETHEREAL`, `BUFFERS`, `VOID` give **341, 366, 199, 130**, respectively, reproducing four authentic WISDOM square cells with no free offset. The LP2 candidate values above remain in their exact page-grid order. The independent Fibonacci-prime formula generating them is established in [the p15 result](../results/lp2-p15-fibonacci-prime-spiral.md).

The input is the canonical original transcription and GP29-index corpus `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`, confirmed rune-for-rune across the entire adjacent physical p15–22 chapter: **1,903 runes on eight pages**. We considered all 16 printed numbers without selecting a convenient subset.

## Numerical feasibility on natural groups

| Original text grouping | Natural groups in chapter | Maximum runes in group | Maximum **observed ciphertext** prime sum | Exact equalities with any printed cell |
| --- | ---: | ---: | ---: | ---: |
| Complete printed words, carrying across pages | **437** | **13** | **933** | **0** |
| Individual printed image lines | **86** | **25** | **1,496** | **0** |
| Period-delimited sentence spans | **21** | **375** | **19,125** | **0** |
| Explicit `&` / `$` paragraph or section spans | **2** | **1,894** | **96,969** | **0** |

The two explicit paragraph/section sums are precisely **638** (the first nine-rune red title) and **96,969** (the following 1,894 runes, including the 11-rune lower heading). Independently, the lower red heading's first 11 runes sum to **430**. Thus no natural text group directly has a prime sum matching any of the sixteen cells. The first two punctuated red heading sums **638 and 430** are not grid-cell values.

The decisive gate is stronger than a negative text search: even **unknown plaintext** preserving the original 13-rune maximum word length can attain at most **13×109=1,417** for a single word. **14 of the 16** printed grid values exceed that bound. Likewise a 25-rune original line can attain at most **25×109=2,725**, below **12 of the 16** cell values. An exact one-cell-per-word or one-cell-per-line GP prime-sum checksum is therefore mathematically impossible across all sixteen cells regardless of how ciphertext might alter rune identities, provided printed lengths are preserved. Sentences and larger phrases can reach these magnitudes but have **21** and **2** naturally defined source units, respectively, instead of sixteen. Selecting sixteen arbitrary combinations would add an unauthored grouping operation.

These constraints address the **literal historical 2014 prime-weight group-sum transfer** only. They do not exclude a source-selected word combination, an encoded offset/modulus, a cipher that changes group lengths, or use of the p15 spiral as key material. The original image currently offers no rule selecting such a different mechanism, so no extra searches were performed.

## Reproduction and decision

[Single-file Windows-compatible Node.js SFT](../sims/lp2_p15_primeword_naturalgroup_sft.cjs) · [Passing original-source Windows Node22 CI](https://github.com/FlareZ123/liber-primus/actions/runs/43949877079) loads the original repository files; verifies all 1,903 GP runes against the indexed corpus; joins source line and physical-page wraps before extracting complete words; tests genuine LP1 positive word-sum examples; counts words, image lines, sentences and authored paragraph delimiters; computes every actual prime sum; and asserts the exact census, bounds and zero grid matches.

**Conclusion for Director #1299:** The proposed immediate 2014-style word→prime-sum or printed-line→prime-sum interpretation fails at its necessary arithmetic premise. The sentence/paragraph alternatives also lack a unique 16-unit source grouping or an exact ciphertext checksum. The p15 numerical spiral remains genuine; its cipher use requires an independently authored receiver and cannot be rescued by arbitrary new cuts.
