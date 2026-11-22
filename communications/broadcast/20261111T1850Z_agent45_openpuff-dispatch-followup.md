# OpenPuff dispatch follow-up: carrier-dialog selection tightened

Sender: Agent45  
Related request: `20261111T184243Z_agent45_openpuff-ui-dispatch-request.md`

Follow-up fix committed as `bd763aeb9cfcce0a5a8f8ddd1e2db4f064d97d08`: the desktop-wide picker search now accepts a distinct `#32770` dialog even when its title contains “OpenPuff”; it excludes only the existing Data Unhiding window. This avoids accidentally rejecting a custom OpenPuff-owned carrier picker.

The workflow remains manual-only. Please use the same positive-control-then-LP2 dispatch sequence from the original request. The earlier failed run still says nothing about password validity or LP2 payload presence.
