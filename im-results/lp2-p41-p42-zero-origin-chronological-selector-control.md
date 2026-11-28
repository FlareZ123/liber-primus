# P41/p42 chronological selector control favors the zero-origin signed register

**Agent5, 28 November 2026. Classification: chronological post-gate structural consistency test. No unknown LP2 plaintext, key, or general word-index rule recovered.**

## Decision

Issue #3354 closed the 2016 signed-word origin gate at **2026-11-28 07:40:06Z**: no first-party source fixed zero-based textual indexing, so DIRECTION29 and dependent page/navigation reads remained conditional.

Two later receiver results were committed after that gate:

- p41 VERIFY structural receiver: `bb414a6b574faf5e806e79aebd29776e601915af`, 08:50:41Z;
- p42 OPENPGP structural selector: `3f394505b4d6f066390e472c24a88fc741f88b39`, 08:52:47Z.

They were not evidence available to the original #3354 decision. This report asks one bounded question: **do their target-blind receiver predicates survive the concrete one-based direct-page rival?**

## Frozen rivals

Let authenticated source word have zero index `i` and human ordinal `i+1`.

- Zero-origin direct-number route: page `p_i`, local canonical ordinal `i+1`.
- One-based direct-number rival: page `p_(i+1)`, local canonical ordinal `i+1`.

The local ordinal is held fixed because both rivals refer to the same human source-word ordinal; only the page number changes with the source-register origin.

No target rune values are used in the selector test. Source GP lengths are allowed because they are authenticated properties of the signed source.

## VERIFY

Authenticated VERIFY is index41 / ordinal42 and has six GP runes.

Zero-origin selects p41 ordinal42:

```text
[27,12,5,0,17,13,19]
```

It has seven runes with center `F=0`; removing that checked marker leaves six runes, exactly the source length. This is the target-blind receiver predicate published by the later p41 report.

The one-based rival selects p42 ordinal42:

```text
[11,13,11]
```

It has only three runes and center13. It fails the receiver shape before any key or plaintext comparison.

## OPENPGP

Authenticated OPENPGP is index42 / ordinal43 and has seven GP runes.

Zero-origin selects p42 ordinal43:

```text
[16,0,14]
Hpair = [16-14,16+14,0] mod29
      = [2,1,0]
      = [K,1,F].
```

This exact `[K,1,F]` Hpair occurs once among all canonical complete three-rune words. Advancing `K=2` local words reaches ordinal45:

```text
[10,0,14,1,3,26,8,2]
```

whose rune1 is `F=0`; removing that checked marker leaves seven runes, exactly the source length. This reproduces the later p42 target-blind selector without using OPENPGP rune values.

The one-based rival selects p43 ordinal43:

```text
[22,17,8]
Hpair = [14,1,17].
```

It fails `[K,1,F]`; its ordinal45 is only three runes. No target comparison is reached.

## Result

```text
zero-origin structural predicates: 2 / 2
one-based structural predicates:  0 / 2
```

This is a genuine finite rival separation and is chronological post-gate evidence. It is **not** a clean prospective holdout: the p41/p42 investigations themselves followed the zero-origin numbered route, so the receiver predicates were discovered on the zero-origin pages. No p-value is assigned, and the result is not allowed to authenticate a universal zero-index convention.

Together with the independent signed-byte hard-wrap alignment at source indices19→20, the evidence now has two qualitatively different zero-origin preferences:

1. source formatting aligns the p50 direct-rank→distance switch only under zero origin, but ordinary ~60-column wrapping is a strong rival;
2. later ciphertext-side receiver structures pass on zero-origin p41/p42 and fail the exact one-based shifted pages, but route-conditioned discovery is a strong postselection caveat.

The correct update is therefore: **zero origin is the leading working interpretation, while DIRECTION29→p29 and every unknown-plaintext claim remain conditional pending a first-party origin rule or a genuinely origin-blind prospective receiver.**

## Reproduction

Run:

```text
node sims/lp2_p41_p42_zero_origin_selector_control_sft.cjs
```

The SFT reads only committed source/cipher resources, reconstructs canonical page-local words, parses the authenticated source labels/GP lengths, executes both origin branches, asserts the global `[K,1,F]` selector census, and stops before any VERIFY/OPENPGP rune-value decryption.
