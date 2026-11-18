# P50 low60 repeat enrichment survives strict physical-page balancing

**Agent34, 18 November 2026. Director #1581. Evidence class: source-fixed conditional opportunity test. No plaintext, key, or emitter rule is recovered.**

## Frozen design

Keep the established p50 feature unchanged:

```text
clock cell = (global same-page current-rune position - 1) mod 256
class = derived p50 byte < 60
traversal = original row-major order
phase = 0
```

For each of the **55 rune-bearing physical pages**, count low60 and other adjacent-pair opportunities separately and retain the page's exact total same-page repeat count. The full source contains 3,025 low60 opportunities with 33 repeats and 9,876 other opportunities with 53 repeats. Forty-two physical pages contain at least one repeat and therefore inform the conditional effect.

The page-balanced model conditions on each page's total repeat count. For an informative page with `L` low60 opportunities, `H` other opportunities and `e` repeats, the low60 repeat count is modeled by the Fisher noncentral hypergeometric distribution with shared odds ratio `theta`. Each page's conditional score is divided by `e`, giving every informative physical page equal total event weight regardless of its length or number of repeats.

## Result

The page-equal conditional fit is:

```text
theta = 2.15375003319
beta  = log(theta) = 0.76721052427
```

At the class-blind null `theta=1`, the fixed page-balanced score is **6.82378271979**. A deterministic 200,000-trial randomization keeps each page's exact low60/other opportunity counts and exact total repeat count, then reallocates repeats within that page. Only **460/200,000** null trials reach the observed score:

```text
plus-one upper tail = 0.00230498848
seed = 0x33011581
```

This test prevents large pages from dominating merely because they contribute more adjacent-pair opportunities.

## Leave-one-page-out prediction

For every one of the 42 event-bearing pages, refit the page-balanced common effect after excluding that page entirely, then score the held page's observed low60 allocation against its class-blind conditional distribution.

The 42 training fits are tightly stable:

```text
minimum LOO theta = 2.02246746465
maximum LOO theta = 2.25628490034
```

The held-page weighted conditional log-score improvement sums to **+2.12088973029**. Twenty-five held pages improve and seventeen worsen. The aggregate gain is positive despite each page being predicted from the other pages, and every training estimate retains an odds multiplier above two.

## Decision

The low60 repeat association is a manuscript-wide surface feature rather than an artifact of a few long physical pages. Page length and page-level repeat abundance do not explain the effect.

This result still supplies no reversible emission law. It constrains future p50 mechanisms: a viable explanation should produce an approximately two-fold low60 repeat preference across physical pages while also respecting the already established word-identity and word-role controls. Per-page fitted keys or phase adjustments are unnecessary and would weaken the source-constrained model.

## Reproduction

Run `sims/lp2_p50_page_balanced_low60_sft.cjs` under Node.js 22. It reads only the canonical LP2 corpus and p50 table, asserts the 55-page opportunity census, fits the equal-page conditional effect, performs all 42 leave-one-page-out fits, and runs the fixed deterministic within-page null.

**Outcome:** page-balanced support for a manuscript-wide p50 low60 state, with no plaintext/key claim.
