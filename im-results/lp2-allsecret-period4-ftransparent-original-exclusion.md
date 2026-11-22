# Every secret GP29 additive key of period ≤4 is incompatible with original LP2, except identity

**Agent29, 14 November 2026. Exact finite original-input cipher-family theorem.** This strengthens the source-crib exclusions for candidate signed headings and specific p15 prime-derived keys. It does **not** decrypt a single unknown rune. It proves a source-independent limitation under the *actual* solved Cicada plaintext-F pass-through convention, with complete four-rune key enumeration and positive original-native controls.

## Model and evidence

The authentic solved LP1 WELCOME/DIVINITY and LP2 p56 ciphers use additive GP29 encryption with **plaintext F/index0 copied unchanged and consuming no keystream symbol**. Ordinary non-F plaintext consumes one key value and can itself encrypt to ciphertext F. Under a proposed fixed periodic GP29 key `K[consumed mod L]`, an original ciphertext rune `c` permits only:

- If `c=F=0`, emit plaintext F and leave the key clock unchanged.
- Optionally consume a key value if `(c−K[clock]) mod29 ≠0`; this emits non-F plaintext and advances the clock.

There is no arbitrary F mask, fitted English, guessed key value, or optimally selected page cutoff. For a fixed key, exact reachability of the finite set of consumed-clock states decides whether that ciphertext *could possibly* have been emitted by the genuine encoder. A zero-shift key always survives because it is the identity plaintext=C; any exclusion concerns **nonzero** keys.

Enumerate **all** 29^L keys for each L=1,2,3,4, including all phases as distinct key arrays. First run the original source-visible opening chapter p0–2, exactly 729 original runes. Continue only its surviving keys against (i) all **12,956** unchanged unknown ciphertext runes in physical page order and (ii) all **nine** image-defined visual chapters, granting a new **consumed-clock reset to zero** at each chapter boundary but retaining the **same key**. The nine fixed original chapter lengths are `[729,1145,1729,1903,1021,1433,1680,3008,308]`. The runeless original p50 contributes no symbols.

| Period L | All secret keys | Survive opening 729 | Survive whole 12,956, continuous clock | Survive all nine chapter resets |
| ---: | ---: | ---: | ---: | ---: |
| 1 | **29** | 1 | **1** | **1** |
| 2 | **841** | 1 | **1** | **1** |
| 3 | **24,389** | 3 | **1** | **1** |
| 4 | **707,281** | 184 | **1** | **1** |
| **Total** | **732,540** | 189 | **4** | **4** |

In every complete original-book column, the **only surviving key is all zeros**. The two nonzero period3 keys surviving the opening are `[0,3,0]` and `[0,0,3]`; they both fail later in the original book, at full-stream rune index964, and independently fail original p54–55 with a clock reset. The 183 nonzero period4 opening survivors likewise all fail some later complete-book or source-visible chapter test under the fixed convention.

The [source-fixed CommonJS reproducer](../sims/lp2_allsecret_period4_ftransparent_exact_sft.cjs) establishes these results with exact binary reachability, not a language likelihood score. It independently encrypts **four 570-rune planted native-GP sequences**, built only from the genuine solved p57 source, using a nonzero secret key of each period1–4. Every planted ciphertext passes the exact same all-clock inverse, so the test does not reject correctly generated native ciphertext merely because its key is nonzero. The original-source and four controls passed on [Windows Node22 CI run 43593522348](https://github.com/FlareZ123/liber-primus/actions/runs/43593522348).

## Research implication and limitation

**No nontrivial repeating GP29 additive key with true plaintext-F bypass and period 1, 2, 3 or 4 can generate the original 12,956-rune LP2 ciphertext** under either a single continuous book clock or source-chapter clock resets with fixed key orientation. This eliminates these entire all-secret families without knowing any plaintext word. The residual zero key gives original near-uniform ciphertext unchanged, with no readable text or solution.

A model allowing **a separately chosen secret key or independently selected phase on every chapter**, non-additive state evolution, a period at least5, a nonlinear cipher, an alternative handling of F, or arbitrary source-derived preprocessing lies **outside** the proved finite family. Although the period3 source `[3,26,24]` is independently visible in authentic 2013 BASE29(3301) and was already excluded under its own period3 native test, the present theorem covers every possible period3 key, not just that one. Do not infer any historical usage of this cipher family or claim the full LP2 puzzle is solved.
