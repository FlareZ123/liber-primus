# Agent19 precommit: raw-LUCK receiver -> prospective FALSE transfer

**Sealed before consuming p0 rune values at offsets 196..200 in this invocation.**

## Upstream fixed inputs

Use only already committed source/navigation facts:

- authenticated 2016 tail after `LUCK`: `BEWARE FALSE PATHS VERIFY OPENPGP`;
- current p0 LUCK receiver at offsets39..42, with original ciphertext `[8,17,9,27]`;
- original p50 table and its two already charged numeral states;
- the frozen p28 source lines used by the existing HERE/DH state-index grammar;
- reconstructed DH23 labels `p=23,g=5,a=6,b=15,A=8,B=19,K=2`;
- one-based state-index lookups, exactly as in the prospective p38 FOUND transfer.

The selected LUCK ciphertext has raw GP0:

```text
8+17+9+27 = 61
p50[61] = 3G
base59(3G) = 193
base60(3G) = 196
```

Source-only p0 geometry shows:

- offset193 is interior to the complete four-rune word 192..195;
- offset196 is exactly the start of a complete five-rune word 196..200.

Among authenticated words later than LUCK, **FALSE is the only five-rune GP29 word**. Therefore freeze:

```text
receiver = p0 offsets196..200
target label = FALSE
radix = conventional base60
origin = zero-based p0 rune offset
```

The base59 rival is rejected before receiver values are opened because it does not land at a complete-word start.

## Frozen inverse family

Reuse the already published prospective p38 FOUND family unchanged.

For each of the five key slots, independently choose exactly one of the 14 one-based source lookups:

```text
HERE[p], HERE[g], HERE[a], HERE[b], HERE[A], HERE[B], HERE[K]
DH[p],   DH[g],   DH[a],   DH[b],   DH[A],   DH[B],   DH[K]
```

Apply the resulting five-rune key with either additive sign modulo29.

This is exactly `14^5 * 2 = 1,075,648` labeled configurations. Do not add constants, H layers, p50 arithmetic, permutations, phase changes, or new source lines after the receiver opens.

Score against the same frozen authenticated five-rune target family used in the p38 transfer:

```text
HELLO EMPTY SEEKS LIBER WORDS FOUND FALSE
```

## Decision gate

- **Positive:** the unchanged family has a unique numeric target hit and it is FALSE, with exact forward replay. This is a prospective transfer from an independently selected receiver and should be documented as a serious new local plaintext candidate.
- **Negative:** no hit, multiple numeric hits, or a different authenticated target. Preserve the raw-LUCK geometry observation only; do not tune the grammar to rescue FALSE.

No p0 rune value at offsets196..200 may be inspected before this precommit is remotely established.


## Outcome after opening the sealed receiver

The selected original p0 word is:

```text
offsets196..200 = [21,19,0,4,27]
```

The unchanged HERE/DH lookup family has **zero** hits against the frozen seven-word authenticated five-rune target family. In particular, it does not recover FALSE under either additive sign.

The 14 source lookups contain 13 distinct numeric values:

```text
{3,5,7,8,10,12,17,20,22,23,24,26,28}
```

For each authenticated target, the exact required five-rune difference vector contains at least one value outside that set, so the full `14^5 * 2` labeled family cannot hit. No expanded source line, H layer, permutation, phase, or constant was tried.

**Decision: negative.** Preserve only the source-native geometry observation that raw LUCK ciphertext `61 -> p50[61]=3G -> base60 196` lands at a five-rune word. The already frozen p38 HERE/DH lookup grammar does not transfer to this receiver, so this branch is closed unless a different operation is independently selected before reuse.
