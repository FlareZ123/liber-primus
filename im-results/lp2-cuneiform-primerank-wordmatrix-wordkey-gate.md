# 2013 prime ranks as a 10×29 word-key matrix: original p33–39 gate

**Agent 42, 18 November 2026. Classification: finite source-motivated negative; no unknown plaintext recovered.**

## Human solve-path hypothesis

The original p33–p39 cuneiform marks are conventionally read as **1033** and **3301**. In the recovered 2013 CicadaOS prime-echo list these are prime ranks **174** and **464**, both multiples of the 29-symbol Gematria Primus alphabet size. The primes *after* 1033 through 3301 inclusive are exactly **290 = 10×29** values (ranks 175–464; 1039–3301). This naturally forms ten rows of 29 prime-derived key values.

The authenticated 2013 prime-echo source supplies the prime sequence, and the solved p56 page supplies a concrete prime-totient operation: use \(\phi(p)=p-1\) modulo 29, with plaintext F transparent and non-consuming. The 2016 signed message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” A plausible human interpretation is that the 10 rows are selected by word ordinal modulo ten, while the 29 columns are consumed within each word. This is a compact, deterministic word-key hypothesis rather than an unconstrained key search.

**Weakest premise:** no first-party source explicitly says that word ordinal modulo ten selects a prime row, or that this 290-value interval is a word-indexed key matrix. The 2016 wording motivates word boundaries but does not specify the modulo-ten schedule. The test asks whether this economical composition actually fits the original text.

## Frozen receiver

1. Generate the original prime sequence through 3301 and select ranks **175–464**, the 290 primes **1039–3301**.
2. Partition the sequence in its original order into a **10×29** matrix. For row \(r\) and column \(j\), set \(K[r,j]=(p-1)\bmod29\).
3. Read the original marked cuneiform chapter: p33 after the printed ampersand marker at rune offset **91**, then p34–p39 in printed order. The source transcription yields **1,589 runes in 355 words**. Hyphens and periods delimit words; page boundaries do not split a continuing word.
4. For zero-based word ordinal \(w\), select row \(w\bmod10\). Reset the key column to zero at the start of each word. Consume one key entry per non-F plaintext rune. A plaintext F emits ciphertext F without consuming the key.
5. Invert with \(P=(C-K)\bmod29\), retaining both legal histories when ciphertext is F: transparent plaintext F (no advance), or an ordinary encrypted non-F symbol (advance). A non-F ciphertext may not decode to plaintext F.

The 10×29 matrix is fully determined by the two original cuneiform numbers and the 2013 prime list; there is no fitted key, phase, row offset, or language-dependent adjustment.

## Original-input result

The exact inverse has **no legal path for 47 of the 355 original words**. It has one path for 278 words, and no word has more than four paths.

The first contradiction is already decisive: zero-based word **13** is the one-rune ciphertext **P** (GP29 index 13). Its selected row is 3, whose first key value is also 13. Ordinary subtraction therefore requires plaintext F at a non-F ciphertext. That is forbidden by the p56 transparent-F rule; the only way to produce plaintext F is the non-consuming F bypass, which necessarily emits ciphertext F. No later rune or language score can repair this local contradiction.

## Positive control

The same matrix, row schedule, key clock, and F-bypass inverse were tested on the **95 clear runes of p57**, parsed as 20 words. Each p57 word was encrypted under the proposed rule and inverted with the same dynamic-programming decoder. The authentic plaintext path survived for **20/20 words** (some words also admit an alternate legal path). The original failures therefore arise from the original p33–p39 data, not from an implementation that cannot handle the transparent-F rule.

Reproduce from the repository root with:

    node sims/lp2_cuneiform_primerank_wordmatrix_wordkey_sft.cjs

The script checks the source page/rune alignment, 1033/3301 prime ranks, exact 10×29 key dimensions, all 355 original word inversions, the first contradiction, and all 20 source-native p57 positive controls.

## Decision

Reject this exact **word-ordinal-mod-ten / 10×29 prime-totient / p56-F-bypass** receiver for the marked p33–p39 chapter. It recovers no unknown plaintext or key. This does not exclude another use of the 2013 prime sequence, another interpretation of the 2016 word clue, or a different independently selected cipher mechanism. Do not rescue this failed model with word-index offsets, row rotations, per-page exceptions, or extra skips absent a new original clue.
