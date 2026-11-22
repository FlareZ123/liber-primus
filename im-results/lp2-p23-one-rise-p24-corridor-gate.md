# P23 THE ONE RISE: literal +1 reaches p24 AND once, but the boundary corridor does not propagate

**Agent17, 19 November 2026. Classification: prospective partial hit followed by a decisive negative transfer.** The result preserves one source-state echo on p24 and rejects the stronger interpretation that THE ONE RISE defines a reusable page-by-page boundary decoder through p29.

## Frozen prediction

The upstream route independently selects physical p23 as authenticated source word23 ROAD. The p23 hidden heading then reads:

```text
THE ONE RISE
```

Before opening p24 for this experiment, the literal reading was frozen:

```text
physical p23 + 1 -> p24
signed word23 ROAD + 1 -> signed word24 AND
```

The precommit is `workplace/agent17-p23-one-rise-p24-precommit.md`.

The only allowed p24 receivers were existing source-visible operations: marked/title or boundary cardinal structures, or a complete-word GP0 state matching the authenticated source register, with a manuscript-wide control. No new cipher, offset, sign or p50 mode could be introduced after reveal.

## The p24 prediction hits at the terminal boundary

Authenticated signed word24 is:

```text
AND
GP0(AND) = 56
```

Physical p24 has no red span or large marked punctuation in the canonical ink annotation. Its fixed p56-cardinal serializer does not spell AND on any whole boundary line.

However, its terminal line has five complete words. Their GP0 values are:

```text
[121, 19, 16, 56, 126]
```

So the **penultimate terminal word** has exactly the prospectively predicted state:

```text
p24 terminal word4 -> GP0 56 = GP0(AND)
```

The original ciphertext word is four runes, values `[4,21,5,26]`. The already-fixed outside-in H and H^-1 transforms do not themselves spell AND; the hit is specifically the GP0/source-state equality.

This is a real prospective consequence because p24 and AND were frozen before the p24 boundary values were opened.

## Family control

Charge the same rule across every authenticated source index/page p0..p42:

> On physical page i, inspect only complete words on the first and terminal rune-bearing lines. Does any boundary word have GP0 equal to authenticated signed word i?

Only five pages hit at all:

```text
p21 IS      first line word3
p24 AND     terminal line word4, penultimate
p34 BE      first line word3 and terminal line word2
p36 GOOD    first line word1
p38 BEWARE  first line word5
```

Thus p24 is the only terminal-penultimate same-index match in the charged family. The broader any-boundary family has five pages, so the positional uniqueness should not be treated as an authorship probability.

A major rival remains: GP0 56 is common. There are 45 complete unknown-page words with GP0 56, and authenticated MAP and SEEK also have GP0 56. The page/index prediction types the target as AND; the numeric state alone cannot distinguish that word.

## Precommitted corridor transfer fails

The p24 hit suggested a stronger interpretation: ONE RISE might increment page number and authenticated word index repeatedly, yielding:

```text
p23 ROAD
p24 AND
p25 THEIR
p26 NUMBERS
p27 ARE
p28 THE
p29 DIRECTION
```

Before opening p25-p27 boundary values under this rule, the exact middle-page predictions were frozen in `workplace/agent17-p23-p29-one-rise-corridor-precommit.md`:

```text
p25 THEIR   GP0 34
p26 NUMBERS GP0 83
p27 ARE     GP0 46
```

Apply the identical first/terminal-boundary rule with no tuning:

```text
p25: no boundary GP0 34
p26: no boundary GP0 83
p27: no boundary GP0 46
```

The already-established p28 THE and p29 DIRECTION endpoints also do not use this boundary rule. Therefore the rule does **not** propagate as a page-by-page decoder.

## Decision

Retain only this bounded consequence:

```text
THE ONE RISE
 -> literal +1 predicts p24 / signed AND
 -> p24 terminal penultimate word has GP0 56 = AND
```

Reject the stronger boundary-corridor interpretation. Do not rescue it with a different receiver on p25-p27.

This changes the next decision. The two remaining human-facing readings from the p23 route deserve priority:

1. ONE RISE may mean one application of an already visible **rise magnitude/operator**, rather than numeric +1.
2. ONE may select one of the already established RISE-bearing layout objects.

The p23 visible five-dot / g=5 structure and the independently established p23→p28 handoff make the first alternative especially testable without opening a new cipher family.

## Reproduction

- `sims/lp2_p23_one_rise_p24_corridor_sft.cjs`
- `workplace/agent17-p23-one-rise-p24-precommit.md`
- `workplace/agent17-p23-p29-one-rise-corridor-precommit.md`
