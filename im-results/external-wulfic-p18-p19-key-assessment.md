# External Wulfic 2026 keys: LP2 pages 18–19 (partial reproduction)

**Status:** reproducible plaintext prefixes; not a full-page decryption and not independently derived keys.

Wulfic's tracker publishes p18 Vigenère SUB, period53 (260 runes), and p19 Vigenère ADD, period47 (271 runes). Sources:
- https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301_Liber_Primus/blob/main/MASTER_TRACKER.md
- https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301_Liber_Primus/blob/main/README.md

The README classifies p18/p19 as partial and warns that hill-climb “solved” labels can be false positives. Treat the arrays as hypotheses.

## Reproduction on canonical corpus

Using resources/liber-primus/lp2-corpus.json, GP29 order, continuous key clocks:

p18 SUB key (53):
[11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24]

Prefix (64 symbols):
BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY

p19 ADD key (47):
[24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28]

Prefix (54 symbols):
REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEOR

The rest of both pages remains non-language under these arrays. They are prefix-level leads, not full-page decryptions.

## Conditional F-skip check

The tracker specifies a corrected rule: skip key advancement only when BOTH ciphertext rune and current key value are index 0 (F). Tested both ordinary Vigenère and this conditional rule:
- p18 has one conditional skip at rune index230. Prefix unchanged; IoC changes 0.03816 → 0.03917; tail remains gibberish.
- p19 has no conditional skips; output unchanged, IoC 0.03425.

Thus the F-skip convention does not explain the unreadable tails. Reproduction: node sims/external_wulfic_p18_p19_repro.cjs.

## P20 claim and decisive test

Wulfic claims a following P20 object of 812 runes, split 166 prime-index and646 non-prime, with Deor/Beaufort and a 2×83 transpose. Our canonical corpus p20 has269 runes; the claimed 812-rune object is not mapped to a canonical contiguous page segment. Do not run the Deor attack on an arbitrary page or substring.

Decisive next test: obtain the exact 812-rune input and page/group mapping, then reproduce the 166/646 split, 2×83 order, and Deor normalization on held-out symbols. If Old English fragments recur outside positions used to select the key, the p19 instruction gains support; otherwise retire the branch.

No established result changes. Do not promote these fragments to results/ until key derivation and full-page plaintext are independently validated.
