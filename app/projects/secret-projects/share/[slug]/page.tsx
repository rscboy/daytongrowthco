import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, KeyRound, LockKeyhole, Power } from "lucide-react";
import { getSecretProject, getSecretProjectSetting } from "@/lib/secret-projects";
import styles from "./share.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Project Access",
  description: "Secure access to a shared DaytonGrowthCo. project.",
  robots: { index: false, follow: false, nocache: true },
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function SharedProjectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const project = getSecretProject(slug);
  if (!project) redirect("/projects/secret-projects");

  const setting = await getSecretProjectSetting(slug);
  if (setting.active && !setting.passwordEnabled) redirect(project.href);
  const { error } = await searchParams;

  return (
    <main className={styles.shareShell} style={{ "--accent": project.accent } as React.CSSProperties}>
      <section className={styles.accessCard}>
        <div className={styles.projectPanel}>
          <a href="https://www.daytongrowth.co" className={styles.brand}><span>D</span> DaytonGrowthCo.</a>
          <div className={styles.projectIdentity}>
            <span className={styles.projectType}>{project.type} · Private project</span>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <p className={styles.sharedNote}>Shared privately from the DaytonGrowthCo. project studio.</p>
        </div>

        <div className={styles.formPanel}>
          {setting.active ? (
            <>
              <span className={styles.accessIcon}><LockKeyhole size={21} /></span>
              <p className={styles.kicker}>Password protected</p>
              <h2>Enter the project password.</h2>
              <p className={styles.instructions}>The person who sent this link can give you the password.</p>
              <form action={`/projects/secret-projects/share/${slug}/login`} method="post" className={styles.passwordForm}>
                <label htmlFor="project-password">Password</label>
                <input id="project-password" name="password" type="password" autoComplete="current-password" required autoFocus />
                {error === "invalid" ? <p className={styles.formError} role="alert">That password isn’t right. Check it and try again.</p> : null}
                <button type="submit">Open project <KeyRound size={15} /></button>
              </form>
            </>
          ) : (
            <>
              <span className={styles.accessIcon}><Power size={21} /></span>
              <p className={styles.kicker}>Sharing is off</p>
              <h2>This project isn’t available right now.</h2>
              <p className={styles.instructions}>Ask the person who shared it to turn the link back on.</p>
              <a href="https://www.daytongrowth.co" className={styles.backLink}><ArrowLeft size={14} /> Go to DaytonGrowthCo.</a>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
