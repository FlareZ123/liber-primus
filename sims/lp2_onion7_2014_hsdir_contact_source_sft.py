"""Find original relay descriptor contact fields for the six May 11 2014
HSDir addresses selected to hold the signed Cicada book-host descriptor.
This is a public historical record lookup, not evidence the relay retained
hidden-service descriptors. Exact original 2014 consensuses define the six IDs.
"""
from __future__ import annotations

import hashlib
import io
import json
import re
import tarfile
import urllib.request

ARCHIVE = (
    "https://collector.torproject.org/archive/relay-descriptors/"
    "server-descriptors/server-descriptors-2014-05.tar.xz"
)
TARGETS = {
    "241B755F12A4284CCD10300D1002285D0FA6340A": "Troll",
    "24835DBD5492E21F7987DFC3FACB39016BEE59A8": "skagerak",
    "24A490784797C082E98AC878EBCC035DDE600CC0": "mnl",
    "753973FCFFC0724FF79DB1AA0166B0B585B7D4F2": "hamsternator",
    "753FD61F8787EBF780A7C8208B2CBA51FEE8C799": "idideditheconfig",
    "7548AF5FE4B2087BF9123AA4F7E009AE4DF4383A": "umntor",
}


def main() -> None:
    print("Fetching public 2014-05 relay server descriptors", flush=True)
    with urllib.request.urlopen(
        urllib.request.Request(
            ARCHIVE, headers={"User-Agent": "liber-primus-2014-source-relay/1.0"}
        ),
        timeout=180,
    ) as response:
        compressed = response.read()
    print(
        json.dumps(
            {
                "archive_bytes": len(compressed),
                "archive_sha256": hashlib.sha256(compressed).hexdigest(),
            }
        ),
        flush=True,
    )
    found: dict[str, dict[str, object]] = {}
    with tarfile.open(fileobj=io.BytesIO(compressed), mode="r:xz") as archive:
        for member in archive:
            if not member.isfile():
                continue
            fileobj = archive.extractfile(member)
            assert fileobj is not None
            raw = fileobj.read()
            fingerprint_line = re.search(
                rb"(?m)^fingerprint ((?:[A-F0-9]{4} ?){10})$", raw
            )
            if fingerprint_line is None:
                continue
            fingerprint = fingerprint_line.group(1).decode("ascii").replace(" ", "")
            if fingerprint not in TARGETS:
                continue
            published = re.search(
                rb"(?m)^published (\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)$", raw
            )
            if published is None or published.group(1) > b"2014-05-11 20:00:00":
                continue
            # The published contact line may contain individual contact details;
            # do not publish them without a reason, return only presence, digest
            # and on-date public nickname/fingerprint for a targeted archive query.
            contact = re.search(rb"(?m)^contact ([^\r\n]*)$", raw)
            record = {
                "consensus_nickname": TARGETS[fingerprint],
                "fingerprint": fingerprint,
                "published": published.group(1).decode("ascii"),
                "source_member": member.name,
                "source_sha256": hashlib.sha256(raw).hexdigest(),
                "has_contact": contact is not None,
                "contact_sha256": (
                    hashlib.sha256(contact.group(1)).hexdigest()
                    if contact else None
                ),
            }
            existing = found.get(fingerprint)
            if existing is None or str(existing["published"]) < str(record["published"]):
                found[fingerprint] = record
    for identity in sorted(TARGETS):
        record = found.get(identity)
        print(json.dumps(record if record else {
            "fingerprint": identity,
            "consensus_nickname": TARGETS[identity],
            "original_asof_server_descriptor_not_found": True,
        }), flush=True)
    print("matched_asof_may11_20_source_relay_descriptors", len(found), flush=True)


if __name__ == "__main__":
    main()
