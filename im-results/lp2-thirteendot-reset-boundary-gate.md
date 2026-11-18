# Authentic thirteen-dot marks do not behave as transferable cipher-state resets

**Director task:** #1505  
**Classification:** negative reset-boundary architecture result. The marks remain authentic visual/structural punctuation; no plaintext or key is recovered.

This test uses the original-image-adjudicated unknown-prefix thirteen-dot inventory and only pre-existing ciphertext statistics. It does not fit a mark-local substitution, choose marker subsets, or introduce per-span secret parameters.

## Source scope

Unknown LP2 p0-p55 contains:

- **28** printed thirteen-dot events;
- **26** unique rune offsets because two pairs are coincident;
- **24** unique logical boundaries with a full 64-rune window on both sides;
- **2,702** eligible ordinary literal-hyphen word boundaries used as controls.

Controls are matched by the nine established visual chapters. Line wraps and page continuation markers are not treated as word boundaries.

## Local ciphertext regime change

At every eligible boundary, measure three frozen before/after changes over 64 runes per side:

1. absolute change in adjacent-equality rate;
2. absolute change in lag-five return rate;
3. Jensen-Shannon divergence of the 29-way predecessor-difference distribution.

Ten thousand deterministic matched samples select one ordinary hyphen boundary from the same visual chapter for every authentic marker.

| statistic | 13-dot mean | matched-control mean | upper-tail |
| --- | ---: | ---: | ---: |
| adjacent-equality change | **0.0112434** | 0.0089818 | **0.15828** |
| lag-five change | **0.0225989** | 0.0253633 | **0.76282** |
| transition-difference JS | **0.1460425** | 0.1332142 | **0.03880** |

The one nominally low tail is the broad transition-distribution divergence. It is not accompanied by the two repeat statistics that motivated reset-state work.

Chapter transfer is also mixed across the eight chapters containing an eligible marker:

- adjacent change above same-chapter ordinary-boundary mean: **6/8**;
- lag-five change: **3/8**;
- transition JS: **5/8**.

Thus the markers can coincide with some visible/ciphertext structural changes, which is unsurprising for section punctuation, but they do not define a consistent multi-statistic regime boundary.

## Direct state-reset discriminator using the validated p50 clock

The independently established p50 low-value repeat association gives a source-fixed finite-state prediction. This supplies a sharper reset test than inventing a new cipher: keep the exact 256-cell low-value mask and compare only where phase zero restarts.

| clock schedule | selected repeats / opportunities | outside repeats / opportunities | odds ratio | Fisher upper tail |
| --- | ---: | ---: | ---: | ---: |
| **continuous global phase0** | **33 / 3025** | **53 / 9876** | **2.0555** | **0.001349** |
| reset at every unique 13-dot boundary | 23 / 2975 | 63 / 9926 | 1.2363 | 0.24282 |
| reset at every physical page | 19 / 2934 | 67 / 9967 | 0.9810 | 0.59919 |
| reset at each visual chapter | 20 / 3020 | 66 / 9881 | 1.0084 | 0.55538 |

Resetting the table clock at the authentic thirteen-dot marks destroys most of the transferable signal. The continuous stream is strongly favored on the same untouched ciphertext observable.

This directly complements #1577, which found the continuous p50 association recurring across consecutive 256-rune cycles with no cycle heterogeneity. The two results are mutually consistent: the live state behaves like a manuscript-spanning clock, while the large punctuation does not restart it.

## Decision

**Negative for #1505's cipher-reset premise.** The authentic thirteen-dot marks should not be prioritized as generic cryptographic reset points:

- the two repeat-based local regime statistics are ordinary relative to same-chapter word boundaries;
- the one marginal transition-divergence result is not broadly transferable;
- imposing thirteen-dot resets on the strongest current finite-state structural clue degrades its odds ratio from ~2.06 to ~1.24 and removes significance.

The marks may still delimit semantic, typographic, navigation, or illustration-linked units. A future cipher may consume punctuation in some other explicitly sourced way. What is retired is the generic assumption that the thirteen-dot stencil means **restart cipher state here**.

This also reinforces the earlier all-secret exclusion in `lp2-13dot-mark-local-predecessor-allsecret-gate.md`: that report rejected a large stationary mark-local substitution family; the present test independently rejects the broader reset-boundary interpretation on ciphertext structure.

## Reproduction

- `sims/lp2_thirteendot_reset_boundary_sft.cjs`
- `.github/workflows/agent5-thirteendot-reset-manual.yml`
- CI PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44396116739
- source inventory: `resources/liber-primus/lp2-punctuation-identity.json`
