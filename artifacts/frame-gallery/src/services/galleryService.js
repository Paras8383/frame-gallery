const API_BASE = "https://rumg7kt54b.execute-api.us-east-1.amazonaws.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed: ${response.status}`,
    );
  }

  return data;
}

function toPhoto(image) {
  return {
    id: image.imageId,
    title: image.title || "Untitled photograph",
    category: image.category || "Nature",
    date: image.uploadedAt
      ? new Intl.DateTimeFormat("en", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        }).format(new Date(image.uploadedAt))
      : "Recently added",
    description: "A photograph in your personal collection.",
    src: image.viewUrl,
    key: image.s3Key,
  };
}

export const galleryService = {
  async list() {
    const data = await apiRequest("/images");

    const photos = (data.images || []).map(toPhoto);

    return photos;
  },

  async add({ file, title, category }) {
    if (!file) throw new Error("Choose an image first.");
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("Images must be 5 MB or smaller.");
    }

    // 1. Request a presigned S3 upload URL.
    const upload = await apiRequest("/upload-url", {
      method: "POST",
      body: JSON.stringify({
        contentType: file.type,
        fileSize: file.size,
      }),
    });

    if (!upload.uploadUrl || !upload.key) {
      throw new Error("The upload API did not return an upload URL and key.");
    }

    // 2. Upload the image directly to S3.
    const s3Response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!s3Response.ok) {
      throw new Error(`S3 upload failed: ${s3Response.status}`);
    }

    // 3. Register its metadata in DynamoDB through Lambda.
    const result = await apiRequest("/images", {
      method: "POST",
      body: JSON.stringify({
        key: upload.key,
        title: title.trim(),
        category,
      }),
    });

    // Fetch a fresh list so the returned photograph has a view URL.
    const images = await this.list();
    const created = images.find((image) => image.id === result.image?.imageId);

    if (!created) {
      throw new Error(
        "The image was uploaded and registered, but it could not be loaded into the gallery. Refresh the gallery.",
      );
    }

    return created;
  },

  async update(id, { title, category }) {
    return apiRequest(`/images/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ title, category }),
    });
  },

  async remove(id) {
    return apiRequest(`/images/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
