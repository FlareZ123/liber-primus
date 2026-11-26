# 2016 InfoTomb companion objects: public-source acquisition decision (#2904)

No distinct companion bytes, authenticated instruction, key or LP2 receiver have been recovered. The original image and signed payload remain the only acquired author-linked objects. This is a bounded public-mirror negative, not a complete archive absence result.

## Source premise and exact distinction

The existing [original host response record](../resources/historical/cicada2016-4gq25.md) establishes that the Jan 9 2016 response had a 99-byte server-generated preamble naming three temporary objects, followed by the canonical JPEG. The literal names in the preserved bytes have no initial slash. The Jan 16 capture omits the preamble and contains the same JPEG. Neither capture authenticates the preamble as Cicada instructions. The April 12 public 4gq25.txt capture contains only a service-suspension message. These facts are inherited; the original JPEG was not downloaded or re-extracted in this assignment.

## Exact public mirror search

On 26 Nov 2026, enumerated the complete recursive Git trees below (all returned truncated=false). Filter: case-insensitive pathname substring 208771; also 4gq25 for an acquisition-positive control. No 208771 path in any complete tree. Every tree returned at least one known 4gq25 item.

| Public repository | Tree SHA | Entries |
|---|---|---:|
| micheloosterhof/cicada-2016 | 187ae28d21a7e42a14637bf95b77286a2193a1b8 | 4 |
| scream314/cicada3301 | 10733feb487bb8beb9966d534727ee5897aa54fc | 445 |
| cijhho123/cicada3301 | d360ad97d39c4719e42dc88b0cbbb81ed54aa02c | 1452 |
| cicada-solvers/The-Complete-Cicada3301-Archive | c3127e0e9eb5afbb582d37988d6369fe38429238 | 1455 |
| mrroot01011001/Cicada-3301- | 1ccf9583b7064ffd6feb52a49442311048295b41 | 4514 |
| iBotPeaches/cicada_3301 | 08a386a02570359c30eab8e5029d0b334178cdb1 | 414 |
| cicada-solvers/documenting-cicada3301-scream314 | 53e4282d89229b98212ef4f2349310fab6c43532 | 445 |
| Dukotah/cicada3301 | fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb | 7096 |

Reproduction: GitHub GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1, compare path substrings and truncated flag. This is a filename inventory only, not a byte search through unnamed archives; forks and aggregations are not independent observations. The public iBotPeaches original archive contains only the known image at its preserved tweet path. Dukotah has the known OutGuess extraction and two Imgur CDX records for the image name. Public search for exact strings "208771_text" + "infotomb", "208771.thumb.jpg" + "infotomb", and "208771" + "4gq25.jpg" returned no matching companion evidence. No direct request to server-side private temporary paths or unrelated identifier enumeration was performed.

## Remaining blocker and decision

Public Wayback CDX request for the known public stem infotomb.com/4gq25* returned an explicit tool access error. No successful complete CDX enumeration is claimed. The strongest rival remains ordinary transient server-side image-processing files; the presence of filesystem names does not establish public URLs or an extra author message. Even recovering an ordinary thumbnail would not establish a key without distinct source-selected content. Do not use 208771 numerically or re-extract the known image. Only a genuinely acquired public historical companion or a complete public index decision can advance this issue. Leave #2904 open as incomplete; no new cipher sweep and no change to established results.
