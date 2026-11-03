"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  PawPrint,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { bookingSchema, localDate, type BookingInput } from "@/lib/validation";
import { money } from "@/lib/utils";
import { request } from "@/lib/client";
import { ServiceIcon } from "./icons";
import type { ServiceView } from "./service-card";
type Slot = { time: string; remaining: number; available: boolean };
export function BookingForm({
  services,
  pets,
  staff,
  loggedIn,
  selectedService,
}: {
  services: ServiceView[];
  pets: { id: string; name: string; type: string }[];
  staff: { id: string; name: string }[];
  loggedIn: boolean;
  selectedService?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0),
    [newPet, setNewPet] = useState(pets.length === 0),
    [slots, setSlots] = useState<Slot[]>([]),
    [loadingSlots, setLoadingSlots] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [bookingId, setBookingId] = useState(""),
    [newPetImage, setNewPetImage] = useState<File | null>(null),
    [newPetImagePreview, setNewPetImagePreview] = useState("");
  const {
    register,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId:
        services.find((s) => s.id === selectedService)?.id ?? services[0]?.id ?? "",
      petId: pets[0]?.id ?? "",
      bookingDate: "",
      staffId: "",
      note: "",
      newPetName: "",
      newPetType: "DOG",
    },
  });
  const serviceId = watch("serviceId"),
    date = watch("bookingDate"),
    staffId = watch("staffId"),
    time = watch("timeSlot"),
    petId = watch("petId"),
    petName = watch("newPetName");
  const service = services.find((s) => s.id === serviceId);
  useEffect(() => {
    if (!newPetImage) {
      setNewPetImagePreview("");
      return;
    }
    const url = URL.createObjectURL(newPetImage);
    setNewPetImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newPetImage]);
  useEffect(() => {
    if (!date || !serviceId) {
      setSlots([]);
      return;
    }
    const controller = new AbortController();
    setValue("timeSlot", undefined as never);
    setSlots([]);
    setLoadingSlots(true);
    setError("");
    request<{ slots: Slot[] }>(
      `/api/bookings/availability?date=${date}&serviceId=${serviceId}&staffId=${staffId ?? ""}`,
      { signal: controller.signal },
    )
      .then((data) => setSlots(data.slots))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingSlots(false);
      });
    return () => controller.abort();
  }, [date, serviceId, staffId, setValue]);
  async function next() {
    if (!services.length) return;
    const fields: (keyof BookingInput)[] =
      step === 0
        ? ["serviceId"]
        : [
            "petId",
            "newPetName",
            "newPetType",
            "bookingDate",
            "timeSlot",
            "staffId",
          ];
    if (await trigger(fields)) {
      setStep((s) => s + 1);
      setError("");
    }
  }
  if (bookingId)
    return (
      <div className="booking-success panel">
        <div className="success-icon">
          <Check />
        </div>
        <span className="eyebrow">MÌNH ĐÃ CÓ HẸN!</span>
        <h2>Hẹn gặp bạn và bé.</h2>
        <p>
          Lịch hẹn <strong>#{bookingId.slice(-8).toUpperCase()}</strong> đã được
          lưu và đang chờ TailUp xác nhận.
        </p>
        <div className="success-summary">
          <strong>{service?.name}</strong>
          <span>
            {date.split("-").reverse().join("/")} · {time}
          </span>
        </div>
        <Link href="/dashboard/bookings" className="button">
          Xem lịch hẹn của tôi <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <div className="booking-layout">
      <div>
        <ol className="stepper">
          {["Chọn dịch vụ", "Thông tin lịch hẹn", "Xác nhận"].map(
            (label, i) => (
              <li
                key={label}
                className={step === i ? "current" : step > i ? "done" : ""}
              >
                <span>{step > i ? <Check size={16} /> : i + 1}</span>
                <small>{label}</small>
              </li>
            ),
          )}
        </ol>
        <form
          className="panel booking-form"
          onSubmit={handleSubmit(async (data) => {
            if (step !== 2) return;
            setBusy(true);
            setError("");
            try {
              const body =
                newPet && newPetImage
                  ? (() => {
                      const form = new FormData();
                      form.set("data", JSON.stringify(data));
                      form.set("image", newPetImage);
                      return form;
                    })()
                  : JSON.stringify(data);
              const result = await request<{ booking: { id: string } }>(
                "/api/bookings",
                { method: "POST", body },
              );
              setBookingId(result.booking.id);
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          })}
        >
          {step === 0 && (
            <>
              <span className="eyebrow">BƯỚC 01</span>
              <h2>Hôm nay bé cần gì?</h2>
              <p className="muted">Chọn một dịch vụ để mình bắt đầu nhé.</p>
              {services.length === 0 && (
                <p className="info" role="status">
                  Hiện chưa có dịch vụ để đặt lịch. Vui lòng quay lại sau.
                </p>
              )}
              <div className="booking-services">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className={`booking-service ${serviceId === s.id ? "chosen" : ""}`}
                  >
                    <input
                      type="radio"
                      value={s.id}
                      {...register("serviceId")}
                    />
                    <ServiceIcon name={s.icon} />
                    <div>
                      <strong>{s.name}</strong>
                      <small>
                        {s.durationMinutes} phút · {money(s.price)}
                      </small>
                    </div>
                    <span className="radio-dot" />
                  </label>
                ))}
              </div>
              {errors.serviceId && (
                <p className="field-error">{errors.serviceId.message}</p>
              )}
            </>
          )}
          {step === 1 && (
            <>
              <span className="eyebrow">BƯỚC 02</span>
              <h2>Mình hẹn khi nào?</h2>
              <div className="form-stack">
                <div>
                  <div className="label-row">
                    <label htmlFor="pet-select">Người bạn nhỏ của bạn</label>
                    {pets.length > 0 && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setNewPet(!newPet);
                          setValue("petId", !newPet ? "" : (pets[0]?.id ?? ""));
                          setValue("newPetName", "");
                          setNewPetImage(null);
                        }}
                      >
                        {newPet ? "Chọn bé đã có" : "+ Thêm bé mới"}
                      </button>
                    )}
                  </div>
                  {!newPet ? (
                    <select id="pet-select" {...register("petId")}>
                      <option value="">Chọn thú cưng</option>
                      {pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ·{" "}
                          {p.type === "DOG"
                            ? "Chó"
                            : p.type === "CAT"
                              ? "Mèo"
                              : "Khác"}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="two-columns">
                      <input
                        aria-label="Tên bé mới"
                        placeholder="Tên bé mới"
                        {...register("newPetName")}
                      />
                      <select
                        aria-label="Loài thú cưng mới"
                        {...register("newPetType")}
                      >
                        <option value="DOG">Chó</option>
                        <option value="CAT">Mèo</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                  )}
                  {newPet && (
                    <div className="pet-photo-input booking-pet-photo">
                      <label>
                        Ảnh thú cưng (không bắt buộc)
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => {
                            const selected = event.target.files?.[0] ?? null;
                            const invalid =
                              selected &&
                              (![
                                "image/jpeg",
                                "image/png",
                                "image/webp",
                              ].includes(selected.type) ||
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
                            setNewPetImage(invalid ? null : selected);
                          }}
                        />
                      </label>
                      <small>JPG, PNG hoặc WebP, tối đa 2 MB.</small>
                      {newPetImagePreview && (
                        <img
                          className="pet-photo-preview"
                          src={newPetImagePreview}
                          alt="Xem trước ảnh thú cưng mới"
                        />
                      )}
                    </div>
                  )}
                  {errors.petId && (
                    <p className="field-error">{errors.petId.message}</p>
                  )}
                  {errors.newPetName && (
                    <p className="field-error">{errors.newPetName.message}</p>
                  )}
                </div>
                <div className="two-columns">
                  <label>
                    Ngày hẹn
                    <input
                      type="date"
                      min={localDate()}
                      max={localDate(new Date(Date.now() + 90 * 86400000))}
                      {...register("bookingDate")}
                    />
                    {errors.bookingDate && (
                      <small className="field-error">
                        {errors.bookingDate.message}
                      </small>
                    )}
                  </label>
                  <label>
                    Nhân viên (không bắt buộc)
                    <select {...register("staffId")}>
                      <option value="">TailUp sắp xếp giúp tôi</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <label className="field-label">Khung giờ trống</label>
                  {!date ? (
                    <p className="muted slot-hint">
                      Chọn ngày để xem các khung giờ còn trống.
                    </p>
                  ) : loadingSlots ? (
                    <p className="muted slot-hint" role="status">
                      Đang kiểm tra lịch trống…
                    </p>
                  ) : (
                    <div className="time-slots">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          className={time === slot.time ? "selected" : ""}
                          onClick={() =>
                            setValue(
                              "timeSlot",
                              slot.time as BookingInput["timeSlot"],
                              { shouldValidate: true },
                            )
                          }
                        >
                          <Clock size={15} />
                          {slot.time}
                          <small>
                            {slot.available
                              ? `Còn ${slot.remaining} chỗ`
                              : "Không khả dụng"}
                          </small>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.timeSlot && (
                    <p className="field-error">{errors.timeSlot.message}</p>
                  )}
                </div>
                <label>
                  Có điều gì cần lưu ý cho bé?
                  <textarea
                    placeholder="Ví dụ: bé hơi nhút nhát, nhạy cảm với tiếng máy sấy…"
                    maxLength={1000}
                    {...register("note")}
                  />
                </label>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <span className="eyebrow">BƯỚC 03</span>
              <h2>Xem lại một chút nhé.</h2>
              <div className="confirmation-list">
                <div>
                  <span>Dịch vụ</span>
                  <strong>{service?.name}</strong>
                </div>
                <div>
                  <span>Thú cưng</span>
                  <strong>
                    {newPet ? petName : pets.find((p) => p.id === petId)?.name}
                  </strong>
                </div>
                <div>
                  <span>Thời gian</span>
                  <strong>
                    {date.split("-").reverse().join("/")} · {time}
                  </strong>
                </div>
                <div>
                  <span>Nhân viên</span>
                  <strong>
                    {staff.find((s) => s.id === staffId)?.name ??
                      "TailUp sắp xếp"}
                  </strong>
                </div>
                {watch("note") && (
                  <div>
                    <span>Ghi chú</span>
                    <strong>{watch("note")}</strong>
                  </div>
                )}
                <div className="confirmation-total">
                  <span>Thanh toán tại cửa hàng</span>
                  <strong>{service && money(service.price)}</strong>
                </div>
              </div>
              <p className="muted small-text">
                Lịch hẹn sẽ ở trạng thái chờ xác nhận. TailUp chưa thu tiền
                online cho dịch vụ.
              </p>
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {!loggedIn && (
            <p className="info">
              Bạn cần <Link href="/login">đăng nhập</Link> để gửi lịch hẹn. Chưa
              có tài khoản? <Link href="/register">Đăng ký tại đây.</Link>
            </p>
          )}
          <div className="form-actions">
            {step > 0 ? (
              <button
                type="button"
                className="button outline"
                disabled={busy}
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} />
                Quay lại
              </button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button
                key="next"
                type="button"
                className="button"
                onClick={next}
                disabled={services.length === 0}
              >
                Tiếp tục <ArrowRight size={17} />
              </button>
            ) : (
              <button
                key="submit"
                type="submit"
                className="button"
                disabled={busy || !loggedIn}
              >
                {busy ? "Đang gửi…" : "Xác nhận đặt lịch"}
                <Check size={17} />
              </button>
            )}
          </div>
        </form>
      </div>
      <aside className="booking-aside">
        <div className="panel">
          <div className="aside-icon">
            <PawPrint />
          </div>
          <h3>Một buổi hẹn thật dễ chịu.</h3>
          <p>Thông tin rõ ràng để bạn và bé luôn chủ động.</p>
          <ul>
            <li>
              <CalendarDays />
              Đặt trước tối đa 90 ngày
            </li>
            <li>
              <Clock />
              Chọn khung giờ còn trống
            </li>
            <li>
              <ShieldCheck />
              Xem giá trước khi xác nhận
            </li>
          </ul>
          {service && (
            <div className="aside-service">
              <span>Dịch vụ bạn chọn</span>
              <strong>{service.name}</strong>
              <small>
                {service.durationMinutes} phút · {money(service.price)}
              </small>
            </div>
          )}
        </div>
        <p className="aside-note">
          Lịch trống có thể thay đổi. Hệ thống sẽ kiểm tra lại khi bạn bấm xác
          nhận.
        </p>
      </aside>
    </div>
  );
}
