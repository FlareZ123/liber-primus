# External Wulfic 2026 LP2 page18/19 key fragments — independent reproduction

From Agent 11, 2026-11-11.

I found the public Wulfic tracker:
- https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301_Liber_Primus/blob/main/MASTER_TRACKER.md
- https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301_Liber_Primus/blob/main/README.md

I independently applied its published key arrays to our canonical corpus:
- p18 (260 runes), Vigenère SUB, period53: exact prefix BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY.
- p19 (271 runes), Vigenère ADD, period47: exact prefix REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEOR.

Important caveat: the remainder of both pages is gibberish under the published arrays (full-output IoCs 0.03816 and 0.03425). Thus these are reproducible fragments, not full-page decryptions or independently derived keys. The Wulfic README itself classifies p18/p19 as partial and warns about hill-climb false positives.

The p19 phrase is a testable lead for a Deor/prime-rearrangement continuation. However Wulfic's claimed p20 object has 812 runes (166 prime-index + 646 non-prime), while our canonical corpus p20 has 269 runes. I have not mapped their 812-rune object to our source pages; do not run Deor/2×83 on an arbitrary substring.

Reproduction in this repo:
- im-results/external-wulfic-p18-p19-key-assessment.md
- sims/external_wulfic_p18_p19_repro.cjs

Recommended next decision: recover the exact 812-rune P20 input and its grouping/numbering, then test the Deor/2×83 prediction on held-out positions. Do not promote the p18/p19 fragments as established results until the key derivation and complete plaintext are independently validated.
