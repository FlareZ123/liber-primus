# EA109-selected p0 receiver yields THE MAP candidate and re-enters the pre-existing MAP -> NEXT chain

**Agent5, 19 November 2026. Classification: new conditional plaintext candidate on a prospectively selected original receiver. The receiver start109 was fixed before this phrase test. The exact phrase competition is finite and the winning MAP word has a pre-existing downstream consumer committed before this result.**

## Frozen receiver chronology

The local ROAD/LEAD/EA route had already selected p0 offset109 before any plaintext was assigned there:

`SHED LEAD -> EA -> GP-prime(EA)=109`.

Agent5 then opened the untouched complete word at109..110 and found only structural pointer/state closures, without assigning plaintext. Agent4 independently found that the same selected two-rune word's prime weights produce `[K,g]`.

The next complete word is p0 word25 at111..113. Thus the frozen receiver after ROAD is a complete **[2,3]** word pair spanning109..113:

- word24 ciphertext `[14,26]`;
- word25 ciphertext `[18,1,21]`.

## Complete authenticated [2,3] source family

Parse the signed 2016 cleartext into native GP runes.

Exactly three adjacent authenticated phrases have rune lengths [2,3]:

1. **THE PATH**, source words2/3;
2. **THE WAY**, source words13/14;
3. **THE MAP**, source words18/19.

Physical p0 also has exactly three adjacent complete-word [2,3] receivers:

- words16/17, offsets75..79;
- words24/25, offsets109..113;
- words28/29, offsets122..126.

This gives exactly **9** source-phrase/receiver combinations before any key scoring.

## Additive inverse family

For each of the 9 combinations, use only the ordinary GP29 additive inverse `K=C-P mod29`.

At the independently selected receiver109..113:

- THE PATH requires keys `[12,8] | [5,6,19] = [12,A] | [g,a,B]`;
- THE WAY requires `[12,8] | [11,6,24]`;
- THE MAP requires `[12,8] | [28,6,8] = [12,A] | [EA,a,A]`.

Two second-word keys are entirely typed by the augmented source state `{p,g,a,A,B,b,K,EA}`: THE PATH and THE MAP.

Only **THE MAP** begins its second-word key with **EA=28**, the exact rune whose GP prime selected this receiver in advance. Its complete second-word key is exactly:

`[EA,a,A] = [28,6,8]`.

Across all 9 fixed [2,3] phrase/location combinations, the predicate

`first key residue = EA AND remaining residues are DH23 fields`

has exactly **1** hit: THE MAP at p0 109..113.

The competing inverse sign does not reproduce this selector echo.

## Exact reconstruction

Canonical plaintext values are:

`THE = [2,18]`

`MAP = [19,24,13]`.

The selected ciphertext is:

`[14,26] [18,1,21]`.

Required additive key:

`[12,8] [28,6,8]`.

Forward GP29 addition reconstructs every original rune exactly:

`THE + [12,8] = [14,26]`

`MAP + [EA,a,A] = [18,1,21]`.

The first-word key `[12,8]` is independently compact: `12=a*K` and `8=A`; 12 is also the 2016 carrier width residue `563 mod29`.

This report does not use that first-word decomposition to choose between the three phrases. The discriminating held-out property is the EA selector echo in the second word.

## A pre-existing MAP consumer was already committed

Before this THE MAP candidate was found, Agent2 had committed a separate MAP/NEXT navigation edge.

Canonical:

`GP0(MAP)=19+24+13=56`.

Under the already promoted whole-word GP0 -> zero-based p50 address grammar:

`56 -> p50[56]=4E -> base60 254`.

Offset254 is exactly the start of p0 word57, and its one-based word ordinal57 equals:

`GP0(NEXT)=57`.

Agent2 correctly noted that the p50 consumer validates numeric state56 rather than MAP's letters because authenticated AND and SEEK also have GP0 56.

The new receiver inverse changes that situation. The selected original word111..113 is specifically recovered as the GP letters **MAP**, independently of the GP0 collision, and therefore supplies the exact lexical input to the already existing MAP -> NEXT edge.

The combined conditional chain is:

`EA -> prime109 -> p0 109..113 -> THE MAP`

`MAP -> GP0 56 -> p50/base60 254 -> p0 word57 -> NEXT`.

No new receiver rule is introduced after seeing MAP.

## Relation to the local p0 phrase

Together with the separately stronger source-key result at103..104, the current local candidates read:

`THE ROAD THE MAP`

over p0 words22..25, offsets103..113.

The first THE has an exact source-only key [6,23]. ROAD remains the weakest link because its four-residue inverse is still not source-selected. THE MAP has the independently fixed EA109 receiver plus the unique selector-echo inverse above.

Do not promote the four-word phrase as established plaintext until ROAD's state update is independently selected.

## Decision

Preserve **p0 109..113 = THE MAP** as a serious conditional plaintext candidate and prioritize a blind consequence beyond113 or an independent source rule for the five key residues.

The decisive feature is the chronology:

1. EA selected receiver109;
2. original receiver content was opened without plaintext assignment;
3. the complete authenticated [2,3] phrase family was charged;
4. THE MAP alone returns EA as its own first second-word key and then [a,A];
5. MAP's previously committed numeric consumer continues to NEXT.

Reproducer: `sims/lp2_p0_ea109_the_map_candidate_sft.cjs`.
