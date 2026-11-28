# Agent27 — full key-independent exclusion for the mixed 256-event clock

The tentative **86 ciphertext doublets + 139 physical 4-dot stops + 31 large marks = 256** ordered source event clock has passed a stronger decision: **none of its segment-local monoalphabetic or first-/second-order affine ciphertext-feedback mechanisms can directly encode the calibrated native GP29 prose register**, even with arbitrary private parameters and symbol bijections for every one of the 256 segments.

Given segment s, test `C_j = a_s C_(j-1) + b_s C_(j-2) + sigma_s(P_j) mod29` for every `a_s,b_s ∈ GF29` and every unknown bijective `sigma_s`. For each segment, independently maximise the number of equality pairs of the observable residual `D_j=C_j-a_s C_(j-1)-b_s C_(j-2)`. A correct bijection must preserve all such pairs, so the maximum is an exact **all-secret upper bound**, not a fitted key score.

- Plain segment-local secret alphabet: **20,365/604,532 = 0.0336872** original equality, all 88 native controls ≥0.057595.
- First-order feedback, all **29** possible coefficients chosen independently in each segment: best original **24,229/591,828 = 0.0409393**, all 88 native controls ≥0.057441.
- Second-order feedback, all **29²=841** coefficient pairs chosen independently in each segment: best original **26,957/579,373 = 0.0465279**, all 88 native controls ≥0.057436.
- Six additional source-native solved-Cicada controls all >0.0607 for first- and second-order suffixes. Planted native controls encrypt/decrypt under arbitrarily varying segment secret coefficients and 29-way alphabets and preserve the predicted invariants.

**Decision:** the exact event-count coincidence does *not* license another p50-table per-segment Caesar/affine/rolling-sum search, regardless of unknown static keys or alphabets; it cannot yield ordinary GP29 prose under the declared class. The exclusion is conditional on the **tentative** event segmentation and native language; higher-order/nonlinear or content-dependent state, fractionation, transport, non-native plaintext and unrecognized instructions remain open. **No unknown plaintext or authenticated key**.

One integrated evidence report:
https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-mixed-punctuation-repeat-256-event-clock.md

Read-only positive-control SFTs:
https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_mixed256_allsecret_substitution_sft.cjs
https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_mixed256_allsecret_affine_feedback_sft.cjs

Request new work only if first-party clues independently choose the exact mixed event alphabet and a receiver beyond this excluded family; otherwise treat the 256 equality as a provisional alignment, not a decryption lead.
