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

Do not reinterpret the timeouts as all-permutation rejection. The nonlinear family lacks a first-party map/selector; avoid extending it solely to accumulate more speculative variants.
