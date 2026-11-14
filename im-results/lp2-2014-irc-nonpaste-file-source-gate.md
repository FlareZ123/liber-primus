# Two recovered 2014 UnRuneIt solver JARs: original code and source-selected operation

**Agent 8, 14 November 2026, Director #903. Positive historical-source recovery, no new unknown-page plaintext.** An original May 15 and an original May 19 2014 IRC post each identify a distinct Java JAR named UnRuneIt. Both exact 2014 MediaFire IDs **remain live in November 2026**, and both original file names were retrieved and independently byte-verified through separate HTTP and HTTPS MediaFire routes. The six-file historical archive index census was negative because it searched Wayback/Arquivo captures rather than the still-live hosts. This updated report supersedes that preliminary missing-source conclusion.

## Source authentication and full binary identities

The May–August 2014 IRC corpus comprises byte-preserved logs #cicadasolvers (Git blob bdd277c14f94c34b5ae714cd00c238065beeed4e, 74,548 May–Aug lines) and #33012014 (a2880b1db31ce523599ef30ca2e55291bf295900, 2,091 lines). [Exact-source link-mining SFT](../sims/lp2_2014_irc_nonpaste_attachment_sft.cjs); [passing original-byte CI](https://github.com/FlareZ123/liber-primus/actions/runs/43609974310). Of 66 file-link occurrences and 29 context-relevant links, the six original non-Git, non-paste, non-pad candidate objects were frozen before archive queries. The earliest artifacts directly described as solving unknown LP2 runes were two participant Java applications.

| Original IRC message | Original download location | Recovered JAR SHA-256 and bytes |
| --- | --- | --- |
| **15 May 2014, L178610, Ammar__**, announces executable UnRuneIt beta | http://www.mediafire.com/download/uqvlspfs3ny3516/UnRuneIt.jar | **766,148 bytes**, e465e31a5b46dbeeecae337caf1d195b17f6ab7c9596479b56b1f08690a4df16 |
| **19 May 2014, L181191, Ammar__**, posts second Java program | http://www.mediafire.com/download/umlv6bbd54n5w9d/UnRuneIt2.jar | **767,453 bytes**, b4a66f04837c368f04dab2a8573ab1da5d67b978f4cc4709c551f8913c900fb6 |

The [live byte-acquisition SFT](../sims/lp2_2014_irc_nonpaste_live_recovery_sft.cjs) obtains the original MediaFire item page under the historical file ID, extracts its site-supplied direct download link, downloads actual ZIP-signature JAR bytes, and authenticates the exact same SHA-256 on independent HTTP and HTTPS page routes. [Successful JAR acquisition and preserved 7-day workflow artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43611434003). Original byte copies are available within that run's artifact, named agent8-2014-solver-source-bytes-untrusted. Treat these participant-created programs as **untrusted code, not Cicada-authored artifacts**. They were never executed.

## Static recovered-byte decompilation and decisive mechanism

Both original JARs contain ten Java class files plus four bundled libraries: ACM console, JSoup 1.7.3, json-simple 1.1.1 and scraper. Their Eclipse JAR-in-JAR manifest names runApplet as the application entry, with one large application class UnRuneIt.class. A byte-to-byte ZIP inventory shows that **only UnRuneIt.class differs across the two JARs**: version 1 SHA-256 b0ba7495098ab64564efa7d8504a174064fbae0994c79f3e5116ed2b256b2e45, version 2 SHA-256 fd9e5ce267f0ed3c67617597689d48649558d8f5eaf17162858bb41563e87f51. The remaining 14 file entries are byte-for-byte unchanged. The [read-only Python ZIP and Java constant-pool inspector](../sims/lp2_2014_unrunejar_static_sft.py) passed in [original-binary CI 43611718973](https://github.com/FlareZ123/liber-primus/actions/runs/43611718973). No JAR main class was run.

Local read-only javap -c -p inspection of the exact recovered version-2 application bytecode (outside a Java runtime execution) reveals the following mechanism:

1. The application console labels itself as a rune-cipher text brute-force tool, with two user commands: generate wordlists from a word length, and generate phrase lists from a requested sentence-word-length pattern.
2. On entry it demands a user-supplied rune-transliteration string and explicitly asks the operator to **paste N prime integers, one for every rune**. The application does not derive this required prime key stream from the printed LP2 ciphertext.
3. Its decryption method divides the user-entered keys by authentic printed-word rune lengths. Per rune, unShift obtains the input rune's GP alphabet index c and manually computes the new index **p = c − ((inputPrime mod 29) − 1) mod 29**. Thus a prime input gives the same prime-minus-one shift relation as the known p56 prime/totient solution.
4. A variable-rune GP transliteration may produce more than one string for one index, so decipherWord constructs compatible candidate combinations. Its phrase-search operation scans an **independently user-supplied external English corpus** for specified word-length patterns. These are tooling and optional language enumeration, without any embedded new LP2 page key.

The original 2014 program is **real recovered contemporary decryption software**, and its exact source-code mechanism is now independently reconstructible from archived binaries. It does **not** embed a complete cipher key for unsolved p0–55, an unknown-page plaintext passage, a recovered hidden destination or a source-authenticated explanation of how to generate the missing prime input. One may reproduce the solved p56 mechanism with the known prime stream, but that does not establish the same cipher or a key on other pages. The contemporaneous IRC participant's program is an exploratory solver tool, not an author-approved decoding instruction.

## Remaining four original solver-file leads and archive limits

The other four original candidate files in the bounded six-file census remain unacquired:

| Original source line | File and contemporaneous description |
| --- | --- |
| **18 Jun, L203973** | http://terrafant.asia/sheet.ods, Nem0's explicit keystream spreadsheet; the first row initially contains primes |
| **8 May, L171853** | http://onecool.us/runes_by_page.txt, contemporary transcription with reported page0 errors |
| **12 May, L175326** | http://onecool.us/unstructured_runes.txt, a participant-generated rune transcription |
| **2 May, L163745** | https://infotomb.com/p2emj.txt, an early first-page transcription |

The [frozen six-file archive SFT](../sims/lp2_2014_irc_sixfiles_archive_gate.cjs) queried both Wayback and Arquivo.pt CDX over 2014–19 with 12 HTTP-200 index responses and zero exact-path records. [CI results](https://github.com/FlareZ123/liber-primus/actions/runs/43610405847). These indexes missed the demonstrably live MediaFire objects. The [live-host recovery run](https://github.com/FlareZ123/liber-primus/actions/runs/43611434003) failed to connect to the other four original hosts in this environment; their bytes may still survive elsewhere, especially the keystream spreadsheet.

**Decision for #903:** close as a **successful recovery of two concrete original 2014 solver-program files with a finite decoded mechanism**, while explicitly recording that no unknown LP2 plaintext or key was recovered. Avoid further historical URL census. The strongest remaining independent input is the source-dated sheet.ods, which may explain how participants constructed the known p56 prime key. A genuinely new solution requires the source authenticating its own key-generation or a fixed original operator that decrypts contiguous unknown ciphertext and predicts heldout characters without tuning.

All recovered content was inspected statically; the downloaded binary was never executed. The GitHub Actions artifact has temporary retention, whereas the exact original MediaFire IDs, SHA-256 identities, and reproducible acquisition and static-inspection scripts are durably linked above.
