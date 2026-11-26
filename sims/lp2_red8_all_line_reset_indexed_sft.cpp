// Exact independent printed-line starts with indexed lexical domains, line-state
// support DP, and parallel carry seeds. p55's first-line reachability constrains
// the p54 terminal phase before lexical fitting; no p55 words are read by the fit.
#define main previous_minimum_line_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
using Mask=uint64_t;
vector<Path> localPaths(const string&c,int start=-1,int end=-1){
 vector<Path> out;Path p;
 function<void(int,int)> rec=[&](int i,int j){if(i==int(c.size())){if(end<0||j==end){p.end=j;out.push_back(p);}return;}
  int x=fixed::val(c[i]);if(!x){p.key.push_back(-1);rec(i+1,j);p.key.pop_back();}
  if(x!=K[j]){p.key.push_back(K[j]);rec(i+1,(j+1)%8);p.key.pop_back();}
 };
 for(int j=0;j<8;j++)if(start<0||j==start){p.start=j;rec(0,j);}
 return out;
}
struct Slice{int line,from,to;};
struct Layout{
 vector<string> groups,lines;vector<vector<Path>> paths;vector<vector<Slice>> words;vector<Mask> full;
 Layout(const vector<string>&g,vector<int>bounds,int start=-1,int end=-1,Mask endMask=255):groups(g){
  string c=join(g);bounds.insert(bounds.begin(),0);bounds.push_back(c.size());
  for(int i=0;i+1<int(bounds.size());i++){lines.push_back(c.substr(bounds[i],bounds[i+1]-bounds[i]));paths.push_back(localPaths(lines.back(),i==0?start:-1,i+2==int(bounds.size())?end:-1));
   if(i+2==int(bounds.size())){auto&v=paths.back();v.erase(remove_if(v.begin(),v.end(),[&](auto&p){return !(endMask&(Mask(1)<<p.end));}),v.end());}
   size_t n=paths.back().size();fixed::require(n>0&&n<64,"line path capacity");full.push_back((Mask(1)<<n)-1);}
  int at=0;for(auto&w:g){int next=at+w.size();vector<Slice> s;for(int i=0;i<int(lines.size());i++){int a=max(at,bounds[i]),b=min(next,bounds[i+1]);if(a<b)s.push_back({i,a-bounds[i],b-bounds[i]});}fixed::require(s.size()<=2,"word crosses >2 lines");words.push_back(s);at=next;}
 }
};
struct ClockOption{aff::Option affine;array<Mask,2> allowed{};array<uint16_t,16> feature{};};
struct LineDomain{vector<ClockOption> opts;vector<Slice> slices;int length;vector<vector<pair<int,vector<int>>>> post;};
LineDomain makeDomain(const Layout&l,int g,const vector<string>&lex,const aff::Space&base){
 LineDomain out;out.slices=l.words[g];out.length=l.groups[g].size();vector<int> ks;
 vector<vector<pair<vector<int>,Mask>>> parts;
 for(const auto&s:out.slices){map<vector<int>,Mask> by;
  for(int j=0;j<int(l.paths[s.line].size());j++){const auto&k=l.paths[s.line][j].key;vector<int> v(k.begin()+s.from,k.begin()+s.to);by[v]|=Mask(1)<<j;}
  parts.emplace_back(by.begin(),by.end());
 }
 array<Mask,2> chosen{};unordered_set<string> seen;
 function<void(int)> rec=[&](int n){
  if(n<int(parts.size())){for(auto&[k,m]:parts[n]){chosen[n]=m;ks.insert(ks.end(),k.begin(),k.end());rec(n+1);ks.resize(ks.size()-k.size());}return;}
  for(const auto&w:lex){ClockOption o;o.allowed=chosen;bool ok=true;
   for(int i=0;i<int(w.size());i++){int p=fixed::val(w[i]),c=fixed::val(l.groups[g][i]),k=ks[i];if(k<0){if(p){ok=false;break;}continue;}if(!p||p==c||c==k){ok=false;break;}o.affine.e[o.affine.n++]={uint8_t(c),uint8_t(p),uint8_t(k)};o.feature[i]=k*29+p;}
   if(!ok)continue;aff::Space s;if(!aff::apply(base,o.affine,s))continue;string sig=signature(s);sig.append((char*)chosen.data(),sizeof(chosen));if(seen.insert(sig).second)out.opts.push_back(o);
  }
 };
 rec(0);out.post.resize(out.length);for(int i=0;i<out.length;i++){map<int,vector<int>> tmp;for(int j=0;j<int(out.opts.size());j++)tmp[out.opts[j].feature[i]].push_back(j);for(auto&a:tmp)out.post[i].push_back({a.first,move(a.second)});}return out;
}
bool allowedClock(const LineDomain&d,const ClockOption&o,const vector<Mask>&m){for(int i=0;i<int(d.slices.size());i++)if(!(m[d.slices[i].line]&o.allowed[i]))return false;return true;}
void restrictClock(const LineDomain&d,const ClockOption&o,vector<Mask>&m){for(int i=0;i<int(d.slices.size());i++)m[d.slices[i].line]&=o.allowed[i];}
struct Decoded{int cost=100000;vector<string> words;vector<int> states;};
Decoded scoreLayout(const Layout&l,const Pi&pi,const vector<Mask>&m,bool prefixMode,const string&prefix=""){
 vector<vector<string>> txt(l.lines.size());for(int i=0;i<int(l.lines.size());i++)for(auto&p:l.paths[i])txt[i].push_back(decode(l.lines[i],p,pi));
 vector<vector<int>> d(l.lines.size()),back(l.lines.size());
 auto word=[&](int g,int a,int b){string w;for(const auto&s:l.words[g]){int st=s.line==l.words[g].back().line?b:a;w+=txt[s.line][st].substr(s.from,s.to-s.from);}return w;};
 auto penalty=[&](int g,const string&w){if(prefixMode&&g+1==int(l.groups.size()))return fixed::prefixDict.count(w)?0:100000;return fixed::dict.count(g==0?prefix+w:w)?0:1;};
 for(int i=0;i<int(l.lines.size());i++){
  int n=l.paths[i].size();d[i].assign(n,100000);back[i].assign(n,-1);
  for(int b=0;b<n;b++)if(m[i]&(Mask(1)<<b)){
   int local=0;for(int g=0;g<int(l.words.size());g++)if(l.words[g].size()==1&&l.words[g][0].line==i)local+=penalty(g,word(g,b,b));
   if(i==0){d[i][b]=local;continue;}
   for(int a=0;a<int(d[i-1].size());a++)if(d[i-1][a]<100000){
    int z=d[i-1][a]+local;for(int g=0;g<int(l.words.size());g++)if(l.words[g].size()==2&&l.words[g].back().line==i)z+=penalty(g,word(g,a,b));
    if(z<d[i][b]){d[i][b]=z;back[i][b]=a;}
   }
  }
 }
 Decoded out;out.cost=*min_element(d.back().begin(),d.back().end());if(out.cost>=100000)return out;
 out.states.resize(l.lines.size());int q=min_element(d.back().begin(),d.back().end())-d.back().begin();
 for(int i=int(l.lines.size())-1;i>=0;i--){out.states[i]=q;q=back[i][q];}
 for(int g=0;g<int(l.words.size());g++)out.words.push_back(word(g,out.states[l.words[g][0].line],out.states[l.words[g].back().line]));
 if(!prefix.empty())out.words[0]=prefix+out.words[0];return out;
}

struct Stats{uint64_t nodes=0,joins=0,perms=0,featureTests=0,optionTests=0,clockPrunes=0;};
struct IndexedLineSearch{
 const Layout&l;aff::Space base=aff::base();vector<LineDomain> ds;vector<int> order;Clock::time_point deadline;
 atomic<bool> timed{false},found{false};atomic<size_t>next{0},done{0};mutex answerMutex;Pi answer{};Decoded result;Stats total;int budget;
 IndexedLineSearch(const Layout&layout,int b=3):l(layout),budget(b){
  vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  for(int i=0;i<int(l.groups.size());i++){ds.push_back(makeDomain(l,i,i==47?pre:fixed::by[l.groups[i].size()],base));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto f=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/ds[i].length;};double x=f(a),y=f(b);return x==y?a<b:x<y;});
 }
 bool stop(){if(found.load(memory_order_relaxed)||timed.load(memory_order_relaxed))return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 vector<int> domain(int g,aff::Filter&f,const vector<Mask>&m,size_t cap,Stats&c){
  auto&d=ds[g];size_t best=SIZE_MAX;vector<const vector<int>*> posting;
  for(int pos=0;pos<d.length;pos++){
   size_t count=0;vector<const vector<int>*> v;
   for(auto&[feature,list]:d.post[pos]){
    c.featureTests++;int k=feature/29,p=feature%29;
    if(p&&!(f.mask(fixed::val(l.groups[g][pos]),k)&(1u<<p)))continue;
    count+=list.size();v.push_back(&list);if(count>=best)break;
   }
   if(count<best){best=count;posting=move(v);if(!best)return {};}
  }
  vector<int> out;for(auto*v:posting)for(int id:*v){c.optionTests++;auto&o=d.opts[id];if(allowedClock(d,o,m)&&f.allowed(o.affine)){out.push_back(id);if(out.size()>=cap)return out;}}
  return out;
 }
 // Exact lower bound in the relaxation where each remaining word independently
 // selects an affine-compatible option, but all words share line states.
 // Options are unioned as masks, retaining cross-line pairs. No true key can
 // violate this relaxation. Compute forward/backward min-marginals to narrow
 // all line masks, including multiple OOVs forced only by incompatible starts.
 bool clockDP(const vector<int>&rem,aff::Filter&f,vector<Mask>&m,int b,Stats&c,vector<vector<int>>&domains){
  int n=l.lines.size();vector<vector<int>> local(n);vector<vector<vector<int>>> cross(n);
  for(int i=0;i<n;i++){
   int sz=l.paths[i].size();local[i].assign(sz,0);
   if(i)cross[i].assign(l.paths[i-1].size(),vector<int>(sz,0));
  }
  for(int g:rem){auto&d=ds[g];auto&ids=domains[g];ids=domain(g,f,m,SIZE_MAX,c);
   int a=d.slices[0].line;
   if(d.slices.size()==1){
    Mask u=0;for(int id:ids)u|=d.opts[id].allowed[0];
    for(int j=0;j<int(local[a].size());j++)if(!(u&(Mask(1)<<j)))local[a][j]++;
   }else{
    int z=d.slices[1].line;fixed::require(z==a+1,"adjacent line slices");
    vector<Mask> u(l.paths[a].size());for(int id:ids){auto&o=d.opts[id];Mask v=o.allowed[0]&m[a];while(v){int j=__builtin_ctzll(v);v&=v-1;u[j]|=o.allowed[1];}}
    for(int i=0;i<int(u.size());i++)for(int j=0;j<int(local[z].size());j++)if(!(u[i]&(Mask(1)<<j)))cross[z][i][j]++;
   }
  }
  const int INF=100000;vector<vector<int>> fw(n),bw(n);
  for(int i=0;i<n;i++){
   fw[i].assign(local[i].size(),INF);
   for(int j=0;j<int(local[i].size());j++)if(m[i]&(Mask(1)<<j)){
    if(!i)fw[i][j]=local[i][j];
    else for(int k=0;k<int(fw[i-1].size());k++)fw[i][j]=min(fw[i][j],fw[i-1][k]+cross[i][k][j]+local[i][j]);
   }
  }
  if(*min_element(fw.back().begin(),fw.back().end())>b){c.clockPrunes++;return false;}
  for(int i=n-1;i>=0;i--){
   bw[i].assign(local[i].size(),INF);
   for(int j=0;j<int(local[i].size());j++)if(m[i]&(Mask(1)<<j)){
    if(i+1==n)bw[i][j]=0;
    else for(int k=0;k<int(bw[i+1].size());k++)bw[i][j]=min(bw[i][j],bw[i+1][k]+cross[i+1][j][k]+local[i+1][k]);
   }
   Mask next=0;for(int j=0;j<int(fw[i].size());j++)if(fw[i][j]+bw[i][j]<=b)next|=Mask(1)<<j;
   m[i]&=next;if(!m[i]){c.clockPrunes++;return false;}
  }
  return true;
 }
 void check(const Pi&pi,const vector<Mask>&m,Stats&c){
  c.perms++;auto x=scoreLayout(l,pi,m,true);if(x.cost>budget)return;
  lock_guard<mutex> z(answerMutex);if(!found){answer=pi;result=move(x);found=true;}
 }
 void enumerate(const aff::Space&s,const vector<Mask>&m,Stats&c){
  vector<vector<int>> rows(s.d);array<uint8_t,29> param{};uint32_t used=0;Pi pi{};
  for(int x=0;x<29;x++){int j=s.d-1;while(j>=0&&!s.a[x][j])j--;if(j<0){int v=s.a[x][aff::L];if(used&(1u<<v))return;used|=1u<<v;pi[x]=v;}else rows[j].push_back(x);}
  auto visit=[&](auto&&self,int j,uint32_t mask)->void{if(stop())return;if(j==s.d){check(pi,m,c);return;}for(int v=0;v<29;v++){if(mask&(1u<<v))continue;param[j]=v;uint32_t z=mask;bool ok=true;for(int x:rows[j]){int a=s.a[x][aff::L];for(int k=0;k<=j;k++)a+=param[k]*s.a[x][k];a%=29;if(z&(1u<<a)){ok=false;break;}z|=1u<<a;pi[x]=a;}if(ok)self(self,j+1,z);if(stop())return;}};visit(visit,0,used);
 }
 void dfs(const aff::Space&s,vector<int>rem,int b,vector<Mask>m,Stats&c){
  if(stop())return;c.nodes++;if(s.d<=3||int(rem.size())<=b){enumerate(s,m,c);return;}
  if(s.d>24){enumerate(s,m,c);return;}
  aff::Filter f(s);if(f.saturated)return;
  bool dp=s.d<=12;vector<vector<int>> domains(l.groups.size());
  if(dp&&!clockDP(rem,f,m,b,c,domains))return;
  int pick=-1;vector<int>best;size_t cap=SIZE_MAX;int ntry=dp?int(rem.size()):min<int>(rem.size(),s.d>16?6:12);
  for(int i=0;i<ntry;){
   int g=rem[i];vector<int>d;
   if(dp){for(int id:domains[g])if(allowedClock(ds[g],ds[g].opts[id],m)){d.push_back(id);if(d.size()>=cap)break;}}
   else d=domain(g,f,m,cap,c);
   if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;
  }
  if(pick<0){enumerate(s,m,c);return;}int gid=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int id:best){if(stop())return;c.joins++;auto&o=ds[gid].opts[id];aff::Space t;if(!aff::apply(s,o.affine,t))continue;auto nextMask=m;restrictClock(ds[gid],o,nextMask);
   string sig=signature(t);sig.append((char*)nextMask.data(),nextMask.size()*sizeof(Mask));if(seen.insert(sig).second)dfs(t,rem,b,move(nextMask),c);}
  if(b)dfs(s,rem,b-1,m,c);
 }
 size_t seedsTotal=0;
 void run(int seconds){
  deadline=Clock::now()+chrono::seconds(seconds);
  vector<pair<aff::Space,vector<Mask>>> seeds;unordered_set<string>seen;
  for(auto&o:ds[47].opts){aff::Space t;if(!aff::apply(base,o.affine,t))continue;auto m=l.full;restrictClock(ds[47],o,m);string sig=signature(t);sig.append((char*)m.data(),m.size()*sizeof(Mask));if(seen.insert(sig).second)seeds.emplace_back(t,move(m));}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.first.d==b.first.d?signature(a.first)<signature(b.first):a.first.d<b.first.d;});seedsTotal=seeds.size();
  cout<<"INDEXED LINE CARRY seeds="<<seedsTotal<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
  unsigned n=max(1u,min(4u,thread::hardware_concurrency()));vector<Stats> stats(n);vector<thread>pool;
  for(unsigned t=0;t<n;t++)pool.emplace_back([&,t]{auto&c=stats[t];while(!stop()){size_t i=next.fetch_add(1);if(i>=seeds.size())break;dfs(seeds[i].first,order,budget,seeds[i].second,c);if(!found&&!timed)done++;}});
  for(auto&t:pool)t.join();for(auto&c:stats){total.nodes+=c.nodes;total.joins+=c.joins;total.perms+=c.perms;total.featureTests+=c.featureTests;total.optionTests+=c.optionTests;total.clockPrunes+=c.clockPrunes;}
  cout<<"INDEXED LINE SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<seedsTotal<<" nodes="<<total.nodes<<" joins="<<total.joins<<" permutations="<<total.perms<<" featureTests="<<total.featureTests<<" optionTests="<<total.optionTests<<" clockPrunes="<<total.clockPrunes<<" OOV="<<result.cost<<endl;
 }
};
const vector<int> L55{24,46,68};
Mask possibleSeam(const vector<string>&held){
 string line=join(held).substr(0,L55[0]);Mask m=0;for(int i=0;i<8;i++)if(!localPaths(line,i).empty())m|=Mask(1)<<i;return m;
}
bool plantGate(const vector<string>&shape,const vector<string>&held,unsigned seed){
 auto p=plant(shape,held,seed);Mask seam=possibleSeam(p.held);fixed::require(seam&(Mask(1)<<p.path.end),"true seam impossible");
 Layout l(p.train,LINE,-1,-1,seam);IndexedLineSearch s(l);s.run(480);
 bool exact=s.found&&s.answer==p.pi&&s.result.words==p.truth;bool hold=false;int end=-1;
 if(exact){end=l.paths.back()[s.result.states.back()].end;Layout h(p.held,L55,end);auto x=scoreLayout(h,s.answer,h.full,false,s.result.words.back());hold=x.cost==0&&x.words==p.holdTruth;}
 cout<<"INDEXED LINE CONTROL "<<seed<<" seamMask="<<seam<<" selectedEnd="<<end<<" exact="<<exact<<" holdout="<<hold<<endl;return exact&&hold;
}
int main(){try{
 aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 bool a=plantGate(train,held,3301),b=plantGate(train,held,1033);if(!a||!b){cout<<"INDEXED LINE ORIGINAL GATED OFF"<<endl;return 2;}
 Mask seam=possibleSeam(held);Layout l(train,LINE,-1,-1,seam);cout<<"ORIGINAL SEAM "<<seam<<" PATH COUNTS";for(auto&p:l.paths)cout<<" "<<p.size();cout<<endl;
 IndexedLineSearch s(l);s.run(1200);if(s.found){int end=l.paths.back()[s.result.states.back()].end;Layout h(held,L55,end);auto x=scoreLayout(h,s.answer,h.full,false,s.result.words.back());cout<<"CANDIDATE pi="<<aff::str(s.answer)<<" heldoutOOV="<<x.cost<<" seam="<<end<<endl;cout<<"TRAIN";for(auto&w:s.result.words)cout<<" "<<w;cout<<endl;cout<<"HELD";for(auto&w:x.words)cout<<" "<<w;cout<<endl;}
 bool exhausted=!s.found&&!s.timed&&s.done==s.seedsTotal;cout<<"INDEXED LINE ORIGINAL exhausted="<<exhausted<<endl;return exhausted?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
