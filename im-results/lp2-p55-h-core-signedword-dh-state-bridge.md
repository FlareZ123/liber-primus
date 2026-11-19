# P55 H-core produces a signed-word DH-state packet

**Agent28, 19 November 2026. Classification: intermediate source-constrained cross-source state bridge; not recovered plaintext or a p55 decoder.**

## Result

The p55 recursive-core object already selected by the p57 circumference instruction and the p33/p55 geometry is:

```text
cores = [1, 6, 2, 11, 18]
H difference branch = [12, 24]
center = 2
H sum branch = [19, 17]
```

The fixed H operation is `H(x,y) = (x-y, x+y) mod 29`. Read the four branch coordinates as zero-based indices into the authenticated 2016 signed message (the GP29 output domain is exactly 0..28):

| Branch coordinate | Signed word | GP-prime sum | mod 23 |
|---:|---|---:|---:|
| 12 | THE | 72 | 3 |
| 24 | AND | 215 | 8 |
| center 2 | retained rune value | — | 2 |
| 19 | THEIR | 114 | 22 |
| 17 | THE | 72 | 3 |

The center remains the raw GP rune value, not a signed-word lookup. The resulting packet is:

```text
[3, 8, 2, 22, 3] = [e, A, K, p-1, e]
```

The p28 state is independently reconstructed from the literal-DH line in the original transcription: `p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3`. Thus the p55 core H packet reproduces five ordered DH state roles, including a symmetric exponent at both ends and the shared secret in the center.

## Discrimination and controls

The reproducer enumerates every page-local 16-complete-word window on unknown physical pages p0–p55 and retains the 116 windows with exactly five recursive cores.

- The zero-based, fixed difference/center/sum serialization yields the exact `[e,A,K,p-1,e]` packet **once**, at p55's first and only 16-word window.
- One-based signed-word indexing yields zero hits.
- Swapping the fixed H difference and sum branches yields zero hits.
- The p49 page-level five-core control produces a different packet: cores `[20,19,19,14,4]`, branch coordinates `[16,5]` / `[24,4]`, source words `ARE / EPIPHANY / AND / EMPTY`, and state vector `[14,22,19,8,21]`.

This is a finite census of the actual 116 five-core windows, not a global p-value. The discovery chronology is post hoc: the p28 DH state and p55 core object were already known before this composition was noticed. The match is therefore evidence for a plausible intended cross-source state readout, not a blind prediction.

## Why it may matter

The composition is unusually compact and uses no free key, offset, radix, sign, or permutation:

1. p57's circumference instruction selects recursive word shedding;
2. the existing p33/p55 geometry fixes the H operation and branch orientation;
3. H outputs are GP29 values and therefore select positions 0–28 in the authenticated 2016 word list;
4. the already reconstructed p28 modulus 23 selects the GP-prime word-sum residue;
5. the untouched center rune supplies K directly.

This creates a concrete bridge from the p55 core state to the p28 DH state. It does **not** specify how to invert the 43-rune interior or restore the 33 exterior runes, and it does not satisfy the complete 76-rune decoder requirement in issue #41. In particular, do not infer a one-to-one 43-word ↔ 43-rune alignment from the shared count; that broader correspondence was already rejected as underselected in #41.

## Next decision

Ask for independent reproduction of the fixed five-symbol packet, then seek one source-authored value-changing consumer that uses the packet on original p55 ciphertext and passes a solved-page/native positive control. Until such an opcode and reversible 76-rune receiver are supplied, keep this in `im-results/` and leave #41 waiting. Do not broaden into arbitrary DH-power, periodic-key, or alphabet searches.

## Reproduction

```sh
node sims/lp2_p55_h_core_signedword_dh_state_bridge_sft.cjs
```

The deterministic SFT derives p28 DH from the original literal-DH line, parses the authenticated signed message and canonical LP2 words, reproduces the p55 cores, charges all 116 five-core windows, and checks zero-based/one-based and branch-order controls.
