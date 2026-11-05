"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  FileCog,
  FileText,
  FolderArchive,
  Globe,
  Info,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { useRecentTools } from "@/hooks/useRecentTools";
import {
  ActionButton,
  Callout,
  Chip,
  FaqAccordion,
  Field,
  Hero,
  SectionCard,
  Segmented,
  ToggleRow,
  fieldClass,
} from "../_shared/toolkit/ToolKit";
import {
  copyText,
  downloadBlob,
  downloadText,
  readStored,
  uid,
  writeStored,
} from "../_shared/toolkit/toolUtils";
import {
  CONFIG_FAQS,
  CONFIG_STORAGE_KEY,
  CONFIG_TABS,
  GITIGNORE_GROUPS,
  HTACCESS_OPTIONS,
  META_GROUPS,
  ROBOTS_PRESETS,
  buildAllFiles,
  buildOutput,
  countLines,
  createDemoConfigState,
  createEmptyConfigState,
} from "./configGeneratorData";

const TOOL_META = {
  title: ".gitignore, robots.txt, Meta Tag & .htaccess Generator",
  link: "/tools/config-file-generator",
  icon: "FileCog",
};
const TONE = "indigo";

const TAB_ICONS = {
  gitignore: Code2,
  robots: Bot,
  meta: Globe,
  htaccess: ShieldCheck,
};

export default function ConfigFileGenerator() {
  const { addRecentTool } = useRecentTools();
  const [state, setState] = useState(() => createEmptyConfigState());
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [presetName, setPresetName] = useState("");
  const outputRef = useRef(null);

  useEffect(() => {
    addRecentTool(TOOL_META);
    const timer = window.setTimeout(() => {
      const saved = readStored(CONFIG_STORAGE_KEY, null);
      if (saved && typeof saved === "object") {
        const empty = createEmptyConfigState();
        setState({
          ...empty,
          ...saved,
          gitignore: { ...empty.gitignore, ...(saved.gitignore || {}) },
          robots: { ...empty.robots, ...(saved.robots || {}) },
          meta: {
            ...empty.meta,
            ...(saved.meta || {}),
            groups: { ...empty.meta.groups, ...((saved.meta || {}).groups || {}) },
          },
          htaccess: { ...empty.htaccess, ...(saved.htaccess || {}) },
          presets: Array.isArray(saved.presets) ? saved.presets : [],
        });
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [addRecentTool]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = window.setTimeout(() => writeStored(CONFIG_STORAGE_KEY, state), 500);
    return () => window.clearTimeout(timer);
  }, [state, hydrated]);

  const updateTabState = (tab, patch) =>
    setState((current) => ({ ...current, [tab]: { ...current[tab], ...patch } }));

  const activeTab = CONFIG_TABS.find((tab) => tab.value === state.tab) || CONFIG_TABS[0];
  const output = useMemo(() => buildOutput(state.tab, state), [state]);
  const allFiles = useMemo(() => buildAllFiles(state), [state]);
  const lineCount = countLines(output);

  const selectedGitignoreCount = state.gitignore.selected.length;

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return GITIGNORE_GROUPS;
    return GITIGNORE_GROUPS.map((group) => {
      const groupMatch = group.label.toLowerCase().includes(query);
      const options = groupMatch
        ? group.options
        : group.options.filter(
            (option) =>
              option.label.toLowerCase().includes(query) ||
              option.lines.some((line) => line.toLowerCase().includes(query)),
          );
      return { ...group, options };
    }).filter((group) => group.options.length > 0);
  }, [search]);

  const toggleGitignoreOption = (id) => {
    setState((current) => {
      const selected = current.gitignore.selected.includes(id)
        ? current.gitignore.selected.filter((item) => item !== id)
        : [...current.gitignore.selected, id];
      return { ...current, gitignore: { ...current.gitignore, selected } };
    });
  };

  const selectAllInGroup = (group) => {
    setState((current) => {
      const ids = group.options.map((option) => option.id);
      const allSelected = ids.every((id) => current.gitignore.selected.includes(id));
      const selected = allSelected
        ? current.gitignore.selected.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current.gitignore.selected, ...ids]));
      return { ...current, gitignore: { ...current.gitignore, selected } };
    });
  };

  const toggleMetaGroup = (value) => {
    updateTabState("meta", {
      groups: { ...state.meta.groups, [value]: !state.meta.groups[value] },
    });
  };

  const copyOutput = async () => {
    if (!output.trim()) {
      toast.error("Nothing to copy yet — choose a few options first.");
      return;
    }
    const ok = await copyText(output);
    if (ok) toast.success(`${activeTab.file} copied`);
    else toast.error("Could not copy the file");
  };

  const downloadOutput = () => {
    if (!output.trim()) {
      toast.error("Nothing to download yet.");
      return;
    }
    downloadText(output, activeTab.file, "text/plain;charset=utf-8");
    toast.success(`${activeTab.file} downloaded`);
  };

  const downloadZip = async () => {
    const populated = Object.entries(allFiles).filter(([, content]) => content.trim());
    if (!populated.length) {
      toast.error("Generate at least one file before downloading the bundle.");
      return;
    }
    try {
      const zip = new JSZip();
      populated.forEach(([name, content]) => zip.file(name, content));
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "toolstrek-config-bundle.zip");
      toast.success(`${populated.length} files bundled into a ZIP`);
    } catch {
      toast.error("Could not build the ZIP archive.");
    }
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      toast.error("Give the preset a name first.");
      return;
    }
    const preset = {
      id: uid("preset"),
      name: presetName.trim(),
      tab: state.tab,
      payload: JSON.parse(JSON.stringify(state[state.tab])),
      createdAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, presets: [...current.presets, preset] }));
    setPresetName("");
    toast.success("Preset saved in this browser");
  };

  const applyPreset = (preset) => {
    setState((current) => ({
      ...current,
      tab: preset.tab,
      [preset.tab]: JSON.parse(JSON.stringify(preset.payload)),
    }));
    toast.success(`Applied “${preset.name}”`);
  };

  const deletePreset = (id) => {
    setState((current) => ({ ...current, presets: current.presets.filter((preset) => preset.id !== id) }));
  };

  const loadDemo = () => {
    setState((current) => ({ ...createDemoConfigState(), presets: current.presets }));
    toast.success("Demo configuration loaded — edit every option");
  };

  const clearAll = () => {
    setState((current) => ({ ...createEmptyConfigState(), presets: current.presets }));
    toast.success("Configuration cleared — presets kept");
  };

  const checks = useMemo(() => {
    const items = [];
    if (state.tab === "gitignore") {
      if (!selectedGitignoreCount && !state.gitignore.custom.trim()) {
        items.push({ tone: "info", text: "Select at least one group, or add custom rules, to generate a file." });
      }
      if (selectedGitignoreCount && !state.gitignore.selected.includes("node-deps") && !state.gitignore.selected.includes("python-core")) {
        items.push({ tone: "info", text: "No dependency folder is ignored yet. Add Node.js or Python rules if you use them." });
      }
      items.push({ tone: "info", text: "Already-committed files stay tracked. Use git rm --cached after updating .gitignore." });
    }

    if (state.tab === "robots") {
      if (state.robots.sitemap.trim() && !/^https?:\/\//i.test(state.robots.sitemap.trim())) {
        items.push({ tone: "warning", text: "The sitemap URL should be absolute, starting with https://." });
      }
      if (state.robots.preset === "block") {
        items.push({ tone: "warning", text: "This blocks every crawler — only use it on private or staging sites." });
      }
      if (state.robots.preset === "custom" && !state.robots.disallow.trim()) {
        items.push({ tone: "info", text: "Nothing is disallowed. Add private paths such as /admin/ or /api/." });
      }
      items.push({ tone: "info", text: "robots.txt is a request, not access control. Protect private data with authentication." });
    }

    if (state.tab === "meta") {
      if (!state.meta.title.trim()) {
        items.push({ tone: "warning", text: "A unique page title is the single most important on-page tag." });
      } else if (state.meta.title.length > 60) {
        items.push({ tone: "warning", text: `The title is ${state.meta.title.length} characters — search results may truncate around 60.` });
      }
      if (!state.meta.description.trim()) {
        items.push({ tone: "info", text: "Add a description around 120–160 characters to control the search snippet." });
      } else if (state.meta.description.length > 160) {
        items.push({ tone: "warning", text: `The description is ${state.meta.description.length} characters — aim for 160 or fewer.` });
      }
      if (state.meta.canonical.trim() && !/^https?:\/\//i.test(state.meta.canonical.trim())) {
        items.push({ tone: "warning", text: "The canonical URL should be absolute, including https://." });
      }
    }

    if (state.tab === "htaccess") {
      if (state.htaccess.hsts && !state.htaccess.https) {
        items.push({ tone: "warning", text: "HSTS without the HTTPS redirect can lock visitors out. Enable Force HTTPS first." });
      }
      if (state.htaccess.maintenance) {
        items.push({ tone: "warning", text: "Maintenance mode returns a 503 to every visitor outside the allowed IP." });
      }
      if (state.htaccess.hotlink) {
        items.push({ tone: "info", text: "Replace yourdomain.com in the hotlink rule with your real domain." });
      }
      items.push({ tone: "info", text: ".htaccess is Apache and LiteSpeed only. Nginx does not read it." });
    }

    return items;
  }, [state, selectedGitignoreCount]);

  return (
    <div className="config-generator space-y-6 pb-10">
      <style>{`.config-generator .text-xs { font-size: 13px !important; }`}</style>

      <Hero
        tone={TONE}
        eyebrow="Deployment housekeeping"
        icon={FileCog}
        title=".gitignore, robots.txt, Meta Tag & .htaccess Generator"
        description="Build four essential project files from selectable, explained options. Choose framework groups, crawl rules, social tags and server hardening, then copy, download or export all four as a ZIP — entirely in your browser."
        badges={["Blank by default", "Four file types", "Custom presets", "ZIP bundle"]}
      />

      <Segmented
        tone={TONE}
        value={state.tab}
        options={CONFIG_TABS.map((tab) => ({
          value: tab.value,
          label: tab.label,
          icon: React.createElement(TAB_ICONS[tab.value], { className: "h-4 w-4" }),
        }))}
        onChange={(value) => setState((current) => ({ ...current, tab: value }))}
        columns={4}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          {state.tab === "gitignore" && (
            <SectionCard
              icon={Code2}
              tone={TONE}
              title="Choose what Git should ignore"
              description="Every group is opt-in. Hover a group to see what it covers, then tick the stacks you actually use."
              actions={<Chip tone={TONE}>{selectedGitignoreCount} selected</Chip>}
            >
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search groups, frameworks or file names…"
                      className={`${fieldClass(false, TONE)} pl-9`}
                      aria-label="Search gitignore options"
                    />
                  </div>
                  <ActionButton
                    tone={TONE}
                    icon={selectedGitignoreCount ? Trash2 : Plus}
                    onClick={() =>
                      setState((current) => ({
                        ...current,
                        gitignore: {
                          ...current.gitignore,
                          selected: selectedGitignoreCount
                            ? []
                            : GITIGNORE_GROUPS.flatMap((group) => group.options.map((option) => option.id)),
                        },
                      }))
                    }
                  >
                    {selectedGitignoreCount ? "Clear selection" : "Select everything"}
                  </ActionButton>
                </div>

                <Field label="Header comment" hint="Optional. Added to the top of the file.">
                  <input
                    type="text"
                    value={state.gitignore.header}
                    onChange={(event) => updateTabState("gitignore", { header: event.target.value })}
                    placeholder="e.g. Project name — generated .gitignore"
                    className={fieldClass(false, TONE)}
                  />
                </Field>

                <div className="space-y-3">
                  {filteredGroups.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 p-4 text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      No groups match “{search}”.
                    </p>
                  ) : (
                    filteredGroups.map((group) => {
                      const groupSelected = group.options.filter((option) =>
                        state.gitignore.selected.includes(option.id),
                      ).length;
                      return (
                        <div
                          key={group.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/20"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{group.label}</p>
                              <p className="text-[13px] text-slate-500 dark:text-slate-400">{group.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => selectAllInGroup(group)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-[13px] font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                            >
                              {groupSelected === group.options.length ? "Unselect group" : "Select group"}
                            </button>
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {group.options.map((option) => {
                              const active = state.gitignore.selected.includes(option.id);
                              return (
                                <label
                                  key={option.id}
                                  className={`flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 transition ${
                                    active
                                      ? "border-indigo-300 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40"
                                      : "border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-indigo-800"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={active}
                                    onChange={() => toggleGitignoreOption(option.id)}
                                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
                                  />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                                      {option.label}
                                    </span>
                                    <span className="block truncate font-mono text-[13px] text-slate-400 dark:text-slate-500">
                                      {option.lines.slice(0, 2).join(" · ")}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Field
                  label="Custom rules"
                  hint="One pattern per line. Comments starting with # are kept as written."
                >
                  <textarea
                    rows={4}
                    value={state.gitignore.custom}
                    onChange={(event) => updateTabState("gitignore", { custom: event.target.value })}
                    placeholder={"# Local uploads\n/uploads/\n*.secret"}
                    className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                  />
                </Field>
              </div>
            </SectionCard>
          )}

          {state.tab === "robots" && (
            <SectionCard
              icon={Bot}
              tone={TONE}
              title="Crawler rules"
              description="Start from a preset or write precise allow and disallow paths. One path per line."
              actions={<Chip tone={TONE}>{state.robots.preset}</Chip>}
            >
              <div className="space-y-5">
                <Segmented
                  label="Crawl policy"
                  tone={TONE}
                  value={state.robots.preset}
                  options={ROBOTS_PRESETS}
                  onChange={(value) => updateTabState("robots", { preset: value })}
                  columns={3}
                />

                {state.robots.preset === "custom" && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="User-agent" hint="Use * for all crawlers, or a specific bot name.">
                        <input
                          type="text"
                          value={state.robots.userAgent}
                          onChange={(event) => updateTabState("robots", { userAgent: event.target.value })}
                          placeholder="*"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Crawl delay (seconds)" hint="Optional and honoured only by some crawlers.">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={state.robots.crawlDelay}
                          onChange={(event) => updateTabState("robots", { crawlDelay: event.target.value })}
                          placeholder="e.g. 5"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Allow paths" hint="A more specific allow can override a broader disallow.">
                        <textarea
                          rows={4}
                          value={state.robots.allow}
                          onChange={(event) => updateTabState("robots", { allow: event.target.value })}
                          placeholder={"/\n/public/"}
                          className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                        />
                      </Field>
                      <Field label="Disallow paths" hint="Paths begin with a slash. Do not use this for secrets.">
                        <textarea
                          rows={4}
                          value={state.robots.disallow}
                          onChange={(event) => updateTabState("robots", { disallow: event.target.value })}
                          placeholder={"/admin/\n/api/\n/checkout/"}
                          className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                        />
                      </Field>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Sitemap URL" hint="Absolute URL, usually https://domain.com/sitemap.xml">
                    <input
                      type="url"
                      value={state.robots.sitemap}
                      onChange={(event) => updateTabState("robots", { sitemap: event.target.value })}
                      placeholder="https://example.com/sitemap.xml"
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                  <Field label="Host (optional)" hint="Yandex-specific directive. Leave blank for most sites.">
                    <input
                      type="text"
                      value={state.robots.host}
                      onChange={(event) => updateTabState("robots", { host: event.target.value })}
                      placeholder="example.com"
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                </div>

                <Field label="Custom directives" hint="Appended verbatim. Useful for per-bot blocks such as GPTBot.">
                  <textarea
                    rows={4}
                    value={state.robots.custom}
                    onChange={(event) => updateTabState("robots", { custom: event.target.value })}
                    placeholder={"User-agent: GPTBot\nDisallow: /"}
                    className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                  />
                </Field>

                <Callout tone="amber" variant="warning" title="Robots are not security">
                  A crawler can ignore robots.txt. Use authentication, signed URLs or server rules to protect private
                  pages, and add noindex if a page must not appear in search.
                </Callout>
              </div>
            </SectionCard>
          )}

          {state.tab === "meta" && (
            <SectionCard
              icon={Globe}
              tone={TONE}
              title="Search and social metadata"
              description="Fill in only what you need. Empty fields are skipped rather than emitted as blanks."
              actions={<Chip tone={TONE}>{Object.values(state.meta.groups).filter(Boolean).length} groups</Chip>}
            >
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  {META_GROUPS.map((group) => (
                    <button
                      key={group.value}
                      type="button"
                      onClick={() => toggleMetaGroup(group.value)}
                      aria-pressed={state.meta.groups[group.value]}
                      className={`rounded-full border px-3 py-1.5 text-sm font-bold transition ${
                        state.meta.groups[group.value]
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "border-slate-200 text-slate-500 hover:border-indigo-200 dark:border-slate-700 dark:text-slate-400"
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>

                {state.meta.groups.basic && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label="Page title"
                        hint={`${state.meta.title.length}/60 characters — front-load the specific phrase.`}
                      >
                        <input
                          type="text"
                          value={state.meta.title}
                          onChange={(event) => updateTabState("meta", { title: event.target.value })}
                          placeholder="e.g. ToolsTrek — 148 free browser tools"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Canonical URL" hint="Absolute URL of the preferred version of this page.">
                        <input
                          type="url"
                          value={state.meta.canonical}
                          onChange={(event) => updateTabState("meta", { canonical: event.target.value })}
                          placeholder="https://example.com/page"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Meta description"
                      hint={`${state.meta.description.length}/160 characters — write it as a reason to click.`}
                    >
                      <textarea
                        rows={3}
                        value={state.meta.description}
                        onChange={(event) => updateTabState("meta", { description: event.target.value })}
                        placeholder="A concise summary of the page that earns the click."
                        className={fieldClass(false, TONE)}
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field label="Keywords" hint="Low SEO weight, but harmless.">
                        <input
                          type="text"
                          value={state.meta.keywords}
                          onChange={(event) => updateTabState("meta", { keywords: event.target.value })}
                          placeholder="online tools, calculators"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Author">
                        <input
                          type="text"
                          value={state.meta.author}
                          onChange={(event) => updateTabState("meta", { author: event.target.value })}
                          placeholder="e.g. ToolsTrek"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="Robots directive">
                        <select
                          value={state.meta.robots}
                          onChange={(event) => updateTabState("meta", { robots: event.target.value })}
                          className={fieldClass(false, TONE)}
                        >
                          <option value="index, follow">index, follow</option>
                          <option value="index, follow, max-image-preview:large">index, follow, large previews</option>
                          <option value="noindex, follow">noindex, follow</option>
                          <option value="noindex, nofollow">noindex, nofollow</option>
                          <option value="noarchive">noarchive</option>
                          <option value="noindex, nofollow, noarchive">noindex, nofollow, noarchive</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {state.meta.groups.openGraph && (
                  <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <p className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Open Graph</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="og:type">
                        <select
                          value={state.meta.ogType}
                          onChange={(event) => updateTabState("meta", { ogType: event.target.value })}
                          className={fieldClass(false, TONE)}
                        >
                          <option value="website">website</option>
                          <option value="article">article</option>
                          <option value="profile">profile</option>
                          <option value="product">product</option>
                          <option value="video.other">video.other</option>
                        </select>
                      </Field>
                      <Field label="og:site_name">
                        <input
                          type="text"
                          value={state.meta.ogSiteName}
                          onChange={(event) => updateTabState("meta", { ogSiteName: event.target.value })}
                          placeholder="e.g. ToolsTrek"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="og:title" hint="Defaults to the page title when blank.">
                        <input
                          type="text"
                          value={state.meta.ogTitle}
                          onChange={(event) => updateTabState("meta", { ogTitle: event.target.value })}
                          placeholder="Social sharing title"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="og:image" hint="1200 × 630 px works across most networks.">
                        <input
                          type="url"
                          value={state.meta.ogImage}
                          onChange={(event) => updateTabState("meta", { ogImage: event.target.value })}
                          placeholder="https://example.com/social.png"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="og:locale">
                        <input
                          type="text"
                          value={state.meta.ogLocale}
                          onChange={(event) => updateTabState("meta", { ogLocale: event.target.value })}
                          placeholder="en_US"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="og:description" hint="Defaults to the meta description when blank.">
                        <input
                          type="text"
                          value={state.meta.ogDescription}
                          onChange={(event) => updateTabState("meta", { ogDescription: event.target.value })}
                          placeholder="Social sharing description"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {state.meta.groups.twitter && (
                  <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                    <p className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">Twitter / X</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Field label="Card type">
                        <select
                          value={state.meta.twitterCard}
                          onChange={(event) => updateTabState("meta", { twitterCard: event.target.value })}
                          className={fieldClass(false, TONE)}
                        >
                          <option value="summary_large_image">summary_large_image</option>
                          <option value="summary">summary</option>
                          <option value="player">player</option>
                          <option value="app">app</option>
                        </select>
                      </Field>
                      <Field label="twitter:site">
                        <input
                          type="text"
                          value={state.meta.twitterSite}
                          onChange={(event) => updateTabState("meta", { twitterSite: event.target.value })}
                          placeholder="@yourbrand"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                      <Field label="twitter:creator">
                        <input
                          type="text"
                          value={state.meta.twitterCreator}
                          onChange={(event) => updateTabState("meta", { twitterCreator: event.target.value })}
                          placeholder="@author"
                          className={fieldClass(false, TONE)}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {state.meta.groups.icons && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Favicon path">
                      <input
                        type="text"
                        value={state.meta.favicon}
                        onChange={(event) => updateTabState("meta", { favicon: event.target.value })}
                        placeholder="/favicon.ico"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Apple touch icon">
                      <input
                        type="text"
                        value={state.meta.appleIcon}
                        onChange={(event) => updateTabState("meta", { appleIcon: event.target.value })}
                        placeholder="/apple-touch-icon.png"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Web manifest">
                      <input
                        type="text"
                        value={state.meta.manifest}
                        onChange={(event) => updateTabState("meta", { manifest: event.target.value })}
                        placeholder="/site.webmanifest"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="Theme colour">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={state.meta.themeColor}
                          onChange={(event) => updateTabState("meta", { themeColor: event.target.value })}
                          className="h-10 w-12 cursor-pointer rounded border border-slate-200 bg-white p-0.5 dark:border-slate-700"
                          aria-label="Theme colour"
                        />
                        <input
                          type="text"
                          value={state.meta.themeColor}
                          onChange={(event) => updateTabState("meta", { themeColor: event.target.value })}
                          placeholder="#0f172a"
                          className={fieldClass(false, TONE)}
                        />
                      </div>
                    </Field>
                  </div>
                )}

                {state.meta.groups.custom && (
                  <Field
                    label="Custom tags"
                    hint="One name=value per line. Prefix with property: or http-equiv: for those attributes."
                  >
                    <textarea
                      rows={4}
                      value={state.meta.custom}
                      onChange={(event) => updateTabState("meta", { custom: event.target.value })}
                      placeholder={"application-name=My Site\nformat-detection=telephone=no\nproperty:article:author=Jane Doe"}
                      className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                    />
                  </Field>
                )}
              </div>
            </SectionCard>
          )}

          {state.tab === "htaccess" && (
            <SectionCard
              icon={ShieldCheck}
              tone={TONE}
              title="Apache server rules"
              description="Enable only what your host supports. Every rule is written with a comment so you can audit it later."
              actions={<Chip tone={TONE}>{HTACCESS_OPTIONS.filter((option) => state.htaccess[option.id]).length} modules</Chip>}
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Canonical hostname" hint="Redirects the opposite host to the version you choose.">
                    <select
                      value={state.htaccess.canonical}
                      onChange={(event) => updateTabState("htaccess", { canonical: event.target.value })}
                      className={fieldClass(false, TONE)}
                    >
                      <option value="none">No host redirect</option>
                      <option value="www">Force www.</option>
                      <option value="non-www">Force non-www</option>
                    </select>
                  </Field>
                  <Field label="Your IP for maintenance mode" hint="Comma-free single IPv4 address.">
                    <input
                      type="text"
                      value={state.htaccess.maintenanceIp}
                      onChange={(event) => updateTabState("htaccess", { maintenanceIp: event.target.value })}
                      placeholder="e.g. 203.0.113.10"
                      className={fieldClass(false, TONE)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {HTACCESS_OPTIONS.map((option) => (
                    <ToggleRow
                      key={option.id}
                      tone={TONE}
                      checked={Boolean(state.htaccess[option.id])}
                      onChange={(checked) => updateTabState("htaccess", { [option.id]: checked })}
                      label={option.label}
                      description={option.description}
                    />
                  ))}
                </div>

                {state.htaccess.errorPages && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="404 page path">
                      <input
                        type="text"
                        value={state.htaccess.error404}
                        onChange={(event) => updateTabState("htaccess", { error404: event.target.value })}
                        placeholder="/404.html"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                    <Field label="500 page path">
                      <input
                        type="text"
                        value={state.htaccess.error500}
                        onChange={(event) => updateTabState("htaccess", { error500: event.target.value })}
                        placeholder="/500.html"
                        className={fieldClass(false, TONE)}
                      />
                    </Field>
                  </div>
                )}

                <Field label="Custom rules" hint="Appended verbatim at the end of the file.">
                  <textarea
                    rows={4}
                    value={state.htaccess.custom}
                    onChange={(event) => updateTabState("htaccess", { custom: event.target.value })}
                    placeholder={"# Redirect an old page\nRedirect 301 /old-page /new-page"}
                    className={`${fieldClass(false, TONE)} font-mono text-[13px]`}
                  />
                </Field>

                <Callout tone="amber" variant="warning" title="Test before you ship">
                  A malformed .htaccess can take a site offline with a 500 error. Keep a copy of the original file and
                  test on staging. Some managed hosts ignore .htaccess entirely.
                </Callout>
              </div>
            </SectionCard>
          )}

          <SectionCard
            icon={Save}
            tone={TONE}
            title="Reusable presets"
            description="Save the current tab's options under a name. Presets stay in this browser."
            actions={<Chip tone={TONE}>{state.presets.length} saved</Chip>}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder={`e.g. ${activeTab.file} — client site`}
                  className={fieldClass(false, TONE)}
                  aria-label="Preset name"
                />
                <ActionButton tone={TONE} variant="primary" icon={Save} onClick={savePreset}>
                  Save preset
                </ActionButton>
              </div>

              {state.presets.length === 0 ? (
                <p className="text-[13px] text-slate-500 dark:text-slate-400">
                  No presets yet. Configure a tab you use often and save it here.
                </p>
              ) : (
                <div className="space-y-2">
                  {state.presets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{preset.name}</p>
                        <p className="text-[13px] text-slate-500 dark:text-slate-400">
                          {(CONFIG_TABS.find((tab) => tab.value === preset.tab) || {}).file}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ActionButton tone={TONE} icon={RotateCcw} onClick={() => applyPreset(preset)}>
                          Apply
                        </ActionButton>
                        <button
                          type="button"
                          onClick={() => deletePreset(preset.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          aria-label={`Delete ${preset.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <ActionButton tone={TONE} variant="primary" icon={Wand2} onClick={loadDemo}>
                  Load demo data
                </ActionButton>
                <ActionButton tone={TONE} icon={RotateCcw} onClick={clearAll}>
                  Clear configuration
                </ActionButton>
                <span className="text-[13px] font-medium text-slate-400">Nothing is pre-filled by default.</span>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-6 lg:sticky lg:top-24">
            <SectionCard
              icon={FileText}
              tone={TONE}
              title="Generated file"
              description="Updates live as you change options."
              actions={
                <div className="flex flex-wrap gap-2">
                  <Chip tone={TONE}>{lineCount} lines</Chip>
                  <Chip tone={TONE}>{activeTab.file}</Chip>
                </div>
              }
            >
              {output.trim() ? (
                <>
                  <div
                    ref={outputRef}
                    className="max-h-[460px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <pre className="whitespace-pre font-mono text-[13px] leading-relaxed text-emerald-100">
                      {output}
                    </pre>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ActionButton tone={TONE} variant="primary" icon={Copy} onClick={copyOutput}>
                      Copy
                    </ActionButton>
                    <ActionButton tone={TONE} icon={Download} onClick={downloadOutput}>
                      Download file
                    </ActionButton>
                    <ActionButton tone={TONE} icon={FolderArchive} onClick={downloadZip}>
                      Download ZIP
                    </ActionButton>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center dark:border-slate-700 dark:bg-slate-800/30">
                  <FileCog className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">Nothing generated yet</p>
                  <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                    Choose a few options, or load the demo data to see a complete example.
                  </p>
                </div>
              )}
            </SectionCard>

            <SectionCard icon={Info} tone={TONE} title="Pre-flight checks">
              <div className="space-y-2">
                {checks.map((check, index) => (
                  <div
                    key={`${check.tone}-${index}`}
                    className={`flex items-start gap-2 rounded-xl border p-2.5 text-[13px] leading-relaxed ${
                      check.tone === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-300"
                    }`}
                  >
                    {check.tone === "warning" ? (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <Info className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <span>{check.text}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon={FolderArchive} tone={TONE} title="Bundle overview">
              <div className="space-y-1.5">
                {Object.entries(allFiles).map(([name, content]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800"
                  >
                    <span className="font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-200">{name}</span>
                    <span className="flex items-center gap-2 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                      {content.trim() ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          {countLines(content)} lines
                        </>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">empty</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <ActionButton tone={TONE} icon={FolderArchive} onClick={downloadZip} className="mt-3">
                Download all as ZIP
              </ActionButton>
              <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
                <Settings2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Each file is generated independently, so you can export only the ones your project needs.
              </p>
            </SectionCard>

            <SectionCard icon={Sparkles} tone={TONE} title="What goes where">
              <div className="space-y-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                <p>
                  <strong className="font-mono">.gitignore</strong> — project root, committed with the repository.
                </p>
                <p>
                  <strong className="font-mono">robots.txt</strong> — site root, served at <span className="font-mono">/robots.txt</span>.
                </p>
                <p>
                  <strong className="font-mono">meta-tags</strong> — paste into the <span className="font-mono">&lt;head&gt;</span> of each page.
                </p>
                <p>
                  <strong className="font-mono">.htaccess</strong> — Apache document root; back it up first.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      <FaqAccordion tone={TONE} items={CONFIG_FAQS} title="Config file questions" />
    </div>
  );
}
