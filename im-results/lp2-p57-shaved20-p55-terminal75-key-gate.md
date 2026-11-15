# PARABLE's twenty stripped word edges versus terminal p55's 75 runes

**Agent24, 15 November 2026. Source-motivated, finite original-cipher negative.** No unknown Liber Primus plaintext, original key or genuine cipher operation is recovered.

## A concrete source-visible operand and recipient

Original solved physical **p57 PARABLE** contains **95 GP29 runes in exactly 20 printed words**. Its authentic clear instruction includes “SHED OUR OWN CIRCUMFERENCES” and “FIND THE DIVINITY WITHIN”. Literally removing one outer rune from the left or right end of **each of the 20 original p57 words** leaves **95−20=75** authentic GP runes. Independently, terminal unknown physical p55 has **76** GP runes. Its first NG continues a word begun on physical p54, leaving **75 source-order runes in 16 complete printed words**. This offers a specific 75→75 source-key transfer rather than fitting a key length to decoded output.

**Crucial missing instruction:** Cicada did not tell solvers to treat p57's remaining runes as a key for p55, did not specify which word end to shed, and did not give a cipher operation. The 20/16 original word counts differ; only the rune totals match. This is a *conditional candidate*, not an authenticated intended path. The earlier terminal 23-dot peeling studies do not select this p57-derived key.

## Exact original tests and independent controls

Freeze (a) p57 source word order, (b) removal of exactly one initial or terminal GP rune from each source word, (c) p55's 75 complete-word runes in original order and (d) zero key phase and no segmentation adjustment. Interpret the key as either GP rune index or GP prime-totient residue modulo29, the latter independently used on solved p56. Apply both direct complete GP29 additive inverses, P[i]=(C[i]±K[i]) mod29, without fitting any key byte, offset, or alphabet. All eight exact original outputs remain nonprose (index-key examples: initial-edge removal minus IoC 0.039639640 and plus 0.034234234; final-edge removal minus 0.033513514 and plus 0.038198198). Original p55 75-rune target IoC is 0.038558559, versus original clear p57 0.062709966. Eight ordinary additive outputs reencrypt 75/75, an implementation check rather than evidence of key identification.

A stronger source-authenticated **conditional failure** tests the *actual p56 cipher rule*: plaintext F emits ciphertext F literally and consumes no key, and a non-F plaintext consumes the next key. Exhaust all key-consumption states at every ciphertext F on the actual original p55 target. The four different source keys become mathematically impossible at target body positions (zero based):

| Source shave | GP index key | GP prime-totient key |
| --- | ---: | ---: |
| One rune from the first edge of each p57 word | 53 | 11 |
| One rune from the last edge of each p57 word | 65 | 2 |

The stated failures concern only the historically supported **subtractive** p56-style transparent-F transfer. A plain-source-key per-rune additive cipher without the bypass has no contradiction, though it produces no English. A distinct p55 cipher could behave differently. The full original 85-rune solved p56 retains its authentic 84-key bypass path in the exact same state sieve; all four source keys independently recover a 75-rune source-native planted p57 plaintext using that rule.

**Decision:** Retire direct p57 shaved-word → p55 additive key transfer and especially the strict original p56-rule transfer. The striking source lengths alone provide no selected mechanism, original plaintext or key. An independently authored alternative operator or verified unexamined p55 text would be required to reopen.

**Reproducer:** sims/lp2_p57_shaved_words_p55_direct_key_sft.cjs, a read-only, dependency-free Node.js22 CommonJS test using the repository's original LP2 transcription and canonical rune corpus. It prints all eight unmodified original-cipher outcomes and complete source-positive checks. **Executed successfully on real original repository data, Windows-latest / Node.js 22**, in [manual SFT run 43688915678](https://github.com/FlareZ123/liber-primus/actions/runs/43688915678), job [132735183198](https://github.com/FlareZ123/liber-primus/actions/runs/43688915678/job/132735183198). All asserted original strict-F contradiction positions and synthetic F-skip plants passed.