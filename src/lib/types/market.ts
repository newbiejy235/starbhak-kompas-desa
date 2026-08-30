import type {
  getCategories,
  getPublicCommodities,
  countPublicCommodities,
  getCommodityById,
  getFarmerCommodities,
  getRelatedCommodities,
} from "@/actions/commodity";
import type {
  getAllCommoditiesAdmin,
  getAllUsers,
  getAllTransactions,
  getFeeSettings,
  getDashboardStats,
  getTopCommodities,
  getSalesPerCategory,
  getPaymentStatusBreakdown,
  getMonthlyRevenue,
} from "@/actions/admin";
import type {
  getUserOrders,
  getFarmerOrders,
  getOrderById,
  getAllOrders,
} from "@/actions/order";
import type {
  getReviewsForFarmer,
  getReviewsForCommodity,
  getAllReviews,
} from "@/actions/review";
import type { getUserNotifications } from "@/actions/notification";
import type { getAuthUser } from "@/lib/auth/auth.service";
import type { getCategoryStats } from "@/actions/category";
import type {
  getHarvestCalendar,
} from "@/actions/harvest";
import type { getFarmerNotes } from "@/actions/notes";
import type {
  getPriceCommodities,
  getPriceHistory,
} from "@/actions/price";
import type { getSalesTargetOverview } from "@/actions/target";
import type { getFarmerBuyers } from "@/actions/buyer";
import type { getFarmerAchievements } from "@/actions/achievement";
import type { getHelpFaqs } from "@/actions/help";
import type {
  getPublicFarmers,
  countPublicFarmers,
  getPublicFarmerById,
  searchPublicFarmers,
  countSearchPublicFarmers,
  searchFarmersForBuyer,
  getFarmerStorePage,
} from "@/actions/farmer";

export type AuthUser = NonNullable<
  Awaited<ReturnType<typeof getAuthUser>>
>;
export type CategoryStats =
  Awaited<ReturnType<typeof getCategoryStats>>[number];

export type PublicCommodity =
  Awaited<ReturnType<typeof getPublicCommodities>>[number];
export type CommodityDetail = NonNullable<
  Awaited<ReturnType<typeof getCommodityById>>
>;
export type FarmerCommodity =
  Awaited<ReturnType<typeof getFarmerCommodities>>[number];
export type AdminCommodity =
  Awaited<ReturnType<typeof getAllCommoditiesAdmin>>[number];
export type CategoryRow = Awaited<ReturnType<typeof getCategories>>[number];
export type RelatedCommodity =
  Awaited<ReturnType<typeof getRelatedCommodities>>[number];

export type BuyerOrder = Awaited<ReturnType<typeof getUserOrders>>[number];
export type FarmerOrder = Awaited<ReturnType<typeof getFarmerOrders>>[number];
export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderById>>
>;
export type AdminOrder = Awaited<ReturnType<typeof getAllOrders>>[number];

export type AdminUser = Awaited<ReturnType<typeof getAllUsers>>[number];
export type TransactionRow =
  Awaited<ReturnType<typeof getAllTransactions>>[number];
export type FeeSettingRow = Awaited<ReturnType<typeof getFeeSettings>>[number];
export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
export type TopCommodity =
  Awaited<ReturnType<typeof getTopCommodities>>[number];
export type SalesPerCategory =
  Awaited<ReturnType<typeof getSalesPerCategory>>[number];
export type PaymentStatusBreakdown =
  Awaited<ReturnType<typeof getPaymentStatusBreakdown>>[number];
export type MonthlyRow = Awaited<ReturnType<typeof getMonthlyRevenue>>[number];

export type ReviewForFarmer =
  Awaited<ReturnType<typeof getReviewsForFarmer>>[number];
export type ReviewForCommodity =
  Awaited<ReturnType<typeof getReviewsForCommodity>>[number];
export type AdminReview = Awaited<ReturnType<typeof getAllReviews>>[number];

export type NotificationRow =
  Awaited<ReturnType<typeof getUserNotifications>>[number];

export type HarvestScheduleRow =
  Awaited<ReturnType<typeof getHarvestCalendar>>[number];
export type FarmerNoteRow = Awaited<ReturnType<typeof getFarmerNotes>>[number];
export type PriceCommodityOption =
  Awaited<ReturnType<typeof getPriceCommodities>>[number];
export type PriceHistoryData = NonNullable<
  Awaited<ReturnType<typeof getPriceHistory>>
>;
export type SalesTargetOverview = Awaited<
  ReturnType<typeof getSalesTargetOverview>
>;
export type FarmerBuyerRow =
  Awaited<ReturnType<typeof getFarmerBuyers>>[number];
export type AchievementRow =
  Awaited<ReturnType<typeof getFarmerAchievements>>[number];
export type FaqItem = Awaited<ReturnType<typeof getHelpFaqs>>[number];

export type PublicCommodityCount = Awaited<ReturnType<typeof countPublicCommodities>>;
export type PublicFarmer = Awaited<ReturnType<typeof getPublicFarmers>>[number];
export type PublicFarmerCount = Awaited<ReturnType<typeof countPublicFarmers>>;
export type PublicFarmerProfile = NonNullable<
  Awaited<ReturnType<typeof getPublicFarmerById>>
>;
export type SearchPublicFarmer = Awaited<ReturnType<typeof searchPublicFarmers>>[number];
export type SearchPublicFarmerCount = Awaited<ReturnType<typeof countSearchPublicFarmers>>;
export type FarmerSearchResult = Awaited<ReturnType<typeof searchFarmersForBuyer>>["farmers"][number];
export type FarmerStorePage = NonNullable<Awaited<ReturnType<typeof getFarmerStorePage>>>;
