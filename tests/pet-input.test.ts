import test from "node:test";
import assert from "node:assert/strict";
import { petInput } from "../lib/pet-input";

function uploadRequest(
  image?: { bytes: number[]; type: string },
  removeImage?: string,
) {
  const form = new FormData();
  form.set("data", JSON.stringify({ name: "Milo", type: "DOG" }));
  if (image)
    form.set(
      "image",
      new Blob([new Uint8Array(image.bytes)], { type: image.type }),
      "pet.png",
    );
  if (removeImage !== undefined) form.set("removeImage", removeImage);
  return new Request("http://localhost/api/pets", {
    method: "POST",
    body: form,
  });
}

test("pet input accepts an image with matching PNG content", async () => {
  const result = await petInput(
    uploadRequest({
      bytes: [137, 80, 78, 71, 13, 10, 26, 10],
      type: "image/png",
    }),
  );
  assert.deepEqual(result.input, { name: "Milo", type: "DOG" });
  assert.equal(result.image?.contentType, "image/png");
  assert.equal(result.removeImage, false);
});

test("pet input rejects image content that does not match its MIME type", async () => {
  await assert.rejects(
    petInput(uploadRequest({ bytes: [1, 2, 3], type: "image/png" })),
    /Chỉ nhận ảnh JPG, PNG hoặc WebP đúng định dạng/,
  );
});

test("pet input does not allow replacing and removing an image at once", async () => {
  await assert.rejects(
    petInput(
      uploadRequest(
        { bytes: [137, 80, 78, 71, 13, 10, 26, 10], type: "image/png" },
        "true",
      ),
    ),
    /Không thể vừa thay ảnh vừa xóa ảnh/,
  );
});
