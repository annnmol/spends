export type Merchant = {
  id: number;
  name: string;
  categoryId: number | null;
  iconKey: string | null;
  slugs: string[];
  notes: string | null;
  createdAt: number;
  updatedAt: number;
};
