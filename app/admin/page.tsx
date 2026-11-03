import { getStoreGallery } from "@/lib/gallery";
import { GalleryManager } from "@/components/gallery-manager";
import { BannerManager } from "@/components/banner-manager";
import { WebsiteEditor } from "@/components/website-editor";
import { readWebsite } from "@/lib/store-website";
import Link from "next/link";
import { managementPage } from "@/lib/stores";
import { StoreSettings, CatalogCreate } from "@/components/store-settings";
import { db } from "@/lib/db";
import { AdminPanel } from "@/components/admin-panel";
import { money } from "@/lib/utils";
export const dynamic = "force-dynamic";
export const metadata = { title: "Quản trị TailUp" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ store?: string }>;
}) {
  const { user, store } = await managementPage((await searchParams).store);
  if (!store.isActive && user.role !== "SUPER_ADMIN")
    return (
      <div className="container page-space">
        <h1>Cửa hàng đang tạm ngưng</h1>
        <p>
          Liên hệ quản trị TailUp để mở lại cửa hàng. Dữ liệu của bạn vẫn được
          giữ nguyên.
        </p>
        <Link className="button" href="/dashboard/profile">
          Tài khoản của tôi
        </Link>
      </div>
    );
  const storeId = store.id;
  const gallery = await getStoreGallery(storeId, store.slug);
  const [
    bookings,
    orders,
    products,
    services,
    pendingBookings,
    pendingOrders,
    revenue,
    customerCount,
    customers,
    serviceRevenue,
  ] = await Promise.all([
    db.booking.findMany({
      where: { storeId },
      include: {
        user: { select: { name: true, phone: true } },
        pet: { select: { name: true } },
        service: { select: { name: true } },
        staff: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.product.findMany({
      where: { storeId, deletedAt: null },
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { name: "asc" },
    }),
    db.service.findMany({
      where: { storeId, deletedAt: null },
      include: { image: { select: { serviceId: true } } },
      orderBy: { name: "asc" },
    }),
    db.booking.count({ where: { storeId, status: "PENDING" } }),
    db.order.count({ where: { storeId, status: "PENDING" } }),
    db.order.aggregate({
      where: { storeId, status: "COMPLETED", paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    db.user.count({
      where: {
        OR: [
          { bookings: { some: { storeId } } },
          { orders: { some: { storeId } } },
        ],
      },
    }),
    db.user.findMany({
      where: {
        OR: [
          { bookings: { some: { storeId } } },
          { orders: { some: { storeId } } },
        ],
      },
      select: { id: true, name: true, email: true, phone: true },
      orderBy: { name: "asc" },
      take: 100,
    }),
    db.booking.aggregate({
      where: { storeId, status: "COMPLETED" },
      _sum: { price: true },
    }),
  ]);
  return (
    <div className="container admin-layout">
      <div className="admin-top">
        <div>
          <span className="eyebrow">TAILUP / KHÔNG GIAN QUẢN TRỊ</span>
          <h1>{store.name}</h1>
          <p>Chào {user.name}. Số liệu và giao dịch của cửa hàng này.</p>
        </div>
        <Link className="button outline" href="/dashboard/pets">
          Tài khoản của tôi
        </Link>
      </div>
      <div className="admin-stats">
        <div className="stat-card">
          <span>Lịch hẹn chờ xác nhận</span>
          <strong>{pendingBookings}</strong>
        </div>
        <div className="stat-card">
          <span>Đơn hàng chờ xử lý</span>
          <strong>{pendingOrders}</strong>
        </div>
        <div className="stat-card">
          <span>Doanh thu đơn đã thu tiền</span>
          <strong style={{ fontSize: 25 }}>
            {money(revenue._sum.totalAmount ?? 0)}
          </strong>
        </div>
        <div className="stat-card">
          <span>Khách đã giao dịch</span>
          <strong>{customerCount}</strong>
        </div>
      </div>
      <p className="muted">
        Giá trị dịch vụ đã hoàn thành:{" "}
        <strong>{money(serviceRevenue._sum.price ?? 0)}</strong>. Chỉ số này
        không đồng nghĩa dịch vụ đã thu tiền. Số liệu toàn thời gian của cửa
        hàng.
      </p>
      <details className="panel tenant-settings">
        <summary>Khách hàng đã giao dịch ({customerCount})</summary>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Điện thoại</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone ?? "Chưa có"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small-text">
          Hiển thị tối đa 100 khách có lịch hẹn hoặc đơn hàng tại cửa hàng này.
          Hồ sơ thú cưng và lịch sử ở cửa hàng khác không được chia sẻ.
        </p>
      </details>
      <div className="tenant-actions">
        <a className="button outline" href="#catalog-management">
          Sửa sản phẩm / dịch vụ
        </a>
        <a className="button outline" href="#gallery-manager">
          Ảnh cửa hàng
        </a>
        <a className="button outline" href="#banner-manager">
          Quản lý banner
        </a>
        {user.role === "SUPER_ADMIN" && (
          <Link className="button outline" href="/platform">
            Về quản trị tổng
          </Link>
        )}
        {store.isActive ? (
          <Link className="button outline" href={`/stores/${store.slug}`}>
            Xem trang cửa hàng
          </Link>
        ) : (
          <p className="error">Cửa hàng đang tạm ngưng.</p>
        )}
      </div>
      <StoreSettings
        store={{
          id: store.id,
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
        }}
      />
      <BannerManager
        storeId={store.id}
        slug={store.slug}
        initial={readWebsite(store.website, store).banners}
      />
      <GalleryManager storeId={store.id} slug={store.slug} initial={gallery} />
      <WebsiteEditor
        storeId={store.id}
        slug={store.slug}
        initial={readWebsite(store.website, store)}
      />
      <div className="two-columns">
        <CatalogCreate storeId={storeId} kind="products" />
        <CatalogCreate storeId={storeId} kind="services" />
      </div>
      <AdminPanel
        bookings={bookings.map((b) => ({
          id: b.id,
          status: b.status,
          bookingDate: b.bookingDate.toISOString(),
          timeSlot: b.timeSlot,
          user: b.user,
          pet: b.pet,
          service: b.service,
          staff: b.staff,
        }))}
        orders={orders.map((o) => ({
          id: o.id,
          status: o.status,
          paymentStatus: o.paymentStatus,
          totalAmount: o.totalAmount.toString(),
          recipientName: o.recipientName,
          phone: o.phone,
          address: o.address,
          items: o.items.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
          })),
        }))}
        products={products.map((p) => ({ ...p, price: p.price.toString() }))}
        services={services.map((s) => ({
          ...s,
          price: s.price.toString(),
          imageUrl: s.image ? `/api/services/${s.id}/image` : undefined,
        }))}
      />
    </div>
  );
}
