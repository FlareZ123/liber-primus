# External Wulfic 2026 keys: LP2 pages 18–19 (partial reproduction)

**Status:** reproducible plaintext prefixes; not a full-page decryption and not yet an independently derived key.

## External lead
Wulfic's public research tracker publishes page 18 as Vigenère SUB with a 53-symbol key (260 runes), and page 19 as Vigenère ADD with a 47-symbol key (271 runes). It reports the page-19 fragment “REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR.”

Sources:
- https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301_Liber_Primus/blob/main/MASTER_TRACKER.md
- https://ithub.global.ssl.fastly.net/Wulfic/Cicada3301_Liber_Primus/blob/main/README.md

The external README is more cautious than the tracker: it classifies pages 18 and 19 as partial and warns that many per-page “solved” labels elsewhere are false positives from hill-climbing. Treat the published arrays as hypotheses, not established keys.

## Independent reproduction on this repository's corpus
Using resources/liber-primus/lp2-corpus.json and its GP29 index order, with no F-skip and no page-specific offset:

**Page 18 — SUB**
P[i] = (C[i] - K[i mod 53]) mod 29

Key:
[11,6,1,20,25,20,9,15,24,26,25,7,19,8,10,24,18,9,0,16,9,4,14,22,13,13,3,28,5,21,24,19,5,1,27,14,6,17,24,24,22,8,23,6,22,19,2,11,3,19,25,15,24]

First 64 GP symbols:
BEINGOFALLIWILLASCTHEOATHISSWORNTOTHEONEWITHINTHEABOFETHEWAY

The remaining output is not coherent English. Full-page output IoC: 0.03816.

**Page 19 — ADD**
P[i] = (C[i] + K[i mod 47]) mod 29

Key:
[24,15,2,24,4,21,11,10,20,16,9,19,26,11,7,5,11,6,27,8,22,25,21,16,25,0,27,9,21,7,27,15,21,9,3,16,5,22,18,4,5,18,23,28,28,28,28]

First 54 GP symbols:
REARRANGINGTHEPRIMESNUMBERSWILLSHOWAPATHTOTHEDEOR

The remaining output is not coherent English. Full-page output IoC: 0.03425. The final four key entries are all 28 (EA), which the external tracker itself flags as possible padding artifacts.

Exact outputs and prefix assertions are reproducible with node sims/external_wulfic_p18_p19_repro.cjs.

## Interpretation and decisive next test
The page-19 fragment is a candidate instruction, not a verified plaintext page. The strongest objection is that the published keys are hill-climbed/partially recovered and the rest of both pages remains gibberish; a short readable prefix can be overfit. The external README's own “partial” status is the appropriate classification.

The tracker claims a following page-20 object of 812 runes, split into 166 prime-index symbols and 646 non-prime symbols, then processed by a Deor/Beaufort operation and a 2×83 transposition. That object does not match canonical corpus page 20 here (269 runes), and no direct mapping to a canonical contiguous page segment has been established. Do not run the Deor attack on an arbitrarily chosen page or substring.

**Decisive next test:** obtain the exact 812-rune page-20 input and its page/group mapping, then reproduce the 166/646 split, exact 2×83 ordering, and Deor normalization on held-out symbols. If the reported Old English fragments recur at positions not used to select the key, the page-19 instruction gains support; otherwise retire the branch.

No established result changes. Do not promote these fragments to results/ until key derivation and full-page plaintext are independently validated.
