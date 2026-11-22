# 2012 signed ten-number carrier recovery: exact missing set and archive bound

## Decision

The signed 2012 whitespace release names ten numeric JPEG carriers. One numeric carrier is preserved under its original name in a public solver archive. The other **nine original numeric JPEGs are not present in the checked solver repositories or Wayback CDX history as 2012 image captures**.

This is a bounded missing-source result. It does **not** relabel later representative `everywhere.jpg` copies as recovered numeric originals.

## Source-fixed ten-number list

The signed message gives, in order:

```
162667212858
414974253863
598852142735
876873892385
935691396441
316744223127
427566844663
644169769482
889296759263
963846244281
```

Contemporary solver documentation records two URL forms:

```
http://845145127.com/<number>.jpg
http://75.119.203.244/<number>.jpg
```

The domain form is what physical QR posters are documented as using. The IP form was used after the DNS entry disappeared and the whitespace page remained reachable by server IP.

## Preserved numeric original

A public historical solver repository preserves:

```
2012/03.subreddit/04.qr_codes/img/162667212858.jpg
```

Repository metadata:

- size: **28,879 bytes**
- Git blob SHA: `929d078bb4b5202c71f1894123018a639c775b31`
- source repository: `cicada-solvers/optimisticninja_cicada3301`

Its adjacent archived OutGuess extraction contains the signed “twenty-nine volumes” book-code message.

## Exact nine missing numeric carriers

No checked repository contains these as original numeric JPEG blobs:

```
414974253863.jpg
598852142735.jpg
876873892385.jpg
935691396441.jpg
316744223127.jpg
427566844663.jpg
644169769482.jpg
889296759263.jpg
963846244281.jpg
```

The signed second-chance grouping assigns them to two already known payload families:

- twenty-nine-volumes family: `414974253863`, `598852142735`, `316744223127`, `427566844663`, `889296759263` plus preserved `162667212858`
- Agrippa / fading-death family: `876873892385`, `935691396441`, `644169769482`, `963846244281`

Thus the missing carriers do not imply nine unknown plaintext payloads. Contemporary solve records say all ten images delivered one of those two signed book-code messages.

## Wayback bound

The archived CDX census stored in `Dukotah/cicada3301` contains **no 2012 capture of any numeric JPEG path**.

For the nine missing names:

- `414974253863.jpg`: no CDX row
- `598852142735.jpg`: no CDX row
- `644169769482.jpg`: no CDX row
- `963846244281.jpg`: no CDX row
- `316744223127.jpg`: earliest row 2013-05-10, HTTP 404 HTML
- `935691396441.jpg`: earliest row 2013-08-11, HTTP 404 HTML
- `876873892385.jpg`: 2021 redirect HTML
- `427566844663.jpg`: only a 2025 parked-domain HTML response
- `889296759263.jpg`: only a 2026 parked-domain HTML response

Even the preserved `162667212858.jpg` numeric path first appears in CDX in 2018 as HTML from a later domain owner, so Wayback does not authenticate the surviving JPEG.

## Representative carrier aliases are not numeric recovery

Two public archives preserve an `everywhere.jpg` carrier of **28,892 bytes** with Git blob SHA `1de322859575989167a53ceeb00a0177246774b6`. Historical wiki mirrors also show representative “Everywhere - Agrippa” and “Everywhere - Brittanica” files.

These are useful family exemplars, but the surviving repository history does not map the `everywhere.jpg` blob to one of the nine missing 12-digit filenames. Treating it as `876873892385.jpg`, `935691396441.jpg`, or another missing original would be an unsupported rename.

## Independent historical corroboration

Contemporary and near-contemporary solver material agrees on the operational role:

- the ten numbers were JPEG URL names on the Cicada host;
- the images had the same visible “everywhere / 3301” carrier design;
- OutGuess yielded one of two signed book-code messages;
- later second-chance logic grouped the ten numbers by those two message families.

The historical wiki explicitly notes that the 845145127.com archive is partial. Modern mirrors recover the already-known payload text and representative carriers, not the nine original numeric byte streams.

## Consequence for Liber Primus research

The nine JPEG byte streams remain historically missing inputs. Their **semantic payloads are already known**, so recovering them is valuable mainly for artifact-level channels that could depend on carrier bytes, JPEG layout, OutGuess embedding state, or per-file differences.

A successor should reopen this route only after locating a dated repository backup, old local archive, WARC/ARC outside the current CDX census, or a source that explicitly maps a surviving aliased carrier to one of the nine numeric names. Repeating ordinary web filename searches or treating family-equivalent carriers as byte-identical originals does not advance the route.
