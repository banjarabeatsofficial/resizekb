const targetOutput = document.getElementById("targetOutput");
const statusText = document.getElementById("statusText");
const imageInput = document.getElementById("imageInput");
const targetSize = document.getElementById("targetSize");
const resizeBtn = document.getElementById("resizeBtn");
const result = document.getElementById("result");
const originalSize = document.getElementById("originalSize");
const newSize = document.getElementById("newSize");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");

result.style.display = "none";

resizeBtn.addEventListener("click", () => {
  const file = imageInput.files[0];

  if (!file) {
    alert("Please select an image first.");
    return;
  }

  const targetKB = parseInt(targetSize.value, 10);

  if (!targetKB) {
    alert("Target size not found.");
    return;
  }

  originalSize.textContent = (file.size / 1024).toFixed(2) + " KB";

  const reader = new FileReader();

  reader.onload = function (event) {
    const img = new Image();

    img.onload = function () {
      compressImageNearTarget(img, targetKB);
    };

    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

function compressImageNearTarget(img, targetKB) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let width = img.width;
  let height = img.height;

  const maxWidth = 1600;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  let low = 0.05;
  let high = 0.95;
  let bestOutput = null;
  let bestSize = 0;

  for (let i = 0; i < 30; i++) {
    const quality = (low + high) / 2;
    const output = canvas.toDataURL("image/jpeg", quality);
    const size = dataURLSize(output);

    if (size <= targetKB * 1024) {
      bestOutput = output;
      bestSize = size;
      low = quality;
    } else {
      high = quality;
    }
  }

  if (!bestOutput) {
    alert("This image cannot be compressed to selected size. Try higher KB.");
    return;
  }

  preview.src = bestOutput;
  downloadBtn.href = bestOutput;
  downloadBtn.download = `resizekb-under-${targetKB}kb.jpg`;

  targetOutput.textContent = `${targetKB} KB`;
  newSize.textContent = `${(bestSize / 1024).toFixed(2)} KB`;
  statusText.textContent = `✅ Successfully resized under ${targetKB}KB`;

  result.style.display = "block";
}

function dataURLSize(dataURL) {
  const base64 = dataURL.split(",")[1];
  return Math.round((base64.length * 3) / 4);
}
