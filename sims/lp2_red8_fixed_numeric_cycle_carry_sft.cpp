// Exact fixed-red8 numeric common-cycle receiver on corrected p54 carry.
// Reuses the 38,938-form lexicon and source profile. No target suffix/p55 glyph
// enters the fit. Existing manual C++17 workflow; no dependencies.
#include <bits/stdc++.h>
using namespace std;
using U=uint32_t; using B=uint64_t;
constexpr int N=29,Q=8; constexpr U ALL=(1u<<N)-1;
const string SYM="0123456789abcdefghijklmnopqrs";
const vector<string> ALPHA={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
using Key=array<int,Q>; using Perm=array<int,N>;
using Clock=chrono::steady_clock;
int md(int a){return (a%N+N)%N;}
U rot(U x,int d){return d?((x<<d)|(x>>(N-d)))&ALL:x;}
int val(char c){auto p=SYM.find(c);if(p==string::npos)throw runtime_error("bad GP glyph");return int(p);}
string read(const string& p){ifstream f(p);if(!f)throw runtime_error("missing "+p);return string(istreambuf_iterator<char>(f),{});}
void require(bool x,const string&m){if(!x)throw runtime_error(m);}
string field(const string&s,const string& k,size_t from=0){size_t a=s.find("\""+k+"\"",from);require(a!=string::npos,"field "+k);a=s.find(':',a);a=s.find('"',a);size_t b=s.find('"',a+1);return s.substr(a+1,b-a-1);}
vector<string> strings(const string&s,const string&k,size_t from=0){size_t a=s.find("\""+k+"\"",from);require(a!=string::npos,"array "+k);a=s.find('[',a);size_t end=s.find(']',a);vector<string> o;while((a=s.find('"',a+1))<end){size_t b=s.find('"',a+1);o.push_back(s.substr(a+1,b-a-1));a=b;}return o;}
Key numbers(const string&s,const string&k){size_t a=s.find("\""+k+"\"");require(a!=string::npos,"numeric array "+k);a=s.find('[',a);size_t b=s.find(']',a);string t=s.substr(a+1,b-a-1);replace(t.begin(),t.end(),',',' ');istringstream in(t);Key out;for(int&i:out)require(bool(in>>i),"key length");return out;}
vector<vector<string>> by(60);unordered_set<string> dict,prefixDict;
void addVariants(const string& word){string s;for(size_t i=0;i<word.size();i++){char c=toupper(word[i]);if(c=='Q'&&i+1<word.size()&&toupper(word[i+1])=='U'){s+="CW";i++;continue;}if(c=='V')c='U';if(c=='K'||c=='Q')c='C';if(c=='Z')c='S';s+=c;}
 string w;function<void(size_t)> rec=[&](size_t i){if(i==s.size()){dict.insert(w);return;}for(int n=1;n<=3&&i+n<=s.size();n++){string t=s.substr(i,n);int x=-1;if(n==3){if(t=="ING")x=21;}else{auto p=find(ALPHA.begin(),ALPHA.end(),t);if(p!=ALPHA.end())x=int(p-ALPHA.begin());}if(x>=0){w+=SYM[x];rec(i+n);w.pop_back();}}};rec(0);}
void dictionary(){istringstream f(read("resources/control/english_wordfreq_textblob.txt"));string line;while(getline(f,line)){istringstream in(line);string w,n,extra;if(!(in>>w>>n)||in>>extra)continue;if(w.empty()||!all_of(w.begin(),w.end(),[](char c){return c>='a'&&c<='z';})||n.empty()||!all_of(n.begin(),n.end(),[](char c){return c>='0'&&c<='9';}))continue;addVariants(w);}
 require(dict.size()==38910,"base dictionary "+to_string(dict.size()));
 istringstream adds(field(read("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"),"added"));string w;while(adds>>w)dict.insert(w);
 require(dict.size()==38938,"full dictionary "+to_string(dict.size()));for(const auto&w:dict){require(w.size()<by.size(),"long lexicon");by[w.size()].push_back(w);if(w.size()==11)prefixDict.insert(w.substr(0,10));}for(auto&v:by)sort(v.begin(),v.end());}
struct Edge{uint8_t p,c,j;};
struct Graph{
 array<uint8_t,N> r{},o{},s{};array<U,N> m{};int comps=N;
 Graph(){for(int i=0;i<N;i++){r[i]=i;s[i]=1;m[i]=1;}}
 bool allow(int p,int c,int k)const{int a=r[p],b=r[c],d=md(k+o[p]-o[c]);return a==b?d==0:!(m[a]&rot(m[b],d));}
 bool add(int p,int c,int k){int a=r[p],b=r[c],d=md(k+o[p]-o[c]);if(a==b)return d==0;
  if(s[a]<s[b]){swap(a,b);d=md(-d);}U z=rot(m[b],d);if(z&m[a])return false;
  for(int i=0;i<N;i++)if(r[i]==b){r[i]=a;o[i]=md(o[i]+d);}m[a]|=z;s[a]+=s[b];comps--;return true;}
 string sig()const{array<int,N> first;first.fill(-1);string t;t.reserve(58);for(int i=0;i<N;i++){int a=r[i];if(first[a]<0)first[a]=i;t+=SYM[first[a]];t+=SYM[md(o[i]-o[first[a]])];}return t;}
};
struct Option{string w;vector<Edge> e;};
struct Mask{Edge e;vector<B> bits;};
struct Group{string c;vector<Option> opts;vector<Mask> masks;};
bool extend(Graph&g,const Option&o,int start,const Key&k){for(auto e:o.e)if(!g.add(e.p,e.c,k[(e.j+start)&7]))return false;return true;}
Group build(const string& c,const vector<string>& words,const Key& key){Group g;g.c=c;
 for(const string&w:words){require(w.size()==c.size(),"word length");Option opt;opt.w=w;int j=0;bool good=true;
  for(size_t i=0;i<c.size();i++){int p=val(w[i]),x=val(c[i]);if(!p){if(x){good=false;break;}continue;}if(p==x){good=false;break;}opt.e.push_back({uint8_t(p),uint8_t(x),uint8_t(j)});j=(j+1)&7;}
  if(!good)continue;bool feasible=false;for(int start=0;start<Q&&!feasible;start++){Graph a;feasible=extend(a,opt,start,key);}if(feasible)g.opts.push_back(move(opt));}
 int n=g.opts.size(),nw=(n+63)/64;array<int,N*N*Q> idx;idx.fill(-1);
 for(int i=0;i<n;i++)for(auto e:g.opts[i].e){int id=(e.p*N+e.c)*Q+e.j;if(idx[id]<0){idx[id]=g.masks.size();g.masks.push_back({e,vector<B>(nw)});}g.masks[idx[id]].bits[i/64]|=B(1)<<(i&63);}
 return g;
}
struct Filter{
 const Graph&g;const Key&k;array<int8_t,N*N*Q> cache;
 Filter(const Graph&a,const Key&b):g(a),k(b){cache.fill(-1);}
 bool allow(Edge e,int start){int j=(e.j+start)&7,id=(e.p*N+e.c)*Q+j;auto&v=cache[id];if(v<0)v=g.allow(e.p,e.c,k[j]);return v;}
};
struct Domain{vector<pair<int,int>> entries;bool clipped=false;};
Domain domain(const Group&g,Filter&f,size_t cap=SIZE_MAX){Domain d;int n=g.opts.size(),nw=(n+63)/64;if(!n)return d;vector<B> bits(nw);
 for(int start=0;start<Q;start++){fill(bits.begin(),bits.end(),~B(0));if(n&63)bits.back()=(B(1)<<(n&63))-1;
  for(const auto&m:g.masks)if(!f.allow(m.e,start))for(int j=0;j<nw;j++)bits[j]&=~m.bits[j];
  for(int j=0;j<nw;j++){B b=bits[j];while(b){d.entries.push_back({j*64+__builtin_ctzll(b),start});if(d.entries.size()>=cap){d.clipped=true;return d;}b&=b-1;}}
 }return d;}
array<array<int,N>,Q> maps(const Perm&pi,const Key&k){Perm inv;for(int i=0;i<N;i++)inv[pi[i]]=i;array<array<int,N>,Q> m;for(int j=0;j<Q;j++)for(int c=0;c<N;c++)m[j][c]=inv[md(pi[c]-k[j])];return m;}
using Maps=array<array<int,N>,Q>;
bool decode_rec(const string&c,const Maps&m,int i,int j,string&w,const unordered_set<string>&D,set<string>*out){if(i==(int)c.size()){if(!D.count(w))return false;if(out)out->insert(w);return true;}int x=val(c[i]);bool yes=false;if(!x){w[i]='0';yes=decode_rec(c,m,i+1,j,w,D,out);if(yes&&!out)return true;}int p=m[j][x];if(p){w[i]=SYM[p];yes=decode_rec(c,m,i+1,(j+1)&7,w,D,out)||yes;}return yes;}
bool support(const string&c,const Maps&m,const unordered_set<string>&D){string w(c.size(),'0');for(int j=0;j<Q;j++)if(decode_rec(c,m,0,j,w,D,nullptr))return true;return false;}
set<string> decode(const string&c,const Maps&m,const unordered_set<string>&D){string w(c.size(),'0');set<string> out;for(int j=0;j<Q;j++)decode_rec(c,m,0,j,w,D,&out);return out;}
string encode(const string&w,const Perm&pi,const Key&k,int j){Perm inv;for(int i=0;i<N;i++)inv[pi[i]]=i;string c;for(char a:w){int p=val(a);if(!p)c+='0';else{c+=SYM[inv[md(pi[p]+k[j])]];j=(j+1)&7;}}return c;}
bool sameAction(const Perm&a,const Perm&b,const Key&k){auto x=maps(a,k),y=maps(b,k);for(int j=0;j<Q;j++){bool yes=true;for(int i=0;i<Q;i++)yes&=x[i]==y[(i+j)&7];if(yes)return true;}return false;}
struct Search{
 const Key key;vector<Group> g;Group carry;vector<int> order;Clock::time_point start,end;bool found=false,timed=false;Perm answer{};int answerOov=-1;uint64_t nodes=0,edges=0,perms=0,packingClipped=0,residual=0,seedDone=0,seedTotal=0;
 Search(Key k,const vector<string>&train,const string&prefix):key(k){vector<string> p(prefixDict.begin(),prefixDict.end());sort(p.begin(),p.end());carry=build(prefix,p,key);for(const auto&c:train)g.push_back(build(c,by[c.size()],key));order.resize(g.size());iota(order.begin(),order.end(),0);
  sort(order.begin(),order.end(),[&](int a,int b){auto score=[&](int i){return log2(double(max<size_t>(1,g[i].opts.size()*8)))/max(1,int(g[i].c.size()-count(g[i].c.begin(),g[i].c.end(),'0')));};double x=score(a),y=score(b);return x==y?a<b:x<y;});}
 bool stop(){if(found)return true;if(Clock::now()>=end){timed=true;return true;}return false;}
 bool check(const Perm&pi){perms++;auto m=maps(pi,key);if(!support(carry.c,m,prefixDict))return false;int bad=0;for(int i:order)if(!support(g[i].c,m,dict)&&++bad>3)return false;found=true;answer=pi;answerOov=bad;return true;}
 // Enumerate exact disjoint translates of graph components, with pi(F)=0.
 // Every graph solution occurs once. On cap, do not call the state exhausted.
 bool complete(const Graph&a,uint64_t cap){vector<int> roots;int f=a.r[0];for(int i=0;i<N;i++)if(a.r[i]==i&&i!=f)roots.push_back(i);
  sort(roots.begin(),roots.end(),[&](int x,int y){return a.s[x]>a.s[y];});array<int,N> base{};base[f]=md(-a.o[0]);U used=rot(a.m[f],base[f]);uint64_t visits=0;bool clipped=false;
  function<void(int,U)> walk=[&](int j,U mask){if(found||clipped||timed)return;if((++visits&4095)==0&&stop())return;if(visits>cap){clipped=true;return;}
   if(j==(int)roots.size()){Perm pi;for(int i=0;i<N;i++)pi[i]=md(base[a.r[i]]+a.o[i]);check(pi);return;}
   int r=roots[j];for(int v=0;v<N;v++){U z=rot(a.m[r],v);if(!(mask&z)){base[r]=v;walk(j+1,mask|z);if(found||clipped||timed)return;}}
  };walk(0,used);if(clipped)packingClipped++;return !clipped&&!timed;}
 void dfs(const Graph&a,vector<int> rem,int budget,int level){if(found||timed)return;if((++nodes&255)==0&&stop())return;
  if(a.comps<=7&&complete(a,20000))return;if(found||timed)return;
  if(rem.empty()||int(rem.size())<=budget){if(!complete(a,20000))residual++;return;} // unresolved when capped
  Filter f(a,key);int choice=-1;Domain best;size_t cap=SIZE_MAX;
  // Only rank the most informative remaining groups first, but eventually
  // branch all of them. Zero-domain removal is exact.
  int ntry=min(int(rem.size()),level<=1?4:6);
  for(int i=0;i<ntry;){Domain d=domain(g[rem[i]],f,cap);
   if(!d.clipped&&d.entries.empty()){if(!budget)return;budget--;rem.erase(rem.begin()+i);ntry--;if(choice>i)choice--;continue;}
   if(choice<0||(!d.clipped&&d.entries.size()<best.entries.size())){best=move(d);choice=i;cap=best.entries.size();}
   i++;
  }
  if(choice<0){if(!complete(a,20000))residual++;return;}
  int gid=rem[choice];rem.erase(rem.begin()+choice);const Group&b=g[gid];unordered_set<string> seen;
  for(auto [i,j]:best.entries){if(found||timed)return;if((++edges&4095)==0&&stop())return;Graph x=a;if(!extend(x,b.opts[i],j,key))continue;auto sig=x.sig();if(!seen.insert(sig).second)continue;dfs(x,rem,budget,level+1);}
  if(budget>0)dfs(a,rem,budget-1,level+1);
 }
 void run(int seconds){start=Clock::now();end=start+chrono::seconds(seconds);vector<Graph> seeds;unordered_set<string> seen;
  for(const auto&o:carry.opts)for(int j=0;j<Q;j++){Graph a;if(extend(a,o,j,key)&&seen.insert(a.sig()).second)seeds.push_back(a);}
  sort(seeds.begin(),seeds.end(),[](const Graph&a,const Graph&b){if(a.comps!=b.comps)return a.comps<b.comps;return a.sig()<b.sig();});seedTotal=seeds.size();
  cout<<"carry seeds "<<seedTotal<<" / words "<<carry.opts.size()<<" group options";for(int i:order)cout<<" "<<i<<":"<<g[i].opts.size();cout<<endl;
  for(const auto&a:seeds){if(stop())break;dfs(a,order,3,0);if(!timed&&!found)seedDone++;if(seedDone&&seedDone%20==0)cout<<"progress "<<seedDone<<"/"<<seedTotal<<" nodes="<<nodes<<" edges="<<edges<<" perms="<<perms<<endl;}
  cout<<"search found="<<found<<" timed="<<timed<<" seedDone="<<seedDone<<" seedTotal="<<seedTotal<<" nodes="<<nodes<<" edges="<<edges<<" perms="<<perms<<" packingClipped="<<packingClipped<<" residual="<<residual<<" oov="<<answerOov<<" seconds="<<chrono::duration<double>(Clock::now()-start).count()<<endl;
  if(found){cout<<"pi";for(int x:answer)cout<<" "<<x;cout<<endl;}
 }
};
struct Fixture{vector<string> train,hold;string prefix,carry;vector<string> truthTrain,truthHold;string truthCarry;Perm pi;};
Fixture plant(const vector<string>& train,const vector<string>&hold,const Key&k,unsigned seed){mt19937 rng(seed);Fixture x;for(int i=0;i<N;i++)x.pi[i]=i;shuffle(x.pi.begin()+1,x.pi.end(),rng);
 auto choose=[&](int n){const auto&v=by[n];return v[rng()%v.size()];};for(const auto&c:train){auto w=choose(c.size());x.truthTrain.push_back(w);x.train.push_back(encode(w,x.pi,k,rng()%8));}
 x.truthCarry=choose(11);x.carry=encode(x.truthCarry,x.pi,k,rng()%8);x.prefix=x.carry.substr(0,10);
 for(const auto&c:hold){auto w=choose(c.size());x.truthHold.push_back(w);x.hold.push_back(encode(w,x.pi,k,rng()%8));}
 return x;}
bool control(const vector<string>&train,const vector<string>&hold,const Key&k,unsigned seed){
 auto p=plant(train,hold,k,seed);auto m=maps(p.pi,k);require(support(p.prefix,m,prefixDict),"planted prefix rejected");for(const auto&c:p.train)require(support(c,m,dict),"plant word rejected");
 // Check graph compatibility of the true action on all synthetic groups.
 Search s(k,p.train,p.prefix);s.run(180);if(!s.found){cout<<"CONTROL "<<seed<<" failed no key"<<endl;return false;}
 auto got=maps(s.answer,k);int hit=0,unique=0;auto d=decode(p.carry,got,dict);hit+=d.count(p.truthCarry);unique+=d.size()==1&&d.count(p.truthCarry);
 for(size_t i=0;i<p.hold.size();i++){d=decode(p.hold[i],got,dict);hit+=d.count(p.truthHold[i]);unique+=d.size()==1&&d.count(p.truthHold[i]);}
 bool exact=sameAction(p.pi,s.answer,k),pass=exact&&s.answerOov==0&&hit==17&&unique>=8;
 cout<<"CONTROL "<<seed<<" exact="<<exact<<" holdTruth="<<hit<<"/17 unique="<<unique<<" passed="<<pass<<endl;return pass;}
int main(){try{dictionary();string src=read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto body=strings(src,"body_groups"),p55=strings(src,"groups",src.rfind("\"p55\""));
 require(body.size()==48&&body.back()=="63g2eis46q"&&p55.size()==17&&p55[0]=="l","physical carry");
 vector<string> train(body.begin(),body.end()-1),hold(p55.begin()+1,p55.end());require(accumulate(train.begin(),train.end(),size_t(0),[](size_t a,const string&b){return a+b.size();})==213,"train count");require(accumulate(hold.begin(),hold.end(),size_t(0),[](size_t a,const string&b){return a+b.size();})==75,"hold count");
 auto a=numbers(src,"gp29_indices"),b=numbers(src,"prime_mod29");require(a==Key{19,21,23,27,2,14,10,19}&&b==Key{13,21,2,20,5,18,2,13},"red8 key");
 for(int variant=0;variant<2;variant++){Key k=variant?b:a;cout<<"VARIANT "<<(variant?"prime":"ordinal")<<endl;
  bool p1=control(train,hold,k,3301+variant*100),p2=control(train,hold,k,1033+variant*100);
  if(!p1||!p2){cout<<"ORIGINAL GATED OFF: blind controls failed"<<endl;continue;}
  Search s(k,train,body.back());s.run(420);
  if(!s.found){cout<<"ORIGINAL no key; exact exclusion only if !timed and residual==0 and all seeds completed"<<endl;continue;}
  auto m=maps(s.answer,k);vector<string> held{body.back()+p55[0]};held.insert(held.end(),hold.begin(),hold.end());cout<<"ORIGINAL frozen holdout"<<endl;
  for(size_t i=0;i<held.size();i++){auto d=decode(held[i],m,dict);cout<<i<<" "<<held[i]<<" candidates="<<d.size();int n=0;for(const auto&w:d){if(n++>=5)break;cout<<" "<<w;}cout<<endl;}
 }
 cout<<"Diagnostic exit 1 permits targeted failed-job log retrieval; interpret explicit CONTROL and search statuses."<<endl;return 1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
