// General unknown primitive q8, arbitrary word starts and literal F hold.
// Difference graph over original eight key coordinates, exact GF29 key-space
// elimination only when graph cycles close. Component translations are packed
// at residual leaves. Mandatory carry prefix, <=3 of 47 complete words OOV.
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
 KeySpace(){a[0][L]=1;for(int i=1;i<Q;i++){a[i][i-1]=1;vars[i-1]=i;}}
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
struct Graph{
 array<uint8_t,N> r{},size{};array<Vec,N> off{};int comps=N;KeySpace k;
 Graph(){for(int x=0;x<N;x++){r[x]=x;size[x]=1;}}
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
  if(!k.primitive())return false;array<Code,N> v{};for(int x=0;x<N;x++)v[x]=k.code(k.project(off[x]));
  for(int x=0;x<N;x++)for(int y=0;y<x;y++)if(r[x]==r[y]&&v[x]==v[y])return false;return true;
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
  for(int i=0;i<N;i++)for(int j=0;j<i;j++)if(g.r[i]==g.r[j]){Code z=g.k.normalized(minusv(a[i],a[j]));if(!z){saturated=true;return;}if(z==IMP)continue;forbidden.insert(z);auto&v=dirs[z/N];v|=1u<<(z%N);if(v==0x1fffffff){saturated=true;return;}}
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
struct GDomain{string cipher;vector<GOption> opts;vector<vector<pair<int,vector<int>>>> post;};
GDomain makeGDomain(const string&c,const vector<string>&words,const Graph&base){
 GDomain d;d.cipher=c;d.post.resize(c.size());vector<map<int,vector<int>>> tmp(c.size());unordered_set<string>seen;
 for(const auto&w:words)for(int start=0;start<Q;start++){
  GOption o;int j=start;bool ok=true;for(size_t i=0;i<w.size();i++){int p=fixed::val(w[i]),x=fixed::val(c[i]);if(!p){if(x){ok=false;break;}continue;}if(j==0&&p==x){ok=false;break;}
   for(int t=0;t<o.n;t++){auto e=o.e[t];if(e.j==j&&((e.c==x)!=(e.p==p))){ok=false;break;}if(e.j==j&&((e.c==e.p)!=(x==p))){ok=false;break;}}if(!ok)break;
   o.e[o.n++]={uint8_t(x),uint8_t(p),uint8_t(j)};o.f[i]=j*N+p;j=(j+1)%Q;
  }
  if(!ok)continue;Graph t;if(!extend(base,o,t))continue;
  array<uint16_t,16> ids{};for(int i=0;i<o.n;i++){auto e=o.e[i];ids[i]=(e.c*N+e.p)*Q+e.j;}sort(ids.begin(),ids.begin()+o.n);auto z=unique(ids.begin(),ids.begin()+o.n);string sig((char*)ids.data(),2*(z-ids.begin()));if(!seen.insert(sig).second)continue;
  int index=d.opts.size();d.opts.push_back(o);for(size_t i=0;i<c.size();i++)tmp[i][o.f[i]].push_back(index);
 }
 for(size_t i=0;i<c.size();i++)for(auto&a:tmp[i])d.post[i].push_back({a.first,move(a.second)});return d;
}
struct GStats{uint64_t nodes=0,joins=0,perms=0,keyTests=0,packNodes=0,features=0,options=0;};
struct GSearch{
 Graph base;vector<string> train;vector<GDomain> ds;vector<int> order;vector<Graph> seeds;int maxOov=3;
 atomic<bool> found{false},timed{false};atomic<size_t>next{0},done{0};Clock::time_point deadline;mutex answerMutex;
 fixed::Perm answer{};fixed::Key answerKey{};int answerOov=-1;GStats total;
 GSearch(const vector<string>&g,int budget=3):train(g),maxOov(budget){
  vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  for(int i=0;i<48;i++){ds.push_back(makeGDomain(g[i],i==47?pre:fixed::by[g[i].size()],base));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto s=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/train[i].size();};double x=s(a),y=s(b);return x==y?a<b:x<y;});
  unordered_set<string>seen;for(auto&o:ds[47].opts){Graph x;if(extend(base,o,x)&&seen.insert(x.sig()).second)seeds.push_back(x);}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.dimension()==b.dimension()?a.sig()<b.sig():a.dimension()<b.dimension();});
  cout<<"GRAPH CARRY seeds="<<seeds.size()<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
 }
 bool stop(){if(found.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 vector<int> domain(int g,GFilter&f,size_t cap,GStats&c){
  auto&d=ds[g];size_t best=SIZE_MAX;vector<const vector<int>*> posting;
  for(size_t pos=0;pos<d.post.size();pos++){size_t n=0;vector<const vector<int>*> v;for(auto&[feat,list]:d.post[pos]){c.features++;int j=feat/N,p=feat%N;if(p&&!f.allowed(fixed::val(d.cipher[pos]),p,j))continue;n+=list.size();v.push_back(&list);if(n>=best)break;}if(n<best){best=n;posting=move(v);if(!n)return {};}}
  vector<int> out;for(auto*v:posting)for(int id:*v){c.options++;if(f.allowed(d.opts[id])){out.push_back(id);if(out.size()>=cap)return out;}}return out;
 }
 void check(const fixed::Perm&pi,const fixed::Key&k,GStats&c){
  c.perms++;auto m=fixed::maps(pi,k);if(!fixed::support(train.back(),m,fixed::prefixDict))return;
  int n=0;for(int i:order)if(!fixed::support(train[i],m,fixed::dict)&&++n>maxOov)return;
  lock_guard<mutex>l(answerMutex);if(!found){answer=pi;answerKey=k;answerOov=n;found=true;}
 }
 void pack(const Graph&g,const fixed::Key&k,GStats&c){
  c.keyTests++;bool primitive=false;for(int j=0;j<4;j++)primitive|=k[j]!=k[j+4];if(!primitive)return;
  array<int,N> val{},trans{};array<uint32_t,N> masks{};for(int x=0;x<N;x++){int v=0;for(int j=0;j<Q;j++)v+=g.off[x][j]*k[j];v%=N;val[x]=v;uint32_t b=1u<<v;if(masks[g.r[x]]&b)return;masks[g.r[x]]|=b;}
  int root=g.r[0];trans[root]=(N-val[0])%N;uint32_t used=fixed::rot(masks[root],trans[root]);vector<int> rem;for(int x=0;x<N;x++)if(masks[x]&&x!=root)rem.push_back(x);
  auto dfs=[&](auto&&self,uint32_t mask,vector<int>left)->void{if(stop())return;c.packNodes++;if(left.empty()){fixed::Perm pi{};for(int x=0;x<N;x++)pi[x]=(val[x]+trans[g.r[x]])%N;check(pi,k,c);return;}
   int pick=-1;vector<int> options;
   for(int i=0;i<int(left.size());i++){int r=left[i];vector<int> v;for(int t=0;t<N;t++)if(!(mask&fixed::rot(masks[r],t)))v.push_back(t);if(v.empty())return;if(pick<0||v.size()<options.size()){pick=i;options=move(v);if(options.size()==1)break;}}
   int r=left[pick];left.erase(left.begin()+pick);for(int t:options){trans[r]=t;self(self,mask|fixed::rot(masks[r],t),left);if(stop())return;}
  };
  dfs(dfs,used,rem);
 }
 void enumerate(const Graph&g,GStats&c){Vec param{};auto visit=[&](auto&&self,int i)->void{if(stop())return;if(i==g.k.d){pack(g,g.k.evaluate(param),c);return;}for(int v=0;v<N;v++){param[i]=v;self(self,i+1);if(stop())return;}};visit(visit,0);}
 void dfs(const Graph&g,vector<int>rem,int b,GStats&c){
  if(stop())return;c.nodes++;if(g.dimension()<=3||int(rem.size())<=b){enumerate(g,c);return;}
  GFilter f(g);if(f.saturated)return;int pick=-1;vector<int>best;size_t cap=SIZE_MAX;int ntry=min<int>(rem.size(),g.dimension()>20?5:g.dimension()>12?8:16);
  for(int i=0;i<ntry;){auto d=domain(rem[i],f,cap,c);if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;}
  if(pick<0){enumerate(g,c);return;}int id=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int i:best){if(stop())return;c.joins++;Graph x;if(extend(g,ds[id].opts[i],x)&&seen.insert(x.sig()).second)dfs(x,rem,b,c);}
  if(b)dfs(g,rem,b-1,c);
 }
 void run(int seconds){deadline=Clock::now()+chrono::seconds(seconds);unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<GStats>stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{auto&c=stats[t];while(!stop()){size_t i=next.fetch_add(1);if(i>=seeds.size())break;dfs(seeds[i],order,maxOov,c);if(!found&&!timed)done++;}});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.keyTests+=c.keyTests;total.packNodes+=c.packNodes;total.features+=c.features;total.options+=c.options;}
  cout<<"GRAPH SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<seeds.size()<<" nodes="<<total.nodes<<" joins="<<total.joins<<" keys="<<total.keyTests<<" packing="<<total.packNodes<<" permutations="<<total.perms<<" features="<<total.features<<" options="<<total.options<<" OOV="<<answerOov<<endl;
 }
};
bool equalAction(const fixed::Perm&pi,const fixed::Key&k,const fixed::Perm&pj,const fixed::Key&l){auto a=fixed::maps(pi,k),b=fixed::maps(pj,l);for(int r=0;r<Q;r++){bool good=true;for(int j=0;j<Q;j++)good&=a[j]==b[(j+r)%Q];if(good)return true;}return false;}
void regression(){
 // A literal plaintext F is a transparent hold, not a consuming edge at any phase.
 { Graph g; for(int j=0;j<Q;j++){GFilter f(g);fixed::require(f.allowed(0,0,j),"transparent F hold rejected");fixed::require(!f.allowed(1,0,j),"non-F ciphertext accepted for plaintext F");} fixed::require(g.k.d==7,"F holds altered key space"); }
 // Concrete planted edges must remain inside every symbolic graph state,
 // and each filter must accept subsequent true edges, including zero shifts.
 mt19937 rng(123);for(int t=0;t<30;t++){fixed::Perm pi{},ip{};iota(pi.begin(),pi.end(),0);shuffle(pi.begin()+1,pi.end(),rng);for(int i=0;i<N;i++)ip[pi[i]]=i;fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;
  Graph g;for(int i=0;i<90;i++){int p=1+rng()%28,j=rng()%Q,c=ip[(pi[p]+k[j])%N];GFilter f(g);fixed::require(!f.saturated&&f.allowed(c,p,j),"true edge filtered");fixed::require(g.edge({uint8_t(c),uint8_t(p),uint8_t(j)})&&g.valid(),"true graph invalid");
   Vec params{};for(int z=0;z<g.k.d;z++)params[z]=k[g.k.vars[z]];fixed::require(g.k.evaluate(params)==k,"key space lost plant");
   for(int x=0;x<N;x++){int v=0;for(int z=0;z<Q;z++)v+=g.off[x][z]*k[z];fixed::require(v%N==aff::mod(pi[x]-pi[g.r[x]]),"graph relative offset");}
  }
 }
 cout<<"GRAPH regression 2700 true edge extensions passed"<<endl;
}
bool graphControl(const vector<string>&train,const vector<string>&held,unsigned seed){
 mt19937 rng(seed+123);fixed::Key k{};k[0]=1;for(int j=1;j<Q;j++)k[j]=rng()%N;k[4]=2;if(seed==3301)k[3]=0;
 vector<string> t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);auto g=p.train;g.push_back(p.prefix);GSearch s(g,0);s.run(420);if(!s.found){cout<<"GRAPH CONTROL "<<seed<<" no key"<<endl;return false;}
 auto m=fixed::maps(s.answer,s.answerKey);int tr=0,hit=0,unique=0;for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);vector<string>c{p.carry},w{p.truthCarry};c.insert(c.end(),p.hold.begin(),p.hold.end());w.insert(w.end(),p.truthHold.begin(),p.truthHold.end());
 for(int i=0;i<int(c.size());i++){auto v=fixed::decode(c[i],m,fixed::dict);hit+=v.count(w[i]);unique+=v.size()==1&&v.count(w[i]);}
 bool exact=equalAction(s.answer,s.answerKey,p.pi,k),pass=exact&&s.answerOov==0&&tr==47&&hit==17&&unique>=8;
 cout<<"GRAPH CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17 unique="<<unique<<" pass="<<pass<<endl;return pass;
}
int main(){try{aff::init();fixed::dictionary();regression();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 bool a=graphControl(train,held,3301),b=graphControl(train,held,1033);if(!a||!b){cout<<"GRAPH ORIGINAL GATED OFF"<<endl;return 2;}
 GSearch s(train);s.run(1500);if(s.found){auto m=fixed::maps(s.answer,s.answerKey);cout<<"ORIGINAL candidate pi";for(int x:s.answer)cout<<" "<<x;cout<<" k";for(int x:s.answerKey)cout<<" "<<x;cout<<endl;auto h=held;h[0]=train.back()+h[0];for(int i=0;i<int(h.size());i++){auto v=fixed::decode(h[i],m,fixed::dict);cout<<"HOLD "<<i<<" candidates="<<v.size();for(auto&w:v)cout<<" "<<w;cout<<endl;}}
 bool exhausted=!s.found&&!s.timed&&s.done==s.seeds.size();cout<<"GRAPH ORIGINAL exhausted="<<exhausted<<endl;return exhausted?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
