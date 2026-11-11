const MAX_INPUT_BYTES = 8 * 1024 * 1024;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Cette image ne peut pas être lue."));
    image.src = src;
  });
}

/**
 * Compresses the chosen photo to a 256×256 JPEG data URL so it can be stored
 * in Postgres without needing a blob storage bucket.
 */
export async function fileToAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choisis un fichier image (JPG, PNG ou WebP).");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error("L'image est trop lourde (8 Mo maximum).");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Impossible de lire cette image."));
    reader.readAsDataURL(file);
  });

  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Impossible de préparer l'image.");

  // White background keeps transparent PNGs from turning black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);

  const min = Math.min(image.width, image.height);
  const sx = (image.width - min) / 2;
  const sy = (image.height - min) / 2;
  context.drawImage(image, sx, sy, min, min, 0, 0, size, size);

  let output = canvas.toDataURL("image/jpeg", 0.86);
  if (output.length > 360_000) output = canvas.toDataURL("image/jpeg", 0.7);
  if (output.length > 360_000) output = canvas.toDataURL("image/jpeg", 0.58);
  return output;
}
