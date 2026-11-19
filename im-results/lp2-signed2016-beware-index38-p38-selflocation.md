# Authenticated BEWARE self-locates physical p38

**Agent30, 19 November 2026. Classification: source-state page selector and intended-route candidate. It selects p38 and its section-5 receiver without using unknown plaintext values as a target. It does not by itself supply a new rune-level decryption key.**

## Source-only selector

Use the authenticated 2016 signed message and the already active p50 **native base60 low digit** operation.

For each signed word after the first:

1. compute canonical GP0 of the current word;
2. address p50 at that GP0;
3. read the token's native base60 low digit;
4. compare it with GP0 of the immediately preceding signed word.

Across all 42 adjacent signed-word transitions, exactly one passes:

```text
index37  LUCK    GP0 = 31
index38  BEWARE  GP0 = 88

p50[88] = 3V
low60(3V) = 31 = GP0(LUCK)
```

Thus the authenticated source itself uniquely selects the transition:

```text
LUCK -> BEWARE
```

This step does not inspect LP2 ciphertext.

## "Their numbers are the direction" supplies the page

The selected current word has zero-based signed index:

```text
BEWARE = word38
```

Use that number directly as the physical LP2 page:

```text
signed index38 -> p38
```

This same-number reading is consistent with the existing p28/p29 source route, where authenticated word28 `THE` and the following word29 `DIRECTION` participate in the p28 -> p29 transition.

## P38 independently contains the BEWARE state

Parse the canonical LP2 word boundaries. Among complete words wholly on p38, exactly one has the authenticated BEWARE state:

```text
p38 offsets57..62
length = 6
GP0    = 88
```

Those are the already known section-5 first-word offsets. The authored visible section marker therefore gives an additional local boundary cue.

This reproduces the pre-existing p38 source-state BEWARE selector from a cleaner causal direction:

```text
authenticated source
  -> unique LUCK -> BEWARE p50-low echo
  -> BEWARE source number 38
  -> physical p38
  -> unique p38 length6 / GP0=88 word
  -> section5 receiver57..62
```

## Charged same-index family

A weaker state collision, same GP-rune length plus same GP0 somewhere on the same-number page, occurs at seven signed indices:

```text
6   SEEKS
11  IS
21  IS
33  WILL
34  BE
38  BEWARE
40  PATHS
```

Only index38 also satisfies the source-only predecessor echo above.

This control is important. Same-page length/GP0 collisions are not rare enough to identify a word by themselves; the LUCK -> BEWARE p50-low relation is the discriminator.

## Relationship to FALSE PATHS

The next authenticated words are:

```text
39 FALSE
40 PATHS
```

Original p39 contains a dominant large red X-shaped graphic, so the next source word gives a plausible human-visible warning immediately after the p38 checkpoint. This is supporting interpretation, not part of the machine selector.

A whole-range contact-sheet control does not support a universal rule where every signed word literally pictures its same-number page. P40's branching botanical frame is also reused on p41 and p42, so it is weak evidence for PATHS.

A concurrent source-selected p39 route recovers `VERIFY` through p57 circumference shedding and the p39 DIVINITY receiver. Therefore the red-X/FALSE alignment must not be used to discard p39 wholesale. The useful interpretation is narrower: the signed message can self-locate p38, then warns about false routes while valid source-selected operations may continue.

## Evidence boundary

This strengthens the intended human solve path because:

- the source transition is unique before consulting p38;
- the page number comes directly from the selected authenticated word's index;
- the selected page independently contains the matching state at an authored section boundary.

It still does not establish the retrospective p38 BEWARE key template as a reusable cipher. The existing exact local BEWARE inverse retains its own chronology caveat.

## Reproduction

Run:

`node sims/lp2_signed2016_beware_index38_p38_selflocation_sft.cjs`

The SFT charges all signed predecessor transitions, reconstructs canonical manuscript words, enumerates every same-index state collision at indices0..42, and verifies that index38 BEWARE is the only collision that also carries the authenticated predecessor echo.
