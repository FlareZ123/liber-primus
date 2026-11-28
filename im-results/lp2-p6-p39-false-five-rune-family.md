# P6 master packet supplies the exact p39 FALSE five-rune key shell

**Agent16, 19 November 2026; direct warning-field key added by Agent22, 28 November. Classification: strong local plaintext candidate; receiver was prospectively fixed and the exact key now has independent p6-shell and authenticated-warning-field routes, though both key grammars were recognized after target.**

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

## Direct authenticated warning-carrier key

The authenticated warning carrier now supplies the exact five-rune key directly, without first passing through the p6 H5 shell. The source-only carrier fields include:

```text
PATHS.Hsum   = 19 = B
BEWARE.len   =  6 = a
BEWARE.Hdiff =  2 = K
FALSE.len    =  5 = g
```

Serialize them as

```text
[x, y*z, x, z, w]
=
[PATHS.Hsum,
 BEWARE.len * BEWARE.Hdiff,
 PATHS.Hsum,
 BEWARE.Hdiff,
 FALSE.len]
=
[19,12,19,2,5]
=
[B,aK,B,K,g].
```

This is exactly the already frozen p39 subtraction key, and the prospectively selected receiver replays to FALSE.

Charge the serialization broadly rather than holding those roles fixed. Let `x` and `w` be any of the 20 `{warning word} × {first,len,Hdiff,Hsum}` carrier atoms. Let `y` and `z` be any two distinct carrier fields from the same warning word, in order. This gives **24,000 labeled forms**, collapsing to **13,056 distinct numeric keys**. Test both additive signs against all seven authenticated five-rune targets on the already prospectively fixed p39 receiver.

There is exactly **one numeric authenticated-target hit**:

```text
key [19,12,19,2,5]
subtraction -> FALSE.
```

The successful key has two labeled aliases only because the final value5 can be read either as `FALSE.length` or `VERIFY.Hdiff`; they are the same numeric operation. The target-literal FALSE.length reading is the simpler source interpretation.

The `[x,y*z,x,z,w]` grammar was recognized after the FALSE key was known, so this is retrospective mechanism identification rather than a blind key discovery. Nevertheless it removes the earlier p6 role-shell dependency from the exact numeric key and survives a broad familywise authenticated-target charge.

Reproducer: `sims/lp2_signed_warning_initial_p6_crosslink_sft.cjs`.

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

## Prospective transfer gate: WORDS16 fails

A fresh transfer was selected after this family was frozen. Under the established one-based numbered diagonal, charge every authenticated source occurrence with five GP runes and inspect only the numbered receiver lengths. WORDS16 is the sole length-compatible case: physical page16 / project p15 / canonical word16 / start71 has length5. The other six candidates have receiver lengths 8,2,6,11,2,3.

Precommit `workplace/agent16-p6-five-rune-numbered-words16-holdout.md` froze that receiver, target WORDS, and the unchanged 6,144-form family before opening its runes. The revealed receiver is `[10,13,8,27,17]`. The family has **0** mappings to `WORDS=[7,3,4,23,15]` and **0** mappings to any of the seven authenticated five-rune targets at that receiver.

This is a prospective negative. It blocks promotion of the p39 role grammar to a reusable five-rune decoder. Do not tune the family or neighboring p15 words after this miss.
## Exact-key matched-red-span transfer: p3 fails

A second prospective transfer removes the p6 role-family freedom entirely. Existing source work links p39 to p3 as the only other page with a three-rune red span at offset119. Before opening p3 receiver values, page-local word boundaries showed the same receiver geometry on both pages: the first five-rune word after red offsets119..121 is offsets132..136.

Precommit `workplace/agent16-p39-key-p3-matched-redspan-precommit.md` (commit `2a52cc2d554b8241655b3e703aca3ab05aa1a9e3`) froze the exact p39 key `[19,12,19,2,5]`, subtraction sign, p3 offsets132..136, and the seven authenticated five-rune recognition words.

Reveal:

```text
p3 cipher  [7,19,26,2,1]
p39 key   [19,12,19,2,5]
subtract  [17,7,7,0,25]
```

The output is none of `HELLO EMPTY SEEKS LIBER WORDS FOUND FALSE`. No alternate p6 shell, sign, offset, receiver, or target was tried.

This exact-key miss independently supports the existing boundary: p39 FALSE is a local, source-selected plaintext candidate whose discovered p6 shell does not currently transfer as a reusable five-rune key.

Report: `im-results/lp2-p39-key-p3-matched-redspan-holdout.md`.
SFT: `sims/lp2_p39_key_p3_matched_redspan_holdout_sft.cjs`.
## Reproduction

`node sims/lp2_p6_p39_false_five_rune_family_sft.cjs`