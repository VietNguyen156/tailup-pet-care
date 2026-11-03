"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  PawPrint,
  Cat,
  Dog,
  Pencil,
  Trash2,
  X,
  CalendarHeart,
} from "lucide-react";
import { ageLabel, dateLabel, petLabel } from "@/lib/utils";
import { localDate } from "@/lib/validation";
import { request } from "@/lib/client";
export type PetView = {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  weight: string | null;
  birthDate: string | null;
  vaccinationHistory: string | null;
  nextVaccinationAt: string | null;
  nextDewormingAt: string | null;
  imageUrl: string | null;
};
export function PetsManager({ pets }: { pets: PetView[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<PetView | null>(null),
    [open, setOpen] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState<PetView | null>(null),
    [imageFile, setImageFile] = useState<File | null>(null),
    [removeImage, setRemoveImage] = useState(false),
    [imagePreview, setImagePreview] = useState("");
  const modal = useRef<HTMLDialogElement>(null),
    deleteModal = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) modal.current?.showModal();
    else modal.current?.close();
  }, [open]);
  useEffect(() => {
    if (deleting) deleteModal.current?.showModal();
    else deleteModal.current?.close();
  }, [deleting]);
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);
  function launch(pet: PetView | null) {
    setEditing(pet);
    setError("");
    setImageFile(null);
    setRemoveImage(false);
    setOpen(true);
  }
  const inputDate = (date: string | null | undefined) =>
    date?.slice(0, 10) ?? "";
  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">NHỮNG NGƯỜI BẠN NHỎ</span>
          <h1>Hồ sơ thú cưng</h1>
          <p className="muted">Lưu những điều quan trọng, chăm bé mỗi ngày.</p>
        </div>
        <button className="button" onClick={() => launch(null)}>
          <Plus size={18} />
          Thêm bé mới
        </button>
      </div>
      {pets.length ? (
        <div className="pet-grid">
          {pets.map((pet, i) => {
            const Icon =
              pet.type === "CAT" ? Cat : pet.type === "DOG" ? Dog : PawPrint;
            return (
              <article className="pet-card" key={pet.id}>
                <div
                  className={`pet-avatar avatar-${i % 3}${pet.imageUrl ? " has-photo" : ""}`}
                >
                  {pet.imageUrl ? (
                    <img src={pet.imageUrl} alt={`Ảnh của ${pet.name}`} />
                  ) : (
                    <Icon size={48} strokeWidth={1.3} />
                  )}
                  <span>{petLabel(pet.type)}</span>
                </div>
                <div className="pet-card-body">
                  <div className="pet-title">
                    <div>
                      <h2>{pet.name}</h2>
                      <p>{pet.breed || "Chưa cập nhật giống"}</p>
                    </div>
                    <div className="pet-actions">
                      <button
                        className="icon-button"
                        onClick={() => launch(pet)}
                        aria-label={`Sửa hồ sơ ${pet.name}`}
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => {
                          setError("");
                          setDeleting(pet);
                        }}
                        aria-label={`Xóa hồ sơ ${pet.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                  <div className="pet-stats">
                    <span>
                      Tuổi<strong>{ageLabel(pet.birthDate)}</strong>
                    </span>
                    <span>
                      Cân nặng
                      <strong>
                        {pet.weight ? `${Number(pet.weight)} kg` : "Chưa có"}
                      </strong>
                    </span>
                  </div>
                  <div className="pet-reminder">
                    <CalendarHeart size={18} />
                    <div>
                      <strong>Lịch chăm sóc tiếp theo</strong>
                      {pet.nextVaccinationAt ? (
                        <span
                          className={
                            pet.nextVaccinationAt.slice(0, 10) < localDate()
                              ? "overdue"
                              : ""
                          }
                        >
                          Tiêm phòng: {dateLabel(pet.nextVaccinationAt)}
                          {pet.nextVaccinationAt.slice(0, 10) < localDate()
                            ? " · Đã qua ngày nhắc"
                            : ""}
                        </span>
                      ) : (
                        <span>Chưa có lịch tiêm phòng</span>
                      )}
                      {pet.nextDewormingAt && (
                        <span>Tẩy giun: {dateLabel(pet.nextDewormingAt)}</span>
                      )}
                    </div>
                  </div>
                  {pet.vaccinationHistory && (
                    <details>
                      <summary>Lịch sử tiêm phòng</summary>
                      <p className="pet-history">{pet.vaccinationHistory}</p>
                    </details>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state panel">
          <PawPrint />
          <h2>Cho TailUp làm quen với bé nhé.</h2>
          <p>Thêm hồ sơ để lưu cân nặng, ngày sinh và lịch chăm sóc của bé.</p>
          <button className="button" onClick={() => launch(null)}>
            Thêm thú cưng đầu tiên <Plus size={17} />
          </button>
        </div>
      )}
      <p className="muted small-text mt-6">
        Lịch nhắc hiển thị theo ngày bạn nhập trong hồ sơ; chưa gửi email hay
        thông báo tự động.
      </p>
      <dialog
        ref={modal}
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === modal.current && !busy) setOpen(false);
        }}
        className="modal"
      >
        <div className="modal-heading">
          <h2>
            {editing ? `Hồ sơ của ${editing.name}` : "Thêm người bạn nhỏ"}
          </h2>
          <button
            className="icon-button"
            disabled={busy}
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          >
            <X />
          </button>
        </div>
        {open && (
          <form
            key={editing?.id ?? "new"}
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const values = new FormData(e.currentTarget);
              const image = values.get("image");
              const shouldRemoveImage = values.get("removeImage") === "on";
              values.delete("image");
              values.delete("removeImage");
              const body = new FormData();
              body.set("data", JSON.stringify(Object.fromEntries(values)));
              if (image instanceof File && image.size)
                body.set("image", image);
              if (shouldRemoveImage) body.set("removeImage", "true");
              try {
                await request(
                  editing ? `/api/pets/${editing.id}` : "/api/pets",
                  {
                    method: editing ? "PATCH" : "POST",
                    body,
                  },
                );
                setOpen(false);
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="two-columns">
              <label>
                Tên bé
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={editing?.name}
                />
              </label>
              <label>
                Loài
                <select name="type" defaultValue={editing?.type ?? "DOG"}>
                  <option value="DOG">Chó</option>
                  <option value="CAT">Mèo</option>
                  <option value="OTHER">Khác</option>
                </select>
              </label>
            </div>
            <label>
              Giống
              <input
                name="breed"
                maxLength={100}
                placeholder="Ví dụ: Poodle, mèo Anh lông ngắn…"
                defaultValue={editing?.breed ?? ""}
              />
            </label>
            <div className="pet-photo-input">
              <label>
                Ảnh thú cưng (không bắt buộc)
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null;
                    const invalid =
                      selected &&
                      (!["image/jpeg", "image/png", "image/webp"].includes(
                        selected.type,
                      ) ||
                        selected.size > 2 * 1024 * 1024);
                    event.target.setCustomValidity(
                      invalid
                        ? "Chọn ảnh JPG, PNG hoặc WebP tối đa 2 MB."
                        : "",
                    );
                    setError(
                      invalid
                        ? "Chọn ảnh JPG, PNG hoặc WebP tối đa 2 MB."
                        : "",
                    );
                    setImageFile(invalid ? null : selected);
                    if (selected && !invalid) setRemoveImage(false);
                  }}
                />
              </label>
              <small>JPG, PNG hoặc WebP, tối đa 2 MB.</small>
              {(imagePreview || (editing?.imageUrl && !removeImage)) && (
                <img
                  className="pet-photo-preview"
                  src={imagePreview || editing?.imageUrl || ""}
                  alt="Xem trước ảnh thú cưng"
                />
              )}
              {editing?.imageUrl && (
                <label className="pet-photo-remove">
                  <input
                    name="removeImage"
                    type="checkbox"
                    checked={removeImage}
                    onChange={(event) => setRemoveImage(event.target.checked)}
                  />
                  Xóa ảnh hiện tại
                </label>
              )}
            </div>
            <div className="two-columns">
              <label>
                Cân nặng (kg)
                <input
                  name="weight"
                  type="number"
                  min="0.01"
                  max="200"
                  step="0.01"
                  defaultValue={editing?.weight ?? ""}
                />
              </label>
              <label>
                Ngày sinh (không bắt buộc)
                <input
                  name="birthDate"
                  type="date"
                  max={localDate()}
                  defaultValue={inputDate(editing?.birthDate)}
                />
              </label>
            </div>
            <label>
              Lịch sử tiêm phòng
              <textarea
                name="vaccinationHistory"
                maxLength={3000}
                placeholder="Ngày tiêm, loại vaccine, ghi chú của bác sĩ…"
                defaultValue={editing?.vaccinationHistory ?? ""}
              />
            </label>
            <div className="two-columns">
              <label>
                Tiêm phòng tiếp theo
                <input
                  name="nextVaccinationAt"
                  type="date"
                  defaultValue={inputDate(editing?.nextVaccinationAt)}
                />
              </label>
              <label>
                Tẩy giun tiếp theo
                <input
                  name="nextDewormingAt"
                  type="date"
                  defaultValue={inputDate(editing?.nextDewormingAt)}
                />
              </label>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="button outline"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Để sau
              </button>
              <button className="button" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu hồ sơ"}
              </button>
            </div>
          </form>
        )}
      </dialog>
      <dialog
        ref={deleteModal}
        className="modal compact-modal"
        onCancel={() => setDeleting(null)}
      >
        <h2>Xóa hồ sơ {deleting?.name}?</h2>
        <p>
          Hồ sơ đã có lịch hẹn sẽ được giữ lại để bảo toàn lịch sử chăm sóc.
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <button
            className="button outline"
            disabled={busy}
            onClick={() => setDeleting(null)}
          >
            Giữ lại
          </button>
          <button
            className="button danger"
            disabled={busy}
            onClick={async () => {
              if (!deleting) return;
              setBusy(true);
              try {
                await request(`/api/pets/${deleting.id}`, { method: "DELETE" });
                setDeleting(null);
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Đang xóa…" : "Xóa hồ sơ"}
          </button>
        </div>
      </dialog>
    </>
  );
}
