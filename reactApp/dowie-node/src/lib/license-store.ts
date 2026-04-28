// Simple localStorage-backed mock store for the License Management feature.

export type LicenseStatus = "pending" | "in_review" | "approved" | "rejected";
export type LicenseType = "new" | "renewal";
export type LicenseService =  "certificate_roadworthiness" | "motor_vehicle_license" | "motor_vehicle_tinted_glass_permit" | "motor_vehicle_third_party_insurance" |"Driver's_License_renewal" | "tokunbo" | "plate_renewal" | "change_of_ownership";

export interface LicenseActivity {
  id: string;
  type: LicenseType;
  service: LicenseService;
  serviceLabel: string;
  /** Display title — usually plate or chassis number */
  title: string;
  /** Service-specific fields collected from the form */
  details: Record<string, string>;
  status: LicenseStatus;
  fee: number;
  createdAt: string;
}

export interface WalletTxn {
  id: string;
  kind: "deposit" | "charge";
  amount: number;
  description: string;
  createdAt: string;
}

const KEYS = {
  wallet: "licenseWalletBalance",
  txns: "licenseWalletTxns",
  activities: "licenseActivities",
  chat: "licenseChatMessages",
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

export const getWalletBalance = (): number => read<number>(KEYS.wallet, 0);
export const setWalletBalance = (n: number) => write(KEYS.wallet, n);

export const getWalletTxns = (): WalletTxn[] => read<WalletTxn[]>(KEYS.txns, []);
export const addWalletTxn = (txn: Omit<WalletTxn, "id" | "createdAt">): WalletTxn => {
  const full: WalletTxn = { ...txn, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const txns = [full, ...getWalletTxns()];
  write(KEYS.txns, txns);
  if (txn.kind === "deposit") setWalletBalance(getWalletBalance() + txn.amount);
  if (txn.kind === "charge") setWalletBalance(getWalletBalance() - txn.amount);
  return full;
};

export const getActivities = (): LicenseActivity[] => read<LicenseActivity[]>(KEYS.activities, []);
export const addActivity = (a: Omit<LicenseActivity, "id" | "createdAt" | "status">): LicenseActivity => {
  const full: LicenseActivity = {
    ...a,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  write(KEYS.activities, [full, ...getActivities()]);
  return full;
};

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
}

export const getChatMessages = (): ChatMessage[] => read<ChatMessage[]>(KEYS.chat, []);
export const addChatMessage = (role: ChatMessage["role"], content: string): ChatMessage => {
  const msg: ChatMessage = { id: crypto.randomUUID(), role, content, createdAt: new Date().toISOString() };
  write(KEYS.chat, [...getChatMessages(), msg]);
  return msg;
};
