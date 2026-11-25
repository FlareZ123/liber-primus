# Precommit: p39 prime-echo interval → inner BASE29 digit → p29

**Agent 9, 25 November 2026.** Independent exploration after the remaining director-task Issues were found active, blocked or waiting. This is a single source-constrained decoder hypothesis, not an assertion that it is intended.

## Human-visible source chain

1. Original physical p39 shows two cuneiform-form numerals conventionally read as **1033** and **3301**. The historical 2013 CicadaOS prime_echo source prints the 464 ordinary primes through 3301 and pauses at those exact prime values, at one-indexed ranks 174 and 464. Treat the inclusive interval 1033…3301 as the selected prime stream.
2. Clear original p57 says: **“WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN”**. Physical p10 has the unique standalone decimal **7**; p7 has a single bounded red span of **14** runes. Hypothesis: “shed circumferences” selects removing seven prime entries from each end (14 total), leaving an interior stream.
3. Every retained prime lies between 29² and 29³, so its BASE29 representation has exactly three digits. The p57 phrase “find … within” selects the middle digit after shedding the two outer digits. This yields exactly one GP29 symbol per retained prime.
4. The inclusive prime interval contains 291 primes; removing seven at each end leaves **277**. Original physical p29 contains exactly **277** GP29 runes. The 2016 signed-message DIRECTION/page29 relationship is a secondary, conditional selector, not required to manufacture the length match.

The weakest assumptions are that the p39 cuneiform readings are the intended numeric values, that the two prime_echo pause values delimit an inclusive interval, that p10's 7 and p7's 14-rune red span jointly select a seven-per-end trim, and that the Parable's “circumferences / within” is an instruction to retain the middle BASE29 digit. None is individually proven as a creator instruction; together they define one affordable, falsifiable path.

## Frozen inputs and operation

- Parse all 464 printed prime values from resources/historical/cicada2013-os-original-prime-echo.sh, including both echo and echo -n line forms. Assert p174=1033 and p464=3301.
- Select prime values 1033…3301 inclusive: 291 values.
- Drop exactly the first seven and last seven: 277 values, from 1087 through 3229 inclusive.
- Convert each retained prime to its ordinary three-digit BASE29 representation using the signed 2013 BASE29 convention. Keep **only the middle digit** d1; do not keep the first/last digits or the least-significant residue. This gives a 277-symbol key K.
- Target: all 277 original GP29 rune indices of physical p29 in printed order.
- One-time additive inverse only: P_i=(C_i−K_i) mod 29, for i=0…276. No repetition, F hold, phase, reset, reversal, sign fitting, alternate digit, alternative endpoint, or other cipher family.
- Expected output: ordinary GP29 plaintext with the original printed separators and punctuation preserved.

The 7+7 trimming and middle-digit selection are frozen together. Do not rescue a negative result by switching to the 290-prime 1033…3299 interval, a different trim, the first/last BASE29 digit, or the complete flattened BASE29 representation.

## Prior overlap

- lp2-cuneiform-prime-echo-290-key-gate.md tested the 290-prime 1039…3301 stream as a repeating key on pp33–39, not this 277-symbol p29 one-time key.
- lp2-cuneiform-1033-3301-gp29-primeindex-gate.md tested a 1033…3299 prime interval with page-reset GP28 predecessor-exclusion, not the inner BASE29 digit on p29.
- prime-echo-464-periodic-key-negative.md tested full 464-prime/totient reductions as a repeating key over the entire unknown book.
- lp2-primeecho-16x29-base29-source-gate.md tested flattening all 1,237 BASE29 digits and correctly found no source-selected target; it did not test the Parable-selected middle digit after the 7+7 trim.
- lp2-2013-os-46row-prime-echo-p40-gate.md tested a separate 46-row binary deletion construction on pp40–53.
- lp2-p29-g-original-quotient.md tested the p39 red polynomial divisor, not the prime-echo stream.
- p10's prior 7→p7 raw-red14 Vigenere hypothesis was independently rejected; this test uses the 7 only as a trim count and the 14 only as its total two-sided trim, not as key material.

## Decisive test and decision

Assert the exact source counts, the 277-key/277-target alignment, the p7/p10/p57 source cues, and transcription/corpus agreement. Apply the single frozen inverse, report the complete decoded p29 transcription, IoC, adjacent-equality count, and exact forward replay. A source-native p57 plant encrypted and recovered under the same one-time key is an implementation control only.

Readable prose plus exact replay would justify one prospective, independently source-locked continuation test. Nonlinguistic output rejects only this exact inclusive-interval / 7+7 trim / middle-BASE29-digit / p29 additive-pad chain. Do not expand it into endpoint, trim, digit-position, phase or cipher-family searches.
