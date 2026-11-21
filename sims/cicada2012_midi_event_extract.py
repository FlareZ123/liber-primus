#!/usr/bin/env python3
"""Export the authenticated Cicada 2012 MIDI note-off (pitch, delta-time) pairs."""
from __future__ import annotations
import hashlib, json, sys
from collections import Counter
from pathlib import Path

def vlq(data, pos, end):
    value = 0
    while pos < end:
        b = data[pos]; pos += 1
        value = (value << 7) | (b & 0x7f)
        if not b & 0x80:
            return value, pos
    raise ValueError("truncated VLQ")

def parse_track(data, start, length, track_index):
    end, pos = start + length, start
    running = None
    tick = 0
    event_index = 0
    note_offs = []
    counts = Counter()
    while pos < end:
        delta, pos = vlq(data, pos, end)
        tick += delta
        if pos >= end:
            break
        first = data[pos]; pos += 1
        if first < 0x80:
            if running is None:
                raise ValueError("data byte without running status")
            status, d1, has_d1 = running, first, True
        else:
            status, d1, has_d1 = first, None, False
            if status < 0xf0:
                running = status
        if status == 0xff:
            running = None
            meta_type = data[pos]; pos += 1
            size, pos = vlq(data, pos, end)
            pos += size
            counts["meta_%02x" % meta_type] += 1
            continue
        if status in (0xf0, 0xf7):
            running = None
            size, pos = vlq(data, pos, end)
            pos += size
            counts["sysex"] += 1
            continue
        command = status & 0xf0
        ndata = 1 if command in (0xc0, 0xd0) else 2
        if has_d1:
            v1 = d1
            if ndata == 2:
                v2 = data[pos]; pos += 1
            else:
                v2 = None
        else:
            v1 = data[pos]; pos += 1
            if ndata == 2:
                v2 = data[pos]; pos += 1
            else:
                v2 = None
        counts["status_%02x" % command] += 1
        if command == 0x80:
            note_offs.append({
                "event": event_index, "note": int(v1), "delta": int(delta),
                "tick": int(tick), "velocity": int(v2), "sum": int(v1 + delta)
            })
        event_index += 1
    return {"track_index": track_index, "note_offs": note_offs,
            "event_counts": dict(sorted(counts.items()))}, end

def summarize(track, table_bytes):
    events = track["note_offs"]
    pitches = sorted({e["note"] for e in events})
    deltas = sorted({e["delta"] for e in events})
    sums = [e["sum"] for e in events]
    unique_sums = sorted(set(sums))
    pairs = Counter((e["note"], e["delta"]) for e in events)
    # Mirrors the track-index reversal in the archived decode.py.
    decoder_track_num = 1 if track["track_index"] == 0 else 0
    key = "abcdefghijklmnoprstuvwy" if decoder_track_num == 1 else "abcdefghiklmnopqrstuvwxyz"
    decoded = None
    if len(unique_sums) == len(key):
        lookup = dict(zip(unique_sums, key))
        decoded = "".join(lookup[v] for v in sums)
    coord = {
        "row_axis": "ascending MIDI note number",
        "column_axis": "ascending note_off delta-time",
        "pitch_values": pitches,
        "delta_values": deltas,
        "direct_32x8_match": len(pitches) == 32 and len(deltas) == 8,
        "unique_pair_count": len(pairs),
        "repeated_pair_count": sum(n - 1 for n in pairs.values() if n > 1)
    }
    if coord["direct_32x8_match"]:
        pr = {v: i for i, v in enumerate(pitches)}
        dr = {v: i for i, v in enumerate(deltas)}
        cells = [pr[e["note"]] * 8 + dr[e["delta"]] for e in events]
        coord["cell_indices"] = cells
        coord["unique_cell_count"] = len(set(cells))
        if table_bytes is not None and len(table_bytes) == 256:
            coord["table_byte_sequence"] = [table_bytes[i] for i in cells]
            coord["table_byte_mod29_sequence"] = [table_bytes[i] % 29 for i in cells]
    return {
        "track_index": track["track_index"], "decoder_track_num": decoder_track_num,
        "note_off_count": len(events),
        "pitch_min": min(pitches) if pitches else None,
        "pitch_max": max(pitches) if pitches else None,
        "pitch_unique_count": len(pitches),
        "delta_min": min(deltas) if deltas else None,
        "delta_max": max(deltas) if deltas else None,
        "delta_unique_count": len(deltas),
        "sum_min": min(sums) if sums else None,
        "sum_max": max(sums) if sums else None,
        "sum_unique_count": len(unique_sums),
        "sorted_unique_sums": unique_sums,
        "decoded_with_archived_key": decoded,
        "coordinate_hypothesis": coord,
        "note_offs": events
    }

def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: cicada2012_midi_event_extract.py INPUT.mid OUTPUT.json")
    midi_path, output_path = Path(sys.argv[1]), Path(sys.argv[2])
    data = midi_path.read_bytes()
    if data[:4] != b"MThd":
        raise ValueError("not a Standard MIDI File")
    header_len = int.from_bytes(data[4:8], "big")
    if header_len < 6:
        raise ValueError("invalid MIDI header")
    fmt = int.from_bytes(data[8:10], "big")
    ntracks = int.from_bytes(data[10:12], "big")
    division = int.from_bytes(data[12:14], "big")
    table_path = Path("resources/liber-primus/lp2-grid-256.json")
    table_bytes = json.loads(table_path.read_text())["bytes"] if table_path.exists() else None
    pos, tracks = 8 + header_len, []
    for i in range(ntracks):
        if data[pos:pos+4] != b"MTrk":
            raise ValueError("missing MTrk chunk %d" % i)
        length = int.from_bytes(data[pos+4:pos+8], "big")
        track, pos = parse_track(data, pos+8, length, i)
        tracks.append(summarize(track, table_bytes))
    result = {
        "source": "verified embedded literal MIDI in cicada2012-midi-email.asc",
        "midi": {"filename": midi_path.name, "size_bytes": len(data),
                 "sha256": hashlib.sha256(data).hexdigest(), "format": fmt,
                 "track_count": ntracks, "ticks_per_quarter_note": division},
        "table": {"path": str(table_path), "rows": 32, "columns": 8,
                  "bytes": len(table_bytes) if table_bytes is not None else None},
        "tracks": tracks
    }
    output_path.write_text(json.dumps(result, indent=2) + "\n")
    for t in tracks:
        c = t["coordinate_hypothesis"]
        print("track=%d note_offs=%d pitches=%d deltas=%d pairs=%d direct_32x8=%s" %
              (t["track_index"], t["note_off_count"], t["pitch_unique_count"],
               t["delta_unique_count"], c["unique_pair_count"], c["direct_32x8_match"]))
    print("midi_sha256=" + result["midi"]["sha256"])
    print("json=" + str(output_path))

if __name__ == "__main__":
    main()
