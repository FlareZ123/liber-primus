# Prime-echo page/word path: bounded key and period-seven transfer gate

**Classification:** source-constrained exploratory negative. No plaintext, LP2 key, or intended page-address grammar recovered. This records a narrow follow-up to Agent6's 2013 `prime_echo` coordinate observation; it is not an established page map.

## Hypothesis under test

The pinned 2013 boot-image `prime_echo` program prints primes in ten columns and pauses at 1033 and 3301. Their one-based prime ordinals are 174 and 464, hence zero-based grid coordinates (row 17, column 3) and (row 46, column 3). The row difference is 29. Mapping row→physical LP2 page and column 3→fourth printed word is an inference, not an instruction in the historical source.

The literal selected path is the fourth word on the first printed line of each page p17–p45. It yields 29 words of lengths:

`[4,2,4,3,8,6,5,5,5,4,1,5,4,4,5,11,6,4,3,2,4,4,3,4,4,9,8,11,2]`

The concatenated path has **140 runes = 20×7**, and contains all 29 GP symbols. The 30th page p46 is the prime_echo endpoint; its first-line fourth word is four runes, and the whole page has 270 runes.

## Source-selected tests

### Historical 2014 period-seven operation

The 2014 OutGuess note was solved by the documented period-seven columnar transposition with key `1736254`. The exact inverse position list `[0,6,2,5,1,4,3]` recovers the archived 56-character plaintext and round-trips under forward positions `[0,4,2,6,5,3,1]`; the reproducer asserts this positive control.

Because the prime_echo path has exactly 140 runes, it is divisible into twenty septets without padding. Applying the exact 2014 inverse to the 140-rune path gives prefix:

`IARBCAEAAONJYOXPOETHYCGTHCCEOTHJOTHETPIIABEOYEARSOEWCPNJNGWDNHNTOEAAOE`

The forward orientation gives:

`IAEABRCAAOXJNYPOOETHYTHCCGCTHTHEOJEOTEOIPIAYBEACSROEPWNNNGJWHDNOEOETAG`

Neither is readable GP-English. The path's IoC is **0.03247688**, unchanged by either pure transposition. The exact 2014 operation is authentic; its transfer to this inferred 140-rune target is not source-specified and fails the direct-plaintext prediction.

### Treating the path as a key for endpoint p46

The first-occurrence order of the 140-rune path is a complete 29-symbol keyed alphabet:

`IA|A|B|EA|C|R|O|J|P|X|Y|N|OE|G|TH|E|EO|T|I|W|S|D|NG|H|M|F|L|U|AE`

Both ordinary monoalphabetic directions on the source-selected endpoint p46 remain ciphertext-like; IoC is unchanged at **0.03362247**. Repeating the 140-rune path as a GP29 additive key on p46 also fails in both directions (IoC **0.03309927** and **0.03340218**). No word or plaintext is recovered.

The direct per-word prime-gap and prime-ordinal shifts tested during exploration also fail; the source already had a negative direct φ(prime) per-word test. These do not justify more modular variants.

## Cross-round base-58 check (provisional)

Applying the 2016 signed-message base-58 rule to the same 29 selected fourth words gives two notable addresses: p38 `SRUTH` (GP-prime sum72) → p14 word1 **FOLD**; p40 `EOEAOE` (sum224) → p50 cell3 **3D**. This is a cross-round consistency check, not independent proof: the same target sums also occur in other first-line columns (sum72 at p39 column0; sum224 at p34 column6). Column3 is the only column with both, but the individual anchors are not unique to it. The p56 anchors (sums114 and288) do not occur in these ten first-line columns. The 2014 Stage5 “Do four unreasonable things each day” wording is a possible fourth-word selector, but generic and not explicit.

This suggests a provisional **FOLD / 3D** instruction for the full pp49–51 table. The separate [210-mirror candidate](p50-210-fold-symmetry-candidate.md) records a structural observation, not a fold decryption.

## Decision and limits

The most literal key/readout choices suggested by the 2013 coordinate path and the historical 2014 seven-column operation do not decrypt the selected stream or its p46 endpoint. This does **not** prove that the row/column address hypothesis is false; it remains unverified because the 2013 source does not say that its output rows are LP2 page numbers or that its columns are word positions. It does mean that no source-backed direct plaintext result currently justifies further key-consumer sweeps.

Do not expand into arbitrary 12×12 or 5×28 reshapes, additional column orders, phases, or ciphers. Reopen only if an independent original clue selects the page/word address and a distinct readout.

## Reproduction

Run `node sims/prime_echo_pageword_key_gate.cjs` from the repository root. It reads the canonical `resources/liber-primus/lp2-corpus.json` and `resources/lp2-transcription.txt`, asserts the 29 selected words and 140-rune length, verifies the authentic 2014 positive control, and reproduces the fixed path/endpoint outputs and IoCs.

Relevant sources:
- `resources/external/1033-3301-historical-operator-chain.json` — prime_echo source and prime ordinals.
- `im-results/2014-140byte-outguess-note-lp2-crib-selector.md` — 2014 original note, historical key, and selector limitation.
- `im-results/2014-outguess-period7-lp2-p8to14-inverse-gate.md` — exact 2014 inverse and positive control.
