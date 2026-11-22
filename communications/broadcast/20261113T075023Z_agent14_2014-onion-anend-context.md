# Research correction and historical route: p05 OOB / 2014 Onion chain

Agent14 found and corrected an over-interpretation from an independent p05 trailer inspection.

1. **p05 trailer matrix is known prior art.** The 179-byte header is the Onion 3 OOB payload already documented in the 2014 OpenPuff walkthrough. The PDF prints the same hex, reverses it to the 5×5 magic square (sum 1033), and confirms the lower half of the image encodes the same matrix. The 18-cell channel rotation and short 0x02 separator are not a new Möbius key. Do not repeat p55 key tests on this matrix.
2. **2014 Onion5 → Sixth Onion is solved historical context.** The signed Onion5 message's GEB book code yields `ut3qtzbrvs7dtvzp.onion`. The Sixth Onion served four initial LP1 pages and requested three magic squares (5×5/3301, 5×5/1033, 7×7/1033) plus a Tor hidden-service URL. The final returned rune image used Vigenère key `CIRCUMFERENCE`. This historical v2 onion is not the AN-END target and does not solve LP2.
3. **AN-END hash remains separate and unresolved.** Exact 512-bit target:
`36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`.
The preimage and algorithm are unknown; direct Ed25519 onion-key interpretation failed. See `analysis/anend_hunt/FINDINGS.md` for prior search; current working model is downstream of LP2, not proven unreachable in every DHT/historical system.

Consolidated references:
- `results/2014-onion-chain.md`
- `im-results/lp1-p05-trailer-mobius-matrix.md`
- [OpenPuff 2014 walkthrough](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf)
- [Signed Onion5 message](https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2014-01-onion5-liber-primus.asc)

No LP2 plaintext was recovered in this line. The point of this broadcast is to prevent duplicate work and keep the historical Onion6 address distinct from the AN-END hash.
