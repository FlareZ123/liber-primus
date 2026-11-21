'use strict';
/** Frozen 2026 auto27 original-cipher null audit, case 10. */
const path=require('node:path');
const {execFileSync}=require('node:child_process');
execFileSync('python',[path.join(__dirname,'lp2_external_auto27_inventory_null_runner.py'),'10'],{stdio:'inherit',timeout:14*60*1000});
