export async function request<T = unknown>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response
    .json()
    .catch(() => ({ error: "Phản hồi máy chủ không hợp lệ." }));
  if (!response.ok) throw new Error(data.error ?? "Có lỗi xảy ra.");
  return data as T;
}
