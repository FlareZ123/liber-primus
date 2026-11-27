// Exact forbidden-rank reachability for the continuous fixed-center GP adaptive list
// with literal nonconsuming F holds. Reuses the exact signed polynomial transform.
// Build alongside lp2_recency_allpartition_sft.cpp, C++17 -O3 -march=native -fopenmp.
#define main allpartition_sft_main
#include "lp2_recency_allpartition_sft.cpp"
#undef main
#include <set>
#include <tuple>
struct Step {
  int index, d, t, zeros; Mask older;
  array<Mask,29> olderZero{};
};
struct PublicTrace {
  int n, nt; Mask zeroBit, allBits; vector<int> c,initialOrder;
  vector<Step> steps; vector<int> initialZ;
};
static PublicTrace makeTrace(const vector<int>& c,int n,int start){
  assert(c[start]>0&&n>=3&&n<=29);
  PublicTrace out;out.n=n;out.nt=n-1;out.zeroBit=Mask(1)<<(n-2);out.allBits=(Mask(1)<<(n-1))-1;out.c=c;
  vector<int> order,tok(n,-1);vector<bool> seen(n);set<int> z;
  for(int i=start;i>=0;--i){int a=c[i];if(a==0){z.insert(order.size());continue;}if(!seen[a]){seen[a]=true;order.push_back(a);}if((int)order.size()==n-1)break;}
  assert((int)order.size()==n-1);z.insert(n-1);out.initialZ.assign(z.begin(),z.end());assert(out.initialZ.front()>=1);out.initialOrder=order;
  int center=c[start],k=0;for(int a=1;a<n;++a)if(a!=center)tok[a]=k++;assert(k==n-2);tok[0]=n-2;
  int zeros=0;
  for(int i=start+1;i<(int)c.size();++i){int b=c[i];if(!b){++zeros;continue;}int d=find(order.begin(),order.end(),b)-order.begin();assert(d<n-1);Step s{i,d,(b==center?-1:tok[b]),zeros,0,{}};
    for(int j=d+1;j<n-1;++j){assert(tok[order[j]]>=0);s.older|=Mask(1)<<tok[order[j]];}
    Mask suffix=0;for(int j=n-2;j>=1;--j){suffix|=Mask(1)<<tok[order[j]];s.olderZero[j]=suffix;}
    out.steps.push_back(s);zeros=0;
    if(b!=center){tok[center]=tok[b];tok[b]=-1;center=b;order.erase(order.begin()+d);order.insert(order.begin(),b);}
  }
  // For a forbidden noncenter rank, trailing zeros can all be held and need no test.
  return out;
}
struct State {Mask s,allowed;int z;};
static Mask rankBits(int m){return (Mask(1)<<m)-1;}
static Mask clearRank(Mask a,int j){assert(j>=0&&j<29);return a&~(Mask(1)<<j);}
static State skipStep(State x,const Step& e,Mask zb){
  if(e.t>=0&&(x.s&(Mask(1)<<e.t)))x.allowed=clearRank(x.allowed,pc(x.s&e.older)+((x.s&zb)&&x.z>e.d));
  x.z+=(e.d>=x.z);return x;
}
static State consumeStep(State x,const Step& e,Mask zb,Mask all){
  assert(e.zeros>0);
  if(x.s&zb)x.allowed=clearRank(x.allowed,pc(x.s&e.olderZero[x.z]));
  if(e.t<0){if(x.s&zb)x.allowed=clearRank(x.allowed,pc(x.s&(all^zb)));}
  else {Mask t=Mask(1)<<e.t;if(x.s&t)x.allowed=clearRank(x.allowed,pc(x.s&e.older));if(bool(x.s&t)!=bool(x.s&zb))x.s^=t|zb;}
  x.z=1;return x;
}
static vector<State> mergeStates(vector<State> states){
  sort(states.begin(),states.end(),[](auto a,auto b){return tie(a.s,a.z)<tie(b.s,b.z);});size_t n=0;for(auto s:states)if(s.allowed){if(n&&states[n-1].s==s.s&&states[n-1].z==s.z)states[n-1].allowed|=s.allowed;else states[n++]=s;}states.resize(n);return states;
}
static vector<State> forwardBlocks(const PublicTrace& tr,vector<State> states,size_t at,bool log){
  size_t blocks=0,maxSize=states.size();
  while(at<tr.steps.size()&&!states.empty()){
    size_t end=at+1;while(end<tr.steps.size()&&!tr.steps[end].zeros)++end;
    const auto& first=tr.steps[at];vector<State> next;next.reserve(states.size()*2);
    for(auto s:states){
      State a=skipStep(s,first,tr.zeroBit);for(size_t i=at+1;i<end&&a.allowed;++i)a=skipStep(a,tr.steps[i],tr.zeroBit);if(a.allowed)next.push_back(a);
      if(first.zeros){State b=consumeStep(s,first,tr.zeroBit,tr.allBits);for(size_t i=at+1;i<end&&b.allowed;++i)b=skipStep(b,tr.steps[i],tr.zeroBit);if(b.allowed)next.push_back(b);}
    }
    states=mergeStates(move(next));++blocks;maxSize=max(maxSize,states.size());
    if(log&&(blocks<=12||blocks%20==0||states.empty())){Mask all=0;uint64_t pairs=0;for(auto s:states){all|=s.allowed;pairs+=pc(s.allowed);}cerr<<"block "<<blocks<<" through physical offset "<<tr.steps[end-1].index<<": states="<<states.size()<<" pairs="<<pairs<<" rankmask="<<all<<"\n";}
    at=end;
  }
  if(log)cerr<<"forward blocks="<<blocks<<" max_frontier="<<maxSize<<" final="<<states.size()<<" processed="<<at<<"/"<<tr.steps.size()<<"\n";
  return states;
}
static vector<Event> blockEvents(const PublicTrace& tr,size_t end,int z){
  vector<Event> es;for(size_t i=0;i<end;++i){auto e=tr.steps[i];assert(e.zeros==0);if(e.t>=0)es.push_back({e.t,e.older|(z>e.d?tr.zeroBit:0)});z+=(e.d>=z);}assert(z==tr.n-1);return es;
}
static vector<State> initialBlock(const PublicTrace& tr,size_t end,bool log){
  int low=min(12,tr.nt/2),high=tr.nt-low;const size_t N=size_t(1)<<tr.nt;
  vector<Mask> allowed(N,0);
  // All initial partitions; relative farthest rank 0 is handled by the separate
  // fixed-glyph theorem. Other ranks must survive at least one feasible z path.
  for(int z:tr.initialZ){auto terms=polynomial(blockEvents(tr,end,z));uint64_t live=0,pairs=0;
#pragma omp parallel reduction(+:live,pairs)
    {
      vector<Row> rows(1<<low);
#pragma omp for schedule(static)
      for(int hi=0;hi<(1<<high);++hi){fillrows(rows,terms,low,hi);for(Mask lo=0;lo<(Mask(1)<<low);++lo){Mask s=(Mask(hi)<<low)|lo;int m=pc(s),v=0;Mask missing=0;for(int j=0;j<m;++j){v-=rows[lo].a[j];assert(v>=0);if(j&&v==0)missing|=Mask(1)<<j;}v-=rows[lo].a[m];assert(v==0);allowed[s]|=missing;live+=!!missing;pairs+=pc(missing);}}
    }
    if(log)cerr<<"initial z="<<z<<" states="<<live<<" pairs="<<pairs<<"\n";
  }
  vector<State> out;for(size_t s=0;s<N;++s)if(allowed[s])out.push_back({Mask(s),allowed[s],tr.n-1});
  if(log){uint64_t pairs=0;Mask all=0;for(auto s:out){pairs+=pc(s.allowed);all|=s.allowed;}cerr<<"initial merged states="<<out.size()<<" pairs="<<pairs<<" rankmask="<<all<<" through physical offset "<<tr.steps[end-1].index<<"\n";}
  return out;
}
// Independent explicit-list oracle on reduced alphabets. Each test starts at
// a public nonzero center with all nonzero glyphs in known recency order.
struct OracleState {vector<int> a;int z;};
static vector<int> buildList(const PublicTrace& tr,Mask s,int z){
  vector<int> order=tr.initialOrder;order.insert(order.begin()+z,0);int center=order.front();assert(center!=0);vector<int> tok(tr.n,-1);int k=0;for(int i=1;i<tr.n;++i)if(i!=center)tok[i]=k++;tok[0]=tr.n-2;
  vector<int> L,R;for(size_t i=1;i<order.size();++i){int a=order[i];if(s&(Mask(1)<<tok[a]))L.push_back(a);else R.push_back(a);}reverse(L.begin(),L.end());L.push_back(center);L.insert(L.end(),R.begin(),R.end());return L;
}
static pair<Mask,int> oracleKey(const vector<int>& list,int r,const vector<int>& tok,int z){Mask s=0;for(int i=0;i<r;++i){assert(tok[list[i]]>=0);s|=Mask(1)<<tok[list[i]];}return {s,z};}
static set<tuple<Mask,int,int>> oracle(const PublicTrace& tr,int start,Mask s,int z,int j){
  const int r=pc(s);vector<OracleState> states{{buildList(tr,s,z),z}};vector<int> order=tr.initialOrder;int center=order[0];vector<int> tok(tr.n,-1);int k=0;for(int a=1;a<tr.n;++a)if(a!=center)tok[a]=k++;tok[0]=tr.n-2;
  for(int i=start+1;i<(int)tr.c.size();++i){int b=tr.c[i],d=b?find(order.begin(),order.end(),b)-order.begin():-1;vector<OracleState> next;
    for(auto a:states){if(!b)next.push_back(a);int rank=find(a.a.begin(),a.a.end(),b)-a.a.begin();if(rank==j)continue;auto v=a.a;v.erase(v.begin()+rank);v.insert(v.begin()+r,b);int nz=b?(a.z+(d>=a.z)):0;next.push_back({move(v),nz});}
    states=move(next);if(b){if(b!=center){tok[center]=tok[b];tok[b]=-1;center=b;}order.erase(order.begin()+d);order.insert(order.begin(),b);}
  }
  set<tuple<Mask,int,int>> out;for(auto a:states){auto [m,zz]=oracleKey(a.a,r,tok,a.z);out.emplace(m,zz,j);}return out;
}
static void validate(){
  mt19937 rng(2718);int checks=0;
  // End on a nonzero so no trailing-zero state distinction in the oracle.
  for(int n=4;n<=8;++n){for(int run=0;run<3;++run){vector<int> c;for(int a=1;a<n;++a)c.push_back(a);int start=c.size()-1;for(int i=0;i<14;++i)c.push_back(rng()%n);if(c.back()==0)c.push_back(1);auto tr=makeTrace(c,n,start);
      for(Mask s=1;s<=tr.allBits;++s)for(int z=1;z<n;++z){int m=pc(s);if(m<2)continue;Mask allowed=rankBits(m)&~Mask(1);auto result=forwardBlocks(tr,{{s,allowed,z}},0,false);set<tuple<Mask,int,int>> got,want;for(auto x:result)for(int j=1;j<m;++j)if(x.allowed&(Mask(1)<<j))got.emplace(x.s,x.z,j);for(int j=1;j<m;++j){auto o=oracle(tr,start,s,z,j);want.insert(o.begin(),o.end());}assert(got==want);++checks;}
    }}
  cerr<<"explicit-list oracle agreement: "<<checks<<" complete starting-state cases\n";
}
// A never-consumed farthest rank keeps the same glyph forever. Since every
// nonzero glyph occurs, it must be zero; remove that glyph and all F holds.
static void farRank(const vector<int>& c){
  vector<int> nz;array<bool,29> seen{};int repeats=0,first=-1;
  for(size_t i=0;i<c.size();++i){int a=c[i];seen[a]=true;if(a)nz.push_back(a-1);if(i&&a&&a==c[i-1]){++repeats;if(first<0)first=i-1;}}
  for(int a=1;a<29;++a)assert(seen[a]);
  assert(repeats>0);auto e=trace(nz,28);auto terms=polynomial(e.visits);int low=12,high=27-low;Best best{};
#pragma omp parallel
  {vector<Row> rows(1<<low);Best local{};
#pragma omp for schedule(static)
    for(int hi=0;hi<(1<<high);++hi){fillrows(rows,terms,low,hi);for(Mask lo=0;lo<(1<<low);++lo){Mask s=(Mask(hi)<<low)|lo;int m=pc(s),v=0;for(int j=0;j<m;++j){v-=rows[lo].a[j];assert(v>=0);Best b{v,s,j};if(better(b,local))local=b;}assert(v==rows[lo].a[m]);}}
#pragma omp critical
    {if(better(local,best))best=local;}
  }
  assert(brute(e.visits,best.s,28)[best.rank]==best.count);
  cerr<<"far rank: nonzero="<<nz.size()<<" burn="<<e.burn<<" max="<<best.count<<" mask="<<best.s<<" rank="<<best.rank<<" center="<<e.repeats<<" first nonzero repeat="<<first<<" count="<<repeats<<"\n";
  cout<<"{\"far_subsets\":"<<(uint64_t(1)<<27)<<",\"nonzero\":"<<nz.size()<<",\"held_zero\":"<<c.size()-nz.size()<<",\"burn\":"<<e.burn<<",\"max_side\":"<<best.count<<",\"mask\":"<<best.s<<",\"rank\":"<<best.rank<<",\"center\":"<<e.repeats<<",\"full_max_bound\":"<<max(int(c.size()-nz.size()),max(best.count,e.repeats)+e.burn)<<",\"first_nonzero_repeat\":"<<first<<",\"nonzero_repeats\":"<<repeats<<"}\n";
}
int main(int argc,char**argv){
  validate();if(argc<2)return 2;ifstream f(argv[1]);vector<int> c;char ch;uint32_t hash=2166136261u;while(f>>ch){int x=ch<='9'?ch-'0':ch-'A'+10;assert(x>=0&&x<29);c.push_back(x);hash=(hash^(unsigned char)ch)*16777619u;}assert(c.size()==12956&&hash==0x75f0ccfau);
  int start=argc>2?stoi(argv[2]):1691;auto tr=makeTrace(c,29,start);size_t end=0;while(end<tr.steps.size()&&!tr.steps[end].zeros)++end;assert(end>0);cerr<<"start="<<start<<" first block="<<end<<" initial z=";for(int z:tr.initialZ)cerr<<z<<",";cerr<<"\n";
  auto t=chrono::steady_clock::now();auto states=initialBlock(tr,end,true);auto init=states.size();states=forwardBlocks(tr,move(states),end,true);Mask rankMask=0;uint64_t pairs=0;for(auto x:states){rankMask|=x.allowed;pairs+=pc(x.allowed);}cout<<"{\"start\":"<<start<<",\"initial_block\":"<<end<<",\"initial_states\":"<<init<<",\"final_states\":"<<states.size()<<",\"final_pairs\":"<<pairs<<",\"final_rankmask\":"<<rankMask<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-t).count()<<"}\n";
  farRank(c);
  return 0;
}
