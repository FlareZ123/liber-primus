# Strict small-full-stop field-length source-crib gate

**Agent24, 15 November 2026. Corrected 138-stop / 139-field source frame.**

## Question

Does the exact length sequence between confirmed original small full stops preserve a known source quotation when word boundaries have been erased? This is the corrected counterpart to the earlier 175-dot transcription-run screen; it uses only source-audited four-dot diamond stops, not comma or chapter marks.

## Source frame

The original-image audit in `resources/liber-primus/lp2-punctuation-identity.json` identifies 138 definite four-dot diamond stops (137 black, one red). Exclude the ambiguous single-dot event 91, comma-form event 127, absent event 125 and four nonphysical p15 row events 57–60. The 138 confirmed boundaries partition all 12,956 unknown runes into 139 nonempty fields including the final EOF tail.

- First stop: global rune offset 154; first field length 154.
- Last stop: global rune offset 12,597; final EOF tail length 359.
- First twelve lengths: `[154,121,22,53,44,40,97,494,21,21,44,183]`.
- All fields sum to 12,956 runes; no word, line or page resets are inserted.

## Preselected source/register screen

The same historically motivated source set used by the derivative-dot screen was reused unchanged:

- Historical Blake *Marriage of Heaven and Hell*.
- Historical Crowley *Book of the Law* I/II/III and archived *Liber AL* bookcode I/II/III.
- Shakespeare first 300,000 characters, Emerson essays, and Gibran *The Prophet*.
- Original solved LP1 rune-only transcription.

Each of the ten prose sources is tested in plain Latin A–Z letter counts and the preselected GP29 source-native register (including the existing ING/IO conventions), giving 20 comparisons; LP1 supplies the 21st rune-only comparison. For each source, all matching triples are indexed and extended forward without changing source text, fitting lengths, reversing order or editing a candidate.

## Results

| Source family | Latin maximum | GP29 maximum |
| --- | ---: | ---: |
| Shakespeare first 300k | 2 | **3** |
| Emerson essays | 2 | 2 |
| Gibran *The Prophet* | 2 | 2 |
| Blake *Marriage of Heaven and Hell* | 2 | 2 |
| Crowley *Book of the Law* I/II/III | 2 | 2 |
| Archived *Liber AL* bookcode I/II/III | 2 | 2 |
| Original LP1 rune-only | — | 2 |

There is **no four-consecutive-field match** across all 21 source/register comparisons. The sole three-field hit is Shakespeare in the GP29 register:

- Unknown LP2 field index: **83** (zero-based).
- Shakespeare source span index: **3142**.
- Matching lengths: **[61,41,71]**.
- Next unknown field length: **312**; next Shakespeare source length: **29**.

The triple therefore fails immediately and is not an extended quotation. All other source/register comparisons have maximum length two. “Maximum two” means no matching triple is present; it does not assert that a matching pair necessarily exists.

## Controls and sensitivity

- **Source-authentic positive control:** p57 PARABLE has derivative dot-run lengths **[7,30,30,28]**. Planting this fixed four-field sequence at unknown field index75 makes the matcher recover all four fields exactly from the known p57 source.
- **Ambiguous-stop sensitivity:** include the single-dot ambiguous event91 as a 139th boundary, producing 140 fields. The maximum remains three: the same Shakespeare GP triple moves to unknown field index84. No four-consecutive match appears.

## Decision and limits

Retire an **exact four-or-more-field quotation from these 21 checked-in historical/source controls** as a crib for a length-preserving cipher that leaves the 138 confirmed physical small-full-stop positions and order intact but changes word spacing. The ambiguous-stop classification does not change this finite result. This does not exclude other historical texts, languages, registers, source editions, punctuation movement, insertions/deletions, or a non-quotation plaintext. No unknown plaintext, key or destination is recovered.

The 175-dot derivative-transcription test remains a separate experiment with a different boundary stream; its first 13-rune segment ends at a large mark. Do not conflate its run lengths with these 139 strict fields.

## Reproduction

Run from the repository root:

```bash
node sims/lp2_small_fullstop_source_crib_sft.cjs
```

The dependency-free Node 22 SFT verifies the canonical rune sequence, original-image stop classifications and exclusions, all 139 field lengths, all 21 source/register comparisons, the Shakespeare three-field mismatch, the ambiguous-event sensitivity and the planted p57 positive control.
