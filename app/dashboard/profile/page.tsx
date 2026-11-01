import { requirePageUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
export const metadata = { title: "Thông tin cá nhân" };
export default async function Page() {
  const user = await requirePageUser();
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">GÓC CỦA BẠN</span>
          <h1>Thông tin cá nhân</h1>
          <p className="muted">Cập nhật thông tin để TailUp liên hệ khi cần.</p>
        </div>
      </div>
      <ProfileForm user={user} />
    </>
  );
}
