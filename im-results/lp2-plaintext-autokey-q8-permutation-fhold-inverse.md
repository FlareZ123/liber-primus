# Arbitrary-permutation q8 plaintext autokey: constructive solver, original unresolved

24 November 2026, Agent 4. **No unknown LP2 plaintext or key.** This is a nonlinear extension of the [affine all-map decision](lp2-plaintext-autokey-q8-affine-fhold-original-gate.md), not an authenticated Cicada rule.

## Exact conditional model

On consuming rune j, C_j=P_j+K_0 (mod 29), then pop the queue and append f(P_j), with f any GP29 permutation and an arbitrary initial eight-rune queue. Plaintext F emits F and holds the queue; ciphertext F need not be transparent. For physical indices a<b, a supplies b's key iff both consume and exactly b-a-8 intervening positions are plaintext F. Then f(P_a)=C_b-P_b. First eight consumed runes have a free primer. This yields an exact Boolean model without an exponential enumeration of hold masks.

The dictionary has 38,920 native GP29 spellings, including known-control word types, and assumes original printed groups remain plaintext words. Per-word support constraints enforce one coherent dictionary spelling; a 28×29 one-hot feedback matrix is injective and extends to a full 29-permutation. Unobserved f entries are arbitrary completions.

## Executed experiments

- [Bidirectional DFS](../sims/lp2_plaintext_autokey_q8_permutation_fhold_sft.cjs), commit 56c9c38ba9738a6b5148a23fe7b90c47a7d09d3a: 12-million-visit caps on original p0, second KOAN and WELCOME. LOSS OF DIVINITY recovers the correct 203-rune training text and primer and 22 observed mapping entries, but cannot predict all heldout runes.
- [Conditional-lag SAT](../sims/lp2_plaintext_autokey_q8_permutation_fhold_sat.py), commit b58893bc727e9e54a5acff411866874c130f1a89. Local Linux native Z3 via ctypes; Windows requires accessible Z3 shared library (Z3_LIBRARY). The compact fixture matched connected original/canonical rune encodings and the local TextBlob 29,157-row source lexicon matched the repository list fingerprint. No remote CI run claimed.
- Blind LOSS OF DIVINITY control (seed 0x3301): 203/203 training runes, correct primer [18,18,8,17,20,0,1,4], all 22 observed mapping entries exactly correct, 7 unobserved rows not identified. 7.814 seconds, 1,055,310 assertions, 269 possible lag edges. Full forward replay exact. A conservative fixed-map direct prediction reaches only the first four withheld runes before ambiguous ciphertext F; no withheld full recovery claimed.
- Original p0–2 prefix 201 runes, 45 printed words, 12 visible Fs, 1,044,110 assertions: UNKNOWN / timeout (16 seconds solver cap).
- Original p54–55 zero-free 123-rune complete-word interval, offset70 in the 308-rune unit, 28 words, 577,506 assertions: UNKNOWN / timeout (same cap). Restricting frequency to >=10, >=30 and >=100, always retaining native solved types, also timed out. These are not exclusions.
- A minimized dictionary-trie SAT prototype reduced p0 assertions to 606,005 and p54 to 290,447, but both and the blind control timed out at 14-second solver cap. The ordinary candidate encoding remains the validated constructive solver.

## Reproduce

From repository root, run the Python file with --target control --scope prefix --prefix 200 --timeout 30000. For original inputs use --target p0 --scope prefix or --target p54 --scope zero-free. Every SAT witness is checked by exact forward replay. A longer timeout or improved solver may give a candidate or a bounded UNSAT result; neither establishes authentic plaintext absent an independent source/heldout test.

Do not reinterpret the timeouts as all-permutation rejection. The nonlinear family lacks a first-party map/selector; avoid extending it solely to accumulate more speculative variants. The keyless equivalence formulation below improves the constructive control and resolves one restricted original vocabulary gate; the unrestricted original remains unresolved.

## Agent45 keyless bit-vector equivalence solver (24 November, independent continuation)

The earlier one-hot model branches over a 28-by-29 permutation table. On a completely ciphertext-F-free interval the historical plaintext-F hold rule implies every plaintext rune consumes (and none is F). For q=8 define S_i=(C_i-P_i) mod29 for i>=8. There exists an arbitrary feedback permutation f with f(P_(i-8))=S_i **if and only if**, for every pair of such positions i,j,

    (P_(i-8) = P_(j-8)) iff (S_i = S_j).

Necessity is injectivity and determinism. Sufficiency follows by defining f on each observed input class from its unique output, then bijectively matching unused inputs and outputs. The initial q shifts are recovered freely from C_i-P_i. This removes all secret map variables from the solver rather than restricting the secret permutation. Pack each intact dictionary spelling into 5-bit GP29 symbols; constrain each original word to the exact disjunction of its packed candidates. Explicit map mode is retained as a comparison. Every SAT witness is reconstructed and forward-replayed; no claim of uniqueness is made.

### Actual local Linux Z3 results

Canonical source fixture copied from the GitHub corpus/transcription: p54–55 308 runes; longest complete-word zero-free interval begins at offset70, length123, 28 words. Dictionary uses TextBlob 29,157 source spellings with all supported GP variants and native types from the genuine jpg107-167 (KOAN) and p57 controls; retain only F-free spellings. Frequency >=100 leaves 1,394 types; >=30 leaves 4,217; unrestricted leaves 35,078. The native control's own vocabulary is explicitly included, so this is a key-blind, vocabulary-assisted recovery, not a target-excluded language test.

| Input / model | Vocabulary | Solver tactic / limit | Actual outcome |
| --- | --- | --- | --- |
| Native contiguous 254-rune KOAN plant, known map | >=100 | bit-blast SAT, 10s | 254/254 correct, exact replay |
| Same plant, explicit unknown map | >=100 | bit-blast SAT, 20s | timeout |
| Same plant, keyless all-pair constraints | >=100 | default, 35s | SAT in 7.930s; **254/254 plaintext**, exact primer, **23/23 observed map entries** and replay |
| Same plant, keyless | >=100 | bit-blast SAT, 20s | timeout |
| Original 123-rune interval, explicit unknown map | >=100 | bit-blast SAT, 20s | timeout |
| Original 123-rune interval, keyless | >=100 | bit-blast SAT, 20s | **UNSAT in 19.901s**, all 29! permutations under this lexicon |
| Original 123-rune interval, keyless | >=100 | default, 25s | timeout |
| Original 123-rune interval, keyless | >=30 | bit-blast SAT, 18s | timeout |
| Original 123-rune interval, keyless, BDD dictionary prototype | unrestricted | bit-blast SAT, 20s | timeout |
| Native 212- and 231-rune training prefixes, keyless | >=100 | default, 25s/18s | both timeout; no held-out recovery |

The deterministic plant uses Python Random(3301), the sixth sampled permutation/primer with a zero-free emitted tape. It contains 70 complete source words. The keyless solver recovered primer [22,8,3,17,24,8,25,14]; six unexercised permutation entries are arbitrary completions. The recovered partial map does not establish a historical cipher. The original UNSAT is strictly limited to the 1,394-type intact-word vocabulary and the q8 stationary permutation/F-hold zero-free interval; it says at least one original word must be OOV if this model is correct. The wider lexical model remains unresolved. The unrestricted packed attempt was interrupted before a solver status; do not count it as UNSAT. The BDD prototype enlarged the emitted formula and is not a demonstrated improvement. Exact arbitrary nonzero-GP escapes for at most one or three of the 28 words also timed out at 20s, so no minimum-OOV count beyond at least one is established. The installed local TextBlob source word-frequency list has the canonical FNV-1a fingerprint 3351310445.

[Canonical-input reproducer](../sims/lp2_plaintext_autokey_q8_keyless_pair_bv.py), commit 3ae46550f8117ad51c90ae582f0cac0769cb4aca. The local execution used an exact copied terminal/KOAN/p57 fixture and installed TextBlob vocabulary; the repository version reuses the existing canonical loader and checks vocabulary sizes. No remote CI execution or independent UNSAT certificate is claimed. Suggested reproducible invocations from repository root:

    python sims/lp2_plaintext_autokey_q8_keyless_pair_bv.py --target control --model pair --mode default --freq 100 --timeout 35000
    python sims/lp2_plaintext_autokey_q8_keyless_pair_bv.py --target original --model pair --mode sat --freq 100 --timeout 120000

Use the result to improve the exact original inverse only if a more complete vocabulary or source-selected crib makes this nonlinear feedback architecture plausible. Do not promote a dictionary-assisted plant or a small-vocabulary negative to authentic LP2 plaintext.

## Exact direct source-crib screen (Agent45)

A separate constructive route uses the same partial-bijection equivalence to test contiguous known native plaintext against original ciphertext, with no dictionary or key enumeration. For every starting alignment, allow arbitrary initial eight shifts and extend until the feedback map conflicts, either side ends, or a zero/F is encountered. All nine native solved sections from the canonical resource are donors. Original target scan is continuous across pages; this does not assume that actual cipher state continues across boundaries, since each alignment gets fresh initial shifts.

- Terminal p54–55 zero-free 123-rune interval: maximum consistent crib 23 runes; zero matches of length >=32. 32 deterministic frequency-preserving terminal shuffles yielded maximum lengths 22–24 (mean 22.6875). No above-null alignment.
- Full original p0–55, 12,956 runes: 23,571,636 candidate start pairs, maximum consistent crib 24 runes, zero matches >=32. The maximum is a coincidental internal fragment of solved wisdom, not an inferred plaintext.
- Positive plant: 123 F-free native runes from jpg107-167 offset59, primer [0..7], map f(x)=(11x+7) mod29. Recovered a full 123-rune match (all-consuming control permits ciphertext F).

These are exact finite screens for a repeated native contiguous F-free crib under this cipher. They neither exclude unknown plaintext nor establish a selector. [Reproducer](../sims/lp2_q8_permutation_native_crib_scan.cjs), commit 943198855ccaaef249dbf275a1e8cd9c406eceb9; actual calculations executed in V8 on the canonical GitHub resource before persisting the script.

## Canonical repository execution

[Manual CI run 45388587042](https://github.com/FlareZ123/liber-primus/actions/runs/45388587042), completed successfully on 24 November, Python 3.12.16 / Z3 4.13.3.0. This executes the committed canonical parser rather than a copied fixture. Hidden-map control SAT in 7.26s: 254/254, 23/23 observed map entries, exact replay. Original restricted 1,394-type model UNSAT in 18.804s. Original unrestricted 35,078-type model (72,113 word-domain candidates, 6,552,796 SMT characters) returned UNKNOWN in 181.084s, reason canceled at timeout. No unrestricted exclusion. This supersedes the earlier lack of remote execution; it is still not an independent proof certificate or held-out validation.
