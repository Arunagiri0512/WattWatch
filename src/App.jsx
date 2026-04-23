import { useState, useEffect, useRef, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// ─── THEMES ────────────────────────────────────────────────────
const THEMES = {
  light: {
    teal:"#3ecfb2", tealDark:"#2ab09a", tealLight:"#e8faf7",
    bg:"#f5f6fa", card:"#ffffff", text:"#1a1a2e", muted:"#6b7280",
    light:"#9ca3af", border:"#e5e7eb", red:"#ef4444", orange:"#f97316",
    green:"#22c55e", navBg:"#ffffff", sbBg:"#ffffff", inputBg:"#ffffff",
    shadow:"0 2px 16px rgba(0,0,0,.08)", isDark:false,
  },
  dark: {
    teal:"#818cf8", tealDark:"#6366f1", tealLight:"#1e1b4b",
    bg:"#0d0f1a", card:"#141625", text:"#e2e8f0", muted:"#8892a4",
    light:"#4a5568", border:"#1e2337", red:"#f87171", orange:"#fb923c",
    green:"#22c55e", navBg:"#141625", sbBg:"#141625", inputBg:"#1e2337",
    shadow:"0 2px 16px rgba(0,0,0,.5)", isDark:true,
  },
};

// ─── SEM PRICE DATA ────────────────────────────────────────────
// Today = 25 Mar 2026. Full month data — all 31 days.
const SEM = {
  1:[.1923,.1885,.1816,.1767,.1772,.1846,.2111,.2547,.2752,.2664,.2578,.2488,.2339,.2203,.2083,.211,.2357,.2917,.3198,.3103,.2851,.2523,.2239,.201],
  2:[.1867,.1812,.1745,.1712,.1723,.1845,.2112,.2556,.2798,.2645,.2478,.2343,.2221,.2134,.2089,.2123,.2367,.2914,.3158,.3014,.2769,.2492,.2245,.2025],
  3:[.1812,.1756,.1689,.1656,.1667,.1789,.2056,.2498,.2743,.2589,.2423,.2289,.2167,.2078,.2034,.2067,.2312,.2856,.3101,.2956,.2712,.2436,.2189,.1969],
  4:[.1934,.1878,.1812,.1778,.1789,.1912,.2187,.2634,.2878,.2723,.2556,.2421,.2298,.2209,.2165,.2198,.2443,.2989,.3234,.3089,.2845,.2567,.2321,.2101],
  5:[.1878,.1823,.1756,.1723,.1734,.1856,.2132,.2578,.2823,.2667,.2501,.2367,.2245,.2156,.2112,.2145,.2389,.2934,.3178,.3034,.2789,.2512,.2265,.2045],
  6:[.1713,.1594,.163,.1555,.1533,.1731,.1936,.219,.2545,.2291,.2043,.2135,.1971,.182,.193,.1946,.204,.2678,.2717,.2379,.2402,.2116,.1842,.1864],
  7:[.1954,.178,.1747,.18,.1828,.185,.2134,.2803,.3121,.274,.2391,.2346,.2387,.2303,.21,.2128,.2564,.3318,.3323,.286,.2655,.2569,.2353,.2039],
  8:[.1737,.1626,.1542,.1521,.1577,.1717,.2042,.2491,.259,.234,.2121,.1983,.1894,.1882,.1905,.2033,.2308,.2751,.2789,.2509,.2227,.2013,.19,.1834],
  9:[.1821,.1746,.1671,.1639,.1673,.1784,.2084,.2529,.2675,.25,.2348,.2238,.2129,.2063,.2021,.21,.2361,.2858,.3008,.282,.2563,.2304,.2114,.1967],
  10:[.1599,.1581,.1538,.1505,.1503,.1543,.1705,.1983,.2129,.2087,.2037,.1973,.1864,.1764,.1682,.17,.187,.2253,.2455,.2389,.2205,.1971,.1775,.1628],
  11:[.1975,.1975,.1817,.1684,.1745,.1993,.2383,.2706,.277,.2793,.2742,.2463,.2181,.2182,.2288,.2366,.2471,.2951,.341,.3316,.2785,.2339,.2242,.2213],
  12:[.188,.1825,.1756,.1703,.1731,.1906,.2218,.2662,.287,.2693,.2516,.2375,.2239,.2144,.2074,.2124,.2402,.2982,.3165,.3021,.2728,.2436,.2175,.1986],
  13:[.1845,.1789,.1723,.1689,.1701,.1823,.2098,.2543,.2787,.2634,.2467,.2332,.2209,.2121,.2076,.2109,.2354,.2901,.3145,.3001,.2756,.2478,.2231,.2012],
  14:[.1923,.1867,.1801,.1767,.1778,.1901,.2176,.2623,.2867,.2712,.2545,.2409,.2287,.2198,.2154,.2187,.2432,.2978,.3223,.3078,.2834,.2556,.2309,.2089],
  15:[.1756,.1701,.1634,.1601,.1612,.1734,.2009,.2454,.2698,.2543,.2376,.2243,.2121,.2032,.1989,.2021,.2265,.2812,.3056,.2912,.2667,.2389,.2143,.1923],
  16:[.1834,.1778,.1712,.1678,.1689,.1812,.2087,.2534,.2778,.2623,.2456,.2321,.2198,.2109,.2065,.2098,.2343,.2889,.3134,.2989,.2745,.2467,.2221,.2001],
  17:[.1901,.1845,.1778,.1745,.1756,.1878,.2154,.2601,.2845,.2689,.2523,.2387,.2265,.2176,.2132,.2165,.2409,.2956,.3201,.3056,.2812,.2534,.2287,.2067],
  18:[.1812,.1756,.1689,.1656,.1667,.1789,.2065,.2509,.2754,.2601,.2434,.2298,.2176,.2087,.2043,.2076,.2321,.2867,.3112,.2967,.2723,.2445,.2198,.1978],
  // Week of Mar 19-25
  19:[.1842,.1798,.1712,.1689,.1701,.1823,.2056,.2498,.2721,.2588,.2412,.2301,.2198,.2087,.2015,.2043,.2287,.2814,.3087,.2941,.2703,.2418,.2187,.1978],
  20:[.1765,.1682,.1634,.1598,.1612,.1744,.2018,.2463,.2689,.2534,.2378,.2243,.2112,.2034,.1987,.2021,.2241,.2754,.3012,.2878,.2641,.2376,.2143,.1934],
  21:[.1701,.1643,.1589,.1561,.1578,.1698,.1978,.2412,.2634,.2487,.2321,.2198,.2087,.2012,.1965,.1998,.2198,.2698,.2954,.2812,.2589,.2334,.2112,.1912],
  22:[.1823,.1756,.1689,.1654,.1671,.1812,.2087,.2534,.2765,.2612,.2434,.2298,.2176,.2087,.2034,.2065,.2312,.2856,.3098,.2954,.2712,.2445,.2198,.1987],
  23:[.1912,.1845,.1778,.1745,.1762,.1901,.2176,.2623,.2876,.2723,.2545,.2412,.2287,.2198,.2143,.2176,.2423,.2978,.3212,.3065,.2823,.2534,.2287,.2065],
  24:[.1756,.1689,.1623,.1598,.1612,.1734,.2012,.2456,.2698,.2543,.2378,.2254,.2134,.2054,.2012,.2043,.2278,.2823,.3065,.2923,.2687,.2412,.2176,.1965],
  // Today — Mar 25
  25:[.1834,.1767,.1701,.1676,.1689,.1812,.2087,.2534,.2776,.2623,.2456,.2321,.2198,.2112,.2065,.2098,.2334,.2889,.3134,.2989,.2745,.2476,.2231,.2012],
  // Forecast Mar 26-31
  26:[.1878,.1812,.1745,.1723,.1734,.1856,.2134,.2578,.2821,.2667,.2498,.2365,.2243,.2156,.2109,.2143,.2387,.2934,.3178,.3034,.2789,.2512,.2265,.2045],
  27:[.1923,.1856,.1789,.1765,.1778,.1901,.2178,.2623,.2867,.2712,.2543,.2409,.2287,.2198,.2154,.2187,.2431,.2978,.3223,.3078,.2834,.2556,.2309,.2089],
  28:[.1801,.1734,.1667,.1645,.1656,.1778,.2054,.2498,.2743,.2589,.2421,.2287,.2165,.2078,.2034,.2065,.2309,.2856,.3101,.2956,.2712,.2445,.2198,.1978],
  29:[.1745,.1678,.1612,.1589,.1601,.1723,.1998,.2443,.2689,.2534,.2367,.2234,.2112,.2025,.1981,.2012,.2256,.2803,.3047,.2903,.2659,.2392,.2145,.1925],
  30:[.1867,.1801,.1734,.1712,.1723,.1845,.2121,.2567,.2812,.2656,.2489,.2354,.2231,.2143,.2098,.2131,.2376,.2923,.3167,.3023,.2778,.2501,.2254,.2034],
  31:[.1912,.1845,.1778,.1756,.1767,.1889,.2165,.2612,.2856,.2701,.2532,.2398,.2276,.2187,.2143,.2176,.2421,.2967,.3212,.3067,.2823,.2545,.2298,.2078],
};
const HOURS = Array.from({length:24},(_,i)=>`${String(i).padStart(2,"0")}:00`);
// 30-min slots: interpolate between hourly values
const HALF_HOURS = Array.from({length:48},(_,i)=>{
  const h=Math.floor(i/2), m=i%2===0?"00":"30";
  return `${String(h).padStart(2,"0")}:${m}`;
});
const barColor = p => !p?"#94a3b8":p<.22?"#22c55e":p<.30?"#f97316":"#ef4444";
const statusBadge = p => {
  if(!p) return {txt:"—",col:"#94a3b8"};
  if(p<.22) return {txt:"🟢 Very Low",col:"#16a34a"};
  if(p<.30) return {txt:"🟡 Moderate",col:"#d97706"};
  return {txt:"🔴 High",col:"#dc2626"};
};
const liveHourly = SEM[25].map((r,i)=>({h:HOURS[i],r,mwh:Math.round(r*1000*0.917-95.7)}));
// 30-min version: each hour split into :00 and :30 with slight mid-point interpolation
const liveHalfHourly = HALF_HOURS.map((h,i)=>{
  const hourIdx=Math.floor(i/2);
  const isHalf=i%2===1;
  const r0=SEM[25][hourIdx];
  const r1=SEM[25][Math.min(23,hourIdx+1)];
  const r=isHalf?+(r0*0.5+r1*0.5).toFixed(4):r0;
  return {h,r,mwh:Math.round(r*1000*0.917-95.7)};
});
const DAY_NAMES=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const liveForecast=[25,26,27,28,29,30,31].map(d=>{
  const dt=new Date(2026,2,d);
  const avg=+(SEM[d].reduce((a,b)=>a+b,0)/24).toFixed(3);
  return {day:DAY_NAMES[dt.getDay()],date:String(d),avg,color:barColor(avg),isToday:d===25};
});

// ─── CALENDAR DATA ─────────────────────────────────────────────
const CAL_MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
function getCalDays(year,month){
  const first=new Date(year,month,1).getDay();
  const total=new Date(year,month+1,0).getDate();
  return {first,total};
}
function calPrice(year,month,day){
  if(year===2026&&month===2&&day>=1&&day<=31) return SEM[day]?(+(SEM[day].reduce((a,b)=>a+b,0)/24).toFixed(3)):null;
  if(day<=28){const s=(year*10000+month*100+day)*1234+5678;return +(.14+(((s*6271+3541)%17893)/17893)*.20).toFixed(3);}
  return null;
}

// ─── CHART DATA ────────────────────────────────────────────────
// Daily: every hour today Mar 25, 2026 (€/kWh) — wholesale SEMOpx prices
const D_DAILY={
  labels:HOURS,
  data:SEM[25],
  yFmt:v=>`€${Number(v).toFixed(2)}`,
  ttFmt:v=>`€${Number(v).toFixed(3)}/kWh`,
  // Realistic: avg Irish home uses ~10–14 kWh/day. At avg €0.236 = ~€2.80/day wholesale
  amount:"€2.83",avg:"€0.236/kWh",change:"+4% vs yesterday",
  title:"Hourly Price — Today",yr:"Today",range:"Mar 25, 2026",
};
// Weekly: Mon 23 – Sun 29 Mar 2026
// Irish avg household ~70–90 kWh/week → ~€16–21 at these rates
const D_WEEKLY={
  labels:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  data:[+(SEM[23].reduce((a,b)=>a+b,0)/24).toFixed(3),+(SEM[24].reduce((a,b)=>a+b,0)/24).toFixed(3),+(SEM[25].reduce((a,b)=>a+b,0)/24).toFixed(3),+(SEM[26].reduce((a,b)=>a+b,0)/24).toFixed(3),+(SEM[27].reduce((a,b)=>a+b,0)/24).toFixed(3),+(SEM[28].reduce((a,b)=>a+b,0)/24).toFixed(3),+(SEM[29].reduce((a,b)=>a+b,0)/24).toFixed(3)],
  yFmt:v=>`€${Number(v).toFixed(2)}`,
  ttFmt:v=>`€${Number(v).toFixed(3)}/kWh`,
  amount:"€19.40",avg:"€0.233/kWh",change:"+5% WoW",
  title:"Daily Avg Price — This Week",yr:"This Week",range:"Mar 23–29, 2026",
};
// Monthly: Jan–Dec 2026 — realistic Irish household bills (3-bed semi, EV, ~300–400 kWh/mo)
// With network charges + VAT, typical bill = €90–€160/month
const D_MONTHLY={
  labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  data:[158,143,148,118,104,96,98,107,121,138,152,163],
  yFmt:v=>`€${v}`,
  ttFmt:v=>`€${v}`,
  amount:"€1,546",avg:"€128.8/mo",change:"−3% vs 2025",
  title:"Monthly Bill — 2026",yr:"2026",range:"Jan – Dec 2026",
};
// Yearly: Jan 2024 to Mar 2026 monthly bills — realistic trend (energy crisis → gradual fall)
const D_YEARLY={
  labels:["J'24","F'24","M'24","A'24","M'24","J'24","J'24","A'24","S'24","O'24","N'24","D'24",
          "J'25","F'25","M'25","A'25","M'25","J'25","J'25","A'25","S'25","O'25","N'25","D'25",
          "J'26","F'26","M'26"],
  data:[178,162,183,139,122,114,118,129,144,158,172,189,
        168,154,171,128,114,106,109,119,135,149,164,181,
        158,143,148],
  yFmt:v=>`€${v}`,
  ttFmt:v=>`€${v}`,
  amount:"€4,108",avg:"€152.1/mo",change:"−9% vs 2024",
  title:"Monthly Bill — 2024 to Mar 2026",yr:"2024–2026",range:"Jan 2024 – Mar 2026",
};
const CHART_DATA={daily:D_DAILY,weekly:D_WEEKLY,monthly:D_MONTHLY,yearly:D_YEARLY};
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

// ─── ICONS ─────────────────────────────────────────────────────
const ChevL=({c,s=22})=><svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c||"currentColor"} strokeWidth={2.5} strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevR=({c,s=18})=><svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c||"#9ca3af"} strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const CalIco=({c,s=20})=><svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c||"currentColor"} strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const GearIco=({c,s=20})=><svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke={c||"currentColor"} strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const BoltIco=({c="white",s=22})=><svg viewBox="0 0 24 24" width={s} height={s} fill={c}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const HomeIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill={c||"#9ca3af"}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const AnalyIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const DevIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>;
const AlertsIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ProfIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>;
const EyeOn=()=><svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff=()=><svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>;
const LockIco=({c})=><svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const MailIco=({c})=><svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const UserIco=({c})=><svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ShieldIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"currentColor"} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const StarIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#a855f7"} strokeWidth={2}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const HelpIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#16a34a"} strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const DlIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c} strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const BellIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c} strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const CardIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c} strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const TrashIco=()=><svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>;
const ChatIco=({c})=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={c||"#9ca3af"} strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const SunIco=()=><svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#818cf8" strokeWidth={2}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>;

// ─── SHARED COMPONENTS ─────────────────────────────────────────
const StatusBar=({t})=>(
  <div style={{height:44,background:t.sbBg,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0,borderBottom:`1px solid ${t.border}`}}>
    <span style={{fontSize:15,fontWeight:800,color:t.text}}>9:41</span>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill={t.muted}><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
      <svg width={14} height={14} viewBox="0 0 24 24" fill={t.muted}><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
    </div>
  </div>
);

const TopBar=({t,title,onBack,onGear,onCal})=>(
  <div style={{background:t.sbBg,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
    {onBack&&<button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",color:t.teal,padding:"4px 0"}}><ChevL c={t.teal}/></button>}
    <h2 style={{flex:1,fontSize:17,fontWeight:700,color:t.text,margin:0}}>{title}</h2>
    {onGear&&<button onClick={onGear} style={{width:36,height:36,borderRadius:"50%",background:t.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginRight:4}}><GearIco c={t.text}/></button>}
    {onCal&&<button onClick={onCal} style={{width:36,height:36,borderRadius:"50%",background:t.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><CalIco c={t.text}/></button>}
  </div>
);

const BottomNav=({screen,nav,t,openSheet})=>{
  const items=[{id:"home",Ico:HomeIco},{id:"analytics",Ico:AnalyIco},null,{id:"devices",Ico:DevIco},{id:"profile",Ico:ProfIco}];
  return(
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:86,background:t.navBg,borderTop:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 10px 18px",zIndex:10,boxShadow:"0 -4px 20px rgba(0,0,0,.06)"}}>
      {items.map((item,idx)=>item===null?(
        <button key="plus" onClick={openSheet} style={{padding:"0 14px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:-22,boxShadow:`0 4px 20px ${t.teal}88,0 0 0 4px ${t.navBg}`}}>
            <svg viewBox="0 0 24 24" fill="white" width={24} height={24}><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
        </button>
      ):(
        <button key={item.id} onClick={()=>nav(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 14px",borderRadius:12,border:"none",background:"none",cursor:"pointer"}}>
          <item.Ico c={screen===item.id?t.teal:t.light}/>
          <div style={{width:5,height:5,borderRadius:"50%",background:screen===item.id?t.teal:"transparent",transition:"background .2s"}}/>
        </button>
      ))}
    </div>
  );
};

const Toast=({msg,t})=>(
  <div style={{position:"absolute",bottom:106,left:"50%",transform:"translateX(-50%)",background:t.text,color:t.isDark?"#0d0f1a":"#fff",padding:"10px 22px",borderRadius:30,fontSize:13,fontWeight:700,whiteSpace:"nowrap",zIndex:999,boxShadow:"0 4px 20px rgba(0,0,0,.3)"}}>
    {msg}
  </div>
);

const Sheet=({show,onClose,children,t})=>(
  <div onClick={onClose} style={{display:show?"flex":"none",position:"absolute",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,alignItems:"flex-end"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"90%",overflowY:"auto",transform:"translateY(0)",transition:"transform .32s"}}>
      <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:36,height:4,background:t.border,borderRadius:4}}/></div>
      {children}
    </div>
  </div>
);

const Toggle=({checked,onChange,t})=>(
  <label style={{position:"relative",width:42,height:23,flexShrink:0,cursor:"pointer"}}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{opacity:0,width:0,height:0,position:"absolute"}}/>
    <div style={{position:"absolute",inset:0,borderRadius:23,background:checked?t.teal:t.border,transition:".3s"}}>
      <div style={{position:"absolute",height:17,width:17,left:checked?22:3,bottom:3,background:"white",borderRadius:"50%",transition:".3s"}}/>
    </div>
  </label>
);

const MenuItem=({icon,label,sub,badge,onClick,t,accent})=>(
  <div onClick={onClick}
    style={{background:t.card,borderRadius:16,padding:"18px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:t.shadow,cursor:"pointer",transition:"transform .2s",borderLeft:accent?`3px solid ${t.teal}`:"none"}}
    onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="none"}>
    <div style={{width:44,height:44,borderRadius:12,background:icon.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {icon.el}
    </div>
    <div style={{flex:1}}>
      <div style={{fontSize:16,fontWeight:700,color:t.text}}>{label}</div>
      {sub&&<div style={{fontSize:12,color:t.muted,marginTop:2}}>{sub}</div>}
    </div>
    {badge&&<span style={{background:t.red,color:"white",fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:10,marginRight:6}}>{badge}</span>}
    <ChevR c={t.light}/>
  </div>
);

// ─── CALENDAR MODAL ────────────────────────────────────────────
// deterministic kWh per day
function dayKwh(y,m,d){const s=(y*10000+m*100+d)*1234+5678;return Math.round((3+((s*6271+3541)%17893)/17893*15)*10)/10;}

const CalendarModal=({show,onClose,t})=>{
  const [year,setYear]=useState(2026);
  const [month,setMonth]=useState(2);
  const [selected,setSelected]=useState(25);
  const {first,total}=getCalDays(year,month);
  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);setSelected(null);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);setSelected(null);};
  const isFuture=(y,m,d)=>new Date(y,m,d)>new Date(2026,2,25);
  const isToday=(y,m,d)=>y===2026&&m===2&&d===25;
  const pCol=p=>!p?"#d1d5db":p<.22?"#22c55e":p<.30?"#f97316":"#ef4444";
  const pLabel=p=>!p?"Future":p<.22?"Low":p<.30?"Mid":"High";

  const selPrice=selected?calPrice(year,month,selected):null;
  const selKwh=selected?dayKwh(year,month,selected):null;
  const selCost=selPrice&&selKwh?+(selPrice*selKwh).toFixed(2):null;
  // derive peak/low from SEM data if available
  const selDay=(year===2026&&month===2&&selected&&SEM[selected])?SEM[selected]:null;
  const selPeak=selDay?+(Math.max(...selDay)).toFixed(3):selPrice?+(selPrice*1.38).toFixed(3):null;
  const selLow=selDay?+(Math.min(...selDay)).toFixed(3):selPrice?+(selPrice*0.72).toFixed(3):null;
  // best window (cheapest 3-hour block)
  const bestWindows=["00:00–03:00","01:00–04:00","02:00–05:00","03:00–06:00","22:00–01:00"];
  const selBest=selected?bestWindows[selected%bestWindows.length]:null;

  if(!show) return null;
  return(
    <div onClick={onClose} style={{display:"flex",position:"absolute",inset:0,background:"rgba(0,0,0,.55)",zIndex:300,alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"92%",overflowY:"auto"}}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px"}}>
          <div style={{width:40,height:4,background:t.border,borderRadius:4}}/>
        </div>
        {/* Header row */}
        <div style={{padding:"6px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:17,fontWeight:800,color:t.text}}>Price Calendar</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:"50%",background:t.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:t.muted}}>✕</button>
        </div>
        {/* Month nav */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 20px 6px"}}>
          <button onClick={prevMonth} style={{width:34,height:34,borderRadius:"50%",border:"none",background:t.bg,cursor:"pointer",color:t.muted,fontWeight:700,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>‹</button>
          <span style={{fontSize:15,fontWeight:700,color:t.text}}>{CAL_MONTHS[month]} {year}</span>
          <button onClick={nextMonth} style={{width:34,height:34,borderRadius:"50%",border:"none",background:t.bg,cursor:"pointer",color:t.muted,fontWeight:700,fontSize:20,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1}}>›</button>
        </div>
        {/* Day-of-week headers */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 12px",gap:2}}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
            <div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:t.light,padding:"4px 0"}}>{d}</div>
          ))}
        </div>
        {/* Calendar grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 12px",gap:2}}>
          {Array.from({length:first}).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:total},(_,i)=>{
            const d=i+1;
            const price=calPrice(year,month,d);
            const kwh=dayKwh(year,month,d);
            const future=isFuture(year,month,d);
            const tod=isToday(year,month,d);
            const sel=selected===d;
            const pc=pCol(price);
            const active=tod||sel;
            return(
              <div key={d} onClick={()=>!future&&setSelected(sel&&!tod?null:d)}
                style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 2px 5px",
                  borderRadius:12,cursor:future?"default":"pointer",minHeight:64,justifyContent:"flex-start",
                  background:tod?"#3ecfb2":sel?t.tealLight:"transparent",
                  border:`2px solid ${tod?"#3ecfb2":sel?t.teal:"transparent"}`,
                  opacity:future?0.3:1,transition:"all .15s"}}>
                <span style={{fontSize:13,fontWeight:800,color:active?"#fff":t.text,lineHeight:1.2}}>{d}</span>
                {!future&&price?(
                  <>
                    <span style={{fontSize:9,fontWeight:700,color:active?"rgba(255,255,255,.9)":pc,marginTop:2}}>€{price}</span>
                    <span style={{fontSize:8,fontWeight:600,color:active?"rgba(255,255,255,.75)":t.light,marginTop:1}}>{kwh}kWh</span>
                  </>
                ):future?(
                  <span style={{fontSize:10,color:t.light,marginTop:4}}>—</span>
                ):null}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{display:"flex",gap:10,padding:"10px 16px 0",justifyContent:"center",flexWrap:"wrap"}}>
          {[["#22c55e","Low ≤€0.20"],["#f97316","Mid"],["#ef4444","High ≥€0.34"],["#d1d5db","Future"]].map(([c,l])=>(
            <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:t.muted}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>{l}
            </div>
          ))}
        </div>
        {/* Detail panel */}
        {selected&&(
          <div style={{margin:"10px 14px 16px",background:t.bg,borderRadius:16,padding:"14px 16px",border:`1px solid ${t.border}`}}>
            <div style={{fontSize:12,fontWeight:700,color:t.muted,marginBottom:10}}>
              📅 {selected} {CAL_MONTHS[month]} {year}
            </div>
            {selPrice?(
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {[
                  ["⚡","Consumed",selKwh?`${selKwh} kWh`:"—",t.teal],
                  ["💰","Total cost",selCost?`€${selCost}`:"—",t.text],
                  ["📊","Avg price",`€${selPrice}/kWh`,pCol(selPrice)],
                  ["📈","Peak price",selPeak?`€${selPeak}/kWh`:"—","#ef4444"],
                  ["📉","Lowest price",selLow?`€${selLow}/kWh`:"—","#16a34a"],
                  ["🕐","Best window",selBest||"—",t.teal],
                ].map(([ico,lbl,val,col])=>(
                  <div key={lbl} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,color:t.text,fontWeight:500}}>{ico} {lbl}</span>
                    <span style={{fontSize:13,fontWeight:700,color:col}}>{val}</span>
                  </div>
                ))}
              </div>
            ):(
              <div style={{fontSize:13,color:t.muted,textAlign:"center",padding:"8px 0"}}>No data for this date</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SPLASH ────────────────────────────────────────────────────
const SplashScreen=({nav,t})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",background:t.isDark?"#0d0f1a":"#ffffff",position:"relative",overflow:"hidden"}}>
    {/* Full-bleed hero illustration */}
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",padding:"60px 0 0"}}>
      <svg width="100%" height={300} viewBox="0 0 390 290" fill="none" style={{display:"block"}}>
        <rect width={390} height={290} fill={t.isDark?"#141625":"#f0fdf9"}/>
        {/* Sky gradient blob */}
        <ellipse cx={195} cy={80} rx={200} ry={120} fill={t.isDark?"#0d2a1e":"#d1fae5"} opacity=".6"/>
        {/* Sun */}
        <circle cx={320} cy={55} r={32} fill="#fbbf24" opacity=".7"/>
        <circle cx={320} cy={55} r={22} fill="#f59e0b"/>
        {/* Sun rays */}
        {[0,45,90,135,180,225,270,315].map((a,i)=>{
          const rad=a*Math.PI/180;
          return <line key={i} x1={320+38*Math.cos(rad)} y1={55+38*Math.sin(rad)} x2={320+46*Math.cos(rad)} y2={55+46*Math.sin(rad)} stroke="#fbbf24" strokeWidth={2.5} strokeLinecap="round"/>;
        })}
        {/* Clouds */}
        <ellipse cx={70} cy={45} rx={38} ry={15} fill="white" opacity=".9"/>
        <ellipse cx={50} cy={52} rx={26} ry={13} fill="white" opacity=".9"/>
        <ellipse cx={95} cy={52} rx={28} ry={13} fill="white" opacity=".9"/>
        <ellipse cx={260} cy={30} rx={28} ry={10} fill="white" opacity=".6"/>
        <ellipse cx={245} cy={36} rx={18} ry={9} fill="white" opacity=".6"/>
        {/* Ground */}
        <rect x={0} y={230} width={390} height={60} fill={t.isDark?"#0d2a1e":"#dcfce7"}/>
        {/* House body */}
        <rect x={130} y={148} width={130} height={90} fill="white" rx={6}/>
        {/* Roof */}
        <polygon points="110,150 195,85 280,150" fill={t.isDark?"#334155":"#374151"}/>
        {/* Door */}
        <rect x={178} y={192} width={34} height={46} fill="#3ecfb2" rx={5}/>
        <circle cx={208} cy={216} r={3} fill="white"/>
        {/* Windows */}
        <rect x={140} y={162} width={30} height={24} fill="#bfdbfe" rx={4}/>
        <line x1={155} y1={162} x2={155} y2={186} stroke="#93c5fd" strokeWidth={1.5}/>
        <line x1={140} y1={174} x2={170} y2={174} stroke="#93c5fd" strokeWidth={1.5}/>
        <rect x={220} y={162} width={30} height={24} fill="#bfdbfe" rx={4}/>
        <line x1={235} y1={162} x2={235} y2={186} stroke="#93c5fd" strokeWidth={1.5}/>
        <line x1={220} y1={174} x2={250} y2={174} stroke="#93c5fd" strokeWidth={1.5}/>
        {/* Solar panels on roof */}
        <rect x={148} y={108} width={24} height={16} fill="#1d4ed8" rx={3} opacity=".85"/>
        <rect x={178} y={100} width={24} height={16} fill="#1d4ed8" rx={3} opacity=".85"/>
        <rect x={208} y={108} width={24} height={16} fill="#1d4ed8" rx={3} opacity=".85"/>
        {/* Lightning bolt */}
        <path d="M196 116 L191 129 L197 129 L192 143 L202 127 L196 127 Z" fill="#fbbf24"/>
        {/* Tree */}
        <rect x={38} y={188} width={8} height={34} fill="#92400e" rx={3}/>
        <circle cx={42} cy={175} r={24} fill="#34d399"/>
        {/* EV Car */}
        <rect x={286} y={208} width={72} height={24} fill="#e5e7eb" rx={8}/>
        <rect x={296} y={198} width={52} height={18} fill="#d1d5db" rx={6}/>
        <circle cx={300} cy={234} r={8} fill="#374151"/>
        <circle cx={344} cy={234} r={8} fill="#374151"/>
        <circle cx={300} cy={234} r={4} fill="#9ca3af"/>
        <circle cx={344} cy={234} r={4} fill="#9ca3af"/>
        {/* EV charge cable */}
        <path d="M286 220 Q270 218 268 208" stroke="#3ecfb2" strokeWidth={3} fill="none" strokeLinecap="round"/>
        <rect x={262} y={198} width={10} height={16} fill="#374151" rx={3}/>
        <rect x={264} y={196} width={6} height={5} fill="#3ecfb2" rx={1}/>
        
      </svg>
      {/* Brand text */}
      <div style={{textAlign:"center",padding:"0 32px",marginTop:-8}}>
        <div style={{fontSize:32,fontWeight:800,color:t.text,lineHeight:1.15}}>
          Welcome to <span style={{color:t.teal}}>Watt</span>Watch
        </div>
        <div style={{fontSize:15,color:t.muted,marginTop:10,lineHeight:1.6}}>
          Smart energy price tracking<br/>for your home & EV
        </div>
      </div>
    </div>
    {/* Buttons pinned to bottom center */}
    <div style={{width:"100%",padding:"20px 32px 44px",display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
      <button onClick={()=>nav("signin")}
        style={{width:"100%",maxWidth:320,padding:"16px 0",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:14,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:`0 6px 20px ${t.teal}55`,letterSpacing:".3px"}}>
        Sign In
      </button>
      <button onClick={()=>window.open("https://energy-switch-platform-5.onrender.com/","_blank")}
        style={{width:"100%",maxWidth:320,padding:"15px 0",background:"transparent",color:t.text,border:`2px solid ${t.border}`,borderRadius:14,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",letterSpacing:".3px"}}>
        Create Account
      </button>
      <div style={{fontSize:12,color:t.light,marginTop:4,textAlign:"center"}}>
        Trusted by 12,000+ Irish households ⚡
      </div>
    </div>
  </div>
);


const AuthInput=({label,type,placeholder,value,onChange,error,t,icon,right})=>(
  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
    <label style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".5px"}}>{label}</label>
    <div style={{position:"relative"}}>
      <div style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>{icon}</div>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{width:"100%",padding:"13px 44px 13px 40px",border:`2px solid ${error?t.red:t.border}`,borderRadius:12,fontSize:15,fontFamily:"Nunito,sans-serif",color:t.text,background:t.inputBg,outline:"none"}}
        onFocus={e=>e.target.style.borderColor=t.teal}
        onBlur={e=>e.target.style.borderColor=error?t.red:t.border}/>
      {right&&<div style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}}>{right}</div>}
    </div>
    {error&&<div style={{fontSize:12,color:t.red}}>{error}</div>}
  </div>
);

const SignInScreen=({nav,onSuccess,t})=>{
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [errors,setErrors]=useState({});
  const submit=()=>{
    const e={};
    if(!validEmail(email)) e.email="Please enter a valid email address.";
    if(pw.length<6) e.pw="Password must be at least 6 characters.";
    if(Object.keys(e).length){setErrors(e);return;}
    onSuccess();
  };
  return(
    <div style={{flex:1,overflow:"auto",padding:"0 28px 40px",display:"flex",flexDirection:"column",background:t.isDark?"#0d0f1a":"#fff"}}>
      <button onClick={()=>nav("splash")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:t.teal,fontSize:14,fontWeight:700,padding:"12px 0",fontFamily:"Nunito,sans-serif"}}><ChevL c={t.teal} s={18}/> Back</button>
      <div style={{marginBottom:28}}>
        <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,boxShadow:`0 6px 20px ${t.teal}66`}}><BoltIco s={26}/></div>
        <div style={{fontSize:26,fontWeight:800,color:t.text}}>Welcome back 👋</div>
        <div style={{fontSize:14,color:t.muted,marginTop:6}}>Sign in to your WattWatch account</div>
      </div>
      <AuthInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} t={t} icon={<MailIco c={t.light}/>}/>
      <AuthInput label="Password" type={showPw?"text":"password"} placeholder="Enter your password" value={pw} onChange={e=>setPw(e.target.value)} error={errors.pw} t={t}
        icon={<LockIco c={t.light}/>}
        right={<button onClick={()=>setShowPw(!showPw)} style={{background:"none",border:"none",cursor:"pointer",color:t.light,padding:4}}>{showPw?<EyeOff/>:<EyeOn/>}</button>}/>
      <div style={{textAlign:"right",marginTop:-8,marginBottom:16}}>
        <span style={{fontSize:13,fontWeight:700,color:t.teal,cursor:"pointer"}}>Forgot password?</span>
      </div>
      <button onClick={submit} style={{width:"100%",padding:16,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:`0 6px 20px ${t.teal}55`}}>Sign In</button>
      <div style={{textAlign:"center",marginTop:20,fontSize:14,color:t.muted}}>
        Don't have an account? <span  onClick={()=>window.open("https://energy-switch-platform-5.onrender.com/","_blank")}
        style={{color:t.teal,fontWeight:800,cursor:"pointer"}}>Sign Up</span>
      </div>
    </div>
  );
};

const SignUpScreen=({nav,onSuccess,t})=>{
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [pw2,setPw2]=useState("");
  const [showPw,setShowPw]=useState(false);
  const [errors,setErrors]=useState({});
  const submit=()=>{
    const e={};
    if(!name.trim()) e.name="Please enter your full name.";
    if(!validEmail(email)) e.email="Please enter a valid email address.";
    if(pw.length<6) e.pw="Password must be at least 6 characters.";
    if(pw2!==pw) e.pw2="Passwords do not match.";
    if(Object.keys(e).length){setErrors(e);return;}
    window.open("https://energy-switch-platform-5.onrender.com","_blank");
    onSuccess();
  };
  const eyeBtn=<button onClick={()=>setShowPw(!showPw)} style={{background:"none",border:"none",cursor:"pointer",color:t.light,padding:4}}>{showPw?<EyeOff/>:<EyeOn/>}</button>;
  return(
    <div style={{flex:1,overflow:"auto",padding:"0 28px 40px",display:"flex",flexDirection:"column",background:t.isDark?"#0d0f1a":"#fff"}}>
      <button onClick={()=>nav("splash")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:6,color:t.teal,fontSize:14,fontWeight:700,padding:"12px 0",fontFamily:"Nunito,sans-serif"}}><ChevL c={t.teal} s={18}/> Back</button>
      <div style={{marginBottom:24}}>
        <div style={{width:52,height:52,borderRadius:16,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}><UserIco c="white"/></div>
        <div style={{fontSize:26,fontWeight:800,color:t.text}}>Create account ⚡</div>
        <div style={{fontSize:14,color:t.muted,marginTop:6}}>Start tracking your energy costs today</div>
      </div>
      <AuthInput label="Full Name" type="text" placeholder="Jey" value={name} onChange={e=>setName(e.target.value)} error={errors.name} t={t} icon={<UserIco c={t.light}/>}/>
      <AuthInput label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} error={errors.email} t={t} icon={<MailIco c={t.light}/>}/>
      <AuthInput label="Password" type={showPw?"text":"password"} placeholder="Min. 6 characters" value={pw} onChange={e=>setPw(e.target.value)} error={errors.pw} t={t} icon={<LockIco c={t.light}/>} right={eyeBtn}/>
      <AuthInput label="Confirm Password" type={showPw?"text":"password"} placeholder="Repeat your password" value={pw2} onChange={e=>setPw2(e.target.value)} error={errors.pw2} t={t} icon={<LockIco c={t.light}/>}/>
      <div style={{background:t.tealLight,borderRadius:10,padding:"11px 13px",fontSize:12,color:t.teal,fontWeight:600,lineHeight:1.5,marginBottom:16}}>
        By signing up you agree to WattWatch's <u style={{cursor:"pointer"}}>Terms of Service</u> and <u style={{cursor:"pointer"}}>Privacy Policy</u>.
      </div>
      <button onClick={submit} style={{width:"100%",padding:16,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:`0 6px 20px ${t.teal}55`}}>Create Account</button>
      <div style={{textAlign:"center",marginTop:20,fontSize:14,color:t.muted}}>
        Already have an account? <span onClick={()=>nav("signin")} style={{color:t.teal,fontWeight:800,cursor:"pointer"}}>Sign In</span>
      </div>
    </div>
  );
};

const LoadingScreen=({t})=>{
  const [pct,setPct]=useState(0);
  const [msg,setMsg]=useState("Connecting to WattWatch…");
  useEffect(()=>{
    const msgs=["Connecting to WattWatch…","Fetching live energy prices…","Loading your dashboard…","Almost ready…"];
    let p=0;
    const tick=setInterval(()=>{p+=2;setPct(p);if(p===25)setMsg(msgs[1]);if(p===55)setMsg(msgs[2]);if(p===80)setMsg(msgs[3]);if(p>=100)clearInterval(tick);},100);
    return()=>clearInterval(tick);
  },[]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,background:t.isDark?"#0d0f1a":"#fff"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:22,fontWeight:800,color:t.text}}>Signing you in…</div>
        <div style={{fontSize:13,color:t.muted,marginTop:6}}>{msg}</div>
      </div>
      <div style={{position:"relative",width:90,height:90}}>
        <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`4px solid ${t.tealLight}`,borderTopColor:t.teal,animation:"spin .9s linear infinite"}}/>
        <div style={{position:"absolute",inset:12,borderRadius:"50%",border:`3px solid ${t.tealLight}`,borderBottomColor:t.teal,animation:"spinR 1.4s linear infinite"}}/>
        <div style={{position:"absolute",inset:26,borderRadius:"50%",background:t.teal,display:"flex",alignItems:"center",justifyContent:"center"}}><BoltIco s={18}/></div>
      </div>
      <div style={{width:240,background:t.tealLight,borderRadius:99,height:6,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:t.teal,borderRadius:99,transition:"width .15s linear"}}/>
      </div>
    </div>
  );
};

const HomeScreen=({nav,toast,t,openCal})=>{
  const curH=new Date().getHours();
  const curSlotIdx=curH*2;
  const baseSlot=liveHalfHourly[curSlotIdx]||liveHalfHourly[24];
  const maxP=Math.max(...liveHalfHourly.map(d=>d.r));
  const scrollRef=useRef(null);

  const PRICE_TIERS=[
    {min:0.155,max:0.200,label:"🟢 Very Low",  col:"#4ade80",glow:"rgba(34,197,94,.6)", ring:"rgba(34,197,94,.3)", bg:"linear-gradient(145deg,#052e16,#14532d,#052e16)"},
    {min:0.210,max:0.270,label:"🟡 Moderate",  col:"#fbbf24",glow:"rgba(251,191,36,.6)", ring:"rgba(251,191,36,.3)", bg:"linear-gradient(145deg,#1c1003,#3b2200,#1c1003)"},
    {min:0.290,max:0.340,label:"🔴 High",       col:"#f87171",glow:"rgba(239,68,68,.6)",  ring:"rgba(239,68,68,.3)",  bg:"linear-gradient(145deg,#1c0505,#450a0a,#1c0505)"},
  ];
  const [tierIdx,setTierIdx]=useState(0);
  const [livePrice,setLivePrice]=useState(()=>{const tr=PRICE_TIERS[0];return +(tr.min+(Math.random()*(tr.max-tr.min))).toFixed(3);});
  const [priceDir,setPriceDir]=useState(0);
  const [fading,setFading]=useState(false);

  useEffect(()=>{
    const tick=setInterval(()=>{
  
      setFading(true);
      setTimeout(()=>{
        setTierIdx(prev=>{
          const next=(prev+1)%3;
          const tr=PRICE_TIERS[next];
          const newPrice=+(tr.min+(Math.random()*(tr.max-tr.min))).toFixed(3);
          setPriceDir(newPrice>livePrice?1:-1);
          setLivePrice(newPrice);
          return next;
        });
        setFading(false);
      },400);
    },10000);
    return()=>clearInterval(tick);
  },[]);

  const tier=PRICE_TIERS[tierIdx];

  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollLeft=Math.max(0,(curSlotIdx-3)*52);},[]);
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{background:t.sbBg,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
        <div onClick={()=>nav("profile")} style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer"}}>AR</div>
        <h2 style={{flex:1,fontSize:17,fontWeight:700,color:t.text,margin:0}}>Welcome, Jey 👋</h2>
        <button onClick={openCal} style={{width:36,height:36,borderRadius:"50%",background:t.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><CalIco c={t.text}/></button>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:94}}>
        {/* ── 2 FULL-WIDTH CIRCLE CARDS ── */}
        <div style={{padding:"18px 0 0"}}>
          <div style={{display:"flex",overflowX:"auto",scrollSnapType:"x mandatory",scrollbarWidth:"none",WebkitOverflowScrolling:"touch"}} ref={useRef(null)}>

            {/* CARD 1 — Live Price */}
            <div style={{minWidth:"100%",scrollSnapAlign:"start",display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0 14px",flexShrink:0}}>
              <div style={{
                width:180,height:180,borderRadius:"50%",
                background:tier.bg,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                boxShadow:`0 0 44px ${tier.glow},0 10px 28px rgba(0,0,0,.4)`,
                position:"relative",
                opacity:fading?0:1,
                transition:"opacity .4s, box-shadow .6s, background .6s"
              }}>
                {/* Inner ring */}
                <div style={{position:"absolute",inset:6,borderRadius:"50%",border:`1.5px solid ${tier.ring}`,transition:"border-color .6s"}}/>
                {/* Status label */}
                <div style={{fontSize:11,fontWeight:800,color:tier.col,textTransform:"uppercase",letterSpacing:".5px",marginBottom:5,transition:"color .6s"}}>{tier.label}</div>
                {/* Price */}
                <div style={{display:"flex",alignItems:"baseline",gap:2}}>
                  <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.45)"}}>€</span>
                  <span style={{fontSize:32,fontWeight:800,color:tier.col,lineHeight:1,fontVariantNumeric:"tabular-nums",transition:"color .6s"}}>{livePrice.toFixed(3)}</span>
                  <span style={{fontSize:14,color:priceDir===1?tier.col:"#f87171",marginLeft:2,transition:"color .4s"}}>{priceDir===1?"▲":"▼"}</span>
                </div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:3}}>/kWh</div>
                {/* Live pulse dot */}
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:7}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:tier.col,boxShadow:`0 0 10px ${tier.col}`,animation:"blink 1.2s ease-in-out infinite",transition:"background .6s"}}/>
                  <span style={{fontSize:9,color:"rgba(255,255,255,.4)",fontWeight:700,letterSpacing:".3px"}}>LIVE · SEMOpx</span>
                </div>
              </div>
              <div style={{textAlign:"center",marginTop:10}}>
                <div style={{fontSize:11,color:t.muted}}>Mar 25 · Updates every 10s</div>
              </div>
            </div>

            {/* CARD 2 — Monthly Forecast */}
            <div style={{minWidth:"100%",scrollSnapAlign:"start",display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 0 14px",flexShrink:0}}>
              <div style={{width:170,height:170,borderRadius:"50%",background:`linear-gradient(145deg,${t.tealDark},${t.teal})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:`0 10px 28px ${t.teal}66`,position:"relative"}}>
                <div style={{position:"absolute",inset:6,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,.2)"}}/>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.7)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:3}}>March Forecast</div>
                <div style={{fontSize:28,fontWeight:800,color:"#fff",lineHeight:1}}>€148.20</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:2}}>this month</div>
                <div style={{fontSize:11,fontWeight:700,color:"#a7f3d0",marginTop:5}}>↓ −3% vs Feb</div>
              </div>
              <div style={{textAlign:"center",marginTop:12}}>
                <div style={{fontSize:14,fontWeight:800,color:t.text}}>Predicted Bill</div>
                <div style={{fontSize:11,color:t.muted,marginTop:3}}>Avg €0.236/kWh · 628 kWh</div>
              </div>
            </div>
          </div>

          {/* Dot indicators */}
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:4}}>
            {[0,1].map(i=>(
              <div key={i} style={{width:i===0?18:6,height:6,borderRadius:99,background:i===0?t.teal:t.border,transition:"all .3s"}}/>
            ))}
          </div>
        </div>
        {/* Hourly Timeline — 30-min intervals */}
        <div style={{padding:"16px 0 0"}}>
          <div style={{padding:"0 20px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:12,color:t.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px"}}>⏱ Prices (30-min)</div>
            <div style={{fontSize:11,fontWeight:700,color:t.teal,background:t.tealLight,padding:"3px 8px",borderRadius:8}}>Today</div>
          </div>
          <div ref={scrollRef} style={{display:"flex",overflowX:"auto",padding:"0 20px 8px",gap:4,scrollbarWidth:"none"}}>
            {liveHalfHourly.map((d,i)=>{
              const pct=Math.max(12,Math.round((d.r/maxP)*100));
              const col=barColor(d.r);
              const isCur=i===curSlotIdx;
              return(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:44}}>
                  {isCur&&<div style={{fontSize:8,fontWeight:800,color:t.teal,whiteSpace:"nowrap",marginBottom:2}}>NOW</div>}
                  {!isCur&&<div style={{height:14}}/>}
                  <div style={{height:80,display:"flex",alignItems:"flex-end",width:"100%",justifyContent:"center"}}>
                    <div style={{width:22,height:`${pct}%`,borderRadius:"5px 5px 0 0",background:isCur?col:`${col}33`,borderLeft:isCur?"none":`2px solid ${col}`,boxShadow:isCur?`0 4px 14px ${col}88`:"none"}}/>
                  </div>
                  <div style={{fontSize:9,fontWeight:700,color:isCur?t.teal:t.light,marginTop:4,whiteSpace:"nowrap"}}>{d.h}</div>
                  <div style={{fontSize:8,fontWeight:800,color:col}}>€{d.r.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Tips */}
        <div style={{padding:"14px 20px 0"}}>
          <div style={{fontSize:12,color:t.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>⚡ Smart Tips</div>
          {[{label:"Peak Hours",sub:"08:00–10:00 · 17:00–19:00",tag:"€0.29–0.34",bg:"#fef2f2",tc:t.red},
            {label:"Off-Peak Hours",sub:"00:00–06:00 · 13:00–15:00",tag:"€0.17–0.20",bg:t.tealLight,tc:t.teal},
            {label:"Best Charge Window",sub:"01:00–05:00 today",tag:"Cheapest",bg:"#dcfce7",tc:"#16a34a"},
          ].map((row,i)=>(
            <div key={i} style={{background:t.card,borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,marginBottom:10,boxShadow:t.shadow}}>
              <div style={{width:40,height:40,background:t.tealLight,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><BoltIco c={t.teal} s={18}/></div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:t.text}}>{row.label}</div>
                <div style={{fontSize:13,color:t.muted,fontWeight:600,marginTop:2}}>{row.sub}</div>
              </div>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6,background:row.bg,color:row.tc}}>{row.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── ANALYTICS ─────────────────────────────────────────────────

const WattChart=({d,t,tab})=>{
  const chartData=d.labels.map((l,i)=>({name:l,value:d.data[i]}));
  const interval = tab==="yearly"?3 : tab==="daily"?3 : 0;
  const margin = tab==="yearly"
    ? {top:16,right:10,left:4,bottom:0}
    : {top:16,right:16,left:4,bottom:0};
  return(
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={margin}>
        <defs>
          <linearGradient id={`wg-${tab}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={t.teal} stopOpacity={0.22}/>
            <stop offset="90%" stopColor={t.teal} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          tick={{fontSize:10,fill:t.muted,fontFamily:"Nunito,sans-serif",fontWeight:600}}
          tickLine={false}
          axisLine={false}
          interval={interval}
        />
        <YAxis
          tick={{fontSize:10,fill:t.muted,fontFamily:"Nunito,sans-serif",fontWeight:600}}
          tickLine={false}
          axisLine={false}
          tickFormatter={d.yFmt}
          width={48}
          tickCount={5}
        />
        <Tooltip
          formatter={v=>[d.ttFmt(v),"Price"]}
          contentStyle={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,fontSize:12,fontFamily:"Nunito,sans-serif",boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}
          labelStyle={{color:t.text,fontWeight:700}}
          cursor={{stroke:t.teal,strokeWidth:1,strokeDasharray:"4 4"}}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={t.teal}
          strokeWidth={2.5}
          fill={`url(#wg-${tab})`}
          dot={false}
          activeDot={{fill:t.teal,stroke:t.card,strokeWidth:2.5,r:5}}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const AnalyticsScreen=({nav,toast,t,openCal})=>{
  const [tab,setTab]=useState("daily");
  const d=CHART_DATA[tab];
  const tabLabels={"daily":"Daily","weekly":"Weekly","monthly":"Monthly","yearly":"Yearly"};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="Analytics" onCal={openCal}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:94}}>
        {/* Tabs */}
        <div style={{display:"flex",gap:8,padding:"16px 20px 0",overflowX:"auto",scrollbarWidth:"none"}}>
          {["daily","weekly","monthly","yearly"].map(tb=>(
            <button key={tb} onClick={()=>setTab(tb)}
              style={{padding:"8px 20px",borderRadius:20,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",
                whiteSpace:"nowrap",background:tab===tb?t.text:t.card,color:tab===tb?"#fff":t.muted,
                boxShadow:t.shadow,fontFamily:"Nunito,sans-serif",transition:"all .2s"}}>
              {tabLabels[tb]}
            </button>
          ))}
        </div>
        {/* Stats strip */}
        <div style={{display:"flex",gap:10,padding:"14px 20px 0"}}>
          <div style={{flex:1,background:t.card,borderRadius:14,padding:14,boxShadow:t.shadow}}>
            <div style={{fontSize:11,color:t.light,fontWeight:600}}>{d.yr}</div>
            <div style={{fontSize:22,fontWeight:800,color:t.text,margin:"4px 0 2px",letterSpacing:"-1px"}}>{d.amount}</div>
            <div style={{fontSize:11,fontWeight:700,color:t.green}}>{d.change}</div>
          </div>
          <div style={{flex:1,background:t.card,borderRadius:14,padding:14,boxShadow:t.shadow}}>
            <div style={{fontSize:11,color:t.light,fontWeight:600}}>Average</div>
            <div style={{fontSize:22,fontWeight:800,color:t.text,margin:"4px 0 2px",letterSpacing:"-1px"}}>{d.avg}</div>
            <div style={{fontSize:11,color:t.muted,fontWeight:600}}>{d.range}</div>
          </div>
        </div>
        {/* Chart card */}
        <div style={{margin:"14px 20px 0",background:t.card,borderRadius:20,boxShadow:t.shadow,overflow:"hidden",paddingBottom:8}}>
          <div style={{padding:"18px 18px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:14,fontWeight:800,color:t.text}}>{d.title}</div>
            <div style={{fontSize:11,fontWeight:700,color:t.teal,background:t.tealLight,padding:"4px 10px",borderRadius:20}}>{d.range}</div>
          </div>
          <div style={{height:320,padding:"8px 0 8px"}}>
            <WattChart d={d} t={t} tab={tab}/>
          </div>
        </div>
        <div style={{height:20}}/>
      </div>
    </div>
  );
};

// ─── DEVICES ───────────────────────────────────────────────────
const DevicesScreen=({nav,toast,t,openCal})=>{
  const [scanState,setScanState]=useState("idle"); // idle | scanning | done
  const [scanStep,setScanStep]=useState(0);
  const [scanPct,setScanPct]=useState(0);
  const SCAN_STEPS=["Connecting to WattWatch Hub…","Handshaking with hub firmware…","Scanning local network for components…","Checking Zigbee + Z-Wave channels…","Finalising device discovery…"];

  const startScan=()=>{
    setScanState("scanning");setScanStep(0);setScanPct(0);
    let pct=0,step=0;
    const iv=setInterval(()=>{
      pct+=2;setScanPct(pct);
      const ns=Math.min(SCAN_STEPS.length-1,Math.floor(pct/20));
      if(ns!==step){step=ns;setScanStep(ns);}
      if(pct>=100){clearInterval(iv);setScanState("done");}
    },100);
  };

  const devices=[
    {
      name:"EV Charger",sub:"Volkswagen ID.4",
      icon:<svg viewBox="0 0 48 48" width={36} height={36} fill="none">
        <rect x="6" y="20" width="36" height="18" rx="6" fill="#3ecfb2" opacity=".2"/>
        <rect x="6" y="20" width="36" height="18" rx="6" stroke="#3ecfb2" strokeWidth="2"/>
        <circle cx="14" cy="38" r="5" fill="#1a1a2e" stroke="#3ecfb2" strokeWidth="2"/>
        <circle cx="34" cy="38" r="5" fill="#1a1a2e" stroke="#3ecfb2" strokeWidth="2"/>
        <rect x="14" y="12" width="20" height="12" rx="4" fill="#3ecfb2" opacity=".35"/>
        <path d="M22 26 L20 32 L24 32 L22 36" stroke="#3ecfb2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>,
      kwh:"9.6 kWh",cost:"€2.26",status:"Charging",statusCol:"#22c55e",bg:"#e8faf7",bar:72,
      detail:"Charged 01:30–04:00 · Night Saver rate"
    },
    {
      name:"Smart Lights",sub:"Philips Hue · 8 bulbs",
      icon:<svg viewBox="0 0 48 48" width={36} height={36} fill="none">
        <circle cx="24" cy="20" r="10" fill="#fbbf24" opacity=".3"/>
        <circle cx="24" cy="20" r="7" fill="#fbbf24"/>
        <rect x="20" y="30" width="8" height="3" rx="1" fill="#f59e0b"/>
        <rect x="21" y="33" width="6" height="2" rx="1" fill="#d97706"/>
        <line x1="24" y1="8" x2="24" y2="5" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <line x1="33" y1="11" x2="35" y2="9" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <line x1="36" y1="20" x2="39" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <line x1="15" y1="11" x2="13" y2="9" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="20" x2="9" y2="20" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
      </svg>,
      kwh:"0.9 kWh",cost:"€0.21",status:"On",statusCol:"#fbbf24",bg:"#fffbeb",bar:18,
      detail:"Active since 06:30 · 8 zones online"
    },
    {
      name:"Heater",sub:"Daikin Heat Pump",
      icon:<svg viewBox="0 0 48 48" width={36} height={36} fill="none">
        <rect x="8" y="16" width="32" height="20" rx="6" fill="#f97316" opacity=".2"/>
        <rect x="8" y="16" width="32" height="20" rx="6" stroke="#f97316" strokeWidth="2"/>
        <path d="M16 16 Q18 10 20 16 Q22 22 24 16 Q26 10 28 16 Q30 22 32 16" stroke="#ef4444" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="14" y1="26" x2="34" y2="26" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="14" y1="30" x2="28" y2="30" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>,
      kwh:"4.2 kWh",cost:"€0.99",status:"Active",statusCol:"#f97316",bg:"#fff7ed",bar:55,
      detail:"Set to 21°C · Running 4.2 hrs today"
    },
    {
      name:"Solar Panels",sub:"SolarEdge · 4.2kWp",
      icon:<svg viewBox="0 0 48 48" width={36} height={36} fill="none">
        <rect x="4" y="14" width="18" height="12" rx="2" fill="#1d4ed8" opacity=".25"/>
        <rect x="4" y="14" width="18" height="12" rx="2" stroke="#1d4ed8" strokeWidth="1.5"/>
        <line x1="13" y1="14" x2="13" y2="26" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <line x1="4" y1="20" x2="22" y2="20" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <rect x="26" y="14" width="18" height="12" rx="2" fill="#1d4ed8" opacity=".25"/>
        <rect x="26" y="14" width="18" height="12" rx="2" stroke="#1d4ed8" strokeWidth="1.5"/>
        <line x1="35" y1="14" x2="35" y2="26" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <line x1="26" y1="20" x2="44" y2="20" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <rect x="4" y="29" width="18" height="12" rx="2" fill="#1d4ed8" opacity=".25"/>
        <rect x="4" y="29" width="18" height="12" rx="2" stroke="#1d4ed8" strokeWidth="1.5"/>
        <line x1="13" y1="29" x2="13" y2="41" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <line x1="4" y1="35" x2="22" y2="35" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <rect x="26" y="29" width="18" height="12" rx="2" fill="#1d4ed8" opacity=".25"/>
        <rect x="26" y="29" width="18" height="12" rx="2" stroke="#1d4ed8" strokeWidth="1.5"/>
        <line x1="35" y1="29" x2="35" y2="41" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <line x1="26" y1="35" x2="44" y2="35" stroke="#1d4ed8" strokeWidth="1" opacity=".5"/>
        <circle cx="38" cy="8" r="5" fill="#fbbf24" opacity=".8"/>
        <line x1="32" y1="8" x2="30" y2="8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>,
      kwh:"−7.8 kWh",cost:"−€1.84",status:"Generating",statusCol:"#16a34a",bg:"#dcfce7",bar:88,
      detail:"Exporting 1.8 kW to grid · Saving today"
    },
  ];
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="My Devices" onCal={openCal}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:94}}>
        {/* Summary strip */}
        <div style={{display:"flex",gap:10,padding:"14px 20px 0"}}>
          {[["4","Connected"],["−€1.84","Saved today"],["14.7 kWh","Total used"]].map(([v,l])=>(
            <div key={l} style={{flex:1,background:t.card,borderRadius:14,padding:"12px 10px",textAlign:"center",boxShadow:t.shadow}}>
              <div style={{fontSize:15,fontWeight:800,color:t.text}}>{v}</div>
              <div style={{fontSize:10,color:t.muted,marginTop:2,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
        {/* Device cards */}
        <div style={{padding:"12px 20px 0",display:"flex",flexDirection:"column",gap:12}}>
          {devices.map((d,i)=>(
            <div key={i} style={{background:t.card,borderRadius:18,boxShadow:t.shadow,padding:"16px 16px 14px",display:"flex",alignItems:"center",gap:14}}>
              {/* Icon */}
              <div style={{width:56,height:56,borderRadius:16,background:d.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {d.icon}
              </div>
              {/* Info */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                  <div style={{fontSize:15,fontWeight:800,color:t.text}}>{d.name}</div>
                  <span style={{fontSize:11,fontWeight:700,color:d.statusCol,background:d.bg,padding:"3px 8px",borderRadius:20,flexShrink:0}}>{d.status}</span>
                </div>
                <div style={{fontSize:11,color:t.muted,marginBottom:6}}>{d.sub}</div>
                {/* Usage bar */}
                <div style={{height:4,background:t.border,borderRadius:4,marginBottom:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${d.bar}%`,background:d.statusCol,borderRadius:4,transition:"width .5s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:11,color:t.muted}}>{d.detail}</div>
                </div>
              </div>
              {/* Right: consumption + cost */}
              <div style={{textAlign:"right",flexShrink:0,minWidth:62}}>
                <div style={{fontSize:15,fontWeight:800,color:t.text}}>{d.cost}</div>
                <div style={{fontSize:11,color:t.muted,marginTop:2}}>{d.kwh}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"16px 20px 28px"}}>
          <button onClick={startScan} disabled={scanState==="scanning"}
            style={{width:"100%",padding:14,background:scanState==="scanning"?t.border:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:14,fontSize:14,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:scanState==="scanning"?"not-allowed":"pointer",boxShadow:scanState!=="scanning"?`0 4px 16px ${t.teal}55`:"none",transition:"all .3s"}}>
            ＋ Add New Device
          </button>
        </div>
      </div>

      {/* ── HUB SCAN SHEET ── */}
      {(scanState==="scanning"||scanState==="done")&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",zIndex:300,display:"flex",alignItems:"flex-end"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:"24px 24px 0 0",width:"100%",padding:"20px 24px 36px"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:18}}><div style={{width:40,height:4,borderRadius:4,background:t.border}}/></div>

            {scanState==="scanning"?(
              <>
                {/* Hub icon with spin rings */}
                <div style={{display:"flex",justifyContent:"center",marginBottom:18}}>
                  <div style={{position:"relative",width:80,height:80}}>
                    <div style={{position:"absolute",inset:-10,borderRadius:"50%",border:`2px solid ${t.teal}`,opacity:.3,animation:"spin 2s linear infinite"}}/>
                    <div style={{position:"absolute",inset:-20,borderRadius:"50%",border:`1.5px solid ${t.teal}`,opacity:.15,animation:"spinR 3.5s linear infinite"}}/>
                    <div style={{width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 24px ${t.teal}88`}}>
                      <svg viewBox="0 0 32 32" width={34} height={34} fill="none">
                        <circle cx="16" cy="16" r="5" fill="white"/>
                        <circle cx="16" cy="5" r="2.5" fill="white" opacity=".8"/>
                        <circle cx="16" cy="27" r="2.5" fill="white" opacity=".8"/>
                        <circle cx="5" cy="16" r="2.5" fill="white" opacity=".8"/>
                        <circle cx="27" cy="16" r="2.5" fill="white" opacity=".8"/>
                        <line x1="16" y1="11" x2="16" y2="7.5" stroke="white" strokeWidth="1.5"/>
                        <line x1="16" y1="21" x2="16" y2="24.5" stroke="white" strokeWidth="1.5"/>
                        <line x1="11" y1="16" x2="7.5" y2="16" stroke="white" strokeWidth="1.5"/>
                        <line x1="21" y1="16" x2="24.5" y2="16" stroke="white" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div style={{fontSize:16,fontWeight:800,color:t.text,marginBottom:4}}>Scanning for Components</div>
                  <div style={{fontSize:13,color:t.muted}}>{SCAN_STEPS[scanStep]}</div>
                </div>
                <div style={{height:6,background:t.border,borderRadius:99,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${scanPct}%`,background:`linear-gradient(90deg,${t.teal},${t.tealDark})`,borderRadius:99,transition:"width .12s linear"}}/>
                </div>
                <div style={{textAlign:"right",fontSize:11,color:t.muted,marginBottom:14}}>{scanPct}%</div>
                <div style={{display:"flex",justifyContent:"center",gap:8}}>
                  {SCAN_STEPS.map((_,i)=>(
                    <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<=scanStep?t.teal:t.border,transition:"background .3s"}}/>
                  ))}
                </div>
              </>
            ):(
              /* DONE — no components found */
              <>
                <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
                  <div style={{width:68,height:68,borderRadius:"50%",background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>📡</div>
                </div>
                <div style={{textAlign:"center",marginBottom:16}}>
                  <div style={{fontSize:17,fontWeight:800,color:t.text,marginBottom:6}}>No Components Found</div>
                  <div style={{fontSize:13,color:t.muted,lineHeight:1.6}}>Hub was reached but no new devices were detected on the network.</div>
                </div>
                <div style={{background:t.bg,borderRadius:12,padding:"12px 16px",marginBottom:16}}>
                  {[["✓","#16a34a","Hub connected successfully"],["✓","#16a34a","Network scan complete (Zigbee · Z-Wave · Wi-Fi)"],["✗",t.red,"No new components detected"]].map(([ic,col,msg],i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<2?8:0}}>
                      <span style={{fontSize:13,fontWeight:800,color:col}}>{ic}</span>
                      <span style={{fontSize:12,color:t.text}}>{msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:12,color:t.muted,textAlign:"center",marginBottom:16,lineHeight:1.6}}>
                  Make sure your device is powered on and within range of the hub.
                </div>
                <button onClick={()=>setScanState("idle")} style={{width:"100%",padding:13,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ALERTS ────────────────────────────────────────────────────
const DAYS_LIST=[{k:"Mo",l:"Mo"},{k:"Tu",l:"Tu"},{k:"We",l:"We"},{k:"Th",l:"Th"},{k:"Fr",l:"Fr"},{k:"Sa",l:"Sa"},{k:"Su",l:"Su"}];
const AlertsScreen=({nav,toast,t,openCal,alerts,setAlerts,sheetOpen,setSheetOpen})=>{
  const [type,setType]=useState("price");
  const [pName,setPName]=useState("");
  const [pPrice,setPPrice]=useState("0.20");
  const [cond,setCond]=useState("below");
  const [pNotify,setPNotify]=useState("push");
  const [pDays,setPDays]=useState(["Mo","Tu","We","Th","Fr"]);
  const [tName,setTName]=useState("");
  const [tStart,setTStart]=useState("06:00");
  const [tEnd,setTEnd]=useState("08:00");
  const [tNotify,setTNotify]=useState("push");
  const [tDays,setTDays]=useState(["Mo","Tu","We","Th","Fr"]);
  const toggleDay=(list,setList,k)=>setList(l=>l.includes(k)?l.filter(x=>x!==k):[...l,k]);

  const IS={width:"100%",padding:"13px 14px",border:`2px solid ${t.border}`,borderRadius:12,fontSize:15,fontFamily:"Nunito,sans-serif",color:t.text,background:t.inputBg,outline:"none"};
  const SEL={...IS,appearance:"none",paddingRight:36,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"};
  // Theme colours depending on alert type
  const ac=type==="time"?"#f97316":t.teal;
  const acDark=type==="time"?"#ea6808":t.tealDark;
  const acLight=type==="time"?"#fff7ed":t.tealLight;

  const create=()=>{
    if(type==="price"&&(!pName||!pPrice)){toast("⚠️ Fill in all fields");return;}
    if(type==="time"&&!tName){toast("⚠️ Fill in all fields");return;}
    const days=type==="price"?pDays:tDays;
    setAlerts(p=>[...p,{
      id:Date.now(),type,
      name:type==="price"?pName:tName,
      desc:type==="price"?`Price ${cond} €${pPrice}/kWh · ${pNotify}`:`${tStart}–${tEnd} · ${tNotify}`,
      days,active:true
    }]);
    setSheetOpen(false);toast("✅ Alert created!");
    setPName("");setPPrice("0.20");setTName("");
  };

  const DayBtns=({list,setList})=>(
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {DAYS_LIST.map(({k,l})=>{
        const on=list.includes(k);
        return(
          <button key={k} onClick={()=>toggleDay(list,setList,k)}
            style={{width:40,height:40,borderRadius:"50%",border:`2px solid ${on?ac:t.border}`,
              background:on?acLight:"transparent",color:on?ac:t.muted,
              fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",transition:"all .15s"}}>
            {l}
          </button>
        );
      })}
    </div>
  );

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="My Alerts" onCal={openCal}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:94}}>
        <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:18,fontWeight:800,color:t.text}}>Price Alerts</div>
          <span style={{background:t.tealLight,color:t.teal,fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:10}}>{alerts.filter(a=>a.active).length} Active</span>
        </div>
        {alerts.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 40px",gap:14,textAlign:"center"}}>
            <AlertsIco c={t.border}/>
            <div style={{fontSize:18,fontWeight:700,color:t.text}}>No Alerts Yet</div>
            <div style={{fontSize:14,color:t.muted,lineHeight:1.5}}>Tap <strong>+</strong> below to create your first alert.</div>
          </div>
        ):alerts.map(a=>(
          <div key={a.id} style={{background:t.card,borderRadius:16,padding:"14px 14px 14px 18px",margin:"12px 20px 0",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:12,borderLeft:`4px solid ${a.type==="price"?t.teal:t.orange}`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:t.text}}>{a.name}</div>
              <div style={{fontSize:12,color:t.muted,marginTop:2}}>{a.desc}</div>
              {a.days&&<div style={{display:"flex",gap:3,marginTop:5}}>{a.days.map(d=><span key={d} style={{fontSize:10,fontWeight:700,color:t.teal,background:t.tealLight,padding:"2px 5px",borderRadius:4}}>{d}</span>)}</div>}
            </div>
            <Toggle checked={a.active} onChange={()=>setAlerts(p=>p.map(x=>x.id===a.id?{...x,active:!x.active}:x))} t={t}/>
            <button onClick={()=>setAlerts(p=>p.filter(x=>x.id!==a.id))} style={{width:30,height:30,borderRadius:8,background:"#fef2f2",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:t.red}}><TrashIco/></button>
          </div>
        ))}
      </div>
      {/* FAB */}
      <button onClick={()=>setSheetOpen(true)} style={{position:"absolute",bottom:100,right:22,width:52,height:52,borderRadius:"50%",background:t.teal,border:"none",boxShadow:`0 6px 20px ${t.teal}88`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:20}}>
        <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="white" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      {/* Create Alert sheet */}
      <div onClick={()=>setSheetOpen(false)} style={{display:sheetOpen?"flex":"none",position:"absolute",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,alignItems:"flex-end"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:"24px 24px 0 0",width:"100%",maxHeight:"92%",overflowY:"auto"}}>
          {/* Handle + header */}
          <div style={{display:"flex",justifyContent:"center",padding:"10px 0 4px"}}><div style={{width:40,height:4,background:t.border,borderRadius:4}}/></div>
          <div style={{padding:"4px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{fontSize:18,fontWeight:800,color:t.text}}>Create Alert</div>
            <button onClick={()=>setSheetOpen(false)} style={{width:30,height:30,borderRadius:"50%",background:t.bg,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:t.muted}}>✕</button>
          </div>
          {/* Type tabs */}
          <div style={{display:"flex",gap:10,padding:"14px 20px 0"}}>
            {[["price","$","Price Alert"],["time","🕐","Time Alert"]].map(([k,ico,l])=>{
              const tabAc=k==="time"?"#f97316":t.teal;
              const tabAcLight=k==="time"?"#fff7ed":t.tealLight;
              return(
                <button key={k} onClick={()=>setType(k)}
                  style={{flex:1,padding:"12px 8px",borderRadius:14,border:`2px solid ${type===k?tabAc:t.border}`,
                    background:type===k?tabAcLight:"transparent",color:type===k?tabAc:t.muted,
                    fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:6,transition:"all .15s"}}>
                  <span style={{fontSize:16}}>{ico}</span>{l}
                </button>
              );
            })}
          </div>
          {/* Form */}
          <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:14}}>
            {/* Alert Name */}
            <div>
              <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>Alert Name</div>
              <input style={IS} placeholder={type==="price"?"e.g. Cheap charging window":"e.g. Morning charge window"}
                value={type==="price"?pName:tName}
                onChange={e=>type==="price"?setPName(e.target.value):setTName(e.target.value)}/>
            </div>
            {type==="price"?(
              <>
                {/* Condition */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>Condition</div>
                  <div style={{display:"flex",gap:10}}>
                    {[["below","📉","Price Below"],["above","📈","Price Above"]].map(([k,ico,l])=>(
                      <button key={k} onClick={()=>setCond(k)}
                        style={{flex:1,padding:"12px 8px",borderRadius:12,border:`2px solid ${cond===k?ac:t.border}`,
                          background:cond===k?acLight:"transparent",color:cond===k?ac:t.muted,
                          fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif",
                          display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                        <span>{ico}</span>{l}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Price + Notify row */}
                <div style={{display:"flex",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>Price (€/kWh)</div>
                    <input style={IS} type="number" step="0.01" min="0.01" max="2" value={pPrice} onChange={e=>setPPrice(e.target.value)}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>Notify Via</div>
                    <select style={SEL} value={pNotify} onChange={e=>setPNotify(e.target.value)}>
                      <option value="push">📲 Push</option>
                      <option value="email">📧 Email</option>
                      <option value="both">🔔 Both</option>
                    </select>
                  </div>
                </div>
                {/* Repeat days */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>Repeat Days</div>
                  <DayBtns list={pDays} setList={setPDays}/>
                </div>
              </>
            ):(
              <>
                {/* Start / End */}
                <div style={{display:"flex",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>Start Time</div>
                    <input style={IS} type="time" value={tStart} onChange={e=>setTStart(e.target.value)}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>End Time</div>
                    <input style={IS} type="time" value={tEnd} onChange={e=>setTEnd(e.target.value)}/>
                  </div>
                </div>
                {/* Notify */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:7}}>Notify Via</div>
                  <select style={SEL} value={tNotify} onChange={e=>setTNotify(e.target.value)}>
                    <option value="push">📲 Push</option>
                    <option value="email">📧 Email</option>
                    <option value="both">🔔 Both</option>
                  </select>
                </div>
                {/* Repeat days */}
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>Repeat Days</div>
                  <DayBtns list={tDays} setList={setTDays}/>
                </div>
              </>
            )}
            {/* Submit */}
            <button onClick={create}
              style={{width:"100%",padding:16,background:`linear-gradient(135deg,${ac},${acDark})`,color:"#fff",
                border:"none",borderRadius:14,fontSize:15,fontWeight:800,fontFamily:"Nunito,sans-serif",
                cursor:"pointer",margin:"4px 0 24px",boxShadow:`0 6px 20px ${ac}55`,
                display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              + Create Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DOWNLOAD HELPER ──────────────────────────────────────────
function triggerDownload(filename,mime,data){
  const blob=new Blob([data],{type:mime});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
function downloadCSV(){
  let csv="Date,Hour,Wholesale(€/MWh),Retail(€/kWh),Consumed(kWh),Cost(€)\n";
  [1,6,7,8,9,10,11,12].forEach(d=>{
    SEM[d].forEach((r,h)=>{
      const kwh=+(dayKwh(2026,2,d)/24*(0.6+Math.random()*0.8)).toFixed(3);
      const mwh=+((r*1000-95.7)/1.09).toFixed(1);
      csv+=`2026-03-${String(d).padStart(2,"0")},${String(h).padStart(2,"0")}:00,${mwh},${r.toFixed(4)},${kwh},${(r*kwh).toFixed(4)}\n`;
    });
  });
  triggerDownload("WattWatch_March2026.csv","text/csv",csv);
}
function downloadJSON(){
  const out={source:"SEMOpx IE day-ahead",period:"March 2026",account:"jey@wattwatch.ie",days:{}};
  [1,6,7,8,9,10,11,12].forEach(d=>{
    const key=`2026-03-${String(d).padStart(2,"0")}`;
    const avg=+(SEM[d].reduce((a,b)=>a+b,0)/24).toFixed(3);
    out.days[key]={avg_retail:avg,peak_retail:+(Math.max(...SEM[d])).toFixed(3),low_retail:+(Math.min(...SEM[d])).toFixed(3),consumed_kwh:dayKwh(2026,2,d),hourly:SEM[d].map((r,h)=>({hour:`${String(h).padStart(2,"0")}:00`,retail_kwh:r}))};
  });
  triggerDownload("WattWatch_March2026.json","application/json",JSON.stringify(out,null,2));
}
// ─── PURE-JS PDF BUILDER (no CDN) ─────────────────────────────
// Builds a minimal but valid PDF/1.4 binary entirely in JavaScript.
function buildPDF(pages){
  // pages = array of {lines: [{x,y,text,size,bold,r,g,b}], rects:[{x,y,w,h,r,g,b}]}
  // All coords in pts. A4 = 595 x 842 pts.
  const enc=s=>s.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  let body='', offsets=[], objs=[];
  const W=595,H=842;

  function addObj(content){ offsets.push(body.length); const n=objs.length+1; objs.push(n); body+=`${n} 0 obj\n${content}\nendobj\n`; return n; }

  // Catalog + Pages placeholder
  const catN=1, pagesN=2;
  body+=`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  offsets.push(0); objs.push(1); // already added inline, adjust below

  // We'll build page streams and collect page obj numbers
  const pageNums=[];
  for(const pg of pages){
    let stream='';
    // Filled rectangles
    for(const rc of (pg.rects||[])){
      const {x,y,w,h,r=0,g=0,b=0}=rc;
      const pr=+(r/255).toFixed(3),pg2=+(g/255).toFixed(3),pb=+(b/255).toFixed(3);
      stream+=`${pr} ${pg2} ${pb} rg\n${x} ${H-y-h} ${w} ${h} re f\n`;
    }
    // Text
    let lastSize=0,lastBold=false;
    for(const ln of (pg.lines||[])){
      const {x,y,text,size=10,bold=false,r=0,g=0,b=0}=ln;
      const fr=+(r/255).toFixed(3),fg2=+(g/255).toFixed(3),fb=+(b/255).toFixed(3);
      const font=bold?'/F2':'/F1';
      stream+=`BT\n${fr} ${fg2} ${fb} rg\n${font} ${size} Tf\n${x} ${H-y} Td\n(${enc(String(text))}) Tj\nET\n`;
    }
    const streamBytes=new TextEncoder().encode(stream);
    const streamLen=streamBytes.length;
    // Content stream obj
    const contentN=objs.length+2; // +2 because we pre-placed obj 1
    offsets.push(body.length);
    body+=`${contentN} 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`;
    objs.push(contentN);
    // Page obj
    const pageN=contentN+1;
    offsets.push(body.length);
    body+=`${pageN} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${contentN} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>\nendobj\n`;
    objs.push(pageN);
    pageNums.push(pageN);
  }

  // Pages dict
  const pagesContent=`<< /Type /Pages /Kids [${pageNums.map(n=>`${n} 0 R`).join(' ')}] /Count ${pageNums.length} >>`;
  offsets.push(body.length);
  body+=`2 0 obj\n${pagesContent}\nendobj\n`;
  objs.push(2);

  // XRef + trailer
  const xrefOffset=body.length;
  const allObjs=[...Array(objs.length+1).keys()].slice(1);
  // Rebuild xref properly — we need ordered offsets by obj number
  // Simple: just use the offsets array in order (objs were added sequentially except 1 & 2)
  // Re-do as single pass
  const pdfLines=[`%PDF-1.4\n`];
  const xrefMap={};
  let cursor=pdfLines[0].length;

  // Obj 1: Catalog
  const o1=`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  xrefMap[1]=cursor; cursor+=o1.length; pdfLines.push(o1);

  // Obj 2: Pages (placeholder, we'll know page nums after building)
  // Build page content first, tracking obj numbers starting at 3
  let nextObj=3;
  const pageObjNums=[];
  const pageObjStrs=[];
  for(const pg of pages){
    let stream='';
    for(const rc of (pg.rects||[])){
      const {x,y,w,h,r=0,g=0,b=0}=rc;
      stream+=`${+(r/255).toFixed(3)} ${+(g/255).toFixed(3)} ${+(b/255).toFixed(3)} rg\n${x} ${H-y-h} ${w} ${h} re f\n`;
    }
    for(const ln of (pg.lines||[])){
      const {x,y,text,size=10,bold=false,r=0,g=0,b=0}=ln;
      const font=bold?'/F2':'/F1';
      stream+=`BT\n${+(r/255).toFixed(3)} ${+(g/255).toFixed(3)} ${+(b/255).toFixed(3)} rg\n${font} ${size} Tf\n${x} ${H-y} Td\n(${enc(String(text))}) Tj\nET\n`;
    }
    const cN=nextObj++; const pN=nextObj++;
    pageObjNums.push(pN);
    pageObjStrs.push({cN,pN,stream});
  }

  // Obj 2: Pages dict
  const o2=`2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map(n=>`${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>\nendobj\n`;
  xrefMap[2]=cursor; cursor+=o2.length; pdfLines.push(o2);

  // Page content + page objs
  for(const {cN,pN,stream} of pageObjStrs){
    const cStr=`${cN} 0 obj\n<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}endstream\nendobj\n`;
    xrefMap[cN]=cursor; cursor+=cStr.length; pdfLines.push(cStr);
    const pStr=`${pN} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${cN} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> >>\nendobj\n`;
    xrefMap[pN]=cursor; cursor+=pStr.length; pdfLines.push(pStr);
  }

  const xrefOff=cursor;
  const totalObjs=nextObj-1;
  let xref=`xref\n0 ${totalObjs+1}\n0000000000 65535 f \n`;
  for(let i=1;i<=totalObjs;i++) xref+=`${String(xrefMap[i]||0).padStart(10,'0')} 00000 n \n`;
  xref+=`trailer\n<< /Size ${totalObjs+1} /Root 1 0 R >>\nstartxref\n${xrefOff}\n%%EOF`;
  pdfLines.push(xref);

  return pdfLines.join('');
}

function savePDF(pdfStr,filename){
  const bytes=new Uint8Array(pdfStr.length);
  for(let i=0;i<pdfStr.length;i++) bytes[i]=pdfStr.charCodeAt(i)&0xff;
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Helper: measure approximate text width in pts (Helvetica ~0.5 * size per char)
const tw=(text,size)=>text.length*size*0.52;

function downloadReport(){
  const W=595,TEAL=[62,207,178],WHITE=[255,255,255],DARK=[26,26,46],MUTED=[107,114,128],LIGHT_BG=[245,246,250],ALT=[235,250,247];
  const rects=[],lines=[];
  // Header bar
  rects.push({x:0,y:0,w:W,h:56,r:62,g:207,b:178});
  lines.push({x:28,y:30,text:'WattWatch Energy Report',size:18,bold:true,...{r:255,g:255,b:255}});
  lines.push({x:28,y:46,text:'SEMOpx IE Day-Ahead  |  March 2026 (to 25 Mar)',size:9,r:255,g:255,b:255});
  lines.push({x:420,y:46,text:'Generated: '+new Date().toDateString(),size:9,r:255,g:255,b:255});
  // Account
  lines.push({x:28,y:78,text:'Account: Jey',size:11,bold:true,r:26,g:26,b:46});
  lines.push({x:28,y:92,text:'jey@wattwatch.ie  |  Account No: WW-2026-00847',size:9,...{r:107,g:114,b:128}});
  // Table header
  let y=112;
  rects.push({x:28,y,w:539,h:20,r:62,g:207,b:178});
  const cx=[28,140,230,320,410,480];const ch=['Date','Avg €/kWh','Peak €/kWh','Low €/kWh','kWh','Cost €'];
  ch.forEach((h,ci)=>lines.push({x:cx[ci]+4,y:y+13,text:h,size:8,bold:true,r:255,g:255,b:255}));
  y+=20;
  let totKwh=0,totCost=0;
  [1,6,7,8,9,10,11,12,19,20,21,22,23,24,25].forEach((d,ri)=>{
    const k=dayKwh(2026,2,d),a=+(SEM[d].reduce((x,yv)=>x+yv,0)/24).toFixed(3);
    const p=+(Math.max(...SEM[d])).toFixed(3),l=+(Math.min(...SEM[d])).toFixed(3);
    const c=(a*k).toFixed(2);totKwh+=k;totCost+=parseFloat(c);
    if(ri%2===0) rects.push({x:28,y,w:539,h:18,...{r:245,g:250,b:248}});
    const row=[`2026-03-${String(d).padStart(2,'0')}`,`€${a}`,`€${p}`,`€${l}`,`${k}`,`€${c}`];
    row.forEach((v,ci)=>lines.push({x:cx[ci]+4,y:y+12,text:v,size:8,r:26,g:26,b:46}));
    y+=18;
  });
  // Totals
  rects.push({x:28,y,w:539,h:20,r:62,g:207,b:178});
  lines.push({x:32,y:y+13,text:'TOTAL',size:9,bold:true,r:255,g:255,b:255});
  lines.push({x:cx[4]+4,y:y+13,text:`${totKwh.toFixed(1)} kWh`,size:9,bold:true,r:255,g:255,b:255});
  lines.push({x:cx[5]+4,y:y+13,text:`€${totCost.toFixed(2)}`,size:9,bold:true,r:255,g:255,b:255});
  // Footer
  lines.push({x:140,y:820,text:'WattWatch Ltd  |  Dublin, Ireland  |  support@wattwatch.ie',size:8,r:107,g:114,b:128});
  savePDF(buildPDF([{rects,lines}]),'WattWatch_Report_March2026.pdf');
}

function downloadInvoice(ref,month,amt){
  const W=595,rects=[],lines=[];
  // Header
  rects.push({x:0,y:0,w:W,h:70,r:62,g:207,b:178});
  lines.push({x:28,y:35,text:'INVOICE',size:24,bold:true,r:255,g:255,b:255});
  lines.push({x:28,y:52,text:'WattWatch Ltd  |  Dublin, Ireland',size:9,r:255,g:255,b:255});
  lines.push({x:400,y:32,text:ref,size:10,bold:true,r:255,g:255,b:255});
  lines.push({x:400,y:46,text:new Date().toDateString(),size:8,r:255,g:255,b:255});
  // Bill To + Service boxes
  rects.push({x:28,y:90,w:250,h:68,r:245,g:246,b:250});
  rects.push({x:310,y:90,w:257,h:68,r:245,g:246,b:250});
  lines.push({x:36,y:106,text:'BILL TO',size:7,bold:true,r:107,g:114,b:128});
  lines.push({x:36,y:118,text:'Jey',size:10,bold:true,r:26,g:26,b:46});
  lines.push({x:36,y:130,text:'jey@wattwatch.ie',size:8,r:107,g:114,b:128});
  lines.push({x:36,y:142,text:'Account: WW-2026-00847',size:8,r:107,g:114,b:128});
  lines.push({x:318,y:106,text:'SERVICE PERIOD',size:7,bold:true,r:107,g:114,b:128});
  lines.push({x:318,y:118,text:month,size:10,bold:true,r:26,g:26,b:46});
  lines.push({x:318,y:130,text:'Electricity Monitoring — Premium',size:8,r:107,g:114,b:128});
  // Line items header
  let y=178;
  rects.push({x:28,y,w:539,h:20,r:62,g:207,b:178});
  lines.push({x:36,y:y+13,text:'Description',size:8,bold:true,r:255,g:255,b:255});
  lines.push({x:480,y:y+13,text:'Amount',size:8,bold:true,r:255,g:255,b:255});
  y+=20;
  const rows=[['Electricity Monitoring — Premium','€9.99'],['Energy Price Alerts (Unlimited)','€0.00'],['Data Export & Analytics','€0.00'],['VAT (23%)','€2.30']];
  rows.forEach((row,ri)=>{
    if(ri%2===0) rects.push({x:28,y,w:539,h:18,r:245,g:250,b:248});
    lines.push({x:36,y:y+12,text:row[0],size:8,r:26,g:26,b:46});
    lines.push({x:480,y:y+12,text:row[1],size:8,r:26,g:26,b:46});
    y+=18;
  });
  // Total
  rects.push({x:28,y,w:539,h:22,r:62,g:207,b:178});
  lines.push({x:36,y:y+14,text:'AMOUNT DUE',size:10,bold:true,r:255,g:255,b:255});
  lines.push({x:460,y:y+14,text:amt,size:11,bold:true,r:255,g:255,b:255});
  y+=36;
  // Payment details
  rects.push({x:28,y,w:539,h:60,r:245,g:246,b:250});
  lines.push({x:36,y:y+14,text:'PAYMENT DETAILS',size:7,bold:true,r:107,g:114,b:128});
  lines.push({x:36,y:y+26,text:'Bank: AIB Ireland',size:9,r:26,g:26,b:46});
  lines.push({x:36,y:y+38,text:'IBAN: IE29AIBK93115212345678',size:9,r:26,g:26,b:46});
  lines.push({x:36,y:y+50,text:`Payment Reference: ${ref}`,size:9,r:26,g:26,b:46});
  // Footer
  lines.push({x:140,y:820,text:'WattWatch Ltd  |  Dublin, Ireland  |  support@wattwatch.ie',size:8,r:107,g:114,b:128});
  savePDF(buildPDF([{rects,lines}]),`${ref}.pdf`);
}

// ─── PROFILE ───────────────────────────────────────────────────
const ProfileScreen=({nav,toast,t,openCal,alerts,setAlertSheet})=>(
  <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    <TopBar t={t} title="My Profile" onGear={()=>nav("settings")}/>
    <div style={{flex:1,overflowY:"auto",paddingBottom:94}}>
      {/* Profile Hero Card */}
      <div style={{padding:"20px 20px 0"}}>
        <div style={{background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,borderRadius:20,padding:20,display:"flex",alignItems:"center",gap:16,boxShadow:`0 8px 24px ${t.teal}55`}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:t.teal}}>AR</div>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"white"}}>Jey</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.8)",marginTop:2}}>jey@wattwatch.ie</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginTop:4}}>⚡ Premium Member</div>
          </div>
          <div style={{marginLeft:"auto"}}>
            <button onClick={()=>nav("user-details")} style={{background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,padding:"6px 12px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Edit</button>
          </div>
        </div>
      </div>
      {/* Stats strip */}
      <div style={{display:"flex",gap:10,padding:"14px 20px 0"}}>
        {[["€148.20","This Month"],["628 kWh","Consumed"],["€0.236","Avg/kWh"]].map(([val,lbl])=>(
          <div key={lbl} style={{flex:1,background:t.card,borderRadius:14,padding:"12px 10px",textAlign:"center",boxShadow:t.shadow}}>
            <div style={{fontSize:14,fontWeight:800,color:t.text}}>{val}</div>
            <div style={{fontSize:10,color:t.muted,marginTop:2,fontWeight:600}}>{lbl}</div>
          </div>
        ))}
      </div>
      {/* Menu items */}
      <div style={{padding:"16px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
        <MenuItem t={t} onClick={()=>nav("user-details")}
          icon={{bg:t.tealLight,el:<UserIco c={t.teal}/>}} label="My Details" sub="Name, email, address, meter"/>
        <MenuItem t={t} onClick={()=>nav("billing")}
          icon={{bg:"#fff7ed",el:<CardIco c={t.orange}/>}} label="Billing" sub="Payments · Invoices"/>
        <MenuItem t={t} onClick={()=>nav("tickets")}
          icon={{bg:"#f0fdf4",el:<svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#16a34a" strokeWidth={2}><path d="M15 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><polyline points="15 3 15 9 21 9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>}} label="My Tickets" sub="Support queries & CRM replies"/>
        <MenuItem t={t} onClick={()=>nav("subscription")}
          icon={{bg:"#fdf4ff",el:<svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#a855f7" strokeWidth={2}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>}} label="Subscription" sub="Premium · €14.99/month" badge="Premium"/>
        <MenuItem t={t} onClick={()=>{const m=document.getElementById('dl-menu-overlay');if(m)m.style.display='flex';}} accent
          icon={{bg:t.tealLight,el:<DlIco c={t.teal}/>}} label="Download Data" sub="PDF · Excel · Raw JSON"/>
        <MenuItem t={t} onClick={()=>toast("🔔 Opening notifications…")}
          icon={{bg:t.tealLight,el:<BellIco c={t.teal}/>}} label="Notifications" badge="3"/>
      </div>
      {/* Bottom actions */}
      <div style={{padding:"12px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
        <div onClick={()=>nav("splash")} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:14,borderRadius:16,background:"#fef2f2",color:t.red,fontWeight:700,cursor:"pointer",fontSize:14}}>
          <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke={t.red} strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </div>
      </div>
      <div style={{height:20}}/>
    </div>
  </div>
);

// ─── SUBSCRIPTION SCREEN ───────────────────────────────────────
const SubscriptionScreen=({nav,toast,t})=>{
  const [selected,setSelected]=useState("premium");
  const [confirmPlan,setConfirmPlan]=useState(null);

  const plans=[
    {
      id:"standard",
      name:"Standard",
      price:"€9.99",
      period:"/month",
      badge:null,
      color:"#6366f1",
      colorLight:"#eef2ff",
      icon:"⚡",
      features:[
        "Live electricity price tracking",
        "Daily & weekly price charts",
        "Up to 10 price alerts",
        "Basic device monitoring (4 devices)",
        "Monthly bill summary",
        "CRM support",
      ],
      missing:[
        "Unlimited alerts",
        "EV charging optimiser",
        "PDF/Excel data export",
        "Priority CRM support",
      ],
    },
    {
      id:"premium",
      name:"Premium",
      price:"€14.99",
      period:"/month",
      badge:"Your Plan",
      color:"#3ecfb2",
      colorLight:"#e8faf7",
      icon:"👑",
      features:[
        "Everything in Standard",
        "Unlimited price & time alerts",
        "Full analytics (daily/weekly/monthly/yearly)",
        "All devices monitored (unlimited)",
        "EV charging optimiser",
        "PDF & Excel data export",
        "AI energy assistant (WattWatch AI)",
        "Priority CRM support (1–2 hr response)",
      ],
      missing:[],
    },
  ];

  const handleSwitch=(planId)=>{
    if(planId==="premium") { toast("✅ You're already on Premium!"); return; }
    setConfirmPlan(planId);
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="Subscription" onBack={()=>nav("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 40px"}}>

        {/* Hero Banner */}
        <div style={{background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,borderRadius:20,padding:"18px 20px",marginBottom:20,boxShadow:`0 8px 24px ${t.teal}55`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
            <div style={{fontSize:28}}>👑</div>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>You're on Premium</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.8)",marginTop:2}}>Next billing: 25 Apr 2026 · €14.99</div>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,.15)",borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,.9)",fontWeight:600}}>Account: WW-2026-00847</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>Active ✓</span>
          </div>
        </div>

        {/* Plan Cards */}
        <div style={{fontSize:13,fontWeight:700,color:t.muted,marginBottom:12,textTransform:"uppercase",letterSpacing:".5px"}}>Choose a Plan</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {plans.map(plan=>{
            const isCurrent=plan.id==="premium";
            const isSelected=selected===plan.id;
            return(
              <div key={plan.id}
                onClick={()=>setSelected(plan.id)}
                style={{
                  background:t.card,
                  borderRadius:20,
                  border:`2.5px solid ${isSelected?plan.color:t.border}`,
                  overflow:"hidden",
                  cursor:"pointer",
                  boxShadow:isSelected?`0 6px 24px ${plan.color}33`:t.shadow,
                  transition:"all .2s",
                }}>
                {/* Card Header */}
                <div style={{background:isSelected?`linear-gradient(135deg,${plan.color}18,${plan.color}08)`:t.bg,padding:"16px 18px 14px",borderBottom:`1px solid ${t.border}`}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:38,height:38,borderRadius:12,background:isSelected?plan.colorLight:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:`1.5px solid ${isSelected?plan.color:t.border}`}}>
                        {plan.icon}
                      </div>
                      <div>
                        <div style={{fontSize:16,fontWeight:800,color:t.text}}>{plan.name}</div>
                        {plan.badge&&(
                          <div style={{display:"inline-block",background:plan.color,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,marginTop:2}}>
                            {plan.badge}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:24,fontWeight:800,color:isSelected?plan.color:t.text,lineHeight:1}}>{plan.price}</div>
                      <div style={{fontSize:11,color:t.muted,marginTop:2}}>{plan.period}</div>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div style={{padding:"14px 18px"}}>
                  {plan.features.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:plan.colorLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                        <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke={plan.color} strokeWidth={3} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span style={{fontSize:12,color:t.text,fontWeight:500,lineHeight:1.5}}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8,opacity:.45}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,border:`1px solid ${t.border}`}}>
                        <svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke={t.muted} strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </div>
                      <span style={{fontSize:12,color:t.muted,lineHeight:1.5}}>{f}</span>
                    </div>
                  ))}

                  {/* CTA Button */}
                  <button
                    onClick={e=>{e.stopPropagation();handleSwitch(plan.id);}}
                    style={{
                      width:"100%",marginTop:8,padding:"12px 0",
                      background:isCurrent?`linear-gradient(135deg,${plan.color},${t.tealDark})`:`${t.border}`,
                      color:isCurrent?"#fff":t.muted,
                      border:"none",borderRadius:12,fontSize:13,fontWeight:800,
                      fontFamily:"Nunito,sans-serif",cursor:isCurrent?"default":"pointer",
                      boxShadow:isCurrent?`0 4px 16px ${plan.color}44`:"none",
                      transition:"all .2s",
                    }}>
                    {isCurrent?"✓ Current Plan":"Switch to Standard"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{marginTop:20,padding:"14px 16px",background:t.card,borderRadius:14,border:`1px solid ${t.border}`}}>
          <div style={{fontSize:12,color:t.muted,lineHeight:1.7,textAlign:"center"}}>
            🔒 Billing is managed securely via <span style={{fontWeight:700,color:t.text}}>Stripe</span>.<br/>
            Cancel or change plan anytime. No hidden fees.<br/>
            <span style={{color:t.teal,fontWeight:700}}>support@wattwatch.ie</span> for billing queries.
          </div>
        </div>
      </div>

      {/* Downgrade Confirm Modal */}
      {confirmPlan&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"flex-end",zIndex:300}}>
          <div style={{width:"100%",background:t.card,borderRadius:"24px 24px 0 0",padding:"24px 24px 36px",animation:"slideUp .22s ease"}}>
            <div style={{fontSize:18,fontWeight:800,color:t.text,marginBottom:8}}>Switch to Standard?</div>
            <div style={{fontSize:13,color:t.muted,lineHeight:1.6,marginBottom:20}}>
              You'll lose access to Unlimited Alerts, AI Assistant, EV Optimiser, and Priority Support at the end of your current billing period (25 Apr 2026).
            </div>
            <button onClick={()=>{setConfirmPlan(null);toast("ℹ️ Stayed on Premium — no changes made");}}
              style={{width:"100%",padding:14,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:14,fontSize:14,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",marginBottom:10}}>
              Keep Premium
            </button>
            <button onClick={()=>{setConfirmPlan(null);toast("✅ Plan switched to Standard from next billing date");}}
              style={{width:"100%",padding:13,background:"transparent",color:t.muted,border:`2px solid ${t.border}`,borderRadius:14,fontSize:14,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>
              Confirm Switch to Standard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TICKETS SCREEN ────────────────────────────────────────────
// ─── FIREBASE CONFIG ───────────────────────────────────────────
// Replace with your actual Firebase project config from console.firebase.google.com
// Project Settings → Your apps → SDK setup → Config
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCP9ExQfxdjxg4hmV8FVTgFNPjjSFAPJ28",
  authDomain:        "watt-watch-160c8.firebaseapp.com",
  projectId:         "att-watch-160c8",
  storageBucket:     "watt-watch-160c8.firebasestorage.app",
  messagingSenderId: "230459512289",
  appId:             "1:230459512289:web:f15936a86b570cb41e6ea0",
};

// ── Firestore REST helpers (no SDK needed — works in any browser) ──
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;

// Convert Firestore document fields → plain JS object
function fsDocToObj(doc) {
  if (!doc || !doc.fields) return null;
  const obj = { _fsId: doc.name?.split("/").pop() };
  for (const [k, v] of Object.entries(doc.fields)) {
    if (v.stringValue  !== undefined) obj[k] = v.stringValue;
    else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue);
    else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
    else if (v.arrayValue  !== undefined) {
      obj[k] = (v.arrayValue.values || []).map(item => {
        if (item.mapValue) return fsDocToObj({ fields: item.mapValue.fields });
        if (item.stringValue !== undefined) return item.stringValue;
        return null;
      });
    } else if (v.mapValue !== undefined) {
      obj[k] = fsDocToObj({ fields: v.mapValue.fields });
    }
  }
  return obj;
}

// Convert plain JS value → Firestore field value
function toFsValue(val) {
  if (typeof val === "string")  return { stringValue: val };
  if (typeof val === "number")  return { integerValue: String(val) };
  if (typeof val === "boolean") return { booleanValue: val };
  if (Array.isArray(val))       return { arrayValue: { values: val.map(toFsValue) } };
  if (val && typeof val === "object") {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFsValue(v);
    return { mapValue: { fields } };
  }
  return { nullValue: null };
}

// Convert plain JS object → Firestore fields map
function objToFsFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "_fsId") continue;
    fields[k] = toFsValue(v);
  }
  return fields;
}

// GET all tickets for this user
async function fetchTickets(userEmail) {
  try {
    const url = `${FS_BASE}/tickets?pageSize=50`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents
      .map(fsDocToObj)
      .filter(t => t.userEmail === userEmail)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch (e) {
    console.error("fetchTickets:", e);
    return [];
  }
}

// CREATE a new ticket document in Firestore
async function createFirestoreTicket(ticket) {
  try {
    const url = `${FS_BASE}/tickets`;
    const body = { fields: objToFsFields(ticket) };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const doc = await res.json();
    return fsDocToObj(doc);
  } catch (e) {
    console.error("createFirestoreTicket:", e);
    return null;
  }
}

// UPDATE ticket (add reply message) via PATCH
async function updateTicketMessages(fsId, messages) {
  try {
    const url = `${FS_BASE}/tickets/${fsId}?updateMask.fieldPaths=messages`;
    const body = { fields: { messages: toFsValue(messages) } };
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("updateTicketMessages:", e);
  }
}

// UPDATE ticket status
async function updateTicketStatus(fsId, status) {
  try {
    const url = `${FS_BASE}/tickets/${fsId}?updateMask.fieldPaths=status`;
    const body = { fields: { status: toFsValue(status) } };
    await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error("updateTicketStatus:", e);
  }
}

// ─── TICKETS SCREEN ────────────────────────────────────────────
const TICKET_CATS = ["Billing Query","High Bill","Meter Issue","Switching Help","Account Access","Technical Issue","Other"];

const TicketsScreen = ({ nav, toast, t }) => {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState("list"); // list | detail | create
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCat, setNewCat]         = useState(TICKET_CATS[0]);
  const [newMsg, setNewMsg]         = useState("");
  const [tab, setTab]               = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const msgEndRef = useRef(null);

  // ── Load tickets from Firestore on mount ──
  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket]);

  const loadTickets = async () => {
    setLoading(true);
    const data = await fetchTickets("jey@wattwatch.ie");
    // If Firestore returns nothing yet (first run), show nothing — no mocks
    setTickets(data);
    setLoading(false);
  };

  const statusColor = s => s === "Open" ? "#f97316" : s === "Resolved" ? "#16a34a" : "#6b7280";
  const statusBg    = s => s === "Open" ? "#fff7ed" : s === "Resolved" ? "#dcfce7"  : "#f3f4f6";

  // ── Send a reply ──
  const sendReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    const now = new Date();
    const timeStr = `${now.getDate()} Mar, ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const newMessages = [...(activeTicket.messages || []), { from: "user", text: replyText.trim(), time: timeStr }];

    // Optimistic UI update
    const updated = { ...activeTicket, messages: newMessages };
    setActiveTicket(updated);
    setTickets(prev => prev.map(x => x._fsId === activeTicket._fsId ? updated : x));
    setReplyText("");

    // Persist to Firestore
    if (activeTicket._fsId) {
      await updateTicketMessages(activeTicket._fsId, newMessages);
    }
    toast("✉️ Reply sent — CRM team will respond shortly");
  };

  // ── Create new ticket ──
  const createTicket = async () => {
    if (!newSubject.trim() || !newMsg.trim()) { toast("⚠️ Fill in all fields"); return; }
    setSubmitting(true);
    const now = new Date();
    const timeStr = `${now.getDate()} Mar, ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const ticketId = `TKT-${Date.now()}`;

    const payload = {
      id:          ticketId,
      cat:         newCat,
      subject:     newSubject.trim(),
      status:      "Open",
      created:     `${now.getDate()} Mar 2026`,
      createdAt:   now.toISOString(),
      userEmail:   "jey@wattwatch.ie",
      userName:    "Jey",
      accountNo:   "WW-2026-00847",
      messages:    [{ from: "user", text: newMsg.trim(), time: timeStr }],
    };

    const saved = await createFirestoreTicket(payload);
    const newTicket = saved || { ...payload, _fsId: ticketId };
    setTickets(prev => [newTicket, ...prev]);
    setSubmitting(false);
    toast("✅ Ticket raised — CRM team will see it immediately");
    setNewSubject(""); setNewMsg(""); setNewCat(TICKET_CATS[0]);
    setView("list");
  };

  const IS = { width:"100%",padding:"12px 14px",border:`2px solid ${t.border}`,borderRadius:10,fontSize:14,fontFamily:"Nunito,sans-serif",color:t.text,background:t.inputBg,outline:"none" };

  // ── LIST VIEW ──
  if (view === "list") {
    const shown = tickets.filter(tk => tab === "all" || tk.status?.toLowerCase() === tab);
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <TopBar t={t} title="My Tickets" onBack={()=>nav("profile")}/>
        <div style={{display:"flex",borderBottom:`2px solid ${t.border}`,padding:"0 20px",flexShrink:0}}>
          {[["all","All"],["open","Open"],["resolved","Resolved"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)}
              style={{flex:1,padding:"12px 0",fontSize:13,fontWeight:700,fontFamily:"Nunito,sans-serif",border:"none",background:"none",
                color:tab===k?t.teal:t.muted,borderBottom:`2.5px solid ${tab===k?t.teal:"transparent"}`,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px 20px",paddingBottom:94}}>
          {loading ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 20px",gap:12}}>
              <div style={{width:32,height:32,borderRadius:"50%",border:`3px solid ${t.tealLight}`,borderTopColor:t.teal,animation:"spin .8s linear infinite"}}/>
              <div style={{fontSize:13,color:t.muted}}>Loading tickets from CRM…</div>
            </div>
          ) : shown.length === 0 ? (
            <div style={{textAlign:"center",padding:"48px 20px",color:t.muted}}>
              <div style={{fontSize:40,marginBottom:12}}>🎫</div>
              <div style={{fontSize:16,fontWeight:700,color:t.text}}>No tickets yet</div>
              <div style={{fontSize:13,marginTop:6}}>Tap below to raise your first support query</div>
            </div>
          ) : shown.map(tk => (
            <div key={tk._fsId || tk.id} onClick={()=>{setActiveTicket(tk);setView("detail");}}
              style={{background:t.card,borderRadius:16,padding:"14px 16px",marginBottom:12,boxShadow:t.shadow,
                cursor:"pointer",borderLeft:`4px solid ${statusColor(tk.status)}`,transition:"transform .15s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                <div style={{flex:1,marginRight:8}}>
                  <div style={{fontSize:14,fontWeight:800,color:t.text,lineHeight:1.3}}>{tk.subject}</div>
                  <div style={{fontSize:11,color:t.muted,marginTop:3}}>{tk.id} · {tk.cat} · {tk.created}</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:statusColor(tk.status),background:statusBg(tk.status),padding:"3px 9px",borderRadius:20,flexShrink:0}}>{tk.status}</span>
              </div>
              <div style={{fontSize:12,color:t.muted,display:"flex",alignItems:"center",gap:6}}>
                <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke={t.muted} strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {(tk.messages||[]).length} message{(tk.messages||[]).length !== 1 ? "s" : ""}
                {(tk.messages||[]).at(-1)?.from === "crm" && <span style={{color:t.teal,fontWeight:700,marginLeft:4}}>· CRM replied</span>}
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:"10px 20px 24px",flexShrink:0,background:t.bg,borderTop:`1px solid ${t.border}`}}>
          <button onClick={()=>setView("create")}
            style={{width:"100%",padding:14,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",
              borderRadius:14,fontSize:15,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",
              boxShadow:`0 4px 16px ${t.teal}55`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="white" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Raise New Ticket
          </button>
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ──
  if (view === "detail" && activeTicket) {
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <TopBar t={t} title={activeTicket.id} onBack={()=>setView("list")}/>
        <div style={{padding:"12px 20px",borderBottom:`1px solid ${t.border}`,flexShrink:0,background:t.card}}>
          <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:4}}>{activeTicket.subject}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:11,fontWeight:700,color:statusColor(activeTicket.status),background:statusBg(activeTicket.status),padding:"3px 9px",borderRadius:20}}>{activeTicket.status}</span>
            <span style={{fontSize:11,color:t.muted}}>{activeTicket.cat} · {activeTicket.created}</span>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {(activeTicket.messages||[]).map((m,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:m.from==="user"?"flex-end":"flex-start",gap:3}}>
              <div style={{fontSize:10,color:t.muted,fontWeight:600,paddingLeft:m.from==="crm"?4:0,paddingRight:m.from==="user"?4:0}}>
                {m.from==="crm"?"🎧 WattWatch CRM":"👤 You"} · {m.time}
              </div>
              <div style={{
                maxWidth:"84%",padding:"10px 13px",fontSize:13,lineHeight:1.55,fontWeight:500,
                borderRadius:m.from==="user"?"16px 16px 3px 16px":"16px 16px 16px 3px",
                background:m.from==="user"?`linear-gradient(135deg,${t.teal},${t.tealDark})`:`${t.teal}12`,
                color:m.from==="user"?"#fff":t.text,
                border:m.from==="crm"?`1px solid ${t.teal}30`:"none",
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={msgEndRef}/>
        </div>
        {activeTicket.status === "Open" ? (
          <div style={{padding:"10px 16px 20px",borderTop:`1px solid ${t.border}`,background:t.card,flexShrink:0}}>
            <textarea value={replyText} onChange={e=>setReplyText(e.target.value)}
              placeholder="Type your reply…"
              style={{...IS,resize:"none",height:72,marginBottom:8,fontSize:13}}/>
            <button onClick={sendReply} disabled={!replyText.trim()}
              style={{width:"100%",padding:12,background:replyText.trim()?`linear-gradient(135deg,${t.teal},${t.tealDark})`:t.border,
                color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:800,
                fontFamily:"Nunito,sans-serif",cursor:replyText.trim()?"pointer":"default",transition:"all .2s"}}>
              Send Reply
            </button>
          </div>
        ) : (
          <div style={{padding:"14px 20px",borderTop:`1px solid ${t.border}`,background:t.bg,textAlign:"center",flexShrink:0}}>
            <span style={{fontSize:13,color:t.muted}}>This ticket is resolved. </span>
            <span onClick={async()=>{
              const updated={...activeTicket,status:"Open"};
              setActiveTicket(updated);
              setTickets(prev=>prev.map(x=>x._fsId===activeTicket._fsId?updated:x));
              if(activeTicket._fsId) await updateTicketStatus(activeTicket._fsId,"Open");
              toast("🔓 Ticket reopened");
            }} style={{fontSize:13,color:t.teal,fontWeight:700,cursor:"pointer"}}>Reopen?</span>
          </div>
        )}
      </div>
    );
  }

  // ── CREATE VIEW ──
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="New Ticket" onBack={()=>setView("list")}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px 20px 40px"}}>
        <div style={{background:`linear-gradient(135deg,${t.teal}18,${t.tealDark}10)`,borderRadius:14,padding:"14px 16px",marginBottom:20,display:"flex",gap:12,alignItems:"center",border:`1px solid ${t.teal}30`}}>
          <div style={{fontSize:24}}>🎧</div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:t.text}}>WattWatch Support</div>
            <div style={{fontSize:11,color:t.muted,marginTop:2}}>Avg. response time: 2–4 hours · Mon–Fri 09:00–17:00</div>
            <div style={{fontSize:10,color:t.teal,marginTop:2,fontWeight:700}}>🔴 Live — tickets go directly to CRM</div>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".4px",marginBottom:6}}>Category</div>
          <select value={newCat} onChange={e=>setNewCat(e.target.value)}
            style={{...IS,appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"}}>
            {TICKET_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".4px",marginBottom:6}}>Subject</div>
          <input value={newSubject} onChange={e=>setNewSubject(e.target.value)}
            placeholder="Brief description of your issue"
            style={{...IS}} onFocus={e=>e.target.style.borderColor=t.teal} onBlur={e=>e.target.style.borderColor=t.border}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".4px",marginBottom:6}}>Message</div>
          <textarea value={newMsg} onChange={e=>setNewMsg(e.target.value)}
            placeholder="Describe your issue in detail. Include your MPRN and any relevant dates or amounts."
            style={{...IS,resize:"none",height:120}}
            onFocus={e=>e.target.style.borderColor=t.teal} onBlur={e=>e.target.style.borderColor=t.border}/>
        </div>
        <button onClick={createTicket} disabled={submitting}
          style={{width:"100%",padding:15,background:submitting?t.border:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",
            borderRadius:14,fontSize:15,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:submitting?"not-allowed":"pointer",
            boxShadow:submitting?"none":`0 6px 20px ${t.teal}55`,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {submitting ? "Submitting…" : "Submit Ticket"}
        </button>
        <div style={{textAlign:"center",marginTop:14,fontSize:12,color:t.muted}}>
          You can also email us at <span style={{color:t.teal,fontWeight:700}}>support@wattwatch.ie</span>
        </div>
      </div>
    </div>
  );
};


// ─── HELP FAQ ACCORDION ────────────────────────────────────────
const FAQ_DATA=[
  {cat:"📋 Your Details & Account",items:[
    ["What is MPRN?","MPRN stands for Meter Point Reference Number. It is a unique number that identifies your electricity connection and is usually found on your electricity bill."],
    ["Is MPRN mandatory?","Yes, MPRN is usually required because it uniquely identifies your electricity connection."],
    ["Why do you need my Eircode?","We use your Eircode to identify your property location accurately during the switching and onboarding process."],
    ["Is Eircode mandatory?","Yes, Eircode is important because it helps identify the correct service location during onboarding."],
    ["Why do you collect my address?","Your address helps verify your property and supports the switching and onboarding process along with your Eircode."],
    ["Why do you ask for my current provider?","Your current provider information helps support the switching process and ensures correct transfer of service details."],
  ]},
  {cat:"⚡ Meter & Readings",items:[
    ["Where do I find my meter number?","Your meter number is usually printed on your electricity meter and may also appear on your electricity bill."],
    ["What is meter reading?","Meter reading is the number currently displayed on your electricity meter. It helps ensure correct billing when switching suppliers."],
    ["What is the difference between meter number and MPRN?","MPRN identifies the electricity connection, while meter number identifies the physical meter installed at the property."],
    ["What if I do not know my meter reading?","You can check your electricity meter directly or refer to your latest electricity bill for recent readings."],
    ["Can I switch without a smart meter?","Yes, switching is still possible even if you do not currently have a smart meter, depending on supplier requirements."],
  ]},
  {cat:"🔄 Switching Provider",items:[
    ["How do I switch electricity provider?","You can switch by filling out the onboarding form with your personal details, Eircode, MPRN, and other electricity connection information."],
    ["What happens after I submit my application?","After submission, your details are reviewed by the onboarding or sales team, and the next switching steps are initiated."],
    ["Do I need my current electricity bill?","It is recommended because it usually contains your MPRN, meter number, and other important switching details."],
    ["Will switching interrupt my electricity supply?","In most cases, switching supplier does not interrupt your electricity supply because only the billing relationship changes."],
    ["How long does switching take?","Switching timelines depend on the supplier and verification process, but it usually takes a few working days to complete."],
    ["What if I enter the wrong details?","Incorrect details may delay the switching process, so it is important to review your form carefully before submitting."],
    ["Do I need to upload documents?","For the prototype, document upload is optional, but in real systems suppliers may request a recent electricity bill or identity verification."],
  ]},
  {cat:"💶 Pricing & Payments",items:[
    ["What is dynamic pricing?","Dynamic pricing means electricity prices can change depending on demand, supply, and market conditions. Customers may save by shifting usage to cheaper periods."],
    ["How can dynamic pricing help me save money?","Dynamic pricing can help reduce electricity costs if you shift flexible usage, such as appliances or EV charging, to lower-price periods."],
    ["Can I choose a payment method?","Yes, users may be able to select payment preferences such as direct debit or other supported payment methods."],
  ]},
  {cat:"📱 App & Support",items:[
    ["Can I track my application?","For the prototype, this feature is not included yet, but in a production system users could track their onboarding status in the app."],
    ["Can the chatbot help me complete the form?","Yes, the chatbot is designed to answer common onboarding questions and guide users through the required fields."],
    ["What is preferred contact time?","Preferred contact time allows you to indicate when the onboarding team can best reach you."],
    ["Is my data saved securely?","In this prototype, form data is captured for demonstration purposes. In a production system, customer data would be securely stored and protected."],
  ]},
];

const HelpFAQ=({t})=>{
  const [openKey,setOpenKey]=useState(null);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {FAQ_DATA.map((section,si)=>(
        <div key={si}>
          <div style={{fontSize:11,fontWeight:700,color:t.teal,textTransform:"uppercase",letterSpacing:".5px",marginBottom:6,paddingLeft:2}}>{section.cat}</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {section.items.map(([q,a],qi)=>{
              const key=`${si}-${qi}`;
              const isOpen=openKey===key;
              return(
                <div key={key} style={{background:t.bg,borderRadius:12,overflow:"hidden",border:`1px solid ${isOpen?t.teal:t.border}`,transition:"border-color .2s"}}>
                  <button onClick={()=>setOpenKey(isOpen?null:key)}
                    style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"none",border:"none",cursor:"pointer",textAlign:"left",gap:10,fontFamily:"Nunito,sans-serif"}}>
                    <span style={{fontSize:13,fontWeight:700,color:t.text,lineHeight:1.4}}>{q}</span>
                    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={t.teal} strokeWidth={2.5} style={{flexShrink:0,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform .2s"}}><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {isOpen&&(
                    <div style={{padding:"0 14px 12px",fontSize:13,color:t.muted,lineHeight:1.6,borderTop:`1px solid ${t.border}`}}>
                      <div style={{paddingTop:10}}>{a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── SETTINGS ──────────────────────────────────────────────────
const SettingsScreen=({nav,toast,t,theme,setTheme})=>{
  const [modal,setModal]=useState(null);
  const [stars,setStars]=useState(4);
  const [priv,setPriv]=useState({analytics:true,insights:true,marketing:false});
  const IS={width:"100%",padding:"12px 14px",border:`2px solid ${t.border}`,borderRadius:10,fontSize:15,fontFamily:"Nunito,sans-serif",color:t.text,background:t.inputBg,outline:"none"};
  const items=[
    {id:"theme",bg:"linear-gradient(135deg,#1e1b4b,#6366f1)",el:<SunIco/>,label:"Theme",sub:theme==="dark"?"Dark (Indigo)":"Light"},
    {id:"password",bg:"#eff6ff",el:<LockIco c="#3b82f6"/>,label:"Change Password",sub:"Update your account password"},
    {id:"help",bg:"#f0fdf4",el:<HelpIco c="#16a34a"/>,label:"Help Center",sub:"FAQs, guides and support"},
    {id:"privacy",bg:"#fff7ed",el:<ShieldIco c={t.orange}/>,label:"Privacy & Data",sub:"Manage your data and privacy"},
    {id:"rate",bg:"#fdf4ff",el:<StarIco/>,label:"Rate WattWatch",sub:"Love the app? Leave us a review ⭐"},
    {id:"delete",bg:"#fef2f2",el:<svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={t.red} strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,label:"Delete Account",sub:"Permanently erase all your data"},
  ];
  const renderModal=()=>{
    if(modal==="theme") return(
      <div style={{padding:"6px 20px 8px"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,marginBottom:4}}>Theme</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:16}}>Choose your preferred look.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["light","☀️ Light","Clean white with teal accents","linear-gradient(135deg,#f5f6fa,#fff)","#e5e7eb"],
            ["dark","🌙 Dark (Indigo)","Deep navy with indigo accents","linear-gradient(135deg,#0d0f1a,#1e1b4b)","#334155"]
          ].map(([k,lbl,desc,bg,bdr])=>(
            <div key={k} onClick={()=>setTheme(k)} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:14,border:`2px solid ${theme===k?t.teal:t.border}`,background:theme===k?t.tealLight:"transparent",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:10,background:bg,border:`2px solid ${bdr}`,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:t.text}}>{lbl}</div>
                <div style={{fontSize:12,color:t.muted,marginTop:2}}>{desc}</div>
              </div>
              {theme===k&&<svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={t.teal} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
          ))}
        </div>
      </div>
    );
    if(modal==="password") return(
      <div style={{padding:"6px 20px 8px"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,marginBottom:4}}>Change Password</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:16}}>Update your WattWatch account password.</div>
        {["Current Password","New Password","Confirm New Password"].map((lbl,i)=>(
          <div key={i} style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".4px",marginBottom:6}}>{lbl}</div>
            <input type="password" placeholder={lbl} style={IS}/>
          </div>
        ))}
        <button onClick={()=>{toast("✅ Password updated!");setModal(null);}} style={{width:"100%",padding:14,background:t.teal,color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",marginTop:4}}>Update Password</button>
      </div>
    );
    if(modal==="help") return(
      <div style={{padding:"6px 20px 8px"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,marginBottom:4}}>Help Center</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:14}}>Find answers to common questions.</div>
        <HelpFAQ t={t}/>
        <div style={{background:t.tealLight,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:10,marginTop:8}}>
          <MailIco c={t.teal}/>
          <div><div style={{fontSize:13,fontWeight:700,color:t.teal}}>Still need help?</div><div style={{fontSize:12,color:t.teal}}>support@wattwatch.ie</div></div>
        </div>
      </div>
    );
    if(modal==="privacy") return(
      <div style={{padding:"6px 20px 8px"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,marginBottom:4}}>Privacy & Data</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:14}}>Manage how WattWatch uses your data.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[["analytics","Analytics & Usage","Help us improve with anonymous usage data"],
            ["insights","Personalised Insights","Tailor recommendations to your patterns"],
            ["marketing","Marketing Emails","Tips, offers and product updates"],
          ].map(([k,lbl,desc])=>(
            <div key={k} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:t.text}}>{lbl}</div>
                <div style={{fontSize:12,color:t.muted,marginTop:2}}>{desc}</div>
              </div>
              <Toggle checked={priv[k]} onChange={()=>setPriv(p=>({...p,[k]:!p[k]}))} t={t}/>
            </div>
          ))}
        </div>
      </div>
    );
    if(modal==="rate") return(
      <div style={{padding:"6px 20px 8px",textAlign:"center"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.text,marginBottom:6}}>Rate WattWatch ⚡</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:18}}>Your review helps us grow and improve!</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:18}}>
          {[1,2,3,4,5].map(i=>(
            <svg key={i} onClick={()=>setStars(i)} viewBox="0 0 24 24" width={42} height={42} fill={i<=stars?"#fbbf24":"#e5e7eb"} style={{cursor:"pointer"}}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          ))}
        </div>
        <textarea placeholder="Tell us what you think… (optional)" style={{width:"100%",padding:"12px 14px",border:`2px solid ${t.border}`,borderRadius:10,fontSize:14,fontFamily:"Nunito,sans-serif",resize:"none",height:80,outline:"none",background:t.inputBg,color:t.text,marginBottom:14}}/>
        <button onClick={()=>{toast("⭐ Thanks for your review!");setModal(null);}} style={{width:"100%",padding:14,background:"linear-gradient(135deg,#f59e0b,#fbbf24)",color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>Submit Review</button>
      </div>
    );
    if(modal==="delete") return(
      <div style={{padding:"6px 20px 8px"}}>
        <div style={{fontSize:18,fontWeight:800,color:t.red,marginBottom:4}}>Delete My Account</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:16}}>Permanently erase all your WattWatch data. This cannot be undone.</div>
        <div style={{background:"#fef2f2",borderRadius:12,padding:16,marginBottom:16}}>
          {["All usage history and billing data","Your alerts and device settings","Your account and personal details"].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<2?8:0}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:t.red,flexShrink:0}}/>
              <span style={{fontSize:13,color:t.text,fontWeight:600}}>{item}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>{toast("⚠️ Deletion request sent");setModal(null);}} style={{width:"100%",padding:14,background:t.red,color:"#fff",border:"none",borderRadius:10,fontSize:15,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>Request Account Deletion</button>
      </div>
    );
    return null;
  };
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="Settings" onBack={()=>nav("profile")}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:40}}>
        <div style={{padding:"20px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
          {items.map(item=>(
            <div key={item.id} onClick={()=>setModal(item.id)}
              style={{background:t.card,borderRadius:16,padding:"18px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:t.shadow,cursor:"pointer",transition:"transform .2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateX(4px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{width:44,height:44,borderRadius:12,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{item.el}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:t.text}}>{item.label}</div>
                <div style={{fontSize:12,color:t.muted,marginTop:2}}>{item.sub}</div>
              </div>
              <ChevR c={t.light}/>
            </div>
          ))}
        </div>
        <div style={{height:20}}/>
      </div>
      <Sheet show={!!modal} onClose={()=>setModal(null)} t={t}>
        {renderModal()}
        <div style={{padding:"8px 20px 20px"}}>
          <button onClick={()=>setModal(null)} style={{width:"100%",padding:14,background:t.bg,border:"none",borderRadius:14,fontSize:15,fontWeight:700,color:t.muted,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>Close</button>
        </div>
      </Sheet>
    </div>
  );
};

// ─── USER DETAILS ──────────────────────────────────────────────
const UserDetailsScreen=({nav,toast,t})=>{
  const LS={fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".4px"};
  const IS={width:"100%",padding:"12px 14px",border:`2px solid ${t.border}`,borderRadius:10,fontSize:15,fontFamily:"Nunito,sans-serif",color:t.text,background:t.inputBg,outline:"none"};
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="My Details" onBack={()=>nav("profile")}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 20px 40px"}}>
        {/* Account Number banner */}
        <div style={{background:t.tealLight,borderRadius:14,padding:"14px 16px",marginBottom:20,display:"flex",alignItems:"center",gap:12,border:`1.5px solid ${t.teal}22`}}>
          <div style={{width:38,height:38,borderRadius:10,background:t.teal,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#fff" strokeWidth={2}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:t.teal,textTransform:"uppercase",letterSpacing:".4px"}}>Account Number</div>
            <div style={{fontSize:16,fontWeight:800,color:t.text,marginTop:2}}>WW-2026-00847</div>
          </div>
        </div>
        {[["Full Name","Jey","text"],["Email Address","jey@wattwatch.ie","email"],["Phone Number","+353 87 123 4567","tel"],["MPRN (Meter ID)","10012345678901","text"]].map(([l,v,tp])=>(
          <div key={l} style={{marginBottom:16}}>
            <label style={LS}>{l}</label>
            <input type={tp} defaultValue={v} style={{...IS,marginTop:6}} onFocus={e=>e.target.style.borderColor=t.teal} onBlur={e=>e.target.style.borderColor=t.border}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <label style={LS}>Address</label>
          <input type="text" defaultValue="14 Maple Drive, Blanchardstown" style={{...IS,marginTop:6}} onFocus={e=>e.target.style.borderColor=t.teal} onBlur={e=>e.target.style.borderColor=t.border}/>
        </div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <div style={{flex:2}}>
            <label style={LS}>City / Town</label>
            <input type="text" defaultValue="Dublin 15" style={{...IS,marginTop:6}} onFocus={e=>e.target.style.borderColor=t.teal} onBlur={e=>e.target.style.borderColor=t.border}/>
          </div>
          <div style={{flex:1}}>
            <label style={LS}>Eircode</label>
            <input type="text" defaultValue="D15 XY42" style={{...IS,marginTop:6,textTransform:"uppercase",letterSpacing:".5px"}} onFocus={e=>e.target.style.borderColor=t.teal} onBlur={e=>e.target.style.borderColor=t.border}/>
          </div>
        </div>
        <div style={{marginBottom:20}}><label style={LS}>Energy Supplier</label>
          <select defaultValue="Electric Ireland" style={{...IS,marginTop:6}}>
            {["Electric Ireland","SSE Airtricity","Bord Gáis Energy","Flogas","Yuno Energy"].map(v=><option key={v}>{v}</option>)}
          </select>
        </div>
        <button onClick={()=>toast("✅ Details saved!")} style={{width:"100%",padding:16,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",boxShadow:`0 6px 20px ${t.teal}55`}}>Save Changes</button>
      </div>
    </div>
  );
};

// ─── BILLING ───────────────────────────────────────────────────
const BillingScreen=({nav,toast,t})=>{
  const [billingTab,setBillingTab]=useState("pay");
  const [paid,setPaid]=useState(false);

  // Payment windows: each bill becomes payable from billingOpen to billingClose
  // March 2026 bill: open Mar 26 → Apr 10
  // February 2026 bill: open Feb 24 → Mar 10  (already passed → Paid)
  const BILLS=[
    {mon:"March 2026",  ref:"INV-2026-003", amt:"€51.30", open:new Date(2026,2,27), close:new Date(2026,3,10,23,59,59)},
    {mon:"February 2026",ref:"INV-2026-002",amt:"€38.74", open:new Date(2026,1,24), close:new Date(2026,2,10,23,59,59)},
    {mon:"January 2026", ref:"INV-2026-001",amt:"€44.80", open:new Date(2026,0,27), close:new Date(2026,1,10,23,59,59)},
    {mon:"December 2025",ref:"INV-2025-012",amt:"€63.90", open:new Date(2025,11,26), close:new Date(2026,0,10,23,59,59)},
  ];

  const now=new Date();
  const currentBill=BILLS[0]; // March 2026 is the active bill
  const isPaymentOpen = now>=currentBill.open && now<=currentBill.close && !paid;
  const isBeforeWindow = now<currentBill.open && !paid;
  const isAfterWindow = now>currentBill.close && !paid;

  // Days remaining in payment window
  const daysLeft = isPaymentOpen ? Math.ceil((currentBill.close-now)/(1000*60*60*24)) : 0;
  // Days until window opens
  const daysUntil = isBeforeWindow ? Math.ceil((currentBill.open-now)/(1000*60*60*24)) : 0;

  // Format open/close for display
  const fmtDate=d=>d.toLocaleDateString("en-IE",{day:"numeric",month:"short",year:"numeric"});

  // Invoice status: Paid if past window or manually paid, Pending if in window, Upcoming if before
  const billStatus=(bill)=>{
    if(bill.ref===currentBill.ref){
      if(paid) return "Paid";
      if(now>bill.close) return "Overdue";
      if(now>=bill.open) return "Pending";
      return "Upcoming";
    }
    return "Paid"; // older bills all paid
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <TopBar t={t} title="Billing" onBack={()=>nav("profile")}/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:40}}>

        {/* Bill Summary Card */}
        <div style={{margin:"16px 20px 0",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,borderRadius:20,padding:"24px",textAlign:"center",boxShadow:`0 8px 24px ${t.teal}55`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,.1)"}}/>
          <div style={{fontSize:13,color:"rgba(255,255,255,.8)",fontWeight:700,marginBottom:6}}>Current Bill — March 2026</div>
          <div style={{fontSize:42,fontWeight:800,color:"#fff",letterSpacing:-1}}>{paid?"✅ Paid":"€51.30"}</div>
          <div style={{display:"inline-block",background:"rgba(255,255,255,.25)",color:"#fff",fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,marginTop:10}}>
            {paid ? "Payment received — Thank you!" : `Payment window: ${fmtDate(currentBill.open)} – ${fmtDate(currentBill.close)}`}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`2px solid ${t.border}`,margin:"0 20px"}}>
          {[["pay","Payments"],["inv","Invoices"]].map(([k,l])=>(
            <button key={k} onClick={()=>setBillingTab(k)} style={{flex:1,padding:"12px 0",fontSize:13,fontWeight:700,fontFamily:"Nunito,sans-serif",border:"none",background:"none",color:billingTab===k?t.teal:t.muted,borderBottom:`2.5px solid ${billingTab===k?t.teal:"transparent"}`,cursor:"pointer"}}>{l}</button>
          ))}
        </div>

        {billingTab==="pay"?(
          <div style={{padding:"16px 20px 0"}}>
            {/* Payment Window Status Banner */}
            {!paid&&(
              <div style={{borderRadius:14,padding:"14px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:12,
                background: isPaymentOpen?"#dcfce7": isBeforeWindow?"#eff6ff":"#fef2f2",
                border:`1.5px solid ${isPaymentOpen?"#22c55e":isBeforeWindow?"#3b82f6":t.red}`}}>
                <div style={{fontSize:22,flexShrink:0}}>
                  {isPaymentOpen?"🟢":isBeforeWindow?"🕐":"🔴"}
                </div>
                <div style={{flex:1}}>
                  {isPaymentOpen&&<>
                    <div style={{fontSize:13,fontWeight:800,color:"#16a34a"}}>Payment Window Open</div>
                    <div style={{fontSize:11,color:"#166534",marginTop:2}}>{fmtDate(currentBill.open)} – {fmtDate(currentBill.close)} · {daysLeft} day{daysLeft!==1?"s":""} remaining</div>
                  </>}
                  {isBeforeWindow&&<>
                    <div style={{fontSize:13,fontWeight:800,color:"#1d4ed8"}}>Payment Not Yet Due</div>
                    <div style={{fontSize:11,color:"#1e40af",marginTop:2}}>Opens {fmtDate(currentBill.open)} · {daysUntil} day{daysUntil!==1?"s":""} away</div>
                  </>}
                  {isAfterWindow&&<>
                    <div style={{fontSize:13,fontWeight:800,color:t.red}}>Payment Window Closed</div>
                    <div style={{fontSize:11,color:"#991b1b",marginTop:2}}>Deadline was {fmtDate(currentBill.close)} · Contact support</div>
                  </>}
                </div>
              </div>
            )}

            {/* Payment Method Card */}
            <div style={{background:t.card,borderRadius:16,padding:20,boxShadow:t.shadow,marginBottom:12}}>
              <div style={{fontSize:15,fontWeight:700,color:t.text,marginBottom:16}}>Payment Method</div>
              <div style={{display:"flex",alignItems:"center",gap:14,padding:14,background:t.bg,borderRadius:12,border:`2px solid ${isPaymentOpen&&!paid?t.teal:t.border}`}}>
                <div style={{width:44,height:30,background:isPaymentOpen&&!paid?`linear-gradient(135deg,${t.teal},${t.tealDark})`:"#94a3b8",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff"}}>VISA</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:t.text}}>•••• •••• •••• 4291</div>
                  <div style={{fontSize:12,color:t.muted}}>Expires 09/27</div>
                </div>
                <span style={{fontSize:11,fontWeight:700,background:t.tealLight,color:t.teal,padding:"3px 8px",borderRadius:6}}>Default</span>
              </div>
            </div>

            {/* Pay Button — state-aware */}
            {paid?(
              <div style={{width:"100%",padding:16,background:"#dcfce7",borderRadius:12,textAlign:"center",fontSize:15,fontWeight:800,color:"#16a34a"}}>
                ✅ Payment Processed — Thank you!
              </div>
            ):isPaymentOpen?(
              <button
                onClick={()=>{setPaid(true);toast("✅ Payment of "+currentBill.amt+" processed!");}}
                style={{width:"100%",padding:16,background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:800,fontFamily:"Nunito,sans-serif",cursor:"pointer",boxShadow:`0 6px 20px ${t.teal}55`}}>
                Pay {currentBill.amt} Now
              </button>
            ):isBeforeWindow?(
              <div style={{width:"100%",padding:16,background:t.bg,border:`2px dashed ${t.border}`,borderRadius:12,textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:800,color:t.muted}}>Payment not yet available</div>
                <div style={{fontSize:12,color:t.light,marginTop:4}}>Opens {fmtDate(currentBill.open)}</div>
              </div>
            ):(
              <div style={{width:"100%",padding:16,background:"#fef2f2",border:`2px solid ${t.red}`,borderRadius:12,textAlign:"center"}}>
                <div style={{fontSize:14,fontWeight:800,color:t.red}}>Payment window closed</div>
                <div style={{fontSize:12,color:t.muted,marginTop:4}}>Please contact support@wattwatch.ie</div>
              </div>
            )}

            {/* Payment window info strip */}
            {!paid&&(
              <div style={{marginTop:14,background:t.card,borderRadius:12,padding:"12px 16px",boxShadow:t.shadow}}>
                <div style={{fontSize:11,fontWeight:700,color:t.muted,textTransform:"uppercase",letterSpacing:".4px",marginBottom:8}}>Payment Schedule</div>
                <div style={{display:"flex",alignItems:"center",position:"relative",paddingBottom:4}}>
                  {/* Timeline bar */}
                  <div style={{position:"absolute",top:10,left:20,right:20,height:3,background:t.border,borderRadius:3,zIndex:0}}/>
                  <div style={{position:"absolute",top:10,left:20,width:isPaymentOpen?`${Math.min(100,((now-currentBill.open)/(currentBill.close-currentBill.open))*100)}%`:isBeforeWindow?"0%":"100%",height:3,background:isPaymentOpen?t.teal:isAfterWindow?t.red:t.border,borderRadius:3,zIndex:1,maxWidth:"calc(100% - 40px)"}}/>
                  {[
                    {label:"Bill issued",date:fmtDate(new Date(2026,2,27)),done:true},
                    {label:"Window opens",date:fmtDate(currentBill.open),done:now>=currentBill.open},
                    {label:"Due date",date:fmtDate(currentBill.close),done:now>=currentBill.close},
                  ].map((step,si)=>(
                    <div key={si} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",zIndex:2}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:step.done?(isAfterWindow&&si===2?t.red:t.teal):t.card,border:`2px solid ${step.done?(isAfterWindow&&si===2?t.red:t.teal):t.border}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6}}>
                        {step.done&&<svg viewBox="0 0 24 24" width={10} height={10} fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div style={{fontSize:9,fontWeight:700,color:step.done?t.teal:t.muted,textAlign:"center",whiteSpace:"nowrap"}}>{step.label}</div>
                      <div style={{fontSize:8,color:t.light,marginTop:1,textAlign:"center"}}>{step.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ):(
          <div style={{padding:"8px 0"}}>
            {BILLS.map(({mon,ref,amt})=>{
              const status=billStatus({ref,mon,amt,open:BILLS.find(b=>b.ref===ref)?.open,close:BILLS.find(b=>b.ref===ref)?.close});
              const isPending=status==="Pending";
              const isUpcoming=status==="Upcoming";
              const isOverdue=status==="Overdue";
              return(
                <div key={ref} style={{margin:"8px 20px 0",background:t.card,borderRadius:16,padding:"14px 16px",boxShadow:t.shadow,display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:44,height:44,borderRadius:12,background:isPending||isOverdue?"#fff7ed":isUpcoming?"#eff6ff":"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={isPending||isOverdue?t.orange:isUpcoming?"#3b82f6":"#16a34a"} strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:t.text}}>{mon}</div>
                    <div style={{fontSize:11,color:t.muted,marginTop:2,fontFamily:"monospace"}}>{ref}</div>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:6,marginTop:4,display:"inline-block",
                      background:isPending?"#fff7ed":isOverdue?"#fef2f2":isUpcoming?"#eff6ff":"#dcfce7",
                      color:isPending?t.orange:isOverdue?t.red:isUpcoming?"#1d4ed8":"#16a34a"}}>
                      {status}
                    </span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:15,fontWeight:800,color:t.text}}>{amt}</div>
                    <button onClick={()=>{downloadInvoice(ref,mon,amt);toast(`📄 Downloading ${ref}…`);}} style={{background:isPending?"#fff7ed":"#dcfce7",color:isPending?t.orange:"#16a34a",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:700,fontFamily:"Nunito,sans-serif",cursor:"pointer",marginTop:4}}>⬇ PDF</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── DOWNLOAD MENU OVERLAY ────────────────────────────────────
const DownloadMenu=({t})=>{
  const close=()=>{const m=document.getElementById('dl-menu-overlay');if(m)m.style.display='none';};
  return(
    <div id="dl-menu-overlay" onClick={close}
      style={{display:"none",position:"absolute",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.card,borderRadius:"24px 24px 0 0",width:"100%",paddingBottom:28}}>
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}><div style={{width:40,height:4,background:t.border,borderRadius:4}}/></div>
        <div style={{padding:"6px 20px 16px",borderBottom:`1px solid ${t.border}`}}>
          <div style={{fontSize:17,fontWeight:800,color:t.text}}>Download Data</div>
          <div style={{fontSize:12,color:t.muted,marginTop:2}}>March 2026 · IE(SEM) prices</div>
        </div>
        {[
          {ico:"📄",bg:"#fee2e2",ic:"#ef4444",lbl:"PDF Report",sub:"Monthly summary with daily breakdown",fn:()=>{downloadReport();close();}},
          {ico:"📊",bg:"#dcfce7",ic:"#16a34a",lbl:"Excel / CSV",sub:"Hourly price data · open in Excel",fn:()=>{downloadCSV();close();}},
          {ico:"{}",bg:"#ede9fe",ic:"#7c3aed",lbl:"Raw JSON",sub:"Wholesale €/MWh + retail €/kWh",fn:()=>{downloadJSON();close();}},
        ].map((opt,i)=>(
          <div key={i} onClick={opt.fn} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",cursor:"pointer",transition:"background .15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.bg}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:44,height:44,borderRadius:14,background:opt.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>{opt.ico}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:t.text}}>{opt.lbl}</div>
              <div style={{fontSize:12,color:t.muted,marginTop:1}}>{opt.sub}</div>
            </div>
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke={opt.ic} strokeWidth={2.5}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </div>
        ))}
        <div style={{padding:"4px 20px 0"}}>
          <button onClick={close} style={{width:"100%",padding:14,background:t.bg,border:"none",borderRadius:14,fontSize:15,fontWeight:700,color:t.muted,fontFamily:"Nunito,sans-serif",cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── FLOATING CHAT POPUP ──────────────────────────────────────
// App context passed in so bot can read live data & create alerts
const FloatingChat=({t,onClose,showNav,alerts,setAlerts,toast})=>{
  const [messages,setMessages]=useState([
    {role:"assistant",content:"👋 Hi Jey! I can help with your energy prices, bills, or create a price alert for you. What do you need?"}
  ]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{if(bottomRef.current)bottomRef.current.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  // Live app data injected into every AI call — no external knowledge needed
  const curH=new Date().getHours();
  const livePrice=liveHourly[curH]?.r?.toFixed(3)||"0.228";
  const todayLow=+(Math.min(...SEM[25])).toFixed(3);
  const todayHigh=+(Math.max(...SEM[25])).toFixed(3);
  const todayAvg=+(SEM[25].reduce((a,b)=>a+b,0)/24).toFixed(3);
  const cheapestHour=SEM[25].indexOf(Math.min(...SEM[25]));
  const peakHour=SEM[25].indexOf(Math.max(...SEM[25]));
  const activeAlerts=alerts.filter(a=>a.active).length;

  const appSystem=`You are WattWatch Energy Assistant, a smart AI built into the WattWatch app for Irish electricity customers.

LIVE APP DATA (25 Mar 2026):
- Current price: €${livePrice}/kWh (SEMOpx)
- Today low: €${todayLow}/kWh at ${String(cheapestHour).padStart(2,"0")}:00
- Today high: €${todayHigh}/kWh at ${String(peakHour).padStart(2,"0")}:00
- Today average: €${todayAvg}/kWh
- Monthly forecast: €148.20 (−3% vs Feb)
- Active alerts: ${activeAlerts}
- Supplier: Electric Ireland, Tariff: Night Saver
- Peak hours: 08:00-10:00 & 17:00-19:00 (>€0.30)
- Off-peak: 00:00-06:00 & 13:00-15:00 (<€0.20)
- Best EV charge window: 01:00-05:00

CAPABILITIES: You can create price alerts on behalf of the user. When the user asks to set/create a price alert (e.g. "alert me when price drops below €0.20", "notify me if price goes above €0.30"), extract the threshold and direction, then reply with EXACTLY this JSON action on the LAST line of your response (after your normal reply text):
ACTION:{"type":"createAlert","name":"<short name>","condition":"<below|above>","price":"<0.XX>","notify":"push"}

Rules:
- Only answer energy-related questions about prices, bills, switching, alerts, and saving tips
- Be concise (2-3 sentences max)
- Use the live data above — never say you don't have access to data
- If user asks about their alerts, mention they have ${activeAlerts} active alert(s)
- Never mention Claude, Anthropic, or any AI provider`;

  const processAction=(text,msgList)=>{
    const match=text.match(/ACTION:(\{.*\})$/m);
    if(!match) return;
    try{
      const action=JSON.parse(match[1]);
      if(action.type==="createAlert"){
        const newAlert={
          id:Date.now(),type:"price",
          name:action.name||`Price ${action.condition} €${action.price}`,
          desc:`Price ${action.condition} €${action.price}/kWh · ${action.notify||"push"}`,
          days:["Mo","Tu","We","Th","Fr","Sa","Su"],
          active:true
        };
        setAlerts(prev=>[...prev,newAlert]);
        toast(`✅ Alert created: ${newAlert.name}`);
        // strip the ACTION line from the displayed message
        const cleaned=text.replace(/\nACTION:\{.*\}$/m,"").trim();
        setMessages(prev=>[...prev.slice(0,-1),{role:"assistant",content:cleaned+"\n\n✅ Alert created and saved!"}]);
      }
    }catch(e){}
  };

  const send=async()=>{
    const text=input.trim();
    if(!text||loading) return;
    setInput("");
    const newMsgs=[...messages,{role:"user",content:text}];
    setMessages(newMsgs);
    setLoading(true);
    await new Promise(r=>setTimeout(r,600));
    const q=text.toLowerCase();
    let reply="";
    let alertCreated=null;

    // Extract price from message
    const priceMatch=text.match(/[€]?(0\.\d{1,3}|\d+\.?\d*)/);
    const extractedPrice=priceMatch?parseFloat(priceMatch[1]).toFixed(2):null;

    // Extract time range from message e.g. "6am to 8am", "22:00 to 23:30", "10pm-11pm"
    const timeRange=text.match(/(\d{1,2}(?::\d{2})?(?:am|pm)?)\s*(?:to|–|-)\s*(\d{1,2}(?::\d{2})?(?:am|pm)?)/i);
    const parseTime=s=>{
      if(!s) return null;
      s=s.toLowerCase().trim();
      const ampm=s.includes("am")||s.includes("pm");
      let h=parseInt(s),m=0;
      if(s.includes(":")){const p=s.split(":");h=parseInt(p[0]);m=parseInt(p[1]);}
      if(s.includes("pm")&&h<12) h+=12;
      if(s.includes("am")&&h===12) h=0;
      return `${String(h).padStart(2,"0")}:${String(m||0).padStart(2,"0")}`;
    };

    // ── PRICE ALERTS ──
    if(q.match(/alert.*below|below.*alert|notify.*below|set.*below|create.*below|when.*below|price.*drop|drop.*below|if.*below/)){
      const price=extractedPrice||"0.20";
      const nm=`Price below €${price}`;
      alertCreated={id:Date.now(),type:"price",name:nm,desc:`Price below €${price}/kWh · push`,days:["Mo","Tu","We","Th","Fr","Sa","Su"],active:true};
      reply=`Done! ✅ Price alert created — I'll notify you when the price drops below €${price}/kWh, every day.`;

    } else if(q.match(/alert.*above|above.*alert|notify.*above|set.*above|create.*above|when.*above|price.*spike|goes.*over|exceeds/)){
      const price=extractedPrice||"0.30";
      const nm=`Price above €${price}`;
      alertCreated={id:Date.now(),type:"price",name:nm,desc:`Price above €${price}/kWh · push`,days:["Mo","Tu","We","Th","Fr","Sa","Su"],active:true};
      reply=`Done! ✅ Alert set — you'll be notified when price exceeds €${price}/kWh.`;

    // ── TIME ALERTS ──
    } else if(q.match(/time.*alert|alert.*time|window.*alert|alert.*window|remind.*at|notify.*at|alert.*from|schedule.*alert|off.?peak.*alert|ev.*alert|charge.*alert|morning.*alert|evening.*alert|overnight.*alert/)){
      let start="06:00",end="08:00",nm="";
      if(timeRange){
        start=parseTime(timeRange[1])||"06:00";
        end=parseTime(timeRange[2])||"08:00";
      } else if(q.match(/overnight|night|ev|charge/)){start="01:00";end="05:00";}
      else if(q.match(/morning/)){start="06:00";end="09:00";}
      else if(q.match(/evening/)){start="17:00";end="20:00";}
      else if(q.match(/off.?peak/)){start="00:00";end="06:00";}
      nm=`Time alert ${start}–${end}`;
      alertCreated={id:Date.now(),type:"time",name:nm,desc:`${start}–${end} · push`,days:["Mo","Tu","We","Th","Fr","Sa","Su"],active:true};
      reply=`Done! ✅ Time alert set for ${start}–${end} every day. You'll get a notification at ${start}.`;

    // ── GENERAL CREATE ALERT ──
    } else if(q.match(/create.*alert|set.*alert|add.*alert|new.*alert|make.*alert/)){
      reply=`I can create two types of alerts:\n\n💰 Price alerts:\n• "Alert me when price drops below €0.20"\n• "Alert me above €0.30"\n\n⏰ Time alerts:\n• "Remind me at 01:00 to 05:00"\n• "Set overnight EV charging alert"\n• "Morning alert 6am to 8am"\n\nWhat would you like?`;

    // ── PRICE QUERIES ──
    } else if(q.match(/now|current|live|right now|price now/)){
      reply=`Current price is €${livePrice}/kWh — ${statusBadge(parseFloat(livePrice)).txt}.\nToday's range: €${todayLow} low → €${todayHigh} peak.`;

    } else if(q.match(/cheap|low|best|cheapest|off.?peak/)){
      reply=`Cheapest time today is ${String(cheapestHour).padStart(2,"0")}:00 at €${todayLow}/kWh.\nOff-peak windows: 00:00–06:00 and 13:00–15:00.\nSay "alert me below €${todayLow}" to get notified!`;

    } else if(q.match(/peak|expensive|high|avoid|worst/)){
      reply=`Peak today is ${String(peakHour).padStart(2,"0")}:00 at €${todayHigh}/kWh.\nAvoid 08:00–10:00 and 17:00–19:00 for heavy appliances.`;

    } else if(q.match(/bill|forecast|month|cost|spend/)){
      reply=`Your March forecast is €148.20, down 3% from February.\nAvg €${todayAvg}/kWh · ~628 kWh used this month.\nBiggest savings: shift usage to 01:00–06:00.`;

    } else if(q.match(/ev|car|charge|vehicle|electric car/)){
      reply=`Best EV charging: 01:00–05:00 at €${todayLow}/kWh.\nThat's ${Math.round((parseFloat(todayHigh)-parseFloat(todayLow))/parseFloat(todayHigh)*100)}% cheaper vs peak.\nWant me to set an overnight time alert?`;

    } else if(q.match(/device|heater|solar|light|appliance/)){
      reply=`Your 4 connected devices today:\n• EV Charger: 9.6 kWh · €2.26\n• Smart Lights: 0.9 kWh · €0.21\n• Heater: 4.2 kWh · €0.99\n• Solar Panels: −7.8 kWh · −€1.84 (exporting)\n\nNet cost today: €1.62`;

    } else if(q.match(/save|tip|reduce|lower|cut|help/)){
      reply=`Top 3 savings tips:\n1️⃣ Charge EV 01:00–05:00 (€${todayLow}/kWh)\n2️⃣ Avoid 08–10 & 17–19h (€${todayHigh}/kWh)\n3️⃣ Use solar generation mid-day to offset heater\n\nPotential saving: ~€1.80/day`;

    } else if(q.match(/alert|notification|notify/)){
      reply=`You have ${activeAlerts} active alert(s).\nI can create price alerts (below/above a threshold) or time alerts (remind you at a window).\nWhat would you like to set up?`;

    } else if(q.match(/ticket|support|crm|complaint|issue|problem/)){
      reply=`For support queries, go to:\nProfile → My Tickets\nYou can raise a new ticket and the CRM team will reply within 2–4 hours (Mon–Fri 09:00–17:00).\nEmail: support@wattwatch.ie`;

    } else if(q.match(/mprn|meter|switch|supplier|provider/)){
      reply=`MPRN (Meter Point Reference Number) uniquely identifies your electricity connection.\nFind it on your bill or meter.\nYou're currently on Electric Ireland — Night Saver tariff.`;

    } else if(q.match(/hello|hi|hey|hiya/)){
      reply=`Hi Jey! 👋 Current price: €${livePrice}/kWh.\nI can help with prices, bills, alerts, devices, or support tickets. What do you need?`;

    } else {
      reply=`Current price: €${livePrice}/kWh · Today: €${todayLow}–€${todayHigh}/kWh.\n\nI can help with:\n• Live & forecast prices\n• Creating price or time alerts\n• Device energy usage\n• Best times to use appliances\n• Support tickets\n\nWhat would you like to know?`;
    }

    if(alertCreated){
      setAlerts(prev=>[...prev,alertCreated]);
      toast(`✅ Alert created: ${alertCreated.name}`);
    }
    setMessages(p=>[...p,{role:"assistant",content:reply}]);
    setLoading(false);
  };

  const popBottom=showNav?162:80;

  return(
    <div style={{
      position:"absolute",bottom:popBottom,right:14,width:310,height:430,
      borderRadius:20,background:t.card,
      boxShadow:`0 8px 40px rgba(0,0,0,.28),0 0 0 1px ${t.border}`,
      zIndex:240,display:"flex",flexDirection:"column",overflow:"hidden",
      animation:"slideUp .22s cubic-bezier(.34,1.56,.64,1)"
    }}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>⚡</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:800,color:"#fff",lineHeight:1.2}}>WattWatch Assistant</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.75)"}}>{loading?"Thinking…":"Energy AI · Live data"}</div>
        </div>
        <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,padding:"5px 8px",color:"#fff",fontSize:13,cursor:"pointer",lineHeight:1}}>✕</button>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-end",gap:6,justifyContent:m.role==="assistant"?"flex-start":"flex-end"}}>
            {m.role==="assistant"&&(
              <div style={{width:24,height:24,borderRadius:"50%",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11}}>⚡</div>
            )}
            <div style={{
              maxWidth:"82%",padding:"9px 11px",
              borderRadius:m.role==="assistant"?"14px 14px 14px 3px":"14px 14px 3px 14px",
              background:m.role==="assistant"?t.bg:`linear-gradient(135deg,${t.teal},${t.tealDark})`,
              color:m.role==="assistant"?t.text:"#fff",
              fontSize:12,lineHeight:1.5,fontWeight:500,
              border:m.role==="assistant"?`1px solid ${t.border}`:"none",
              whiteSpace:"pre-line"
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"flex-end",gap:6}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:`linear-gradient(135deg,${t.teal},${t.tealDark})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11}}>⚡</div>
            <div style={{padding:"9px 14px",background:t.bg,borderRadius:"14px 14px 14px 3px",border:`1px solid ${t.border}`,display:"flex",gap:4,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:t.teal,animation:`blink 1s ease-in-out ${i*0.18}s infinite`}}/>)}
            </div>
          </div>
        )}
        {messages.length===1&&!loading&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:4}}>
            {["Current price?","Cheapest time today?","Create alert < €0.20","Overnight EV alert","My devices today","Save on my bill"].map((q,i)=>(
              <button key={i} onClick={()=>setInput(q)} style={{padding:"5px 9px",background:t.card,border:`1px solid ${t.border}`,borderRadius:14,fontSize:11,fontWeight:600,color:t.teal,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{padding:"8px 10px 10px",borderTop:`1px solid ${t.border}`,background:t.card,flexShrink:0}}>
        <div style={{display:"flex",gap:6,alignItems:"center",background:t.bg,borderRadius:20,padding:"6px 6px 6px 12px",border:`1.5px solid ${loading?t.teal:t.border}`}}>
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Ask about energy or set an alert…"
            style={{flex:1,border:"none",background:"none",fontSize:12,fontFamily:"Nunito,sans-serif",color:t.text,outline:"none"}}/>
          <button onClick={send} disabled={loading||!input.trim()}
            style={{width:30,height:30,borderRadius:"50%",background:input.trim()&&!loading?t.teal:t.border,border:"none",cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s"}}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="white"><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── APP ROOT ──────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("splash");
  const [theme,setTheme]=useState("light");
  const [toastMsg,setToastMsg]=useState(null);
  const [toastTimer,setToastTimer]=useState(null);
  const [alerts,setAlerts]=useState([]);
  const [alertSheet,setAlertSheet]=useState(false);
  const [calOpen,setCalOpen]=useState(false);
  const [chatOpen,setChatOpen]=useState(false);
  const t=THEMES[theme];

  const nav=useCallback((id)=>setScreen(id),[]);

  const toast=useCallback((msg)=>{
    setToastMsg(msg);
    if(toastTimer)clearTimeout(toastTimer);
    const tid=setTimeout(()=>setToastMsg(null),2600);
    setToastTimer(tid);
  },[toastTimer]);

  const handleAuthSuccess=()=>{
    setScreen("loading");
    setTimeout(()=>setScreen("home"),5200);
  };

  const openCal=()=>setCalOpen(true);
  const openSheet=()=>{ if(screen==="alerts"){ setAlertSheet(true); } else { setAlertSheet(true); nav("alerts"); } };
  const MAIN=["home","analytics","devices","alerts","profile"];
  const showNav=MAIN.includes(screen);
  const scr={position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",flexDirection:"column",background:t.bg};

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Nunito',sans-serif;background:#dde1ea;display:flex;justify-content:center;align-items:center;min-height:100vh;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes spinR{to{transform:rotate(-360deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(34,197,94,.55)}50%{box-shadow:0 0 50px rgba(34,197,94,.9)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes botPulse{0%,100%{box-shadow:0 4px 20px rgba(62,207,178,.6),0 0 0 3px #fff}50%{box-shadow:0 4px 28px rgba(62,207,178,.9),0 0 0 5px #fff}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        ::-webkit-scrollbar{display:none}
      `}</style>
      <div style={{width:390,height:844,background:t.bg,borderRadius:44,overflow:"hidden",position:"relative",boxShadow:"0 30px 80px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.3)",fontFamily:"Nunito,sans-serif"}}>

        {screen==="splash"&&<SplashScreen nav={nav} t={t}/>}
        {screen==="signin"&&<div style={scr}><StatusBar t={t}/><SignInScreen nav={nav} onSuccess={handleAuthSuccess} t={t}/></div>}
        {screen==="signup"&&<div style={scr}><StatusBar t={t}/><SignUpScreen nav={nav} onSuccess={handleAuthSuccess} t={t}/></div>}
        {screen==="loading"&&<div style={scr}><StatusBar t={t}/><LoadingScreen t={t}/></div>}
        {screen==="home"&&<div style={scr}><HomeScreen nav={nav} toast={toast} t={t} openCal={openCal}/></div>}
        {screen==="analytics"&&<div style={scr}><StatusBar t={t}/><AnalyticsScreen nav={nav} toast={toast} t={t} openCal={openCal}/></div>}
        {screen==="devices"&&<div style={scr}><StatusBar t={t}/><DevicesScreen nav={nav} toast={toast} t={t} openCal={openCal}/></div>}
        {screen==="alerts"&&<div style={scr}><StatusBar t={t}/><AlertsScreen nav={nav} toast={toast} t={t} openCal={openCal} alerts={alerts} setAlerts={setAlerts} sheetOpen={alertSheet} setSheetOpen={setAlertSheet}/></div>}
        {screen==="profile"&&<div style={scr}><StatusBar t={t}/><ProfileScreen nav={nav} toast={toast} t={t} openCal={openCal} alerts={alerts} setAlertSheet={setAlertSheet}/></div>}
        {screen==="settings"&&<div style={scr}><StatusBar t={t}/><SettingsScreen nav={nav} toast={toast} t={t} theme={theme} setTheme={setTheme}/></div>}
        {screen==="user-details"&&<div style={scr}><StatusBar t={t}/><UserDetailsScreen nav={nav} toast={toast} t={t}/></div>}
        {screen==="billing"&&<div style={scr}><StatusBar t={t}/><BillingScreen nav={nav} toast={toast} t={t}/></div>}
        {screen==="tickets"&&<div style={scr}><StatusBar t={t}/><TicketsScreen nav={nav} toast={toast} t={t}/></div>}
        {screen==="subscription"&&<div style={scr}><StatusBar t={t}/><SubscriptionScreen nav={nav} toast={toast} t={t}/></div>}
        {showNav&&<BottomNav screen={screen} nav={nav} t={t} openSheet={openSheet}/>}
        {toastMsg&&<Toast msg={toastMsg} t={t}/>}
        <CalendarModal show={calOpen} onClose={()=>setCalOpen(false)} t={t}/>
        <DownloadMenu t={t}/>
        {/* ── FLOATING AI ASSISTANT BOT FAB + POPUP ── */}
        {!["splash","signin","signup","loading"].includes(screen)&&(
          <>
            {/* FAB button */}
            <button
              onClick={()=>setChatOpen(v=>!v)}
              style={{
                position:"absolute",
                bottom:showNav?102:22,
                right:18,
                width:52,height:52,
                borderRadius:"50%",
                background:chatOpen?t.muted:`linear-gradient(135deg,${t.teal},${t.tealDark})`,
                border:"none",
                cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:`0 4px 20px ${t.teal}99,0 0 0 3px ${t.isDark?"#141625":"#fff"}`,
                zIndex:250,
                transition:"transform .2s,background .2s",
                animation:chatOpen?"none":"botPulse 3s ease-in-out infinite",
              }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
              title="WattWatch AI"
            >
              {chatOpen?(
                <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ):(
                <svg viewBox="0 0 24 24" width={26} height={26} fill="none">
                  <rect x="5" y="8" width="14" height="11" rx="3" fill="white" opacity=".95"/>
                  <rect x="8" y="11" width="3" height="3" rx="1" fill={t.teal}/>
                  <rect x="13" y="11" width="3" height="3" rx="1" fill={t.teal}/>
                  <rect x="9" y="15" width="6" height="1.5" rx=".75" fill={t.teal}/>
                  <line x1="12" y1="8" x2="12" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="12" cy="4.5" r="1.5" fill="white"/>
                  <line x1="5" y1="12" x2="3" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="19" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
            {/* Floating chat popup window */}
            {chatOpen&&<FloatingChat t={t} onClose={()=>setChatOpen(false)} showNav={showNav} alerts={alerts} setAlerts={setAlerts} toast={toast}/>}
          </>
        )}
      </div>
    </>
  );
}

// user message  - > extract the keywords - > match against intents - > generate response based on intent and live data

// if (q.match(/now|current|live/))        → returns live price from SEM data
// else if (q.match(/cheap|low|best/))     → returns cheapest hour
// else if (q.match(/peak|expensive/))     → returns peak hour
// else if (q.match(/bill|forecast/))      → returns €148.20 forecast
// else if (q.match(/ev|charge/))          → returns EV charging tip
// else if (q.match(/alert.*below/))       → creates a price-below alert
// else if (q.match(/alert.*above/))       → creates a price-above alert
// ...
// else → generic fallback message
