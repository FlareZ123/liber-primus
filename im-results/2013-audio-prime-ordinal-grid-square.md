# 2013 audio prime ordinals select a grid matrix conjugate to the p3/p39 sixth power

**Classification (10 November 2026):** an exact cross-round algebraic relationship discovered through a plausible but not yet authenticated extraction path. The matrix identity and all stated arithmetic are reproducible. No LP2 plaintext has been recovered.

## Proposed human solve path

The established 2013 source integer is
[
1,595,277,641=1259cdot1031cdot1229.
]
The three factors have prime indices
[
pi(1259)=205,qquad pi(1031)=173,qquad pi(1229)=201.
]

**Hypothesis:** use these prime indices as zero-based row-major offsets into the original 32×8 base-60 grid. Their coordinates are
[
205=(25,5),quad173=(21,5),quad201=(25,1).
]
These are three corners of an axis-aligned square of side four. The missing corner is uniquely (169=(21,1)). This is a compact, human-visible geometric operation: the prime ordinals specify three corners, and the 32×8 grid supplies the fourth.

The four grid values at offsets ([169,173,201,205]) are
[
[228,117,74,76]_{10}equiv[25,1,16,18]pmod{29}.
]
Arranged in row-major square order, they form
[
M_1=egin{pmatrix}25&1\16&18end{pmatrix}.
]
The audio filename supplies the scale (761mod29=7), giving
[
B=7M_1=egin{pmatrix}1&7\25&10end{pmatrix}pmod{29}.
]

The extraction path above is a hypothesis, not an established instruction. In particular, interpreting prime ordinals as grid offsets and completing a square must not be treated as proven creator intent merely because the result below is striking.

## Exact connection to the p3/p39 projective generator

The p3/p39 field construction has multiplication matrix
[
M_0=egin{pmatrix}23&13\27&17end{pmatrix},
]
representing multiplication by (23+27u) in the existing field basis (u^2=3u+8).

Direct modular multiplication gives
[
M_0^6=egin{pmatrix}25&12\16&15end{pmatrix}.
]
The audio-grid matrix (B) has the same trace and determinant:
[
operatorname{tr}(M_0^6)=operatorname{tr}(B)=11,qquad
det(M_0^6)=det(B)=9.
]
Thus both have the same characteristic polynomial
[
X^2-11X+9pmod{29}.
]
More strongly, one explicit invertible conjugacy witness is
[
S=egin{pmatrix}1&0\27&3end{pmatrix},qquad det S=3,
]
for which
[
oxed{M_0^6S=SBpmod{29}.}
]
Equivalently, (B=S^{-1}M_0^6S). This witness is **not unique**; its source-looking entries 27 and 3 are suggestive because 27 occurs in the p39 red triad and 3 in the p3 field relation, but that particular witness is not independent proof of intent. The matrix similarity itself follows exactly from the displayed arithmetic.

The power identities are especially notable:
[
M_0^{30}=11I,qquad B^5=11I.
]
The scalar 11 is also the residue (1229mod29), the third factor residue of the 2013 audio number. Consequently, (M_0) has projective order 30 and full matrix order 840, while (B) has projective order 5 and full matrix order 140; (B) is precisely a conjugate of the sixth-power step of (M_0).

The prime-index residues are
[
[205,173,201]mod29=[2,28,27].
]
They include 2 and 27, the terminal/initial values of the p3 and p39 red triads respectively. Separately, the factor-value residues ([12,16,11]) multiply to 24, the p39 repeated root and p54 enlarged Ac value. The audio identifier contributes 7. These are exact cross-round coincidences conditional on the extraction hypothesis.

## Projective orbit and bounded cipher tests

Transforming the p3/p39 Ac24 vector ([24,1]) through the displayed (S^{-1}) gives ([24,26]), projective coordinate 21. Its orbit under (B) is the five-cycle
[
[21,20,5,22,0].
]
In the original p3/p39 basis, the corresponding (M_0^6) orbit from Ac24 is
[
[24,12,20,3,0].
]

Several straightforward uses were tested against the original 12,956 unknown runes:
- the unscaled and scaled 2×2 grid matrices as constant Hill transforms, including inverse, transpose, alignment, and page/book clocks;
- (B^i) as a period-140 polyalphabetic 2×2 Hill schedule, both directions, phase 0/1, transpose, alignment, and page/book clocks;
- the five-cycle projective orbit as a period-5 additive key, including the corresponding p3/p39-basis orbit;
- period-140 vector-component streams from the Ac24 and transformed-Ac24 seed vectors.

None recovers plaintext. The best period-140 poly-Hill score is −11.05672 nats/rune, against raw ciphertext −11.07314 and solved-reference holdout −8.41667. The best period-5 additive score is −11.04995. IoC remains ciphertext-like. These are bounded negative tests of simple cipher uses, not a refutation of the matrix relationship.

## Interpretation and next decision

The strongest new finding is not a decryption but a **candidate cross-round representation bridge**: the 2013 audio prime ordinals, interpreted as grid offsets, produce a matrix whose file-ID-scaled form is conjugate to the sixth-power step of the established p3/p39 projective generator, with the fifth power returning the same scalar 11 supplied by the third audio factor.

This warrants preserving and independently reviewing the extraction path. It does **not** justify arbitrary matrix/key searches. The next useful human-facing investigation is to determine whether the 30 points of the p3/p39 projective line correspond to the 29 GP runes plus a visual control/space symbol, using original page word boundaries and layout. In parallel, check whether the five-cycle induced by (B) intersects the p53/p55 red spans or the 13-dot controls. Agent 39 has been sent the exact relation for integration with the projective/13-dot work; Agent 45 has been asked to review the audio prime-ordinal interpretation.

**Reproducer:** [`sims/parable_audio_grid_projective_link.cjs`](../sims/parable_audio_grid_projective_link.cjs). It computes the prime ordinals, extracts the grid square, verifies the matrix identities and orders, and derives the transformed Ac24 projective orbit.
