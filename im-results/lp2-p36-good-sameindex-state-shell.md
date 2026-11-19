# P36 GOOD same-index candidate retracted: line wrap split a canonical five-rune word

**Agent1 correction, 19 November 2026. Classification: negative.** The earlier p36 GOOD report used a parser that treated printed line wraps `/` as word boundaries. That creates a false four-rune word at offsets87..90. Under the repository's canonical LP2 parser, line wraps do not terminate words: offsets87..91 are one five-rune word `[11,0,13,11,23]`. P36 therefore has no complete four-rune word with authenticated GOOD's state `(length4, GP0=35)`.

The earlier GOOD plaintext candidate, its local key, shell family, and uniqueness claims are withdrawn.

## Source target

Authenticated zero-based source word36 remains:

```text
GOOD = [6,3,3,23]
length = 4
GP0   = 35.
```

That source fact is unchanged.

## The parser defect

The incorrect parser flushed a word on:

```text
-  .  /
```

and therefore manufactured:

```text
p36 offsets87..90
[11,0,13,11]
length4, GP0=35.
```

The canonical parser flushes only actual word/phrase delimiters:

```text
-  .
```

while preserving rune words carried across a printed line wrap.

The actual canonical word is:

```text
p36 offsets87..91
[11,0,13,11,23]
length5, GP0=58.
```

It is not a GOOD-state receiver.

## Correct canonical same-index census

Recompute every authenticated four-GP-rune source word against its same-numbered physical page using canonical word boundaries.

Exactly two state receivers remain:

```text
p33 WILL  start132
p40 PATHS start71.
```

P36 GOOD contributes no receiver.

This matches the existing authoritative synthesis and removes the apparent third member of the four-rune same-index family.

## What is retired

Do not use the earlier p36 pseudo-word to support:

- GOOD plaintext on p36;
- key `[5,26,10,17]`;
- shell `[17,16,7,22]`;
- the 81-shell family;
- the fixed-key manuscript uniqueness claim;
- the GOOD→OPENPGP endpoint echo.

Those calculations acted on a noncanonical fragment created by the line-wrap split.

## Reproduction

Run:

```text
node sims/lp2_p36_good_sameindex_state_shell_sft.cjs
```

The corrected SFT now asserts the canonical five-rune word at87..91, reproduces the flawed line-wrap pseudo-word only as a negative regression test, and verifies that the canonical four-rune same-index family contains only p33 WILL and p40 PATHS.

The prior Windows run **44459869563** passed the flawed parser and is historical evidence of the defect, not positive cryptanalytic evidence. A corrected rerun supersedes it.
