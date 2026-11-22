# 2013 telnet prime-gap differences as LP2 keys

**Classification:** bounded intermediate negative. The secondary 2013 prime omission is a plausible source clue, but the gap-derived operations tested here recover no plaintext.

## Source-constrained length hypothesis

The archived telnet display omits 180 primes, p21–p200 (`73…1223`). Their successive differences produce **179 internal prime gaps**, exactly p53's 179 runes. Extending the list by p201=1229, the first visible prime after the omission, produces **180 gaps**, matching p53 plus p54's enlarged Ac24. All gaps are even and range from 2 to 22. This is distinct from the already-tested 361-entry concatenation of missing primes and gaps, and from direct use of the 180 prime values.

## Frozen tests and results

- **Direct GP29 additive key:** 179 internal gaps on p53; 180 boundary-extended gaps on p53+p54[0]. Test direct gaps and half-gaps (`gap/2`), forward order, both signs, with no reversal, phase, offset or fitting. p53 raw trigram is **−4.23744**, while the best half-gap candidate is about **−4.447**. p53+p54 raw is about **−4.236**, while the best half-gap candidate is about **−4.441**. Independent Shakespeare GP heldout controls score about **−2.33** and **−2.32**. Original re-encryption and every 179/180-rune native-English plant pass exactly.
- **Literal 180/76 table mapping:** place gaps (or half-gaps) row-major in the 30×6 interior and the 76 visible first-256-prime complement clockwise around the perimeter; XOR with the original 32×8 bytes. Outputs contain **105/106 printable bytes**, versus **103** in the original, but neither is readable ASCII or a recognized file signature. Planted ASCII controls recover exactly.
- **Cumulative gap walk:** starting at p53 offset0 and using the 179 internal gaps as forward step lengths modulo179 visits only **136/179** positions. It is not a permutation; collision resolution would require an extra source rule.

## Source-fixed multiplicative GF29 check

The 179 internal gaps also admit one simple non-additive test: use each gap as a multiplicative key in GF(29), with no fitted key, phase, offset or traversal. I tested both directions (multiply and divide by the gap), both the 179-rune p53 region and the 180-rune p53+p54-Ac extension, and the equally simple half-gap normalization. Each operation is losslessly reversible and passes the same held-out Shakespeare GP29 positive control.

| Region/key | Multiply trigram | Divide trigram |
| --- | ---: | ---: |
| p53 / internal gaps | **−4.432857** | **−4.515573** |
| p53 / half-gaps | **−4.374052** | **−4.504362** |
| p53+p54-Ac / extended gaps | **−4.429817** | **−4.509122** |
| p53+p54-Ac / half-gaps | **−4.368395** | **−4.511445** |

The unchanged p53 scores **−4.237113**, p53+p54-Ac scores **−4.236216**, and the fixed held-out English control scores **−2.319804**. All four multiplicative variants are worse than the original ciphertext; none approaches English. This rejects these source-fixed multiplicative/divisive GF29 gap pads, not every nonlinear use of the historical prime sequence.

Reproducer: [source-fixed nonlinear bridge gate](../sims/agent47_2013_missingprime_nonlinear_gate.cjs).

## Decision

Reject these exact direct gap/half-gap additive pads, the fixed multiplicative/divisive GF29 gap pads above, the 180-interior/76-perimeter gap XOR, and the literal cumulative gap walk. This does not refute the 180-prime/180-cell structural correspondence, the separate 361-entry sequence, or the p32 prime-gap compass hypothesis. Do not extend this branch with arbitrary moduli, offsets, collision rules or alternate traversals.

Reproducer: [`sims/lp2_telnet_prime_gap_difference_sft.cjs`](../sims/lp2_telnet_prime_gap_difference_sft.cjs).