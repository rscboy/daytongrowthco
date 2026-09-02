"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, Copy, Heart, Minus, Plus, Printer, Search, Share2, Sparkles, X } from "lucide-react";
import "./recipes.css";

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

type RecipeOwnerId = "sammy" | "sam-g" | "autumn" | "addison";
type RecipeProfileId = "all" | RecipeOwnerId;

type RecipeProfile = {
  id: RecipeProfileId;
  label: string;
  name: string;
  initials: string;
  image: string;
  imagePosition: string;
};

const recipes: Recipe[] = [
  { id: "lauras-cookies", title: "Laura's Cookies", subtitle: "Copycat · 2.5-hour version", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuPL2oUUxSRJR19t6-7fd1wDT-tyJ4d8k3OWH0OXgOJNLzGw-x7XjFCpcl&s=10", description: "Soft sour-cream sugar cookies with almond icing, streamlined for a same-day baking and frosting session.", prep: "25 min", cook: "10 min", total: "2 hr 15 min", yield: "24–30", tags: ["Sweet", "Baking", "Weekend"], color: "lilac", ingredients: [{ category: "Dough", items: ["5 cups (600 g) all-purpose flour", "1½ cups (300 g) granulated sugar", "1 cup (226 g / 2 sticks) unsalted real butter, softened", "1 cup (240 g) full-fat sour cream", "2 large eggs", "2 tsp baking powder", "½ tsp salt", "2 tsp vanilla extract"] }, { category: "Almond icing", items: ["4 cups (480 g) powdered sugar", "5 tbsp milk", "1–1½ tsp imitation almond extract", "Tiny pinch salt", "Food coloring or sprinkles, optional"] }], steps: [{ title: "Make the dough", text: "Cream butter and sugar for 2–3 minutes. Beat in eggs one at a time, then vanilla and sour cream. Whisk flour, baking powder, and salt separately; gradually mix dry ingredients into wet, stopping as soon as combined." }, { title: "Freezer-chill", text: "Cover the bowl tightly and freeze for 45 minutes. Check at 25 minutes: the dough should become very cold and firm enough to roll, not frozen solid." }, { title: "Preheat and prepare", text: "Near the end of the chill, heat oven to 350°F and line baking sheets with parchment." }, { title: "Roll and cut", text: "Lightly flour the counter and roll dough ⅜ inch thick. Cut shapes and transfer to parchment-lined trays." }, { title: "Freeze the trays", text: "Skip the long refrigerator chill. Freeze each finished tray for 7–10 minutes to quickly firm the butter." }, { title: "Bake pale", text: "Bake at 350°F for 9–11 minutes. Start checking at 9 minutes. Keep the cookies pale rather than waiting for golden edges." }, { title: "Cool and frost", text: "Leave cookies on the sheet 3 minutes, then transfer to a rack. Whisk powdered sugar, milk, almond extract, and salt until thick and smooth. Once cookies are fully cool, frost and let icing set 20–30 minutes." }], note: "Do not skip the initial 45-minute freezer chill. That first chill, plus a 7–10 minute tray freeze, makes thick sour-cream dough workable within the 2½-hour plan." },
  { id: "apple-chicken-chili", title: "White Cheddar", subtitle: "Apple chicken chili", image: "https://www.littlebroken.com/wp-content/uploads/2023/09/Apple-Chicken-Chili-18.jpg", description: "A thick, savory white chicken chili with apple cider flavor, warm spice, green chile, and plenty of white cheddar, without apple pieces.", prep: "20 min", cook: "45 min", total: "1 hr 5 min", yield: "6 generous servings", tags: ["Dinner", "Cozy", "One pot"], color: "mint", ingredients: [{ category: "Chili base", items: ["1½ lb boneless, skinless chicken breast, chopped bite-size", "2 tbsp butter", "1 medium onion, diced", "4 cloves garlic, minced", "5 cups water + chicken bouillon for 5 cups broth", "1 cup apple juice or apple cider", "1 cup milk", "1 can diced green chiles (4 oz)"] }, { category: "Beans and cheese", items: ["1 can Great Northern beans, drained and rinsed", "1 can black beans, drained and rinsed", "2 cans garbanzo beans, drained and rinsed", "2 cups sharp white cheddar, freshly shredded", "½ cup Monterey Jack, Colby Jack, or another mild melting cheese"] }, { category: "Seasonings", items: ["2 tsp cumin", "1½ tsp chili powder", "1 tsp each smoked paprika, dried oregano, and garlic powder", "½ tsp onion powder", "¾ tsp black pepper", "¼ tsp cinnamon + tiny pinch nutmeg", "¼ tsp cayenne, optional", "1 tbsp brown sugar or maple syrup, optional", "Salt, only at the end if needed"] }], steps: [{ title: "Sauté onion and garlic", text: "Melt butter in a large Dutch oven over medium heat. Cook onion about 5 minutes until softened, then add garlic for 30 seconds." }, { title: "Season the chicken", text: "Add chopped chicken, cumin, chili powder, smoked paprika, oregano, garlic powder, onion powder, pepper, cinnamon, nutmeg, and cayenne if using. Cook 5–6 minutes, stirring occasionally." }, { title: "Add broth and apple flavor", text: "Pour in water and bouillon, then add apple juice or cider. Cider has the deeper apple flavor. Stir in diced green chiles." }, { title: "Add mashed and whole beans", text: "Drain and rinse all four cans of beans. Mash about 1½ cups of the Great Northern and garbanzo beans thoroughly, then add the mashed beans plus all remaining whole beans to the pot." }, { title: "Simmer", text: "Bring to a gentle boil, reduce to medium-low, and simmer uncovered 25–30 minutes, stirring occasionally. Add up to ½ cup more water if it becomes thicker than you like." }, { title: "Balance the flavor", text: "After about 20 minutes, taste. Add brown sugar or maple syrup if you want a subtle sweet apple-cheddar balance." }, { title: "Add milk and cheese", text: "Turn heat to low. Slowly stir in milk and warm 2–3 minutes without hard-boiling. Add cheeses a handful at a time, stirring until smooth." }, { title: "Rest", text: "Turn off heat and let chili rest 10 minutes. It will thicken noticeably before serving." }], note: "The goal is savory chicken, white cheddar, and mild green chile with a noticeable but never dessert-like apple sweetness. Do not skip the apple juice or cider when leaving out apple chunks." },
  { id: "skyline-chili", title: "Copycat Skyline", subtitle: "Cincinnati chili", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWgr9EfmL8CBqEt4RRxbgdFZJO4yBG1pKAhJ-TsdB0LtWJgdsfTAq-MLU&s=10", description: "A finely textured, warmly spiced Cincinnati-style meat sauce for spaghetti, coneys, or a classic three-way.", prep: "5 min", cook: "1 hr 30", total: "1 hr 35", yield: "6 servings", tags: ["Dinner", "Ohio", "Big batch"], color: "gold", ingredients: [{ category: "Cincinnati chili", items: ["5 cups water", "6 oz tomato paste", "½ oz unsweetened baking chocolate", "¼ cup chili powder", "1 tsp each cinnamon, garlic powder, and cumin", "¼ tsp each allspice, ground cloves, and red pepper flakes", "⅛ tsp black pepper", "¾ tsp salt + ½ tsp sugar", "2 tbsp apple cider vinegar", "1¼ lb lean ground beef"] }, { category: "For serving", items: ["Thin spaghetti or hot dogs", "Finely shredded cheddar", "Diced onion, kidney beans, oyster crackers, and hot sauce"] }], steps: [{ title: "Build the base", text: "Add water, tomato paste, and baking chocolate to a Dutch oven or large pot. Heat over medium, whisking for about 3 minutes until the tomato paste is smooth and the chocolate melts." }, { title: "Add the seasonings", text: "Stir in chili powder, cinnamon, garlic powder, cumin, allspice, cloves, red pepper flakes, black pepper, salt, sugar, and apple cider vinegar." }, { title: "Crumble the beef", text: "Add the raw ground beef and break it into very fine pieces with clean fingers, a potato masher, whisk, or fork. Fine pieces are essential for the signature texture." }, { title: "Bring to a boil", text: "Raise the heat to bring the chili to a boil, stirring so the meat stays evenly broken up." }, { title: "Low-boil until thick", text: "Lower heat to medium-low and cook uncovered at a gentle boil for 1–1½ hours. Stir occasionally until it thickens into a rich meat sauce." }, { title: "Serve a Cincinnati way", text: "For a three-way, spoon chili over thin spaghetti and pile on cheddar. Add onions or beans for a four-way, both for a five-way, or serve over hot dogs for coneys." }], note: "Starting raw beef in the liquid is intentional. It produces the smooth, fine-grained texture that makes Cincinnati chili different from a regular bowl of chili." },
  { id: "best-classic-chili", title: "The Best", subtitle: "Classic chili", image: "https://www.thewholesomedish.com/wp-content/uploads/2018/05/The-Best-Classic-Chili-550.jpg", description: "A quick, traditional beef-and-bean chili with a full homemade spice blend and just enough heat.", prep: "5 min", cook: "25 min", total: "30 min", yield: "6 servings", tags: ["Dinner", "Quick", "Classic"], color: "coral", ingredients: [{ category: "Chili base", items: ["1 tbsp olive oil", "1 medium yellow onion, diced", "1 lb 90% lean ground beef", "1½ cups beef broth", "1 can (15 oz) petite diced tomatoes, with juice", "1 can (16 oz) red kidney beans, drained and rinsed", "1 can (8 oz) tomato sauce"] }, { category: "Homemade chili seasoning", items: ["2½ tbsp chili powder", "2 tbsp ground cumin", "2 tbsp granulated sugar", "2 tbsp tomato paste", "1 tbsp garlic powder", "1½ tsp salt", "½ tsp ground black pepper", "¼ tsp ground cayenne pepper, optional"] }, { category: "For serving", items: ["Shredded cheddar cheese", "Sour cream", "Sliced green onions", "Saltine crackers or oyster crackers", "Diced avocado, optional"] }], steps: [{ title: "Cook the onion", text: "Heat olive oil in a large soup pot over medium-high heat for 2 minutes. Add diced onion and cook 5 minutes, stirring occasionally." }, { title: "Brown the beef", text: "Add ground beef and break it apart with a wooden spoon. Cook 6-7 minutes, stirring occasionally, until browned." }, { title: "Bloom the spices", text: "Add chili powder, cumin, sugar, tomato paste, garlic powder, salt, black pepper, and optional cayenne. Stir until the beef is evenly coated and fragrant." }, { title: "Add the liquids and beans", text: "Add beef broth, diced tomatoes with their juice, drained kidney beans, and tomato sauce. Stir well." }, { title: "Simmer", text: "Bring to a low boil, then reduce to low or medium-low. Simmer uncovered 20-25 minutes, stirring occasionally." }, { title: "Rest and serve", text: "Remove from heat and rest 5-10 minutes. Serve with cheddar, sour cream, green onions, crackers, or avocado." }], note: "Chili powder brands vary a lot in heat. Start with a mild brand for a family-friendly pot, then offer hot sauce at the table." },
  { id: "sams-fried-chicken", title: "Sam's Fried", subtitle: "Chicken", image: "/recipe-book/sam-g-fried-chicken.jpg", description: "Buttermilk-marinated chicken with a deeply seasoned, extra-craggy fried crust.", prep: "20 min", cook: "12 min", total: "1 hr 30", yield: "2 breasts", tags: ["Dinner", "Crispy", "Weekend"], color: "blue", ingredients: [{ category: "Chicken & marinade", items: ["2 chicken breasts, sliced lengthwise", "1 cup (225 ml) buttermilk", "½ tbsp (6 g) kosher salt", "½ tbsp (6 g) garlic powder", "½ tbsp (4 g) white pepper", "1 tsp (5 g) cayenne", "¼ cup hot sauce, such as Tabasco or Cholula"] }, { category: "Dredge", items: ["3 cups (370 g) all-purpose flour", "1 tbsp (10 g) kosher salt", "2 tsp each garlic powder, white pepper, Spanish paprika, mustard powder, celery salt, onion powder, MSG, and oregano", "1 tbsp (10 g) black pepper", "1 tbsp (7 g) cayenne", "Neutral frying oil"] }], steps: [{ title: "Slice the chicken", text: "Slice each chicken breast lengthwise so the pieces cook evenly and form thinner, crispier cutlets." }, { title: "Make the marinade", text: "Whisk buttermilk, kosher salt, garlic powder, white pepper, cayenne, and hot sauce together in a bowl." }, { title: "Marinate", text: "Add chicken, cover, and refrigerate for at least 1 hour or overnight for deeper seasoning." }, { title: "Season the dredge", text: "Whisk flour, kosher salt, garlic powder, paprika, white pepper, mustard powder, celery salt, black pepper, onion powder, MSG, oregano, and cayenne in a medium bowl." }, { title: "Heat the oil", text: "Add about 2½ inches of oil to a heavy-bottomed pot, leaving plenty of headroom. Heat to 350°F." }, { title: "Dredge thoroughly", text: "Press each piece of marinated chicken firmly into the seasoned flour so every surface is coated. Shake off only the loose excess." }, { title: "Fry and rest", text: "Fry in batches for 5–7 minutes, turning as needed, until deeply golden and the center reaches 165°F. Transfer to a wire rack so the crust stays crisp." }], note: "Keep the oil near 350°F and avoid crowding the pot. Crowding drops the temperature and makes the crust greasy instead of crunchy." },
  { id: "chuck-roast", title: "Sammy's", subtitle: "Chuck roast", image: "/recipe-book/sam-g-chuck-roast.jpg", description: "A seasoned, slow-cooked chuck roast with potatoes, carrots, bell pepper, and homemade gravy.", prep: "25 min", cook: "8 hours", total: "8 hr 25", yield: "4–6", tags: ["Dinner", "Slow cooker", "Sunday"], color: "rust", ingredients: [{ category: "Roast & vegetables", items: ["3–4 lb chuck roast", "1 container beef stock", "4 large potatoes, quartered", "4 large carrots, halved", "1 bell pepper, sliced", "4 cloves fresh garlic, minced", "Seasoned salt and black pepper, to taste"] }, { category: "Spice rub & gravy", items: ["1 tsp each garlic powder, onion powder, cumin, and thyme", "½ tsp each Cajun seasoning and red chili powder", "Cornstarch, as needed for gravy"] }], steps: [{ title: "Season and sear", text: "Season the chuck roast with seasoned salt, pepper, and minced garlic. Sear in a large skillet over medium-high heat until browned on all sides, about 2–3 minutes per side." }, { title: "Layer the vegetables", text: "Place quartered potatoes, halved carrots, and sliced bell pepper in the bottom of a crockpot." }, { title: "Rub with spices", text: "Rub the seared roast with garlic powder, onion powder, cumin, thyme, Cajun seasoning, and red chili powder." }, { title: "Build the crockpot", text: "Set the roast on top of the vegetables and pour the beef stock over everything." }, { title: "Cook low and slow", text: "Cover and cook on low for 8 hours, until the roast is tender and pulls apart easily." }, { title: "Make the gravy", text: "Transfer the roast and vegetables to a serving dish. Slowly whisk cornstarch into the crockpot liquid until it thickens into a smooth gravy." }, { title: "Serve", text: "Pour the gravy over the roast and vegetables, then serve hot." }], note: "Sear the roast before slow cooking. The browned crust adds depth to both the meat and the beef-stock gravy." },
  { id: "cinnabon-rolls", title: "Cinnabon Rolls", subtitle: "But better", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQn3hHwscTvL8UlcTDmDTl5Hz9cxS7ANSlXs04AI9ygXPBEe-PUQJ6GNow&s=10", description: "Pillowy homemade cinnamon rolls with a deeply spiced filling and rich cream-cheese vanilla glaze.", prep: "3 hr 30", cook: "15-20 min", total: "4 hr 5 min", yield: "12 rolls", tags: ["Sweet", "Baking", "Brunch"], color: "pink", ingredients: [{ category: "Dough", items: ["4 cups (580 g) all-purpose flour, plus more for bench flour", "½ cup (107 g) granulated sugar", "¾ tsp (6 g) fine sea salt", "⅓ cup (84 g) unsalted butter, softened", "1 cup (235 g) lukewarm whole milk", "2¼ tsp (7 g) instant yeast", "2 large eggs", "1 large egg yolk", "Cooking spray, for greasing"] }, { category: "Cinnamon filling", items: ["1 cup (225 g) light brown sugar", "1 tbsp (14 g) muscovado sugar, optional", "2½ tbsp (17 g) ground cinnamon", "⅓ cup (84 g) unsalted butter, softened, plus more for greasing"] }, { category: "Cream-cheese glaze", items: ["4 oz (115 g) cream cheese, softened", "¾ cup (90 g) powdered sugar", "3 tbsp (45 ml) whole milk, plus more if needed", "½ vanilla bean, seeds scraped from pod"] }], steps: [{ title: "Mix the dry ingredients", text: "In a stand-mixer bowl, whisk flour, sugar, and salt until evenly combined. Add softened butter and work it into the flour with two forks or your fingers." }, { title: "Add yeast and enrichments", text: "Warm milk to about 100°F (38°C), then whisk in instant yeast. With the dough hook on medium-low, add the yeast milk, eggs, and egg yolk. Mix 2-3 minutes until smooth and pulled together." }, { title: "Knead and first rise", text: "Turn dough onto a lightly floured surface and knead 30-60 seconds until completely smooth. Transfer to a greased bowl, cover, and let rise at room temperature until doubled, about 90 minutes." }, { title: "Make the filling", text: "Whisk light brown sugar, muscovado sugar if using, and cinnamon together until evenly combined." }, { title: "Roll and fill", text: "Punch down dough and roll it into a 27-inch-long, ¼-inch-thick rectangle, with the long edge facing you. Spread softened butter over the surface, sprinkle on the cinnamon sugar, and lightly pat it in." }, { title: "Shape the rolls", text: "Starting at the bottom long edge, tightly roll dough into a log. Use a serrated knife to cut twelve 2-inch-thick rolls." }, { title: "Second rise", text: "Grease a 9-by-13-inch baking dish with softened butter. Arrange rolls in four rows of three, turning the tails toward neighboring rolls. Cover and rise until about 1½ times their original size, 30-45 minutes." }, { title: "Bake", text: "Heat oven to 375°F (190°C). Bake 15-20 minutes until golden brown, then cool in the pan for 15 minutes." }, { title: "Glaze and serve", text: "Whip cream cheese until smooth. Beat in powdered sugar, then whisk in milk until the glaze falls easily from a spoon. Add more milk one teaspoon at a time if needed, stir in vanilla bean seeds, drizzle over the warm rolls, and serve." }], note: "For an extra-rich finish, add a little cinnamon-sugar butter and a splash of heavy cream to the pan before baking, as suggested by one of the recipe's reviewers." },
  { id: "ny-style-pizza", title: "Authentic NY", subtitle: "Style pizza", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRV7FE0GJzoL364jS-cZaYKX5qMM0L6iHQcnDzJ7Fq9A&s=10", description: "A thin, foldable New York slice with chewy cold-fermented dough, crisp bottom, browned cheese, and a lightly charred crust.", prep: "1 hr", cook: "5 min", total: "2–3 days", yield: "2 medium pizzas", tags: ["Dinner", "Baking", "Project"], color: "tomato", ingredients: [{ category: "Pizza dough", items: ["450 g high-gluten flour", "50 g sifted spelt or rye flour, optional", "325 g water", "15 g salt", "7.5 g sugar", "2.5 g yeast", "Vital wheat gluten, optional if using bread flour"] }, { category: "Uncooked tomato sauce", items: ["Crushed or whole peeled canned tomatoes", "Salt and dried oregano, to taste", "Sugar, optional to balance acidity"] }, { category: "For each pizza", items: ["Whole-milk, low-moisture mozzarella, shredded", "Pecorino Romano, finely grated", "Dried oregano, optional", "Semolina or semola flour, for the peel", "All-purpose flour, for shaping", "Additional toppings, optional"] }], steps: [{ title: "Mix and autolyse", text: "Combine flours and water until no dry flour remains. Cover and rest 20 minutes so the flour hydrates and begins developing gluten." }, { title: "Add and knead", text: "Add yeast, salt, and sugar. Mix until incorporated, rest another 20 minutes, then knead about 5 minutes until smooth and elastic. If sticky, let it rest 1–2 minutes before continuing." }, { title: "Bulk ferment and divide", text: "Form a tight ball and leave covered at room temperature until roughly doubled or tripled, about 1–3 hours. Divide into two equal portions and form tight dough balls." }, { title: "Cold ferment", text: "Place dough balls in roomy covered containers and refrigerate 2–3 days. This is the sweet spot for flavor and dough strength." }, { title: "Make uncooked sauce", text: "Blend tomatoes with salt and oregano until smooth but still tomato-forward. Add a little sugar only if needed. Do not cook the sauce; dilute only very concentrated tomato products." }, { title: "Heat the steel", text: "Position a baking steel on the second-highest rack. Heat the oven as hot as it will go, ideally 550°F / 290°C, for at least 1 hour and preferably 90 minutes. Take dough out while the oven heats." }, { title: "Shape on a floured surface", text: "Dust a wooden peel with semolina. Generously flour dough, press from the center outward while leaving a thicker rim, then stretch around the edges with knuckles or fists until it reaches your desired diameter." }, { title: "Top lightly and launch", text: "Transfer to the peel. Spiral on a thin, even layer of sauce, add oregano and Pecorino if using, then low-moisture mozzarella. Keep the center light and shake the peel to make sure the pizza slides freely." }, { title: "Bake on steel", text: "Bake 4–5 minutes, rotating halfway through, until the crust is browned and lightly charred and the mozzarella is fully melted and just beginning to separate." }, { title: "Cool, then reheat the slice", text: "Cool finished pizza on a rack 15–20 minutes, then slice. Return a slice directly to the hot steel under the broiler for 60–90 seconds to crisp the bottom and add more char on top." }], note: "A long cold ferment, very hot steel, and the cool-then-reheat slice method are the three keys to a pizzeria-style New York slice at home." },
  { id: "golden-milk-banana-smoothie", title: "Golden Milk", subtitle: "Banana smoothie", image: "/recipe-book/sammy-golden-smoothie.png", description: "A creamy, warmly spiced turmeric smoothie for one large serving.", prep: "5 min", cook: "0 min", total: "5 min", yield: "1 large", tags: ["Drink", "Quick", "Cozy"], color: "gold", ingredients: [{ category: "Blend this", items: ["1 ripe banana, preferably frozen", "1 cup milk of choice", "½ tsp ground turmeric", "¼ tsp ground cinnamon", "Small pinch of ground ginger", "Tiny pinch of black pepper", "1 tsp honey or maple syrup, optional", "½ tsp vanilla, optional", "A few ice cubes if your banana isn’t frozen"] }], steps: [{ title: "Add everything", text: "Add all ingredients to a blender." }, { title: "Blend until creamy", text: "Blend until smooth and creamy, with no banana pieces left behind." }, { title: "Taste and adjust", text: "Add a little more honey or maple syrup if you want it sweeter, then blend once more." }], note: "The tiny pinch of black pepper pairs well with turmeric, but keep it very small so you don’t taste it. For an extra-creamy smoothie, add 1–2 tablespoons of Greek yogurt or nut butter." },
  { id: "buckeye-candy", title: "Buckeye", subtitle: "Candy · no wax", image: "https://www.nutmegnanny.com/wp-content/uploads/2020/12/peanut-butter-buckeyes-7.jpg", description: "Creamy peanut butter centers dipped in chocolate, with no paraffin wax needed.", prep: "20 min", cook: "5 min", total: "55 min", yield: "About 36", tags: ["Sweet", "Baking", "No bake"], color: "lilac", ingredients: [{ category: "Peanut butter centers", items: ["1½ cups creamy peanut butter", "½ cup butter, softened", "1 tsp vanilla", "3½–4 cups powdered sugar"] }, { category: "Chocolate coating", items: ["2 cups chocolate chips", "1 tbsp coconut oil or shortening, optional"] }], steps: [{ title: "Make the filling", text: "Mix peanut butter, butter, and vanilla until smooth." }, { title: "Add the sugar", text: "Stir in powdered sugar a little at a time until the dough is firm enough to roll." }, { title: "Roll and chill", text: "Roll into 1-inch balls, place on a parchment-lined tray, and chill for about 30 minutes." }, { title: "Melt the chocolate", text: "Melt chocolate chips with coconut oil or shortening, if using, until smooth." }, { title: "Dip each buckeye", text: "Stick a toothpick into each peanut butter ball and dip it into chocolate, leaving a small circle of peanut butter showing on top." }, { title: "Set", text: "Place back on parchment and let the chocolate set." }], note: "Keep them in the fridge so they stay firm. You do not need paraffin wax—the chocolate will set just fine on its own." },
  { id: "chai-latte", title: "Sammy's", subtitle: "Chai latte", image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=1200&q=85", description: "A simple, warming stovetop chai with the exact water, milk, and sugar ratio you like.", prep: "2 min", cook: "5 min", total: "7 min", yield: "1 cup", tags: ["Drink", "Quick", "Cozy"], color: "lavender", ingredients: [{ category: "One cup", items: ["⅔ cup water", "1 scoop chai mix or 1 chai tea packet", "⅓ cup milk", "2 scoops sugar", "Cardamom, clove, and cinnamon, optional"] }], steps: [{ title: "Boil the chai", text: "Bring ⅔ cup water to a boil with 1 scoop of chai mix or 1 chai tea packet." }, { title: "Sweeten and spice", text: "Add 2 scoops of sugar. Add cardamom, clove, and cinnamon if you want extra warm spice." }, { title: "Add the milk", text: "Pour in ⅓ cup milk and heat until the chai is hot and steaming." }, { title: "Strain and serve", text: "Strain into a cup, then enjoy right away." }], note: "For this ratio, use two scoops of sugar for every cup of chai. Adjust the spices to make it as cozy as you like." },
  { id: "honey-garlic-salmon", title: "Honey Garlic", subtitle: "Glazed salmon", image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=85", description: "Sticky, sweet, garlicky salmon in one pan and under 20 minutes.", prep: "8 min", cook: "10 min", total: "18 min", yield: "4 servings", tags: ["Dinner", "Quick", "One pan"], color: "orange", ingredients: [{ category: "Salmon & glaze", items: ["4 salmon fillets", "Honey", "Soy sauce", "4 cloves garlic, minced", "Lemon juice", "Butter and black pepper"] }], steps: [{ title: "Make the glaze", text: "Whisk honey, soy sauce, garlic, lemon, and pepper in a small bowl." }, { title: "Sear the salmon", text: "Cook salmon in a hot oven-safe skillet, skin-side down if it has skin, until nearly cooked through." }, { title: "Glaze and broil", text: "Add butter and glaze, spoon over the fish, then broil briefly until bubbling and lacquered." }, { title: "Serve right away", text: "Finish with lemon and serve with rice or greens while the glaze is glossy." }], note: "Keep an eye on the broiler—the honey goes from caramelized to burned in a blink." },
  { id: "garlic-chicken-gyros", title: "Garlic Chicken", subtitle: "Gyros with fries", image: "https://www.recipetineats.com/tachyon/2015/06/Greek-Chicken-Gyros_original-pics__8.jpg", description: "Loaded Greek street-food-style pitas stuffed with garlicky chicken, crisp fries, vegetables, and a bright yogurt sauce.", prep: "45 min", cook: "15 min", total: "1 hour", yield: "4 gyros", tags: ["Dinner", "Fun", "Chicken"], color: "green", ingredients: [{ category: "Garlic chicken", items: ["1½ lb boneless, skinless chicken thighs", "4 garlic cloves, minced", "3 tbsp olive oil", "Juice of 1 lemon", "1 tsp dried oregano", "1 tsp paprika", "½ tsp cumin", "1 tsp salt", "½ tsp black pepper"] }, { category: "Garlic sauce", items: ["¾ cup Greek yogurt", "2 garlic cloves, finely grated", "1 tbsp lemon juice", "1 tbsp olive oil", "Salt, to taste"] }, { category: "For assembling", items: ["4 large pita breads", "French fries, cooked until crispy", "1 tomato, diced or sliced", "½ red onion, thinly sliced", "Shredded lettuce, optional", "Crumbled feta, optional", "Chopped parsley, optional"] }], steps: [{ title: "Marinate the chicken", text: "Mix minced garlic, olive oil, lemon juice, oregano, paprika, cumin, salt, and pepper. Coat the chicken thoroughly and marinate for at least 30 minutes, or up to overnight." }, { title: "Make the garlic sauce", text: "Stir Greek yogurt, finely grated garlic, lemon juice, olive oil, and a pinch of salt together. Refrigerate while preparing the rest of the meal." }, { title: "Cook crispy fries", text: "Bake, air-fry, or deep-fry the fries until very crisp. Season with salt while hot." }, { title: "Cook and rest the chicken", text: "Heat a skillet or grill over medium-high. Cook thighs for 5–7 minutes per side until browned and cooked through. Rest 5 minutes, then slice thinly." }, { title: "Warm the pita", text: "Warm each pita briefly in a dry skillet or microwave until soft, flexible, and easy to wrap." }, { title: "Build the gyros", text: "Spread garlic sauce down the center of each pita. Add chicken, fries, tomato, red onion, and any lettuce, feta, or parsley you like. Drizzle with more sauce and wrap tightly." }], note: "For true loaded-street-food flavor, toss hot fries with oregano, garlic powder, and lemon zest before adding them to the gyro." },
  { id: "tuna-salad", title: "Tuna Salad", subtitle: "The savory one", image: "https://muybuenoblog.com/wp-content/uploads/2024/05/Tuna-Salad-with-Chopped-EggsTuna-Salad-with-Chopped-Eggs.jpeg", description: "Creamy, savory tuna salad with hard-boiled eggs and just enough Worcestershire to make it special.", prep: "10 min", cook: "0 min", total: "10 min", yield: "2–3 servings", tags: ["Lunch", "Quick", "Classic"], color: "blue", ingredients: [{ category: "Mix it up", items: ["1 can tuna, drained", "2 hard-boiled eggs, chopped", "2–3 tbsp mayonnaise", "1 tsp Worcestershire sauce", "1 tsp mustard", "1–2 tbsp finely diced onion or green onion", "Salt and black pepper"] }, { category: "Optional extras", items: ["A little pickle relish", "Paprika", "A squeeze of lemon"] }], steps: [{ title: "Get everything ready", text: "Drain the tuna well, chop the eggs, and finely dice the onion or green onion." }, { title: "Mix until creamy", text: "Combine tuna, eggs, mayonnaise, Worcestershire, mustard, onion, salt, and pepper in a bowl." }, { title: "Taste and tune", text: "Add another small splash of Worcestershire if you want a more savory flavor. Fold in relish, paprika, or lemon if using." }, { title: "Serve your way", text: "Pile it on toast, crackers, lettuce wraps, or between two slices of bread." }], note: "Start with two tablespoons of mayonnaise, then add the third only if you want it extra creamy." },
  { id: "gingerbread-cookies", title: "Gingerbread", subtitle: "Cookies", image: "https://www.lovefromtheoven.com/wp-content/uploads/2018/09/ginger-cookies-5-of-5.jpg", description: "Soft-centered, crisp-edged gingerbread cookies with lots of molasses and a confident amount of spice.", prep: "4 hours", cook: "10 min", total: "4 hr 30", yield: "24 cookies", tags: ["Sweet", "Baking", "Holiday"], color: "rust", ingredients: [{ category: "Dry ingredients", items: ["3½ cups all-purpose flour", "1 tsp baking soda + ½ tsp salt", "1 tbsp ground ginger", "1 tbsp ground cinnamon", "½ tsp each allspice and cloves"] }, { category: "Wet ingredients", items: ["10 tbsp unsalted butter, softened", "¾ cup packed brown sugar", "⅔ cup unsulphured or dark molasses", "1 large egg", "1 tsp vanilla extract"] }, { category: "To finish", items: ["Flour for rolling", "Cookie icing, royal icing, or buttercream"] }], steps: [{ title: "Whisk the dry ingredients", text: "Whisk flour, baking soda, salt, ginger, cinnamon, allspice, and cloves together in a medium bowl." }, { title: "Make the dough", text: "Beat butter until creamy, then beat in brown sugar and molasses. Add egg and vanilla, then mix in the dry ingredients on low until a thick, slightly sticky dough forms." }, { title: "Chill two discs", text: "Divide dough in half, wrap each portion, and pat into a disc. Chill for at least 3 hours and up to 3 days." }, { title: "Roll and cut", text: "Heat oven to 350°F. Roll one chilled disc to ¼-inch thick on a generously floured surface, cut shapes, and place them 1 inch apart on lined baking sheets." }, { title: "Bake and cool", text: "Bake 9–10 minutes (adjust for cutter size). Cool on the sheet for 5 minutes, then move to a rack to cool completely." }, { title: "Decorate", text: "Ice only after the cookies are fully cool. Add the smiles, bow-ties, and buttons." }], note: "The long chill is what keeps the shapes tidy. If the dough gets sticky while rolling, flour the surface and return it to the fridge for a few minutes." },
  { id: "chicken-fried-rice", title: "Chicken", subtitle: "Fried rice", image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=1200&q=85", description: "A fast, takeout-style chicken fried rice with toasted cold rice, egg, vegetables, and a savory sesame finish.", prep: "10 min", cook: "12 min", total: "22 min", yield: "4 servings", tags: ["Dinner", "Quick", "Leftovers"], color: "yellow", ingredients: [{ category: "Rice and stir-fry", items: ["2 cups cooked, cold white rice", "1 lb boneless chicken breast or thighs, diced small", "2 eggs, beaten", "1 cup frozen peas and carrots", "3 green onions, sliced", "2–3 cloves garlic, minced", "2–3 tbsp neutral oil, divided", "½ tsp black pepper", "Salt, as needed"] }, { category: "Sauce", items: ["3 tbsp soy sauce", "1 tbsp oyster sauce, optional but recommended", "1 tsp sesame oil"] }], steps: [{ title: "Cook the chicken", text: "Heat 1 tablespoon oil in a large skillet or wok over medium-high heat. Add chicken, season lightly with salt and pepper, and cook until browned and cooked through. Transfer to a plate." }, { title: "Scramble the eggs", text: "Add a little more oil if needed. Pour in the beaten eggs and scramble until just cooked. Remove them, or push them to one side of the pan." }, { title: "Stir-fry the vegetables", text: "Add peas, carrots, garlic, and most of the green onions. Stir-fry for 1–2 minutes until fragrant and hot." }, { title: "Fry the rice", text: "Add cold rice and break up every clump. Cook for 3–4 minutes, stirring occasionally, until the rice is hot and beginning to toast." }, { title: "Season over high heat", text: "Return chicken and eggs to the pan. Add soy sauce, oyster sauce, and sesame oil, then toss over high heat for another 1–2 minutes." }, { title: "Finish and serve", text: "Taste and add more soy sauce, salt, or pepper if needed. Top with the remaining green onions and serve immediately." }], note: "Use rice that was cooked and refrigerated beforehand. Cold, slightly dry rice fries beautifully and will not turn mushy." },
  { id: "chana-masala", title: "Chana", subtitle: "Masala", image: "/recipe-book/chana-masala-card.jpg", description: "A warm North Indian chickpea curry simmered in a fragrant onion-tomato masala with plenty of spices and herbs.", prep: "10 min", cook: "40 min", total: "50 min", yield: "4 servings", tags: ["Dinner", "Vegetarian", "Indian"], color: "gold", ingredients: [{ category: "Chickpeas", items: ["1 cup dried chickpeas, or 2 cans (15 oz each) chickpeas", "1½ cups water for pressure-cooking, plus more for gravy"] }, { category: "Onion-tomato masala", items: ["2 tbsp oil", "1 small bay leaf, optional", "1 inch cinnamon stick, optional", "2 cloves, optional", "2 green cardamoms, optional", "1½ cups finely chopped onion", "1 green chili, slit, optional", "¾–1 tbsp ginger-garlic paste", "1½ cups finely chopped tomatoes", "¾ tsp salt, plus more to taste"] }, { category: "Spices and finish", items: ["¼ tsp turmeric", "1½ tsp Kashmiri red chili powder, adjust to taste", "1 tsp garam masala", "2 tsp coriander powder", "½ tsp cumin powder, optional", "1 tsp kasuri methi (dried fenugreek leaves), optional", "¼ tsp amchur (dried mango powder), optional", "2 tbsp finely chopped cilantro", "Lemon juice, optional for serving"] }], steps: [{ title: "Soak and cook the chickpeas", text: "If using dried chickpeas, rinse and soak in 3½–4 cups water overnight or at least 8 hours. Drain, rinse, and pressure-cook with 1½ cups fresh water for 5–6 whistles, or use an Instant Pot on high pressure for 18 minutes. They should mash easily when squeezed. For canned chickpeas, drain and rinse them well." }, { title: "Bloom the whole spices", text: "Heat oil in a large pot. If using, add bay leaf, cinnamon, cloves, and cardamoms; let them sizzle briefly." }, { title: "Cook the aromatics", text: "Add onion and green chili if using. Sauté until light golden, about 8–9 minutes. Add ginger-garlic paste and cook 1 minute without browning it." }, { title: "Make the tomato masala", text: "Add tomatoes and salt. Cook 6–7 minutes until soft, pulpy, and thick. Stir in red chili powder, turmeric, garam masala, coriander powder, and cumin powder; sauté 3–4 minutes until fragrant." }, { title: "Blend if you like", text: "For a smooth gravy, discard the bay leaf and cinnamon, cool the masala, then blend it with 2 tablespoons cooked chickpeas. Return the puree to the pot. Skip this step for a chunkier curry." }, { title: "Simmer the chana", text: "Add chickpeas with about 1¼ cups cooking stock, then add ¾–1 cup more water as needed. For canned chickpeas, add about 1¾ cups water. Taste for salt, cover, and simmer 15 minutes until thick." }, { title: "Finish and serve", text: "Crush kasuri methi between your palms and stir it in with amchur. Garnish with cilantro and lemon juice if desired. Serve with basmati rice, jeera rice, naan, roti, or chapati." }], note: "Canned chickpeas should be tender but still hold their shape. The tomato gravy is acidic, so chickpeas will not soften much after they go into the masala." },
  { id: "chicken-pakora", title: "Chicken", subtitle: "Pakora", image: "/recipe-book/chicken-pakora-card.jpg", description: "Crispy Andhra-style chicken pakora with a lightly spiced gram-flour coating and tender chicken inside.", prep: "10 min", cook: "15 min", total: "25 min", yield: "4 servings", tags: ["Dinner", "Indian", "Crispy"], color: "rust", ingredients: [{ category: "Pakora mixture", items: ["½ lb boneless chicken, cut into bite-size pieces", "¼ cup onion, finely chopped or thinly sliced, optional", "1–2 green chilies, chopped, optional", "¾ tbsp ginger-garlic paste", "¾–1 tsp Kashmiri red chili powder", "¾–1 tsp garam masala", "¼ tsp turmeric", "⅓ tsp salt, plus more to taste", "2 sprigs curry leaves, or 2 tbsp chopped mint or cilantro", "6 tbsp besan (gram flour)", "3 tbsp rice flour or cornstarch", "1 egg white", "2–3 tbsp water, as needed", "Oil, for deep frying"] }], steps: [{ title: "Season the flour", text: "Mix besan, rice flour, salt, turmeric, red chili powder, and garam masala in a large bowl. Taste a tiny pinch and adjust salt or spice before adding chicken." }, { title: "Build the coating", text: "Add ginger-garlic paste, onion, herbs, green chilies if using, chicken, and egg white. Add only enough water to form a thick, stiff, dough-like coating, not a loose batter." }, { title: "Heat the oil", text: "Heat oil in a deep pan over medium to medium-high heat. A small piece of coating should sizzle and rise slowly without browning immediately." }, { title: "Fry in batches", text: "Slide coated chicken pieces gently into the oil without crowding. Leave untouched for 2 minutes, then stir and fry until golden and crisp." }, { title: "Drain and serve", text: "Transfer pakora to a wire rack or steel colander. Bring oil back to temperature between batches and serve hot with green chutney or masala chai." }], note: "Rice flour or cornstarch is what keeps these crisp. Too much water makes the coating soft, so add it a little at a time." },
  { id: "chicken-65", title: "Chicken", subtitle: "65", image: "/recipe-book/chicken-65-card.jpg", description: "Crispy South Indian chicken with curry leaves, warming spice, and an optional punchy chili-garlic tempering.", prep: "15 min", cook: "15 min", total: "30 min", yield: "4 servings", tags: ["Dinner", "Indian", "Crispy"], color: "coral", ingredients: [{ category: "Marinade", items: ["1.3 lb boneless chicken, cut into ¾-inch pieces", "1 tbsp ginger-garlic paste", "⅓ tsp salt", "1½ tsp Kashmiri red chili powder", "¼ tsp turmeric", "1 tsp garam masala", "2 sprigs curry leaves, finely chopped", "4 tbsp plain yogurt", "1 tsp lemon juice"] }, { category: "Coating and fry", items: ["4 tbsp cornstarch", "2 tbsp rice flour or all-purpose flour", "1 egg white, or 2½ tbsp yogurt", "Oil, for deep frying", "2 sprigs curry leaves, dried thoroughly", "4–6 green chilies, slit, seeded, and dried thoroughly"] }, { category: "Optional chili-garlic tempering", items: ["1 tbsp chopped garlic", "½–1 tbsp garlic paste", "2 tsp Kashmiri red chili powder", "½ tsp sugar", "1 tsp lemon juice or vinegar", "2 tbsp water", "¼ tsp salt", "½ tsp ground black pepper"] }], steps: [{ title: "Marinate", text: "Mix chicken with ginger-garlic paste, salt, red chili powder, turmeric, garam masala, chopped curry leaves, yogurt, and lemon juice. Cover and refrigerate at least 1 hour, or up to 36 hours." }, { title: "Make the coating", text: "When ready to fry, add cornstarch, rice flour, and egg white to the chicken. Mix to a moist coating that clings well. Add only a splash of water if it feels too dry." }, { title: "Fry crisp", text: "Heat oil over medium. Fry chicken in batches without disturbing it for the first 2 minutes. Stir and fry until crisp and golden, about 4½–5 minutes per batch." }, { title: "Fry the garnish", text: "Lower heat and carefully fry the dried curry leaves until crisp, then fry dried, slit green chilies until lightly blistered. Serve this Chennai-style version as is, or continue with tempering." }, { title: "Temper if desired", text: "Warm 2 tablespoons oil in a wok. Fry garlic, curry leaves, and green chilies briefly. Lower heat, stir in the chili-garlic paste, water, and salt, then cook to a thick paste. Turn off heat, toss with fried chicken, and finish with black pepper." }], note: "For a kid-friendly version, reduce the chili powder and skip the optional tempering. Keep curry leaves and chilies very dry before frying to prevent splatter." },
  { id: "butter-chicken", title: "Butter", subtitle: "Chicken", image: "/recipe-book/butter-chicken-card.jpg", description: "Silky, restaurant-style chicken makhani with yogurt-marinated chicken, tomatoes, cashews, butter, and cream.", prep: "15 min", cook: "30 min", total: "45 min + marinating", yield: "4 servings", tags: ["Dinner", "Indian", "Cozy"], color: "tomato", ingredients: [{ category: "First and second marinades", items: ["1.1 lb boneless chicken, cut into 1-inch pieces", "½–¾ tsp Kashmiri red chili powder", "¼–⅓ tsp salt", "¾–1 tbsp lemon juice", "⅓ cup Greek yogurt", "¾ tbsp ginger-garlic paste", "⅛ tsp turmeric, optional", "¾–1 tsp garam masala", "½ tsp cumin powder, optional", "1 tsp coriander powder, optional", "1 tsp kasuri methi", "¾–1 tbsp oil"] }, { category: "Makhani sauce", items: ["2–3 tbsp butter or ghee, divided", "2-inch cinnamon piece, optional", "2–4 green cardamoms, optional", "2–4 cloves, optional", "1½ cups sliced onion, optional", "600 g fresh tomatoes, or 1 cup passata", "28 raw cashews", "½ cup water for blending", "¾ tbsp ginger-garlic paste", "1–2 green chilies, optional", "1–2 tsp Kashmiri red chili powder", "1–1½ tsp garam masala", "1–1½ tsp coriander powder, optional", "½ tsp cumin powder, optional", "½–¾ tsp salt", "1 tsp sugar", "½ tbsp kasuri methi", "1½ cups hot water", "⅓ cup heavy cream", "2 tbsp chopped cilantro"] }], steps: [{ title: "Marinate the chicken", text: "Mix chicken with chili powder, salt, and lemon juice; rest 20 minutes. Add yogurt, ginger-garlic paste, remaining spices, kasuri methi, and oil. Cover and refrigerate at least 30 minutes, or overnight for the best tenderness." }, { title: "Blend the sauce base", text: "If using onion, sauté it in a little oil until lightly golden and cool. Blend onion, tomatoes, cashews, and water into a very smooth puree. Soak cashews in hot water first if your blender needs help." }, { title: "Cook the makhani sauce", text: "Melt butter and sizzle whole spices if using. Add ginger-garlic paste and green chilies, then briefly cook the ground spices off heat. Stir in tomato-cashew puree and cook partially covered until thick." }, { title: "Simmer", text: "Add hot water and simmer 10 minutes until glossy and thick, with traces of butter visible. Remove whole spices if you prefer." }, { title: "Roast the chicken", text: "Pan-roast marinated chicken in a little butter or ghee over medium heat in batches until just cooked and the marinade dries up. Avoid overcooking." }, { title: "Finish the butter chicken", text: "Add chicken to the sauce and simmer 5–7 minutes. Season with salt, sugar, and kasuri methi, then turn off heat and stir in cream. Garnish with cilantro and serve with rice or naan." }], note: "Use thick Greek yogurt and sweet, ripe tomatoes. The sauce gets its signature silky richness from cashews plus cream, not from overloading it with spice." },
  { id: "french-onion-soup", title: "French Onion", subtitle: "Soup", image: "/recipe-book/french-onion-soup-card.jpg", description: "Deeply caramelized onions in a Worcestershire-beef bouillon broth, finished with baguette and melted Baby Swiss.", prep: "15 min", cook: "1 hr 10 min", total: "1 hr 25 min", yield: "6 servings", tags: ["Dinner", "Cozy", "Soup"], color: "gold", ingredients: [{ category: "Soup", items: ["5 large yellow onions, thinly sliced", "4 tbsp butter", "1 tbsp olive oil", "2 cloves garlic, minced", "8 cups water", "Beef bouillon for 8 cups broth", "1½ tbsp Worcestershire sauce", "1 tsp black pepper, plus more to taste", "½ tsp dried thyme", "1 bay leaf", "1–2 tsp sugar, optional", "Salt, only if needed"] }, { category: "To finish", items: ["1 French baguette", "10–12 oz Baby Swiss cheese, sliced or shredded", "2 tbsp grated Parmesan, optional"] }], steps: [{ title: "Caramelize the onions", text: "Melt butter with olive oil in a large soup pot over medium-low. Add onions and sugar if using. Cook 35–45 minutes, stirring regularly, until very soft and deep golden brown." }, { title: "Add garlic", text: "Stir in garlic and cook about 1 minute until fragrant." }, { title: "Build the broth", text: "Add water, beef bouillon, Worcestershire, black pepper, thyme, and bay leaf. Bring to a gentle boil." }, { title: "Simmer", text: "Reduce heat and simmer uncovered 25–30 minutes. Remove bay leaf, then taste before adding salt. Add more pepper or Worcestershire if you want a stronger flavor." }, { title: "Toast the bread", text: "Slice baguette into ¾- to 1-inch pieces and toast until lightly browned and crisp." }, { title: "Broil and serve", text: "Ladle soup into oven-safe bowls. Top with toast, Baby Swiss, and Parmesan if using. Broil 2–4 minutes, watching closely, until cheese is bubbly and lightly browned." }], note: "For an extra-rich bouillon broth, stir in one more tablespoon of butter near the end of simmering." },
  { id: "easy-meat-sauce", title: "Easy Meat", subtitle: "Sauce", image: "/recipe-book/easy-meat-sauce-card.jpg", description: "A simple 30-minute meat sauce for pasta, with ground meat, marinara, oregano, fresh basil, and a little chili heat.", prep: "10 min", cook: "20 min", total: "30 min", yield: "4 servings", tags: ["Dinner", "Quick", "Pasta"], color: "tomato", ingredients: [{ category: "Sauce", items: ["1 lb ground beef or Italian sausage", "1 small onion, diced", "2 cloves garlic, minced", "1 jar (24 oz) marinara or pasta sauce", "1 tsp dried oregano", "Salt and black pepper, to taste", "1 tbsp olive oil, optional", "Fresh basil, torn", "1 red chili pepper, thinly sliced", "Parmesan, optional"] }, { category: "To serve", items: ["Cooked spaghetti, rigatoni, or favorite pasta", "A splash of pasta water, optional"] }], steps: [{ title: "Brown the meat", text: "Brown ground beef or Italian sausage in a large skillet over medium heat, breaking it into small pieces." }, { title: "Cook the aromatics", text: "Add onion and cook 3–4 minutes. Add garlic and red chili, then cook 30 seconds more." }, { title: "Drain if needed", text: "Drain excess grease if the meat released a lot of fat." }, { title: "Simmer the sauce", text: "Stir in marinara and oregano. Simmer gently on low for 10–15 minutes, then taste and season with salt and black pepper." }, { title: "Toss and finish", text: "Add a splash of pasta water before combining with cooked pasta. Finish with fresh basil and Parmesan if using." }], note: "Pasta water helps the sauce cling to noodles and makes the finished dish feel more cohesive." },
  { id: "classic-burgers", title: "Classic", subtitle: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=85", description: "Juicy, well-seasoned burgers with a crisp seared crust, melted cheese, and all the classic toppings.", prep: "15 min", cook: "10 min", total: "25 min", yield: "4 burgers", tags: ["Dinner", "Quick", "Grill"], color: "rust", ingredients: [{ category: "Burgers", items: ["1½ lb 80/20 ground beef", "1 tsp kosher salt", "½ tsp black pepper", "½ tsp garlic powder, optional", "4 burger buns", "4 slices cheddar or American cheese", "Butter or oil, for buns"] }, { category: "Toppings", items: ["Lettuce leaves", "1 tomato, sliced", "½ red or yellow onion, thinly sliced", "Pickles", "Ketchup, mustard, and mayonnaise"] }], steps: [{ title: "Shape the patties", text: "Divide beef into four loose 6-ounce portions. Gently form patties about ¾ inch thick, then press a shallow dimple in the center of each so they stay flat as they cook." }, { title: "Season right before cooking", text: "Season both sides generously with salt, pepper, and garlic powder if using. Do not mix seasonings into the beef, which can make the texture dense." }, { title: "Heat the grill or skillet", text: "Heat a grill, cast-iron skillet, or griddle over medium-high until very hot. Lightly oil the surface only if needed." }, { title: "Cook the burgers", text: "Cook patties 3–4 minutes on the first side without pressing them down. Flip once and cook 3–4 minutes more for medium, adjusting for your preferred doneness." }, { title: "Melt cheese and toast buns", text: "Add cheese during the final minute and cover briefly to melt. Butter and toast buns cut-side down until lightly golden." }, { title: "Build and serve", text: "Layer sauce, lettuce, burger, tomato, onion, pickles, and the top bun. Serve immediately with fries, chips, or a salad." }], note: "The best burger trick is restraint: handle the beef lightly and never press a cooking patty with a spatula, or you lose the juices." },
  { id: "classic-hot-dogs", title: "Classic", subtitle: "Hot dogs", image: "/recipe-book/classic-hot-dogs-card.jpg", description: "Grilled or pan-seared hot dogs with soft toasted buns and a build-your-own topping lineup.", prep: "10 min", cook: "10 min", total: "20 min", yield: "4 hot dogs", tags: ["Dinner", "Quick", "Grill"], color: "coral", ingredients: [{ category: "Hot dogs", items: ["4 all-beef hot dogs", "4 hot-dog buns", "1 tbsp butter, optional", "½ cup water, for skillet steaming"] }, { category: "Toppings", items: ["Yellow mustard", "Ketchup", "Diced onion", "Sweet or dill relish", "Sauerkraut, optional", "Pickled sport peppers or jalapeños, optional", "Shredded cheddar or chili, optional"] }], steps: [{ title: "Prep the dogs", text: "Make a few shallow diagonal cuts across each hot dog. This helps them heat evenly and gives grilled dogs more crisp edges." }, { title: "Grill method", text: "Grill over medium heat for 6–8 minutes, turning every minute or two, until hot throughout with browned, lightly blistered edges." }, { title: "Skillet method", text: "For stovetop dogs, add hot dogs and ½ cup water to a skillet over medium heat. Cover and steam 3–4 minutes until water evaporates, then roll dogs in the pan until browned." }, { title: "Toast the buns", text: "Butter buns if using and toast them cut-side down on the grill or in a skillet until warm and lightly golden." }, { title: "Top your way", text: "Place each dog in a bun and add mustard, ketchup, onion, relish, sauerkraut, peppers, cheese, or chili. Serve hot." }], note: "Steaming first and browning second gives skillet hot dogs a great snap without drying them out." },
  { id: "chef-marshalls-challah", title: "Chef Marshall's", subtitle: "Famous challah", image: "/recipe-book/sam-g-challah.jpg", description: "A celebratory, honey-kissed braided challah with a glossy egg-washed crust and your choice of cinnamon, sesame, or poppy seeds.", prep: "35 min", cook: "30–40 min", total: "5 hr 15 min", yield: "3 loaves", tags: ["Sweet", "Baking", "Weekend"], color: "gold", ingredients: [{ category: "Yeast starter", items: ["2 oz active dry yeast", "½ cup warm water", "1 tsp sugar"] }, { category: "Dough", items: ["2 cups warm water", "1 cup sugar", "1 cup vegetable oil", "1 tbsp plus 1 tsp salt", "1 tbsp vanilla extract", "2 tbsp–¼ cup honey", "½ tsp baking powder", "4 whole eggs", "12 cups flour, divided"] }, { category: "Egg wash and toppings", items: ["1 egg yolk mixed with water, for egg wash", "Ground cinnamon, for sprinkling", "Sesame seeds, for sprinkling", "Poppy seeds, for sprinkling"] }], steps: [{ title: "Proof the yeast", text: "Mix ½ cup warm water, 1 teaspoon sugar, and active dry yeast. Let stand 2–3 minutes, until foamy." }, { title: "Build the dough", text: "In a large mixing bowl, combine the remaining 2 cups warm water, sugar, oil, vanilla, honey, salt, baking powder, yeast mixture, eggs, and 4 cups flour. Begin mixing until combined." }, { title: "Add flour gradually", text: "Add most of the remaining flour 2 cups at a time, mixing well after each addition. Reserve 2 cups flour for kneading." }, { title: "Knead and first rise", text: "Knead 5 minutes in the mixer, then knead 5 minutes by hand on the table, using reserved flour only as needed. Lightly grease a bowl, cover with a damp cloth, and rest in a warm place until nearly doubled." }, { title: "Second rise", text: "Punch down the dough, cover again, and let rise in a warm place until doubled once more." }, { title: "Braid the loaves", text: "Punch down dough and divide into three equal portions. For each loaf, make three 10-inch ropes and braid them together." }, { title: "Proof and finish", text: "Place braids on greased baking sheets. Brush with egg wash and sprinkle with cinnamon, sesame seeds, or poppy seeds. Cover and rest in a warm spot for 1 hour." }, { title: "Bake", text: "Heat oven to 350°F. Bake 30–40 minutes, until the tops are deeply golden and the loaves sound hollow when tapped." }], note: "Use warm, not hot, water for the starter. If it does not foam, the yeast is inactive and the dough will not rise properly." },
  { id: "goldstein-snickerdoodles", title: "Goldstein", subtitle: "Snickerdoodles", image: "/recipe-book/sam-g-snickerdoodles-goldstein.jpg", description: "Soft-centered snickerdoodles with tangy cream of tartar and a generous cinnamon-sugar crackle.", prep: "20 min", cook: "11 min", total: "31 min", yield: "16 cookies", tags: ["Sweet", "Baking", "Quick"], color: "lilac", ingredients: [{ category: "Cookie dough", items: ["1.52 cups (190 g) all-purpose flour", "1 tsp cream of tartar", "½ tsp baking soda", "¼ tsp salt", "½ cup unsalted butter, softened", "¾ cup (150.7 g) sugar", "1 room-temperature egg", "½ tsp vanilla extract"] }, { category: "Cinnamon-sugar coating", items: ["⅓ cup (50 g) sugar", "1½ tsp ground cinnamon"] }], steps: [{ title: "Mix the dry ingredients", text: "Whisk flour, baking soda, cream of tartar, and salt together in a medium bowl." }, { title: "Cream butter and sugar", text: "In a large bowl or stand mixer fitted with the paddle, beat sugar and softened butter on medium speed until light and fluffy, about 3 minutes. Add egg, scrape down the bowl, then mix in vanilla." }, { title: "Finish the dough", text: "Set mixer to low and gradually add the dry ingredients. Beat only until just combined, then scrape down the bowl and incorporate any remaining dry bits." }, { title: "Make the coating", text: "Stir sugar and cinnamon together in a small bowl until evenly combined." }, { title: "Shape and coat", text: "Roll dough into 30 g balls, coat each one in cinnamon sugar, and place 2 inches apart on a baking sheet. Press each ball down slightly." }, { title: "Bake", text: "Bake at 350°F for 11 minutes. Let cookies cool briefly on the baking sheet before moving them to a rack." }], note: "Take the cookies out when the centers still look soft. They will finish setting as they cool, keeping the middle tender." },
  { id: "joshua-weissman-canes-chicken", title: "Joshua Weissman's", subtitle: "Raising Cane's chicken", image: "https://cdn.prod.website-files.com/6744d2d124649f6ecd466f50/67ad3cd3be65e23b026a379a_Making%20Raising%20Cane%27s%20Chicken%20Finger%20Combo%20At%20Home%20%7C%20But%20Better.jpg", description: "Sammy's favorite Raising Cane's-style chicken-tender combo: crisp buttermilk chicken, seasoned fries, buttery Texas toast, slaw, and a punchy signature sauce.", prep: "1 hr 30 min", cook: "45 min", total: "2 hr 15 min", yield: "4 combos", tags: ["Dinner", "Crispy", "Weekend"], color: "gold", ingredients: [{ category: "Cane's-style sauce", items: ["¾ cup mayonnaise", "5 tbsp ketchup", "1½ tbsp Worcestershire sauce", "3 garlic cloves, finely grated", "1½ tsp kosher salt", "Freshly ground black pepper"] }, { category: "Chicken and coating", items: ["4 boneless, skinless chicken breasts, halved lengthwise", "1½ cups buttermilk", "1 tbsp kosher salt", "1 tbsp garlic powder", "1 tbsp ground white pepper", "1½ cups all-purpose flour", "2 tsp each garlic powder, paprika, and white pepper", "Oil, for frying"] }, { category: "Fries, slaw, and toast", items: ["2½ lb russet potatoes", "½ head green cabbage, thinly sliced", "2 carrots, grated", "2 dill pickles, grated", "½ cup mayonnaise + ¼ cup buttermilk", "1 lemon, zested and juiced", "4 thick slices sourdough or brioche", "½ cup butter + 1–3 garlic cloves"] }], steps: [{ title: "Make the sauce", text: "Stir mayonnaise, ketchup, Worcestershire, garlic, salt, and black pepper together. Refrigerate at least 1 hour so the flavor settles in." }, { title: "Mix the slaw", text: "Combine mayo, buttermilk, lemon, grated carrot and pickle, then fold in cabbage. Season to taste and keep chilled." }, { title: "Marinate the chicken", text: "Whisk buttermilk with salt, garlic powder, and white pepper. Coat the chicken and refrigerate for at least 1 hour, or overnight." }, { title: "Prepare the fries", text: "Cut potatoes into thin batons and soak in cold salted water for 30 minutes. Dry thoroughly, fry once at 300°F until softened, then again at 400°F until crisp. Salt immediately." }, { title: "Dredge and fry", text: "Mix flour with salt, garlic powder, paprika, and white pepper. Press each tender firmly into the flour, then fry at 350°F in small batches for 5–7 minutes, until deeply golden and cooked through." }, { title: "Make Texas toast and serve", text: "Melt butter with garlic, toast bread in the butter on both sides, brush with more garlic butter, and finish with flaky salt. Serve each plate with two tenders, fries, slaw, toast, and the sauce." }], note: "Credit: adapted from Joshua Weissman's 'Making Raising Cane's Chicken Finger Combo At Home | But Better' (joshuaweissman.com)." },
  { id: "addisons-fish-sauce-wings", title: "Addison's Fish Sauce", subtitle: "Chicken wings", image: "https://delightfulplate.com/wp-content/uploads/2020/03/Vietnamese-Fish-Sauce-Chicken-Wings-Canh-Ga-Chien-Nuoc-Mam.jpg", description: "Crispy air-fried chicken wings with a simple sweet-savory fish-sauce marinade and a fresh green-onion finish.", prep: "10 min", cook: "7–14 min", total: "2 hr 20 min", yield: "4 servings", tags: ["Dinner", "Crispy", "Quick"], color: "gold", owner: "addison", ingredients: [{ category: "Wings", items: ["2 lb chicken wings, split at joints and patted dry", "1 tbsp fish sauce", "1 tbsp sugar", "1 tsp garlic powder", "1 tsp onion powder", "2 tbsp cornstarch", "Cooking spray or neutral oil spray"] }, { category: "To finish", items: ["2–3 green onions, thinly sliced", "Lime wedges, optional"] }], steps: [{ title: "Season and marinate", text: "Add wings, fish sauce, sugar, garlic powder, and onion powder to a large zip-top bag. Seal, shake until coated, then refrigerate for 2–4 hours." }, { title: "Coat the wings", text: "Remove the wings from the bag and coat evenly in cornstarch. Shake away loose excess so the coating stays light and crisp." }, { title: "Air-fry crisp", text: "Preheat the air fryer to 400°F. Arrange wings in a single layer, lightly spray with oil, and air-fry for 7 minutes. Flip, then continue in short 3–5 minute intervals until crisp, browned, and the thickest piece reaches 165°F." }, { title: "Garnish and serve", text: "Transfer the hot wings to a serving plate and shower with sliced green onion. Add lime if you want a bright finish." }], note: "Do not crowd the air-fryer basket. Depending on wing size and the air fryer, a second crisping pass after the initial 7 minutes gives the best result." },
  { id: "easy-homemade-horchata", title: "Easy Homemade", subtitle: "Horchata", image: "https://bellyfull.net/wp-content/uploads/2022/04/Horchata-blog-1.jpg", description: "A creamy, cinnamon-kissed rice drink made at home with both evaporated and sweetened condensed milk.", prep: "10 min", cook: "0 min", total: "4 hr 10 min", yield: "6 servings", tags: ["Drinks", "Sweet", "Make ahead"], color: "peach", owner: "sammy", ingredients: [{ category: "For the horchata", items: ["1 cup long-grain white rice", "2 cinnamon sticks", "4 cups hot water", "1 can (12 oz) evaporated milk", "½ can (7 oz) sweetened condensed milk", "1 tsp vanilla extract", "¼ tsp ground cinnamon, plus more for serving", "Pinch of salt"] }, { category: "To serve", items: ["Ice", "Cinnamon sticks, optional"] }], steps: [{ title: "Soak the rice", text: "Add the rice and cinnamon sticks to a blender. Pour in the hot water, pulse a few times to break up the rice, then cover and refrigerate for at least 4 hours or overnight." }, { title: "Blend smooth", text: "Blend the soaked rice mixture for 1–2 minutes, until the rice is very finely ground and the mixture looks milky." }, { title: "Strain", text: "Pour through a fine-mesh strainer lined with cheesecloth or a clean thin kitchen towel into a pitcher. Press gently; do not force gritty rice solids through." }, { title: "Make it creamy", text: "Whisk in evaporated milk, sweetened condensed milk, vanilla, ground cinnamon, and salt. Taste and add a splash of water if you want it lighter." }, { title: "Chill and serve", text: "Refrigerate until cold. Stir well, pour over ice, and finish each glass with a light dusting of cinnamon." }], note: "For the smoothest horchata, give the rice a full overnight soak and strain it twice. It keeps chilled for up to 3 days; stir before pouring." },
];

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
const RECIPE_SKILL_URL = "https://www.daytongrowth.co/recipe-book/Caruso-Recipe-Book.zip";
const recipeSkillGuides = {
  codex: {
    label: "Codex",
    install: `curl -fsSL "${RECIPE_SKILL_URL}" -o "/tmp/Caruso-Recipe-Book.zip" && mkdir -p ~/.codex/skills && unzip -oq "/tmp/Caruso-Recipe-Book.zip" -d ~/.codex/skills && node ~/.codex/skills/caruso-recipe-book/scripts/configure.mjs`,
    run: "$caruso-recipe-book",
  },
  claude: {
    label: "Claude Code",
    install: `curl -fsSL "${RECIPE_SKILL_URL}" -o "/tmp/Caruso-Recipe-Book.zip" && mkdir -p ~/.claude/skills && unzip -oq "/tmp/Caruso-Recipe-Book.zip" -d ~/.claude/skills && node ~/.claude/skills/caruso-recipe-book/scripts/configure.mjs`,
    run: "/caruso-recipe-book",
  },
} as const;

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

export function BennyRecipeBook() {
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
  const [addGuidePlatform, setAddGuidePlatform] = useState<keyof typeof recipeSkillGuides>("codex");
  const [copiedGuide, setCopiedGuide] = useState<"install" | "run" | "">("");
  const [portions, setPortions] = useState<Record<string, number>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recipeSheetRef = useRef<HTMLDivElement>(null);
  const addGuideCloseRef = useRef<HTMLButtonElement>(null);
  const shareTimerRef = useRef<number | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const selected = recipes.find((recipe) => recipe.id === selectedId) ?? recipes[0];
  const checked = checkedByRecipe[selected.id] ?? [];
  const ingredientCount = selected.ingredients.flatMap((group) => group.items).length;
  const basePortions = recipePortions(selected);
  const activePortions = portions[selected.id] ?? basePortions;
  const portionMultiplier = activePortions / basePortions;
  const activeProfile = recipeProfile(activeOwner);
  const selectedProfile = recipeProfile(recipeOwner(selected));
  const activeOwnerCount = activeOwner === "all" ? recipes.length : recipes.filter((recipe) => recipeOwner(recipe) === activeOwner).length;
  const filtered = useMemo(() => {
    const activeCollection = collections.find((collection) => collection.id === tag) ?? collections[0];
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return recipes
      .filter((recipe) => (!showSaved || saved.includes(recipe.id)) && activeCollection.matches(recipe) && terms.every((term) => recipeSearchText(recipe).includes(term)))
      .sort((first, second) => {
        const savedPriority = Number(saved.includes(second.id)) - Number(saved.includes(first.id));
        if (savedPriority) return savedPriority;
        if (activeOwner === "all") return first.title.localeCompare(second.title) || first.subtitle.localeCompare(second.subtitle);
        const firstPriority = recipeOwner(first) === activeOwner ? 0 : 1;
        const secondPriority = recipeOwner(second) === activeOwner ? 0 : 1;
        return firstPriority - secondPriority || first.title.localeCompare(second.title) || first.subtitle.localeCompare(second.subtitle);
      });
  }, [activeOwner, query, saved, showSaved, tag]);
  useEffect(() => {
    try {
      const storedSaved = JSON.parse(window.localStorage.getItem(SAVED_RECIPES_KEY) ?? "[]");
      const storedChecklists = JSON.parse(window.localStorage.getItem(RECIPE_CHECKLISTS_KEY) ?? "{}");
      if (Array.isArray(storedSaved)) setSaved(storedSaved.filter((id): id is string => typeof id === "string" && recipes.some((recipe) => recipe.id === id)));
      if (storedChecklists && typeof storedChecklists === "object" && !Array.isArray(storedChecklists)) {
        const validChecklists = Object.fromEntries(Object.entries(storedChecklists).filter(([id, items]) => recipes.some((recipe) => recipe.id === id) && Array.isArray(items)).map(([id, items]) => [id, (items as unknown[]).filter((item): item is string => typeof item === "string")]));
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
  }, []);
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
  const copyGuideText = async (kind: "install" | "run") => {
    const text = recipeSkillGuides[addGuidePlatform][kind];
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
    setCopiedGuide(kind);
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

  return <main className="benny-book">
    <header className="benny-header">
      <a className="benny-brand" href="#top" aria-label={`${activeProfile.label} home`}><span className="benny-wordmark"><i>Dayton</i><b>Growth</b><em>Co.</em></span><span>Private recipe book</span></a>
      <div className="benny-title"><p>Private recipe book</p><h1>{activeProfile.label}</h1></div>
      <div className="benny-header-actions">
        <button className="benny-add-trigger" type="button" aria-haspopup="dialog" onClick={() => setAddGuideOpen(true)}>Add</button>
        <button className={`benny-saved ${showSaved ? "is-active" : ""}`} onClick={() => setShowSaved((value) => !value)} aria-pressed={showSaved}><Heart size={15} fill={saved.length ? "currentColor" : "none"} /><span>Saved</span><b>{saved.length}</b></button>
      </div>
    </header>

    {addGuideOpen && <div className="benny-add-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddGuideOpen(false); }}>
      <section className="benny-add-dialog" role="dialog" aria-modal="true" aria-labelledby="benny-add-title">
        <div className="benny-add-dialog-head">
          <div><p className="benny-eyebrow">Recipe contributor</p><h2 id="benny-add-title">Add a recipe</h2></div>
          <button ref={addGuideCloseRef} type="button" onClick={() => setAddGuideOpen(false)} aria-label="Close add recipe instructions"><X size={19} /></button>
        </div>
        <p className="benny-add-intro">Install the Recipe Book skill once. It asks for the person, recipe, notes, and photo, then shows a preview before publishing.</p>
        <div className="benny-add-platforms" role="tablist" aria-label="Choose your coding assistant">
          {(Object.keys(recipeSkillGuides) as (keyof typeof recipeSkillGuides)[]).map((platform) => <button key={platform} type="button" role="tab" aria-selected={addGuidePlatform === platform} className={addGuidePlatform === platform ? "active" : ""} onClick={() => { setAddGuidePlatform(platform); setCopiedGuide(""); }}>{recipeSkillGuides[platform].label}</button>)}
        </div>
        <div className="benny-add-step">
          <div><span>01</span><div><strong>Install once</strong><small>Paste this into Terminal. It will ask for your private add-only access code.</small></div></div>
          <div className="benny-add-command"><code>{recipeSkillGuides[addGuidePlatform].install}</code><button type="button" onClick={() => copyGuideText("install")} aria-label="Copy install command">{copiedGuide === "install" ? <Check size={16} /> : <Copy size={16} />}<span>{copiedGuide === "install" ? "Copied" : "Copy"}</span></button></div>
        </div>
        <div className="benny-add-step">
          <div><span>02</span><div><strong>Run the skill</strong><small>Open {recipeSkillGuides[addGuidePlatform].label}, paste this, and answer the short questions.</small></div></div>
          <div className="benny-add-command is-short"><code>{recipeSkillGuides[addGuidePlatform].run}</code><button type="button" onClick={() => copyGuideText("run")} aria-label="Copy run command">{copiedGuide === "run" ? <Check size={16} /> : <Copy size={16} />}<span>{copiedGuide === "run" ? "Copied" : "Copy"}</span></button></div>
        </div>
        <p className="benny-add-footnote">After you approve the preview, the recipe is added and the website deployment starts automatically. This access can add recipes only—it cannot change or delete existing ones.</p>
        <a className="benny-add-download" href="/recipe-book/Caruso-Recipe-Book.zip" download>Download the skill instead</a>
      </section>
    </div>}

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
      <div className="benny-cards">{filtered.map((recipe, index) => { const owner = recipeProfile(recipeOwner(recipe)); return <button className={`benny-card ${recipe.id === selected.id ? "selected" : ""}`} key={recipe.id} onClick={() => choose(recipe.id)} aria-label={`Open ${recipe.title} ${recipe.subtitle}, by ${owner.name}`}><div className={`benny-card-image ${recipe.color}`}><img src={recipe.image} alt="" loading={index > 3 ? "lazy" : "eager"} /><span>{recipe.total}</span></div><div><div className="benny-card-tags"><span className="benny-owner-tag">By {owner.name}</span><span>{recipe.tags.slice(0, 2).join(" · ")}</span></div><h3>{recipe.title}<small>{recipe.subtitle}</small></h3><span className="benny-card-action">Open recipe <ChevronRight size={15} /></span></div></button>; })}</div>
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
