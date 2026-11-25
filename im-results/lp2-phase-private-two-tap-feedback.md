# Phase-private GP29 two-tap feedback: blind inverse and exact original limits

**Agent12, 25 November 2026. No unknown plaintext, authentic key or continuation recovered.** This is a bounded original-data exclusion plus calibrated key recovery, not an identification of the creator's cipher.

## Receiver and causal premise

A continuous ciphertext integrator is relevant to the unusually few adjacent equalities and the reported local lag-five/six echoes; it could conceal ordinary GP29 through reversible feedback. Earlier [stationary three-lag affine scans](affine-feedback-through-three-lags.md), [integrated plaintext-feedback](lp2-integrated-plaintext-feedback-allkey-original-gate.md) and [source p50 parity-selected feedback](lp2-p50-bit0-dualecho-two-tap-original-gate.md) do not grant arbitrary independent phase coefficients plus phase permutations for this receiver:

```
D[i] = (C[i] - a[t]*C[i-l1] - b[t]*C[i-l2]) mod29
P[i] = pi[t](D[i]),   t=i mod q
```

Each phase has two unrestricted GF29 coefficients and an arbitrary secret permutation pi[t]. Its forward map uses pi[t] inverse and the same observed ciphertext history; initial max(l1,l2) runes are unconstrained. All runes consume; no F hold, insertion, deletion, reordered ciphertext or nonstationary phase maps. Neither the tap pairs nor this cipher have an authenticated creator selection. q8/q13 are historical key lengths, q29 the alphabet cardinality; q76/q180/q256 are physical table perimeter, interior and whole size. Those facts motivate testing but do not authenticate the phase clocks. All experiments use canonical p0–55 (12,956 runes). No printed group is required to be a true word. Page-reset variants reset both phase and history at each physical rune-bearing page.

## Exact rank capacity

Let h[t,a,b](x) count residual x in phase t. For any fixed set of k plaintext rune identities, a permutation can send only k residual identities into it. Thus an upper bound on its total count is

```
B_k = free + sum_t max_(a,b) sum_(k largest x) h[t,a,b](x).
```

This independently optimizes all 841 coefficient pairs per phase, each k separately; it need not be simultaneously achievable and is therefore a safe relaxation. Every initial unconstrained rune is credited to every top-k count. This is a mathematical necessary condition, not an English-language theorem. Evaluate contiguous encoded windows in the repository's pinned Emerson essays, Gibran Prophet, and Shakespeare extracts. The full-length minimum top-five counts are 5336,5227,5131; the 3,008-rune chapter p40–53 minima are 1212,1210,1136. Every reference window must satisfy all five rank capacities.

- All 12 global q8/q13/q29 combinations (taps 1,2 or 5,6; continuous or page-reset) fail every native whole-book profile. Even allowing independent keys across nine illustrated chapters, p40–53 alone rejects q8 and q13 for both tap pairs and resets. Three independent native 1,500-rune planted inverses recover exactly, and all satisfy the bounds.
- For p40–53 at q29, arbitrary assignment of phases to **at most two distinct coefficient pairs** also fails: exhaust all 354,061 unordered pairs including identical pairs. Maximum top-five capacity is 1035/1059 for (1,2) continuous/page-reset, and 1034/1090 for (5,6); all below native minimum 1136. Arbitrary phase permutations are still granted.
- Global continuous (1,2) at q76 has top-five cap 4495, below 5131. q180 and q256 top-five caps 5814 and 6588 survive rank capacity alone. A more discriminating equality test below resolves those survivors.

[Rank SFT](../sims/lp2_phase_private_two_tap_capacity_sft.cjs) · [output](lp2-phase-private-two-tap-capacity-output.json) · [two-regime and joint-window extension](../sims/lp2_phase_private_two_tap_capacity_extension_sft.cjs) · [output](lp2-phase-private-two-tap-capacity-extension-output.json).

## Actual blind key recovery

### q29, p40–53: arbitrary permutations versus affine maps

For an unrestricted phase permutation, sort marginal counts to nominate the eight best coefficient pairs per phase, then optimize conditional trigram with exact Hungarian assignments. Freeze the 2,105-rune fit and decode 903 untouched continuation runes. Despite strong coefficient nomination on three target-excluded literary plants, the best unrestricted-map solutions recover only 116,92,88 held-out runes: this optimizer is **not calibrated for the arbitrary-permutation family**, and its original negative cannot exclude it.

Restrict pi[t](x)=s[t]x+d[t], s nonzero. Enumerate the 812 affine maps per nominated pair, then refine by conditional trigram. All three independently encrypted literary controls recover **87/87 complete phase keys and 2,709/2,709 held-out runes** (the initial unigram receiver already recovers all three). Frozen original continuation score is **−6.340195 nats/rune**, versus −2.482746, −2.294651 and −2.335809 for the three correctly recovered controls. Original forward replay exact, output incoherent. This is a calibrated finite optimizer negative, not an exhaustive affine-key proof for chapter-private q29.

[Unrestricted SFT](../sims/lp2_q29_two_tap_blind_phase_recovery_sft.cjs) · [output](lp2-q29-two-tap-blind-phase-recovery-output.json) · [affine SFT](../sims/lp2_q29_two_tap_affine_blind_recovery_sft.cjs) · [output](lp2-q29-two-tap-affine-blind-recovery-output.json).

### q180, full original: long-period affine inference

Use p0–39 (9,640 runes) to nominate the top 32 coefficient pairs independently at each phase, via sorted marginal upper score. Exhaust all 812 affine maps for each nominated pair; select by native unigram likelihood, freeze all parameters, and decode p40–55 (3,316 runes). Three plants use independent random keys and literary donors excluded from their own language scoring. An exact marginal bound-and-branch mode exists but was not executed successfully; the executed K=32 shortlist is the decision here.

| Target | Full phase keys | Held-out exact | Held-out trigram log score |
|---|---:|---:|---:|
| Emerson plant | 176/180 | 3245/3316 | −2.560874 |
| Gibran plant | 173/180 | 3194/3316 | −2.500008 |
| Shakespeare plant | 176/180 | 3242/3316 | −2.626273 |
| Original p0–55 | unknown | incoherent | −6.230814 |

All outputs re-encipher exactly. No actual original key is selected by the language score. The separate exact collision bound below eliminates the global q180 class under all three native-window references, so no expensive refinement is warranted.

[Long-period SFT](../sims/lp2_longperiod_two_tap_affine_nomination_sft.cjs) · [control0](lp2-longperiod-affine-q180-control0.json) · [control1](lp2-longperiod-affine-q180-control1.json) · [control2](lp2-longperiod-affine-q180-control2.json) · [original](lp2-longperiod-affine-q180-original.json).

## Stronger exact phase-collision capacity, including q256

For a fixed phase permutation the complete equality partition is invariant. For each phase independently maximize its ordered equal-pair count over all 841 feedback coefficient pairs. Grant the initial unconstrained positions every possible equal pair involving them within their respective phase. Sum these upper bounds, or retain them separately. This is independent of the choice of arbitrary pi[t], independent of vocabulary and printed word order, but it assumes ordinary chronological consumption and the stated fixed phase clock.

| q | Max aggregate equal pairs (1,2) | Max (5,6) | Smallest of all native reference windows |
|---:|---:|---:|---:|
| 8 | 748500 | 755064 | 1199218 |
| 13 | 462190 | 470044 | 739040 |
| 29 | 214066 | 218224 | 330628 |
| 76 | 90080 | 91162 | 125254 |
| 180 | 46180 | 47000 | 52460 |
| 256 | 36898 | 37280 | 36102 |

All 308,372 Emerson, 49,537 Gibran and 204,151 Shakespeare full-length windows fail both pairs for q≤180 among these **six tested periods**, not every intervening period. At q256 only Shakespeare leaves aggregate survivors: 6,382/10,955 windows for the two tap pairs. A further necessary test checks each candidate's equality count and top-eight cumulative rank counts against the **individual phase** bounds, aligning the window's first rune to original phase zero. All remaining windows fail: the least violated window still exceeds at least **116/114 of 256 phase bounds** respectively. Every cyclic global starting phase of the secret maps is already absorbed into their independent freedom. This rules out direct continuous native-prose decoding in the tested q256 families even with unrestricted coefficient pairs and permutations, without fitting any original key.

[Collision SFT](../sims/lp2_phase_private_two_tap_collision_sft.cjs) · [output](lp2-phase-private-two-tap-collision-output.json) · [individual q256 phase gate](../sims/lp2_q256_two_tap_phasewise_collision_sft.cjs) · [output](lp2-q256-two-tap-phasewise-collision-output.json).

## Decision

Retire the two fixed two-tap continuous global architectures at q8,13,29,76,180,256 for the finite native-prose references; retire the short q8/q13 chapter-private variants on p40–53 and q29 with at most two coefficient regimes. The exact bounds grant arbitrary secret phase permutations, so replacing the affine map by an arbitrary alphabet cannot rescue those precise architectures. Unrestricted chapter-private q29, longer or dynamic clocks, mixed lag selection, plaintext-dependent feedback, F holds, rearranged/encoded plaintext and external key material are outside these claims. No inference about all possible natural-language strings is warranted.

Executed on the canonical checked-in data in connected JavaScript; standalone Node/Windows CI has not been run. An earlier all-target exact q180 nomination attempt exceeded execution limits; the recorded batched K32 experiment completed. The raw JSON files record all results and chosen candidate parameters.
