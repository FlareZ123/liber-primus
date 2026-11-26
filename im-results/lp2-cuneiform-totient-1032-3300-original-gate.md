# Candidate-derived totient operation on cuneiform 1033/3301

**Status:** bounded negative. The arithmetic alignment is exact, but no plaintext, key, or cipher has been recovered.

## Why test this operation

A seven-rune 2|5 receiver on p35 at offset 110 produced the dictionary-derived candidate **TOTIENT** in the 2016 word-index investigation. This is not authenticated plaintext. The frozen transfer record reports 707,281 fixed-field solutions, 4,243,686 untyped sorted-field solutions, and no complete F-transparent path for the p35 residual-key transfer. The candidate therefore supplies, at most, a clue-constrained hypothesis: apply Euler's totient to the two cuneiform primes 1033 and 3301.

The source candidate and its failed transfer are preserved in the [frozen 2016 transfer record](lp2-2016-totient-devoted-frozen-transfer.json). This follow-up tests only the most direct totient-derived uses of the already established p55 geometry and 2013 DH grammar.

## Exact arithmetic alignment

The original p55 source has 76 runes and printed line lengths 24, 22, 22, 8. Removing the first and last rune from each of its 16 complete printed groups gives 43 interior runes and 32 page-local exterior runes. Including the one-rune p54-to-p55 carry gives the strict full-page exterior count 33.

Both cuneiform values are prime, so:

\[
\phi(1033)=1032=43\times24
\]

\[
\phi(3301)=3300=43\times76+32
\]

The totients therefore match the p55 interior count and first-line length, then the interior count, full-page length and page-local exterior count. In particular, subtracting one from the original 33-rune strict exterior leaves the 32-rune complete-page-local shell. This is a real arithmetic/geometry alignment. It does not by itself specify a cipher, a key schedule, or a receiver.

## Frozen direct p55 receivers

The totient values were interpreted in the simplest ways suggested by the existing base-43 work:

- First-line affine permutation: f24(i) = (43i + 0) mod 24, and its inverse.
- Full-page affine permutation: f76(i) = (43i + 32) mod 76, and its inverse.
- Periodic key stream K_i = ((43i + 32) mod 76) mod 29, with both additive signs and both ordinary key consumption and literal-F hold.
- Hill-2 matrix [[24,0],[76,32]] mod 29 = [[24,0],[18,3]], with direct/inverse matrices and row/column vector conventions.

All 12 transformed readouts are nonlinguistic. The 29-letter transliteration streams were scored with the repository's English quadgram model against matched-length windows from Shakespeare, Emerson and Gibran. Every transformed output falls below the first percentile of all three controls; the best transformed score is 0.285. The known clear p57 page scores 2.482 under the same model. The result rejects these direct totient-derived position, additive and Hill receivers, not every conceivable use of the numbers.

## Frozen p33–p39 DH receiver

The same page-local 43/32 peel supplies the already documented large-field parameters:

- P = 63755441409934721069036418908763882578170591536653256311514221
- g = 1268532719737981052966698570711268391040527137

The totients were used as the two private exponents, a = 1032 and b = 3300. The shared value g^(a*b) mod P yields a 42-symbol base29 key. The receiver is fixed to the 1,460 original black-body runes from p33 offset 99 through p39 offset 119 exclusive, in continuous source order, phase zero, with the historical literal-plaintext-F bypass.

The exact F-transparent inverse has no complete path. At target offset 136 (physical p34 offset 21), the only live phase is 7, its key rune is 8, and the ciphertext rune is 8; the consuming inverse would produce plaintext F=0 from a non-F ciphertext, which is impossible under the historical bypass rule.

A page-reset sensitivity test is motivated by the repeated p34–p39 header crop. It also fails: p33 has four legal paths but its output is nonprose; p34, p35, p36, p37, p38 and p39 first become impossible at page-local offsets 15, 15, 62, 25, 1 and 15 respectively. The ordinary consuming inverse is also nonprose. The p57 known-plaintext control retains its exact F-transparent path (two total paths), confirming that the inverse implementation does not reject every input.

## Reproduction and decision

Run from the repository root:

\`\`\`sh
node sims/lp2_cuneiform_totient_1032_3300_original_gate.cjs
\`\`\`

The SFT reconstructs the original p55 tape and geometry, checks both totient identities, executes the fixed p55 readouts and matched-length language controls, computes the DH shared key, and tests continuous and page-reset F-transparent inverses with a p57 positive control.

**Decision:** retain the totient/geometry relation as a structural observation only. The p35 TOTIENT candidate is not a recovered word or key; its residual transfer already fails, and the natural φ-derived p55 and p33–p39 receivers fail independently. Do not expand into arbitrary phases, generators, permutations or key orders. A successor needs a first-party clue that selects a different operation or an independently sourced key.

This is an intermediate result in im-results, not an established decryption.
