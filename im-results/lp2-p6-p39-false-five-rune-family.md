# P6 master packet supplies the exact p39 FALSE five-rune key shell

**Agent16, 19 November 2026. Classification: strong local plaintext candidate; key-role grammar discovered after target, with a prospective familywise uniqueness census.**

## Upstream receiver chronology

Director #1784 prospectively fixed p39 offsets132..136 as the first complete `g=5` word after p39's sole red span. Selection used authenticated zero-based word39 `FALSE` and the p39 red-X route before those rune values were opened. The receiver is `[19,7,10,17,23]`. The p38 geometry-shell transfer was frozen in advance and failed, producing a different output. This result leaves that negative intact.

## Exact p6-derived shell

Authenticated `FALSE=[0,24,20,15,18]`. Under subtraction the unchanged receiver requires key `[19,12,19,2,5]`. Canonical outside-in H5 gives:

```text
H5(key) = [14,24,10,14,19]
        = [-b,-g,K*g,-b,B].
```

The established p6 title packet exposes the needed atoms independently:

```text
W1 = [-g,K-b,-b,K+b] = [24,16,14,17]
W2 = [B]               = [19]
H(title lengths)       = [K,-e,g,a] = [2,26,5,6].
```

The exact role order was recognized after FALSE was known, so this equality alone is not a blind validation.

## Frozen family

Precommit: `workplace/agent16-p6-p39-false-five-rune-family-precommit.md`, commit `abd7187e688355650676a4e1e1c9c004221f1fab`.

For H5 shell `[d0,s0,d1,s1,c]`, freeze:

- `c=B`, matching p6's singleton W2 to H5's unpaired center;
- repeated `x` from any of the four W1 fields;
- second atom `y` independently from any W1 field;
- `z=u*v mod29` for every ordered pair of the four title-H fields, repeats allowed;
- repeated `x` in any two of the first four slots;
- `y,z` in either order in the remaining slots;
- both additive signs.

This is `4*4*16*6*2*2 = 6,144` labeled shell/sign forms. Algebraic collisions reduce them to 1,555 unique shells.

## Complete census

Use all seven distinct authenticated five-rune 2016 targets: `HELLO, EMPTY, SEEKS, LIBER, WORDS, FOUND, FALSE`.

Under the exact page-local parser used by #1784 there are 318 five-rune unknown-page words. The complete family gives:

```text
labeled forms:      6144
unique shells:      1555
labeled hits:       2
unique hits:        1

sole unique hit:
p39 ordinal30 start132
target FALSE
sign subtraction
shell [14,24,10,14,19]
key   [19,12,19,2,5]
```

The two labeled hits are the same shell because `K*g` and `g*K` are distinct ordered product labels with identical value. A stricter canonical parser that preserves cross-page word continuation has 311 five-rune words and gives the same one unique hit.

Exact replay:

```text
[19,7,10,17,23]
-[19,12,19,2,5]
=[0,24,20,15,18]
=FALSE mod29.
```

## Interpretation

This materially upgrades the already source-selected p39 FALSE receiver. The p6 packet now explains local key shells at four, five, and six runes, plus the later p37 LUCK four-rune follow-on.

The boundary remains important: the p39 role grammar was discovered after the FALSE target was available. The familywise census shows that the discovered grammar is highly selective under the frozen p6-derived class, but it does not make the class prospectively reusable by itself. A fresh receiver and target must be fixed before ciphertext inspection to test transfer.

Do not alter the failed #1784 p38 geometry decoder or claim that its transfer succeeded.

## Reproduction

`node sims/lp2_p6_p39_false_five_rune_family_sft.cjs`