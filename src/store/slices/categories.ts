import { create } from "zustand";

import { CATEGORIES, type Categories } from "@mobile/db/categories";

export type CategoriesState = {
  categories: Categories[];
};

export const useCategoriesStore = create<CategoriesState>()(() => ({
  categories: CATEGORIES,
}));
