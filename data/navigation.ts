import navigationData from "../docs/architecture/NAVIGATION.json";

export interface NavItem {
  label: string;
  href?: string;
  action?: string;
}

export interface NavColumn {
  heading: string;
  items: NavItem[];
}

export interface NavGroup {
  id: string;
  label: string;
  href: string;
  columns: NavColumn[];
}

export interface UtilityItem {
  id: string;
  label: string;
  href?: string;
  action?: string;
}

export interface ActionItem {
  id: string;
  label: string;
  href?: string;
  action?: string;
  external?: boolean;
  variant: "primary" | "secondary" | "outline" | "ghost" | string;
  mobileOnly?: boolean;
}

export const primaryNav: NavGroup[] = navigationData.primary as NavGroup[];
export const utilityNav: UtilityItem[] = navigationData.utility as UtilityItem[];
export const actionItems: ActionItem[] = navigationData.actions as ActionItem[];
