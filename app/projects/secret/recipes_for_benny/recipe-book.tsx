"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, ChevronDown, ChevronRight, Clock3, Copy, Heart, Minus, Plus, Printer, Search, Share2, Sparkles, X } from "lucide-react";
import "./recipes.css";
import { parseRecipeAdditions, type RecipeAdditions } from "@/lib/caruso-recipe-additions";

type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  prep: string;
  cook: string;
  total: string;
  yield: string;
  tags: string[];
  color: string;
  ingredients: { category: string; items: string[] }[];
  steps: { title: string; text: string }[];
  note: string;
  owner?: RecipeOwnerId;
};

type RecipeOwnerId = "sammy" | "sam-g" | "autumn" | "addison" | (string & {});
type RecipeProfileId = "all" | RecipeOwnerId;

type RecipeProfile = {
  id: RecipeProfileId;
  label: string;
  name: string;
  initials: string;
  image: string;
  imagePosition: string;
};

const recipes: Recipe[] = [{
  id: "loading", title: "Opening", subtitle: "the recipe book", image: "/recipe-book/all-recipes-family.jpg",
  description: "Loading your saved recipes.", prep: "—", cook: "—", total: "—", yield: "1 serving",
  tags: ["Family"], color: "gold", ingredients: [{ category: "Loading", items: ["Opening the recipe book…"] }],
  steps: [{ title: "Loading", text: "Your recipes will appear when the saved book is available." }], note: "Loading your saved recipes.", owner: "sammy",
}];

const recipeProfiles: RecipeProfile[] = [
  { id: "all", label: "All Recipes", name: "All", initials: "All", image: "/recipe-book/all-recipes-family.jpg", imagePosition: "center" },
  { id: "sammy", label: "Sammy's Recipes", name: "Sammy", initials: "S", image: "/recipe-book/sammy-cooks-chili.png", imagePosition: "center" },
  { id: "sam-g", label: "Sam G's Recipes", name: "Sam G", initials: "SG", image: "/recipe-book/sam-g-profile-v2.jpg", imagePosition: "center 38%" },
  { id: "autumn", label: "Autumn's Recipes", name: "Autumn", initials: "Au", image: "/recipe-book/autumn-profile.jpg", imagePosition: "center 38%" },
  { id: "addison", label: "Addison's Recipes", name: "Addison", initials: "Ad", image: "/recipe-book/addison-profile.jpg", imagePosition: "center 18%" },
];

const samGRecipeIds = new Set([
  "sams-fried-chicken",
  "chuck-roast",
  "chef-marshalls-challah",
  "goldstein-snickerdoodles",
]);

const SAVED_RECIPES_KEY = "benny-saved-recipes-v1";
const RECIPE_CHECKLISTS_KEY = "benny-recipe-checklists-v1";
const RECIPE_SKILL_SOURCE_URL = "https://github.com/rscboy/caruso-recipe-book";
const RECIPE_SKILL_PROMPT = `Use the Caruso Recipe Book skill from ${RECIPE_SKILL_SOURCE_URL}. Help me add, edit, move, delete, restore, or make a variation of a recipe. Give me a browser review link. I will sign in or accept my invitation and approve the change on the website. Never ask for my password or invitation token in chat.`;

function recipeOwner(recipe: Recipe): RecipeOwnerId {
  if (recipe.owner) return recipe.owner;
  return samGRecipeIds.has(recipe.id) ? "sam-g" : "sammy";
}

function recipeProfile(owner: RecipeProfileId) {
  return recipeProfiles.find((profile) => profile.id === owner) ?? recipeProfiles[0];
}

const collections = [
  { id: "All", label: "All recipes", matches: () => true },
  { id: "Dinner", label: "Dinner", matches: (recipe: Recipe) => recipe.tags.includes("Dinner") },
  { id: "Sweet", label: "Sweet treats", matches: (recipe: Recipe) => recipe.tags.includes("Sweet") },
  { id: "Drink", label: "Drinks", matches: (recipe: Recipe) => recipe.tags.includes("Drink") },
  { id: "Quick", label: "Quick & easy", matches: (recipe: Recipe) => recipe.tags.includes("Quick") },
  { id: "Baking", label: "Baking projects", matches: (recipe: Recipe) => recipe.tags.includes("Baking") },
] as const;

function recipeSearchText(recipe: Recipe) {
  return [
    recipeProfile(recipeOwner(recipe)).label,
    recipe.title,
    recipe.subtitle,
    recipe.description,
    recipe.tags.join(" "),
    ...recipe.ingredients.flatMap((group) => [group.category, ...group.items]),
    ...recipe.steps.flatMap((step) => [step.title, step.text]),
    recipe.note,
  ].join(" ").toLowerCase();
}

const unicodeFractions: Record<string, number> = { "⅛": 0.125, "¼": 0.25, "⅓": 1 / 3, "½": 0.5, "⅔": 2 / 3, "¾": 0.75 };

function parseRecipeNumber(value: string) {
  const fraction = value.match(/[⅛¼⅓½⅔¾]$/)?.[0];
  const whole = value.replace(/[⅛¼⅓½⅔¾]/g, "");
  return Number(whole || 0) + (fraction ? unicodeFractions[fraction] : 0);
}

function formatRecipeNumber(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function recipePortions(recipe: Recipe) {
  const amount = recipe.yield.match(/\d+(?:[⅛¼⅓½⅔¾])?/)?.[0];
  return amount ? Math.max(1, Math.round(parseRecipeNumber(amount))) : 1;
}

function scaleIngredient(item: string, multiplier: number) {
  if (multiplier === 1) return item;
  const match = item.match(/^((?:\d+(?:[⅛¼⅓½⅔¾])?|[⅛¼⅓½⅔¾])(?:[–-](?:\d+(?:[⅛¼⅓½⅔¾])?|[⅛¼⅓½⅔¾]))?)(\s+.*)$/);
  if (!match) return item;
  const [, quantity, detail] = match;
  const [start, end] = quantity.split(/[–-]/);
  const scaledStart = formatRecipeNumber(parseRecipeNumber(start) * multiplier);
  const scaledQuantity = end ? `${scaledStart}–${formatRecipeNumber(parseRecipeNumber(end) * multiplier)}` : scaledStart;
  return `${scaledQuantity}${detail}`;
}

function CharliePizzaCalculator() {
  const [size, setSize] = useState(14);
  const [count, setCount] = useState(4);
  const [crust, setCrust] = useState("Airy (Recommended)");
  const [sauce, setSauce] = useState("Medium");
  const [cheese, setCheese] = useState("Medium");
  const [tomatoes, setTomatoes] = useState(20);
  const [startingProtein, setStartingProtein] = useState(12.7);
  const [glutenProtein, setGlutenProtein] = useState(75);
  const [goalProtein, setGoalProtein] = useState(14.2);

  const results = useMemo(() => {
    const hydration = { Traditional: .61, "Airy (Recommended)": .65, "Ultra Airy": .69 }[crust] ?? .65;
    const sauceRatio = { Low: .585, Medium: .685, High: .785, Danger: .905 }[sauce] ?? .685;
    const cheeseRatio = { Low: .585, Medium: .685, High: .785, "Take It Cheesy": .905 }[cheese] ?? .685;
    const bakerTotal = 1 + hydration + .03 + .005 + .015;
    const totalDough = Math.PI * Math.pow((Math.max(8, size) - .75) / 2, 2) * .09 * 28.35 * Math.max(1, count);
    const totalFlour = totalDough / bakerTotal;
    const doughBall = totalDough / Math.max(1, count);
    const vitalGluten = Math.max(0, (goalProtein - startingProtein) / Math.max(.1, glutenProtein - startingProtein) * 100);
    return {
      doughBall,
      totalDough,
      highGluten: totalFlour * .909,
      secondaryFlour: totalFlour * .091,
      water: totalFlour * hydration,
      salt: totalFlour * .03,
      yeast: totalFlour * .005,
      sugar: totalFlour * .015,
      sauce: doughBall * sauceRatio / bakerTotal,
      mozzarella: doughBall * cheeseRatio / bakerTotal,
      pecorino: doughBall * .04 / bakerTotal,
      sauceWater: tomatoes / 4,
      sauceSalt: tomatoes * 3 / 28,
      sauceSugar: tomatoes * 12 / 28,
      sauceOregano: tomatoes * 2 / 28,
      vitalGluten,
    };
  }, [cheese, count, crust, goalProtein, glutenProtein, sauce, size, startingProtein, tomatoes]);
  const grams = (value: number) => `${value.toFixed(1)} g`;

  return <section className="benny-pizza-lab" aria-labelledby="pizza-calculator-title">
    <div className="benny-pizza-lab-head"><div><p>Built into the recipe</p><h3 id="pizza-calculator-title">Charlie&apos;s Pizza Calculator</h3></div><a href="https://charlieandersoncooking.com/nyc-pizza-calculator" target="_blank" rel="noreferrer">Original calculator by Charlie Anderson <ArrowRight size={14} /></a></div>
    <p className="benny-pizza-lab-intro">Choose your pie and the dough, sauce, and cheese amounts update instantly.</p>
    <div className="benny-pizza-controls">
      <label><span>Pizza size</span><div><input type="number" min="8" max="24" step="1" value={size} onChange={(event) => setSize(Math.min(24, Math.max(8, Number(event.target.value) || 8)))} /><small>inches</small></div></label>
      <label><span>Number of pizzas</span><input type="number" min="1" max="20" step="1" value={count} onChange={(event) => setCount(Math.min(20, Math.max(1, Number(event.target.value) || 1)))} /></label>
      <label><span>Crust</span><select value={crust} onChange={(event) => setCrust(event.target.value)}><option>Traditional</option><option>Airy (Recommended)</option><option>Ultra Airy</option></select></label>
      <label><span>Sauce</span><select value={sauce} onChange={(event) => setSauce(event.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Danger</option></select></label>
      <label><span>Cheese</span><select value={cheese} onChange={(event) => setCheese(event.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Take It Cheesy</option></select></label>
    </div>
    <div className="benny-pizza-summary"><div><span>Each dough ball</span><strong>{Math.round(results.doughBall)} g</strong></div><div><span>Total dough</span><strong>{Math.round(results.totalDough)} g</strong></div><div><span>Plan</span><strong>{count} × {size}&quot;</strong></div></div>
    <div className="benny-pizza-output">
      <div><h4>Dough recipe</h4><dl><div><dt>High-gluten flour</dt><dd>{grams(results.highGluten)} <small>· {(results.highGluten / 125).toFixed(2)} cups</small></dd></div><div><dt>Spelt or rye flour</dt><dd>{grams(results.secondaryFlour)} <small>· {(results.secondaryFlour / 125 * 16).toFixed(1)} tbsp</small></dd></div><div><dt>Water</dt><dd>{grams(results.water)} <small>· {(results.water / 29.57).toFixed(1)} fl oz</small></dd></div><div><dt>Salt</dt><dd>{grams(results.salt)} <small>· {(results.salt / 2.8).toFixed(1)} tsp*</small></dd></div><div><dt>Instant yeast</dt><dd>{grams(results.yeast)} <small>· {(results.yeast * .3333).toFixed(2)} tsp</small></dd></div><div><dt>Sugar</dt><dd>{grams(results.sugar)} <small>· {(results.sugar / 4).toFixed(2)} tsp</small></dd></div></dl></div>
      <div><h4>Toppings per pizza</h4><dl><div><dt>Sauce</dt><dd>{grams(results.sauce)} <small>· {(results.sauce / 29.57).toFixed(1)} fl oz</small></dd></div><div><dt>Mozzarella</dt><dd>{grams(results.mozzarella)} <small>· {(results.mozzarella / 113).toFixed(2)} cups</small></dd></div><div><dt>Pecorino</dt><dd>{grams(results.pecorino)} <small>· {(results.pecorino / 5.3).toFixed(1)} tbsp</small></dd></div></dl><p className="benny-pizza-salt-note">*Salt volume varies by crystal size. Weighing it is best.</p></div>
    </div>
    <details className="benny-pizza-advanced"><summary>Master sauce &amp; flour conversion <Plus size={15} /></summary><div className="benny-pizza-advanced-grid"><div><label><span>Tomatoes</span><div><input type="number" min="1" step="1" value={tomatoes} onChange={(event) => setTomatoes(Math.max(1, Number(event.target.value) || 1))} /><small>oz</small></div></label><dl><div><dt>Water, if using Red Pack</dt><dd>{results.sauceWater.toFixed(1)} oz</dd></div><div><dt>Salt</dt><dd>{results.sauceSalt.toFixed(1)} g</dd></div><div><dt>Sugar</dt><dd>{results.sauceSugar.toFixed(1)} g</dd></div><div><dt>Oregano</dt><dd>{results.sauceOregano.toFixed(1)} tsp</dd></div></dl></div><div><div className="benny-protein-inputs"><label><span>Starting flour</span><div><input type="number" min="1" max="30" step=".1" value={startingProtein} onChange={(event) => setStartingProtein(Number(event.target.value) || 0)} /><small>%</small></div></label><label><span>Vital gluten</span><div><input type="number" min="1" max="100" step=".1" value={glutenProtein} onChange={(event) => setGlutenProtein(Number(event.target.value) || 0)} /><small>%</small></div></label><label><span>Goal protein</span><div><input type="number" min="1" max="30" step=".1" value={goalProtein} onChange={(event) => setGoalProtein(Number(event.target.value) || 0)} /><small>%</small></div></label></div><div className="benny-vital-result"><span>Vital wheat gluten needed</span><strong>{results.vitalGluten.toFixed(1)}%</strong><small>of your starting flour weight</small></div></div></div></details>
  </section>;
}

const bundledRecipes = recipes;
const bundledProfiles = recipeProfiles;

export function BennyRecipeBook({initialBook,initialError=""}: {initialBook?:RecipeAdditions;initialError?:string}) {
  const [additions, setAdditions] = useState<RecipeAdditions>(initialBook ?? { version: 1, entries: [] });
  const [additionsError, setAdditionsError] = useState(initialError);
  const [bookLoaded, setBookLoaded] = useState(Boolean(initialBook));
  const [loadAttempt, setLoadAttempt] = useState(0);
  const recipes = useMemo(() => {
    return bookLoaded ? additions.entries.map((entry) => entry.recipe) : bundledRecipes;
  }, [additions, bookLoaded]);
  const recipeProfiles = useMemo(() => {
    const profiles = [...bundledProfiles];
    for (const { owner } of additions.entries) if (!profiles.some((profile) => profile.id === owner.id)) profiles.push({ id: owner.id, name: owner.name, label: `${owner.name}'s Recipes`, initials: owner.initials, image: owner.id === "benny" ? "/recipe-book/benny-profile.png" : "/recipe-book/all-recipes-family.jpg", imagePosition: owner.id === "benny" ? "center 10%" : "center" });
    return profiles;
  }, [additions]);
  const profileForOwner = (owner: RecipeProfileId) => recipeProfiles.find((profile) => profile.id === owner) ?? recipeProfiles[0];
  useEffect(() => {
    let stopped = false, pending = false;
    const refresh = async () => {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch("/api/caruso-recipe-book?live=1", { cache: "no-store", credentials: "same-origin", redirect: "error", signal: AbortSignal.timeout(15000) });
        if (response.status === 401 || response.status === 403) throw new Error("Open your invitation or sign in to see the family book.");
        if (!response.ok) throw new Error("The saved book could not be reached. Please try again.");
        const next = parseRecipeAdditions(await response.text());
        if (!stopped) { setAdditions(next); setAdditionsError(""); setBookLoaded(true); }
      } catch (error) { if (!stopped) setAdditionsError(error instanceof Error && /invitation/.test(error.message) ? error.message : "We couldn’t open the saved recipe book. Your recipes are safe. Try again below, or sign in."); }
      finally { pending = false; }
    };
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { stopped = true; window.removeEventListener("focus", refresh); };
  }, [loadAttempt]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All");
  const [activeOwner, setActiveOwner] = useState<RecipeProfileId>("sammy");
  const [selectedId, setSelectedId] = useState(recipes[0].id);
  const [saved, setSaved] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [checkedByRecipe, setCheckedByRecipe] = useState<Record<string, string[]>>({});
  const [storageReady, setStorageReady] = useState(false);
  const [mobileRecipeOpen, setMobileRecipeOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [addGuideOpen, setAddGuideOpen] = useState(false);
  const [copiedGuide, setCopiedGuide] = useState<"run" | "">("");
  const [portions, setPortions] = useState<Record<string, number>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recipeSheetRef = useRef<HTMLDivElement>(null);
  const addGuideCloseRef = useRef<HTMLButtonElement>(null);
  const shareTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? recipes[0] ?? bundledRecipes[0];
  const checked = checkedByRecipe[selected.id] ?? [];
  const ingredientCount = selected.ingredients.flatMap((group) => group.items).length;
  const basePortions = recipePortions(selected);
  const activePortions = portions[selected.id] ?? basePortions;
  const portionMultiplier = activePortions / basePortions;
  const activeProfile = profileForOwner(activeOwner);
  const selectedProfile = profileForOwner(recipeOwner(selected));
  const activeOwnerCount = activeOwner === "all" ? recipes.length : recipes.filter((recipe) => recipeOwner(recipe) === activeOwner).length;
  const filtered = useMemo(() => {
    const activeCollection = collections.find((collection) => collection.id === tag) ?? collections[0];
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return recipes
      .filter((recipe) => (!showSaved || saved.includes(recipe.id)) && activeCollection.matches(recipe) && terms.every((term) => `${recipeSearchText(recipe)} ${profileForOwner(recipeOwner(recipe)).name.toLowerCase()}`.includes(term)))
      .sort((first, second) => {
        const savedPriority = Number(saved.includes(second.id)) - Number(saved.includes(first.id));
        if (savedPriority) return savedPriority;
        if (activeOwner === "all") return first.title.localeCompare(second.title) || first.subtitle.localeCompare(second.subtitle);
        const firstPriority = recipeOwner(first) === activeOwner ? 0 : 1;
        const secondPriority = recipeOwner(second) === activeOwner ? 0 : 1;
        return firstPriority - secondPriority || first.title.localeCompare(second.title) || first.subtitle.localeCompare(second.subtitle);
      });
  }, [activeOwner, query, saved, showSaved, tag, recipes, recipeProfiles]);
  useEffect(() => {
    try {
      const storedSaved = JSON.parse(window.localStorage.getItem(SAVED_RECIPES_KEY) ?? "[]");
      const storedChecklists = JSON.parse(window.localStorage.getItem(RECIPE_CHECKLISTS_KEY) ?? "{}");
      if (Array.isArray(storedSaved)) setSaved(storedSaved.filter((id): id is string => typeof id === "string" && /^[a-z0-9-]+$/.test(id)));
      if (storedChecklists && typeof storedChecklists === "object" && !Array.isArray(storedChecklists)) {
        const validChecklists = Object.fromEntries(Object.entries(storedChecklists).filter(([id, items]) => /^[a-z0-9-]+$/.test(id) && Array.isArray(items)).map(([id, items]) => [id, (items as unknown[]).filter((item): item is string => typeof item === "string")]));
        setCheckedByRecipe(validChecklists);
      }
    } catch {
      // Ignore malformed or unavailable browser storage and start fresh.
    }
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    try { window.localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(saved)); } catch { /* Browser storage may be unavailable. */ }
  }, [saved, storageReady]);
  useEffect(() => {
    if (!storageReady) return;
    try { window.localStorage.setItem(RECIPE_CHECKLISTS_KEY, JSON.stringify(checkedByRecipe)); } catch { /* Browser storage may be unavailable. */ }
  }, [checkedByRecipe, storageReady]);
  useEffect(() => {
    const syncRecipeFromUrl = () => {
      const recipeId = new URL(window.location.href).searchParams.get("recipe");
      if (!recipeId) {
        setMobileRecipeOpen(false);
        return;
      }
      if (!recipes.some((recipe) => recipe.id === recipeId)) return;
      setSelectedId(recipeId);
      setMobileRecipeOpen(true);
    };
    syncRecipeFromUrl();
    window.addEventListener("popstate", syncRecipeFromUrl);
    return () => window.removeEventListener("popstate", syncRecipeFromUrl);
  }, [recipes]);
  useEffect(() => () => {
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;
      if (event.key === "Escape" && addGuideOpen) setAddGuideOpen(false);
      else if (event.key === "Escape" && mobileRecipeOpen) {
        setMobileRecipeOpen(false);
        setShareStatus("");
        const url = new URL(window.location.href);
        url.searchParams.delete("recipe");
        window.history.replaceState({}, "", url);
      }
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addGuideOpen, mobileRecipeOpen]);
  useEffect(() => {
    if (!addGuideOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => addGuideCloseRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [addGuideOpen]);
  useEffect(() => {
    if (!mobileRecipeOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const resetScroll = () => {
      if (!recipeSheetRef.current) return;
      recipeSheetRef.current.scrollTop = 0;
      recipeSheetRef.current.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };
    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    const settle = window.setTimeout(resetScroll, 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileRecipeOpen, selectedId]);
  const recipeUrl = (id: string) => {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("recipe", id);
    return url;
  };
  const closeRecipe = () => {
    setMobileRecipeOpen(false);
    setShareStatus("");
    const url = new URL(window.location.href);
    url.searchParams.delete("recipe");
    window.history.replaceState({}, "", url);
  };
  const choose = (id: string) => {
    recipeSheetRef.current?.scrollTo({ top: 0, behavior: "auto" });
    setSelectedId(id);
    setShareStatus("");
    setMobileRecipeOpen(true);
    window.history.replaceState({ recipe: id }, "", recipeUrl(id));
  };
  const shareRecipe = async () => {
    const url = recipeUrl(selected.id).toString();
    const title = `${selected.title} ${selected.subtitle} · Sammy's Recipe Book`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `Make ${selected.title} ${selected.subtitle}.`, url });
        setShareStatus("Recipe shared");
      } else {
        await navigator.clipboard.writeText(url);
        setShareStatus("Recipe link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      setShareStatus("Recipe link copied");
    }
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(() => setShareStatus(""), 2200);
  };
  const copyGuideText = async () => {
    const text = RECIPE_SKILL_PROMPT;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopiedGuide("run");
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopiedGuide(""), 1800);
  };
  const toggleSaved = (id: string) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const toggleChecked = (item: string) => setCheckedByRecipe((checklists) => {
    const current = checklists[selected.id] ?? [];
    const next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
    return { ...checklists, [selected.id]: next };
  });
  const updatePortions = (value: number) => setPortions((items) => ({ ...items, [selected.id]: Math.max(1, value) }));
  const nextRecipe = () => {
    const sequence = filtered.length ? filtered : recipes;
    const currentIndex = sequence.findIndex((recipe) => recipe.id === selected.id);
    choose(sequence[(currentIndex + 1 + sequence.length) % sequence.length].id);
  };
  const activeCollection = collections.find((collection) => collection.id === tag);
  const resultTitle = showSaved ? "Saved recipes" : tag === "All" ? activeOwner === "all" ? "All recipes" : `${activeProfile.name}'s recipes first.` : activeCollection?.label;

  if (!bookLoaded) return <main className="benny-book"><section className="benny-load-state"><a className="benny-load-home" href="/book">Caruso Recipes</a><h1>Let’s get your recipes open.</h1><p role="status">{additionsError || "Opening the recipe book…"}</p>{additionsError && <button type="button" onClick={() => { setAdditionsError(""); setLoadAttempt(n => n + 1); }}>Try opening the book again</button>}<a href="/recipe-book/manage.html">Sign in or manage recipes</a><noscript>JavaScript is needed to open the recipe book. Enable it, then reload this page.</noscript></section></main>;
  if (!recipes.length) return <main className="benny-book"><section className="benny-load-state"><h1>Your recipe box is ready.</h1><p>Add a recipe or restore one from Trash.</p><a href="/recipe-book/manage.html">Manage recipes</a></section></main>;

  return <main className="benny-book">
    {additionsError && <aside role="status">{additionsError} <button type="button" onClick={() => {setAdditionsError("");setLoadAttempt(n => n + 1);}}>Try again</button></aside>}<header className="benny-header">
      <a className="benny-brand" href="/book" aria-label="Caruso Recipe Book home"><span className="benny-wordmark"><b>Caruso</b><em>Recipes</em></span><span>Your family recipe book</span></a>
      <div className="benny-title"><p>Private recipe book</p><h1>{activeProfile.label}</h1></div>
      <nav className="benny-header-actions" aria-label="Recipe book navigation">
        <a className="benny-add-trigger" href="/recipe-book/manage.html?tab=account" aria-label="My account or sign in">Account</a><a className="benny-add-trigger" href="/recipe-book/manage.html" aria-label="Manage recipes"><span className="benny-nav-full">Manage recipes</span><span className="benny-nav-short">Manage</span></a>
        <button className="benny-add-trigger" type="button" aria-haspopup="dialog" onClick={() => setAddGuideOpen(true)}>Use AI</button>
        <button aria-label={`Saved recipes, ${saved.length} saved`} className={`benny-saved ${saved.length ? "has-saved" : ""} ${showSaved ? "is-active" : ""}`} onClick={() => setShowSaved((value) => !value)} aria-pressed={showSaved}><Heart size={15} fill={saved.length ? "currentColor" : "none"} /><span>Saved</span><b>{saved.length}</b></button>
      </nav>
    </header>

    {addGuideOpen && <div className="benny-add-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddGuideOpen(false); }}>
      <section className="benny-add-dialog" role="dialog" aria-modal="true" aria-labelledby="benny-add-title" aria-describedby="benny-add-description">
        <div className="benny-add-dialog-head">
          <div><p className="benny-eyebrow">Caruso Recipe Book</p><h2 id="benny-add-title">Manage recipes with AI.</h2></div>
          <button ref={addGuideCloseRef} type="button" onClick={() => setAddGuideOpen(false)} aria-label="Close add recipe instructions"><X size={19} /></button>
        </div>
        <p className="benny-add-intro" id="benny-add-description">Ask your assistant to add, edit, move, delete, restore, or make your own version. Review every change here.</p>
        <ol className="benny-add-simple-steps">
          <li>
            <span aria-hidden="true">1</span>
            <div><h3>Copy &amp; paste</h3><p>Paste the starter message into your assistant.</p>
              <button className="benny-add-copy" type="button" onClick={copyGuideText}>{copiedGuide === "run" ? "Copied" : "Copy starter message"}</button>
              <span className="benny-add-copy-status" role="status">{copiedGuide === "run" ? "Ready to paste into Claude Code or Codex." : ""}</span>
            </div>
          </li>
          <li><span aria-hidden="true">2</span><div><h3>Open your review link</h3><p>Sign in with your email and password, or open your private invitation. Check the exact change and approve it. Deleted recipes can be restored from Trash.</p></div></li>
        </ol>
        <p>Bookmark <a href="https://recipes.daytongrowth.co">recipes.daytongrowth.co</a> to come back easily. Use ⌘D on Mac, Ctrl+D on Windows, or your phone’s Share menu.</p><div className="benny-add-simple-footer"><a href="/recipe-book/manage.html">Manage recipes and invitations</a><a href={RECIPE_SKILL_SOURCE_URL} target="_blank" rel="noreferrer">Get the skill</a></div>
      </section>
    </div>}

    <details className="benny-bookmark"><summary><Bookmark size={16} aria-hidden="true" /><span>Bookmark the recipe book</span><ChevronDown size={16} aria-hidden="true" /></summary><div><p>Save <a href="https://recipes.daytongrowth.co">recipes.daytongrowth.co</a> for next time.</p><p>On your phone, use your browser’s Share or menu button, then choose Add Bookmark.</p><p className="benny-bookmark-desktop">On a computer, press ⌘D or Ctrl+D.</p></div></details>
    <section className="benny-intro" id="top" style={{ "--benny-profile-image": `url("${activeProfile.image}")`, "--benny-profile-position": activeProfile.imagePosition } as CSSProperties}>
      <p className="benny-eyebrow">{activeProfile.label}</p>
      <h2>What should we make<br /><i>tonight?</i></h2>
      <p>A small collection of comforting, fast, and worth-the-wait recipes.</p>
      <div className="benny-search"><Search size={18} /><input ref={searchInputRef} value={query} onChange={(event) => { setQuery(event.target.value); setShowSaved(false); }} placeholder="Search dishes or ingredients" aria-label="Search recipes" />{query ? <button onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button> : <kbd>/</kbd>}</div>
    </section>

    <nav className="benny-owner-tabs" aria-label="Choose whose recipes appear first" role="tablist">
      {recipeProfiles.map((profile) => <button key={profile.id} type="button" role="tab" aria-selected={activeOwner === profile.id} className={activeOwner === profile.id ? "active" : ""} onClick={() => { setActiveOwner(profile.id); setShowSaved(false); }}><span aria-hidden="true">{profile.initials}</span>{profile.label}</button>)}
    </nav>

    {activeOwnerCount === 0 && <div className="benny-owner-note" role="status"><strong>{activeProfile.name}&apos;s recipes haven&apos;t been added yet.</strong><span>The shared family recipe box is still here, ready to browse.</span></div>}

    <nav className="benny-filter" aria-label="Recipe categories">{collections.map((collection) => <button key={collection.id} className={!showSaved && tag === collection.id ? "active" : ""} onClick={() => { setTag(collection.id); setShowSaved(false); }}>{collection.label}</button>)}</nav>

    <section className="benny-feature" aria-label="Selected recipe">
      <div className={`benny-photo ${selected.color}`}><img src={selected.image} alt="" /><div className="benny-sticker">{selected.tags[0]}</div><div className="benny-photo-caption">Recipe no. {String(recipes.findIndex((recipe) => recipe.id === selected.id) + 1).padStart(2, "0")}</div></div>
      <div className="benny-feature-copy">
        <button className={`benny-love ${saved.includes(selected.id) ? "is-saved" : ""}`} onClick={() => toggleSaved(selected.id)} aria-label="Save recipe"><Heart size={19} fill={saved.includes(selected.id) ? "currentColor" : "none"} /></button>
        <p className="benny-eyebrow">Make this one</p><h2>{selected.title}<span>{selected.subtitle}</span></h2><p className="benny-description">{selected.description}</p>
        <dl className="benny-stats"><div><dt>Prep</dt><dd>{selected.prep}</dd></div><div><dt>Cook</dt><dd>{selected.cook}</dd></div><div><dt>Total</dt><dd>{selected.total}</dd></div><div><dt>Makes</dt><dd>{selected.yield}</dd></div></dl>
        <a href="#recipe" className="benny-cook-button">Start cooking <ChevronRight size={18} /></a>
      </div>
    </section>

    <section className="benny-cards-section" aria-live="polite"><div className="benny-section-head"><div><p className="benny-eyebrow">The recipe box</p><h2>{resultTitle}</h2></div><span>{filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}</span></div>
      <div className="benny-cards">{filtered.map((recipe, index) => { const owner = profileForOwner(recipeOwner(recipe)); return <button className={`benny-card ${recipe.id === selected.id ? "selected" : ""}`} key={recipe.id} onClick={() => choose(recipe.id)} aria-label={`Open ${recipe.title} ${recipe.subtitle}, by ${owner.name}`}><div className={`benny-card-image ${recipe.color}`}><img src={recipe.image} alt="" loading={index > 3 ? "lazy" : "eager"} /><span>{recipe.total}</span></div><div><div className="benny-card-tags"><span className="benny-owner-tag">By {owner.name}</span><span>{recipe.tags.slice(0, 2).join(" · ")}</span></div><h3>{recipe.title}<small>{recipe.subtitle}</small></h3><span className="benny-card-action">Open recipe <ChevronRight size={15} /></span></div></button>; })}</div>
      {!filtered.length && <div className="benny-empty"><Sparkles size={20} /><div><strong>No matches yet.</strong><p>Try a dish, ingredient, or choose another collection.</p></div><button onClick={() => { setQuery(""); setTag("All"); setShowSaved(false); }}>Show all recipes</button></div>}
    </section>

    <aside className="benny-kitchen-moment"><img src="/recipe-book/sammy-and-tabby-bake.png" alt="Sammy cooking with his tabby cat" loading="lazy" /></aside>

    <article className="benny-recipe" id="recipe">
      <div className="benny-recipe-heading"><p className="benny-eyebrow">Now cooking</p><h2>{selected.title} <em>{selected.subtitle}</em></h2><div><button onClick={() => window.print()}><Printer size={16} /> Print</button><button onClick={() => choose(recipes[(recipes.findIndex((recipe) => recipe.id === selected.id) - 1 + recipes.length) % recipes.length].id)}><ArrowLeft size={16} /> Previous</button></div></div>
      <div className="benny-recipe-grid"><section className="benny-ingredients"><div className="benny-panel-title"><span>01</span><h3>Gather this</h3><small>{checked.length} / {ingredientCount} checked</small></div>{selected.ingredients.map((group) => <div className="benny-ingredient-group" key={group.category}><h4>{group.category}</h4>{group.items.map((item, index) => { const key = `${group.category}-${index}`; const isChecked = checked.includes(key); return <label className={isChecked ? "done" : ""} key={key}><input type="checkbox" checked={isChecked} onChange={() => toggleChecked(key)} /><span><Check size={13} /></span>{item}</label>; })}</div>)}</section>
      <section className="benny-method"><div className="benny-panel-title"><span>02</span><h3>Make it happen</h3><small><Clock3 size={13} /> {selected.total}</small></div><ol>{selected.steps.map((step, index) => <li key={step.title}><b>{String(index + 1).padStart(2, "0")}</b><div><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol><aside><Sparkles size={17} /><div><strong>{selectedProfile.name}&apos;s note</strong><p>{selected.note}</p></div></aside></section></div>
    </article>
    {mobileRecipeOpen && <div key={selected.id} ref={recipeSheetRef} className="benny-mobile-sheet" role="dialog" aria-modal="true" aria-label={`${selected.title} ${selected.subtitle}`}>
      <div className="benny-mobile-sheet-header"><div><p className="benny-eyebrow">Now cooking</p><h2>{selected.title} <em>{selected.subtitle}</em></h2></div><div className="benny-sheet-actions"><button onClick={shareRecipe} aria-label={`Share ${selected.title}`}><Share2 size={18} /></button><button className={saved.includes(selected.id) ? "is-saved" : ""} onClick={() => toggleSaved(selected.id)} aria-label="Save recipe"><Heart size={18} fill={saved.includes(selected.id) ? "currentColor" : "none"} /></button><button onClick={closeRecipe} aria-label="Close recipe"><X size={22} /></button></div></div>
      {shareStatus && <div className="benny-share-toast" role="status" aria-live="polite"><Check size={15} /> {shareStatus}</div>}
      <div className="benny-mobile-sheet-meta"><span>{selected.prep} prep</span><span>{selected.cook} cook</span><span>{activePortions} portions</span></div>
      <div className="benny-portions" aria-label="Adjust recipe portions"><div><strong>Adjust portions</strong><small>Ingredients update instantly</small></div><div className="benny-portion-stepper"><button onClick={() => updatePortions(activePortions - 1)} disabled={activePortions <= 1} aria-label="Decrease portions"><Minus size={15} /></button><output aria-live="polite">{activePortions}</output><button onClick={() => updatePortions(activePortions + 1)} aria-label="Increase portions"><Plus size={15} /></button></div></div>
      {selected.id === "ny-style-pizza" && <CharliePizzaCalculator />}
      <div className="benny-progress"><span>Shopping progress</span><b>{checked.length} of {ingredientCount}</b></div>
      <section className="benny-mobile-sheet-section"><h3>Gather this</h3>{selected.ingredients.map((group) => <div className="benny-ingredient-group" key={group.category}><h4>{group.category}</h4>{group.items.map((item, index) => { const key = `${group.category}-${index}`; const isChecked = checked.includes(key); return <label className={isChecked ? "done" : ""} key={key}><input type="checkbox" checked={isChecked} onChange={() => toggleChecked(key)} /><span><Check size={13} /></span>{scaleIngredient(item, portionMultiplier)}</label>; })}</div>)}</section>
      <section className="benny-mobile-sheet-section"><h3>Make it happen</h3><ol>{selected.steps.map((step, index) => <li key={step.title}><b>{String(index + 1).padStart(2, "0")}</b><div><h4>{step.title}</h4><p>{step.text}</p></div></li>)}</ol><aside><Sparkles size={17} /><div><strong>{selectedProfile.name}&apos;s note</strong><p>{selected.note}</p></div></aside></section>
      <button className="benny-next-recipe" onClick={nextRecipe}>Next recipe <ArrowRight size={17} /></button>
      <button className="benny-sheet-return" onClick={closeRecipe}><ArrowLeft size={17} /> Back to recipes</button>
    </div>}
    <footer className="benny-footer"><div className="benny-mark">S<span>★</span></div><p>Made with love, and enough butter.</p><small>Sammy&apos;s Recipes · Keep the good ones close.</small></footer>
  </main>;
}
