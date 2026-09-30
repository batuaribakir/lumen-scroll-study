// All page copy and data. ORIGINAL placeholder content for a fictional product ("lumen").
//
// It deliberately shares nothing with the reference's text, brand, people, partners or
// numbers. What it keeps is STRUCTURE, so the measured layout still applies: the number of
// lines per block, roughly the same length, and where a highlighted word, an accent, a
// struck word or a flipping letter sits. Replace freely; keep the markers:
//   [hl:words]   word(s) on a highlight box      [ac:words]   accent colour
//   [flip:x]     letter that mirrors when the palette inverts   \n   forced line break

export const BRAND = { name: 'lumen' };

export const HINT = 'Scroll';

// Chart: eleven yearly values, the year axis and the four labelled points.
export const CHART = {
  values: [210, 330, 520, 760, 1080, 1480, 1990, 2600, 3350, 4250, 5300],
  vMax: 5500,
  todayIndex: 5,
  labels: { first: '210', mid: '1,080', today: '1,480 · today', projected: '~5,300' },
  labelIndex: { first: 0, mid: 4, today: 5, projected: 10 },
  years: ['2020', '2025', '2030'],
  caption: 'Readings logged per week, all teams',
};

// Quotes shown over the climb (three groups; the reference never shows the third). The
// quotation marks are added by CSS.
export const VOICES = [
  { left: 'We spent two weeks lining up files before anyone looked at a single result.',
    right: 'Half of every meeting was about where the latest data lived.' },
  { left: 'Each new instrument came with its own spreadsheet and its own rules.',
    right: 'By the time the report was ready, the question had already moved.' },
  { statement: 'None of this shows up in the final figure.' },
];

export const BEATS = [
  { num: '01', name: 'Question', layout: 'hero',
    title: 'Good work is built on [hl:readings]\nyou can actually find.',
    sub: 'From a single bench sensor to a network of remote stations,\nevery reading should land somewhere safe and searchable.' },
  { num: '02', name: 'Growth', layout: 'market',
    kicker: 'The data keeps arriving',
    statement: 'Every project now [ac:measures everything.]',
    sub: 'Instruments got cheaper and sensors got smaller, so every project now produces more readings than one person can check by hand.' },
  { num: '03', name: 'Direction', layout: 'statement',
    statement: 'Two ways of working sit [ac:side by side] in most labs today.' },
  { num: '04', name: 'Direction', layout: 'choice',
    left: { tag: 'In the field', text: 'Readings arrive in short bursts.' },
    right: { tag: 'In the lab', text: 'Readings arrive every second, from a dozen instruments that never sleep.' } },
  { num: '05', name: 'Machinery', layout: 'statement',
    statement: 'Careful work means [ac:longer checklists,] more storage and more people waiting on files.' },
  { num: '06', name: 'Machinery', layout: 'empty' },
  { num: '07', name: 'Turn', layout: 'trava',
    lead: 'Every checklist ends with', word: 'guesswork.', struck: 'a record.' },
  { num: '08', name: 'Turn', layout: 'empty' },
  { num: '09', name: 'Light', layout: 'statement', sub: 'One place to capture, check and share every reading,\nfrom the first test run to the final figure.',
    statement: 'This is where the [hl:light] comes on.' },
  { num: '10', name: 'Trust', layout: 'statement',
    statement: '[flip:L]umen turns raw readings\ninto [ac:something you can trust.]' },
  { num: '11', name: 'Trust', layout: 'nots',
    statement: '[flip:L]umen keeps the method and quietly drops the [hl:busywork.]',
    nots: ['Copying files by hand.', 'Renaming folders at midnight, again.', 'Emailing the final version.'] },
  { num: '12', name: 'Workspace', layout: 'statement',
    statement: 'Everything lives in [ac:one shared workspace,] from raw sensor dumps to the reviewed figure in the final report.' },
  { num: '13', name: 'Record', layout: 'statement',
    statement: 'Your team stays curious.\n[flip:L]umen [ac:keeps the record straight.]' },
  { num: '14', name: 'Team', layout: 'disciplines',
    statement: 'The people behind lumen have spent their careers in labs, vans and server rooms.' },
  { num: '15', name: 'Invite', layout: 'cta',
    statement: 'Bring the question you keep coming back to, and [hl:we will light it up.]',
    sub: 'Early access is open for small research teams this season.',
    button: 'Try [flip:l]umen',
    fineline: 'Free for teams of up to five while the beta runs.\nNo credit card, no sales call.' },
];

// Team board (beat 14): three disciplines, five members; `frags` are keyed by discipline id.
export const DISCIPLINES = [
  { id: 'research', index: '01', name: 'Research & Methods' },
  { id: 'build', index: '02', name: 'Engineering & Data' },
  { id: 'field', index: '03', name: 'Field Operations' },
];
export const TEAM = [
  { name: 'Member One', role: 'Co-founder',
    frags: { research: 'Ran the measurement programme of a mid-sized lab for eight years and wrote the calibration guide the team still uses. Reviews every new method before it ships.',
             build: 'Designed the first version of the record format.' } },
  { name: 'Member Two', role: 'Co-founder',
    frags: { research: 'Physicist by training; moved from bench work to research planning.',
             field: 'Spent four seasons coordinating remote sensor sites, from permits to power supplies and the long drives in between.' } },
  { name: 'Member Three', role: 'Co-founder — Platform',
    frags: { build: 'Builds the storage and sync layer.', field: 'Keeps the field kit simple enough to carry.' } },
  { name: 'Member Four', role: 'Co-founder — Product',
    frags: { build: 'Led data teams at two instrument makers and learned the hard way what breaks when records are copied by hand. Owns the product and the roadmap.' } },
  { name: 'Member Five', role: 'Head of Partnerships',
    frags: { field: 'Talks to every new lab before they start, and to most of them after.' } },
];

export const BACKED = { lead: 'Backed by', name: 'PLACEHOLDER', label: 'Partners', partners: ['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E', 'Partner F', 'Partner G'] };

export const DOCS = {
  toggle: 'Documents',
  links: [
    { text: 'Terms of use', href: '#' },
    { text: 'Privacy notice', href: '#' },
    { text: 'Accessibility statement', href: '#' },
    { text: 'About this study', href: 'https://github.com/batuaribakir/lumen-scroll-study#readme' },
  ],
};

export const LEAD = {
  title: 'Let’s talk',
  sub: 'Leave a way to reach you and we will reply within two days.',
  fields: [
    { id: 'name', label: 'Name', type: 'text', autocomplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
    { id: 'org', label: 'Organisation', type: 'text', autocomplete: 'organization' },
  ],
  submit: 'Send',
  ok: 'Thanks. This is a demo page, so nothing was sent.',
};
