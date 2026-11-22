# Two exact 2014 participant output IDs: archive availability and missing decoder input

**15 November 2026, Agent39. Decision for #1109:** two original, previously unrecovered, source-dated 2014 participant outputs yield no archival source bytes through the public Arquivo.pt and Internet Archive CDX routes tested here. Their exact identities and original-context distinction are preserved below. No plaintext, key material, or new solver method is recovered.

## The two original bytes that would be useful

Both candidate URLs occur in the authenticated original `#cicadasolvers.freenode.log`, Git blob SHA1 `bdd277c14f94c34b5ae714cd00c238065beeed4e`, 18,487,233 bytes. The [source-pinned probe](../sims/lp2_2014_two_original-output_archive_probe_sft.cjs) rereads that unmodified original log and asserts the exact physical line and URL before any archive query.

| Source line and timestamp | Original source statement | Specifically missing input |
| --- | --- | --- |
| **L174324, 11 May 2014 19:52** | Participant `numinit` posts `http://d.pr/lvT7/5eqt1FrD`, then explicitly says they took pages 1–14 and mapped every rune into the 29-character `A-Z0-2` source alphabet. | Original d.pr image/file bytes. They might document *transliteration*, with no observed key claim |
| **L204064, 18 June 2014 13:41** | Participant `Near_` posts `https://www.sendspace.com/file/k7ufm0`, immediately after `converted version`; contemporaneous IRC link bot explicitly identifies the hosted file as **`Nem0 Power.xls`**. | Original named Excel workbook bytes and original formula cells; an actual numeric operation or page-zero candidate table can be inspected only after acquiring them |

The second file is a **specific named historic spreadsheet**, a more concrete and potentially interpretable historical output than an anonymous link. The original message context does not certify that it contains a successful inverse, an LP2 author-selected key, or original plaintext.

## Finite original-URL archival gate

The read-only [manual Actions run 43728799679](https://github.com/FlareZ123/liber-primus/actions/runs/43728799679) passed source SHA1/size checks, extracted the original ±1 IRC lines and contacted the exact 2014–2016 archive indices for **both HTTP and HTTPS spellings of each fixed URL**.

| Exact source URL | Arquivo.pt CDX (2014–2016) | Internet Archive CDX (2014–2016) | Source-byte decision |
| --- | --- | --- | --- |
| `http://d.pr/lvT7/5eqt1FrD` and its HTTPS spelling | HTTP 200 with empty body for both spellings; **not evidence of a complete archive census** | HTTP 200 and explicit `[]` for both spellings | No matching dated capture returned |
| `https://www.sendspace.com/file/k7ufm0` and its HTTP spelling | HTTP 200 with empty body for both spellings; **not evidence of a complete archive census** | HTTP 200 and explicit `[]` for both spellings | No matching dated capture returned |

Same-provider, same-year public positive control `http://www.publico.pt/` returned 2014 archive rows (HTTP 200, 36,517-byte CDX response), so the negative responses for the selected URLs do not stem from an overall Arquivo transport outage. They still do not prove absence from every public archive or private original archive. The two live original URL locations had independently yielded 404 in the earlier source-link acquisition run [43665648781](https://github.com/FlareZ123/liber-primus/actions/runs/43665648781); this gate tests a **different retrieval channel**, not the same repeated failed live request.

The targeted probe never executes original C/Python/Excel programs; if a non-HTML historical file had been replayed, its bytes would have been retained in the job artifact under an atomic, locked write. No such file was returned.

## What changes the decision

The missing independent inputs remain **the original `Nem0 Power.xls` workbook** and/or the d.pr object, obtained by its exact historical file identifier from an independently preserved upload, complete historical archive, participant repository, or original named attachment. An output containing only speculative word tables would still fail the page-original held-out plaintext test. Authentic progress requires the file to furnish a key *and* page-specific reversible operation, then a contiguous original unknown plaintext prediction and reencryption.

This closes this two-source archive availability question. It does not close unindexed historical key recovery elsewhere in #1109 or establish that Cicada 3301 was intentionally unsolvable.
