/**
 * Montréal Bites — Media kit analytics (edit this file each quarter)
 * Loaded before index.html’s inline script. Keeps all numbers & copy in one place.
 */
window.MEDIA_KIT_DATA = {
  meta: {
    /** Shown in the top bar after the handle, e.g. "Data verified April 2025" */
    dataVerified: 'April 2025',
  },

  /** Spark arrays = one point per month (or same length you use today); used for mini charts */
  sparklines: {
    followers: [3680, 3700, 3710, 3690, 3720, 3740, 3730, 3750, 3770, 3760, 3780, 3800, 3817],
    views: [1800, 2100, 2400, 3400, 2200, 2600, 2800, 2300, 2500, 2700, 2900, 2800, 2800],
    engagement: [3.1, 3.3, 3.6, 3.4, 3.2, 3.7, 3.5, 3.6, 3.4, 3.5, 3.6, 3.5, 3.5],
    collabs: [4, 5, 5, 6, 7, 7, 8, 9, 10, 11, 11, 12, 12],
  },

  kpi: {
    followers: {
      value: '3,817',
      badge: '+2.3%',
      subHtml: '<strong>↑ Growing</strong> since Jan 14, 2025',
    },
    avgViews: {
      value: '~2.8K',
      badge: 'Peak: 183K',
      sub: 'Multiple posts hitting 5K–10K+',
    },
    engagement: {
      value: '~3.5%',
      badge: 'Strong',
      subHtml: '<strong>2× industry avg</strong> for micro-creators',
    },
    collabs: {
      value: '12+',
      badge: 'Active',
      sub: 'Food, lifestyle, beauty & tech brands',
    },
  },

  viral: {
    /** Follows the @handle in the viral title (include leading space before ·) */
    titleSuffix: ' · October 2025 · 100% Organic — No Collab Tag',
    views: '183K',
    sends: '7,698',
    likes: '3,796',
    comments: '82',
    reshares: '15',
  },

  /** Collab performance table: top row can be featured viral */
  collabRows: [
    { rank: '★', emoji: '🫐', name: 'Crème Mood MTL', tag: 'viral', tagLabel: 'Organic Viral', views: '183K', barPct: 100, barColor: 'accent', nameAccent: true },
    { rank: '01', emoji: '☕', name: 'Café Green Drip', tag: 'organic', tagLabel: 'Organic', views: '7K', barPct: 3.8, barColor: 'green' },
    { rank: '02', emoji: '✨', name: 'Toronto food dump', tag: 'organic', tagLabel: 'Organic', views: '12.8K', barPct: 7, barColor: 'green' },
    { rank: '03', emoji: '🫙', name: 'Maison Sauvage MTL', tag: 'collab', tagLabel: 'Collab', views: '8.9K', barPct: 4.9, barColor: 'accent' },
    { rank: '04', emoji: '🍹', name: 'Amalia Montreal', tag: 'collab', tagLabel: 'Collab', views: '10.4K', barPct: 5.7, barColor: 'accent' },
    { rank: '05', emoji: '🐙', name: 'Carreras Resto', tag: 'collab', tagLabel: 'Collab', views: '5.6K', barPct: 3.1, barColor: 'accent' },
    { rank: '06', emoji: '⌚', name: 'Whimvoy (Apple Watch)', tag: 'lifestyle', tagLabel: 'Lifestyle', views: '3.9K', barPct: 2.4, barColor: 'purple' },
    { rank: '07', emoji: '🍝', name: 'La Panzeria MTL', tag: 'collab', tagLabel: 'Collab', views: '4.3K', barPct: 2.4, barColor: 'accent' },
    { rank: '08', emoji: '☕', name: 'Tabaq Coffee', tag: 'collab', tagLabel: 'Collab', views: '3.4K', barPct: 1.9, barColor: 'accent' },
    { rank: '09', emoji: '🍱', name: 'Buboy MTL', tag: 'collab', tagLabel: 'Collab', views: '3.3K', barPct: 1.8, barColor: 'accent' },
    { rank: '10', emoji: '🎃', name: 'Quinn Farm', tag: 'collab', tagLabel: 'Collab', views: '3.0K', barPct: 1.6, barColor: 'accent' },
  ],

  /** Content snapshot grid (same order as on screen) */
  snapshotPosts: [
    { icon: '🫐', views: '183K', label: 'Crème Mood pastry reel', tag: 'viral' },
    { icon: '✨', views: '12.8K', label: 'Toronto food dump', tag: 'organic' },
    { icon: '🍹', views: '10.4K', label: 'Amalia', tag: 'collab' },
    { icon: '🫙', views: '8.9K', label: 'Maison Sauvage', tag: 'collab' },
    { icon: '☕', views: '7K', label: 'Café Green Drip', tag: 'organic' },
    { icon: '🐙', views: '5.6K', label: 'Carreras Resto', tag: 'collab' },
    { icon: '🐟', views: '4.6K', label: 'Laptop + drinks vibe', tag: 'organic' },
    { icon: '🍝', views: '4.3K', label: 'La Panzeria MTL', tag: 'collab' },
    { icon: '⌚', views: '3.9K', label: 'Whimvoy watch', tag: 'lifestyle' },
  ],

  nicheCards: [
    { icon: '🍽️', title: 'Food & Dining', desc: 'Restaurants, cafés, pastry, drinks — the core niche with 10+ brand collabs' },
    { icon: '☕', title: 'Café Culture', desc: 'Coffee & beverage content performing organically — Café Green Drip hit 7K unpaid' },
    { icon: '⌚', title: 'Lifestyle & Beauty', desc: 'Cross-niche proven — Whimvoy Apple Watch collab delivered 3.9K to a non-food audience' },
    { icon: '🎉', title: 'Events & Experiences', desc: 'Quinn Farm, escape rooms, holiday events — lifestyle beyond the plate' },
  ],

  audience: {
    gender: { women: 65, men: 35 },
    ages: [
      { label: '13–17', pct: 0.2, highlight: false },
      { label: '18–24', pct: 5.3, highlight: false },
      { label: '25–34', pct: 39.1, highlight: 'accent' },
      { label: '35–44', pct: 31.1, highlight: 'text' },
      { label: '45–54', pct: 15.9, highlight: false },
      { label: '55–64', pct: 6.3, highlight: false },
      { label: '65+', pct: 2.1, highlight: false },
    ],
    ageInsight: '💡 Core: 25–44 (70.2%)',
    ageInsightSub: 'Prime spending age — ideal for F&B, lifestyle & retail brands',
    locations: [
      { flag: '🇨🇦', name: 'Canada', pct: 85.1, highlight: true },
      { flag: '🇺🇸', name: 'United States', pct: 4.3, highlight: false },
      { flag: '🇫🇷', name: 'France', pct: 1.2, highlight: false },
      { flag: '🇧🇩', name: 'Bangladesh', pct: 0.8, highlight: false },
      { flag: '🇮🇳', name: 'India', pct: 0.7, highlight: false },
    ],
    locationBarWidth: [100, 5, 1.4, 0.9, 0.8],
  },

  contact: {
    summary: '85% Canadian · 183K viral reach · 7,698 sends · 12+ verified collabs · Replies within 48 hours',
  },

  callouts: {
    collabPerformance: { title: '📊 Collab posts consistently deliver 3K–10K+ views', sub: 'Reliable brand exposure with every paid partnership — no guesswork' },
    snapshotFoot: { title: '🎯 Consistent 1.5K–12K baseline across all posts', sub: 'Even non-viral content delivers meaningful reach for partner brands' },
    gender: { title: '💡 Female-majority audience', sub: 'Strong fit for F&B, beauty, lifestyle & fashion brands' },
    locations: { title: '✅ 85% Canadian audience', sub: 'Ideal for Canadian & Québec-based brands wanting real local reach' },
  },
};
