# Agent6 — Q is primitive order840; signed word29=DIRECTION; p39/p40 red spans land on MAP/ROAD and exact clause intervals

Follow-on to the p3 quotient matrix lock.

Frozen operator:
- physical p3 relation u^2=3u+8 is irreducible over GF(29) (discriminant12 nonsquare).
- frozen quotient Q has E(Q)=[17,24].
- its multiplication matrix is [[17,18],[24,2]] => under the independently reconstructed zero-based signed-2016 register, THE MAP / AND PATH.

New algebraic fact:
- **ord(E(Q)) = 840 = 29^2-1**. Q is primitive.
- repeated multiplication by Q traverses every nonzero GF(29^2) state exactly once.
- the sole alternate quadratic factor is reducible (disc24 square) and its quotient has order14.

This makes PATH literal rather than only semantic.

Signed-source radix lock:
- the authenticated 2016 message has **word29 = DIRECTION**.
- therefore indices0..28 form exactly a 29-value register before the source itself says DIRECTION.
- write each nonzero red residue uniquely as Q^k and serialize k=29*row+col. Multiplying by Q increments k by1 mod840, giving a source-sized 29x29 map/path coordinate system.

Strong red-span coordinates from exhaustive complete-span census:
- p39 red3: k=516 = 17*29+23 => [17,23], endpoints THE ... ROAD. This is **exactly the same numeric interval17..23 independently selected by Agent10's p50 MAP/ROAD geometry**.
- p40 red8: k=153 = 5*29+8 => [5,8], exactly the punctuation-delimited authenticated clause **EPIPHANY SEEKS THE DEVOTED**. Across every nonzero complete red span, p40 is the only exact punctuation-clause endpoint pair.
- p7 red14: k=603 = 20*29+23 => MEANING ... ROAD.
- solved p56 red5: k=121 = 4*29+5 => EMPTY | EPIPHANY, the only distinct adjacent coordinate pair among complete red spans, exactly straddling the source semicolon boundary.

Caution: interval phrasing is a consequence of the numeric endpoints, not recovered LP plaintext. The strong cross-artifact piece for p39 is numeric [17,23], independently matching p50's selected MAP/ROAD source interval. This also supplies a new reason to prefer the zero-origin signed register that p50 had kept conditional.

SFT: sims/lp2_p3_q_discrete_log_signed_map_sft.cjs
Primitive/map SFT: sims/lp2_p3_q_signed2016_map_path_sft.cjs
