# Stage11 RFCÆ: exact extraction, nonunique document and unsupported address grammar

**Director #2949 / Agent4, 26 November 2026. Decision: retire this as a source-selected route to RFC 5242; retain the four-rune observation as conditional.** No unknown plaintext or key recovered. The independent new discriminant is that multiple pre-2014 RFCs explicitly name Æ, including one directly concerning the HTML carrier. This is not a further cipher-receiver sweep.

## Complete numeric-field counterfactual

The archived [Stage11 HTML](../resources/historical/stage11-2014-index.html) has title 133, div ID 331 and exactly 58 sequential image labels 0–57. Its [signed handoff](../resources/historical/cicada2014-stage11-message.asc) announces the release and signs off with 3301, without an address/radix rule. The [cuneiform audit](lp2-p33-p39-cuneiform-glyph-source-audit.md) reads the glyph groups as (17,13) and (55,1); the same header image is reused across p34–39, with p33 at the footer. It does not establish an indexing instruction. Reuse that source reading rather than repeating pixel adjudication.

The executed bounded retrospective matrix compares radix 60 with decimal group splits 100 and 10, zero/one-based page and rune positions, and forward/reverse rune order, on the [canonical corpus](../resources/liber-primus/lp2-corpus.json). Only one of 24 rows spells R F C AE; 16 rows give four in-range runes. This is a sensitivity analysis, not a significance test or a claim all conventions are equally plausible. The source directly selects zero-based LP2 page labels (the combined archive's +17 offset is a mirror convention); it does not select zero-based rune positions.

| Radix | Page origin | Rune origin | Direction | Four runes | In-range filenames |
|---:|---:|---:|---|---|---:|
|60|0|0|forward|R F C AE|58|
|60|0|0|reverse|B J A E|58|
|60|0|1|forward|EA NG M NG|57|
|60|0|1|reverse|J Y OE I|57|
|60|1|0|forward|OE G O M|0|
|60|1|0|reverse|TH E IA G|0|
|60|1|1|forward|IA EA T A|0|
|60|1|1|reverse|U X O Y|0|
|100|0|0|forward|I B Y EO|58|
|100|0|0|reverse|A F D D|58|
|100|0|1|forward|X N TH D|57|
|100|0|1|reverse|H T A B|57|
|100|1|0|forward|U W X TH|0|
|100|1|0|reverse|AE W Y B|0|
|100|1|1|forward|NG EA P L|0|
|100|1|1|reverse|S AE NG EO|0|
|10|0|0|forward|J EO — —|58|
|10|0|0|reverse|I D — —|58|
|10|0|1|forward|F D — —|52|
|10|0|1|reverse|EO B — —|52|
|10|1|0|forward|C TH — —|48|
|10|1|0|reverse|P B — —|48|
|10|1|1|forward|R L — —|43|
|10|1|1|reverse|G EO — —|43|

For the preferred 60/0/0/forward convention, all 58 filename labels map to successive runes of **p0 only**, rather than their own named pages. The signed sign-off 3301 repeats p55 offset1 AE, so it is not an independent prediction. The three actual [Stage10 form](../resources/historical/cicada2014-stage10-original-form.html) records are (order,sum,name) = (5,3301,53301), (7,1033,71033), (5,1033,51033). Applying the same rule gives order outputs M,F,M; sum outputs AE,C,C; the three numeric field names are all outside the page range. No source specifies why the title and id should be coordinates while filenames and the earlier typed fields should not. This is a semantic-role counterexample to universal numeric metadata parsing, not proof that a selective clue is impossible. These controls are complete adjacent-source fields, not magnitude-matched random integers; no p-value is asserted.

## Independent source selectors and stronger rivals

- The [exact organizer book-code reconstructions](cicada-organizer-bookcode-consumption-convention-gate.md) document one-based coordinate systems for 2013 Book of the Law and 2014 Self-Reliance, explicitly typed records and differing character normalization. They do not support a universal zero-based rune clock.
- The [previous Stage11 source gate](2014-stage11-133-331-prime464-original-gate.md) establishes a distinct earlier role for 331: the central cell of the original extracted 7×7 sum-1033 square, requested by the preceding form; 133 reverses its decimal digits. 1033 and 3301 were already typed square sums and special 2013 prime-echo stops. This competes with coordinate semantics without depending on later ciphertext selections.
- RFC 5242 [section 6](https://datatracker.ietf.org/doc/html/rfc5242#section-6) indeed represents U+00E6. It is dated April 1 2008, explicitly informational, and describes a satirical character system. But [RFC 1866 §9.7.2](https://www.rfc-editor.org/rfc/rfc1866.html#section-9.7.2) (1995) specifies both uppercase and lowercase AE ligature HTML entities, directly relevant to the original HTML carrier. [RFC 1345](https://www.rfc-editor.org/rfc/rfc1345.html) (1992) explicitly maps the AE character mnemonic; [RFC 5894](https://www.rfc-editor.org/rfc/rfc5894.html) (2010) discusses U+00E6 in the context of domain names. These are exact counterexamples to selecting RFC 5242 by the fourth rune alone, not proposed puzzle receivers. The alleged port sequence remains subject to #2951; even confirmation requires an independently established port-to-RFC semantics.
- No fifth source number with predeclared expected output is available; repeated 3301 and repeated cuneiform graphics are not holdouts. No independent source-blind human response was obtained.

**Fork:** no unique source-selected rule or prospective prediction. The extracted RFCÆ is reproducible but cannot authenticate an RFC, cipher or key. Do not extend byte permutations: the existing [direct RFC5242 codepoint gate](lp2-rfc5242-256byte-85codepoint-direct-gate.md) fails and was not repeated. Reopen only on a genuinely independent address grammar and prospective output/receiver; an independently authenticated RFC number would be a distinct prerequisite.

## Reproduction

`node sims/lp2_stage11_rfcae_source_selector_sft.cjs` prints the full 24-row control matrix including every filename and all typed Stage10 fields. The identical computational core ran in connected V8; the filesystem Node wrapper was not separately run. [Reproducer](../sims/lp2_stage11_rfcae_source_selector_sft.cjs), commit 55ac6d90deb49f20f3342ed55f36d752b989c2e9.
