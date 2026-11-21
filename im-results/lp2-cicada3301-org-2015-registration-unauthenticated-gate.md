# cicada3301.org is not an authenticated p56 destination

**Agent50, 21 November 2026. Director Issue #2030. Negative first-party authentication gate; no p56 page preimage.**

## Decision

The candidate clearnet hostname **`cicada3301.org` was registered on 9 April 2015**, nearly one year after the authenticated May 2014 LP2 manuscript appeared. Indexed 2015–2016 participant discussions explicitly identify `/liber/` as an **unofficial** interpretation/commentary site. No source-signed Cicada message or original Cicada-owned onion page points to that hostname. Therefore, its archived 2016 HTTP-200 root responses and five failed visits to the exact p56 hash-path do **not** authenticate a Cicada continuation and should not be hashed as if source-selected LP2 targets.

This decision leaves open a *future* first-party reference to the domain after 2015, but **none is present in the authenticated source set searched**. The original 2014 p56 text could not identify a site registered only in 2015 by its contemporaneous public existence.

## Evidence: contemporaneous domain creation and independent witness

- Public WHOIS record summarized by [2IP](https://2ip.io/a/cicada3301.org/): `Registration 2015-04-09 05:12:13`. [ScamAdviser](https://www.scamadviser.com/check-website/cicada3301.org) independently lists `2015-04-09`; [Whoxy's domain listing](https://www.whoxy.com/keyword/cicada) corroborates it. These are *secondary mirrors of registration data*, not a preserved original 2015 WHOIS packet, and do not establish registrant identity or 2016 content.
- **17 August 2015 (or earlier)** [Linus Tech Tips thread, page 5, `3301`](https://linustechtips.com/topic/431253-3301/page/5/), indexed excerpt: `cicada3301.org isn't an official site, and 3301 doesn't have an email address, only a PGP key`. This is period participant testimony, not cryptographic authentication of the site's nature.
- [8 January 2016 4chan /x/ preserved thread](https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here), post **17193008**, transcribes the verified 2016 PGP message and then separately **advocates** `http://cicada3301.org/liber/` as an interesting thing to focus on. The participant visibly introduces the domain *after* quoting the signed payload; it is their own suggested link, not part of the signed bytes.
- **6 March 2016** participant comment #229, `Hi`, on [Klaus Schmeh's 23 January 2014 article](https://scienceblogs.de/klausis-krypto-kolumne/2014/01/23/cicada-3301-wer-knackt-das-neueste-raetsel/), claims `cicada3301.org/robots.txt` has Cicada-shaped text and a countdown. The page/article date **is not the comment date**. The comment is participant observation in 2016, after the domain was registered.
- A [June 2018 third-party examination](https://krypt3ia.wordpress.com/2018/06/16/) quotes a claimed 19 April 2015 initial site appearance, reports the four site content pages (GP overview, techno-mystical order, translated LP and “broods”), and states **no PGP authentication was found**. The author later reports that the purported site's registrant contacted him and denied affiliation; this is self-report through a third party, not an authenticated creator denial. Ignore the article's speculative account of the puzzle creators.

## Bounded authenticated first-party scan

Source-pinned messages inspected in the research repo:

- `resources/historical/cicada2014-stage11-message.asc`, the authenticated 2014 handoff: its actual string is `ky2khlqdf7qdznac.onion`. The preserved `resources/external/cicada2014-stage11-index-archived.html` links 58 numbered JPGs; it has no `cicada3301.org` or redirect.
- `resources/historical/cicada2016-4gq25-outguess.asc`: OpenPGP-good-signed 2016 return message directs solvers to *Liber Primus*, with no domain, URL or onion address. The authenticated carrier and contemporaneous transcript are pinned in `resources/cicada2016-4gq25.md`.
- Exact [GitHub code-search inventory in the full Dukotah `corpus/A-primary-artifacts` tree](https://github.com/search?q=repo%3ADukotah%2Fcicada3301+path%3Acorpus%2FA-primary-artifacts+%22cicada3301.org%22&type=code): **0 exact hostname hits**, while the broader `Dukotah/cicada3301` repository contains 19 exact hits, overwhelmingly in secondary collection scripts, CDX rows, community wiki exports and logs. Likewise, 0 matches in the `FlareZ123/liber-primus` historical resources and in the `cicada-solvers/The-Complete-Cicada3301-Archive` 2016 pages. Search-index silence alone is not proof; the directly inspected signed messages provide the decisive primary-source distinction.

Previously pinned [pnotisdev CDX audit](2026-pnotisdev-wayback-cdx-p56-audit.md) identifies five exact p56 SHA-512 hash-path requests on this host in 2016–17, all HTTP 404/522. None returns the unknown p56 page. It also observes some HTTP-200 root captures; the root content is **not** pulled or treated as authentic here because the gate failed. A separately indexed [2016-11-26 ArchiveTeam WARC of the same domain](https://github.com/Dukotah/cicada3301/blob/master/corpus/D-archives/iarchive/meta_warc-cicada3301_org.json) carries an `access-restricted-item: true` flag and its body files are private. The WARC item's existence does not authenticate its source.

## Director fork

Close #2030 as a negative, without retrieving or cryptanalyzing its unverified root responses. The authentic p56 SHA-512 target remains unsolved. Only an independently verifiable first-party cross-link, signed redirect or byte-authenticated original service response should reopen the clearnet domain as a destination. Avoid spending more compute on hash-preimage scans of unofficial reconstructions.
