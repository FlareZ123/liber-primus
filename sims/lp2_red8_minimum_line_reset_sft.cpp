// Source-mapped red8 with minimum phase discontinuities at printed line ends.
// Controls supply the schedule but not the plaintext or alphabet; original
// schedules are enumerated structurally before fitting. Physical p55 withheld.
#include <bits/stdc++.h>
#ifdef main
#define LP2_RED8_LINE_LIBRARY
#undef main
#endif
#define main old_numeric_main
namespace fixed {
#include "lp2_red8_fixed_numeric_cycle_carry_sft.cpp"
}
#undef main
#define main old_affine_main
namespace aff {
#include "lp2_shared_gp29_mapped_red8_exact.cpp"
}
#undef main
using namespace std;
using Pi=aff::Pi;using Clock=chrono::steady_clock;
const vector<int> LINE{10,31,48,71,93,115,136,159,180,202};
const array<int,8> K{19,21,23,27,2,14,10,19};
struct Path{vector<int> key,reset;int start=-1,end=-1;};
struct Paths{int cost;vector<Path> paths;};
string join(const vector<string>&g){string s;for(auto&w:g)s+=w;return s;}
vector<string> split(const string&s,const vector<string>&shape){vector<string> a;size_t n=0;for(auto&w:shape){a.push_back(s.substr(n,w.size()));n+=w.size();}fixed::require(n==s.size(),"split");return a;}
vector<int> boundaries(const vector<string>&g){vector<int> b;int n=0;for(size_t i=0;i+1<g.size();i++){n+=g[i].size();b.push_back(n);}return b;}
Paths schedules(const string&c,const vector<int>&bounds){
 int n=c.size();set<int>B(bounds.begin(),bounds.end());vector<array<int,8>> d(n+1);d[n].fill(0);
 for(int i=n-1;i>=0;i--)for(int p=0;p<8;p++){int x=fixed::val(c[i]),v=100000;for(int j=0;j<8;j++){if(j!=p&&!B.count(i))continue;int z=j!=p;if(!x)v=min(v,z+d[i+1][j]);if(x!=K[j])v=min(v,z+d[i+1][(j+1)%8]);}d[i][p]=v;}
 Paths out{*min_element(d[0].begin(),d[0].end()),{}};if(out.cost>=100000)return out;Path a;
 function<void(int,int)> rec=[&](int i,int p){if(i==n){a.end=p;out.paths.push_back(a);return;}int x=fixed::val(c[i]);for(int j=0;j<8;j++){if(j!=p&&!B.count(i))continue;int z=j!=p;if(z)a.reset.push_back(i);
  if(!x&&z+d[i+1][j]==d[i][p]){a.key.push_back(-1);rec(i+1,j);a.key.pop_back();}
  if(x!=K[j]&&z+d[i+1][(j+1)%8]==d[i][p]){a.key.push_back(K[j]);rec(i+1,(j+1)%8);a.key.pop_back();}
  if(z)a.reset.pop_back();}};for(int j=0;j<8;j++)if(d[0][j]==out.cost){a.start=j;rec(0,j);}return out;
}
Pi inverse(const Pi&pi){Pi ip{};for(int i=0;i<29;i++)ip[pi[i]]=i;return ip;}
string decode(const string&c,const Path&p,const Pi&pi){auto ip=inverse(pi);string s;for(size_t i=0;i<c.size();i++){int k=p.key[i],x=fixed::val(c[i]);int a=k<0?0:ip[aff::sub[pi[x]][pi[k]]];fixed::require(k<0?!x:a!=0,"illegal F");s+=fixed::SYM[a];}return s;}
string signature(const aff::Space&s){string t((const char*)s.vars,29);t.append((const char*)s.a,29*29);return t;}
struct Group{vector<aff::Option> opts;int ordinary=0;};
Group domain(const string&c,const vector<int>&ks,const vector<string>&words,const aff::Space&base){
 Group g;g.ordinary=count_if(ks.begin(),ks.end(),[](int k){return k>=0;});unordered_set<string>seen;
 for(auto&w:words){aff::Option o;bool ok=true;for(size_t i=0;i<w.size();i++){int p=fixed::val(w[i]),x=fixed::val(c[i]),k=ks[i];if(k<0){if(p){ok=false;break;}continue;}if(!p||p==x||k==x){ok=false;break;}o.e[o.n++]={uint8_t(x),uint8_t(p),uint8_t(k)};}if(!ok)continue;aff::Space s;if(!aff::apply(base,o,s))continue;if(seen.insert(signature(s)).second)g.opts.push_back(o);}return g;
}
struct Search{
 vector<string> groups;string cipher;Path path;aff::Space base=aff::base();vector<Group> ds;vector<int> order;Clock::time_point deadline;
 bool timed=false,found=false;Pi answer{};int oov=-1;uint64_t nodes=0,joins=0,perms=0,done=0,total=0;
 Search(const vector<string>&g,const Path&p):groups(g),cipher(join(g)),path(p){vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());size_t at=0;for(int i=0;i<48;i++){auto&w=g[i];vector<int> k(p.key.begin()+at,p.key.begin()+at+w.size());at+=w.size();ds.push_back(domain(w,k,i==47?pre:fixed::by[w.size()],base));if(i!=47)order.push_back(i);}
 sort(order.begin(),order.end(),[&](int a,int b){auto f=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/max(1,ds[i].ordinary);};double x=f(a),y=f(b);return x==y?a<b:x<y;});}
 bool stop(){if(found||timed)return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 void check(const Pi&pi){perms++;auto w=split(decode(cipher,path,pi),groups);if(!fixed::prefixDict.count(w.back()))return;int n=0;for(int i:order)if(!fixed::dict.count(w[i])&&++n>3)return;answer=pi;oov=n;found=true;}
 void enumerate(const aff::Space&s){vector<vector<int>> rows(s.d);array<uint8_t,29> param{};uint32_t used=0;Pi pi{};
 for(int x=0;x<29;x++){int j=s.d-1;while(j>=0&&!s.a[x][j])j--;if(j<0){int v=s.a[x][aff::L];if(used&(1u<<v))return;used|=1u<<v;pi[x]=v;}else rows[j].push_back(x);}
 auto visit=[&](auto&&self,int j,uint32_t mask)->void{if(stop())return;if(j==s.d){check(pi);return;}for(int v=0;v<29;v++){if(mask&(1u<<v))continue;param[j]=v;uint32_t m=mask;bool ok=true;for(int x:rows[j]){int z=s.a[x][aff::L];for(int k=0;k<=j;k++)z+=param[k]*s.a[x][k];z%=29;if(m&(1u<<z)){ok=false;break;}m|=1u<<z;pi[x]=z;}if(ok)self(self,j+1,m);if(found||timed)return;}};visit(visit,0,used);}
 void dfs(const aff::Space&s,vector<int> rem,int budget){if(stop())return;nodes++;if(s.d<=3||int(rem.size())<=budget){enumerate(s);return;}
 unique_ptr<aff::Filter> f;if(s.d<=24){f=make_unique<aff::Filter>(s);if(f->saturated)return;}int pick=-1;vector<int> best;size_t cap=SIZE_MAX;int ntry=min<int>(rem.size(),s.d>15?6:12);
 for(int i=0;i<ntry;){vector<int>d;auto&g=ds[rem[i]];for(int j=0;j<int(g.opts.size());j++){if(!f||f->allowed(g.opts[j]))d.push_back(j);if(d.size()>=cap)break;}if(d.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;}
 if(pick<0){enumerate(s);return;}int gid=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string> seen;
 for(int i:best){if(stop())return;joins++;aff::Space t;if(aff::apply(s,ds[gid].opts[i],t)&&seen.insert(signature(t)).second)dfs(t,rem,budget);}if(budget)dfs(s,rem,budget-1);}
 void run(int seconds){deadline=Clock::now()+chrono::seconds(seconds);vector<aff::Space> seeds;for(auto&o:ds[47].opts){aff::Space t;if(aff::apply(base,o,t))seeds.push_back(t);}sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.d<b.d;});total=seeds.size();cout<<"CARRY seeds="<<total<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
 for(auto&s:seeds){if(stop())break;dfs(s,order,3);if(!found&&!timed)done++;}cout<<"SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<total<<" nodes="<<nodes<<" joins="<<joins<<" perms="<<perms<<" OOV="<<oov<<endl;}
};
vector<vector<string>> holdout(const vector<string>&held,const string&prefix,const Pi&pi,int j){auto ip=inverse(pi);vector<vector<string>>out;vector<string> words;
 function<void(int,int)> group=[&](int g,int phase){if(g==int(held.size())){out.push_back(words);return;}string w=g?string():prefix;auto&c=held[g];function<void(int,int)>walk=[&](int i,int p){if(i==int(c.size())){if(fixed::dict.count(w)){words.push_back(w);group(g+1,p);words.pop_back();}return;}int x=fixed::val(c[i]);if(!x){w+='0';walk(i+1,p);w.pop_back();}int a=ip[aff::sub[pi[x]][pi[K[p]]]];if(a){w+=fixed::SYM[a];walk(i+1,(p+1)%8);w.pop_back();}};walk(0,phase);};group(0,j);return out;}
struct Plant{vector<string>train,held,truth,holdTruth;Pi pi;Path path;};
Plant plant(const vector<string>&shape,const vector<string>&held,unsigned seed){mt19937 rng(seed);Plant p;for(int i=0;i<29;i++)p.pi[i]=i;shuffle(p.pi.begin()+1,p.pi.end(),rng);int inv=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][inv];auto ip=inverse(p.pi);auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};for(int i=0;i<47;i++)p.truth.push_back(choose(shape[i].size()));string carry=choose(11);p.truth.push_back(carry.substr(0,10));p.holdTruth.push_back(carry);for(size_t i=1;i<held.size();i++)p.holdTruth.push_back(choose(held[i].size()));string plain=join(p.truth)+carry.substr(10);for(size_t i=1;i<p.holdTruth.size();i++)plain+=p.holdTruth[i];string c;int j=rng()%8;p.path.start=j;set<int> resets{seed==3301?31:71,93};for(int i=0;i<int(plain.size());i++){if(resets.count(i)){j=(j+1+rng()%7)%8;p.path.reset.push_back(i);}int a=fixed::val(plain[i]);if(i<223)p.path.key.push_back(a?K[j]:-1);if(a){c+=fixed::SYM[ip[(p.pi[a]+p.pi[K[j]])%29]];j=(j+1)%8;}else c+='0';if(i==222)p.path.end=j;}p.train=split(c.substr(0,223),shape);p.held=split(c.substr(223),held);return p;}
bool control(const vector<string>&shape,const vector<string>&held,unsigned seed){auto p=plant(shape,held,seed);Search s(p.train,p.path);s.run(90);bool exact=s.found&&s.answer==p.pi,truth=false;size_t n=0;if(s.found){auto w=split(decode(join(p.train),p.path,s.answer),p.train);auto h=holdout(p.held,w.back(),s.answer,p.path.end);n=h.size();truth=find(h.begin(),h.end(),p.holdTruth)!=h.end();}bool pass=exact&&truth&&s.oov==0;cout<<"CONTROL "<<seed<<" exact="<<exact<<" heldoutTruth="<<truth<<" fullPaths="<<n<<" passed="<<pass<<endl;return pass;}
#ifndef LP2_RED8_LINE_LIBRARY
int main(){try{aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&join(train).size()==223&&train.back()=="63g2eis46q"&&held.size()==17&&held[0]=="l","source profile");
 auto lm=schedules(join(train),LINE),wm=schedules(join(train),boundaries(train));fixed::require(lm.cost==2&&lm.paths.size()==11&&wm.cost==2&&wm.paths.size()==85,"structural source result");
 cout<<"MINIMUM line="<<lm.cost<<" paths="<<lm.paths.size()<<" word="<<wm.cost<<" paths="<<wm.paths.size()<<endl;for(size_t i=0;i<lm.paths.size();i++){auto&p=lm.paths[i];cout<<"PATH "<<i<<" start="<<p.start<<" end="<<p.end<<" resets";for(int x:p.reset)cout<<" "<<x;cout<<endl;}
 bool a=control(train,held,3301),b=control(train,held,1033);if(!a||!b){cout<<"ORIGINAL GATED OFF"<<endl;return 1;}int exhausted=0;for(size_t i=0;i<lm.paths.size();i++){cout<<"ORIGINAL PATH "<<i<<endl;Search s(train,lm.paths[i]);s.run(40);if(s.found){auto w=split(decode(join(train),lm.paths[i],s.answer),train);auto h=holdout(held,w.back(),s.answer,lm.paths[i].end);cout<<"ORIGINAL candidate pi="<<aff::str(s.answer)<<" OOV="<<s.oov<<" fullHoldoutPaths="<<h.size()<<endl;for(size_t n=0;n<min<size_t>(5,h.size());n++){cout<<"HOLD";for(auto&x:h[n])cout<<" "<<x;cout<<endl;}return 1;}if(!s.timed&&s.done==s.total)exhausted++;}
 cout<<"ORIGINAL exhausted="<<exhausted<<"/"<<lm.paths.size()<<" no key"<<endl;return 1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}

#endif
