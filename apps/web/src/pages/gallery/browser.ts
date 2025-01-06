import { getCdnUrl } from "@utils/cdn.util";

const { PUBLIC_BACKEND_ENDPOINT, PUBLIC_CDN_URL } = window as any;

const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2MB

const masonry = document.querySelector<HTMLDivElement>(".masonry");
const inputField = document.querySelector<HTMLInputElement>("input[type=file]");
if (masonry && inputField) {
  inputField.addEventListener?.("change", async (e) => {
    if (e?.target instanceof HTMLInputElement) {
      // Get the closes form element
      const form = e.target.closest("form");

      // Filter out invalid files
      const validFiles = [];
      if (e.target.type === "file") {
        Array.from(e.target.files || [])?.forEach?.((file) => {
          if (file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE) {
            validFiles.push(file);
          }
        });
      }

      if (form && validFiles.length) {
        form.disabled = true;
        form.classList.add("loading");
        const formData = new FormData(form);
        try {
          const uploadUrl = new URL("/upload", PUBLIC_BACKEND_ENDPOINT);
          const uploadedDataResponse = await fetch(uploadUrl, {
            method: "POST",
            body: formData,
          });
          const uploadedData = (await uploadedDataResponse.json()) as any;
          if (uploadedData.success) {
            uploadedData?.data?.forEach?.((record: any) => {
              const img = document.createElement("img");
              img.src = getCdnUrl({ PUBLIC_CDN_URL }, record.key);
              img.alt = record.originalName;
              img.loading = "lazy";

              masonry.prepend(img as any);
            });
            document.querySelector(".no-image")?.remove();
          }
        } catch (e) {
          console.error(e);
        }
        form.classList.remove("loading");
      }
    }
  });
}
