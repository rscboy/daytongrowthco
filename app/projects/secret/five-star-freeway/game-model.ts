export type Profile = {
    name: string;
    reviews: number;
    rating: number;
    goal: number;
    category: string;
    customers: number;
    recency: string;
    responds: boolean;
};
export type Settings = {
    car: number;
    camera: number;
    muted: boolean;
    reducedMotion: boolean;
    quality: string;
    difficulty: string;
    weather: string;
    music: number;
    vehicle: number;
    environment: number;
    ui: number;
    highScore: number;
    lastGoal: number;
};
export const defaults: Settings = { car: 0, camera: 0, muted: false, reducedMotion: false, quality: 'auto', difficulty: 'relaxed', weather: 'sunset', music: 20, vehicle: 45, environment: 30, ui: 40, highScore: 0, lastGoal: 100 };
export const sample: Profile = { name: 'Gem City Roofing', reviews: 34, rating: 4.3, goal: 100, category: 'Roofing', customers: 30, recency: 'month', responds: false };
export const cars = [
    { name: 'Honda Pilot', year: 2005, color: '#326ea1', type: 'suv', length: 4.77, width: 1.96, height: 1.79, cabin: 2.9, acceleration: 6, handling: 7, grip: 8, power: 36, steer: 1.7, pitch: 48, character: 'The steady hand', description: 'A reassuring, upright SUV. Forgiving steering and a planted ride.' },
    { name: 'Subaru Forester', year: 2017, color: '#e8e8de', type: 'crossover', length: 4.61, width: 1.80, height: 1.70, cabin: 2.7, acceleration: 7, handling: 9, grip: 10, power: 40, steer: 2.2, pitch: 62, character: 'All-weather confidence', description: 'Tall glass, compact footprint, and confident wet-weather traction.' },
    { name: 'Volvo 850', year: 1995, color: '#a8242c', type: 'boxsedan', length: 4.66, width: 1.76, height: 1.42, cabin: 2.5, acceleration: 8, handling: 7, grip: 8, power: 43, steer: 1.9, pitch: 70, character: 'Quietly quick', description: 'Long, square shoulders. A durable Swedish sedan with a little surprise.' },
    { name: 'Honda Accord', year: 1996, color: '#191e25', type: 'sedan', length: 4.71, width: 1.78, height: 1.40, cabin: 2.4, acceleration: 7, handling: 9, grip: 8, power: 41, steer: 2.4, pitch: 77, character: 'Find your rhythm', description: 'Low hood, slim lamps, and light, balanced steering through traffic.' },
    { name: 'BMW 328i', year: 1996, color: '#aeb5ba', type: 'sport', length: 4.43, width: 1.70, height: 1.39, cabin: 2.1, acceleration: 10, handling: 10, grip: 6, power: 52, steer: 2.7, pitch: 85, character: 'The driver’s choice', description: 'A long hood and short rear deck. Quick acceleration; respect a wet road.' },
    { name: 'GMC Yukon Denali', year: 2021, color: '#b9232f', type: 'large', length: 5.33, width: 2.06, height: 1.94, cabin: 3.35, acceleration: 9, handling: 5, grip: 8, power: 46, steer: 1.35, pitch: 38, character: 'Command the road', description: 'Broad chrome, tall lamps, and a substantial, powerful ride.' },
] as const;
export const moments = [
    { at: 12, title: 'The job is finished. What happens next?', options: ['Send every eligible customer a simple, honest review request.', 'Ask only customers who promise five stars.', 'Wait a few months, then ask.'], good: 0, lesson: 'Ask all eligible customers at the right moment. Never filter requests by expected rating.', stars: [5, 4, 5], response: false },
    { at: 32, title: 'A delay changes the plan. Your customer is waiting.', options: ['Say nothing until the work is finished.', 'Explain the delay and agree on the next step.', 'Ask for a review before completing the work.'], good: 1, lesson: 'Clear communication protects trust before a small concern becomes a big complaint.', stars: [4, 5], response: false },
    { at: 53, title: 'A critical review arrives. How do you respond?', options: ['Argue in public.', 'Offer a gift if they remove it.', 'Acknowledge the concern calmly and offer to resolve it privately.'], good: 2, lesson: 'A professional owner response shows attentiveness. Do not pressure anyone to change a rating.', stars: [3, 4, 5], response: true },
    { at: 81, title: 'Your customer wants to leave a review.', options: ['Give them one clear, direct review link.', 'Ask them to search through several pages.', 'Offer a discount for five stars.'], good: 0, lesson: 'Make an honest review easy. Incentives and unnecessary steps get in the way.', stars: [5, 4, 4, 5], response: false },
    { at: 108, title: 'Someone has not answered your review request.', options: ['Send daily reminders.', 'Follow up once politely, then leave it with them.', 'Have an employee write a review instead.'], good: 1, lesson: 'A single appropriate follow-up is enough. The decision to review is always the customer’s.', stars: [4, 5], response: false },
    { at: 132, title: 'It has been a quiet month for reviews.', options: ['Buy a few to catch up.', 'Ignore the gap.', 'Check your completed-job process and request honest feedback consistently.'], good: 2, lesson: 'Track activity and build a consistent process. Real feedback takes real customer experiences.', stars: [5, 4, 5], response: true },
];
export const hazards = ['Broken-down review process', 'A wheel has other plans', 'Flying mattress complaint', 'Barrel on a business trip', 'The airborne lawn chair', 'An ambitious trailer', 'Cooler: contents may escape', 'The last-second exit'] as const;
export type Run = {
    time: number;
    speed: number;
    distance: number;
    reviews: number;
    rating: number;
    trust: number;
    momentum: number;
    convoy: number;
    driving: number;
    reputation: number;
    collisions: number;
    successes: number;
    missed: number;
    responses: number;
    route: string;
    destination: string;
    next: string;
    system: boolean | null;
    routeChoices: number;
    lastReview: number;
    message: string;
    hazard: string;
    finished: boolean;
};
export function newRun(p: Profile): Run { return { time: 0, speed: 0, distance: 0, reviews: p.reviews, rating: p.rating, trust: Math.round(Math.min(75, p.rating * 9 + Math.log10(p.reviews + 1) * 8 + (p.responds ? 8 : 0))), momentum: p.recency === 'week' ? 70 : p.recency === 'old' ? 20 : 45, convoy: 0, driving: 0, reputation: 0, collisions: 0, successes: 0, missed: 0, responses: p.responds ? 1 : 0, route: 'I-75 NORTH', destination: 'Toledo', next: 'US 35 EAST • Xenia', system: null, routeChoices: 0, lastReview: 0, message: 'Welcome aboard. W / ↑ to accelerate. A / D to steer.', hazard: '', finished: false }; }
export function validate(p: Profile) { if (!p.name.trim() || p.name.trim().length > 60)
    return 'Enter a business name between 1 and 60 characters.'; if (!Number.isSafeInteger(p.reviews) || p.reviews < 0 || p.reviews > 10000000)
    return 'Use a whole review count from 0 to 10,000,000.'; if (!Number.isFinite(p.rating) || p.rating < 1 || p.rating > 5)
    return 'Your star rating must be between 1.0 and 5.0.'; if (!Number.isSafeInteger(p.goal) || p.goal <= p.reviews || p.goal > 10000001)
    return 'Your review goal must be a whole number greater than your current count (up to 10,000,001).'; return ''; }
export function answerMoment(r: Run, index: number, answer: number): Run { const m = moments[index]; if (answer !== m.good)
    return { ...r, trust: Math.max(0, r.trust - 10), momentum: Math.max(0, r.momentum - 15), reputation: Math.max(0, r.reputation - 100), missed: r.missed + 1, message: m.lesson }; const sum = m.stars.reduce((a, b) => a + b, 0); return { ...r, reviews: r.reviews + m.stars.length, rating: (r.rating * r.reviews + sum) / (r.reviews + m.stars.length), trust: Math.min(100, r.trust + 9), momentum: Math.min(100, r.momentum + 24), convoy: Math.min(12, r.convoy + 2), reputation: r.reputation + 350, successes: r.successes + 1, responses: r.responses + (m.response ? 1 : 0), lastReview: r.time, message: `+${m.stars.length} simulated reviews · ${m.lesson}` }; }
export const score = (r: Run) => Math.round(r.driving + r.reputation + r.trust * 10 + r.convoy * 100);
