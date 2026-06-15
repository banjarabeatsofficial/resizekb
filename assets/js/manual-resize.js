document.addEventListener("DOMContentLoaded", function () {
  const imageInput = document.getElementById("manualImageInput");
  const widthInput = document.getElementById("manualWidth");
  const heightInput = document.getElementById("manualHeight");
  const targetKBInput = document.getElementById("manualTargetKB");
  const resizeBtn = document.getElementById("manualResizeBtn");

  const result = document.getElementById("manualResult");
  const originalSize = document.getElementById("manualOriginalSize");
  const newSize = document.getElementById("manualNewSize");
  const dimension = document.getElementById("manualDimension");
  const statusText = document.getElementById("manualStatusText");
  const preview = document.getElementById("manualPreview");
  const downloadBtn = document.getElementById("manualDownloadBtn");

  result.style.display = "none";

  resizeBtn.addEventListener("click", function () {
    const file = imageInput.files[0];

    if (!file) {
      alert("Please select image first");
      return;
    }

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);
    const targetKB = Number(targetKBInput.value);

    if (!width || !height || !targetKB) {
      alert("Please enter width, height and target KB");
      return;
    }

    originalSize.textContent = (file.size / 1024).toFixed(2) + " KB";
    statusText.textContent = "Processing...";
    result.style.display = "block";

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();

      img.onload = function () {
        resizeManual(img, width, height, targetKB);
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });

  function resizeManual(img, width, height, targetKB) {
    let quality = 0.92;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(img, 0, 0, width, height);

    function compressLoop() {
      canvas.toBlob(function (blob) {
        if (!blob) {
          alert("Compression failed.");
          return;
        }

        if (blob.size <= targetKB * 1024) {
          showResult(blob, width, height, targetKB);
          return;
        }

        quality -= 0.06;

        if (quality > 0.08) {
          compressLoop();
        } else {
          statusText.textContent = "❌ Cannot compress to selected KB. Try higher KB or smaller dimensions.";
          alert("Cannot compress to selected KB. Try higher KB or smaller dimensions.");
        }
      }, "image/jpeg", quality);
    }

    compressLoop();
  }

  function showResult(blob, width, height, targetKB) {
    const url = URL.createObjectURL(blob);

    preview.src = url;
    downloadBtn.href = url;
    downloadBtn.download = "resizekb-manual-" + width + "x" + height + "-under-" + targetKB + "kb.jpg";

    newSize.textContent = (blob.size / 1024).toFixed(2) + " KB";
    dimension.textContent = width + " x " + height + " px";
    statusText.textContent = "✅ Successfully resized";

    result.style.display = "block";
  }
});
