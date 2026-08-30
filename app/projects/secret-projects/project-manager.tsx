"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import type {
  SecretProjectDefinition,
  SecretProjectPublicSetting,
} from "@/lib/secret-projects";
import styles from "./secret-projects.module.css";

type ManagedProject = SecretProjectDefinition & { setting: SecretProjectPublicSetting };
type Filter = "all" | "live" | "protected" | "off";

export function ProjectManager({ initialProjects }: { initialProjects: ManagedProject[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const counts = useMemo(() => ({
    live: projects.filter((project) => project.setting.active).length,
    protected: projects.filter((project) => project.setting.passwordEnabled).length,
  }), [projects]);

  const visibleProjects = useMemo(() => projects.filter((project) => {
    const matchesQuery = `${project.title} ${project.description} ${project.type}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "all"
      || (filter === "live" && project.setting.active)
      || (filter === "protected" && project.setting.passwordEnabled)
      || (filter === "off" && !project.setting.active);
    return matchesQuery && matchesFilter;
  }), [filter, projects, query]);

  async function updateProject(id: string, update: Record<string, boolean | string>) {
    setBusy(id);
    setNotice(null);
    try {
      const response = await fetch("/projects/secret-projects/api", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, ...update }),
      });
      const result = await response.json() as { setting?: SecretProjectPublicSetting; error?: string };
      if (!response.ok || !result.setting) throw new Error(result.error || "The project could not be updated.");
      setProjects((current) => current.map((project) => project.id === id
        ? { ...project, setting: result.setting as SecretProjectPublicSetting }
        : project));
      setNotice({ kind: "ok", text: "Project settings saved." });
      return true;
    } catch (error) {
      setNotice({ kind: "error", text: error instanceof Error ? error.message : "The project could not be updated." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function copyShareLink(project: ManagedProject) {
    const shareUrl = `${window.location.origin}/projects/secret-projects/share/${project.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice({ kind: "ok", text: `Share link copied for ${project.title}.` });
    } catch {
      setNotice({ kind: "error", text: "Copy was blocked by the browser. Open the share link and copy it from the address bar." });
    }
  }

  return (
    <div className={styles.manager}>
      <header className={styles.managerHeader}>
        <div className={styles.brandLockup}>
          <span className={styles.brandGlyph} aria-hidden="true">D</span>
          <span><strong>Secret Projects</strong><small>DaytonGrowthCo. studio</small></span>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.secureLabel}><ShieldCheck size={15} /> Private workspace</span>
          <form action="/projects/secret-projects/logout" method="post">
            <button type="submit" className={styles.textButton}>Sign out</button>
          </form>
        </div>
      </header>

      <section className={styles.managerHero}>
        <div>
          <p className={styles.eyebrow}>Project control room</p>
          <h1>Everything you’ve built,<br /><em>in one view.</em></h1>
          <p className={styles.heroCopy}>Preview every private project, choose what’s shareable, and give each link its own password.</p>
        </div>
        <div className={styles.heroStats} aria-label="Project summary">
          <span><strong>{projects.length}</strong><small>Total</small></span>
          <span><strong>{counts.live}</strong><small>Sharing</small></span>
          <span><strong>{counts.protected}</strong><small>Protected</small></span>
        </div>
      </section>

      <section className={styles.managerTools} aria-label="Project filters">
        <div className={styles.filterTabs}>
          {(["all", "live", "protected", "off"] as const).map((value) => (
            <button key={value} type="button" className={filter === value ? styles.filterActive : ""} onClick={() => setFilter(value)}>
              {value === "all" ? "All projects" : value === "live" ? "Sharing" : value === "protected" ? "Password protected" : "Off"}
            </button>
          ))}
        </div>
        <label className={styles.searchField}>
          <Search size={16} aria-hidden="true" />
          <span className={styles.srOnly}>Search projects</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project" />
        </label>
      </section>

      {notice ? (
        <div className={`${styles.notice} ${notice.kind === "error" ? styles.noticeError : ""}`} role="status">
          {notice.kind === "ok" ? <Check size={16} /> : <KeyRound size={16} />}{notice.text}
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message">×</button>
        </div>
      ) : null}

      <section className={styles.projectGrid} aria-label="Secret projects">
        {visibleProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            busy={busy === project.id}
            onUpdate={updateProject}
            onCopy={copyShareLink}
          />
        ))}
      </section>

      {visibleProjects.length === 0 ? (
        <div className={styles.emptyState}><Search size={22} /><strong>No projects match that view.</strong><span>Try another filter or search.</span></div>
      ) : null}

      <footer className={styles.managerFooter}>
        <span><ShieldCheck size={14} /> Owner preview stays available even when sharing is off.</span>
        <span>{projects.length} projects in the private studio</span>
      </footer>
    </div>
  );
}

function ProjectCard({
  project,
  busy,
  onUpdate,
  onCopy,
}: {
  project: ManagedProject;
  busy: boolean;
  onUpdate: (id: string, update: Record<string, boolean | string>) => Promise<boolean>;
  onCopy: (project: ManagedProject) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const passwordRef = useRef<HTMLInputElement>(null);
  const sharePath = `/projects/secret-projects/share/${project.id}`;

  async function togglePassword() {
    if (!project.setting.passwordEnabled && !project.setting.hasPassword) {
      passwordRef.current?.focus();
      return;
    }
    await onUpdate(project.id, { passwordEnabled: !project.setting.passwordEnabled });
  }

  async function savePassword() {
    if (!password.trim()) return;
    const saved = await onUpdate(project.id, { password, passwordEnabled: true });
    if (saved) setPassword("");
  }

  return (
    <article className={styles.projectCard} style={{ "--project-accent": project.accent } as React.CSSProperties}>
      <div className={styles.previewFrame}>
        <div className={styles.previewChrome}>
          <span className={styles.previewDots}><i /><i /><i /></span>
          <span className={styles.previewAddress}>{project.href.replace("/projects/secret/", "secret/")}</span>
          <button type="button" onClick={() => setPreviewKey((value) => value + 1)} aria-label={`Refresh ${project.title} preview`}><RefreshCw size={13} /></button>
        </div>
        <div className={styles.previewViewport}>
          <iframe key={previewKey} src={project.href} title={`${project.title} live preview`} loading="lazy" tabIndex={-1} />
          <a href={project.href} target="_blank" rel="noreferrer" className={styles.previewOpen}>Open preview <ArrowUpRight size={14} /></a>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTitleRow}>
          <div>
            <span className={styles.projectType}>{project.type}</span>
            <h2>{project.title}</h2>
          </div>
          <button
            type="button"
            className={`${styles.powerToggle} ${project.setting.active ? styles.powerOn : ""}`}
            onClick={() => onUpdate(project.id, { active: !project.setting.active })}
            disabled={busy}
            aria-pressed={project.setting.active}
          >
            <Power size={14} /> {project.setting.active ? "On" : "Off"}
          </button>
        </div>
        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.accessPanel}>
          <div className={styles.accessHeading}>
            <span><LockKeyhole size={15} /><strong>Visitor password</strong></span>
            <button
              type="button"
              className={`${styles.switch} ${project.setting.passwordEnabled ? styles.switchOn : ""}`}
              onClick={togglePassword}
              disabled={busy}
              role="switch"
              aria-checked={project.setting.passwordEnabled}
              aria-label={`Password protection for ${project.title}`}
            ><i /></button>
          </div>
          <div className={styles.passwordRow}>
            <label>
              <span className={styles.srOnly}>New password for {project.title}</span>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={project.setting.hasPassword ? "••••••••••••" : "Create a password"}
                autoComplete="new-password"
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </label>
            <button type="button" className={styles.savePassword} onClick={savePassword} disabled={busy || password.trim().length < 6}>
              {project.setting.hasPassword ? "Update" : "Set"}
            </button>
          </div>
        </div>

        <div className={styles.shareRow}>
          <div className={styles.shareLink} aria-label="Share link">
            <ExternalLink size={14} />
            <span>{sharePath}</span>
          </div>
          <button type="button" onClick={() => onCopy(project)} disabled={!project.setting.active} title={project.setting.active ? "Copy share link" : "Turn sharing on first"}>
            <Copy size={14} /> Copy
          </button>
        </div>
      </div>
      {busy ? <span className={styles.savingState}><RefreshCw size={14} /> Saving</span> : null}
    </article>
  );
}
