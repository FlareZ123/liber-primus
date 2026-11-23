# LP2 source-mark GP30 rotor: exact whole-book private-key bound (23 November 2026)

## Research decision and source

The 55 rune-bearing unknown LP2 pages p0–55 carry 12,956 original GP29 runes, 2,896 complete printed-word separators, and 31 large original manuscript punctuation marks. Treat the authentic printed separator as movable GP30 symbol 29. The resulting **15,852-symbol ciphertext** joins the 32 genuinely page-spanning printed words. The 31 visible marks occupy **29 distinct token cut positions**, of which 28 are internal; p14's terminal and p15's initial 13-dot marks share one cut. The source maps come from \`resources/liber-primus/lp2-transcription.txt\`, \`lp2-corpus.json\`, and \`lp2-ink-annotations.json\`. Marks advance *after* the completed authentic printed word, or before the next source token for offset-zero marks.

A proposed human-readable operation might advance a 30-symbol substitution wheel by each visible mark's ten or thirteen dots, or advance once per mark. This is independently motivated by actual source-visible marks and the historical GP alphabet, but **no first-party Cicada instruction selects it**. It was tested as a tightly bounded reversible model, not assumed to be the real encryption.

The earlier exact book-global GP30 previous-ciphertext-state all-key bound was 3,707 for plaintext SPACE plus any one rune. A completely unrelated fresh table at each 29 source-visible mark interval instead permits a two-symbol capacity of 4,708, leaving that much less constrained family alive as a *necessary* style-frequency condition. The present test asks whether the missing adaptability can be supplied by a **fixed shared table plus simple public mark-driven cyclic rotations**, rather than inventing 29 unrelated private keys.

## Full reversible cipher family

Set the observed GP30 ciphertext symbols to \`C[i]\` (0..29, SPACE=29). Let the public phase \`q[i]\` be a cumulative mod-30 count from original visible marks, applied from the source cut onward. Four independently fixed clocks are tested:

1. \`dots-all\`: advance by 13 or 10 according to every actual mark's printed dots.
2. \`dots-red\`: same, but ignore black marks.
3. \`unit-all\`: advance by one at every mark, ignoring dot count.
4. \`unit-red\`: advance by one at red marks only.

Both positive and negative phase directions are admitted. At identical cuts, actual marks contribute additively. The single global secret is **30 arbitrary independent permutations of all 30 GP30 symbols**, denoted \`F[state][input]\`, shared over all pages. Each of seven distinct reversible rotor wirings is tested, with \`a,b,c ∈ {0,1}\` and \`a+b+c>0\`:

\`\`\`text
state = (C[i-1] + a*q[i]) mod 30
input = (C[i] + b*q[i]) mod 30
P[i] = (F[state][input] + c*q[i]) mod 30
\`\`\`

The predecessor is the **previous ciphertext token**. The first token has a fixed known initial state for explicit encoding and is granted a completely free target hit in the all-secret upper bound, making the bound conservative. Given the public phase and previous reconstructed ciphertext, any row permutation permits exact forward encoding. The tested \`a,b,c\` combinations rotate the state index, current ciphertext index, output index, or any nonempty combination of those three; there are **4×2×7 = 56** frozen complete-cipher families. All 30! choices per row are included, with no sampled-key or language-model optimization.

## Exact all-key optimization

For each original ciphertext position i>0, construct the full source counts

\`H[state,input,phase] = number of i producing this transformed pair and phase\`.

A native GP29 prose plaintext should have comparatively frequent SPACE plus a frequent rune. For every unknown candidate rune \`r ∈ {0..28}\`, optimize the count of decoded symbols in \`{SPACE,r}\` over **every** possible 30! permutation per secret state row.

When \`c=0\`, an all-key maximum for each state is the sum of its two largest transformed-input occurrence counts. When \`c=1\`, the output label varies with the public phase, so each candidate rune/state produces a 30×30 maximum-weight assignment matrix

\`W[input,mapped] = sum_phase H[state,input,phase] * I[(mapped+phase) mod 30 ∈ {29,r}]\`.

A Hungarian maximum-weight perfect matching gives the exact global optimum for that row over all alphabet permutations; row solutions are independent. Maximize over the 29 fixed possible rune labels and add one free first-token hit. This is an **upper bound independent of all secret row keys**, not a sample search. The SFT independently validates the assignment score against an explicit reconstructed permutation and checks a positive 2×2 matching.

### Original-input results

| Visible-mark clock | Max SPACE + one rune, across 14 wirings and both directions |
|---|---:|
| dot counts, all ink colors | **4,251** |
| dot counts, red only | **4,264** |
| one step per mark, all ink colors | **4,274** |
| one step per mark, red only | **4,287** |

The largest possible output among **all 56 complete cipher families is 4,287**. Exact original p0–p55 native GP rune semantics and 2,896 printed word separators are checked. A complete explicit GP30 source forward/inverse plant using the dot-count clock and \`a=b=c=1\` recovers **all 15,852 symbols exactly** and moves the space-versus-rune status at **3,163 original positions**. This proves the family really can change segmentation as an algebraic receiver; the synthetic output is not grammatical plaintext and the positive test does not authenticate a historical key.

Independently sourced solved-Cicada GP-native controls from \`resources/external/relikd-solved-gp29-native-v1.json\` yield **256/256** complete original-wordlength-matched 12,956-rune plaintext samples with SPACE-plus-largest-rune count above 4,287. The training-source minimum is **4,383**, independent held-out solved-section minimum **4,471**. Thus the generous exact maximum is **96 below the easiest author-authentic sample**. Existing separate [original GP30 predecessor-control report](lp2-gp30-global-cprev-space-immutability-original.md) also gives full-length literary minima 4,364 Gibran, 4,620 Shakespeare, 4,472 Emerson, all above 4,287. The real language is unknown; these controls are **conditional calibration**, not a proof that no atypical plaintext exists.

## Consequence and limits

For direct ordinary native-GP plaintext, no key in the complete *book-global*, previous-**ciphertext**-keyed, mark-rolling modular GP30 substitution family explains even the minimal concentration of spaces plus one frequently recurring rune. This closes a distinct shared-key **changing-state, genuinely space-moving** architecture with source-visible mark clocks, whereas fixed shared predecessor tables, arbitrary 29 independent mark interval secrets, changing-private-key feedback, previous-*plaintext* state, non-rotation mark actions, different text register and variable-length code remain separate models.

**No unknown LP2 text, actual Cicada key, receiver, or destination was recovered.** Before investing in mark-based decoding, recover an independently authored **noncyclic** table update, source-authenticated fresh key derivation, or a different state mechanism. Pure mark accumulation, ±13/10 rotations, and private global alphabet fitting are exhausted within this precisely stated family.

[Full read-only Windows Node 22 CommonJS SFT](../sims/lp2_gp30_mark_rotor_allsecret_original_sft.cjs) · [PASS run 45117653411](https://github.com/FlareZ123/liber-primus/actions/runs/45117653411) · [Director research task #2278](https://github.com/FlareZ123/liber-primus/issues/2278).
