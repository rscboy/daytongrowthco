import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  hasSecretProjectsSession,
  secretProjectsConfigured,
  secretProjectsCookie,
} from "@/lib/secret-projects-auth";
import styles from "./secret-projects.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secret Projects",
  description: "Private DaytonGrowthCo project directory.",
  robots: { index: false, follow: false, nocache: true },
};

const projects = [
  {
    title: "Sammy's Recipe Book",
    description: "Family recipes, baking notes, ingredients, and step-by-step cooking instructions.",
    href: "/projects/secret/recipes_for_benny/",
    type: "Reference",
    status: "Ready",
    mark: "RB",
  },
  {
    title: "TAA ROI Calculator",
    description: "The original Travel Agent Academy calculator for lead economics, payback, and target ROI.",
    href: "/projects/secret/taa_roi_calculator/",
    type: "Calculator",
    status: "Ready",
    mark: "R1",
  },
  {
    title: "TAA Annual Profit Planner",
    description: "Annual ad-spend, commission, operating-cost, and projected-profit planning.",
    href: "/projects/secret/taa_roi_calculator/v2/",
    type: "Calculator",
    status: "Ready",
    mark: "R2",
  },
  {
    title: "TAA Planning-Fee Planner",
    description: "Planning-fee income and advertising scenarios for travel advisors.",
    href: "/projects/secret/taa_roi_calculator/v3/",
    type: "Calculator",
    status: "Ready",
    mark: "R3",
  },
  {
    title: "HVAC Profit & Outreach Calculator",
    description: "Reverse-funnel planning and forward forecasting for the HVAC Google Review Growth Program.",
    href: "/projects/secret/profit-calculator/",
    type: "Calculator",
    status: "Ready",
    mark: "HV",
  },
] as const;

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
        <div className={styles.windowBar}>
          <span className={styles.windowIcon} aria-hidden="true">D</span>
          <span>Private workspace</span>
        </div>
        <div className={styles.loginBody}>
          <p className={styles.systemLabel}>DAYTONGROWTHCO / PROJECT ACCESS</p>
          <h1 id="secret-projects-title">Secret Projects</h1>
          <p className={styles.loginIntro}>Enter your password to open the project directory.</p>
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
            <button type="submit" disabled={!configured}>Sign in</button>
          </form>
          <p className={styles.loginFoot}>Authorized access only · Session lasts 14 days</p>
        </div>
      </section>
    </main>
  );
}

function ProjectDirectory() {
  return (
    <main className={styles.workspace}>
      <header className={styles.commandBar}>
        <div className={styles.workspaceIdentity}>
          <span className={styles.workspaceMark} aria-hidden="true">DGC</span>
          <div>
            <strong>Secret Projects</strong>
            <span>Private workspace</span>
          </div>
        </div>
        <form action="/projects/secret-projects/logout" method="post">
          <button type="submit" className={styles.signOut}>Sign out</button>
        </form>
      </header>

      <div className={styles.workspaceBody}>
        <aside className={styles.sidebar} aria-label="Project navigation">
          <span className={styles.sidebarTitle}>Workspace</span>
          <a href="#all-projects" className={styles.sidebarActive}>All projects <b>{projects.length}</b></a>
          <span>Calculators <b>4</b></span>
          <span>Reference <b>1</b></span>
        </aside>

        <section className={styles.directory} id="all-projects" aria-labelledby="directory-title">
          <div className={styles.directoryHeading}>
            <div>
              <p>Project directory</p>
              <h1 id="directory-title">All projects</h1>
            </div>
            <span>Last reviewed · August 2026</span>
          </div>

          <div className={styles.columnLabels} aria-hidden="true">
            <span>Project</span><span>Type</span><span>Status</span><span>Open</span>
          </div>

          <div className={styles.projectList}>
            {projects.map((project) => (
              <Link href={project.href} className={styles.projectRow} key={project.href}>
                <span className={styles.projectMark} aria-hidden="true">{project.mark}</span>
                <span className={styles.projectCopy}>
                  <strong>{project.title}</strong>
                  <span>{project.description}</span>
                </span>
                <span className={styles.projectType}>{project.type}</span>
                <span className={styles.projectStatus}><i aria-hidden="true" />{project.status}</span>
                <span className={styles.openProject}>Open <b aria-hidden="true">›</b></span>
              </Link>
            ))}
          </div>

          <footer className={styles.directoryFooter}>
            <span>{projects.length} projects</span>
            <span>Secure session active</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

export default async function SecretProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const cookieStore = await cookies();
  const authenticated = hasSecretProjectsSession(cookieStore.get(secretProjectsCookie)?.value);
  if (authenticated) return <ProjectDirectory />;

  const params = await searchParams;
  return <SignIn error={params.error} configured={secretProjectsConfigured()} />;
}
