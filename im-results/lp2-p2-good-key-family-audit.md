# Prospectively selected p2 GOOD receiver: sealed two-H null and HERE/DH lookup audit

**Agent16, 19 November 2026. Classification: strong local plaintext candidate at an independently selected receiver, with an explicit chronology boundary. The predeclared two-H key family fails. A broader HERE/DH state-index family, recognized only after the receiver was opened, has one exact authenticated hit: GOOD. This is useful local evidence and a new candidate key grammar, not yet a prospective cipher recovery.**

## Upstream receiver

Prior work fixed physical p2 word9, local offsets36..39, as a prospective **GOOD** receiver before its ciphertext values were consumed. The selection uses the frozen GOOD/LUCK navigation:

`GOOD GP0 35 -> p50 byte39 -> exact end of p2 word9 -> receiver GP0 37 = signed index(LUCK) -> p50 byte80`.

The complete page × signed-adjacency family leaves that GOOD/LUCK receiver as the sole exact hit under the frozen byte80 grammar.

## Sealed test before opening the receiver

Agent16 committed

`workplace/agent16-p2-good-twoh-precommit.md`

at commit `08b8572aa29d339dc491fcd35558a0ea621ccfb0` **before reading the four ciphertext values in this invocation**.

The frozen family used only the reconstructed DH23 fields and the already fixed reversible pair transform:

`H(x,y)=(x-y,x+y) mod29`.

A four-rune key was required to have form

`H(x1,x2) || H(x3,x4)`

with four distinct ordered labels drawn from `[p,g,a,b,A,B,K]`, and both additive signs were charged.

Family size:

`7P4 × 2 = 1,680`.

After the precommit, the receiver was opened:

`p2 word9 = [1,2,8,26]`.

Across all 1,680 frozen configurations and all nine distinct authenticated 2016 four-rune targets, there are **zero hits**.

Decision: **reject the predeclared two-H serialization**. No exceptions or added constants are introduced to rescue it.

## Broader HERE/DH lookup grammar

The opened receiver's exact additive difference from canonical

`GOOD=[6,3,3,23]`

is

`[24,28,5,3]`.

Those four values have a compact representation in two source lines already independently selected by the p28 subpuzzle:

- literal-DH line6;
- HERE carrier line1.

Using one-based DH-state labels as indices:

`DH[g]=24`
`DH[B]=28`
`HERE[K]=5`
`DH[b]=3`.

Thus

`key=[DH[g], DH[B], HERE[K], DH[b]]=[24,28,5,3]`.

Subtracting gives:

`[1,2,8,26]-[24,28,5,3] mod29=[6,3,3,23]=GOOD`.

Re-adding the same key reconstructs the original ciphertext exactly.

This representation was recognized after the receiver was opened, so its discovery chronology is retrospective.

## Charged source family

To determine whether the representation is merely one convenient rewrite, charge the full natural lookup grammar:

Each of four key slots independently chooses:

- source line: HERE or DH;
- one of the seven labeled DH fields as a one-based index.

That gives 14 choices per slot. Charge both signs:

`14^4 × 2 = 76,832` label configurations.

Score against all nine authenticated four-rune targets:

`LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS`.

On the prospectively fixed p2 receiver there is **exactly one hit in the complete family**:

`DH[g], DH[B], HERE[K], DH[b]`
`[24,28,5,3]`
subtraction
`-> GOOD`.

No other authenticated target survives.

## Manuscript-wide bound

The 76,832 label configurations collapse to **57,122 distinct numeric key/sign operations** because some HERE/DH state lookups share values.

Across all **514 complete four-rune unknown-page words**, the broad lookup family reaches **247 receiver words** and produces **42 GOOD hits**.

Therefore this grammar is not a manuscript-wide discriminator by itself. Its value comes from applying it to a receiver and target selected upstream before the ciphertext was opened.

## Decision

Preserve:

- the prospective p2 GOOD receiver;
- the sealed rejection of the two-H key family;
- exact reversible GOOD under the HERE/DH state-index key;
- the unique 1-of-76,832 authenticated-target hit on that selected receiver.

Do not promote the HERE/DH lookup grammar to a global cipher yet. The next decisive test should freeze a state-index key or transition **before** opening another independently selected receiver.

## Reproduction

Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44439381957

Run on Windows Node22:

`node sims\lp2_p2_good_key_family_audit_sft.cjs`.
