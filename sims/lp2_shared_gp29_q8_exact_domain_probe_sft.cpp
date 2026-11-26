// Agent7: original p54 symbolic exact-domain probe; no p55 input or fit.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_moment_completion_sft.cpp"

int edgeCode(GEdge e){return (e.c*N+e.p)*Q+e.j;}
bool edgeLess(const GOption&a,const GOption&b){
 int n=min(a.n,b.n);
 for(int i=0;i<n;i++){int x=edgeCode(a.e[i]),y=edgeCode(b.e[i]);if(x!=y)return x<y;}
 return a.n<b.n;
}
int lcp(const GOption&a,const GOption&b,int start){
 while(start<min(a.n,b.n)&&edgeCode(a.e[start])==edgeCode(b.e[start]))start++;
 return start;
}
struct ExactResult{
 unordered_set<string> sigs;uint64_t accepted=0,edges=0,copies=0,validCalls=0;
 Graph sample;bool hasSample=false;double ms=0;
 void record(const Graph&g,mt19937&rng){
  validCalls++;if(!g.valid())return;accepted++;
  if(sigs.insert(g.sig()).second){if(!hasSample||rng()%sigs.size()==0){sample=g;hasSample=true;}}
 }
};
ExactResult sequential(const Graph&g,const GDomain&d,const vector<int>&ids,mt19937&rng){
 auto start=Clock::now();ExactResult o;
 for(int id:ids){Graph x=g;o.copies++;const auto&w=d.opts[id];bool ok=true;
  for(int i=0;i<w.n;i++){o.edges++;if(!x.edge(w.e[i])){ok=false;break;}}
  if(ok)o.record(x,rng);
 }
 o.ms=chrono::duration<double,milli>(Clock::now()-start).count();return o;
}
ExactResult radix(const Graph&g,const GDomain&d,vector<int>ids,const vector<int>&rank,mt19937&rng){
 auto start=Clock::now();ExactResult o;
 sort(ids.begin(),ids.end(),[&](int a,int b){return rank[a]<rank[b];});
 auto visit=[&](auto&&self,size_t lo,size_t hi,int depth,const Graph&parent)->void{
  while(lo<hi&&d.opts[ids[lo]].n==depth){o.record(parent,rng);lo++;}
  while(lo<hi){
   const auto&w=d.opts[ids[lo]];int e=edgeCode(w.e[depth]);size_t end=lo+1;
   while(end<hi&&d.opts[ids[end]].n>depth&&edgeCode(d.opts[ids[end]].e[depth])==e)end++;
   int stop=lcp(w,d.opts[ids[end-1]],depth);
   Graph x=parent;o.copies++;bool ok=true;
   for(int j=depth;j<stop;j++){o.edges++;if(!x.edge(w.e[j])){ok=false;break;}}
   if(ok)self(self,lo,end,stop,x);
   lo=end;
  }
 };
 visit(visit,0,ids.size(),0,g);
 o.ms=chrono::duration<double,milli>(Clock::now()-start).count();return o;
}
int main(){try{
 aff::init();fixed::dictionary();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": ["));
 fixed::require(train.size()==48&&join(train).size()==223,"profile");
 GSearch s(train);fixed::require(s.seeds.size()==93,"carry seeds");
 vector<vector<int>> rank(48);
 for(int i=0;i<48;i++){
  vector<int> ids(s.ds[i].opts.size());iota(ids.begin(),ids.end(),0);
  sort(ids.begin(),ids.end(),[&](int a,int b){return edgeLess(s.ds[i].opts[a],s.ds[i].opts[b]);});
  rank[i].resize(ids.size());for(size_t j=0;j<ids.size();j++)rank[i][ids[j]]=j;
 }
 mt19937 rng(7301);int states=0,cases=0,mrvChange=0,zeroExact=0,zeroRelaxed=0;
 uint64_t relax=0,accept=0,unique=0,edgesA=0,edgesB=0,copiesA=0,copiesB=0;double msA=0,msB=0;
 ostringstream json;json<<"{\"schema\":\"agent7-exact-symbolic-domain-probe-v1\",\"rows\":[";bool comma=false;
 for(int seed:{0,4,8,12,17,22,26,31,42,56,71,92}){
  Graph g=s.seeds[seed];vector<int> rem=s.order;
  for(int depth=0;depth<4;depth++){
   GFilter f(g);if(f.saturated)break;states++;
   int relaxedPick=-1,exactPick=-1;size_t minRelax=SIZE_MAX,minExact=SIZE_MAX;Graph next;bool nextValid=false;
   for(int i=0;i<min<int>(5,rem.size());i++){
    int id=rem[i];GStats gs;auto ids=s.domain(id,f,SIZE_MAX,gs);
    ExactResult a,b;
    if(cases%2){b=radix(g,s.ds[id],ids,rank[id],rng);a=sequential(g,s.ds[id],ids,rng);}
    else{a=sequential(g,s.ds[id],ids,rng);b=radix(g,s.ds[id],ids,rank[id],rng);}
    fixed::require(a.sigs==b.sigs&&a.accepted==b.accepted,"radix changed exact domain");
    size_t count=a.sigs.size();cases++;relax+=ids.size();accept+=a.accepted;unique+=count;
    edgesA+=a.edges;edgesB+=b.edges;copiesA+=a.copies;copiesB+=b.copies;msA+=a.ms;msB+=b.ms;
    if(ids.empty())zeroRelaxed++;if(!count)zeroExact++;
    if(ids.size()<minRelax){minRelax=ids.size();relaxedPick=id;}
    if(count<minExact){minExact=count;exactPick=id;nextValid=a.hasSample;if(nextValid)next=a.sample;}
    if(comma)json<<",";comma=true;
    json<<"{\"seed\":"<<seed<<",\"depth\":"<<depth<<",\"dimension\":"<<g.dimension()<<",\"key_dimension\":"<<g.k.d<<",\"components\":"<<g.comps<<",\"group\":"<<id<<",\"relaxed\":"<<ids.size()<<",\"exact_options\":"<<a.accepted<<",\"unique\":"<<count<<",\"edges\":["<<a.edges<<","<<b.edges<<"],\"copies\":["<<a.copies<<","<<b.copies<<"],\"ms\":["<<a.ms<<","<<b.ms<<"]}";
   }
   if(relaxedPick!=exactPick)mrvChange++;
   cout<<"PROBE seed="<<seed<<" depth="<<depth<<" d="<<g.k.d<<" comps="<<g.comps<<" relaxed_pick="<<relaxedPick<<":"<<minRelax<<" exact_pick="<<exactPick<<":"<<minExact<<endl;
   if(exactPick<0)break;
   rem.erase(find(rem.begin(),rem.end(),exactPick));
   if(nextValid)g=next; // skip a proved empty group; sample a consistent child otherwise
  }
 }
 cout<<"PROBE TOTAL states="<<states<<" cases="<<cases<<" relaxed="<<relax<<" accepted="<<accept<<" unique="<<unique<<" zero_relaxed="<<zeroRelaxed<<" zero_exact="<<zeroExact<<" mrv_change="<<mrvChange<<" edges="<<edgesA<<"/"<<edgesB<<" copies="<<copiesA<<"/"<<copiesB<<" ms="<<msA<<"/"<<msB<<endl;
 json<<"],\"summary\":{\"states\":"<<states<<",\"cases\":"<<cases<<",\"relaxed\":"<<relax<<",\"accepted\":"<<accept<<",\"unique\":"<<unique<<",\"zero_relaxed\":"<<zeroRelaxed<<",\"zero_exact\":"<<zeroExact<<",\"mrv_change\":"<<mrvChange<<",\"edges\":["<<edgesA<<","<<edgesB<<"],\"copies\":["<<copiesA<<","<<copiesB<<"],\"ms\":["<<msA<<","<<msB<<"]}}";
 const char*p=getenv("SFT_OUTPUT");if(p&&*p){ofstream o(p);o<<json.str()<<endl;}return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
