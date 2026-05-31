// Calendar uses Transaction as the source of truth.
// AccountMap is the only shared type needed across calendar components.

import type { Account } from "@mobile/db/accounts";

export type AccountMap = Map<number, Account>;
