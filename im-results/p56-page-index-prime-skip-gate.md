# p56 page-index-skip hypothesis: rejected

## Why this was tested

Michel Oosterhof's historical `stage11/56.py` hard-codes `skip = 56` while applying the p56 numerical stream. Read in isolation, that creates a tempting hypothesis: perhaps physical page `p` passes local rune `p` through unchanged.

That interpretation is **not the established p56 mechanism**. The better preserved community decoder in the pinned `krisyotam/cicada3301` archive defines p56 as:

```
FN = r - (PRIMES[i] - 1)
INTERRUPT = F
INTERRUPT_POS = [4]
```

That is the consecutive **totient-of-prime** stream, because `phi(p)=p-1`, with the fourth F occurrence acting as an interrupter/null. A later independent adjudication likewise recovers one F-null. The old script's skipped absolute offset happens to be 56 because that fourth F lies there; the page number does not select the skip.

## Exact falsification that was run

Before the interrupter provenance was recovered, the literal page-number hypothesis was applied to every rune-bearing LP2 page:

```
if local_position == physical_page_number:
    emit the ciphertext rune unchanged
    do not advance the prime stream
else:
    plaintext = ciphertext - (prime - 1) mod 29
```

The canonical input is `resources/liber-primus/lp2-corpus.json`; reproducer:
`sims/p56_page_index_prime_skip_sft.cjs`.

## Control and unsolved result

The rule reproduces p56 because its one real F-null is indeed at local offset 56.

- p56 control IoC: **0.070028011204**
- maximum unsolved IoC: **p51 = 0.038461538462**
- next: **p36 = 0.038364712974**
- minimum: **p49 = 0.029836829837**

The p56 control plaintext is reproduced exactly:

```
ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTO
ITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE
```

No unsolved page shows a comparable transition.

## Consequence

The page-number hypothesis is closed twice over: its causal premise is wrong once the F-interrupter source is restored, and its exact full-corpus transfer is negative.

Do not build successor searches around “skip rune equal to page number.” Any p56-derived transfer must preserve the actual source mechanics: consecutive `phi(prime)` shifts plus an independently justified F-interrupter policy. Broad prime/totient reuse on unsolved LP2 has substantial prior negative coverage, so a new test needs a source-selected interrupter/state rule rather than another free F-mask sweep.

## Source-selector audit (Issue #161, 2026-11-11)

The original p56 image and its page-level ink annotation do **not** select rune offset 56:

- \`resources/liber-primus/lp2-ink-annotations.json\` records only a red span at offsets **0–4** and large-dot events after offsets **5, 45 and 85**. There is no colour span, large punctuation, or annotated separator at offset 56.
- In the original rune transcription, offsets **55–56** are the ordinary two-rune word \`ᚱᚠ\`; the F glyph at 56 is its final rune, followed by the ordinary word separator. It is not a line boundary or a separate punctuation token.
- The page has five ciphertext F runes at offsets **35, 47, 51, 56 and 74**. The selected event is the fourth F, not a visually distinguished glyph.

There is a genuine earlier cipher precedent for **F as a possible non-consuming interrupter**, but it does not select this occurrence. The authentic LP1 Vigenère controls recover literal-F positions **[48, 74, 84]** for DIVINITY and **[49, 58]** for FIRFUMFERENFE, with exact plaintext and skip-mask positive controls (\`im-results/lp2-historical-vigenere-skip-viterbi.md\`). This supports a recurring Cicada cipher convention; it does not say which of p56's five F runes is the interrupter. The p56 fourth-F choice is recovered by the language/Viterbi traceback in \`im-results/prime-totient-unknown-index-literalF-recovery.md\`, not by an original p56 mark.

The adjacent solved p57 is direct cleartext, not an encrypted prime-totient control. The LP1 pages therefore validate only the broad F-interrupter convention, not the p56 prime-stream clock or its specific pause position. Existing unknown-page tests of the p56 prime-totient family do not recover English; no unknown-page behavior is established.

**Issue #161 verdict:** retain the p56 plaintext and prime-totient inverse as verified. Treat the offset-56 event as an **unexplained, page-specific decoder exception**, consistent with (but not position-selected by) the earlier F-interrupter convention. Neither the page number nor any original visual/textual feature independently selects this pause. Do not generalize the p56 exception to unknown pages.
