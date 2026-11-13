# LP2 May 2014 release: contemporary recipient testimony and two original ZIP mirror addresses

**13 November 2026, Agent 8. Source-recovered historical constraint, not a cipher solution.** The original May 2014 Freenode log contains original-time participant statements about how LP2 reached solvers. This material is independently preserved outside the project and has now been indexed and context-checked at exact source line positions. It yields two previously unindexed participant-named public archive addresses, and narrows the hypothesis that the May 2 release itself delivered per-recipient cryptographic material.

## Source and bounded recovery

The byte-exact primary source is [`neuroretransmit/cicada` original IRC log](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/irc-logs/%23cicadasolvers.freenode.log), Git blob SHA-1 `bdd277c14f94c34b5ae714cd00c238065beeed4e` (18,487,233 bytes, 239,026 text lines). It is an independently archived participant conversation, **not** an authenticated Cicada message. Original byte identity is asserted in the [Node 22 read-only source miner](../sims/lp2_2014_irc_clue_miner.cjs). Its [successful manual GitHub Actions run 43348103775](https://github.com/FlareZ123/liber-primus/actions/runs/43348103775) has a downloadable ZIP with all 2014 keyword excerpts plus unfiltered context windows and their source line numbers.

| UTC logfile timestamp | Original line | Original participant statement, abbreviated | Specific inference |
| --- | ---: | --- | --- |
| 2014-05-02 14:46 | 163729–163739 | Participants circulate the clear-signed release and explicitly ask whether the signature is authentic | Contemporary release envelope; not a new decryption key |
| 2014-05-02 14:53 | **163741** | `cluosh` posts **`https://shadow-code.org/onion7.zip`** | Exact historical public mirror file/path |
| 2014-05-02 14:59 | 163775 | `strange_tcyborg` reports `thttpd/2.25b` for onion7 | Unverified contemporary server observation, potentially useful if authentic response headers ever surface |
| 2014-05-02 18:50 | **164043–164049** | `cluosh` says Cicada uploaded a message to their Tor hidden services and that the resulting onion contains the pages | The onion address served as the common LP2 release destination |
| 2014-05-02 19:24 | **164118** | `cluosh`: `onion7 is missing 0.jpg, i can update it` | The earliest third-party ZIP mirror was incomplete; do not mistake mirror absence for an original omitted page |
| 2014-05-03 04:07–04:08 | **164765–164778** | `Surtri` says they personally received *the exact same message* as the public wiki and that the onion appeared the same for everyone | Weakens a per-recipient LP2 release-key model for these observed uploads |
| 2014-05-08 23:42–23:43 | 172123–172126 | `Surtri` describes earlier individualized puzzle instructions: each participant hosted a Tor service with their public PGP key for delivery | Source-visible distinction between the earlier individual eligibility stage and the May common LP2 release |
| 2014-05-09 00:56 | **172320** | `Nessun0` posts **`http://terrafant.asia/cicada/onion7.zip`** | Second exact historical public mirror file/path |
| 2014-05-11 21:35–21:38 | **174444–174458** | `sol1ton` reports discovering an upload after vacation, finding the same pages via mirrors and discussing base60 and the public decode status | Confirms late retrieval of this release; supplies no claimed unique key |

**Original-user-claim limits.** `Surtri` reports the exact same *signed message* and same onion as other users. This neither verifies that every server response was identical nor rules out other private materials from previous Cicada stages. A May 2014 statement that somebody "found the key" is insufficient to override the original ciphertext test. The context window at original L216040, for example, reveals an explicitly acknowledged joke. The allegedly general June 11 decipherment claim at L198135 produces a small `IT'S`/`LESS` shift conjecture in its immediate context, with no original full-page plaintext.

## Exact public mirror retrieval decision

A separate [read-only archive recovery SFT](../sims/lp2_2014_original_zip_mirror_recovery.cjs), [successful GitHub Actions run 43348716552](https://github.com/FlareZ123/liber-primus/actions/runs/43348716552), queried only the **two original source-named ZIP URLs**, without guessing a changed hostname or filename. It checked `web.archive.org` CDX and Arquivo.pt indexes over 2014–2026 and attempted replay only for exact HTTP 200 source records.

- The Wayback `www.sapo.pt` index control returned HTTP 200 and nonempty 17,962-byte results, demonstrating that the Wayback CDX was operational for that control.
- Both original mirror ZIP URLs returned **zero exact Wayback HTTP-200 index rows** under the two fixed queries.
- Arquivo.pt returned empty bodies for both archive queries; the control for `www.sapo.pt` failed transport. Therefore **Arquivo.pt coverage is inconclusive**. Wayback exclusion is limited to the two exact URL schemes and this CDX query; archived HTTP counterparts, further host variants or private preservation are not covered.

Neither archive returned the ZIP bytes. There is **no new extra page, extracted payload, authentic LP2 key, original unknown plaintext or destination**. The strongest follow-up is a *new actual surviving byte-preserving May 2014 mirror archive*, especially one whose ZIP members can be compared against the known 58 original images, the signed release file, and index HTML. Re-running broad URL guesswork is a weak use of compute.

## Cryptanalytic consequence

The original release already supplies a publicly shared `message.txt.asc`, an onion address and 58 images in established archives. This contemporary witness supports that reading and reveals two **specific** additional transport artifacts, rather than a new private per-user decryption pad. A putative personalized May release key now requires an actual recovered *different* recipient message, with original bytes and a verifiable cipher relationship. Without such an object, use the author-selected original page clues or an independent period-authenticated key source to justify any new LP2 inverse.

Avoid promoting coincidental excerpts, unsourced modern claims or original participant speculation into `results/README.md`. This report is an intermediate historical constraint with a decisive retrieval outcome.
