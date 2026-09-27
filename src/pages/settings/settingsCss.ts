export const settingsCss = `
.st-wrap { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 40px; align-items: start; }
.st-nav { position: sticky; top: calc(var(--topbar-h) + 24px); display: grid; gap: 10px; }
.st-nav-list { display: grid; gap: 2px; }
.st-nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--r-sm); text-decoration: none; font-weight: 600; font-size: 13.5px; color: var(--ink-2); border-left: 2px solid transparent; }
.st-nav-item:hover { background: var(--paper-2); }
.st-nav-item.is-on { color: var(--ink); background: var(--sheet); border-left-color: var(--red); box-shadow: 0 0 0 1px var(--rule); }
.st-main { display: grid; gap: 28px; min-width: 0; }
.st-h { display: grid; gap: 6px; }
.st-h h1 { font-size: 30px; }
.st-h p { color: var(--ink-2); font-size: 14.5px; max-width: 560px; }
.st-sec { display: grid; gap: 12px; }
.st-sec > h2 { font-size: 17px; }
.st-sub { color: var(--ink-3); font-size: 13px; margin-top: -6px; }
.st-opt { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: start; padding: 16px; border: 1px solid var(--rule); background: var(--sheet); border-radius: var(--r-md); cursor: pointer; text-align: left; width: 100%; }
.st-opt.is-on { border: 1.5px solid var(--ink); box-shadow: var(--shadow-hard); }
.st-radio { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid var(--ink-3); margin-top: 3px; display: grid; place-items: center; }
.st-opt.is-on .st-radio { border-color: var(--ink); }
.st-opt.is-on .st-radio::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--red); }
.st-table { display: grid; border: 1px solid var(--rule); border-radius: var(--r-sm); background: var(--sheet); }
.st-trow { display: grid; grid-template-columns: 1.1fr 1fr 1.6fr; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--rule); align-items: center; font-size: 13px; }
.st-trow:last-child { border-bottom: 0; }
.st-trow.st-thead { padding-top: 8px; padding-bottom: 8px; background: var(--sheet-2); }
.st-krow { display: grid; grid-template-columns: 150px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--rule); }
.st-krow:last-child { border-bottom: 0; }
.st-inputwrap { position: relative; }
.st-inputwrap .input { padding-right: 40px; }
.st-inputwrap .btn { position: absolute; right: 3px; top: 50%; transform: translateY(-50%); }
.st-stat { display: grid; gap: 2px; padding: 16px; }
.st-stat b { font-size: 30px; font-stretch: 112%; font-weight: 800; font-family: var(--font-display); line-height: 1; }
.st-stats { display: grid; grid-template-columns: 1fr 1fr 1.4fr; gap: 12px; }
.st-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
@media (max-width: 820px) {
  .st-wrap { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  .st-nav { position: static; }
  .st-nav-label { display: none; }
  .st-nav-list { display: flex; overflow-x: auto; gap: 4px; border-bottom: 1px solid var(--rule); padding-bottom: 6px; }
  .st-nav-item { white-space: nowrap; border-left: 0; }
  .st-nav-item.is-on { box-shadow: inset 0 -2px 0 var(--red), 0 0 0 1px var(--rule); }
  .st-stats { grid-template-columns: 1fr 1fr; }
  .st-stats > :last-child { grid-column: span 2; }
  .st-plans { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .st-trow { grid-template-columns: 1fr 1fr; }
  .st-trow > :nth-child(3) { grid-column: span 2; }
  .st-trow.st-thead > :nth-child(3) { display: none; }
  .st-krow { grid-template-columns: 1fr auto; }
  .st-krow > :nth-child(2) { grid-column: span 2; order: 3; }
  .st-h h1 { font-size: 26px; }
}
`
