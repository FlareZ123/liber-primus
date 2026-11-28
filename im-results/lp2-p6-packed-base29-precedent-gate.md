# P6 signed `29Q+D` transport lacks an authenticated Cicada BASE29/address precedent

**Agent1, 28 November 2026. Classification: bounded historical/source audit and target-rune-blind transport comparison for Director issue #3404. No signed-source plaintext values or fitted coordinate keys are used.**

## Decision

The p6 q-block transport `29*Q + D` is empirically discriminating on its frozen receiver lanes, but the historical audit does **not** authenticate it as a Cicada address opcode.

The first-party positive is narrower: Cicada's signed 2013 TCP challenge specifies ordinary unsigned positional BASE29 conversion and gives the worked example

```text
BASE29 3301 -> 3QO
3301 = 3*29^2 + 26*29 + 24.
```

Contemporary participant transcripts add `1033 -> 16I` and `30 -> 11`; those logs are not signed as wholes, but both agree with the same ordinary minimal-width radix conversion. None of these sources says to treat a BASE29 numeral as a manuscript address, receiver offset, or signed displacement.

The p6 operator, in contrast, requires signed fields and an actual negative displacement. Its source fields and frozen q-block receiver starts are

```text
Q = [ 4, -3,  4,   2]
D = [ 0, 12, 12, -12]

p32..p35 starts = [ 30,132,  4,25]
p37..p40 starts = [146, 57,132,71]
observed deltas  = [116,-75,128,46].
```

Only the literal signed high/low rule reproduces all four:

```text
29*Q + D = [116,-75,128,46]  -> 4/4 lanes.
```

The historically attested unsigned positional convention, applied to the same fields as ordinary residues, gives

```text
29*(Q mod29) + (D mod29)
= [116,766,128,75]            -> 2/4 lanes.
```

The second lane is decisive: the required displacement is `-75`. Cicada's authenticated BASE29 example converts a nonnegative integer to nonnegative radix digits; it supplies no sign syntax or balanced-digit offset convention. The fourth lane also distinguishes the literal signed low digit `-12` from ordinary residue `17` unless a carry convention is introduced.

## Predeclared natural rivals

All rivals were fixed before scoring the four frozen receiver differences:

| Convention | Displacements | Exact lane matches |
| --- | --- | ---: |
| signed high/low `29Q+D` | `[116,-75,128,46]` | **4/4** |
| signed reversed `Q+29D` | `[4,345,352,-346]` | 0/4 |
| unsigned BASE29 high/low | `[116,766,128,75]` | 2/4 |
| unsigned reversed | `[4,374,352,495]` | 0/4 |
| one-based unsigned high/low | `[146,796,158,105]` | 0/4 |
| one-based unsigned reversed | `[34,404,382,525]` | 0/4 |
| one-based final address (`29Q+D+1`) | `[117,-74,129,47]` | 0/4 |

This establishes a useful distinction: the current p6 law is not merely ordinary BASE29 digit packing in disguise. It is a **signed displacement grammar** that happens to use radix 29.

## Historical coordinate controls

The other solved Cicada coordinate mechanisms in the repository do not close the gap. The reproduced 2012/2013/2014 book-code stages use explicitly typed tuples and source-local one-based coordinates (line/character, chapter/verse/character, paragraph/sentence/word/letter, or dialogue/speech/word/letter). They consume coordinate fields as coordinates; they do not pack a quotient/digit pair as `29*q+d` to make a flat receiver offset.

The 2014 GEB chain is especially relevant because it ultimately produces an onion address, yet its fourteen records are direct multi-field book coordinates. It is precedent for source-specific physical indexing, not for signed radix packing.

No authenticated 2012–2016 source inspected here supplies all three operations needed by the p6 interpretation:

1. signed/balanced BASE29 fields;
2. packing them as a full integer `29*q+d`;
3. applying that integer as a manuscript receiver displacement.

## Consequence for the corridor

The exact p6 lane fit remains a real source-only structural fact and a useful receiver-selection compression. This audit changes its evidential status in one important way: **the 2013 BASE29 command cannot be cited as historical authentication for the signed p6 address transport**.

The correct #3404 fork is therefore negative. Preserve `29Q+D` as a strong retrospective/structural receiver law, but require an independent p6 opcode, a genuinely held-out receiver prediction, or another first-party signed-offset precedent before promoting it to an authored navigation mechanism. Do not use ordinary BASE29 provenance to justify additional coordinate/key layers.

## Reproduction

Run:

```text
node sims/lp2_p6_packed_base29_precedent_sft.cjs
```

The SFT verifies the signed 2013 `3301 -> 3QO` positive against the repository source, verifies the contemporary `1033 -> 16I` and `30 -> 11` controls, reconstructs ordinary BASE29 numerals, and scores the seven predeclared p6 packing conventions against the frozen four receiver deltas.
