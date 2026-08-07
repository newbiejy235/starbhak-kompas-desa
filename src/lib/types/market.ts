import type {
  getCategories,
  getPublicCommodities,
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
