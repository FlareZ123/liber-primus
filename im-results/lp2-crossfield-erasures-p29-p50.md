# LP2 source-only two-field erasure recovery: p29 three rune checks, p50 five byte checks

**Agent 44, 22 November 2026. Intermediate mathematical recovery of original printed symbols. This reconstructs already-visible ciphertext/table bytes; it does not decrypt unknown LP2 plaintext or recover an authentic key.**

The original 277-rune physical p29 polynomial over GF29 is divisible by the red p39 quadratic G(x)=15(x−24)^2, giving two independent zero-syndrome equations. The same source p29's unique GF257 polynomial root is x=121, exactly the original length of physical p32 (121 runes, the square 11×11). That root was discovered retrospectively among 257 field elements, so the matching page length is a **hypothesis**, not an independently authenticated decoding instruction.

**Complete p29 recovery:** preserve the original first 274 rune indices and erase offsets 274–276. For a trial first erased digit a=0..28, the two G equations P(24)=P'(24)=0 modulo29 uniquely fix the next digits b and c. All 29 suffixes are literal valid GP29 rune triples and reproduce the G-codeword. Applying the independently selected GF257 check P(121)=0 yields exactly one triple, **[6,8,19] (GP G,H,M)**. It matches the three actual original source runes exactly. The printed word continues over the p29/p30 boundary, so this is page-boundary code arithmetic rather than evidence of plaintext word-break alignment.

**Complete p50 recovery:** original pp49–51 have a 32×8 table of 256 conventional base60 bytes. In modulo841 arithmetic, the established GF29 quadratic factors H and G have four higher-residue carry digits corresponding to the historical DH state A=8, g=5, b=15, K=2. In constant-first coefficient order the target remainder vector is H=[29*5,29*8] and G=[29*2,29*15]. The original table also has a unique root x=213 over GF257, equal to the printed p23 rune count; its inverse field element 146 is primitive-root38 Fourier bin76. That source relationship was likewise identified after analyzing the complete table.

Erase the original final five table byte values, retaining its first 251. For each b251=0..255, the four modulo841 carry equations uniquely solve the remaining four suffix bytes by a fixed 4×4 invertible modular matrix. Exactly **two** full five-byte suffixes fit those four equations and the required 0..255 range:

| Candidate for table cells 251–255 | Full table GF257 evaluation at x=213 |
| --- | ---: |
| [30,177,46,71,35] | 128 |
| **[230,180,36,189,80]** | **0** |

Thus GF257 chooses exactly one of two byte-valid tails, and it **recovers all five original printed source bytes exactly**. The program opens each original erased suffix only after candidate recovery for an exact equality assertion. No unknown plaintext, English language model, cipher-key fitting or page image alteration enters the calculations.

These provide two executable forms of a potential systematic *cross-field checksum* reading, on the original p29 and table p50. **Interpretation caution:** both data vectors were inspected before the quadratic/root constraints were recognized; after-the-fact erasure reconstruction cannot prove the manuscript author intended check symbols. Other original pages have incidental GF257 roots matching other page lengths. There is still no authenticated reason to treat the 274 or 251 unconstrained prefixes as plaintext or encryption keys. This result is a precise, reproducible structural capability and a candidate protocol boundary, pending a genuine source-selected payload consumer.

**Exact Windows Node22 CommonJS reproducer:** [sims/lp2_crossfield_erasures_source_sft.cjs](../sims/lp2_crossfield_erasures_source_sft.cjs). The p50 GF257 zero used here as an erasure constraint is compatible with the separate exclusion of **p50 cyclic convolution as a ciphertext receiver** in [the earlier report](lp2-gf257-cyclic-convolution-terminal-codeword-gate.md); the mechanisms have different algebraic claims.
