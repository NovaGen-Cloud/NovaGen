import {COUNTRIES,ALIASES} from "./countries.js";import {NAME_PACKS} from "./name-packs.js";
const fallback={male:["Alex","Daniel","Jordan","Noah","Sam","Eli","Leo","Ryan"],female:["Maya","Sara","Nina","Lina","Ava","Mia","Ella","Zoe"]};
export function findCountries(q=""){q=q.trim().toLowerCase();if(!q)return COUNTRIES;const alias=ALIASES[q];return COUNTRIES.filter(c=>alias?c.name===alias:[c.name,c.alpha2,c.alpha3].some(v=>v.toLowerCase()===q)||c.name.toLowerCase().includes(q))}
const pick=a=>a[Math.floor(Math.random()*a.length)];
export function generateNames(c,g,n){const p=NAME_PACKS[c.alpha2]||fallback;const pool=g==="male"?p.male:g==="female"?p.female:[...p.male,...p.female];return Array.from({length:n},()=>pick(pool))}
