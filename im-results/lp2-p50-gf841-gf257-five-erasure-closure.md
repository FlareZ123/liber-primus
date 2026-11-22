# P50 five-erasure closure from the GF(29²) DH carries and GF(257) root213

**Agent7, 22 November 2026. Classification:** newly executed exact joint-field *in-sample* algebraic reconstruction on the original table. It reconstructs five selected original p50 byte values from the other251 without brute-force English scoring. It does **not** recover unknown manuscript plaintext, independently authenticate a key, demonstrate a systematic last-five-cell parity convention, or establish a creator-selected cipher.

## Original source inputs and pre-existing premises

The 256 printed p50 two-character numeral cells form a row-major 32×8 table. Under the already tested, conditional conventional high-first base60 reading, each original cell yields an integer0..255. Treat the table as a polynomial of degree255 **with the original row-major bytes in descending order**.

The two previously published exact polynomial divisors modulo29 are:

- The authenticated 2013 BASE29 example gives the quadratic **H(X)=3+26X+24X²** over GF29. Its polynomial interpretation was a hypothesis, not a signed instruction.
- The physical p39 center red3 in source scan56.jpg is indices **[27,5,15]**, giving **G(X)=27+5X+15X²**. The original p23 midpoint red triad is [23,6,10] and proportional to H modulo29.
- Division of the complete original 256-byte polynomial by the literal integer lifts H and G, **modulo 841=29²**, produces remainders in [constant, X] order **H: [145,232]=29×[5,8]** and **G: [58,435]=29×[2,15]**. The four ordered carry values in [X, constant] per divisor are **[8,5,15,2]=[A,g,b,K]** under the previously recovered 2013 DH state (A=8,g=5,b=15,K=2). In particular b=15 was computed as a discrete logarithm and was not transmitted in the signed session.
- Independently, the p0 FFF/field proposal nominates GF257, where the original B(X) has its **unique** root at **213**, exactly p23's original rune count. The corresponding 256-point GF257 transform has a zero at bin76. None of the authenticated messages instructs multiplying/dividing a p50 polynomial, treating this value as a cross-field checksum, or omitting a specific five-byte segment.

**Crucial discovery bias:** both the carry labels and the field/root coincidence were learned by looking at this same original table during prior investigations. The joint inverse below is an *in-sample consistency calculation*, so its exact match cannot be treated as a new blind probability or independent confirmation of those post-observed hypotheses.

## Five masked cells reconstructed with no language fitting

Take **only the first251** original bytes and mask the five final printed cells, byte indices **251..255**, to zero. Fix the two literal source divisisors and target four remainder coefficients [H_const,H_X,G_const,G_X]=**[145,232,58,435]** before solving for the unknown bytes.

Because GF(29²) is a ring and H/G each have a leading coefficient invertible modulo841, quadratic remainders are linear in the bytes. The resulting four independent modulo841 equations constrain five unknown0..255 bytes. Enumerate just the first unknown x251 over the **actual admissible range 0..255**; for each candidate, solve the other four unknowns by a 4×4 modular Gaussian inverse. There are **exactly two** five-byte solutions consistent with the four original carry targets:

| Candidate bytes b251..255 | B(213) modulo257 | Pass GF257 root requirement? |
| --- | ---: | --- |
| [30,177,46,71,35] | **128** | No |
| **[230,180,36,189,80]** | **0** | **Yes** |

Thus the **joint** four GF841 equations and the separately observed GF257 zero pick a **unique** admissible five-byte suffix. This exactly restores the five printed source cells **[3o,30,0a,39,1K]**, byte for byte. No GP-English, ciphertext reshaping, guessed 256-phase, phrase fitting, or AES/RC4 choice participates.

The algorithm is a finite erasure decoder for this particular overconstrained data record, conditional on accepting the four retrospectively assigned DH carry targets and the one root equation as input. The reconstruction does not establish a checksum *location*. A decisive location-control test blanks five different contiguous original table positions while holding **the exact same five constraints**: indices **0,25,73,100,195,210** each recover their respective original five cells uniquely after the GF257 root gate. All seven windows including the actual table end work. Consequently a special last-five parity layout is *not* demonstrated, and no data-versus-parity partition is determined by this test.

## Evidence and strict interpretation

- Exact deterministic [read-only CommonJS reproducer](../sims/lp2_p50_gf841_dh_gf257_five_tail_closure_sft.cjs) uses the canonical 256 p50 numeral bytes, p23's 213-rune count, physical p39 red triad, literal documented H coefficients, and four source-derived carry targets; it asserts unique original root213, the two suffix candidates, five-byte original match, and all seven independent erasure-window controls.
- The prior source mathematical claims, including their postselection caveats, are in [the p23 red-midpoint GF29 source bridge](lp2-p23-red-midpoint-p50-factor-bridge.md) and [the p50 GF257 source-spectral analysis](lp2-gf257-spectral-border76-p56-source-bridge.md). This report adds their finite combination and original erasure-window controls; it **does not claim new independent source evidence**.
- All 56 unresolved p0..p55 LP2 pages remain encrypted. A root, four remainders and exact table-cell reconstruction constrain *encoding compatibility* and do not specify a reversible GP29 plaintext decoder.

## Decision for the research frontier

Retain the joint five-equation algebra as a **conditional interoperable checksum constraint** that can be applied if a future first-party source actually selects GF257, the H/G divisors, those DH carry slots and the p50 byte serialization. The present experiment cannot decide whether the 2014 author inserted those constraints intentionally. It also proves that the **apparent fifth-byte parity** cannot be assigned solely to the terminal source cells, since many other five-cell erasures recover exactly.

**The missing plaintext route is still a typed receiver:** an independent clue specifying what original LP2 ciphertext to invert with which genuinely recovered key/operation. Avoid further parity-position reports and trivial masked-cell reconstructions on this same fully observed table. This result is kept in intermediate research until an independent source selector, previously unobserved original ciphertext prediction, or genuine plaintext emerges.
