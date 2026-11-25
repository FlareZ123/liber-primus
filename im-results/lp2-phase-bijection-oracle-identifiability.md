# Independent q8 phase alphabets: constructive lexical nonidentifiability

Agent 13, 2026-11-25, Director #2711. This is a constructive identifiability test, not an all-key contradiction for the original and not an original plaintext recovery.

## Model and stronger oracle experiment

Eight unrelated GP29 permutations, each fixing F=0. Encrypt a native word stream with one continuous phase clock: nonzero plaintext consumes one phase, literal F emits zero and holds. Permute complete ciphertext group objects after encryption. The receiver is allowed arbitrary group starting phases, as in the Issue. This experiment grants **more information than the intended receiver**: the true plaintext of every development group, and the true phase and F-hold schedule of every group, including the withheld groups. Any ambiguity surviving these oracles survives the less-informed lexical/all-different model. The selected true F-hold schedule is one valid schedule under optional holds.

The oracle development plaintext supplies a partial cipher→plain bijection at each phase. Any unassigned cipher symbol maps bijectively to one of the unused plaintext symbols. If phase p has m_p unassigned nonzero entries, the exact number of full-key completions compatible with the oracle fit is the product of m_p!, independent of unobserved values. Even supplying all true plaintext words and phases cannot distinguish completions of entries never exercised.

For each withheld group, generate every word from the same frozen 35,944-form register matching length, true F positions, and the partial phase maps. Each candidate supplies a list of previously unknown (phase,cipher,plain) triples; impose shared forward equality and reverse injectivity constraints, not independent word pads. Exact MRV backtracking across all 17 withheld groups checks compatibility under one common set of phase bijections. Enumerate word tuples up to 256 (lower bound if capped); independently force each candidate in each group and find an extending full tuple or exhaust its search. Thus feasible word-domain sizes are exact, even for the capped tuple count. For truth and a distinct alternative tuple, complete every remaining partial bijection deterministically and re-encrypt all groups in the known original control order, then check exact C and continuous phase replay. Alternative plaintext need not be coherent prose; it is a constructive ambiguity in the specified lexical CSP, not a claim that an authored passage is ambiguous under a stronger language model.

## Controls

Three independent length-profile-matched native-word samples (held-out last 20% of donors, not contiguous prose), then three actual contiguous 66-word held-out donor windows, chosen by nearest total rune count to 308 among in-register windows. Encrypt with independent seeded random phase permutations and shuffle complete groups. For length-matched controls shuffle among equal-length slots; for contiguous controls unrestricted shuffle. Fit first 49 printed groups, hold last 17. No keys or hold words are passed to the CSP except the explicitly granted true phase schedule; truth is used to check the solutions.

| Seed | Source | Fit / hold runes | Unused fit entries | log10 fit key completions | Feasible heldout tuples | Ambiguous multi-rune groups |
|---|---|---:|---:|---:|---:|---:|
| 271101 | length matched | 222 / 86 | 108 | 83.29 | 26 | 2 |
| 271102 | length matched | 222 / 86 | 109 | 84.51 | 33 | 5 |
| 271103 | length matched | 222 / 86 | 112 | 87.88 | 32 | 3 |
| 271104 | contiguous Gibran | 212 / 80 | 124 | 101.78 | 60 | 5 |
| 271105 | contiguous Shakespeare | 223 / 81 | 111 | 86.71 | ≥256 | 5 |
| 271106 | contiguous Emerson | 232 / 76 | 108 | 83.30 | 1 | 0 |

All six true plaintexts replay exactly. In five, a distinct heldout word tuple also replays every source ciphertext rune (308,308,308,292,304 respectively), without changing any fit plaintext, group start phase, literal-F pattern, or true pre-shuffle group order. Multi-rune ambiguities include MY→UP, BREATH→BREAD and BODIES→COPIES, CIND→MIND and THAN→MAN, GRAUES→BRAUED, and ME→HE. These are real register words; no dependence on artificial singleton ambiguity. In the sixth control, the oracle does uniquely determine all 17 withheld words, but it still leaves the full key highly nonidentifiable. Across all six even the oracle knowing **all** true words leaves 90–108 unobserved phase-alphabet entries, with exact residual log10 key-completion counts 63.28–83.07 (seed-specific output). Hence a unique arbitrary q8 key assignment is not a reliable target, and five of six oracle fits cannot uniquely predict heldout lexical words under the stated constraints.

## Original phase-independent key multiplicity bound

For the 222 original runes in the 49 complete development groups ending before p54/p55 carry, let n_c be the occurrence count of nonzero ciphertext symbol c. Since a particular c can exercise at most min(n_c,8) distinct phase entries, irrespective of all group phases or F schedules, at least U=Σ_c max(0,8−n_c)=25 nonzero phase-map entries are unobserved. The counts for c=1..28 are 8,6,10,6,9,9,8,7,4,7,9,6,9,9,5,7,6,9,13,6,9,9,10,9,4,10,8,7. For any compatible oracle fit, the number of indistinguishable complete bijection arrays is ≥(3!)^7·4!=6,718,464, by balancing the minimum 25 unknown entries across eight phases to minimize the product of factorials. This is conditional on existence of a fitting key, not a proof such a fit exists or that its p55 words are ambiguous. Even a perfect fit cannot establish a unique complete original key from those groups. The full 232-rune page including the partial carry yields U≥21; the complete terminal chapter gives U≥7 (not enough by itself to guarantee multiple completions).

## Decision

The stated lexical/all-different receiver fails as a reliably identifying mechanism on calibrated controls, even under materially stronger oracle information. Do not fit the original p54 ciphertext with arbitrary independent alphabets and promote one satisfying map. No claim of universal impossibility: a stronger authenticated source relation coupling alphabets or an independent natural-language/order constraint could change identifiability. This finite result supports retiring the unrestricted independent phase-bijection expansion under the Issue's calibration gate.

Reproduce: `node sims/lp2_phase_bijection_oracle_identifiability_sft.cjs`. Actual core executed in connected V8 on fetched repository sources; exact per-group feasible domains and replayed alternatives in [raw JSON](lp2-phase-bijection-oracle-identifiability.json). No original key or plaintext.
