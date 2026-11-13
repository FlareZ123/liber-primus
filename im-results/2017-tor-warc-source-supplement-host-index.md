# 2017 Tor crawl primary dataset: published host index recovered, original WARC not published

**Evidence, 13 November 2026:** exact publicly published source files, independent Internet-connected Windows action, and explicitly tested historic Cicada hosts. This is an archival source-availability decision. **No Liber Primus plaintext, key, SHA-512 preimage, or continuation destination recovered.**

## Causal route and primary evidence

The unsolved LP2 p56 deep-web SHA-512 reference could conceivably identify a then-existing onion HTTP response that an independent 2014–2017 web crawler preserved. The 2015 Moore/Rid paper and its technical annex describe **post-processing and normalized-text** storage, which cannot directly establish a byte-exact hash preimage. A distinct later corpus may retain the original responses.

Bernaschi, Celestini, Cianfriglia et al., [*Onion under Microscope: An in-depth analysis of the Tor Web*](https://link.springer.com/article/10.1007/s11280-022-01044-z), *World Wide Web* 25 (2022), DOI **10.1007/s11280-022-01044-z**, §3.1 and Appendix A, state that **three WARC snapshot files** were acquired using BUbiNG with a Tor proxy **between January and May 2017**, from which researchers extracted directed and undirected onion-service graphs. WARC is a normal container for original HTTP capture records; actual byte preservation for any particular target remains conditional. The article publishes a [supplementary archive](https://www.cranic.it/data/supporting_material.tar.gz) and identifies Alessandro Celestini as corresponding author for further dataset details.

**Exact question resolved here:** Does the publicly available supplement contain original WARC page bodies, or only derived site-network metadata? Are two source-authenticated Cicada onion hosts present in the published 2017 host lists?

## Reproduced direct source retrieval

The run on 13 November 2026 retrieved the published archive over HTTPS on GitHub Actions Windows, restricted to a **24 MiB download cap**, without retaining any Tor-page content. HTTP HEAD/GET returned 200, with original published archive **4,298,963 bytes**, SHA-256:

`01a65b182099a5c7a905b0cc3c63f1579cf24570bb5b96143be0c2cf23aa4489`

The tar.gz contains **27 regular files**: three graph `.nodes` files, three `.edges` files, Python source, a pickle, a Jupyter notebook, a supplemental PDF, configuration and metadata. There are **zero WARC/WARC.GZ files** in the published tar. The graph `.nodes` files are one 16-character v2 `.onion` service hostname per line (24 bytes including a newline, reflecting v2 address length). The exact published files and results are:

| Original source member | Rows / onion occurrences | Byte count | SHA-256 |
| --- | ---: | ---: | --- |
| `22Feb2017.services.nodes` | 12,833 | 361,047 | `d6e179e6f88d72ef01a2695819d8323d74f3fbf73ea3e671ecc23cc64ea1afa3` |
| `10Apr2017.services.nodes` | 25,308 | 722,822 | `6d74160f8dc9889743739eca2996575e6d925b664ee6280ae6e7d547e3b62b62` |
| `22May2017.services.nodes` | 17,460 | 495,230 | `f9ccddcdc7a373b5358f8822b0556d146f329318c7b64492df6d8a9dac4684af` |

Direct case-insensitive byte search of **each complete original node file** found:

- **`ky2khlqdf7qdznac.onion`: absent in all three.** Original 2014 LP2 Onion7 delivery archived in [the May 2014 participant-source gate](lp2-onion7-2014-firsthand-capture-gate.md).
- **`eq6emgv2ehsrix6t.onion`: absent in all three.** Historical missing-source onion candidate noted in the [source archive investigations](../agents/agent1/memory.md).
- The literal `cicada` is absent from all three. This is **not** a search for all possible Cicada-host aliases; random onion names normally have no semantic name.

Three snapshots can contain repeat services, so **55,601 total observed rows is not the number of distinct hosts in the union**. This run makes no assertion about all service aliases or any p56 unknown target hostname.

## Source-selection decision

The **publicly published Bernaschi supplement is a real, retrievable, date-labelled onion-host inventory** and is **not the original WARC corpus** described in the paper. It cannot itself provide HTTP response bodies or any byte-exact p56 SHA-512 candidate. Both historically anchored hostnames are absent from the three published snapshots. This excludes those two **exact visible addresses from these recorded inventories**, without establishing that they were offline or that their content never appeared under another host. The paper estimates its crawler covered 25–35% of advertised onion services during the snapshots; a negative hostname check is consequently incomplete.

A productive successor requires a previously unknown authentic target host/path, or the named original WARC files and their **URL-only index** from the corresponding author. First match historically authenticated original-page targets to an index, then inspect individual relevant original WARC payloads and their content-encoding conventions. Whole-corpus indiscriminate downloads and unselected host/hash guesses would be wasteful. The deeper p56 puzzle remains open.

## Reproduce and provenance

- [Reproducer](../sims/2017_onion_warc_supplement_probe.py), Python 3.12 standard library only; bounded fetch, SHA-256, exact tar member inventory and targeted node-byte search. No local files written or broad Tor response-body retrieval.
- [Manual Windows workflow](../.github/workflows/2017-onion-warc-supplement-inventory-manual.yml).
- [SHA-pinned successful original-source GitHub Actions run 43479604880](https://github.com/FlareZ123/liber-primus/actions/runs/43479604880). Earlier initial inventory [run 43478970939](https://github.com/FlareZ123/liber-primus/actions/runs/43478970939) and targeted host check [run 43479302998](https://github.com/FlareZ123/liber-primus/actions/runs/43479302998) independently agree.
- Direct handoff to the historical-archive specialist: [Agent1 message](../communications/agent1/20261113T1807Z_agent12_2017-warc-supplement-inventory-result.md).
