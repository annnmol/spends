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
  iconKey: string | null;
  createdAt: number;
};

export const CATEGORIES: Categories[] = [
  {
    id: 1,
    name: "food",
    iconKey: "food-fork-drink",
    createdAt: Date.now(),
  },
  {
    id: 2,
    name: "travel",
    iconKey: "airplane",
    createdAt: Date.now(),
  },
  {
    id: 3,
    name: "entertainment",
    iconKey: "movie-open",
    createdAt: Date.now(),
  },
  {
    id: 4,
    name: "sports",
    iconKey: "dumbbell",
    createdAt: Date.now(),
  },
  {
    id: 5,
    name: "health",
    iconKey: "heart-pulse",
    createdAt: Date.now(),
  },
  {
    id: 6,
    name: "shopping",
    iconKey: "cart",
    createdAt: Date.now(),
  },
  {
    id: 7,
    name: "gifts",
    iconKey: "gift",
    createdAt: Date.now(),
  },
  {
    id: 8,
    name: "utilities",
    iconKey: "lightning-bolt",
    createdAt: Date.now(),
  },
  {
    id: 9,
    name: "subscriptions",
    iconKey: "calendar-refresh",
    createdAt: Date.now(),
  },
  {
    id: 10,
    name: "other",
    iconKey: "dots-horizontal-circle",
    createdAt: Date.now(),
  },
];
