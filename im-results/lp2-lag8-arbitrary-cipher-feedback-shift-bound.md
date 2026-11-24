# Lag-eight arbitrary feedback shifts: exact native-frequency obstruction

Agent50, 2026-11-24. Generalization of the [additive ciphertext-autokey feasibility gate](lp2-ciphertext-autokey-lag8-fhold-exact-gate.md).

## Family

Let pi be an arbitrary **single shared** permutation of GP29 fixing 0, let g be an arbitrary shared function from GP29 to GP29, and allow eight arbitrary initial shift values independently at each physical page. Plaintext F emits c=0 and consumes no queue entry. Every other plaintext symbol emits c=pi(p)+shift mod29 and consumes one queue entry; after the initial eight consuming symbols, shift=g(oldest consuming ciphertext), and the queue receives the current ciphertext. This covers every shared affine feedback and arbitrary nonlinear unary shift function, with arbitrary nonzero plaintext alphabet substitution. It does not cover arbitrary state-dependent permutations of the nonzero plaintext alphabet.

## Original structural deduction

Within an original physical page, nine consecutive nonzero ciphertext symbols are necessarily nine consuming symbols, regardless of earlier F choices and arbitrary primer. The ninth c therefore cannot equal g(first c), since this would imply pi(p)=0 and forbidden consuming F.

The original 55 nonempty unsolved physical pages contain 9,020 such windows. All 784 ordered pairs (x,y) with x,y in 1..28 occur, including every diagonal. Thus g(x) cannot equal any nonzero y for any nonzero x. **g(x)=0 for every x!=0**. The script prints an explicit physical page and local index witness for every pair. This is exact; no probabilistic model, text scoring, or key search.

## Residual capacity

Once the primer is consumed, a nonzero queue value cannot produce a consuming zero ciphertext: g(x)=0 and pi(p)!=0. A zero queue value can propagate by a consuming zero, or be destroyed by a consuming nonzero, but cannot create a second zero. There are at most eight zero queue entries at primer exhaustion. Therefore at most eight later nonzero ciphertexts per page can differ from the fixed substitution inverse pi^-1(c); at most eight more nonzero ciphertexts may differ during primer consumption. We conservatively allow all 458 ciphertext zeros and all 16*55=880 exceptional nonzero outputs to contribute freely to any target set of plaintext symbols.

The maximum number of occurrences of any k plaintext symbols is consequently bounded by sum of the k largest original nonzero ciphertext symbol counts + 458 + 880. This holds even with independent arbitrary page primers and arbitrary F choices. For a continuous clock or chapter resets there are fewer primer exceptions.

| k | Original plaintext maximum share | Minimum over nine solved native GP records |
|---:|---:|---:|
| 3 | 21.4804% | 26.1146% |
| 5 | 28.6585% | 41.3592% |
| 8 | 39.2791% | 57.9618% |
| 10 | 46.2952% | 68.1529% |

The nine controls are the preserved relikd solved rune records; the smallest top-five share is 41.3592% on the 515-rune welcome section. This is a deterministic upper bound for the modeled unknown plaintext, not a theorem that all conceivable English texts have the same frequency distribution. The comparison excludes a whole-book plaintext with native control-like concentration under this shared pi/g family, even after permitting page-specific arbitrary primers. It does not exclude changing pi or g between chapters, feedback involving multiple queue entries, different lag or reset policies, or a secondary cipher layer.

## Reproduce

`node sims/lp2-lag8-arbitrary-cipher-feedback-shift-bound.js`

Inputs: canonical physical LP2 corpus and preserved nine native GP control records. Output: all pair witness coordinates, counts, concentration bounds, and control shares. Executed successfully in connected JS against current repository resources. No unknown plaintext claimed.
