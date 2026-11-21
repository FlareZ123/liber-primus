'use strict';

/**
 * LP2 p50 functional-graph chapter connection gate.
 * Every node-to-page assignment is allowed within source-visible chapters.
 * Check if connected chapter components can form a single-edge ordered route.
 * Run: node sims/lp2_parable_p50_chapter_connected_path_sft.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'resources/liber-primus/base60-grid.json'),'utf8'));
const successors=source.byte_rows.flat();
assert.equal(successors.length,256);
assert.ok(successors.every(v=>Number.isInteger(v)&&v>=0&&v<256));

/** @param {number[]} parents @returns {number[][]} */
function reverse(parents){
  const children=Array.from({length:parents.length},()=>[]);
  for(let i=0;i<parents.length;i++)children[parents[i]].push(i);
  return children;
}

/** @param {number} root @param {number[][]} children @returns {number[]} */
function descendants(root,children){
  const seen=new Set([root]),q=[root];
  for(let i=0;i<q.length;i++)for(const child of children[q[i]])
    if(!seen.has(child)){seen.add(child);q.push(child);}
  return q;
}

/**
 * Enumerate connected subtree partitions with prescribed completed-component
 * sizes, leaving one root-connected open component of prescribed size.
 * Each cut can be arbitrarily placed and child order is unrestricted.
 * @param {number} root @param {number[][]} children
 * @param {number[]} target @param {number} openSize
 * @returns {Array<Array<[number,number,number]>>}
 */
function partitions(root,children,target,openSize){
  const all=(1<<target.length)-1,cache=new Map();
  /** @param {number} node */
  function visit(node){
    if(cache.has(node))return cache.get(node);
    /** @type {Map<string,Array<Array<[number,number,number]>>>} */
    let states=new Map([['0:1',[[]]]]);
    for(const child of children[node]){
      const branch=visit(child),next=new Map();
      /** @param {number} mask @param {number} size @param {Array<[number,number,number]>} cuts */
      function add(mask,size,cuts){
        const key=mask+':'+size;
        if(!next.has(key))next.set(key,[]);
        next.get(key).push(cuts);
      }
      for(const [key,leftCases] of states){
        const [mask,size]=key.split(':').map(Number);
        for(const [key2,rightCases] of branch){
          const [mask2,size2]=key2.split(':').map(Number);
          if(mask&mask2)continue;
          const merged=mask|mask2;
          for(const l of leftCases)for(const r of rightCases){
            if(size+size2<=openSize)add(merged,size+size2,[...l,...r]);
            for(let k=0;k<target.length;k++)
              if(!(merged&(1<<k))&&size2===target[k])
                add(merged|(1<<k),size,[...l,...r,[node,child,k]]);
          }
        }
      }
      states=next;
    }
    cache.set(node,states);
    return states;
  }
  return visit(root).get(all+':'+openSize)||[];
}

/**
 * Label every node by chapter after cutting edges. Compute the quotient
 * graph, one edge per inter-chapter source edge.
 * @param {number} root @param {number[][]} children
 * @param {Array<[number,number,number]>} cuts
 */
function quotient(root,children,cuts){
  const cut=new Map(cuts.map(([u,v,k])=>[u+':'+v,k]));
  const group=new Map([[root,7]]),q=[root];
  for(let i=0;i<q.length;i++)for(const child of children[q[i]]){
    assert.ok(!group.has(child),'Only rooted trees are eligible');
    group.set(child,cut.get(q[i]+':'+child)??group.get(q[i]));
    q.push(child);
  }
  const edges=new Set(),degree=Array(9).fill(0),sizes=Array(9).fill(0);
  for(const k of group.values())sizes[k]++;
  for(const node of q)for(const child of children[node]){
    const a=group.get(node),b=group.get(child);
    if(a!==b)edges.add(Math.min(a,b)+':'+Math.max(a,b));
  }
  for(const key of edges){
    const [a,b]=key.split(':').map(Number);
    degree[a]++;degree[b]++;
  }
  return {n:group.size,edges,sizes,maxDegree:Math.max(...degree)};
}

/**
 * Entire graph partition: 50 source nodes before p50, one central root,
 * five after p50. The first seven chapters need 40 left nodes, leaving
 * 10 from the left + central root + 3 from right in chapter p40-53.
 * @param {number[][]} children @param {number} root
 * @param {number} leftRoot @param {number} rightRoot
 */
function evaluate(children,root,leftRoot,rightRoot){
  const chapters=[3,5,7,8,4,6,7,14,2];
  assert.deepEqual(children[root],[leftRoot,rightRoot]);
  assert.equal(descendants(root,children).length,56);
  assert.equal(descendants(leftRoot,children).length,50);
  const right=descendants(rightRoot,children);
  assert.equal(right.length,5);
  const rightCuts=[];
  for(const node of right.slice(1)){
    if(descendants(node,children).length!==2)continue;
    const parent=right.find(p=>children[p].includes(node));
    assert.notEqual(parent,undefined);
    rightCuts.push([parent,node,8]);
  }
  const leftCases=partitions(leftRoot,children,chapters.slice(0,7),10);
  const expected=new Set(Array.from({length:8},(_,i)=>i+':'+(i+1)));
  let n=0,path=0,ordered=0;
  const distinct=new Set(),degrees={};
  for(const rightCut of rightCuts)for(const leftCuts of leftCases){
    n++;
    const cuts=[...leftCuts,rightCut];
    distinct.add(cuts.map(([u,v])=>u+':'+v).sort().join('|'));
    const q=quotient(root,children,cuts);
    assert.equal(q.n,56);
    assert.deepEqual(q.sizes,chapters);
    assert.equal(q.edges.size,8);
    degrees[q.maxDegree]=(degrees[q.maxDegree]??0)+1;
    if(q.maxDegree<=2)path++;
    if([...q.edges].every(key=>expected.has(key)))ordered++;
  }
  return {leftCases:leftCases.length,rightCuts,classified:n,
    distinctPartitions:distinct.size,singleEdgePaths:path,
    orderedChapterPaths:ordered,maxDegreeHistogram:degrees};
}
const originalChildren=reverse(successors);
assert.equal(descendants(205,originalChildren).length,58);
assert.deepEqual(originalChildren[205],[74]);
assert.deepEqual(originalChildren[74],[201]);
const observed=evaluate(originalChildren,201,82,128);
assert.deepEqual(observed,{
  leftCases:32,rightCuts:[[184,109,8]],classified:32,
  distinctPartitions:16,singleEdgePaths:0,orderedChapterPaths:0,
  maxDegreeHistogram:{3:24,4:4,5:4}
});

// Constructive positive control: the identical 50|1|5 layout, organized
// as a genuine path of 56 consecutive pages with all chapter cuts possible.
const synthetic=Array.from({length:56},()=>[]);
for(let i=0;i<50;i++)synthetic[i+1].push(i);
for(let i=51;i<56;i++)synthetic[i-1].push(i);
const positive=evaluate(synthetic,50,49,51);
assert.equal(positive.classified,5040);
assert.equal(positive.orderedChapterPaths,1);
assert.equal(positive.singleEdgePaths,5040);
console.log(JSON.stringify({
  physicalChapterSizes:[3,5,7,8,4,6,7,14,2],
  base60SourceGraph:{root:201,leftSubtree:50,rightSubtree:5},
  observed,positive,
  interpretation:'A strict single-edge connected-chapter reading cannot assign all 56 original pages to the source-selected graph. Nonlocal jumps remain possible.'
},null,2));
console.log('PASS: all original connected partitions and a true positive chapter path');
