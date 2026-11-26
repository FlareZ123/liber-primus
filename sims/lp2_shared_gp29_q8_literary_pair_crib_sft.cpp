// Candidate discovery, not exhaustive q8 exclusion: adjacent literary word
// pair at the longest consecutive complete-group span of p54.
#define LP2_MOMENT_COMPLETION_NO_MAIN
#include "lp2_shared_gp29_q8_pair_cover_sft.cpp"

using Phrase=pair<string,string>;
vector<string> forms(string w,int n){
 string normalized;for(size_t i=0;i<w.size();i++){char c=toupper((unsigned char)w[i]);if(c=='Q'&&i+1<w.size()&&toupper((unsigned char)w[i+1])=='U'){normalized+="CW";i++;continue;}if(c=='V')c='U';if(c=='K'||c=='Q')c='C';if(c=='Z')c='S';normalized+=c;}
 vector<string> out;string s;
 auto rec=[&](auto&&self,size_t at)->void{
  if(at==normalized.size()){if(int(s.size())==n&&fixed::dict.count(s))out.push_back(s);return;}
  if(int(s.size())>=n||int(normalized.size()-at)<n-int(s.size()))return;
  for(int k=1;k<=3&&at+k<=normalized.size();k++){
   string t=normalized.substr(at,k);int id=-1;
   if(k==3){if(t=="ING")id=21;}
   else{auto p=find(fixed::ALPHA.begin(),fixed::ALPHA.end(),t);if(p!=fixed::ALPHA.end())id=p-fixed::ALPHA.begin();}
   if(id>=0){s+=fixed::SYM[id];self(self,at+k);s.pop_back();}
  }
 };rec(rec,0);sort(out.begin(),out.end());out.erase(unique(out.begin(),out.end()),out.end());return out;
}
struct PhraseInfo{int count=0;string text;};
map<Phrase,PhraseInfo> phrases(int n,int m){
 map<Phrase,PhraseInfo> out;map<pair<string,int>,vector<string>> cache;
 auto get=[&](const string&w,int len)->const vector<string>&{auto key=make_pair(w,len);auto it=cache.find(key);if(it==cache.end())it=cache.emplace(key,forms(w,len)).first;return it->second;};
 for(const string&p:{"resources/control/blake_song_of_liberty_train.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt","resources/liber-primus/lp1-plaintext-reference.txt"}){
  string t=fixed::read(p),last,w;int count=0;
  auto emit=[&](){
   if(w.empty())return;
   if(int(last.size())>=n&&int(w.size())>=m&&int(last.size())<=3*n&&int(w.size())<=3*m){
    for(auto&a:get(last,n))for(auto&b:get(w,m)){auto&z=out[{a,b}];z.count++;if(z.text.empty())z.text=last+" "+w;count++;}
   }
   last=w;w.clear();
  };
  for(unsigned char c:t){if((c>='a'&&c<='z')||(c>='A'&&c<='Z'))w+=tolower(c);else{emit();if(c=='.'||c=='!'||c=='?'||c==';'||c==':')last.clear();}}
  emit();cout<<"PHRASE SOURCE "<<p<<" pairs="<<count<<endl;
 }
 return out;
}
struct Root{Graph g;int count;Phrase words;};
vector<Root> roots(FastSearch&s,int a,int b,const map<Phrase,PhraseInfo>&pool){
 map<pair<int,string>,vector<GOption>> cache;
 auto get=[&](int id,const string&w)->const vector<GOption>&{auto key=make_pair(id,w);auto it=cache.find(key);if(it==cache.end())it=cache.emplace(key,makeGDomain(s.train[id],{w},s.base).opts).first;return it->second;};
 unordered_map<string,size_t> seen;vector<Root> out;uint64_t joins=0,valid=0,empty=0;
 for(auto&[p,info]:pool){
  auto&u=get(a,p.first);auto&v=get(b,p.second);if(u.empty()||v.empty()){empty++;continue;}
  for(auto&seed:s.seeds)for(auto&x:u){Graph g;if(!extend(seed,x,g))continue;for(auto&y:v){Graph h;joins++;if(!extend(g,y,h))continue;GFilter f(h);if(f.saturated)continue;valid++;
   string sig=h.sig();auto it=seen.find(sig);if(it==seen.end()){seen.emplace(move(sig),out.size());out.push_back({move(h),info.count,p});}else if(info.count>out[it->second].count){out[it->second].count=info.count;out[it->second].words=p;}
  }}
 }
 stable_sort(out.begin(),out.end(),[](auto&x,auto&y){return x.g.dimension()!=y.g.dimension()?x.g.dimension()<y.g.dimension():x.count>y.count;});
 map<int,int> hist;for(auto&x:out)hist[x.g.dimension()]++;
 cout<<"PHRASE ROOTS pool="<<pool.size()<<" empty="<<empty<<" carry="<<s.seeds.size()<<" joins="<<joins<<" valid="<<valid<<" unique="<<out.size()<<" dims";for(auto[d,n]:hist)cout<<" "<<d<<":"<<n;cout<<endl;
 return out;
}
size_t solve(FastSearch&s,int a,int b,const vector<Root>&rs,int seconds){
 vector<int> rem;for(int id:s.order)if(id!=a&&id!=b)rem.push_back(id);
 s.deadline=Clock::now()+chrono::seconds(seconds);
 atomic<size_t> next{0},done{0};vector<GStats> stats(4);vector<thread> threads;
 for(int t=0;t<4;t++)threads.emplace_back([&,t]{while(!s.stop()){size_t i=next.fetch_add(1);if(i>=rs.size())break;s.fastDfs(rs[i].g,rem,s.maxOov,stats[t],DomainPointers{});if(!s.found&&!s.timed)done++;}});
 for(auto&t:threads)t.join();
 uint64_t nodes=0,joins=0,perms=0;for(auto&x:stats){nodes+=x.nodes;joins+=x.joins;perms+=x.perms;}
 cout<<"PHRASE SEARCH found="<<s.found<<" timed="<<s.timed<<" completed="<<done<<"/"<<rs.size()<<" nodes="<<nodes<<" joins="<<joins<<" perms="<<perms<<" OOV="<<s.answerOov<<endl;
 return done;
}
int main(){try{
 aff::init();fixed::dictionary();exactMrvEnabled=true;
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17,"shape");
 int a=0;for(int i=1;i<46;i++)if(train[i].size()+train[i+1].size()>train[a].size()+train[a+1].size())a=i;int b=a+1;
 cout<<"PHRASE ANCHOR "<<a<<" "<<b<<" lengths="<<train[a].size()<<","<<train[b].size()<<endl;
 auto pool=phrases(train[a].size(),train[b].size());fixed::require(!pool.empty(),"empty phrase pool");
 // Hidden controls use one corpus pair chosen by a fixed seed, but the
 // receiver sees the entire phrase pool and never its planted pair.
 for(unsigned seed:{3301u,1033u}){
  mt19937 rng(seed+99);fixed::Key k{};k[0]=1;k[4]=2;for(int j=1;j<Q;j++)if(j!=4)k[j]=rng()%N;
  vector<string> t(train.begin(),train.end()-1),h(held.begin()+1,held.end());auto p=fixed::plant(t,h,k,seed);
  auto it=pool.begin();advance(it,rng()%pool.size());p.truthTrain[a]=it->first.first;p.truthTrain[b]=it->first.second;
  p.train[a]=fixed::encode(p.truthTrain[a],p.pi,k,rng()%Q);p.train[b]=fixed::encode(p.truthTrain[b],p.pi,k,rng()%Q);
  auto g=p.train;g.push_back(p.prefix);FastSearch s(g,0);auto rs=roots(s,a,b,pool);solve(s,a,b,rs,180);
  bool exact=s.found&&equalAction(s.answer,s.answerKey,p.pi,k);int tr=0,hit=0;
  if(s.found){auto m=fixed::maps(s.answer,s.answerKey);for(int i=0;i<47;i++)tr+=fixed::decode(p.train[i],m,fixed::dict).count(p.truthTrain[i]);hit+=fixed::decode(p.carry,m,fixed::dict).count(p.truthCarry);for(size_t i=0;i<p.hold.size();i++)hit+=fixed::decode(p.hold[i],m,fixed::dict).count(p.truthHold[i]);}
  cout<<"PHRASE CONTROL "<<seed<<" exact="<<exact<<" train="<<tr<<"/47 hold="<<hit<<"/17"<<endl;
  if(!exact||tr!=47||hit!=17){cout<<"PHRASE ORIGINAL GATED OFF"<<endl;return 2;}
 }
 FastSearch s(train,3);auto rs=roots(s,a,b,pool);size_t done=solve(s,a,b,rs,300);
 if(s.found){auto m=fixed::maps(s.answer,s.answerKey);cout<<"PHRASE ORIGINAL KEY";for(int x:s.answerKey)cout<<" "<<x;cout<<" pi";for(int x:s.answer)cout<<" "<<x;cout<<endl;
  for(int i=0;i<47;i++){auto w=fixed::decode(train[i],m,fixed::dict);cout<<"TRAIN "<<i;for(auto&x:w)cout<<" "<<x;cout<<endl;}
  held[0]=train.back()+held[0];for(int i=0;i<17;i++){auto w=fixed::decode(held[i],m,fixed::dict);cout<<"HOLD "<<i;for(auto&x:w)cout<<" "<<x;cout<<endl;}
 }
 cout<<"PHRASE ORIGINAL found="<<s.found<<" restricted_exhausted="<<(!s.timed&&!s.found&&done==rs.size())<<" universal_exhaustion=0"<<endl;
 return 0;
}catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
