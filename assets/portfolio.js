'use strict';
document.documentElement.classList.add('js');
const root = document.documentElement;
const theme = document.querySelector('#theme-toggle');
const scheme = matchMedia('(prefers-color-scheme: dark)');
function syncTheme() {
  const dark = (root.dataset.theme || (scheme.matches ? 'dark' : 'light')) === 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  theme.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  theme.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
}
syncTheme();
theme.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('pk-theme', root.dataset.theme); } catch {}
  syncTheme();
});
const menu = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
}
menu.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navigation.addEventListener('click', closeMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); }
});
const tabs = [...document.querySelectorAll('.view-tab')];
const panels = [...document.querySelectorAll('.lab-panel')];
document.querySelector('.view-tabs').setAttribute('role', 'tablist');
function selectTab(index) {
  tabs.forEach((tab, i) => {
    tab.setAttribute('aria-selected', String(i === index));
    tab.tabIndex = i === index ? 0 : -1;
    panels[i].hidden = i !== index;
  });
}
tabs.forEach((tab, index) => {
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', panels[index].id);
  panels[index].setAttribute('role', 'tabpanel');
  panels[index].setAttribute('aria-labelledby', tab.id);
  tab.addEventListener('click', event => { event.preventDefault(); selectTab(index); });
  tab.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
      selectTab(next); tabs[next].focus();
    }
  });
});
selectTab(location.hash === '#playground' ? 1 : 0);
const layers = [...document.querySelectorAll('.stage-list li')];
const boards = [...document.querySelectorAll('[data-layer]')];
const descriptions = ['Router selects a route', 'Auth and input checks', 'Service applies logic', 'ORM persists the record'];
function highlight(index) {
  layers.forEach((layer, i) => {
    layer.classList.toggle('active', i === index);
    layer.querySelector('button').setAttribute('aria-pressed', String(i === index));
  });
  boards.forEach(board => board.classList.toggle('active', Number(board.dataset.layer) === index));
  document.querySelector('#trace-readout').textContent = descriptions[index];
}
layers.forEach((layer, index) => layer.querySelector('button').addEventListener('click', () => { stopTrace(); highlight(index); }));
let timer;
const trace = document.querySelector('#trace-run');
function stopTrace() {
  clearInterval(timer); timer = null;
  trace.querySelector('span').textContent = 'Run trace';
}
trace.addEventListener('click', () => {
  if (timer) { stopTrace(); return; }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    highlight(3); document.querySelector('#trace-readout').textContent = 'Route → checks → logic → SQL'; return;
  }
  let index = 0;
  highlight(index);
  trace.querySelector('span').textContent = 'Stop trace';
  timer = setInterval(() => {
    index += 1;
    if (index > 3) { stopTrace(); return; }
    highlight(index);
  }, 800);
});
const responses = {
  hello: ['200 OK', 'Hi, I’m Praphull. Glad you stopped by.'],
  idea: ['201 Created', 'Idea received. Let’s talk about it over email.'],
  secret: ['401 Unauthorized', 'This route needs an authentication token.'],
  coffee: ['418 I’m a teapot', 'I make a better API than a cup of coffee.']
};
document.querySelectorAll('[data-endpoint]').forEach(button => button.addEventListener('click', () => {
  const [status, message] = responses[button.dataset.endpoint];
  document.querySelectorAll('[data-endpoint]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelector('#response-status').textContent = status;
  document.querySelector('#response-json .json-string').textContent = JSON.stringify(message);
  document.querySelector('#api-announcement').textContent = status + '. ' + message;
}));
const formatter = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'});
function tick() { document.querySelector('#clock').textContent = formatter.format(new Date()) + ' IST'; }
tick(); setInterval(tick, 30000);
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#copy-email').addEventListener('click', async () => {
  const address = document.querySelector('#email-address');
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(address.textContent); status.textContent = 'Email address copied.'; }
  catch {
    const range = document.createRange(); range.selectNodeContents(address);
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Email selected. Use your device’s Copy command.';
  }
});
