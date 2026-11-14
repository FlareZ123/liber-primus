# Original May 2014 LP2 p55 eyewitness proposals: prime-cursor continuation and two 13-rune cribs

**Status, Agent 20, 14 November 2026:** contemporaneous 2014 eyewitness hypotheses recovered from exact archived community logs and tested against source-original p55. **Neither the proposed p56→p55 consecutive-prime-totient continuation nor either original community crib under that same cipher family can recover p55 plaintext.** The 13/6/4-runic phrases remain historically recorded guesses, with no author-signed endorsement or authentic plaintext.

## Previously available evidence, and why one new test was justified

The first-hand archived [2014 Freenode logs](../resources/external/2014-cicadasolvers-freenode-log-corpus.md) are recovered original Git blobs from [\`neuroretransmit/cicada\` pinned at \`ade9a02889ef8acbc8cde8edbfd0a785c369f4c3\`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs). The primary \`#cicadasolvers.freenode.log\` is 18,487,233 bytes, Git blob SHA-1 \`bdd277c14f94c34b5ae714cd00c238065beeed4e\`. Its 2014 record is a dated human-conversation witness, **not** an authenticated Cicada author instruction. The file and two companion log files were independently fetched and blob-hash verified by [the targeted original-period witness inventory](../sims/lp2_2014_irc_p55_original_keywitness_sft.cjs), [successful Windows Node22 run43652620838](https://github.com/FlareZ123/liber-primus/actions/runs/43652620838).

In the primary log on **19 May 2014, 02:37**, \`<Ammar__>\` writes:

> Try this the last prime used on 56 the one after starts on page 55

This is a fully motivated, period-era hypothesis: the p56 prime-totient decipherment had just been publicly recovered on 19 May and was already being discussed in that channel. It asks for **one concrete cipher-family continuation**. The source selector is a real *participant* statement, although no Cicada signature or result attaches to the conjecture. Unlike broad phase sweeps, the exact p56 clock makes an original-input test possible.

## Historical original p56→p55 prime stream is impossible with authentic F rule

The authentic solved p56 has **85** original GP29 ciphertext runes, including **one** actual literal-plaintext-F interrupt at p56 position56. Its consecutive-prime-totient decoder consumes exactly **84** prime keys, beginning with prime2. This is reproduced via the repository's independent [authentic original solved-page regression](../sims/authentic_decryption_regression.cjs), which matches the complete known English p56 plaintext.

An exact **continue-that-prime-cursor** rule starts original p55 at the **85th prime439** (zero-based prime index84). The known historical encoder emits every plaintext **F as ciphertext F unchanged**, consuming no prime. Ciphertext F may alternatively be an enciphered non-F. Therefore invert every original p55 runic position using

\[
P_i=C_i-\big(p_{k_i}-1\big)\pmod {29},
\]

and branch exhaustively on all ciphertext-F interrupter possibilities. At any non-F ciphertext position, a calculated plaintext F is a contradiction: the authentic encoder would have emitted literal F without consuming a key, which is not the observed non-F original glyph.

The original p55 first eight GP glyph labels are \`NG AE M I W S B X\`. At zero-based position **7**, the next prime is **479**. Since \((479-1)\bmod29=14\), and the ciphertext glyph **X** has index14, the proposed inverse forces **plaintext F** at ciphertext **X**. Thus this **complete** prime-cursor model is algebraically impossible after just eight original glyphs, with no language score or unknown plaintext assumption.

A permissive alternative starts at prime-index85 = the **86th prime443**, pretending all 85 p56 glyphs consumed keys (contrary to the actual known solved F bypass). Enumerating all valid p55 F branches likewise yields a contradiction at original p55 index **71**, ciphertext glyph **J**, when the demanded key is prime **911**. The full original p55 contains 76 glyphs and exactly three ciphertext-F sites at indices **15,25,41**; the decoder explores every branch permitted by the authentic emission semantics at these positions. The same original has **75 glyphs in complete words**, with its first one-glyph segment finishing an incoming p54 word. We also tested starting the resumed prime stream at the first complete p55 word by excluding that one-glyph carry. All four source-fixed combinations have **zero complete legal p55 plaintext strings**.

| Proposed prime start | P56 counting convention | First impossible p55 position (zero-based) | Observed ciphertext | Reason |
| --- | --- | ---: | --- | --- |
| **85th prime439** | True p56 84 consumed prime keys | **7** | **X** | prime479 demands plaintext F under a non-F ciphertext |
| **86th prime443** | All85 p56 ciphertext symbols (incorrect bypass) | **71** | **J** | prime911 demands plaintext F under a non-F ciphertext |
| **85th prime439** | True 84 p56 key consumptions; start after one-glyph carry | **19** (body offset18) | **C** | next prime demands plaintext F under a non-F ciphertext |
| **86th prime443** | Counterfactual 85 p56 keys; start after carry | **7** (body offset6) | **X** | next prime demands plaintext F under a non-F ciphertext |

**Positive control**: take 76 genuine solved p57 original GP29 runes, encrypt under the exact p56 prime-totient literal-F rule from either start and independently invert. Both recover **76/76** original p57 GP plaintext runes among the exhaustive legal paths. The authentic full p56 original regression also passes. The negative therefore applies to actual untouched p55 source input, rather than to a broken decoder.

This retires **both chronological consecutive-prime p56→p55 starts under both actual page/body boundaries**, and nothing broader: an entirely different 2014 prime scheme, an author-specified extra key reset or page-specific cipher architecture remains untested. The period witness was a suggestion, not a solved method.

## Archived 13/6/4-word conjectures and an all-starting-prime exclusion

The same May2014 channel records an independently historical, sharply local *plaintext* idea for the p55 large artwork:

- **20 May 2014, 21:19 and22:29**, participant \`<silence_>\` proposes original p55 **word #7 (13 runes)** might be **MULTIBRANCHED**, citing the visible dendrite/tree.
- **21 May 2014, 18:09**, \`<amone>\` suggests that if the 13-rune word is **ENLIGHTENMENT**, its next two words might read **AWAITS THOSE**.
- **19 May 2014, 20:50**, \`<Mothwing>\` describes p55 artwork as a cicada, saplings and a tree/dendrite. This describes the visible motif and provides context for the hypotheses.

In the exact canonical source p55 page, **page-local word indices 7–9** have lengths **13,6,4 GP29 runes**, totaling23. GP29 transliteration exactly preserves all four proposed words at their expected rune lengths:

| Proposed 2014 source-language guess | Original GP29 rune lengths | Conditional key residues 28 at local positions |
| --- | --- | --- |
| \`ENLIGHTENMENT AWAITS THOSE\` | **13,6,4** | **0,15** |
| \`MULTIBRANCHED AWAITS THOSE\` | **13,6,4** | **15** |

The text **MULTIBRANCHED AWAITS THOSE** is a combined analytical control: the original participant proposed *MULTIBRANCHED* separately, while another proposed *AWAITS THOSE* after **ENLIGHTENMENT**. **No 2014 participant authenticated this combined sentence.** Both candidate phrases are unverified cribs. Their original ciphertext word union is the unchanged **23-rune** string \`BEAFXIMUCPHNGLEOMSDIAPFBHEOC\` and includes ciphertext F at local offsets2 and18.

One exact useful exclusion applies independently of the previous p56→p55 cursor: for any GP plaintext candidate P encoded with consecutive primes via \(C=P+\phi(p)\bmod29\), a required key residue **28** can occur only where the prime \(p=29\), since \(\phi(p)=p-1\) and \(p-1=28\bmod29\Rightarrow p=0\bmod29\), so prime \(p\) must equal29. The prime29 appears **only once** in the entire forward consecutive-prime key schedule, at **zero-based ordinal9**. Any demanded 28 at local phrase index15 is impossible for **every nonnegative starting prime ordinal**, as the 16th consumed prime cannot be earlier than ordinal15. Both candidate phrases demand 28 at that local position, so **both cannot be p55 plaintext under a forward prime-totient cipher from any starting offset**. \`ENLIGHTENMENT ...\` independently demands two separate 28 residues, impossible under any consecutive-prime sequence even if negative or backwards indices were considered. Neither candidate has a literal plaintext F, so p56's special plaintext-F clock rule cannot skip either local position.

This is a mathematical exclusion of **the conditional historical phrase-and-specific-cipher pairs**, without implying the guesses are false plaintext under other key systems. The 13-rune visual word could encode any other word of the same GP length, or use the text lengths only as cipher structure.

## Decision and reproduction

Three useful future-reader conclusions follow. First, the 2014 contemporaneous suggestion supplies historically real *human* motivation for a forward p56 prime-key continuation, and that exact operation fails algebraically before finishing original p55. Second, the 2014 **13-rune** language guesses and 6/4 continuations genuinely match p55 printed word lengths, but no recovered key supports them. Third, an **all-forward-prime-offset** invariant excludes both specified 23-rune guesses under the exact solved p56 cipher family. **No unknown original LP2 plaintext or authentic key is recovered.**

Retire these precise direct operations. A new attempt needs authenticated key material or an independent creator-supplied instruction identifying a different reversible operation, and should test on unmodified original ciphertext rather than optimize these community guesses.

**Reproducers (Windows Node22 and no dependencies):**
- [Original-period 2014 exact-blob witness source scan](../sims/lp2_2014_irc_p55_original_keywitness_sft.cjs) with [successful run43652620838](https://github.com/FlareZ123/liber-primus/actions/runs/43652620838)
- [Original p55 fully branched prime-continuation inverse](../sims/lp2_2014_p55_prime_cursor_continuation_sft.cjs) with [successful complete four-geometry run43653679078](https://github.com/FlareZ123/liber-primus/actions/runs/43653679078) (the earlier 76-glyph-only positive was [run43653243815](https://github.com/FlareZ123/liber-primus/actions/runs/43653243815))
- [Original23-rune May2014 conditional-crib all-phase arithmetic gate](../sims/lp2_2014_p55_13rune_eyewitness_crib_sft.cjs) with [successful run43653413248](https://github.com/FlareZ123/liber-primus/actions/runs/43653413248)

Original source: \`resources/liber-primus/lp2-corpus.json\`, \`resources/liber-primus/lp2-transcription.txt\` and exact pinned archived 2014 Freenode source log identified above.
