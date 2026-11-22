# p57 DIVINITY operand-semantics gate

**18 November 2026, Agent8, Director issue #1547. Classification: GP-prime sums are uniquely selected inside the frozen parameter-free p57 operand family by the DIUINITY decimal/2800 criterion.**

## Frozen receiver and operand family

The receiver is fixed by #1497/#1540 before this test: zero-based row-major p50 addressing, literal printed cell tokens, inner→outer concatenation. For every complete p57 word, form its strict interior and shed first/last runes.

Only three parameter-free GP-native quantities are allowed as addresses:

1. GP-prime sums;
2. canonical GP index-value sums using 0..28;
3. rune counts.

There is no modulo reduction, affine correction, alternate address grammar, phase shift or target-specific adjustment.

## Complete result

| operand | valid p57 words | decimal outputs | DIUINITY addresses | DIUINITY output |
| --- | ---: | --- | --- | --- |
| **GP-prime sums** | 18 | **DIUINITY→2800 only** | **184 / 192** | **2800** |
| GP index sums | 20 | INSTAR→2233; OWN→3347 | 56 / 49 | 4E0G |
| rune counts | 20 | none | 6 / 2 | 262l |

Exact `2800` occurs only under GP-prime sums, and only for DIUINITY.

The alternatives are informative controls rather than near misses. GP-index sums are fully addressable for all 20 words and can generate decimal-looking outputs, but their decimal words are **INSTAR** and **OWN**, while DIUINITY maps to `4E0G`. Counts map DIUINITY to `262l` and produce no decimal output anywhere in p57.

## Decision

Director #1547 is a **positive operand-semantics discrimination** for the p57→p50 bridge. Within the exact predeclared source-native family, only the already-authenticated GP-prime values turn the literal “shed circumferences / divinity within” operation into a unique decimal DIUINITY pointer, and only that family yields the historically matched `2800`.

Combined with #1540, the surviving low-description-length path is therefore much narrower:

```text
DIUINITY
 -> strict interior / shed endpoints
 -> GP-prime sums
 -> zero-based row-major p50 addresses
 -> inner→outer literal printed tokens
 -> 2800
```

The remaining inferential gap is the **addressing act itself**: no result here proves that prime sums should be used as p50 indices, and #1568 independently finds no first-party source nominating p50 as the receiver. Director #1565 also leaves token order source-ambiguous: p57 action chronology favors outer→inner while p50 graphical reading order favors inner→outer, with no authenticated convention deciding between them. The historical DH target therefore still selects inner→outer if the bridge is accepted, and the concrete DH3301 session remains participant-preserved rather than organizer-signed.

Reproducer: [`sims/lp2_p57_divinity_operand_semantics_sft.cjs`](../sims/lp2_p57_divinity_operand_semantics_sft.cjs)

Windows Node22 CI: [run 44393014601](https://github.com/FlareZ123/liber-primus/actions/runs/44393014601)
