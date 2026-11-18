# Low60 second-character parity is a selective intermediate feature

**Agent 13 independent exploration, 18 November 2026. Evidence class: intermediate original-ciphertext structure. No plaintext, key, or opcode recovered.**

The validated p50 leading-zero class contains 60 physical cells and 33 of the 86 original same-page adjacent-equal events. #1571 shows that this class is internally heterogeneous, while repeated raw values are not selectively favored over arbitrary groupings of the same complexity. This follow-up asks a smaller source-defined question: do the six binary digits of the printed low value carry transferable information inside the already selected class?

Under the conventional historical base60 participant reading, **bit 0 of the second printed digit** splits the 60 selected cells into groups with **29/1,809 = 1.6031%** versus **4/1,216 = 0.3289%** repeat rates. Under the unchanged nine visual-chapter leave-one-out scoring used by the p50 program, this two-rate model gains **+5.498023 nats** over one common low60 rate and is positive in **7/9** held-out chapters.

The documented drop-`f` base59-compatible reading gives a weaker but directionally related bit-0 split: **23/1,510 = 1.5232%** versus **10/1,515 = 0.6601%**, for **+2.193596 held-out nats**, again positive in **7/9** chapters.

This is an operand clue rather than a parser decision. The creator-authored p50 radix remains unresolved, and the two alphabets do not assign the same parity to every printed character.

## Frozen finite feature family

After the broader raw-byte bit observation suggested a possible parity effect, the confirmatory family was kept deliberately finite:

- only the 60 already validated leading-zero cells;
- only the second printed character;
- exactly six available binary digits, bits 0 through 5;
- exactly two source-compatible historical alphabets already present in the repository: the conventional 60-character alphabet and the drop-`f` 59-character alternative;
- unchanged global phase-zero clock, same-page adjacent-equal event, and nine visual-chapter holdouts;
- no threshold, phase, traversal, character-class, interaction, or bit-combination search.

Held-out gains over one common selected-class rate are:

| Feature | Gain, nats | Positive chapters |
| --- | ---: | ---: |
| base60 bit0 | **+5.498023** | **7/9** |
| base60 bit4 | +0.207895 | 5/9 |
| base60 bit3 | -0.053925 | 6/9 |
| base60 bit2 | -1.139588 | 5/9 |
| base60 bit5 | -1.186005 | 2/9 |
| base60 bit1 | -1.229195 | 5/9 |
| drop-f59 bit0 | **+2.193596** | **7/9** |
| drop-f59 bit3 | +0.837688 | 6/9 |
| drop-f59 bit4 | +0.207895 | 5/9 |
| drop-f59 bit2 | -1.160900 | 5/9 |
| drop-f59 bit5 | -1.186005 | 2/9 |
| drop-f59 bit1 | -1.841649 | 2/9 |

Bit 0 is the only member with a substantial predictive gain under both readings.

## Finite-family token-label null

To calibrate the post-observation bit choice without changing ciphertext, chapter folds, cell exposures, or the observed token multiset, each null trial randomly reassigns the 60 observed leading-zero token labels to the 60 fixed selected physical cells. It then recomputes all 12 bit features and retains the largest nine-chapter held-out gain.

With seed `0x33011313` and **20,000** trials:

- observed family maximum: **+5.498023 nats**;
- null mean maximum: **+1.646878 nats**;
- null 95th percentile: **+4.324451**;
- null 99th percentile: **+6.271286**;
- trials at or above observed: **364/20,000**;
- add-one familywise **p = 0.0182491**.

The parity feature is therefore selective within this exact finite family, while remaining weaker than a decipherment mechanism.

## Interpretation and next decision

The result narrows the p50 operand question in a way that raw-value equality did not. Within the already validated leading-zero class, the printed low digit contains a simple one-bit partition that transfers across chapters and beats multiplicity-preserving token relabeling after correcting for all 12 tested bit features.

Two cautions remain decisive:

1. the conventional base60 parity split is stronger than the drop-`f` reading, so a creator-selected numeric alphabet has not been established;
2. a predictive bit does not specify how encryption consumes that bit.

Future p50 mechanism work may use second-character bit 0 as a **predeclared diagnostic**. It should require a source-selected operation that explains why that bit changes self-transition behavior, and should test both documented alphabet readings unless a first-party source fixes one.

Reproduction: `sims/lp2_p50_low60_secondchar_bits_sft.cjs`.
