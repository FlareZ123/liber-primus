# LP2 anti-repeat is not a direct relabelled consecutive-prime stream

**Agent 4, 14 November 2026. Classification:** complete original-symbol, key-independent exclusion of one source-motivated direct-generation model. It recovers **no unknown plaintext or key**. Exact reproducible source counts and prime-stream controls are in [the standalone CommonJS SFT](../sims/lp2_prime_totient_residue_invariant_sft.cjs).

## Original clue, concrete conjecture and the missing operand

The solved p56 first sentence uses Euler totients of successive primes, and the unknown 55 rune-bearing p0–55 pages have only **86 same-page adjacent equal-rune pairs in 12,901 opportunities**. One possible explanation for that extreme diagonal suppression is that the unknown runes themselves are consecutive-prime residues mod29, or their totients mod29, under an **unknown fixed alphabet relabeling for each page**. A secret per-page permutation could conceal actual rune values while preserving the sparsity of repeated residues. The test has a strong advantage: **alphabet coverage and same-symbol events are invariant under every such secret bijection**, so no key need be fitted.

An author-selected instruction to use the p56 prime/totient sequence as the **literal ciphertext generator**, rather than as a key added to unknown plaintext, is missing. The test assesses this conditional model anyway because the all-key necessary condition is cheap and decisive.

## Key-independent obstruction from all 29 visible GP runes

For each ordinary prime \(p\ne29\), \(p\bmod29\) is one of the **28 nonzero** field elements. Equivalently, \(\varphi(p)=p-1\bmod29\) is one of **0 through 27**. The prime29 is the sole possible occurrence of the missing value in the entire increasing-prime sequence. Any bijective remapping of 29 symbols, including a different unknown bijection on every physical page, preserves each page's number of distinct symbols.

All **55** original rune-bearing pages were read unchanged from the pinned original LP2 corpus, excluding numerical p50. Their actual coverage is:

| Distinct GP rune symbols on a page | Pages |
| --- | ---: |
| **29** | **53** |
| **28** | 1 (p49; absent symbol 3) |
| **25** | 1 (p55; absent symbols 3, 9, 16, 26) |

The full source contains **12,956** runes, and the longest physical page has 277 runes. In any *globally increasing* consecutive-prime stream, at most **one** physical page can include the exceptional prime29 and therefore have 29 different labels. The original has **53** such pages. This is an exact contradiction irrespective of prime-stream start, assignment of symbols, any fixed per-page alphabet permutations, and all rune-word punctuation.

## Page-restarted p56-style prime sequence fails a separate exact event invariant

A restart at prime2 on each physical page would make the prime29 exceptional value available on every page, so the preceding global-coverage argument cannot exclude that reset rule. But the original p56 prime schedule itself supplies a second key-free prediction: among the first **277** primes, no adjacent prime gap is divisible by29. As all primes after2 are odd, a same-residue consecutive pair would require a gap divisible by **58**. The actual first-277 gap list has **zero** such events.

Consequently a separately restarted prime2 sequence, under arbitrary secret fixed rune permutations on every page, generates **zero same-rune neighbors across all 55 original page lengths**. The actual original has **86**. Both equalities are asserted by the SFT using the original corpus and an ordinary prime sieve. The original lag-two count is **435/12,846**, immediately returning to near-random symbol equality; no single prime-residue label relabeling can alter either lag count.

As a transparency check, the first **12,956** ordinary primes (2 through 139,387) provide only **four** adjacent same-residue pairs in a complete continuous stream. This numerical example illustrates why the superficially attractive low-doublet resemblance to successive prime residues is incomplete; the coverage and page-restarted event contradictions already settle the two proposed clocks.

## Decision and remaining live route

Reject **literal GP29 ciphertext = a globally advancing p56-style consecutive-prime/totient residue sequence under any fixed, invertible per-page or global GP29 alphabet relabeling**, and separately reject **page-restarted prime2 literal residue generation**. These are **all-key exact source-cipher negatives**.

This does **not** reject the genuine known-p56 operation \(C=P+\varphi(p)\bmod29\), a prime-derived running *key* mixed with nonconstant plaintext, a state-dependent permutation, explicit 29th-symbol escape handling, or an external author-selected keystream. Such mechanisms can use all29 symbols; they must supply their own reversible rule and true original plaintext before claiming progress. Do not equate the 86-doublet count alone with an identifiable prime generator.

**Exact check:** run the linked CommonJS SFT in Node22 from the repository root. It asserts the complete physical page census, both original lag counts, the exceptional-page list, prime2-restarter zero adjacent pairs, and the continuous first12,956-prime example.
