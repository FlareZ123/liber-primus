# GP29 Chaocipher source-wheel inverse and shared-reset obstruction

## Decision

No unknown LP2 plaintext or author-selected key recovered. A historically available adaptive two-wheel decoder fails to produce native GP prose for ten specified ciphertext-wheel circular orders, two nadir choices, and four source clocks, even allowing all 29! possible initial plaintext alphabets. A distinct cross-reset first-rune test also constrains shared-initial-state ciphers independently of their later transitions. The period-available extended mixed-role variant has an exact all-fixed-takeoff-schedule mean bound; adaptive repeat suppression creates a missing receiver constraint (see below).

Solved p57's WE MUST SHED OUR OWN CIRCUMFERENCES is a possible circular-wheel cue, not a first-party Chaocipher instruction. Byrne's algorithm was publicly described by Rubin in 2010 ([algorithm](https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf); [discussion](https://www.chaocipher.com/displaying-permuted-alphabets.html)). Published ciphertext-only attacks target in-depth messages, not a general single message ([2015 paper](https://doi.org/10.1080/01611194.2015.1091797)).

## Actual reversible inverse

Given c, find its index k in the evolving left wheel, rotate both wheels by k, output the right zenith, move left index1 to the nadir, rotate the right wheel one extra position and move right index2 to the nadir. Indices are zero-based. Original 26-symbol nadir13 is generalized to GP29 nadir14/15. Forward encoding finds p on the right and emits left zenith. No F transparency or punctuation slots are assumed.

Fixing the left wheel fixes every subsequent positional rotation using C alone. Any initial right permutation R simply relabels the abstract identity-wheel plaintext by R; therefore no unknown R changes its equality pattern or IoC. A common cyclic rotation of the left starting order also only relabels the right labels (all29 rotations checked on full original). For separately private right wheels the within-segment weighted IoC remains invariant, while pooled IoC is only invariant for one common R.

Left candidates: GP order; original 13-red-rune p0 title; p57 CIRCUMFERENCES; p57 WE MUST SHED OUR OWN CIRCUMFERENCES; full p57. Each seed is deduplicated in first-occurrence order then filled with missing GP runes; each complete wheel and its reverse are tested. No claim that Cicada selected these operands. All 80 complete original inversions use the original 12,956 runes, with global, nine-chapter, physical-page and 594-line clocks. All58 master transcription page tapes were cross-checked against the corpus and each original inverse forward-replayed exactly.

| Clock | Maximum pooled IoC | Maximum within-segment IoC | Minimum native within-segment IoC |
|---|---:|---:|---:|
| Book | .034527765 | .034527765 | .061336943 |
| Nine chapters | .034521878 | .034552103 | .061283660 |
| Physical pages | .034527479 | .034592528 | .061281480 |
| Printed lines | .034531101 | .035130928 | .055864534 |

Five frozen native Crowley/Blake windows supply the controls. The highest global original inverse (p0-red-heading/nadir15) has .034590908 p15–22 training and .034493761 p40–53 holdout IoC. The historical 26-letter known vector and all four full-length native plants with a nonlinear secret right wheel passed. An arbitrary secret R cannot improve the flat outputs. No unknown plaintext recovered.

## Distinct all-secret cross-reset obstruction

Any deterministic causal one-rune-in/one-rune-out cipher starting each message in a shared fixed state applies one common map to the first plaintext rune. An immediately reversible map must be a permutation, so equal first-rune pair counts are invariant. Any deterministic noninjective map can only increase the count. This does not depend on later state evolution or the secret initial key. Thus in-depth Chaocipher recovery with shared starting wheels faces this necessary condition even if both wheels are entirely secret.

Count M=sum f(f-1)/2 across the original first symbols at each designated reset. For independently private states in distinct groups sum the counts separately within each group. The same five previously frozen Crowley/Blake native windows are sampled at the exact original reset positions:

| Reset-state sharing | Starts | Original M | Five native M |
|---|---:|---:|---|
| Same state all printed lines | 594 | 6620 | 11156,11438,10626,10667,11410 |
| Chapter-private reused across lines | 594 | 950 | 1499,1552,1455,1496,1504 |
| Page-private reused across lines | 594 | 107 | 208,216,185,202,174 |
| Same state all physical pages | 55 | 52 | 97,107,105,75,99 |

This is a cross-reset rather than within-segment private phase equality comparison. It is an exact necessary condition for the specified positions and a finite donor comparison, not a universal theorem against English. The 55-page sample is particularly weak. It leaves changing reset states, hidden headers or position-dependent initial maps, multi-rune/delayed emission, shifted positions, unusual or nonnative plaintext, and continuous adaptive wheels open.

## Extended historical takeoff pattern: exact all-schedule expectation and adaptive fallback obstruction (#2860)

**25 November, Agent2.** The classical left/right role is not the only period-available ordered-wheel machine. Byrne's mixed-side priming procedure was disclosed by Rubin in 2011 ([historical paper](https://doi.org/10.1080/01611194.2011.606751)); Kruh and Deavours also used a prearranged left/right plaintext-wheel takeoff pattern in their 1990 challenge ([historical account](https://chaocipher.com/chaocipher-023.htm), [2013/2014 paper](https://doi.org/10.1080/01611194.2014.856653)). This is a genuine extension, not another classical wheel-key sweep. The updates remain physical-wheel-specific: rotate both by the selected index, move left index 1 to nadir, rotate right one extra step, and move right index 2 to nadir. Only the choice of the input/output wheel changes. No Cicada source selects this takeoff mechanism, starting wheels, or direction pattern. The clear p57 circumference phrase does not uniquely select it.

### Exact expectation over all initial wheel pairs, for *every* predetermined takeoff schedule

For alphabet size q, identify aligned wheel pairs modulo a common cyclic rotation. There are q!²/q equally likely quotient states. For a fixed plaintext symbol and fixed takeoff direction, the state transition is a **bijection on this quotient**: choose the post-update representative with the known plaintext symbol at its fixed physical anchor (left position 0 or right position q−1), undo the fixed positional permutations, and recover the prior aligned pair modulo common rotation. Consequently a uniform random starting state stays uniform for every fixed plaintext history and predetermined direction schedule. This does not require iid plaintext, a fresh random wheel at each step, or independence of repeat events.

Let p and v be adjacent plaintext symbols. After emitting c from the first step, the plaintext wheel has p at one anchor and the output wheel has c at the other; conditional on p and c, their remaining orders are independent uniform permutations. The two anchors differ. For the next step the exact expected repeat probability is:

| Fixed next takeoff | v=p | v≠p |
| --- | ---: | ---: |
| Same wheel role | 0 | 1/(q−1) |
| Switched wheel role | (q−2)/(q(q−1)) | (q²−2q+2)/(q(q−1)²) |

For a switch, average over the uniform previous c. If v=p, c=v=p cannot repeat; for each of the q−1 other c, the next index must avoid both anchors and the probability is (q−2)/(q−1)². If v≠p, c=v and c=p each contribute 1/(q−1); the remaining q−2 symbols each contribute (q−2)/(q−1)². For an unchanged role, a repeat requires the next input at the other anchor, uniformly occupied by one of the q−1 symbols other than p. Both formulas apply whichever physical wheel was the input wheel.

Thus for any fixed native tape of length N with D equal adjacent plaintext pairs, for **every** fixed takeoff bitstream, even one selected from the plaintext without knowing the random initial wheel key, the mean ciphertext repeat count over all uniform starting wheel pairs is at least (N−1−D)(q²−2q+2)/(q(q−1)²). The maximum is (N−1−D)/(q−1)+D(q−2)/(q(q−1)). These are bounds on the **mean**, not on the minimum over adversarially selected keys; they neither establish a binomial tail nor exclude all specially chosen wheel pairs. They show that a predetermined schedule alone supplies no natural anti-repeat effect.

The SFT reproduces both the published classic 26-letter vector and Rubin's mixed-side CHAOCIPHER priming vector VZKYRVPRRP including the exact final wheel orders. It exhausts all 2,880 aligned q=5 starting states for each of 96 length-five (plaintext, takeoff pattern) cases, checking all 384 individual transition expectations by integer equality. It also checks the genuine p56 prime-minus-one/F-hold and p57 literal controls exactly against the canonical original source. The nine native solved-source records give their actual-length expectation bounds (included in SFT output). In two frozen full-length historical-literature GP-native tapes, the exact schedule-uniform bounds and empirical independent-key calibration under the repeated 2011 pattern RRLLRRLRLR are:

| Native donor, N=12,956 | Plaintext D | All-fixed-schedule mean range | 128 independent seeded initial wheel pairs, min–max (mean) |
| --- | ---: | ---: | ---: |
| Crowley prefix | 423 | 432.6891–461.6367 | 385–498 (448.0781) |
| Blake suffix | 394 | 433.6904–461.7081 | 398–495 (445.7500) |
| Original LP2 | unknown | n/a | **86 actual** |

All 256 native plants replay exactly. The native source texts are the repository's pre-existing GP encoding convention; Crowley and Blake are literary controls, not asserted to be Cicada plaintext. The random wheels are seeded Fisher–Yates (xorshift32 seed 3301), not exhaustive. No fixed-schedule original inverse was selected by independent evidence, so no new candidate plaintext is asserted.

### Why adapting takeoff to suppress a repeat does not repair the missing receiver

A tempting repair chooses the classic R input role except when its output would equal the previous ciphertext symbol a and the L input role avoids a. This is a new greedy modification, not the documented prearranged historical takeoff pattern. At any given state, write T for the right-to-left substitution, so the opposite role uses T⁻¹. The only input p₀=T⁻¹(a) that maps to a under T is rerouted to b=T⁻¹(p₀) when b≠a. But the distinct input T⁻¹(b) still outputs b under T. The transition is then noninjective, with a missing output a and duplicate output b. If b=a it stays bijective but cannot suppress that repeat. This is a local exact obstruction; future constraints could disambiguate some whole sequences.

With the same 29-wheel update, the first eight key pairs per donor under the greedy encoder produce **20–41** doublets in 12,955 transitions, **392–447** actual direction switches, **12,009–12,112** nonbijective states, and **801–879** observed locally ambiguous outputs. Explicitly supplying the actual takeoff bits gives exact native round trips for all 16 plants. This constructs suppression but does not solve its side-information problem. The hypothetical receiver without a bitstream can always extend the ordinary R candidate at a nonrepeat output; at repeat outputs it must find a state with T⁻²(a)=a. The original 86 repeat positions are consequently genuine constraints, rather than free plaintext anchors.

A direct original-input bounded inverse of this greedy modification, using identical canonical initial wheels, m=14, deterministic reservoir beam width 1,024 (seed 3301), reaches the eighth original repeat at offset 979 with two live paths, and loses all paths at offset **1038**, the ninth repeat. An earlier width-128 pilot dies at offset 932. These are bounded search failures, **not** proofs that no full original path exists. The larger SFT does not emit a complete witness, and no source selects the greedy policy or this starting key. Further beam enlargement would optimize an unselected, locally noninvertible model.

### Decision for #2860

Classic Chaocipher's earlier negatives stand. The historical mixed-role extension has now been constrained for every predetermined takeoff schedule in uniform-key expectation; the deliberately adaptive alternative can account for the low count only with local information loss unless its receiver resolves or obtains the missing choices. No authenticated small key, takeoff schedule, missing-bit transport or original predictive plaintext is available. Do not search arbitrary 29!² wheel states or direction bitstreams; a new first-party clue specifying them or a separately validated globally invertible anti-repeat receiver would change this decision. This is not a universal exclusion of persistent permutation-state encryption.

Reproducers: [extended takeoff exact gate](../sims/lp2_extended_chaocipher_takeoff_gate_sft.cjs) and [bounded original greedy inverse](../sims/lp2_extended_chaocipher_greedy_original_witness_sft.cjs). Both cores ran in connected JavaScript using the repository source data; standalone Node wrappers/CI were not separately executed.

## Reproducer and next decision for the classical model

Run `node sims/lp2_chaocipher_source_wheel_reset_sft.cjs` (Node22 CJS, no dependencies). The exact function was executed on remote original corpus/master/pinned controls in the JS tool runtime; all assertions passed. No Windows CI execution is claimed. [Source](../sims/lp2_chaocipher_source_wheel_reset_sft.cjs).

Retire these specific source wheels. Further fitting of right alphabets cannot change the original equality statistics. Do not assume shared line resets to mount an in-depth attack without independent evidence of the actual reset/representation. A continuous two-wheel inverse with an arbitrary left wheel remains possible but needs an independently selected left order, a long original crib, or a blind single-message attack demonstrated on native plants before spending more compute. No new unknown plaintext, key, authenticated mechanism or destination.
