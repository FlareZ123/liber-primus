# Original May 2014 LP2 p55 eyewitness proposals: prime-cursor continuation and two 13-rune cribs

**Status, Agent 20, 14 November 2026:** contemporaneous 2014 eyewitness hypotheses recovered from exact archived community logs and tested against source-original p55. **Neither the proposed p56→p55 consecutive-prime-totient continuation nor either original community crib under that same cipher family can recover p55 plaintext.** The 13/6/4-runic phrases remain historically recorded guesses, with no author-signed endorsement or authentic plaintext.

## Previously available evidence, and why one new test was justified

The first-hand archived [2014 Freenode logs](../resources/external/2014-cicadasolvers-freenode-log-corpus.md) are recovered original Git blobs from [`neuroretransmit/cicada` pinned at `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs). The primary `#cicadasolvers.freenode.log` is 18,487,233 bytes, Git blob SHA-1 `bdd277c14f94c34b5ae714cd00c238065beeed4e`. Its 2014 record is a dated human-conversation witness, **not** an authenticated Cicada author instruction. The file and two companion log files were independently fetched and blob-hash verified by [the targeted original-period witness inventory](../sims/lp2_2014_irc_p55_original_keywitness_sft.cjs), [successful Windows Node22 run43652620838](https://github.com/FlareZ123/liber-primus/actions/runs/43652620838).

In the primary log on **19 May 2014, 02:37**, `<Ammar__>` writes:

> Try this the last prime used on 56 the one after starts on page 55

This is a fully motivated, period-era hypothesis: the p56 prime-totient decipherment had just been publicly recovered on 19 May and was already being discussed in that channel. It asks for **one concrete cipher-family continuation**. The source selector is a real *participant* statement, although no Cicada signature or result attaches to the conjecture. Unlike broad phase sweeps, the exact p56 clock makes an original-input test possible.

## Historical original p56→p55 prime stream is impossible with authentic F rule

The authentic solved p56 has **85** original GP29 ciphertext runes, including **one** actual literal-plaintext-F interrupt at p56 position56. Its consecutive-prime-totient decoder consumes exactly **84** prime keys, beginning with prime2. This is reproduced via the repository's independent [authentic original solved-page regression](../sims/authentic_decryption_regression.cjs), which matches the complete known English p56 plaintext.

An exact **continue-that-prime-cursor** rule starts original p55 at the **85th prime439** (zero-based prime index84). The known historical encoder emits every plaintext **F as ciphertext F unchanged**, consuming no prime. Ciphertext F may alternatively be an enciphered non-F. Therefore invert every original p55 runic position using

\[
P_i=C_i-\big(p_{k_i}-1\big)\pmod {29},
\]

and branch exhaustively on all ciphertext-F interrupter possibilities. At any non-F ciphertext position, a calculated plaintext F is a contradiction: the authentic encoder would have emitted literal F without consuming a key, which is not the observed non-F original glyph.

The original p55 first eight GP glyph labels are `NG AE M I W S B X`. At zero-based position **7**, the next prime is **479**. Since \((479-1) mod 29=14\), and the ciphertext glyph **X** has index14, the proposed inverse forces **plaintext F** at ciphertext **X**. Thus this **complete** prime-cursor model is algebraically impossible after just eight original glyphs, with no language score or unknown plaintext assumption.

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

- **20 May 2014, 21:19 and22:29**, participant `<silence_>` proposes original p55 **word #7 (13 runes)** might be **MULTIBRANCHED**, citing the visible dendrite/tree.
- **21 May 2014, 18:09**, `<amone>` suggests that if the 13-rune word is **ENLIGHTENMENT**, its next two words might read **AWAITS THOSE**.
- **19 May 2014, 20:50**, `<Mothwing>` describes p55 artwork as a cicada, saplings and a tree/dendrite. This describes the visible motif and provides context for the hypotheses.

In the exact canonical source p55 page, **page-local word indices 7–9** have lengths **13,6,4 GP29 runes**, totaling23. GP29 transliteration exactly preserves all four proposed words at their expected rune lengths:

| Proposed 2014 source-language guess | Original GP29 rune lengths | Conditional key residues 28 at local positions |
| --- | --- | --- |
| `ENLIGHTENMENT AWAITS THOSE` | **13,6,4** | **0,15** |
| `MULTIBRANCHED AWAITS THOSE` | **13,6,4** | **15** |

The text **MULTIBRANCHED AWAITS THOSE** is a combined analytical control: the original participant proposed *MULTIBRANCHED* separately, while another proposed *AWAITS THOSE* after **ENLIGHTENMENT**. **No 2014 participant authenticated this combined sentence.** Both candidate phrases are unverified cribs. Their original ciphertext word union is the unchanged **23-rune** string `BEAFXIMUCPHNGLEOMSDIAPFBHEOC` and includes ciphertext F at local offsets2 and18.

One exact useful exclusion applies independently of the previous p56→p55 cursor: for any GP plaintext candidate P encoded with consecutive primes via \(C=P+\phi(p) mod 29\), a required key residue **28** can occur only where the prime \(p=29\), since \(\phi(p)=p-1\) and \(p-1=28 mod 29\Rightarrow p=0 mod 29\), so prime \(p\) must equal29. The prime29 appears **only once** in the entire forward consecutive-prime key schedule, at **zero-based ordinal9**. Any demanded 28 at local phrase index15 is impossible for **every nonnegative starting prime ordinal**, as the 16th consumed prime cannot be earlier than ordinal15. Both candidate phrases demand 28 at that local position, so **both cannot be p55 plaintext under a forward prime-totient cipher from any starting offset**. `ENLIGHTENMENT ...` independently demands two separate 28 residues, impossible under any consecutive-prime sequence even if negative or backwards indices were considered. Neither candidate has a literal plaintext F, so p56's special plaintext-F clock rule cannot skip either local position.

This is a mathematical exclusion of **the conditional historical phrase-and-specific-cipher pairs**, without implying the guesses are false plaintext under other key systems. The 13-rune visual word could encode any other word of the same GP length, or use the text lengths only as cipher structure.

## Another explicit 2014 p55 operator: Jordan's second totient

**Context recovered from the original *preceding* 20 May2014 discussion, before the 21 May question:** at precise IRC source line **183940** (20 May22:29), `<mdzhb>` already specifies **“jordan totient of the prime series”** and says it “doesnt work either”; line **183942** defines the **k-parameter as `57-page`**; line **183953** explains **“J_0(n) for p57, J_1(n) for p56, etc.”**; lines **183955/183957** explicitly identify Jordan totient and `n` as the prime series. Thus the historical *community* source actually selects **both the prime-number input and the page-dependent Jordan degree**: p57→J₀, p56→J₁=Euler φ, p55→J₂. This removes the uncertain input-family selector in the May21 quotation and makes the source-era proposed model more specific. It remains only a community conjecture, with no Cicada signature and a contemporaneous participant's own failure observation. The source did not resolve F interruption semantics, prime restart vs carry-forward, or the original p55 word continuation, and our frozen 12-case test addresses those natural alternatives.



The exact **21 May 2014, 18:17** archived `#cicadasolvers` line under `<BlueFox>` revisits the preceding **20 May** degree-by-page Jordan hypothesis for p55. Neither intervention is a 3301-authenticated instruction. For a prime `p`, the standard Jordan totient `J_2(p)=p²−1`. The closest low-complexity analogy to solved p56 is therefore to replace its `φ(p)=p−1` additive key by `J_2(p) mod 29` while keeping consecutive primes, the literal-plaintext-F nonconsuming rule, and the genuine GP29 alphabet.

The **primary source context is exact**, recovered by [a four-conversation original-Git-blob witness SFT](../sims/lp2_2014_p55_firsthand_context_sft.cjs), [successful Windows Node22 run43654203405](https://github.com/FlareZ123/liber-primus/actions/runs/43654203405). The relevant primary lines include **183940** (prime-series Jordan method), **183942** (degree/page mapping), **183953/183955/183957** (J₀/J₁/J₂ and n=prime series), and **185049** (p55 follow-up). A separate period participant thought the idea had failed already on 20 May. This gives a historically specific community hypothesis to adjudicate, while preserving its non-authorial status.

The original-source test fixes prime starts **0/84/85** (restart at prime2, true p56-84-key continuation at prime439, or naïve p56-85-glyph continuation at prime443), tests exact physical p55 **all76 or body75 excluding incoming p54 carry**, and both simple additive signs. Exactly **12** source-motivated finite cases; no fitted prime phase, seed, key or language model.

| First prime index | All76: minus / plus first contradiction | Body75: minus / plus first contradiction |
| --- | --- | --- |
| **0** | p55 index **56 / 3** | p55 index **56 / 13** |
| **84** | p55 index **12 / 3** | p55 index **11 / one complete formal output** |
| **85** | p55 index **2 / 11** | p55 index **12 / 3** |

Offsets above are original physical page-local **zero-based** glyph positions. Under the **only formally legal** output (body75, prime index84, **plus** inverse), original ciphertext exactly forward-encrypts but recovered GP29 IoC is **0.035315315315**, and its transliteration begins `JATHYDBOEJNGSEOGAEAEFIAWOJEAJYAEE`. This is nonlinguistic and cannot be promoted to plaintext. All other eleven original variants exhaust all legal original F positions and fail the known plaintext-F emission constraint. Every variant has an independently generated original solved-p57 native GP cipher positive control, recovering **76/76** or **75/75** symbols with no exceptions.

**Decision:** The archival Jordan suggestion supplies a *specific testable community cipher family* (prime-series `n` and page-degree `k=57−page`); the correct original p55 Jordan experiment still has no readable GP text, and the community did not supply a valid clock/sign/boundary or author confirmation. No authenticated unknown plaintext. This excludes exactly the fixed three-prime-start/physical-geometry 12-case direct Jordan variant; composite Jordan inputs or independently sourced keys remain outside scope.

[Reproducible original-input CommonJS SFT](../sims/lp2_2014_p55_jordan2_prime_original_sft.cjs) and [passed Windows Node22 run43653912451](https://github.com/FlareZ123/liber-primus/actions/runs/43653912451).

## Historical Jordan sequence reaches physical p54: a pre-F contradiction

**Original-input extension (15 November 2026, Agent27).** The original 20 May 2014 Freenode participant specifically described the page-number degree rule `J_(57−page)(prime)`: p56 has the successfully established Euler totient `J1(p)=p−1`, p55 would use `J2(p)=p²−1`, and the directly preceding **physical p54** therefore predicts `J3(p)=p³−1`. This is a documented contemporary *solver hypothesis*, not a signed Cicada instruction. The p55 `J2` original tests above did not independently assess p54. The fixed adjacent-page extension is a useful way to decide whether the historical conjecture can explain both unknown final pages before adding cipher layers.

Original p54 has **232 GP29 runes**. Its first ciphertext `F` (index0) occurs at **zero-based offset41**. Apply the exact authentic p56 plaintext-F convention: an F passes unchanged and does not advance the key; ordinary plaintext symbols consume consecutive prime keys. On every original non-F ciphertext position before offset41, a demanded plaintext F is **impossible under this encoder**, even before deciding how any later F could be interpreted. For start prime ordinals **0**, **84** (the 85th prime439, continuing the actual 84 p56 consumptions) and **85** (prime443, naïve p56 full-length continuation), grant either ordinary additive sign. The result below uses the actual source GP indices, without language scores, fitting, or candidate skips.

| Starting prime index | Inverse `C−J3`: first impossible local offset, original rune, prime | Inverse `C+J3`: first impossible local offset, original rune, prime |
| --- | --- | --- |
| **0** | **3**, D(index23), prime7; `J3=23` | **2**, NG(index21), prime5; `J3=8` |
| **84** | **7**, I(index10), prime479; `J3=10` | **0**, A(index24), prime439; `J3=5` |
| **85** | **4**, IA(index27), prime463; `J3=27` | **33**, M(index19), prime653; `J3=10` |

Each named shift makes `P=(C ± J3(p)) mod29=0` while the actual original ciphertext is **non-F**. All contradictions fall strictly before the first p54 ciphertext F at41, so exhaustive later F-bypass combinations cannot rescue any of these six predeclared hypotheses. In particular, the + direction with start84 already fails at the giant red opening rune of p54. The same failure applies if reading only p54's black body in these *fixed full-page clock phases*; a fresh key restart at body offset9 is a distinct unsourced proposal.

The [standalone source-exact CommonJS SFT](../sims/lp2_2014_p54_jordan3_prime_source_sft.cjs) asserts the original p54 index and F position, all six exact prime/rune collision certificates, three 232-rune synthetic full-length Jordan-J3 F-interrupted native-GP roundtrips, and authentic solved-p56 first-heading `ANEND` under `J1`. The positive checks establish operational semantics without fitting original ciphertext. [Passing Windows-compatible Node22 Actions run 43656794935](https://github.com/FlareZ123/liber-primus/actions/runs/43656794935).

**Decision:** the actual period-era `J_(57−page)` consecutive-prime continuation cannot directly recover physical p54 under these source-motivated phase starts and either sign. Together with the p55 J2 results above, the historical multi-page Jordan ladder has no usable original-final-chapter decoder. This rejects its literal per-page instance; it does not rule out unseen historical parameters, different number inputs, or a separately authenticated cipher. No new unknown plaintext, key or destination is recovered.

## Decision and reproduction

Four useful future-reader conclusions follow. First, the 2014 contemporaneous suggestion supplies historically real *human* motivation for a forward p56 prime-key continuation, and that exact operation fails algebraically before finishing original p55. Second, the 2014 **13-rune** language guesses and 6/4 continuations genuinely match p55 printed word lengths, but no recovered key supports them. Third, an **all-forward-prime-offset** invariant excludes both specified 23-rune guesses under the exact solved p56 cipher family. Fourth, a direct Jordan J₂ prime variant inspired by a separate May2014 witness yields one mathematically legal but nonlinguistic body75 output out of twelve frozen source variants. **No unknown original LP2 plaintext or authentic key is recovered.**

Retire these precise direct operations. A new attempt needs authenticated key material or an independent creator-supplied instruction identifying a different reversible operation, and should test on unmodified original ciphertext rather than optimize these community guesses.

**Reproducers (Windows Node22 and no dependencies):**
- [Original-period 2014 exact-blob witness source scan](../sims/lp2_2014_irc_p55_original_keywitness_sft.cjs) with [successful run43652620838](https://github.com/FlareZ123/liber-primus/actions/runs/43652620838)
- [Original p55 fully branched prime-continuation inverse](../sims/lp2_2014_p55_prime_cursor_continuation_sft.cjs) with [successful complete four-geometry run43653679078](https://github.com/FlareZ123/liber-primus/actions/runs/43653679078) (the earlier 76-glyph-only positive was [run43653243815](https://github.com/FlareZ123/liber-primus/actions/runs/43653243815))
- [Original23-rune May2014 conditional-crib all-phase arithmetic gate](../sims/lp2_2014_p55_13rune_eyewitness_crib_sft.cjs) with [successful run43653413248](https://github.com/FlareZ123/liber-primus/actions/runs/43653413248)

Original source: `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt` and exact pinned archived 2014 Freenode source log identified above.
