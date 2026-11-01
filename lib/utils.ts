export const money = (value: number | string | { toString(): string }) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
export const dateLabel = (value: string | Date) =>
  new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
export const petLabel = (type: string) =>
  ({ DOG: "Chó", CAT: "Mèo", OTHER: "Khác" })[type] ?? type;
export const bookingLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
};
export const orderLabels: Record<string, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang chuẩn bị",
  SHIPPED: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};
export function ageLabel(date?: string | Date | null) {
  if (!date) return "Chưa có ngày sinh";
  const months = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / 2629800000),
  );
  return months < 12 ? `${months} tháng` : `${Math.floor(months / 12)} tuổi`;
}
export function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
