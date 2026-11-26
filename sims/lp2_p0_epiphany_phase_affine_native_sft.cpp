// Conditional EPIPHANY SEEKS: arbitrary nonzero affine slope per phase,
// intercept fixed by title pair. Continuous F-hold final receiver.
// Independent group phases are an exact necessary relaxation during search.
#define main old_opening_support_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
namespace opening {
constexpr int N=29,Q=13,TRAIN=56,B=3;
using Key=array<uint8_t,Q>;using Bits=vector<uint64_t>;using Time=chrono::steady_clock;
const Key P{18,13,10,13,8,24,9,26,15,18,18,5,15};
const Key C{15,8,18,3,6,19,27,0,15,26,18,21,5};
int md(int x){return (x%N+N)%N;}
vector<string> source(){
 string runes="ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
 map<string,char> m;for(int x=0;x<N;x++)m[runes.substr(3*x,3)]=fixed::SYM[x];
 auto t=fixed::read("resources/liber-primus/lp2-transcription.txt");
 vector<string> g;string w;int pages=0;auto flush=[&](){if(!w.empty()){g.push_back(w);w.clear();}};
 for(size_t i=0;i<t.size()&&pages<3;){
  unsigned char x=t[i];if(x>=224&&x<240){auto it=m.find(t.substr(i,3));if(it==m.end())throw runtime_error("unknown rune");w+=it->second;i+=3;continue;}
  i++;if(x=='%'){pages++;continue;}if(x=='/'||isspace(x))continue;if(x=='-'||x=='.'||x=='&'||x=='$'){flush();continue;}throw runtime_error("unexpected opening source byte "+to_string(x));
 }
 flush();fixed::require(g.size()==158&&join(g).size()==729&&g[0]+g[1]=="f8i36jr0fqil5","opening source profile");g.erase(g.begin(),g.begin()+2);fixed::require(join(vector<string>(g.begin(),g.begin()+TRAIN)).size()==248,"training profile");return g;
}
struct Opt{Key k{};};
struct Domain {
 vector<Opt> opts;size_t L=0;Bits all,accept;array<array<int,N>,Q> counts{};
 const uint64_t* mask(int j,int a)const{return &accept[(j*N+a)*L];}
 Domain(const string&c){
  unordered_set<string> seen;
  for(int s=0;s<Q;s++)for(const auto&w:fixed::by[c.size()]){
   Key k{};int j=s;bool ok=true;
   for(size_t i=0;i<c.size();i++){
    int p=fixed::val(w[i]),x=fixed::val(c[i]);if(!p){if(x){ok=false;break;}continue;}
    int a=md(p-P[j]),b=md(x-C[j]);
    if((a==0)!=(b==0)){ok=false;break;}
    if(a){int v=b*aff::inv[a]%N;if(k[j]&&k[j]!=v){ok=false;break;}k[j]=v;}
    j=(j+1)%Q;
   }
   if(ok&&seen.insert(string((char*)k.data(),Q)).second)opts.push_back({k});
  }
  L=(opts.size()+63)/64;all.assign(L,~uint64_t(0));if(opts.size()%64)all.back()=(uint64_t(1)<<(opts.size()%64))-1;
  accept.assign(Q*N*L,0);if(!L)return;
  for(size_t i=0;i<opts.size();i++)for(int j=0;j<Q;j++)accept[(j*N+opts[i].k[j])*L+i/64]|=uint64_t(1)<<(i%64);
  for(int j=0;j<Q;j++)for(int a=1;a<N;a++)for(size_t z=0;z<L;z++){auto&v=accept[(j*N+a)*L+z];v|=accept[j*N*L+z];counts[j][a]+=__builtin_popcountll(v);}
 }
};
struct Decode{int cost=100000,end=-1;vector<string> words;};
Decode decode(const vector<string>&g,const Key&k,int start,int cap=100000){
 array<array<int,N>,Q> maps{};for(int j=0;j<Q;j++)for(int x=0;x<N;x++)maps[j][x]=md(P[j]+aff::inv[k[j]]*md(x-C[j]));
 array<Decode,Q> dp;dp[start].cost=0;
 for(const auto&c:g){array<Decode,Q> next;
  for(int j=0;j<Q;j++)if(dp[j].cost<=cap){
   string w(c.size(),'0');
   auto visit=[&](auto&&self,size_t i,int p)->void{
    if(i==c.size()){int cost=dp[j].cost+!fixed::dict.count(w);if(cost<=cap&&cost<next[p].cost){next[p]=dp[j];next[p].cost=cost;next[p].words.push_back(w);}return;}
    int x=fixed::val(c[i]);if(!x){w[i]='0';self(self,i+1,p);}int a=maps[p][x];if(a){w[i]=fixed::SYM[a];self(self,i+1,(p+1)%Q);}
   };visit(visit,0,j);
  }dp=move(next);
  if(all_of(dp.begin(),dp.end(),[&](const Decode&d){return d.cost>cap;}))return {};
 }
 int j=min_element(dp.begin(),dp.end(),[](const auto&a,const auto&b){return a.cost<b.cost;})-dp.begin();dp[j].end=j;return dp[j];
}
struct Stats{uint64_t nodes=0,joins=0,empty=0,full=0,reject=0,bitwords=0;};
using Inherited=array<const Bits*,TRAIN>;
struct Task{Key k;vector<int> rem;int budget=0,anchor=0;};
struct Search{
 vector<string> g;vector<Domain> ds;vector<int> order;vector<Task> tasks;
 int budget;atomic<bool>found{false},timed{false};atomic<size_t> cursor{0},done{0};Time::time_point deadline;mutex lock;
 Key answer{};Decode dec;Stats total;vector<uint8_t> completed;
 Search(vector<string> groups,int b):g(move(groups)),budget(b){
  fixed::require(g.size()==TRAIN,"training groups");
  for(const auto&c:g)ds.emplace_back(c);
  order.resize(g.size());iota(order.begin(),order.end(),0);
  sort(order.begin(),order.end(),[&](int a,int b){auto score=[&](int x){return log2(ds[x].opts.size()+1.0)/max(1.0,double(g[x].size())-0.5);};return score(a)<score(b);});
  vector<int> anchors;for(int n=0;n<=budget;n++){
   int id=order[n];anchors.push_back(id);
   vector<int> rem;for(int x:order)if(find(anchors.begin(),anchors.end(),x)==anchors.end())rem.push_back(x);
   sort(rem.begin(),rem.end(),[&](int a,int b){return g[a].size()!=g[b].size()?g[a].size()>g[b].size():ds[a].opts.size()<ds[b].opts.size();});
   for(const auto&o:ds[id].opts)tasks.push_back({o.k,rem,budget-n,n});
   cout<<"ANCHOR "<<id<<" length="<<g[id].size()<<" options="<<ds[id].opts.size()<<" omissionPrefix="<<n<<endl;
  }
 }
 bool stop(){if(found||timed)return true;if(Time::now()>=deadline){timed=true;return true;}return false;}
 void check(const Key&k,Stats&st){st.full++;auto d=decode(g,k,0,budget);if(d.cost>budget){st.reject++;return;}lock_guard<mutex>guard(lock);if(!found){answer=k;dec=move(d);found=true;}}
 void dfs(const Key&k,const vector<int>&rem,int b,const Inherited&parent,const vector<int>&changes,Stats&st){
  if(stop())return;st.nodes++;int unknown=count(k.begin(),k.end(),0);if(!unknown){check(k,st);return;}
  array<Bits,TRAIN> storage;Inherited next=parent;vector<int>rows;
  int pick=-1;double best=1e30;
  for(int id:rem){
   const auto&d=ds[id];if(!d.L){if(--b<0){st.empty++;return;}continue;}
   const Bits* in=parent[id]?parent[id]:&d.all;
   size_t count=0;
   if(changes.empty()){for(uint64_t v:*in)count+=__builtin_popcountll(v);next[id]=in;}
   else{
    vector<int> ch=changes;sort(ch.begin(),ch.end(),[&](int a,int b){return d.counts[a][k[a]]<d.counts[b][k[b]];});
    auto&out=storage[id];out=*in;bool empty=false;
    for(int j:ch){const auto*m=d.mask(j,k[j]);uint64_t any=0;for(size_t z=0;z<d.L;z++){out[z]&=m[z];any|=out[z];}st.bitwords+=d.L;if(!any){empty=true;break;}}
    if(!empty)for(uint64_t v:out)count+=__builtin_popcountll(v);next[id]=&out;
   }
   if(!count){if(--b<0){st.empty++;return;}continue;}
   rows.push_back(id);double score=log2(count+1.0)/min(double(unknown),max(1.0,double(g[id].size())-0.5));if(score<best){best=score;pick=id;}
  }
  if(int(rows.size())<=b||pick<0){
   int j=find(k.begin(),k.end(),0)-k.begin();for(int a=1;a<N;a++){auto nk=k;nk[j]=a;dfs(nk,rows,b,next,{j},st);if(stop())return;}return;
  }
  vector<int> remain;for(int id:rows)if(id!=pick)remain.push_back(id);
  const auto&d=ds[pick];const auto&bits=*next[pick];unordered_set<string> seen;vector<pair<Key,vector<int>>> children;bool unconditional=false;
  for(size_t z=0;z<bits.size()&&!unconditional;z++){uint64_t v=bits[z];while(v){int t=__builtin_ctzll(v);v&=v-1;const auto&o=d.opts[64*z+t];Key nk=k;vector<int> ch;for(int j=0;j<Q;j++)if(!nk[j]&&o.k[j]){nk[j]=o.k[j];ch.push_back(j);}
   if(ch.empty()){unconditional=true;break;}if(seen.insert(string((char*)nk.data(),Q)).second)children.push_back({nk,move(ch)});
  }}
  if(unconditional){dfs(k,remain,b,next,{},st);return;}
  for(auto&[nk,ch]:children){st.joins++;dfs(nk,remain,b,next,ch,st);if(stop())return;}if(b)dfs(k,remain,b-1,next,{},st);
 }
 void run(int seconds){
  deadline=Time::now()+chrono::seconds(seconds);completed.resize(tasks.size());
  const int n=max(1u,min(4u,thread::hardware_concurrency()));vector<Stats> stats(n);vector<thread> pool;
  for(int i=0;i<n;i++)pool.emplace_back([&,i](){auto&st=stats[i];while(!stop()){
   size_t t=cursor.fetch_add(1);if(t>=tasks.size())break;const auto&task=tasks[t];vector<int>ch;for(int j=0;j<Q;j++)if(task.k[j])ch.push_back(j);
   dfs(task.k,task.rem,task.budget,Inherited{},ch,st);if(!timed&&!found){completed[t]=1;auto n=++done;if(n%4096==0){lock_guard<mutex>guard(lock);cout<<"PROGRESS "<<n<<"/"<<tasks.size()<<endl;}}
  }});
  for(auto&t:pool)t.join();for(const auto&x:stats){total.nodes+=x.nodes;total.joins+=x.joins;total.empty+=x.empty;total.full+=x.full;total.reject+=x.reject;total.bitwords+=x.bitwords;}
  cout<<"SEARCH found="<<found<<" timed="<<timed<<" completed="<<done<<"/"<<tasks.size()<<" nodes="<<total.nodes<<" joins="<<total.joins<<" empty="<<total.empty<<" full="<<total.full<<" bitwords="<<total.bitwords<<endl;
 }
};
struct Plant{Key key;vector<string> cipher,truth;};
Plant plant(const vector<string>&shape,unsigned seed){mt19937 rng(seed);Plant p;for(auto&x:p.key)x=1+rng()%28;int j=0;for(const auto&c:shape){const auto&d=fixed::by[c.size()];auto w=d[rng()%d.size()];p.truth.push_back(w);string e;for(char a:w){int x=fixed::val(a);if(!x)e+='0';else{e+=fixed::SYM[md(C[j]+p.key[j]*(x-P[j]))];j=(j+1)%Q;}}p.cipher.push_back(e);}return p;}
bool control(const vector<string>&shape,unsigned seed){auto p=plant(shape,seed);Search s(vector<string>(p.cipher.begin(),p.cipher.begin()+TRAIN),0);s.run(180);
 bool exact=s.found&&s.answer==p.key;bool train=s.found&&s.dec.words==vector<string>(p.truth.begin(),p.truth.begin()+TRAIN);
 auto h=s.found?decode(vector<string>(p.cipher.begin()+TRAIN,p.cipher.end()),s.answer,s.dec.end,0):Decode{};
 bool held=h.cost==0&&h.words==vector<string>(p.truth.begin()+TRAIN,p.truth.end());
 cout<<"CONTROL "<<seed<<" exact="<<exact<<" train="<<train<<" held="<<held<<endl;
 return exact&&train&&held;
}
int main2(int argc,char**argv){
 int seconds=900;bool controlsOnly=false;for(int i=1;i<argc;i++){string a=argv[i];if(a=="--seconds"&&i+1<argc)seconds=stoi(argv[++i]);else if(a=="--controls-only")controlsOnly=true;else throw runtime_error("unknown argument");}
 aff::init();fixed::dictionary();auto all=source();bool a=control(all,3301),b=control(all,1033);
 auto output=[](const string&s){const char*p=getenv("SFT_OUTPUT");if(p&&*p){ofstream f(p);f<<s<<endl;}};
 if(!a||!b){output("{\"controls_passed\":false}");return 2;}
 if(controlsOnly){output("{\"controls_passed\":true}");return 0;}
 Search s(vector<string>(all.begin(),all.begin()+TRAIN),B);s.run(seconds);bool exhausted=!s.found&&!s.timed&&s.done==s.tasks.size();
 ostringstream o;o<<"{\"controls_passed\":true,\"found\":"<<(s.found?"true":"false")<<",\"timed\":"<<(s.timed?"true":"false")<<",\"exhausted\":"<<(exhausted?"true":"false")<<",\"completed\":"<<s.done<<",\"total\":"<<s.tasks.size()<<",\"nodes\":"<<s.total.nodes<<",\"joins\":"<<s.total.joins<<",\"fullKeys\":"<<s.total.full<<",\"emptyRejects\":"<<s.total.empty<<",\"bitwords\":"<<s.total.bitwords;
 if(s.found){o<<",\"key\":[";for(int j=0;j<Q;j++){if(j)o<<",";o<<int(s.answer[j]);}o<<"],\"train_oov\":"<<s.dec.cost<<",\"train_end\":"<<s.dec.end;auto h=decode(vector<string>(all.begin()+TRAIN,all.end()),s.answer,s.dec.end);o<<",\"heldout_oov\":"<<h.cost<<",\"train_words\":[";for(size_t i=0;i<s.dec.words.size();i++){if(i)o<<",";o<<"\""<<s.dec.words[i]<<"\"";}o<<"],\"held_words\":[";for(size_t i=0;i<h.words.size();i++){if(i)o<<",";o<<"\""<<h.words[i]<<"\"";}o<<"]";}
 o<<"}";output(o.str());cout<<o.str()<<endl;return (exhausted||s.found)?0:1;
}
}
int main(int argc,char**argv){try{return opening::main2(argc,argv);}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
