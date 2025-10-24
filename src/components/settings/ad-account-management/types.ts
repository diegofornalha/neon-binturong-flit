export type Platform = "facebook" | "google" | "tiktok"
export type Status = "connected" | "error" | "disconnected"

export interface ClientOption {
  id: string
  name: string
}

export interface AdAccount {
  id: string
  organization_id: string
  client_id: string | null
  platform: Platform
  account_id: string
  account_name: string
  status: Status
  access_token?: string
  refresh_token?: string
  created_at: string
  clients?: {
    name: string
  }
}

export interface FormState {
  platform: Platform
  account_name: string
  account_id: string
  status: Status
  client_id: string | null
  access_token: string
  refresh_token: string
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: "Facebook Ads",
  google: "Google Ads",
  tiktok: "TikTok Ads",
}

export const STATUS_META: Record<Status, { label: string; badgeClass: string }> = {
  connected: { label: "Conectada", badgeClass: "bg-emerald-100 text-emerald-800" },
  error: { label: "Erro", badgeClass: "bg-red-100 text-red-800" },
  disconnected: { label: "Desconectada", badgeClass: "bg-gray-100 text-gray-700" },
}

export const DEFAULT_FORM: FormState = {
  platform: "facebook",
  account_name: "",
  account_id: "",
  status: "connected",
  client_id: null,
  access_token: "",
  refresh_token: "",
}