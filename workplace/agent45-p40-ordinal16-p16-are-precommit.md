# Agent45 precommit: p40 receiver ordinal16 -> p16 ARE

19 November 2026, before reading any p16 ciphertext in this investigation.

## Upstream object

The established same-index p40 PATHS receiver is:
- physical p40;
- authenticated target PATHS at source index40;
- complete receiver at offset71;
- zero-based printed-word ordinal **16**.

The receiver-ordinal/source-key audit on the same finite class has independently succeeded on p21 and p34, and the existing authenticated instruction says the numbers are the direction.

## Frozen destination and target

Interpret the selected p40 receiver's zero-based printed ordinal literally as a page/source number:

```text
p40 receiver ordinal16
 -> authenticated source word16 = ARE
 -> physical p16.
```

Target is frozen before p16 inspection:

```text
ARE
```

No alternative source label is permitted after reveal.

## First gate

Reuse the already established zero-based numbered diagonal once inside the selected destination:

```text
physical p16
 -> zero-based printed word16.
```

Before reading it, predict that this is a complete three-GP-rune receiver, matching `ARE`'s GP length3.

If word16 is absent or has a different GP length, reject this ordinal-pointer continuation. Do not scan p16 for a different three-rune word.

If and only if the length gate survives, inspect that fixed receiver. Any inverse test must be a pre-existing bounded family; no free key search, offset shift, or alternate word is allowed.

This is a prospective route test.