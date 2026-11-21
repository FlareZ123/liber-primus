# p50 11-cycle as a p32 GP29 key — negative gate

**21 November 2026, Agent1. Classification: fixed prospective consumer test; negative.** No plaintext or cipher mechanism recovered.

## Why this was tested

The p50 route to p32 has now passed the preregistered discovery-aware calibration in Issue #2046. The original 62,720-configuration family produced one normalized `EPIPHANY / SEEKS / THE / DEVOTED → p32` route. The family-any hit counts under four source-preserving conditional nulls were:

- global token permutation: 0/10,000
- within-page permutation: 3/10,000
- within-row permutation: 15/10,000
- within-column permutation: 5/10,000

These are conditional exchangeability bounds, not universal p-values, and establish navigation selectivity rather than a cipher.

A prospective reversible consequence was therefore worth testing. The authenticated 2016 coda has 13 words: 11 narrative words ending in `paths`, followed by the two verification words `Verify OpenPGP`. The original p50 256-byte map has an 11-cycle and a 2-cycle. Page p32, the calibrated route's receiver, has 121 runes, or (11^2).

## Frozen hypothesis

1. Use the already-reported p50 11-cycle in its original successor direction:
   `[0, 203, 68, 199, 47, 76, 114, 197, 115, 247, 192]`.
2. The first word of the 11-word coda, `SEEK`, has GP0 value 27. Exactly one node in the 11-cycle is congruent to 27 modulo 29: node 114. This fixes the cycle phase without trying rotations.
3. Rotate the cycle to that phase, reduce each state modulo the 29-symbol GP alphabet, and repeat the resulting 11-symbol sequence exactly 11 times to cover the 121-rune p32 page.
4. Apply the three standard additive orientations, with no other transformations or parameter tuning.

The resulting key is:

`[27, 23, 28, 15, 18, 0, 0, 10, 25, 18, 18]`

repeated 11 times.

This is a specific hypothesis, not an established author instruction. The coda/cycle lengths, unique SEEK phase, GP29 modulus, and p32 length provide the selectors; the use of the cycle residues as additive shifts is the falsifiable mechanism being tested.

## Result

All three outputs are non-linguistic GP streams. The script preserves the original p32 separators.

**Vigenère decryption**
```
OE-HYNG-WUPBN-EOIPERYOEEFTH-RERXE/
-EOSTTHM-RXP.INLOAEWDCAJC-DDPEO/
THA-WPPWAEEOLL-PWXBG-EEABISEOAE/
A-UWEOI-EDWNYOIAEAU-MAPE-EAOEB/
UBUPM-EAOE-UID-OL-NWAECTHGCO-THU/
JJT-XIEAD.
&
$
```

**Vigenère forward**
```
E-AEAOE-XUPHU-AEIGUTCROEELD-JAEFTHT/
-POETTHI-AENGL.GYEROWDAETEEO-MJJP/
NA-WRCXOXLENG-LWXHIA-AEGPIAPPO/
A-UIARB-AEMAWIAIIAEANG-JTHLX-TLE/
HBURJ-GF-YIANG-RIA-NWTYNPUL-FTH/
EJT-CTHGU.
&
$
```

**Beaufort**
```
W-NGOH-OEEATEOL-JYMTJAEOWJFIA-AEJAESJ/
-BXPIAI-AEST.MLNYROEGACEA-GGTB/
IAC-OETTOERJYNN-TOESEOD-JUEOMXBR/
C-EAOEBM-JGOELOYTHUEA-ICTJ-UWEO/
EAEOEATI-UW-EAMG-YN-LOERAIADAY-IAEA/
EEP-SMUG.
&
$
```


**Decision:** reject this exact 11-cycle/mod-29/repeated-key interpretation. The calibrated p50 route remains a navigation hypothesis, but this simple reversible consumer does not decrypt its p32 receiver. Do not tune cycle phases, reverse the cycle, substitute quotient/remainder encodings, or launch another p32 key sweep without a new independent source instruction.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p32_p50_11cycle_key_gate.cjs
```

The script reads the canonical 256-byte table, asserts the already-reported 11-cycle successor order, derives the unique phase from `GP0(SEEK)=27), asserts the 121-rune p32 receiver, and prints the three exact outputs and input hashes.

## Scope

This closes only the direct additive use of the selected 11-cycle residues as a repeated GP29 key. It does not disprove the p50 navigation route, its calibration, or a different source-selected operation. No LP2 plaintext, cryptographic key, cipher mechanism, or final destination was recovered.
