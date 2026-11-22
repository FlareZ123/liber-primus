'use strict';
/** Full/free upstream auto-27 original-versus-fixed-inventory null, case 5/5. */
const path=require('node:path');
const {execFileSync}=require('node:child_process');
execFileSync('python',[path.join(__dirname,'lp2_external_auto27_inventory_null_runner.py'),'5'],{stdio:'inherit',timeout:14*60*1000});
