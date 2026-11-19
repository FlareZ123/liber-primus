# P33 `THEIR RISE` closes a signed-source route into the FALSE PATHS corridor

**Agent50, 19 November 2026. Classification: new intended-route / navigation candidate. It links an independently recovered p33 hidden instruction to the authenticated 2016 source and original p50 table without using unknown rune plaintext. It does not by itself decrypt p39-p42.**

## Result

The already published p33 solved-control serializer recovers:

```text
THEIR RISE
```

from the two red p33 title word-length pairs. The new observation is that the authenticated 2016 message itself gives a narrow operational reading of that phrase.

Under the repository's fixed 43-word tokenizer, `THEIR` occurs exactly twice:

```text
word19 = THEIR
word25 = THEIR
```

The native full-base60 p50 table at the first occurrence is:

```text
p50[19] = 0X = 33
```

so the source word `THEIR`, using its own word number as the p50 address, lands on physical **p33**, the page that independently says `THEIR RISE`.

This is selective inside the authenticated source. Among all words that repeat in the 43-word message, `THEIR` is the only word whose **earliest occurrence** has a full-base60 p50 value inside physical pages p0..p55.

Now execute the literal rise between the two source occurrences:

```text
25 - 19 = 6
33 + 6 = 39
```

The destination is physical **p39**. Signed word39 is exactly:

```text
FALSE
```

and original archive image `56.jpg` for p39 carries the dominant large red X-shaped graphic. That supplies a source-visible success cue independent of the arithmetic.

The authenticated continuation is:

```text
39 FALSE
40 PATHS
41 VERIFY
42 OPENPGP
```

Thus the route is:

```text
authenticated THEIR@19
  -> p50[19] full base60 = 33
  -> p33 hidden text THEIR RISE
  -> rise to the second THEIR: 25 - 19 = 6
  -> p33 + 6 = p39
  -> FALSE / large red X
  -> signed corridor FALSE PATHS VERIFY OPENPGP
```

## Why this changes the route

The p33 `THEIR RISE` result previously lacked a concrete consumer. The p39 `FALSE` / red-X alignment previously lacked a direct path from a hidden manuscript instruction. The signed source now joins them with two literal operations already active elsewhere in the project: source word numbers as p50 addresses and native full-base60 p50 values as physical-page pointers.

The landing is especially useful because it has a human-visible falsification criterion. A wrong interpretation of `THEIR RISE` would not be expected to land on the same-number authenticated word `FALSE` and a page dominated by a red X.

The result should be treated as an intended-route candidate rather than a plaintext proof. The phrase `THEIR RISE` itself is a derived p33 hidden-text candidate, and the final step interprets "rise" as the difference between the two authenticated `THEIR` word numbers. Both operations are narrow and independently checkable, but this invocation discovered the composition after both ingredients were already known.

## Controls

The SFT reproduces the p33 `THEIR RISE` serializer from the original title lengths and solved-p56 prime-totient cardinal map, then independently parses the signed source and p50 table.

It verifies:

- `THEIR` occurs only at indices 19 and 25;
- `p50[19] = 0X = 33`;
- among repeated signed words, only the earliest `THEIR` occurrence has a full p50 value in p0..p55;
- the occurrence rise is exactly 6;
- `33 + 6 = 39`;
- signed word39 is `FALSE`;
- words39..42 are exactly `FALSE PATHS VERIFY OPENPGP`.

The original p39 red-X observation is visual evidence from archive image `56.jpg`, so it is deliberately kept outside the text-only machine assertions.

## Consequence

Use p39 as the immediate receiver of the p33 instruction before inventing another p33 key schedule. The next decisive task is to find a source-selected operation on p39-p42 that distinguishes `VERIFY` and `OPENPGP` from the visually repeated branching pages, or that links this corridor back to the source-derived p0 OPENPGP packet.

Do not reinterpret `7A35090F` as an unconstrained address; its authenticated role remains signature verification. Do not reopen arbitrary p33 repeating-key or affine families.

## Reproduction

- `sims/lp2_p33_their_rise_false_corridor_sft.cjs`
- `.github/workflows/agent50-p33-their-rise-false-corridor.yml`
- upstream p33 hidden-text control: `sims/lp2_p33_totient_hidden_text_sft.cjs`
- original p39 image: archive `56.jpg`
