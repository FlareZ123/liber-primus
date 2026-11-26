// Negative-sign mapped red8 continuous-clock inverse. Each known schedule
// yields GF29 linear equations pi(P)-pi(C)=pi(K). No original p55 in fit.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
string negativeDecode(const string&c,const Path&p,const Pi&pi){auto ip=inverse(pi);string s;for(size_t i=0;i<c.size();i++){int k=p.key[i],x=fixed::val(c[i]);if(k<0){if(x)return {};s+='0';continue;}int a=ip[aff::mod(pi[x]+pi[k])];if(!a)return {};s+=fixed::SYM[a];}return s;}
Group negativeDomain(const string&c,const vector<int>&ks,const vector<string>&words,const aff::Space&base){
 Group g;g.ordinary=count_if(ks.begin(),ks.end(),[](int k){return k>=0;});unordered_set<string>seen;
 for(auto&w:words){aff::Option o;bool ok=true;for(size_t i=0;i<w.size();i++){
  int p=fixed::val(w[i]),x=fixed::val(c[i]),k=ks[i];if(k<0){if(p){ok=false;break;}continue;}
  if(!p||p==x){ok=false;break;}if(!x){if(p!=k){ok=false;break;}continue;}
  if(p==k){ok=false;break;}o.e[o.n++]={uint8_t(p),uint8_t(x),uint8_t(k)};
 }if(!ok)continue;aff::Space s;if(!aff::apply(base,o,s))continue;if(seen.insert(signature(s)).second)g.opts.push_back(o);}
 return g;
}
vector<Path> negPaths(const string&c,int start=-1){vector<Path> out;Path p;function<void(int,int)> visit=[&](int i,int j){if(i==int(c.size())){p.end=j;out.push_back(p);return;}
 if(c[i]=='0'){p.key.push_back(-1);visit(i+1,j);p.key.pop_back();}
 p.key.push_back(K[j]);visit(i+1,(j+1)%8);p.key.pop_back();
 };for(int j=0;j<8;j++)if(start<0||j==start){p.start=j;visit(0,j);}return out;}
struct NegativeSearch{
 vector<string> groups;string cipher;Path path;aff::Space base=aff::base();vector<Group> ds;vector<int> order;Clock::time_point deadline;
 bool timed=false,found=false;Pi answer{};int oov=-1;uint64_t nodes=0,joins=0,perms=0,done=0,total=0;
 NegativeSearch(const vector<string>&g,const Path&p):groups(g),cipher(join(g)),path(p){vector<string> pre(fixed::prefixDict.begin(),fixed::prefixDict.end());sort(pre.begin(),pre.end());size_t at=0;for(int i=0;i<48;i++){auto&w=g[i];vector<int> k(p.key.begin()+at,p.key.begin()+at+w.size());at+=w.size();ds.push_back(negativeDomain(w,k,i==47?pre:fixed::by[w.size()],base));if(i!=47)order.push_back(i);}
 sort(order.begin(),order.end(),[&](int a,int b){auto f=[&](int i){return log2(double(max<size_t>(1,ds[i].opts.size())))/max(1,ds[i].ordinary);};double x=f(a),y=f(b);return x==y?a<b:x<y;});}
 bool stop(){if(found||timed)return true;if(Clock::now()>=deadline){timed=true;return true;}return false;}
 void check(const Pi&pi){perms++;auto text=negativeDecode(cipher,path,pi);if(text.empty())return;auto w=split(text,groups);if(!fixed::prefixDict.count(w.back()))return;int n=0;for(int i:order)if(!fixed::dict.count(w[i])&&++n>3)return;answer=pi;oov=n;found=true;}
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

Plant negativePlant(const vector<string>&shape,const vector<string>&held,unsigned seed){mt19937 rng(seed);Plant p;for(int i=0;i<29;i++)p.pi[i]=i;shuffle(p.pi.begin()+1,p.pi.end(),rng);int inv=aff::inv[p.pi[19]];for(auto&x:p.pi)x=aff::mul[x][inv];auto ip=inverse(p.pi);auto choose=[&](int n){auto&v=fixed::by[n];return v[rng()%v.size()];};for(int i=0;i<47;i++)p.truth.push_back(choose(shape[i].size()));string carry=choose(11);p.truth.push_back(carry.substr(0,10));p.holdTruth.push_back(carry);for(size_t i=1;i<held.size();i++)p.holdTruth.push_back(choose(held[i].size()));string plain=join(p.truth)+carry.substr(10);for(size_t i=1;i<p.holdTruth.size();i++)plain+=p.holdTruth[i];string c;int j=rng()%8;p.path.start=j;for(int i=0;i<int(plain.size());i++){int a=fixed::val(plain[i]);if(i<223)p.path.key.push_back(a?K[j]:-1);if(a){c+=fixed::SYM[ip[aff::sub[p.pi[a]][p.pi[K[j]]]]];j=(j+1)%8;}else c+='0';if(i==222)p.path.end=j;}p.train=split(c.substr(0,223),shape);p.held=split(c.substr(223),held);return p;}
vector<vector<string>> negHold(const vector<string>&held,const string&prefix,const Pi&pi,int start){
 vector<vector<string>> out;for(auto&p:negPaths(join(held),start)){auto t=negativeDecode(join(held),p,pi);if(t.empty())continue;auto w=split(t,held);w[0]=prefix+w[0];if(all_of(w.begin(),w.end(),[](auto&x){return fixed::dict.count(x);}))out.push_back(w);}sort(out.begin(),out.end());out.erase(unique(out.begin(),out.end()),out.end());return out;}
int main(){try{aff::init();fixed::dictionary();auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 for(unsigned seed:{3301u,1033u}){auto p=negativePlant(train,held,seed);NegativeSearch s(p.train,p.path);s.run(120);bool exact=s.found&&s.answer==p.pi,hold=false;if(exact){auto w=split(negativeDecode(join(p.train),p.path,s.answer),p.train);auto h=negHold(p.held,w.back(),s.answer,p.path.end);hold=find(h.begin(),h.end(),p.holdTruth)!=h.end();}cout<<"NEGATIVE CONTROL "<<seed<<" exact="<<exact<<" hold="<<hold<<endl;if(!exact||!hold){cout<<"GATED OFF"<<endl;return 2;}}
 auto paths=negPaths(join(train));fixed::require(paths.size()==64,"original paths");int exhausted=0,candidates=0;uint64_t nodes=0,joins=0,perms=0,seeds=0;
 for(size_t i=0;i<paths.size();i++){cout<<"NEGATIVE PATH "<<i<<" start="<<paths[i].start<<endl;NegativeSearch s(train,paths[i]);s.run(40);nodes+=s.nodes;joins+=s.joins;perms+=s.perms;seeds+=s.done;
  if(s.found){candidates++;auto w=split(negativeDecode(join(train),paths[i],s.answer),train);auto h=negHold(held,w.back(),s.answer,paths[i].end);cout<<"CANDIDATE pi="<<aff::str(s.answer)<<" OOV="<<s.oov<<" holdoutPaths="<<h.size()<<endl;cout<<"TRAIN";for(auto&x:w)cout<<" "<<x;cout<<endl;for(auto&v:h){cout<<"HELD";for(auto&x:v)cout<<" "<<x;cout<<endl;}}
  else if(!s.timed&&s.done==s.total)exhausted++;
 }
 cout<<"NEGATIVE exhausted="<<exhausted<<"/"<<paths.size()<<" candidates="<<candidates<<" seeds="<<seeds<<" nodes="<<nodes<<" joins="<<joins<<" perms="<<perms<<endl;
 return exhausted==int(paths.size())?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
