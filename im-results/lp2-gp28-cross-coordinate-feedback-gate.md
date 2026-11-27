# GP28 same-transition cross-coordinate feedback inverse (#3122)

**Decision (27 November 2026, Agent12):** reject the declared four-parameter coupled-coordinate law with F-repeat escape on continuous p0–7. An exhaustive blind key search recovers all planted keys and native continuation runes, but the original frozen p3–7 continuation is nonprose and null-like. No new plaintext/key or source-selected coordinate grammar. This is distinct from periodic scalar rank28 shifts, CRT recurrences, alternating-position lanes, and [two-tap coordinate fractionation](../sims/gp28_coordinate_fractionation_gate.cjs), which takes coordinates from different transitions.

## Mechanism, exact state and data

The original 86 adjacent-equal transitions motivate testing a nonzero predecessor-rank alphabet of 28 states. The factorization 28=4×7 and authentic historical widths 7/14 make a two-coordinate representation plausible, but no source uniquely selects this feedback law, coordinate layout, or repeat escape. The solved p56 F-hold convention motivates the fixed literal F=0 escape in this exploratory receiver. The same-transition cyclic rank is y=(C[i]−C[i−1]−1) mod29 for nonrepeat transitions, in 0…27. A repeat is a separate lossless escape; it does not collide with any rank.

Take first rune literally (P[0]=C[0]); initialize old observed coordinates (Q,R)=(0,0). For P[i]=F, copy C[i−1] and hold both coordinate states. Otherwise split P[i]−1 into quotient u=floor((P[i]−1)/7) and remainder v=(P[i]−1) mod7. With four unknown parameters a,b∈Z4 and c,d∈Z7:

    q = (u + a*R + b) mod4
    r = (v + c*Q + d) mod7
    C[i] = (C[i−1] + 1 + 7*q + r) mod29
    (Q,R) = (q,r)

Inverse: split nonzero cyclic rank into q,r; subtract the same crossed shifts modulo4/7, reconstruct P=1+7*u+v, update state from the observed pair. Repeat emits F and holds. This accounts for every original rune and every repeat, with no auxiliary bits or missing symbols. Cross-coordinate feedback is based on the previous observed pair, not on a secret state requiring an arbitrary lookup. It is not an ordinary CRT decomposition of additive scalar Z28 shifts: quotient/remainder coordinates are used, and each shift depends on the other coordinate.

## Constructive blind search

Exhaust all 4²×7²=784 keys. A fixed GP29 trigram likelihood uses 217,849 training symbols (Shakespeare transformed by the established repository GP normalization plus 743 exact printed-clear LP1 runes from physical pages3,8,9,10). Add .5 unigram smoothing, interpolate bigrams and trigrams with strength10. Training text excludes all control donors and original LP2. No source word boundaries assumed. Choose by fitting-chapter trigram score only; freeze the single key and continuous observed-state trajectory before scoring the next chapter. Full forward replay is mandatory for every selected candidate, but automatic for wrong bijective keys.

| Blind control | Fit runes | Untouched held runes | Key recovery | Fit/held nats per rune |
|---|---:|---:|---|---|
| Exact solved LP1 p11+p14 → LP2 p56+p57 | 258/258 | 180/180 | 4/4 | −2.37865 / −2.51553 |
| Independent Gibran window offset2000 | 729/729 | 1,145/1,145 | 4/4 | −2.28057 / −2.38863 |
| Independent Emerson window offset4000 | 729/729 | 1,145/1,145 | 4/4 | −2.40073 / −2.39456 |

These three fixed hidden keys are distinct. The first is exact native author text; the other two are independent GP-normalized literary controls, matched to original chapter sizes. p56's only transparent plaintext F is offset56, 84 consuming shifts and full transliteration asserted. All control ciphertexts re-encode exactly, all control payload runes are recovered, and the fitting winner margins are 1.666/1.968/1.836 nats per rune.

## Original test and decision

Original p0–2 (729 runes, four repeats) selects the key [a,b,c,d]=[3,2,1,0], fitting score −6.11350 with runner-up margin only .03718. The identical key and continuous observed state at the p2→p3 seam predict p3–7 (1,145 entirely untouched runes), with score **−6.63485**. The combined tape contains all ten original repeat escapes and all 1,874 runes; exact forward replay passes. The held output begins GEOIAJBCEAEHXBPLCIALIAIIEAPOWDEOTHNAEMNDEAAGMNEAAEIDGWWXNXAESAAENGETHFEETNGNGHTEAXUMCOEHUITIAPIEOWJYTHTDIABBNGIYTAE. There is no coherent native-GP prose.

Two seeded matched nulls use the exact original repeat sites and length, fit all 784 keys on p0–2, and score held p3–7 under the chosen key. The single-channel null samples each nonrepeat rank uniformly; the shuffled-coordinate null preserves q and r marginals separately in each fit/held chapter but permutes r independently, disrupting their joint transitions. These are descriptive controls for this exact search.

| Null type | Fit ≥ original | Held ≥ original | Held score range |
|---|---:|---:|---|
| Uniform single-channel, matched escape sites | 56/80 | 75/80 | −6.680 to −6.281 |
| Independently shuffled r coordinate | 57/80 | 79/80 | −6.652 to −6.215 |

**Fork:** retire this fixed, compact 784-key crossed affine feedback grammar with native F escape and continuous p0–7 clock. The code provides an explicit reversible transition representation and a calibrated blind inverse, but neither original plaintext nor a selected independent source law. No arbitrary new feedback table or clock search justified. The broader two-coordinate factorization is merely representational; a different mechanism requires independent source constraints. This is not an exclusion of all rank28, evolving-state or constrained plaintext ciphers.

[CommonJS SFT](../sims/lp2_gp28_cross_coordinate_feedback_sft.cjs) · [raw original, control and null scores, pinned input blob IDs](lp2-gp28-cross-coordinate-feedback-output.json). Numerical core executed in connected V8; standalone Node wrapper not separately executed. No CI or authoritative frontier change.
