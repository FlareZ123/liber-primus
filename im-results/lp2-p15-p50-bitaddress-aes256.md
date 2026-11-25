# p15 → p50 bit-address gather → AES-256 inverse

Agent28, 25 November 2026. **Bounded original-input negative, no recovered plaintext.** The 16 printed p15 integers fit in 16-bit words (256 bits); the 32×8 table consists of 256 address-sized values, eight distinct values per row. A simple human-readable operation is to read each row as eight bit addresses into the p15 words and assemble one output byte per row, forming a 32-byte AES key. The dimension match motivates a test, not an authenticated instruction. This differs from directly using p15 as the AES key to decrypt the table itself (previously tested).

## Frozen receiver
Printed row-major and established red-origin spiral orders, both uint16 byte orders, radix59/60 table values, both bit numberings inside input and output bytes: 32 distinct keys. No rotations, arbitrary IV, hashes or fitted key derivation. AES-256-CTR from zero counter, each byte reduced mod29, both additive signs, ordinary and authentic literal-F-hold clocks. Three fixed origins: entire unknown tape (fit p0–39, hold p40–55), p15 body (fit through p21, hold p22), p54 chapter (fit p54, hold p55). The trigram log-likelihood ratio uses only the seven native solved sections other than the two control donors, with symmetric 0.25 pseudocounts. Ordinary and F candidate plaintexts are checked for exact ciphertext replay. F states are merged exactly by consumed cursor and two prior plaintext runes, then the best fit state alone is frozen at the boundary; there is no beam or pruning before the boundary.

## Results
| Origin | Original runes | Highest ordinary fit LR/rune | Its held-out LR/rune | Longest legal F prefix |
|---|---:|---:|---:|---:|
| Whole | 12956 | −0.085497 | −0.102274 | 347 |
| p15 body | 1883 | −0.074125 | −0.156846 | 228 |
| p54 | 308 | −0.031558 | −0.063972 | 165 |

All 192 ordinary decryptions lack meaningful plaintext; all 192 F variants fail exact reachability **before the fit boundary**, so boundary-state freezing cannot cause any original failure. Two native ordinary control decryptions recover 780/780 and 755/755 exactly. F controls expose genuine uncertainty of frozen MAP state selection: one freezes the wrong state and dies at 550/780; the other completes with 748/755 correct. This is a limitation of predictive MAP decoding, not of forward key derivation or pre-boundary exact reachability. No general all-key or all-IV exclusion is claimed.

Reverse interpretation: if the table gathered *some unknown* input bit array into the printed p15 bit string, every repeated table address must request the same output bit. For all 32 conventions the fixed target violates at least 37 such constraints; no unknown input array can repair these. This is exact for the proposed gather direction and fixed serializations, independent of AES.

[SFT](../sims/lp2_p15_p50_bitaddress_aes256_sft.cjs) uses Node's standard crypto API. [Raw](lp2-p15-p50-bitaddress-aes256.json) includes all keys, reverse contradictions, scores, preview tokens and control failures. Core executed in V8 with a separately implemented AES-256 reference passing the zero-key/zero-block known answer dc95c078a2408989ad48a21492842087; standalone Node/Windows CI not run. Keep the source-fixed negative; do not add guessed IVs or expand serialization search without an independent selector.
