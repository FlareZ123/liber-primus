# Frozen zero-F + lag-256 self-difference gate

**18 November 2026, Agent8, Director issue #1516. Classification: complete negative for the exact keyless global lag-256 family.**

## Frozen hypothesis

Issue #1516 tests one operation beneath the already frozen #1422 zero-F sparse surface inverse. Let `C` be the original continuous p0-p55 rune stream and `M` the exact #1422 inverse:

```text
M = zeroFDecrypt(C)
P[i] = M[i] - M[i-256] mod 29, i >= 256
```

The first 256 runes are deliberately undecoded. The test has no secret parameter and does not scan the sign, phase, page/chapter reset, lag multiple, table transform or start offset.

## Exact source-shaped positive control

The reproducer builds a 12,956-rune native-GP plant preserving every original printed word length. It selects a deterministic native word of each required length, seeds the first 256 intermediate symbols, and applies the exact forward recurrence

```text
M[i] = P[i] + M[i-256] mod29
```

before the unchanged #1422 zero-F outer transform.

The inverse recovers every planted plaintext rune after the 256-symbol seed. Rebuilding the intermediate from the recovered plaintext is exact, and the outer transform reproduces the planted ciphertext exactly. This establishes implementation feasibility for the entire frozen composite.

## Original result

The same one-shot inverse on the untouched original reconstructs the #1422 intermediate and original ciphertext exactly, but the 12,700 decoded runes are nonlinguistic under the same source-native register used elsewhere in the repository:

| diagnostic | result |
| --- | ---: |
| decoded runes after fixed seed | 12,700 |
| #1422 intermediate IoC | 0.034556243505167686 |
| lag-256 decoded IoC | 0.03447556475709849 |
| complete printed words wholly after rune256 | 2,839 |
| exact native-dictionary hits | 205 |
| exact dictionary hits of GP length >=5 | **0** |
| longest consecutive dictionary-word run | **2** |

Representative prospectively named physical-page prefixes are likewise nonprose:

- p1: `YIRELDBTHMUMLTFNGTEOGCGEAIENCDAETHXOEAETEOTHEAPEOYODBETHHUOEDTHEOF...`
- p27: `LEEAJNGJTJNEOLJEJETURXEOAPEASJBBUGUHOEEOMYNGNGSSJEOIYIRFBOEOTHHDRR...`
- p40: `PHCEJLAELAEEOHENGPRNONMMCFHXBLAEBBOEOSANGRAEMUHWOECCCCWNEBLWUCTH...`
- p54: `OEOEOYEAECEOOTURJSXAEBMNRRJOAEBMRLIAREAMCTHTHREOTHXHTHLTIAYEONGCG...`
- p55: `YXJGOTHDOIAEOGGJEOLBRNGUFFOLHRIOETNGEALOEDYEAIAXTODYOETEOOXJPIFU...`

No 150-rune coherent interval exists, and the same fixed rule does not produce coherence in any second region. The frozen success criterion therefore fails before any downstream interpretation.

## Decision

The exact global phase-zero lag-256 self-difference beneath the #1422 intermediate is **closed negative**. Its source motivation remains real, because p50 supplies a 256-cell object and the current p50 association favors the unshifted global clock, but that clock does not become plaintext through this keyless one-block recurrence.

Do not rescue this result with the opposite sign, shifted phase, page/chapter resets, lag multiples or another outer transform. Those are outside #1516 and would erase the decisive value of the keyless test.

Reproducer: [`sims/lp2_p50_zeroF_lag256_selfdifference_sft.cjs`](../sims/lp2_p50_zeroF_lag256_selfdifference_sft.cjs)

Windows Node22 CI: [run 44389461722](https://github.com/FlareZ123/liber-primus/actions/runs/44389461722)
