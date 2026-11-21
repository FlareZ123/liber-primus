#!/usr/bin/env python3
"""Export authenticated Cicada 2012 MIDI note-off data and test its LP2 table walk."""
from __future__ import annotations
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

BASE60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx"
GP29 = ["F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"]

def vlq(data, pos, end):
    value = 0
    while pos < end:
        b = data[pos]
        pos += 1
        value = (value << 7) | (b & 0x7f)
        if not b & 0x80:
            return value, pos
    raise ValueError("truncated MIDI variable-length quantity")

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
        first = data[pos]
        pos += 1
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
            meta_type = data[pos]
            pos += 1
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
                v2 = data[pos]
                pos += 1
            else:
                v2 = None
        else:
            v1 = data[pos]
            pos += 1
            if ndata == 2:
                v2 = data[pos]
                pos += 1
            else:
                v2 = None
        counts["status_%02x" % command] += 1
        if command == 0x80:
            note_offs.append({
                "event": event_index,
                "note": int(v1),
                "delta": int(delta),
                "tick": int(tick),
                "velocity": int(v2),
                "sum": int(v1 + delta),
            })
        event_index += 1
    return {
        "track_index": track_index,
        "note_off_count": len(note_offs),
        "event_counts": dict(sorted(counts.items())),
        "note_offs": note_offs,
    }, end

def summarize_track(track):
    events = track["note_offs"]
    pitches = sorted({e["note"] for e in events})
    deltas = sorted({e["delta"] for e in events})
    sums = [e["sum"] for e in events]
    unique_sums = sorted(set(sums))
    pairs = Counter((e["note"], e["delta"]) for e in events)

    # The archived decoder's two musical tracks are actual MIDI tracks 1 and 2.
    # Track 0 is the empty tempo/meta track.
    decoder_track_num = {1: 0, 2: 1}.get(track["track_index"])
    key = {0: "abcdefghiklmnopqrstuvwxyz", 1: "abcdefghijklmnoprstuvwy"}.get(decoder_track_num)
    decoded = None
    if key is not None and len(unique_sums) == len(key):
        lookup = dict(zip(unique_sums, key))
        decoded = "".join(lookup[v] for v in sums)

    return {
        "track_index": track["track_index"],
        "decoder_track_num": decoder_track_num,
        "note_off_count": len(events),
        "pitch_values": pitches,
        "pitch_unique_count": len(pitches),
        "delta_values": deltas,
        "delta_unique_count": len(deltas),
        "sum_min": min(sums) if sums else None,
        "sum_max": max(sums) if sums else None,
        "sum_unique_count": len(unique_sums),
        "sorted_unique_sums": unique_sums,
        "unique_note_delta_pairs": len(pairs),
        "decoded_with_archived_key": decoded,
        "note_offs": events,
    }

def walk(events, table_bytes):
    position = 0
    visited = set()
    first_visit = []
    positions = []
    path_bytes = []
    for event in events:
        position = (position + event["sum"]) % 256
        positions.append(position)
        if position not in visited:
            visited.add(position)
            first_visit.append(position)
        if table_bytes is not None:
            path_bytes.append(table_bytes[position])
    missing = sorted(set(range(256)) - visited)
    details = []
    for index in missing:
        value = table_bytes[index] if table_bytes is not None else None
        details.append({
            "index_zero_based": index,
            "row_zero_based": index // 8,
            "column_zero_based": index % 8,
            "byte_value": value,
            "base60_token": BASE60[value // 60] + BASE60[value % 60] if value is not None else None,
            "gp29_residue": value % 29 if value is not None else None,
            "gp29_symbol": GP29[value % 29] if value is not None else None,
        })
    return {
        "event_count": len(events),
        "step_rule": "step = note_off.note + note_off.delta_time",
        "start_index_zero_based": 0,
        "successor_rule": "position = (position + step) mod 256",
        "event_order": "ascending absolute MIDI tick, then original file track index, then event index",
        "total_step_sum": sum(e["sum"] for e in events),
        "total_step_sum_mod256": sum(e["sum"] for e in events) % 256,
        "final_position_zero_based": position,
        "unique_cells_visited": len(visited),
        "missing_cells": missing,
        "missing_cell_details": details,
        "first_visit_order": first_visit,
        "first_visit_table_bytes": [table_bytes[i] for i in first_visit] if table_bytes is not None else None,
        "full_path_table_bytes": path_bytes if table_bytes is not None else None,
        "path_positions": positions,
    }

def build_path(tracks, table_bytes):
    events = []
    for track in tracks:
        for event in track["note_offs"]:
            events.append({**event, "track_index": track["track_index"]})
    chronological = sorted(events, key=lambda e: (e["tick"], e["track_index"], e["event"]))
    reverse_ties = sorted(events, key=lambda e: (e["tick"], -e["track_index"], e["event"]))

    by_tick = defaultdict(list)
    for event in chronological:
        by_tick[event["tick"]].append(event)
    grouped = [
        {"sum": sum(e["sum"] for e in group)}
        for _, group in sorted(by_tick.items())
    ]

    chorus = next((t for t in tracks if t["track_index"] == 2), None)
    chorus_sums = [e["sum"] for e in chorus["note_offs"]] if chorus else []
    repeat_period = None
    if len(chorus_sums) % 3 == 0:
        n = len(chorus_sums) // 3
        if chorus_sums[:n] == chorus_sums[n:2*n] == chorus_sums[2*n:]:
            repeat_period = n

    return {
        "chronological_track_order": walk(chronological, table_bytes),
        "reverse_track_tie_order_sensitivity": walk(reverse_ties, table_bytes),
        "simultaneous_events_combined_sensitivity": walk(grouped, table_bytes),
        "simultaneous_tick_groups": sum(1 for group in by_tick.values() if len(group) > 1),
        "simultaneous_note_off_events": sum(len(group) for group in by_tick.values() if len(group) > 1),
        "track_note_off_counts": {str(t["track_index"]): t["note_off_count"] for t in tracks},
        "track2_exact_threefold_sum_repeat_period": repeat_period,
        "track2_repeat_block_sum_mod256": sum(chorus_sums[:repeat_period]) % 256 if repeat_period else None,
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
        raw_track, pos = parse_track(data, pos+8, length, i)
        tracks.append({**raw_track, **summarize_track(raw_track)})

    result = {
        "source": "verified embedded literal MIDI in cicada2012-midi-email.asc",
        "midi": {
            "filename": midi_path.name,
            "size_bytes": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "format": fmt,
            "track_count": ntracks,
            "ticks_per_quarter_note": division,
        },
        "table": {
            "path": str(table_path),
            "rows": 32,
            "columns": 8,
            "bytes": len(table_bytes) if table_bytes is not None else None,
            "encoding": "two-character base60 token decoded to byte value",
        },
        "tracks": tracks,
        "midi_path_hypothesis": build_path(tracks, table_bytes),
    }
    output_path.write_text(json.dumps(result, indent=2) + "\n")
    for track in tracks:
        print("track=%d note_offs=%d pitches=%d deltas=%d unique_sums=%d decoder_track=%s" %
              (track["track_index"], track["note_off_count"], track["pitch_unique_count"],
               track["delta_unique_count"], track["sum_unique_count"], track["decoder_track_num"]))
    path = result["midi_path_hypothesis"]["chronological_track_order"]
    print("chronological_path unique=%d missing=%s final=%d" %
          (path["unique_cells_visited"], path["missing_cells"], path["final_position_zero_based"]))
    print("midi_sha256=" + result["midi"]["sha256"])
    print("json=" + str(output_path))

if __name__ == "__main__":
    main()
