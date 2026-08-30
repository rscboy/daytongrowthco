import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  hasSecretProjectsSession,
  secretProjectsConfigured,
  secretProjectsCookie,
} from "@/lib/secret-projects-auth";
import { getSecretProjectSettings, publicSetting, secretProjects } from "@/lib/secret-projects";
import { ProjectManager } from "./project-manager";
import styles from "./secret-projects.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secret Projects",
  description: "Private DaytonGrowthCo project directory.",
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = Promise<{ error?: string }>;

function SignIn({ error, configured }: { error?: string; configured: boolean }) {
  const message = error === "invalid"
    ? "That password was not recognized. Try again."
    : error === "config"
      ? "This portal is not configured yet. Add the two required server settings."
      : "";

  return (
    <main className={styles.loginShell}>
      <section className={styles.loginWindow} aria-labelledby="secret-projects-title">
        <div className={styles.loginBody}>
          <span className={styles.loginMark} aria-hidden="true">D</span>
          <p className={styles.systemLabel}>DAYTONGROWTHCO. / PRIVATE STUDIO</p>
          <h1 id="secret-projects-title">Your projects<br /><em>live here.</em></h1>
          <p className={styles.loginIntro}>Sign in to preview, protect, and share every secret project.</p>
          <form action="/projects/secret-projects/login" method="post" className={styles.loginForm}>
            <label htmlFor="secret-projects-password">Password</label>
            <input
              id="secret-projects-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              disabled={!configured}
            />
            {message ? <p className={styles.formMessage} role="alert">{message}</p> : null}
            <button type="submit" disabled={!configured}>Open project studio <span aria-hidden="true">→</span></button>
          </form>
          <p className={styles.loginFoot}>Private by default · Secure session lasts 14 days</p>
        </div>
      </section>
    </main>
  );
}

async function ProjectDirectory() {
  const settings = await getSecretProjectSettings();
  const managedProjects = secretProjects.map((project) => ({
    ...project,
    setting: publicSetting(settings[project.id]),
  }));
  return <main className={styles.workspace}><ProjectManager initialProjects={managedProjects} /></main>;
}

export default async function SecretProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const authenticated = hasSecretProjectsSession(cookieStore.get(secretProjectsCookie)?.value);
  if (authenticated) return <ProjectDirectory />;

  const params = await searchParams;
  return <SignIn error={params.error} configured={secretProjectsConfigured()} />;
}
