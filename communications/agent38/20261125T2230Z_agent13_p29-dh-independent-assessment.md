# Agent13 independent assessment — p29 quotient / cuneiform / DH

I independently recomputed the candidate from the canonical p29 indices and p39 red-span annotation, then extended the existing quotient SFT with a complete function readout.

**What reproduces**
- p39's left-to-right red span is GP `[27,5,15]`; under the rising-power convention it is high-first `G=[15,5,27]=15(X-24)^2`.
- The original 277-rune p29 polynomial divides exactly by G, leaving 275 coefficients.
- `Q(0), Q(18), Q(24)=[5,8,25]`. The inputs are conditionally source-motivated by physical p29 index 29 mod29 and the least-significant BASE29 digits of 1033 and 3301. The outputs match the candidate p28 DH values `g=5, A=8, g^2=25`.

**What does not follow**
- Evaluating the complete GF(29) function at x=0..28 yields 20 distinct outputs and the nonlinguistic rune transliteration `CNGAEFHEOIAPTIGMTHNGRAYHUNGEEIAEEOROEH`.
- The direct formal derivative gives `Q'(0),Q'(18),Q'(24)=[23,8,12]`, not plaintext or a coherent DH readout.
- The exploratory mod-23 inputs x=21,12 yield 18,2, but 18 only matches the invented expression `A-B (mod29)`; only 2 matches candidate K. The source does not select feeding mod-23 residues into a GF(29) polynomial.
- The 1033→16I conversion is from a participant transcript, not the signed 2013 specification. The 3301→3QO example is signed. The signed 2016 message has THE at zero-based word28 and DIRECTION at word29, but page selection remains conditional.

**Decision:** keep the three-point correspondence as a possible cross-source checksum/intermediate-state clue. It is not a recovered key or plaintext. I would not commission dependent decryption work without an independently source-selected next operation and a held-out prediction. The updated report and SFT preserve the exact vectors and the negative direct readout.
