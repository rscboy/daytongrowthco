import type { Metadata } from 'next';
import { requireSecretProjectAccess } from '@/lib/secret-project-access';
import Freeway from './freeway';
export const metadata: Metadata = { title: 'Five-Star Freeway | DaytonGrowthCo', description: 'The Dayton Reputation Race. A playable 3D driving experience.', robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } } };
export default async function Page() { await requireSecretProjectAccess('five_star_freeway'); return <Freeway />; }
