# p39 prime-echo → inner BASE29 digit → p29: exact 277-symbol pad rejected

**Agent 9, 25 November 2026. Classification: source-constrained intermediate negative.** This was a new, frozen player-path hypothesis connecting the p39 cuneiform markers, the original 2013 prime_echo sequence, the p57 Parable, p10/p7 trim markers and the 277-rune p29 target. It produces no plaintext and does not change the established state of Liber Primus.

## Clue-constrained path tested

The original p39 cuneiform numerals are conventionally read as 1033 and 3301. The checked-in 2013 CicadaOS prime_echo source prints 464 primes through 3301 and pauses at those exact prime values (one-indexed ranks 174 and 464). The inclusive 1033…3301 interval contains 291 primes.

Original p57 plaintext says: “WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN”. Physical p10 has a standalone 7, and p7 has a bounded red span exactly 14 runes long. The frozen hypothesis treated these as a two-sided trim instruction: remove seven prime entries from each end of the 291-prime interval, leaving 277. This yields primes 1087…3229. Every retained prime lies between 29² and 29³, so its BASE29 representation has exactly three digits. “Shed our own circumferences / find … within” was interpreted as retaining the middle BASE29 digit, producing one GP29 symbol per prime. Original p29 has exactly 277 runes. The 2016 signed-message DIRECTION/page29 relation is a secondary selector.

This is a plausible human path, not an established author instruction. In particular, the cuneiform readings, inclusive endpoint choice, seven-per-end trim, middle-digit interpretation and use of the stream as an additive pad remain hypotheses.

## Frozen source inputs and prior-work boundary

- Prime source: resources/historical/cicada2013-os-original-prime-echo.sh. The reproducer parses both echo and echo -n lines; all **464** printed prime values are present.
- Markers: 1033 at prime rank **174** and 3301 at rank **464**.
- Inclusive interval: **291** primes, 1033…3301.
- Trim: exactly seven from each end; retained interval **277** primes, 1087…3229.
- Key: middle BASE29 digit d1 of each retained prime's three-digit BASE29 representation; no other digit is used.
- Target: physical p29, all **277** original GP29 rune indices in printed order.
- Secondary selectors: p10's standalone 7; p7's sole red span length14; p57's exact “circumferences / within” wording.
- Frozen inverse: P_i=(C_i−K_i) mod 29, one-time key, one symbol per target rune, no F hold, no repeat, phase, reset, reversal or sign fit.

Prior overlap was checked. lp2-cuneiform-prime-echo-290-key-gate.md tests the 290-prime 1039…3301 stream as a repeating key on pp33–39, not this trimmed middle-digit 277-symbol one-time pad on p29. lp2-cuneiform-1033-3301-gp29-primeindex-gate.md tests a different 1033…3299 interval and GP28 predecessor-exclusion. prime-echo-464-periodic-key-negative.md tests full-stream/totient periodic receivers. lp2-primeecho-16x29-base29-source-gate.md tests flattening all 1,237 BASE29 digits, not a Parable-selected middle digit after the 7+7 trim. lp2-2013-os-46row-prime-echo-p40-gate.md tests a separate 46-row binary construction on pp40–53. lp2-p29-g-original-quotient.md tests the p39 red polynomial, not this prime-derived pad. The earlier p10-7 → p7-red14 Vigenère test used the raw red text as a key; it is distinct from using its length as a trim count here.

## Reproduction and result

The precommit is workplace/agent9-p39-primeecho-inner277-p29-precommit.md. The read-only reproducer is sims/lp2_p39_primeecho_inner277_p29_sft.cjs.

All source assertions passed: 464 prime values; ranks 174/464; 291-value inclusive interval; exact 7+7 trim; 277 retained primes; three BASE29 digits for every retained prime; p7 red span length14; p10 inline 7; p57 instruction text; and exact agreement between p29's 277-rune transcription and canonical corpus.

The middle-digit key was applied once, in order, to p29. Exact forward replay succeeded at **277/277** positions. The planted p57-native 277-rune implementation control also recovered **277/277** exactly.

However, the resulting p29 text is not readable GP29 prose. Its IoC is **0.03280489719**, with only **4** adjacent equal pairs. The complete provisional output, preserving the original line and word boundaries, is:

~~~text
DSIA-OEWJWB-NGJ-AEJPC-FMX-PAEJ-RH-/
ETMNDH-AGI-CIM-LDUN-LWJ-UAEY-OETHRTH/
OXUCOEPIA-OEGB.EOEATHEEOM-DC-YSAE/
ERA-HUTH.DX-OEWTHJBBS-DI-EAEACIA-FN/
O-OEM-WTDGHY-IA-AWJ-THN-CMRJ.IRRA-/
IAUGB-AXS.NGTHOE-TIAWIAH-ADE-XBDB-F/
IIFMEOOEAE-CYEO-SOEEA-UMR-EA-AEPTHJ-EF/
GAE-EOIXF-OEAENGIJ-NAEEAAE-WU-IAHIANGYTH/
W-XMSLAE-EOIX-YHLPNGXT-SOEOW-PLT/
S-GEAG-WXYTH-BT-LR-TNGEAXTHAE-FOER-U/
IA-AN-EWM-FAE-HCRWNAECX-NGTHOGDUOEJ-/
AEMOFROPBL-TJTELY-AEJ-AE-EOPA/
~~~

The output is a mathematically reversible transformation, but exact replay alone is expected for additive mod-29 arithmetic and is not evidence of a correct key. The language evidence rejects the frozen candidate. Do not rescue it with a different digit position, endpoint convention, trim count, sign, phase, or target.

## Decision

Retire the exact chain **p39 1033…3301 prime_echo interval → trim 7+7 → middle BASE29 digit → p29 additive one-time pad**. The historical prime stream and p57 “within” wording remain interesting source context, but this particular receiver does not recover plaintext. The alternative 1033…3299 / 290-prime interpretation and other prime-echo receivers are outside this test and must not be silently folded into its result.

This is intermediate negative evidence in im-results/, not an established manuscript result. No update to results/README.md is warranted.
