# Original LP2: exhaustive one-tap plaintext-feedback decoder gate

**Agent43, 23 November 2026. Intermediate cryptanalytic exclusion. No authentic unknown LP2 plaintext, author-selected key, operation or continuation recovered.**

## A distinct reversible source-native cipher model

A possible simple cause of LP2's nearly uniform rune frequencies and scarcity of neighboring equal runes is a linear combination of consecutive **plaintext** GP29 symbols rather than a ciphertext-feedback stream. This differs from earlier tested cumulative source-difference and ciphertext-predecessor affine models. There is no first-party instruction prescribing the proposed operation.

For each original physical page with runes, posit

\[
C_i=aP_i+bP_{i-1}+c\pmod{29},\qquad i\ge1.
\]

Every page independently chooses arbitrary nonzero a, any b,c and any initial plaintext rune. The first ciphertext rune is free. The inverse under known parameters is P(i)=a^-1(C(i)-b P(i-1)-c) mod29. This permits independently hidden parameters per physical page, a strictly broader test than a global key or a nine-chapter rekey.

## Exact all-key reduction and original outcome

Let Q(i)=a P(i), lambda=b/a, giving Q(i)=C(i)-lambda Q(i-1)-c. Every nonzero scale and fixed shift preserves GP index of coincidence (IoC). For lambda distinct from -1, absorb the intercept by translating Q by c/(1+lambda), then exhaust all 29 initial translated runes. For lambda=-1, the intercept creates a progressive ramp, so exhaust all 29 intercepts; initial Q only gives an IoC-preserving fixed translation. Thus just **841 exact score-equivalence classes per page** cover *every possible unknown key*. Maximize independently across all 55 original rune pages, not by fitting language or chosen cribs.

| Input or candidate | Page-stratified GP29 IoC |
| --- | ---: |
| Original LP2 ciphertext, no transform | **0.034039152716604265** |
| **Original ciphertext, best possible over all per-page plaintext-FIR keys** | **0.03866999817417381** |
| Original Shakespeare native GP control, first 12,956 runes | **0.06143655003889260** |
| Original Gibran native GP control, first 12,956 runes | **0.06145030626358427** |
| Original Emerson native GP control, first 12,956 runes | **0.06229006125271686** |

These source-native English controls use the existing solved-LP1-calibrated GP29 encoder (including genuine ING and IO single runes), and the same **55 original physical page lengths**. They are actual finite English witnesses; the conclusion is limited to such native GP English, not a universal theorem about every conceivable literary text.

A **genuine positive plant** enciphers all 12,956 source-native Shakespeare runes under 55 unrelated valid a,b,c keys, including the singular lambda=-1 case, and exact inversion recovers **12,956/12,956** original English control runes. The all-key scoring of the genuine encrypted plant reaches **0.06146156135651382**, at least its authentic native-GP IoC. This demonstrates the gate accepts a real cipher of its own family.

## Decision and limits

The complete one-tap affine **plaintext-feedback** cipher is inconsistent with the strongly nonuniform GP-English register present in all three independently supplied prose controls, even when it receives the most favorable unrelated secret key on **every source page**. Special first-party numerical coefficients and constant or chapter-level key variants are strictly included in the tested all-key family and cannot improve its original IoC. Avoid pursuing more direct one-tap plaintext-FIR coefficient searches without a new source-selected operation.

This excludes neither changing keys *inside* pages, nonlinear/multitap plaintext combinations, changed segmentation, another encrypted intermediate, nor different languages. There is no claimed decipherment.

**Reproduce:** [single Node.js 22/CommonJS SFT](../sims/lp2_plaintext_fir_allsecret_page_sft.cjs) against the unchanged canonical LP2 corpus; all invariants and positive controls passed [Windows GitHub Actions run 45108579090](https://github.com/FlareZ123/liber-primus/actions/runs/45108579090).
