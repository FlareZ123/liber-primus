# Issue #1949 — source-first freeze (Agent2)

Created: 2026-11-20T02:56:08.499Z
Run: `agent2-gpt6-20261120T022917Z-draw9-issue1949-p26-fourth-dh-audit`

## Scope and source classification

This is a source-first test of the p26 FOURTH-DH packet. It does not use p29 WAY body values or p28 READ OUT as selectors. The p28 fourth-D output was already exposed in the pre-existing `im-results/lp2-p28-here-4d-gcd-holdout.md` before this audit, so the p28 test below is **not blind**; that limitation is explicit. The p29 holdout coordinates below are frozen before inspecting p29 values.

The WELCOME phrase comes from the externally derived solved-LP1 corpus at `resources/external/relikd-solved-gp29-native-v1.json`, section `0_welcome`. It is an original-manuscript page with community-derived plaintext, **not a Cicada-signed plaintext source**. The 2016 clear-signed message is authenticated. The 256 two-character p50 table is the original row-major 32×8 object spread over physical pages49–51 (original JPEGs 66–68), with no author-supplied radix legend.

## Frozen source-to-p26 selection

The 124-word WELCOME section has 121 four-word windows. Exactly one window emits `FOUR` when each word's zero-based GP0 sum addresses the original table and the first token character is read as a GP29 index:

| Word | GP0 | p50 token |
|---|---:|---|
| FIND | 42 | 0S |
| THEIR (TH is one rune) | 34 | 3H |
| WAY | 57 | 1w |
| HERE | 48 | 4D |

The high digits `[0,3,1,4]` read `FOUR`. The same WELCOME source has no `FOUR` window under one-based GP0, GP0−1, GP-prime, or the charged low-digit alternatives.

Across the 56 unknown pages there are 3,176 four-word windows. Four emit high-digit `FOUR` under zero-based GP0 (p5, p23, p26, p31). Only p26 also contains the unique unknown-page adjacent GP0 edge `57→56`. Its four-word window is:

- words: `E / SAOE / CHISFIN / POENG`
- GP0: `[18,61,57,56]`
- table tokens: `[0F,3G,1w,4E]`
- original page-rune offsets: `197–210`
- the adjacent `CHISFIN→POENG` pair occupies offsets `201–210`.

The table's only mixed-parser two-step route is `57 --1w (one west)--> 56 --4E (hex 0x4E = N)--> 48`. This is a bounded navigation candidate, not yet a cipher operation. The source adjacency is weaker than the compact notation suggests: WELCOME has adjacent `WAY HERE` with addresses `57→48`, not `57→56→48`; the signed 2016 text has `WAY` at one-based word14 and `MAP` at word19, separated by `Its words are the`. No literal source-adjacent pair reproduces the `57→56` move. The second table step `56→48` also does not match the next p26 ciphertext word, whose GP0 is 95.

The zero-based/high-digit source reading is selective, but it is an inferred reading rule: neither the solved WELCOME transcription nor the 2016 signed message explicitly says “take the first character of each GP0-addressed table token.”

## Radix and GCD alternatives

For the p26 tokens `[0F,3G,1w,4E]`:

- conventional base60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`: bytes `[15,196,118,254]`, residues mod29 `[15,22,2,22]`;
- drop-lowercase-`f` base59: bytes `[15,193,116,250]`, residues mod29 `[15,19,0,18]`.

Only base60 yields the p28 DH23 multiset/order candidate `[b,p−1,K,p−1]=[15,22,2,22]`. The original table does not select base60 over base59; the base60 alphabet has external historical precedent, but that is not an author-supplied Cicada radix instruction.

For base60 residues, the three pairings of four entries give:

- adjacent `(0,1),(2,3)`: GCDs `[1,2]` → `U,TH`;
- crossed `(0,2),(1,3)`: `[1,22]` → `U,OE`;
- outer `(0,3),(1,2)`: `[1,2]` → `U,TH`.

The first pair `gcd(b,p−1)=1` is the standard DH invertibility condition. Applying the same GCD to the final `(K,p−1)` pair to obtain `2=TH` is an additional choice, not a standard DH requirement. The `TH` suffix needed to extend `FOUR` to `FOURTH` therefore needs independent justification; it must not be selected merely because the previously reported p28 output is `GCD`.

## Frozen receiver and tests

Candidate instruction to test: `FOURTH D; H`.

- p28 target: the fourth literal D, center at original rune offset48; receiver offsets `47–49`.
- frozen reversible map: `H(x,y,z) = (x−z, x+z, y) mod29`.
- inverse: `x=(d+s)/2`, `z=(s−d)/2` mod29, with center `y) carried unchanged.
- predeclared untouched holdout: p29 original rune offsets `0–2` (first three runes), chosen by coordinate before reading p29 body values.
- solved controls: p56 has only three D runes (so no fourth-D receiver); p57 fourth D is at offset88, receiver offsets `87–89`.
- additional negative control: p28 fifth D at offset71, receiver offsets `70–72`.

The operation must yield meaningful unknown-page plaintext beyond an operation label, checksum, or isolated short word, and it must pass the predeclared holdout. Exact forward reconstruction is required but is not sufficient by itself.

## Decision boundary

The source-only census supports a selective p26 FOUR / 57→56 navigation hypothesis and a base60-dependent DH-shaped cross-packet. It does **not** yet establish that GCD is independently selected on the final pair, that `FOURTH D; H` is a source-authored cipher instruction, or that H is an inverse for any extended ciphertext span. No p29 body value has been inspected for this freeze. If the frozen H test and p29 holdout do not produce meaningful plaintext, close #1949 at navigation/meta-instruction only and retire the claimed LP2 inverse.
