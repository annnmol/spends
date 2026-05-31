// iconKey values use MaterialCommunityIcons from @expo/vector-icons

export type Category =
  | "food"
  | "travel"
  | "entertainment"
  | "sports"
  | "health"
  | "shopping"
  | "gifts"
  | "utilities"
  | "subscriptions"
  | "other";

export type Categories = {
  id: number;
  name: Category;
  slugs: string[];
  iconKey: string | null;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
};

export const CATEGORIES: Categories[] = [
  {
    id: 1,
    name: "food",
    slugs: ["food", "restaurant", "dining", "swiggy", "zomato"],
    iconKey: "food-fork-drink",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 2,
    name: "travel",
    slugs: ["travel", "flight", "hotel", "trip", "irctc"],
    iconKey: "airplane",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 3,
    name: "entertainment",
    slugs: ["entertainment", "movie", "netflix", "prime", "spotify"],
    iconKey: "movie-open",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 4,
    name: "sports",
    slugs: ["sports", "gym", "fitness", "cult"],
    iconKey: "dumbbell",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 5,
    name: "health",
    slugs: ["health", "pharmacy", "hospital", "doctor", "medical"],
    iconKey: "heart-pulse",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 6,
    name: "shopping",
    slugs: ["shopping", "amazon", "flipkart", "myntra", "mall"],
    iconKey: "cart",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 7,
    name: "gifts",
    slugs: ["gifts", "gift"],
    iconKey: "gift",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 8,
    name: "utilities",
    slugs: ["utilities", "electricity", "water", "gas", "bill"],
    iconKey: "lightning-bolt",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 9,
    name: "subscriptions",
    slugs: ["subscriptions", "subscription"],
    iconKey: "calendar-refresh",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: 10,
    name: "other",
    slugs: ["other"],
    iconKey: "dots-horizontal-circle",
    notes: null,
    createdAt: 0,
    updatedAt: 0,
  },
];
