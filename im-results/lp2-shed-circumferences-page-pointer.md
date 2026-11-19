# “Shed our own circumferences” gives page pointers: p57→p50 and p33→p39

**Agent45, 19 November 2026. Classification: source-selected page-pointer mechanism with an independent target holdout. It does not decrypt the p33 or p39 ciphertext bodies.**

## Mechanism from the solved source

Solved physical p57 says, in the canonical GP transliteration:

```text
... WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIUINITY WITHIN AND EMERGE
```

Take “our own circumferences” literally at the printed-word level. For every word in the body after the red **PARABLE** title, remove the first and last rune. A one-rune or two-rune word therefore has an empty interior.

P57 has:

- 19 body words;
- 88 body runes;
- no one-rune body words;
- exactly **50 runes** after shedding one circumference from every body word.

Thus the clear instruction itself yields the page number:

```text
p57  --shed each word's circumference-->  50
```

Physical p50 is the unique non-runic LP2 page and contains the 256-cell numeric table already central to the live route. This is a direct source operation and a distinctive destination, rather than a language-scored ciphertext fit.

## The p50/DH route selects p33

The independently recovered DH state contains `B=19`. Under the established p50 byte reading:

```text
p50[19] = 0X = 33
```

so the table selects physical p33 before the transfer below is applied.

P33 now supplies its own reason to reconnect to the p57 instruction. The second red heading starts with literal GP values

```text
[21,2] = [B+K,K].
```

Under the already frozen H orientation,

```text
H(21,2) = [19,23] = [B,p]
H(19,23) = [25,13] = [GP0(WE), 13].
```

The first H output is visibly represented by p33's decorative M with ordinal19 plus the first transcribed title D with ordinal23. The second H output returns **WE**, the opening word of the solved p57 instruction sentence, together with the literal red 13-dot title punctuation count.

The fuller p33 state-register evidence is documented in `im-results/lp2-p33-dh-layout-state-register.md`.

## Transfer the clear operation unchanged to p33

Apply the p57 operation to p33's **first black body**, immediately after the first red title and before the shared three-dot divider.

That source object has:

- 21 printed words = `p-K`;
- 81 runes = `e^q = 3^4`;
- no one-rune words.

Removing the first and last rune of every word leaves exactly:

```text
81 - 2*21 = 39 runes.
```

So the transferred source operation gives:

```text
p33  --shed each first-body word's circumference-->  39
```

No cipher key, phase, language model or dictionary target is used to obtain 39.

## P39 is an independently state-bearing target

The pointer is corroborated twice by p39 source material that was not used to derive the count.

### Original-image divider holdout

A prior complete original-JPEG inventory established that p33 and p39 are the **only two LP2 pages** carrying the same reused three-black-dot divider graphic. The p33 divider is the exact boundary after the 81-rune body used above. The p39 divider is the corresponding reused source template.

See `im-results/lp2-p33-p39-original-three-dot-ellipsis-gate.md` and its original-JPEG SFTs.

### Red-title DH/H holdout

P39's only red three-rune heading has canonical GP values:

```text
[27,5,15] = [-K,g,b].
```

Those values are source-fixed. Repeated application of the same frozen H to the first two coordinates gives:

```text
H(27,5)  = [22,3]  = [p-1,e]
H(22,3)  = [19,25] = [B,GP0(WE)]
H(19,25) = [23,15] = [p,b].
```

The final second coordinate, `b=15`, is already the literal third rune of the p39 red title.

There are only two three-rune red spans in the annotated LP2 corpus: p3 local119 is `[13,23,2]`; p39 local119 is `[27,5,15]=[-K,g,b]`. The p39 state triplet therefore constitutes a narrow target-specific holdout.

This gives the causal route:

```text
solved p57 instruction
    -> shed p57 word circumferences
    -> p50
    -> B=19 addresses p33
    -> p33 H chain returns WE
    -> reuse solved “shed circumferences” operation
    -> p39
    -> p39 independently carries the same DH/H state
```

## Full red-body census

The literal `word.slice(1,-1)` operation was applied unchanged to every nonempty red-started body in the canonical physical transcription, including bodies containing one-rune words.

There are 15 such bodies. Only four produce an interior count in the physical-page range 0–57:

| Source body | Body words | Body runes | One-rune words | Interior runes |
| --- | ---: | ---: | ---: | ---: |
| p3 local119 | 21 | 95 | 0 | **53** |
| p33 local0 | 21 | 81 | 0 | **39** |
| solved p56 local0 | 23 | 80 | 1 | **35** |
| solved p57 local0 | 19 | 88 | 0 | **50** |

P57 is the source-selected positive control because its clear text explicitly says to shed circumferences. P33 is selected independently by the p50/DH route and returns WE through its own H chain before the transfer. P39 then supplies two independent target holdouts.

The p3 result **53** is preserved as a separate prediction. It is not used to justify the p33 result, and no semantic meaning is assigned here merely because p53 exists. P56→35 is likewise a census result without a local shed instruction.

## Bounded consumer checks after reaching p39

P39's red third rune `b=15` equals `det(H)^-1 mod29`, which motivates one narrow page-local inverse-H check. Applying inverse H wordwise to the 118-rune body after the p39 red heading gives IoC about `0.03346` and visibly nonlinguistic output. Forward H gives IoC about `0.03824` and is also nonlinguistic.

Carrying the 39 p33 interior runes to p39 and applying forward or inverse H by their preserved inner-word boundaries is also nonlinguistic: IoC about `0.03104` and `0.03374`, respectively.

**Decision:** preserve the page-pointer mechanism and retire these immediate H / inverse-H plaintext consumers. P39 still requires a source-selected reversible consumer.

## Research consequence

This is a materially stronger intended-route hypothesis than a free page-number coincidence because:

1. the operation comes verbatim from solved p57;
2. applying it to p57 itself lands on the distinctive p50 number table;
3. the already recovered p50/DH state independently selects p33;
4. p33's source-visible H chain outputs WE, reconnecting to the instruction sentence;
5. unchanged shedding of the selected p33 body gives p39;
6. p39 is independently the only other page sharing p33's exact divider graphic;
7. p39 independently carries `[-K,g,b]` in its only red three-rune heading and closes a further H state chain.

The next useful experiment should start from p39's source-fixed state-bearing title or from a newly identified p39 receiver. It should avoid broad key searches on the 39-rune interior stream.

## Reproduction

- SFT: `sims/lp2_shed_circumferences_page_pointer_sft.cjs`
- Windows workflow: `.github/workflows/agent45-shed-circumferences-page-pointer.yml`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44453103750
- Solved p57 source: `resources/external/relikd-solved-gp29-native-v1.json`
- Physical transcription: `resources/liber-primus/lp2-transcription.txt`
- Ink annotations: `resources/liber-primus/lp2-ink-annotations.json`
- P50 table: `resources/liber-primus/base60-grid.json`
