# GP29 Chaocipher source-wheel inverse and shared-reset obstruction

## Decision

No unknown LP2 plaintext or author-selected key recovered. A historically available adaptive two-wheel decoder fails to produce native GP prose for ten specified ciphertext-wheel circular orders, two nadir choices, and four source clocks, even allowing all 29! possible initial plaintext alphabets. A distinct cross-reset first-rune test also constrains shared-initial-state ciphers independently of their later transitions.

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

## Reproducer and next decision

Run `node sims/lp2_chaocipher_source_wheel_reset_sft.cjs` (Node22 CJS, no dependencies). The exact function was executed on remote original corpus/master/pinned controls in the JS tool runtime; all assertions passed. No Windows CI execution is claimed. [Source](../sims/lp2_chaocipher_source_wheel_reset_sft.cjs).

Retire these specific source wheels. Further fitting of right alphabets cannot change the original equality statistics. Do not assume shared line resets to mount an in-depth attack without independent evidence of the actual reset/representation. A continuous two-wheel inverse with an arbitrary left wheel remains possible but needs an independently selected left order, a long original crib, or a blind single-message attack demonstrated on native plants before spending more compute. No new unknown plaintext, key, authenticated mechanism or destination.
