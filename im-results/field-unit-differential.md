# Field-unit differential LP2 inversion: EA-marker contradiction and original-grid key test

**Agent 34, 10 November 2026. Executed intermediate cryptanalytic negative. No recovered plaintext or key.**

## Exact reversible construction

Consider a multiplicative stateful cipher over the GP field of 29 symbols. For each noninitial rune, define the visible increment D_i = (C_i-C_(i-1)) mod29 and posit D_i = (P_i+1)K_i mod29, where the independently derived secret key unit K_i is always 1..28. Since multiplication by a nonzero field element is invertible, P_i = D_i K_i^(-1)-1 mod29. The zero increment is special: **a repeated visible ciphertext symbol implies plaintext GP index28 (EA), whatever K_i is**. This is an unusually sharp plaintext prediction derived from the inversion model, and naturally reproduces the observed low doublet frequency when EA is rare in English-like plaintext. In the first 218,800 GP runes of Shakespeare, EA occurs in 0.7463% of positions; source LP2 has 86 of 12,901 within-page repeat opportunities (0.6666%). The close marginal rate motivated the explicit test; the rates alone are insufficient to identify a cipher.

## Predicted EA word locations do not fit

All 86 actual doublet events, including those spanning word boundaries, were located among 2,896 complete original ciphertext rune words. **23 of the 86 events begin a rune word**. The mechanism requires these positions to coincide with a GP EA plaintext rune. To test that independently, GP-encode three stored English references, calculate the fraction of reference EA occurrences at word position zero *separately for each observed ciphertext word length*, and ask how many position-zero events one would expect given the exact original 86-event word-length inventory. This conditions on the observed event word lengths instead of letting an unrelated mismatch in word lengths drive the result. Use Jeffreys half-count smoothing for each source length bin; unobserved length classes use that source's pooled EA-first fraction. Under independent draws of event positions from these conditional source estimates, evaluate the exact Poisson-binomial upper tail.

| GP-English reference | EA starts expected among 86 | Actual starts | One-sided conditional upper tail |
| --- | ---: | ---: | ---: |
| Shakespeare (218,800 runes) | 5.3851 | 23 | 1.46e-10 |
| Gibran, The Prophet | 10.1612 | 23 | 1.50e-5 |
| Emerson, Essays | 10.3253 | 23 | 1.16e-5 |

The simple fixed-EA mechanism is thus **strongly incompatible with ordinary-GP-English word-position structure**, provided the displayed ciphertext word boundaries are the plaintext word boundaries. The statistical test is conditional on each reference register and the chosen smoothing; it is not a discovery-wide p-value. The cipher could manipulate word breaks, transform the plaintext alphabet, vary the specific zero-mapped symbol, or use a non-English source, so this is a mechanistic exclusion rather than a universal impossibility.

## Exact numeric-grid inversion attempt

The original LP2 32x8 base60 numerical grid supplies 256 byte values. Test field-unit keys K_i=1+byte%28 and K_i=1+floor(28byte/256), either original/reversed order, using K or its multiplicative inverse in the decoder. For every one of the 256 circular starts, test global manuscript, physical-page reset, and original eight section reset. The result is **6,144 full-manuscript settings**, with no free key or offset per page. Every setting decrypts all eligible visible increments and is scored by the GP unigram log probability learned from the 218,800-rune Shakespeare reference.

The real text's best whole-corpus setting is **section reset, scaled unit, reversed key, direct multiplication, phase199**, with GP log-likelihood **-4.19444 per rune** on 12,948 increments; its uniform-nonzero-difference reference score is **-4.25502**. Selecting settings solely from the first half of every key-reset block yields a top **global reset, scaled unit, reversed, direct multiplication, phase39**, but the untouched second halves score **-4.27701** per rune, *worse* than the simple flat inverse null. No readable passage or coherent grid-key candidate emerged. This family search is not selection-calibrated as a positive statistical discovery; the actual criterion is the huge failure to reach known-GP language likelihood.

**Powered positive:** generate pages of exactly the original 55 lengths using independent contiguous Shakespeare GP source, a real original-grid unit key modulo28 plus one, page resetting, true phase37 and seeded page start values, and the same multiplicative formula. Scanning the identical 6,144 candidates recovers **the exact page/mod/forward/inverse/phase37 key specification ranked first**, with log-likelihood **-2.94166** per scored rune on 12,901 increments. The known cipher is therefore directly invertible by the implementation when the tested key mechanism is present.

## Interpretation and reproducer

The field-unit multiplicative model merits attention because it explains extremely rare repeated symbols without a postprocessing repair step and gives an exact keyless plaintext marker. These two independent attacks show that **the specific EA-marker-with-original-word-breaks plus direct 256-grid byte-unit key family does not decode LP2 as ordinary GP English**. A secret field-alphabet permutation could move the zero symbol to another plaintext rune, and a more complex key expansion, phase slipping or boundary recoding remains outside this test. No manuscript plaintext, secret key or downstream destination was recovered.

Reproduce with the single CommonJS program sims/field_unit_differential.cjs; it reads only already tracked LP2 corpus, original transcription, base60 grid and the three English control files, asserts the 55-page / 12,956-rune / 86-doublet contracts, executes the exact marker tails, exhaustive 6,144-grid setting scan and independent planted positive, and performs no writes or automatic CI triggers.