// Agent2: continuous chapter clock, all legal observed F masks, unknown primitive q8.
// Adapted from lp2_shared_gp29_q8_symbolic_graph_sft.cpp; no word resets.
// The corrected 47 complete training groups + mandatory carry prefix are fitted;
// physical p55 is not consulted until a key is frozen.
#include <cstdlib>
#include <fstream>
#include <sstream>
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
using Vec=array<uint8_t,8>;using Code=uint64_t;constexpr int N=29,Q=8,L=7;
constexpr Code IMP=~Code(0);
Vec add(const Vec&a,const Vec&b){Vec c{};for(int i=0;i<Q;i++)c[i]=(a[i]+b[i])%N;return c;}
Vec minusv(const Vec&a,const Vec&b){Vec c{};for(int i=0;i<Q;i++)c[i]=aff::sub[a[i]][b[i]];return c;}
Vec unit(int j){Vec x{};x[j]=1;return x;}
struct KeySpace{
 int d=7;array<Vec,Q>a{};array<uint8_t,Q>vars{};
 KeySpace(int gauge=0){a[gauge][L]=1;int t=0;for(int i=0;i<Q;i++)if(i!=gauge){a[i][t]=1;vars[t++]=i;}}
 Vec project(const Vec&v)const{Vec x{};for(int j=0;j<Q;j++)if(v[j]){for(int k=0;k<d;k++)x[k]=(x[k]+aff::mul[v[j]][a[j][k]])%N;x[L]=(x[L]+aff::mul[v[j]][a[j][L]])%N;}return x;}
 bool impose(const Vec&v){Vec eq=project(v);int pivot=d-1;while(pivot>=0&&!eq[pivot])pivot--;if(pivot<0)return !eq[L];int last=d-1,rec=aff::inv[eq[pivot]];
  for(auto&r:a){int f=aff::mul[r[pivot]][rec];if(f){for(int j=0;j<d;j++)if(j!=pivot)r[j]=aff::sub[r[j]][aff::mul[f][eq[j]]];r[L]=aff::sub[r[L]][aff::mul[f][eq[L]]];}if(pivot!=last)r[pivot]=r[last];r[last]=0;}
  vars[pivot]=vars[last];vars[last]=0;d--;return true;}
 bool primitive()const{for(int i=0;i<4;i++)if(a[i]!=a[i+4])return true;return false;}
 Code code(const Vec&v)const{Code x=0;for(int i=0;i<d;i++)x=x*N+v[i];return x*N+v[L];}
 Code normalized(const Vec&v)const{int j=0;while(j<d&&!v[j])j++;if(j==d)return v[L]?IMP:0;Code x=1;int m=aff::inv[v[j]];for(int i=0;i<d;i++)x=x*N+aff::mul[v[i]][m];return x*N+aff::mul[v[L]][m];}
 fixed::Key evaluate(const Vec&params)const{fixed::Key k{};for(int j=0;j<Q;j++){int x=a[j][L];for(int i=0;i<d;i++)x+=params[i]*a[j][i];k[j]=x%N;}return k;}
};
struct GEdge{uint8_t c,p,j;};
struct GOption{array<GEdge,16> e{};array<uint16_t,16> f{};int n=0;};
struct Hard{vector<GEdge> obs;vector<int> statuses;int nonzero=0;};
struct Graph{const Hard* hard=nullptr;
 array<uint8_t,N> r{},size{};array<Vec,N> off{};int comps=N;KeySpace k;
 Graph(int gauge=0,const Hard*h=nullptr):hard(h),k(gauge){for(int x=0;x<N;x++){r[x]=x;size[x]=1;}}
 int dimension()const{return k.d+comps-1;}
 bool edge(GEdge e){
  int c=e.c,p=e.p,j=e.j,rc=r[c],rp=r[p];Vec shift=minusv(add(off[p],unit(j)),off[c]);
  if(rc==rp)return k.impose(shift);
  if(size[rc]<=size[rp]){for(int x=0;x<N;x++)if(r[x]==rc){r[x]=rp;off[x]=add(off[x],shift);}size[rp]+=size[rc];size[rc]=0;}
  else{for(int x=0;x<N;x++)if(r[x]==rp){r[x]=rc;off[x]=minusv(off[x],shift);}size[rc]+=size[rp];size[rp]=0;}
  if(--comps==1){Vec sum{};for(int x=0;x<N;x++)sum=add(sum,off[x]);if(!k.impose(sum))return false;}
  return true;
 }
 bool valid()const{
  if(!k.primitive())return false;array<Code,N> v{};array<Vec,N> a{};
  for(int x=0;x<N;x++){a[x]=k.project(off[x]);v[x]=k.code(a[x]);}
  for(int x=0;x<N;x++)for(int y=0;y<x;y++)if(r[x]==r[y]&&v[x]==v[y])return false;
  if(hard){
   for(auto e:hard->obs)if(r[e.c]==r[0]&&minusv(minusv(a[e.c],a[0]),k.a[e.j])==Vec{})return false;
   int zero=0,nz=0;for(int j=0;j<Q;j++){bool free=false;for(int t=0;t<k.d;t++)free|=k.a[j][t]!=0;if(!free){if(k.a[j][L])nz|=1<<j;else zero|=1<<j;}}
   bool ok=false;for(int z:hard->statuses)if((z&zero)==zero&&!(z&nz)){ok=true;break;}if(!ok)return false;
  }return true;
 }
 string sig()const{
  string s;s+=char(k.d);s.append((char*)k.vars.data(),Q);for(auto&a:k.a)s.append((char*)a.data(),Q);
  array<int,N> root;root.fill(-1);for(int x=0;x<N;x++){if(root[r[x]]<0)root[r[x]]=x;s+=char(root[r[x]]);auto v=k.project(minusv(off[x],off[root[r[x]]]));s.append((char*)v.data(),Q);}return s;
 }
};
bool extend(const Graph&g,const GOption&o,Graph&next){next=g;for(int i=0;i<o.n;i++)if(!next.edge(o.e[i]))return false;return next.valid();}
struct GFilter{
 const Graph&g;array<Vec,N>a{};unordered_set<Code> forbidden;unordered_map<int,vector<Code>> differences;array<int8_t,N*N*Q>cache;bool saturated=false;
 GFilter(const Graph&x):g(x){cache.fill(-1);for(int i=0;i<N;i++)a[i]=g.k.project(g.off[i]);unordered_map<Code,uint32_t> dirs;
  auto ban=[&](const Vec&v){Code z=g.k.normalized(v);if(!z){saturated=true;return;}if(z==IMP)return;forbidden.insert(z);auto&m=dirs[z/N];m|=1u<<(z%N);if(m==0x1fffffff)saturated=true;};
  for(int i=0;i<N;i++)for(int j=0;j<i;j++)if(g.r[i]==g.r[j])ban(minusv(a[i],a[j]));
  if(g.hard){for(auto e:g.hard->obs)if(g.r[e.c]==g.r[0])ban(minusv(minusv(a[e.c],a[0]),g.k.a[e.j]));
   for(int j=0;j<Q;j++)if(g.hard->nonzero&(1<<j))ban(g.k.a[j]);}
 }
 bool allowed(int c,int p,int j){auto&v=cache[(c*N+p)*Q+j];if(v>=0)return v;
  if(p==0)return v=(c==0); // literal plaintext F is a transparent hold: no edge and no key consumption
  Vec shift=minusv(add(a[p],g.k.a[j]),a[c]);int rc=g.r[c],rp=g.r[p];
  if(rc==rp){Code z=g.k.normalized(shift);return v=(z!=IMP&&!forbidden.count(z));}
  int id=rp*N+rc;auto it=differences.find(id);if(it==differences.end()){vector<Code> f;for(int x=0;x<N;x++)if(g.r[x]==rp)for(int y=0;y<N;y++)if(g.r[y]==rc)f.push_back(g.k.code(minusv(a[x],a[y])));sort(f.begin(),f.end());f.erase(unique(f.begin(),f.end()),f.end());it=differences.emplace(id,move(f)).first;}
  return v=!binary_search(it->second.begin(),it->second.end(),g.k.code(shift));
 }
 bool allowed(const GOption&o){for(int i=0;i<o.n;i++){auto e=o.e[i];if(!allowed(e.c,e.p,e.j))return false;}return true;}
};
struct GPosting{int feat;vector<int> ids;vector<uint64_t> bits;};
struct GDomain{string cipher;vector<GOption> opts;vector<vector<GPosting>> post;array<int,N*Q> tokenPos;vector<array<int,N>> positionPost;array<vector<uint64_t>,N*Q> phaseUse;};
vector<vector<int>> clocks(const vector<string>&groups,uint64_t mask,int start=0){
 vector<vector<int>> out;int z=0,j=start;for(auto&w:groups){vector<int> row;for(char ch:w){int c=fixed::val(ch);bool hold=!c&&((mask>>z)&1);if(!c){fixed::require(z<63,"too many zero positions");z++;}
 row.push_back(hold?-1:j);if(!hold)j=(j+1)%Q;}out.push_back(row);}return out;
}
GDomain makeGDomain(const string&c,const vector<int>&clock,const vector<string>&words){
 GDomain d;d.cipher=c;d.post.resize(c.size());d.tokenPos.fill(-1);d.positionPost.resize(c.size());for(auto&row:d.positionPost)row.fill(-1);for(size_t i=0;i<c.size();i++)if(clock[i]>=0)d.tokenPos[fixed::val(c[i])*Q+clock[i]]=i;vector<map<int,vector<int>>> tmp(c.size());
 for(auto&w:words){GOption o;bool ok=true;for(size_t i=0;i<w.size();i++){int p=fixed::val(w[i]),x=fixed::val(c[i]),j=clock[i];
  if(j<0){if(p){ok=false;break;}o.f[i]=0;continue;}if(!p){ok=false;break;}
  for(int t=0;t<o.n;t++){auto e=o.e[t];if(e.j==j&&(((e.c==x)!=(e.p==p))||((e.c==e.p)!=(x==p)))){ok=false;break;}}
  if(!ok)break;o.e[o.n++]={uint8_t(x),uint8_t(p),uint8_t(j)};o.f[i]=j*N+p;
 }if(!ok)continue;int index=d.opts.size();d.opts.push_back(o);for(size_t i=0;i<c.size();i++)tmp[i][o.f[i]].push_back(index);}
 for(size_t i=0;i<c.size();i++)for(auto&[feat,ids]:tmp[i]){GPosting p{feat,move(ids),{}};p.bits.assign((d.opts.size()+63)/64,0);for(int id:p.ids)p.bits[id/64]|=uint64_t(1)<<(id%64);int a=feat%N;d.positionPost[i][a]=d.post[i].size();if(clock[i]>=0){auto&u=d.phaseUse[clock[i]*N+a];if(u.empty())u.assign(p.bits.size(),0);for(size_t z=0;z<u.size();z++)u[z]|=p.bits[z];}d.post[i].push_back(move(p));}
 return d;
}
bool supportsStatus(const GOption&o,int z){for(int i=0;i<o.n;i++){auto e=o.e[i];if(bool(z&(1<<e.j))!=(e.c==e.p))return false;}return true;}
vector<string> decodeFixed(const vector<string>&groups,const vector<vector<int>>&clock,const fixed::Perm&pi,const fixed::Key&k){
 fixed::Perm ip{};for(int i=0;i<N;i++)ip[pi[i]]=i;vector<string> out;
 for(size_t g=0;g<groups.size();g++){string w;for(size_t i=0;i<groups[g].size();i++){int j=clock[g][i],c=fixed::val(groups[g][i]);if(j<0){if(c)return {};w+='0';continue;}int p=ip[aff::sub[pi[c]][k[j]]];if(!p)return {};w+=fixed::SYM[p];}out.push_back(w);}return out;
}
struct LexState{vector<uint64_t> bits;array<int8_t,N*Q> pmap,cmap;LexState(){pmap.fill(-1);cmap.fill(-1);}};
struct GStats{uint64_t nodes=0,joins=0,perms=0,keyTests=0,packNodes=0,features=0,options=0;};
struct GSearch{
 Hard hard;vector<vector<int>> clock;vector<string> train;vector<GDomain> ds;vector<int> order;vector<Graph> seeds;int maxOov=3;
 atomic<bool> found{false},timed{false};atomic<size_t>next{0},done{0};Clock::time_point deadline;mutex answerMutex;
 fixed::Perm answer{};fixed::Key answerKey{};int answerOov=-1;GStats total;vector<char> completed;vector<GOption> seedOptions;array<size_t,49> offsets{};LexState initial;
 GSearch(const vector<string>&g,uint64_t mask,int budget=3):clock(clocks(g,mask)),train(g),maxOov(budget){
  vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  set<pair<int,int>> obs;for(int i=0;i<48;i++){ds.push_back(makeGDomain(g[i],clock[i],i==47?pre:fixed::by[g[i].size()]));if(i!=47)order.push_back(i);
   for(size_t j=0;j<g[i].size();j++)if(clock[i][j]>=0)obs.emplace(fixed::val(g[i][j]),clock[i][j]);}
  for(auto[c,j]:obs)hard.obs.push_back({uint8_t(c),0,uint8_t(j)});
  int ban=0;for(auto e:hard.obs)if(!e.c)ban|=1<<e.j;
  for(int z=0;z<256;z++){if(z&ban)continue;int missing=0;for(int i=0;i<48;i++){bool ok=false;for(auto&o:ds[i].opts)if(supportsStatus(o,z)){ok=true;break;}if(!ok&&(i==47||++missing>maxOov)){missing=maxOov+1;break;}}if(missing<=maxOov)hard.statuses.push_back(z);}
  int possibleZero=0;for(int z:hard.statuses)possibleZero|=z;hard.nonzero=255^possibleZero;
  sort(order.begin(),order.end(),[&](int a,int b){auto s=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/train[i].size();};double x=s(a),y=s(b);return x==y?a<b:x<y;});
  unordered_map<string,GOption> seedMap;for(auto&o:ds[47].opts){int gauge=-1,used=0;for(int i=0;i<o.n;i++){auto e=o.e[i];used|=1<<e.j;if(gauge<0&&e.c!=e.p)gauge=e.j;}
   for(int j=0;j<Q;j++){if(gauge>=0?j!=gauge:bool(used&(1<<j)))continue;Graph x;if(extend(Graph(j,&hard),o,x)&&seedMap.emplace(x.sig(),o).second)seeds.push_back(x);}}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.dimension()==b.dimension()?a.sig()<b.sig():a.dimension()<b.dimension();});
  for(auto&x:seeds)seedOptions.push_back(seedMap.at(x.sig()));
  for(int g=0;g<48;g++)offsets[g+1]=offsets[g]+(ds[g].opts.size()+63)/64;initial.bits.assign(offsets[48],0);
  for(int g=0;g<48;g++)for(size_t i=0;i<ds[g].opts.size();i++)if(any_of(hard.statuses.begin(),hard.statuses.end(),[&](int z){return supportsStatus(ds[g].opts[i],z);}))initial.bits[offsets[g]+i/64]|=uint64_t(1)<<(i%64);
  completed.assign(seeds.size(),0);
  cout<<"CONTINUOUS CARRY seeds="<<seeds.size()<<" zeroStatus";for(int z:hard.statuses)cout<<" "<<z;cout<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
 }
 bool stop(){if(found.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 size_t countDomain(int g,const LexState&state)const{size_t n=0;for(size_t i=offsets[g];i<offsets[g+1];i++)n+=__builtin_popcountll(state.bits[i]);return n;}
 bool applyLex(LexState&state,const GOption&o,const vector<int>&rem)const{
  for(int z=0;z<o.n;z++){auto e=o.e[z];int t=e.c*Q+e.j,u=e.p*Q+e.j;
   if(state.pmap[t]>=0){if(state.pmap[t]!=e.p)return false;continue;}
   if(state.cmap[u]>=0&&state.cmap[u]!=e.c)return false;
   state.pmap[t]=e.p;state.cmap[u]=e.c;
   for(int g:rem){const auto&d=ds[g];int pos=d.tokenPos[t];auto begin=offsets[g],end=offsets[g+1];
    if(pos>=0){int n=d.positionPost[pos][e.p];if(n<0){fill(state.bits.begin()+begin,state.bits.begin()+end,0);continue;}auto&allow=d.post[pos][n].bits;for(size_t i=begin;i<end;i++)state.bits[i]&=allow[i-begin];}
    else{auto&deny=d.phaseUse[e.j*N+e.p];if(!deny.empty())for(size_t i=begin;i<end;i++)state.bits[i]&=~deny[i-begin];}
   }
  }return true;
 }
 vector<int> domain(int g,GFilter&f,size_t cap,GStats&c,LexState&state){
  const auto&d=ds[g];vector<int>out;out.reserve(min<size_t>(cap,d.opts.size()));
  size_t start=offsets[g];for(size_t i=start;i<offsets[g+1];i++){uint64_t bits=state.bits[i];while(bits){int k=__builtin_ctzll(bits);uint64_t b=uint64_t(1)<<k;bits^=b;int id=int((i-start)*64+k);
   c.options++;if(f.allowed(d.opts[id])){out.push_back(id);if(out.size()>=cap)return out;}else state.bits[i]&=~b;
  }}return out;
 }
 uint64_t packingBound(const Graph&g,uint64_t cap=8192)const{
  uint64_t b=1;auto mult=[&](uint64_t v){if(v&&b>cap/v)b=cap+1;else b*=v;};
  for(int i=0;i<g.k.d;i++)mult(N);
  vector<int>sz;for(int x=0;x<N;x++)if(g.size[x])sz.push_back(g.size[x]);
  sort(sz.begin(),sz.end(),greater<int>());int free=N-sz[0];
  for(size_t i=1;i<sz.size();i++){mult(free);free-=sz[i];}return b;
 }
 void check(const fixed::Perm&pi,const fixed::Key&k,GStats&c){
  c.perms++;auto words=decodeFixed(train,clock,pi,k);if(words.empty()||!fixed::prefixDict.count(words.back()))return;
  int n=0;for(int i:order)if(!fixed::dict.count(words[i])&&++n>maxOov)return;
  lock_guard<mutex>l(answerMutex);if(!found){answer=pi;answerKey=k;answerOov=n;found=true;}
 }
 void pack(const Graph&g,const fixed::Key&k,GStats&c){
  c.keyTests++;bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return;
  array<int,N>val{},trans{};array<uint32_t,N>masks{};
  for(int x=0;x<N;x++){
   int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];v%=N;val[x]=v;
   uint32_t bit=1u<<v;if(masks[g.r[x]]&bit)return;masks[g.r[x]]|=bit;
  }
  int anchor=0;for(int x=1;x<N;x++)if(g.size[x]>g.size[anchor])anchor=x;
  vector<int>rem;for(int x=0;x<N;x++)if(masks[x]&&x!=anchor)rem.push_back(x);
  auto dfsPack=[&](auto&&self,uint32_t used,vector<int>left)->void{
   if(stop())return;c.packNodes++;
   if(left.empty()){
    fixed::Perm pi{};int delta=(val[0]+trans[g.r[0]])%N;
    for(int x=0;x<N;x++)pi[x]=(val[x]+trans[g.r[x]]+N-delta)%N;
    check(pi,k,c);return;
   }
   int pick=-1;vector<int>options;
   for(int i=0;i<int(left.size());i++){
    int r=left[i];vector<int>v;for(int t=0;t<N;t++)if(!(used&fixed::rot(masks[r],t)))v.push_back(t);
    if(v.empty())return;if(pick<0||v.size()<options.size()){pick=i;options=move(v);if(options.size()==1)break;}
   }
   int r=left[pick];left.erase(left.begin()+pick);
   for(int t:options){trans[r]=t;self(self,used|fixed::rot(masks[r],t),left);if(stop())return;}
  };
  dfsPack(dfsPack,masks[anchor],rem);
 }

 void enumerate(const Graph&g,GStats&c){Vec param{};auto visit=[&](auto&&self,int i)->void{if(stop())return;if(i==g.k.d){pack(g,g.k.evaluate(param),c);return;}for(int v=0;v<N;v++){param[i]=v;self(self,i+1);if(stop())return;}};visit(visit,0);}
 void dfs(const Graph&g,vector<int>rem,int b,GStats&c,LexState state){
  if(stop())return;c.nodes++;
  if(g.dimension()<=3||int(rem.size())<=b||packingBound(g)<=8192){enumerate(g,c);return;}
  GFilter f(g);if(f.saturated)return;
  array<size_t,48> sizes{};for(int id:rem)sizes[id]=countDomain(id,state);
  rem.erase(remove_if(rem.begin(),rem.end(),[&](int id){if(sizes[id])return false;b--;return true;}),rem.end());if(b<0)return;
  stable_sort(rem.begin(),rem.end(),[&](int a,int b){return log2(double(sizes[a]))/train[a].size()<log2(double(sizes[b]))/train[b].size();});
  int pick=-1;vector<int>best;size_t cap=SIZE_MAX;int ntry=min<int>(rem.size(),g.dimension()>20?5:g.dimension()>12?8:16);
  for(int i=0;i<ntry;){auto d=domain(rem[i],f,cap,c,state);if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;}
  if(pick<0){enumerate(g,c);return;}int id=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int i:best){if(stop())return;c.joins++;Graph x;if(!extend(g,ds[id].opts[i],x)||!seen.insert(x.sig()).second)continue;
   auto child=state;if(applyLex(child,ds[id].opts[i],rem))dfs(x,rem,b,c,move(child));
  }
  if(b)dfs(g,rem,b-1,c,move(state));
 }
 void run(int seconds,size_t seedStart=0,size_t seedEnd=SIZE_MAX){
  if(seedEnd==SIZE_MAX)seedEnd=seeds.size();
  if(seedStart>seedEnd||seedEnd>seeds.size())throw runtime_error("invalid seed range");
  next=seedStart;done=0;deadline=Clock::now()+chrono::seconds(seconds);
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{auto&c=stats[t];while(!stop()){size_t i=next.fetch_add(1);if(i>=seedEnd)break;auto state=initial;if(applyLex(state,seedOptions[i],order))dfs(seeds[i],order,maxOov,c,move(state));if(!found&&!timed){completed[i]=1;done++;}}});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.keyTests+=c.keyTests;total.packNodes+=c.packNodes;total.features+=c.features;total.options+=c.options;}
  cout<<"GRAPH SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<(seedEnd-seedStart)<<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests<<" packing="<<total.packNodes<<" permutations="<<total.perms<<" features="<<total.features<<" options="<<total.options<<" OOV="<<answerOov<<endl;
 }
};

// Native-shaped dictionary controls, continuous authentic literal-F sender.
struct CPlant{vector<string> train,held,truth,fullTruth,fullCipher;fixed::Perm pi;fixed::Key k;uint64_t mask=0;};
CPlant continuousPlant(const vector<string>&shape,const vector<string>&held,unsigned seed){
 mt19937 rng(seed);CPlant p;for(int i=0;i<N;i++)p.pi[i]=i;shuffle(p.pi.begin()+1,p.pi.end(),rng);
 for(auto&v:p.k)v=rng()%N;p.k[0]=1;p.k[4]=2;if(seed%2==0)p.k[3]=0;
 auto choose=[&](size_t n){auto&v=fixed::by[n];return v[rng()%v.size()];};for(int i=0;i<47;i++)p.fullTruth.push_back(choose(shape[i].size()));p.fullTruth.push_back(choose(11));for(size_t i=1;i<held.size();i++)p.fullTruth.push_back(choose(held[i].size()));
 fixed::Perm ip{};for(int i=0;i<N;i++)ip[p.pi[i]]=i;int j=0,z=0;for(auto&w:p.fullTruth){string c;for(char ch:w){int a=fixed::val(ch),v;if(!a){v=0;fixed::require(z<63,"control zero count");p.mask|=uint64_t(1)<<z;}else{v=ip[(p.pi[a]+p.k[j])%N];j=(j+1)%Q;}if(!v)z++;c+=fixed::SYM[v];}p.fullCipher.push_back(c);}
 p.train.assign(p.fullCipher.begin(),p.fullCipher.begin()+47);p.train.push_back(p.fullCipher[47].substr(0,10));p.held.push_back(p.fullCipher[47].substr(10));p.held.insert(p.held.end(),p.fullCipher.begin()+48,p.fullCipher.end());return p;
}
bool exactAction(const fixed::Perm&a,const fixed::Key&k,const fixed::Perm&b,const fixed::Key&l){return fixed::maps(a,k)==fixed::maps(b,l);}
int main(int argc,char**argv){try{
 aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 bool control=argc>1&&string(argv[1])=="control";unsigned seed=control?(argc>2?stoul(argv[2]):29204):0;
 uint64_t mask=control?0:argc>1?stoull(argv[1]):0;int seconds=argc>2&&!control?stoi(argv[2]):control?argc>3?stoi(argv[3]):600:1800;
 size_t from=!control&&argc>3?stoull(argv[3]):0,to=!control&&argc>4?stoull(argv[4]):SIZE_MAX;
 CPlant p;if(control){p=continuousPlant(train,held,seed);train=p.train;held=p.held;mask=p.mask;}else fixed::require(mask<8,"mask outside eight original choices");
 GSearch s(train,mask,control?0:3);if(to==SIZE_MAX)to=s.seeds.size();s.run(seconds,from,to);
 bool exhausted=!s.found&&!s.timed&&s.done==to-from,exact=false;int fit=0,hit=0;
 if(s.found){auto words=decodeFixed(train,s.clock,s.answer,s.answerKey);cout<<"ANSWER pi";for(auto x:s.answer)cout<<" "<<int(x);cout<<" key";for(auto x:s.answerKey)cout<<" "<<int(x);cout<<" training "<<join(words)<<endl;
  if(control){exact=exactAction(s.answer,s.answerKey,p.pi,p.k);auto out=decodeFixed(p.fullCipher,clocks(p.fullCipher,p.mask),s.answer,s.answerKey);
   if(out.size()==64){for(int i=0;i<47;i++)fit+=out[i]==p.fullTruth[i];for(int i=47;i<64;i++)hit+=out[i]==p.fullTruth[i];}}
  else{int phase=0;for(auto&row:s.clock)for(int j:row)if(j>=0)phase=(j+1)%Q;// Holdout below uses only the frozen key.
   string hc=join(held);int zeros=count(hc.begin(),hc.end(),'0');fixed::require(zeros<20,"holdout mask count");for(uint64_t hm=0;hm<(uint64_t(1)<<zeros);hm++){auto h=decodeFixed(held,clocks(held,hm,phase),s.answer,s.answerKey);if(h.empty())continue;h[0]=words.back()+h[0];int cov=0;for(auto&w:h)cov+=fixed::dict.count(w);cout<<"HOLD mask="<<hm<<" coverage="<<cov<<"/17";for(auto&w:h)cout<<" "<<w;cout<<endl;}}
 }
 ostringstream o;o<<"{\"mode\":\""<<(control?"control":"original")<<"\",\"seed\":"<<seed<<",\"mask\":"<<mask<<",\"seed_total\":"<<s.seeds.size()<<",\"from\":"<<from<<",\"to\":"<<to<<",\"done\":"<<s.done<<",\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"exhausted\":"<<(exhausted?"true":"false")<<",\"exactAction\":"<<(exact?"true":"false")<<",\"fit\":"<<fit<<",\"held\":"<<hit<<",\"oov\":"<<s.answerOov<<",\"nodes\":"<<s.total.nodes<<",\"joins\":"<<s.total.joins<<",\"features\":"<<s.total.features<<",\"options\":"<<s.total.options<<",\"completed\":[";
 bool comma=false;for(size_t i=0;i<s.completed.size();i++)if(s.completed[i]){if(comma)o<<",";o<<i;comma=true;}o<<"]";
 if(s.found){o<<",\"pi\":[";for(int i=0;i<N;i++){if(i)o<<",";o<<int(s.answer[i]);}o<<"],\"key\":[";for(int j=0;j<Q;j++){if(j)o<<",";o<<int(s.answerKey[j]);}o<<"]";}o<<"}";cout<<o.str()<<endl;if(const char*f=getenv("SFT_OUTPUT")){ofstream out(f);out<<o.str()<<endl;}
 return control?!(exact&&fit==47&&hit==17):!(s.found||exhausted);
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
