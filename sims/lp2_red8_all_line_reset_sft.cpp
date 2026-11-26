// Exact independent printed-line starts; p54/p55 carry cannot reset at page seam.
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
 Layout(const vector<string>&g,vector<int>bounds,int start=-1,int end=-1):groups(g){
  string c=join(g);bounds.insert(bounds.begin(),0);bounds.push_back(c.size());
  for(int i=0;i+1<int(bounds.size());i++){lines.push_back(c.substr(bounds[i],bounds[i+1]-bounds[i]));paths.push_back(localPaths(lines.back(),i==0?start:-1,i+2==int(bounds.size())?end:-1));
   size_t n=paths.back().size();fixed::require(n>0&&n<64,"line path capacity");full.push_back((Mask(1)<<n)-1);}
  int at=0;for(auto&w:g){int next=at+w.size();vector<Slice> s;for(int i=0;i<int(lines.size());i++){int a=max(at,bounds[i]),b=min(next,bounds[i+1]);if(a<b)s.push_back({i,a-bounds[i],b-bounds[i]});}fixed::require(s.size()<=2,"word crosses >2 lines");words.push_back(s);at=next;}
 }
};
struct ClockOption{aff::Option affine;array<Mask,2> allowed{};};
struct LineDomain{vector<ClockOption> opts;vector<Slice> slices;int length;};
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
   for(int i=0;i<int(w.size());i++){int p=fixed::val(w[i]),c=fixed::val(l.groups[g][i]),k=ks[i];if(k<0){if(p){ok=false;break;}continue;}if(!p||p==c||c==k){ok=false;break;}o.affine.e[o.affine.n++]={uint8_t(c),uint8_t(p),uint8_t(k)};}
   if(!ok)continue;aff::Space s;if(!aff::apply(base,o.affine,s))continue;string sig=signature(s);sig.append((char*)chosen.data(),sizeof(chosen));if(seen.insert(sig).second)out.opts.push_back(o);
  }
 };
 rec(0);return out;
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
struct LineSearch{
 const Layout&l;aff::Space base=aff::base();vector<LineDomain> ds;vector<int> order;Clock::time_point deadline;
 bool timed=false,found=false;Pi answer{};Decoded result;uint64_t nodes=0,joins=0,perms=0,done=0,total=0;int budget;
 LineSearch(const Layout&layout,int b=3):l(layout),budget(b){
  vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());
  for(int i=0;i<int(l.groups.size());i++){ds.push_back(makeDomain(l,i,i==47?pre:fixed::by[l.groups[i].size()],base));if(i!=47)order.push_back(i);}
  sort(order.begin(),order.end(),[&](int a,int b){auto f=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/ds[i].length;};double x=f(a),y=f(b);return x==y?a<b:x<y;});
 }
 bool stop(){if(found||timed)return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 void check(const Pi&pi,const vector<Mask>&m){perms++;auto x=scoreLayout(l,pi,m,true);if(x.cost<=budget){found=true;answer=pi;result=move(x);}}
 void enumerate(const aff::Space&s,const vector<Mask>&m){
  vector<vector<int>> rows(s.d);array<uint8_t,29> param{};uint32_t used=0;Pi pi{};
  for(int x=0;x<29;x++){int j=s.d-1;while(j>=0&&!s.a[x][j])j--;if(j<0){int v=s.a[x][aff::L];if(used&(1u<<v))return;used|=1u<<v;pi[x]=v;}else rows[j].push_back(x);}
  auto visit=[&](auto&&self,int j,uint32_t mask)->void{if(stop())return;if(j==s.d){check(pi,m);return;}for(int v=0;v<29;v++){if(mask&(1u<<v))continue;param[j]=v;uint32_t z=mask;bool ok=true;
    for(int x:rows[j]){int a=s.a[x][aff::L];for(int k=0;k<=j;k++)a+=param[k]*s.a[x][k];a%=29;if(z&(1u<<a)){ok=false;break;}z|=1u<<a;pi[x]=a;}if(ok)self(self,j+1,z);if(found||timed)return;}};visit(visit,0,used);
 }
 void dfs(const aff::Space&s,vector<int>rem,int b,const vector<Mask>&m){
  if(stop())return;nodes++;if(s.d<=3||int(rem.size())<=b){enumerate(s,m);return;}
  unique_ptr<aff::Filter> f;if(s.d<=24){f=make_unique<aff::Filter>(s);if(f->saturated)return;}
  int pick=-1;vector<int> best;size_t cap=SIZE_MAX;int ntry=min<int>(rem.size(),s.d>15?6:12);
  for(int i=0;i<ntry;){vector<int>d;auto&g=ds[rem[i]];for(int j=0;j<int(g.opts.size());j++){auto&o=g.opts[j];if(allowedClock(g,o,m)&&(!f||f->allowed(o.affine)))d.push_back(j);if(d.size()>=cap)break;}
   if(d.empty()){if(!b)return;b--;rem.erase(rem.begin()+i);ntry--;if(pick>i)pick--;continue;}
   if(pick<0||d.size()<cap){pick=i;best=move(d);cap=best.size();}i++;
  }
  if(pick<0){enumerate(s,m);return;}int gid=rem[pick];rem.erase(rem.begin()+pick);unordered_set<string>seen;
  for(int id:best){if(stop())return;joins++;auto&o=ds[gid].opts[id];aff::Space t;if(!aff::apply(s,o.affine,t))continue;auto next=m;restrictClock(ds[gid],o,next);
   string sig=signature(t);sig.append((char*)next.data(),next.size()*sizeof(Mask));if(seen.insert(sig).second)dfs(t,rem,b,next);}
  if(b)dfs(s,rem,b-1,m);
 }
 void run(int seconds){deadline=Clock::now()+chrono::seconds(seconds);total=ds[47].opts.size();cout<<"LINE CARRY seeds="<<total<<" domains";for(int i:order)cout<<" "<<i<<":"<<ds[i].opts.size();cout<<endl;
  vector<pair<aff::Space,vector<Mask>>> seeds;for(auto&o:ds[47].opts){aff::Space t;if(!aff::apply(base,o.affine,t))continue;auto m=l.full;restrictClock(ds[47],o,m);seeds.emplace_back(t,move(m));}
  sort(seeds.begin(),seeds.end(),[](auto&a,auto&b){return a.first.d<b.first.d;});
  for(auto&[s,m]:seeds){if(stop())break;dfs(s,order,budget,m);if(!found&&!timed)done++;}
  cout<<"LINE SEARCH found="<<found<<" timed="<<timed<<" seeds="<<done<<"/"<<total<<" nodes="<<nodes<<" joins="<<joins<<" perms="<<perms<<" OOV="<<result.cost<<endl;
 }
};
int main(){try{
 aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 vector<int> L55{24,46,68};
 for(unsigned seed:{3301u,1033u}){
  auto p=plant(train,held,seed);Layout l(p.train,LINE,-1,p.path.end);LineSearch s(l);s.run(120);
  bool exact=s.found&&s.answer==p.pi&&s.result.words==p.truth;
  bool heldExact=false;if(exact){Layout h(p.held,L55,p.path.end);auto x=scoreLayout(h,s.answer,h.full,false,s.result.words.back());heldExact=x.cost==0&&x.words==p.holdTruth;}
  cout<<"LINE CONTROL "<<seed<<" exact="<<exact<<" holdout="<<heldExact<<endl;if(!exact||!heldExact){cout<<"ORIGINAL GATED OFF"<<endl;return 2;}
 }
 Layout l(train,LINE,-1,2),h(held,L55,2);cout<<"ORIGINAL LINE PATH COUNTS";for(auto&p:l.paths)cout<<" "<<p.size();cout<<endl;
 LineSearch s(l);s.run(900);if(s.found){auto x=scoreLayout(h,s.answer,h.full,false,s.result.words.back());cout<<"CANDIDATE pi="<<aff::str(s.answer)<<" heldoutOOV="<<x.cost<<endl;cout<<"TRAIN";for(auto&w:s.result.words)cout<<" "<<w;cout<<endl;cout<<"HELD";for(auto&w:x.words)cout<<" "<<w;cout<<endl;}
 cout<<"ORIGINAL all-lines exhausted="<<(!s.found&&!s.timed&&s.done==s.total)<<endl;
 return (!s.found&&!s.timed&&s.done==s.total)?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
