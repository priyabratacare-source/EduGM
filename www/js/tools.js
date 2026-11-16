
const $ = (selector) => document.querySelector(selector);

const tools = [
    {
        id: "attendance",
        name: "Attendance Calculator",
        icon: "📅",
        description: "Calculate attendance percentage"
    },
    {
        id: "percentage",
        name: "Percentage Calculator",
        icon: "％",
        description: "Calculate marks percentage"
    },
    {
        id: "sgpa",
        name: "SGPA Calculator",
        icon: "📊",
        description: "Calculate credit-weighted SGPA"
    },
    {
        id: "cgpa",
        name: "CGPA Calculator",
        icon: "🎯",
        description: "Calculate average semester GPA"
    },
    {
        id: "image",
        name: "Image Compressor and Converter",
        icon: "🖼️",
        description: "Compress, resize and convert images"
    },
    {
        id: "crop",
        name: "Image Cropper",
        icon: "✂️",
        description: "Crop an image by dimensions"
    },
    {
        id: "passport",
        name: "Passport Image Maker",
        icon: "🪪",
        description: "Create fixed-size student images"
    },
    {
        id: "pdf",
        name: "PDF Viewer & Editor",
        icon: "📕",
        description: "View, edit, stamp and save PDF files"
    },
    {
        id: "imagetopdf",
        name: "Images to PDF Maker",
        icon: "🖼️",
        description: "Combine, crop and filter photos into PDF"
    },
    {
        id: "imagereducer",
        name: "Image Size Reducer",
        icon: "📉",
        description: "Reduce image file size in batches"
    },
    {
        id: "textpdf",
        name: "Text to PDF",
        icon: "📝",
        description: "Print text and save it as PDF"
    },
    {
        id: "camera",
        name: "Camera Capture",
        icon: "📷",
        description: "Select or capture a photo"
    }
];

/* ------------------------------
   COMMON FUNCTIONS
------------------------------ */

function showResult(message, error = false) {
    const result = $("#toolResult");

    if (!result) return;

    result.textContent = message;

    result.className = error
        ? "tool-result status error"
        : "tool-result status success";
}

function clearResult() {
    const result = $("#toolResult");

    if (!result) return;

    result.textContent = "";
    result.className = "tool-result";
}

function numberField(label, id, value, min = 0, max = 100000) {
    return `
        <div class="field">
            <label for="${id}">${label}</label>
            <input
                type="number"
                id="${id}"
                min="${min}"
                max="${max}"
                value="${value}">
        </div>
    `;
}

function fileField(accept = "*/*", multiple = false) {
    return `
        <div class="field">
            <label for="pickedFile">Select File</label>
            <input
                type="file"
                id="pickedFile"
                accept="${accept}"
                ${multiple ? "multiple" : ""}>
        </div>
    `;
}

function actionButton(label = "Calculate") {
    return `
        <button type="button" class="btn btn-primary" id="doTool">
            ${label}
        </button>
    `;
}

function getFile() {
    return $("#pickedFile")?.files?.[0] || null;
}

function createDownload(blob, filename) {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Give mobile browsers enough time to start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Unable to load this image."));
        };

        image.src = url;
    });
}

function canvasBlob(canvas, type, quality = 0.85) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (blob) resolve(blob);
                else reject(new Error("Image conversion failed."));
            },
            type,
            quality
        );
    });
}

/* ------------------------------
   WORKSPACE
------------------------------ */

function workspace(html, action) {
    const area = $("#toolWorkspace");

    area.innerHTML = html;

    clearResult();

    // Create calculator rows immediately.
    const countInput = $("#count");

    if (countInput) {
        countInput.dispatchEvent(
            new Event("input", { bubbles: true })
        );
    }

    const button = $("#doTool");

    if (!button) return;

    button.addEventListener("click", async function () {
        const originalText = button.textContent;

        button.disabled = true;
        button.textContent = "Processing...";

        try {
            await action();
        } catch (error) {
            console.error(error);

            showResult(
                error.message || "Something went wrong.",
                true
            );
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    });
}

/* ------------------------------
   ATTENDANCE CALCULATOR
------------------------------ */

function attendanceTool() {
    workspace(`
        <h2>📅 Attendance Calculator</h2>

        <p class="muted">
            Calculate your current attendance and classes required.
        </p>

        ${numberField("Classes Attended", "attended", 75)}
        ${numberField("Total Classes", "total", 100, 1)}
        ${numberField("Required Attendance (%)", "required", 75, 1, 100)}

        ${actionButton("Calculate Attendance")}
    `, () => {
        const attended = Number($("#attended").value);
        const total = Number($("#total").value);
        const required = Number($("#required").value);

        if (
            !Number.isFinite(attended) ||
            !Number.isFinite(total) ||
            !Number.isFinite(required) ||
            total <= 0 ||
            attended < 0 ||
            attended > total ||
            required <= 0 ||
            required > 100
        ) {
            throw new Error("Please enter valid attendance values.");
        }

        const percentage = attended / total * 100;

        let message = `Current attendance: ${percentage.toFixed(2)}%.`;

        if (percentage >= required) {
            message += " Your required attendance has been achieved.";
        } else if (required === 100) {
            message += " You need to attend every remaining class.";
        } else {
            const needed = Math.ceil(
                (required * total - 100 * attended) /
                (100 - required)
            );

            message += ` Attend ${Math.max(0, needed)} more consecutive classes to reach ${required}%.`;
        }

        showResult(message);
    });
}

/* ------------------------------
   PERCENTAGE CALCULATOR
------------------------------ */

function percentageTool() {
    workspace(`
        <h2>％ Percentage Calculator</h2>

        ${numberField("Marks Obtained", "obtained", 450)}
        ${numberField("Total Marks", "maximum", 500, 1)}

        ${actionButton("Calculate Percentage")}
    `, () => {
        const obtained = Number($("#obtained").value);
        const maximum = Number($("#maximum").value);

        if (
            !Number.isFinite(obtained) ||
            !Number.isFinite(maximum) ||
            maximum <= 0 ||
            obtained < 0 ||
            obtained > maximum
        ) {
            throw new Error("Please enter valid marks.");
        }

        const percentage = obtained / maximum * 100;

        showResult(
            `Your percentage is ${percentage.toFixed(2)}%.`
        );
    });
}

/* ------------------------------
   SGPA CALCULATOR
------------------------------ */

function createSubjectRows() {
    const count = Math.max(
        1,
        Math.min(30, Number($("#count")?.value || 1))
    );

    const container = $("#subjectRows");

    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const row = document.createElement("div");

        row.className = "grid";

        row.innerHTML = `
            <div class="field">
                <label for="credit${i}">
                    Subject ${i + 1} Credits
                </label>
                <input
                    type="number"
                    id="credit${i}"
                    min="0.1"
                    step="0.1"
                    value="4">
            </div>

            <div class="field">
                <label for="grade${i}">
                    Subject ${i + 1} Grade Point
                </label>
                <input
                    type="number"
                    id="grade${i}"
                    min="0"
                    max="10"
                    step="0.1"
                    value="8">
            </div>
        `;

        container.appendChild(row);
    }
}

function sgpaTool() {
    workspace(`
        <h2>📊 SGPA Calculator</h2>

        <p class="muted">
            Enter credits and grade points for each subject.
        </p>

        ${numberField("Number of Subjects", "count", 5, 1, 30)}

        <div id="subjectRows"></div>

        ${actionButton("Calculate SGPA")}
    `, () => {
        const count = Math.max(
            1,
            Math.min(30, Number($("#count").value))
        );

        let totalCredits = 0;
        let totalPoints = 0;

        for (let i = 0; i < count; i++) {
            const credit = Number($("#credit" + i).value);
            const grade = Number($("#grade" + i).value);

            if (
                !Number.isFinite(credit) ||
                !Number.isFinite(grade) ||
                credit <= 0 ||
                grade < 0 ||
                grade > 10
            ) {
                throw new Error(
                    `Please check subject ${i + 1}.`
                );
            }

            totalCredits += credit;
            totalPoints += credit * grade;
        }

        const sgpa = totalPoints / totalCredits;

        showResult(
            `Your SGPA is ${sgpa.toFixed(2)}.`
        );
    });
}

/* ------------------------------
   CGPA CALCULATOR
------------------------------ */

function createSemesterRows() {
    const count = Math.max(
        1,
        Math.min(20, Number($("#count")?.value || 1))
    );

    const container = $("#semesterRows");

    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const field = document.createElement("div");

        field.className = "field";

        field.innerHTML = `
            <label for="semester${i}">
                Semester ${i + 1} SGPA
            </label>

            <input
                type="number"
                id="semester${i}"
                min="0"
                max="10"
                step="0.01"
                value="8">
        `;

        container.appendChild(field);
    }
}

function cgpaTool() {
    workspace(`
        <h2>🎯 CGPA Calculator</h2>

        <p class="muted">
            Enter your semester SGPA values.
        </p>

        ${numberField("Number of Semesters", "count", 2, 1, 20)}

        <div id="semesterRows"></div>

        ${actionButton("Calculate CGPA")}
    `, () => {
        const count = Math.max(
            1,
            Math.min(20, Number($("#count").value))
        );

        let total = 0;

        for (let i = 0; i < count; i++) {
            const value = Number($("#semester" + i).value);

            if (
                !Number.isFinite(value) ||
                value < 0 ||
                value > 10
            ) {
                throw new Error(
                    `Invalid SGPA in semester ${i + 1}.`
                );
            }

            total += value;
        }

        const cgpa = total / count;

        showResult(
            `Average CGPA estimate: ${cgpa.toFixed(2)}. Use your university's official credit-weighted formula where applicable.`
        );
    });
}

/* ------------------------------
   IMAGE COMPRESSOR / RESIZER
------------------------------ */

function imageTool() {
    workspace(`
        <h2>🖼️ Image Compressor and Converter</h2>

        ${fileField("image/*")}

        <div class="field">
            <label for="imageOperation">Operation</label>

            <select id="imageOperation">
                <option value="compress">Compress</option>
                <option value="resize">Resize</option>
                <option value="convert">Convert Format</option>
            </select>
        </div>

        ${numberField("Image Quality (%)", "quality", 75, 10, 100)}
        ${numberField("Output Width (px)", "imageWidth", 800, 1, 10000)}
        ${numberField("Output Height (px)", "imageHeight", 800, 1, 10000)}

        <div class="field">
            <label for="imageFormat">Output Format</label>

            <select id="imageFormat">
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
            </select>
        </div>

        ${actionButton("Process Image")}
    `, async () => {
        const file = getFile();

        if (!file) {
            throw new Error("Please select an image.");
        }

        if (!file.type.startsWith("image/")) {
            throw new Error("Please select a valid image file.");
        }

        const image = await loadImage(file);

        const operation = $("#imageOperation").value;
        const format = $("#imageFormat").value;
        const qualityPercent = Number($("#quality").value);
        const quality = qualityPercent / 100;

        if (!Number.isFinite(qualityPercent) || qualityPercent < 10 || qualityPercent > 100) {
            throw new Error("Choose image quality between 10% and 100%.");
        }

        const canvas = document.createElement("canvas");

        if (operation === "resize") {
            const maxWidth = Number($("#imageWidth").value);
            const maxHeight = Number($("#imageHeight").value);

            if (
                !Number.isFinite(maxWidth) ||
                !Number.isFinite(maxHeight) ||
                maxWidth < 1 ||
                maxHeight < 1
            ) {
                throw new Error("Enter valid output dimensions.");
            }

            // Fit inside the requested box without stretching the original image.
            const scale = Math.min(
                maxWidth / image.naturalWidth,
                maxHeight / image.naturalHeight
            );

            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        } else {
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
        }

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Your device could not process this image.");

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const output = await canvasBlob(
            canvas,
            format,
            quality
        );

        const extension = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        }[format];

        createDownload(
            output,
            "edugm-image." + extension
        );

        showResult(
            `Image processed. Original size: ${file.size} bytes. Output size: ${output.size} bytes.`
        );
    });
}

/* ------------------------------
   IMAGE CROPPER
------------------------------ */

function cropTool() {
    workspace(`
        <h2>✂️ Image Cropper</h2>

        ${fileField("image/*")}

        ${numberField("Start X", "cropX", 0)}
        ${numberField("Start Y", "cropY", 0)}
        ${numberField("Crop Width", "cropWidth", 300, 1)}
        ${numberField("Crop Height", "cropHeight", 300, 1)}

        ${actionButton("Crop and Download")}
    `, async () => {
        const file = getFile();

        if (!file) {
            throw new Error("Please select an image.");
        }

        const image = await loadImage(file);

        const x = Number($("#cropX").value);
        const y = Number($("#cropY").value);
        const width = Number($("#cropWidth").value);
        const height = Number($("#cropHeight").value);

        if (
            ![x, y, width, height].every(Number.isFinite) ||
            x < 0 ||
            y < 0 ||
            width <= 0 ||
            height <= 0 ||
            x + width > image.naturalWidth ||
            y + height > image.naturalHeight
        ) {
            throw new Error(
                `Invalid crop. Image size: ${image.naturalWidth} × ${image.naturalHeight}.`
            );
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        canvas.getContext("2d").drawImage(
            image,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height
        );

        const output = await canvasBlob(
            canvas,
            "image/png"
        );

        createDownload(output, "edugm-cropped.png");

        showResult("Your cropped image is ready.");
    });
}

/* ------------------------------
   PASSPORT / STUDENT IMAGE MAKER
------------------------------ */

function passportTool() {
    workspace(`
        <h2>🪪 Student Image Maker</h2>

        ${fileField("image/*")}

        ${numberField("Output Width (px)", "passportWidth", 413, 1, 5000)}
        ${numberField("Output Height (px)", "passportHeight", 531, 1, 5000)}

        ${actionButton("Create Student Image")}
    `, async () => {
        const file = getFile();

        if (!file) {
            throw new Error("Please select an image.");
        }

        const image = await loadImage(file);

        const width = Number($("#passportWidth").value);
        const height = Number($("#passportHeight").value);

        if (width <= 0 || height <= 0) {
            throw new Error("Enter valid dimensions.");
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        context.fillStyle = "#ffffff";

        context.fillRect(0, 0, width, height);

        // Fit image into the requested output dimensions.
        const scale = Math.min(
            width / image.naturalWidth,
            height / image.naturalHeight
        );

        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;

        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        context.drawImage(
            image,
            x,
            y,
            drawWidth,
            drawHeight
        );

        const output = await canvasBlob(
            canvas,
            "image/jpeg",
            0.92
        );

        createDownload(
            output,
            "edugm-student-photo.jpg"
        );

        showResult(
            `Student image created at ${width} × ${height} pixels.`
        );
    });
}

/* ------------------------------
   PDF VIEWER
------------------------------ */

function pdfTool() {
    workspace(`
        <h2>📕 PDF Viewer</h2>

        ${fileField("application/pdf,.pdf")}

        ${actionButton("Open PDF")}
    `, () => {
        const file = getFile();

        if (!file) {
            throw new Error("Please select a PDF file.");
        }

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            throw new Error("The selected file is not a PDF.");
        }

        const url = URL.createObjectURL(file);

        const frame = document.createElement("iframe");

        frame.src = url;
        frame.title = "Local PDF Viewer";

        frame.style.width = "100%";
        frame.style.height = "65vh";
        frame.style.border = "0";

        const result = $("#toolResult");

        result.replaceChildren(frame);
        result.className = "tool-result";
    });
}

/* ------------------------------
   TEXT TO PDF
------------------------------ */

function textPdfTool() {
    workspace(`
        <h2>📝 Text to PDF</h2>

        <div class="field">
            <label for="pdfText">Enter Your Text</label>

            <textarea
                id="pdfText"
                rows="12"
                placeholder="Write your text here..."></textarea>
        </div>

        ${actionButton("Print / Save PDF")}
    `, () => {
        const text = $("#pdfText").value;

        if (!text.trim()) {
            throw new Error("Please enter some text.");
        }

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            throw new Error(
                "Allow pop-ups to open the PDF print window."
            );
        }

        const safeText = text.replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>EduGM Text Document</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        line-height: 1.6;
                        padding: 20mm;
                        white-space: pre-wrap;
                        overflow-wrap: anywhere;
                    }

                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                </style>
            </head>

            <body>${safeText}</body>
            </html>
        `);

        printWindow.document.close();

        printWindow.onload = function () {
            printWindow.print();
        };

        showResult(
            "Choose Save as PDF in the print window to save your document."
        );
    });
}

/* ------------------------------
   CAMERA / FILE CAPTURE
------------------------------ */

function cameraTool() {
    workspace(`
        <h2>📷 Camera Capture</h2>

        <p class="muted">
            Open the device camera or choose an existing image.
        </p>

        <div class="field">
            <label for="cameraInput">Camera or Gallery</label>

            <input
                type="file"
                id="cameraInput"
                accept="image/*"
                capture="environment">
        </div>

        ${actionButton("Save Selected Photo")}
    `, () => {
        const file = $("#cameraInput").files[0];

        if (!file) {
            throw new Error(
                "Please capture or select a photo first."
            );
        }

        if (!file.type.startsWith("image/")) {
            throw new Error("Please select an image.");
        }

        const extension = file.name.includes(".")
            ? file.name.split(".").pop().toLowerCase()
            : "jpg";

        createDownload(file, "edugm-camera-photo." + extension);

        showResult("Your selected photo has been downloaded.");
    });
}


/* ------------------------------
   PDF VIEWER AND EDITOR
------------------------------ */

async function loadPdfLib() {
    if (window.PDFLib) return window.PDFLib;
    if (window.__edugmPdfLibPromise) return window.__edugmPdfLibPromise;

    window.__edugmPdfLibPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
        script.onload = () => window.PDFLib
            ? resolve(window.PDFLib)
            : reject(new Error("PDF editing library did not load."));
        script.onerror = () => reject(new Error("PDF editing needs an internet connection the first time."));
        document.head.appendChild(script);
    });

    return window.__edugmPdfLibPromise;
}

function pdfTool() {
    workspace(`
        <h2>📕 PDF Viewer & Editor</h2>
        <p class="muted">Choose a PDF from your device. Your selected file stays on this device.</p>
        <div class="field">
            <label for="pdfInput">Choose PDF file</label>
            <input id="pdfInput" type="file" accept="application/pdf,.pdf">
        </div>
        <div class="tool-actions">
            <button type="button" class="btn btn-primary" id="openPdf">View PDF</button>
            <button type="button" class="btn btn-secondary" id="newPdfTab">Open separately</button>
        </div>
        <hr>
        <h3>Quick PDF editing</h3>
        <div class="field">
            <label for="pdfStamp">Add text to every page (optional)</label>
            <input id="pdfStamp" type="text" maxlength="100" placeholder="Example: EduGM UniTools">
        </div>
        <div class="field">
            <label for="pdfStampSize">Text size</label>
            <input id="pdfStampSize" type="number" min="8" max="60" value="18">
        </div>
        <button type="button" class="btn btn-primary" id="saveEditedPdf">Apply text & download edited PDF</button>
        <div id="pdfPreview" class="pdf-preview" aria-live="polite"></div>
        <p class="muted small">Viewing uses your browser's PDF support. Editing adds a text stamp to each page; it does not rewrite existing PDF text.</p>
    `, () => {});
    const input = $("#pdfInput");
    const preview = $("#pdfPreview");
    let currentUrl = null;

    $("#openPdf").addEventListener("click", () => {
        const file = input.files?.[0];
        if (!file) return showResult("Select a PDF first.", true);
        if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
            return showResult("Please select a valid PDF file.", true);
        }
        if (currentUrl) URL.revokeObjectURL(currentUrl);
        currentUrl = URL.createObjectURL(file);
        const frame = document.createElement("iframe");
        frame.src = currentUrl + "#toolbar=1&navpanes=1";
        frame.title = "PDF preview";
        frame.style.width = "100%";
        frame.style.height = "70vh";
        frame.style.border = "1px solid var(--border)";
        preview.replaceChildren(frame);
        showResult("PDF opened. Use your browser's PDF controls to zoom or print.");
    });

    $("#newPdfTab").addEventListener("click", () => {
        const file = input.files?.[0];
        if (!file) return showResult("Select a PDF first.", true);
        const url = URL.createObjectURL(file);
        const tab = window.open(url, "_blank");
        if (!tab) showResult("Pop-up blocked. Use View PDF instead.", true);
        else showResult("PDF opened in a new tab.");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    });

    $("#saveEditedPdf").addEventListener("click", async event => {
        const button = event.currentTarget;
        const file = input.files?.[0];
        const stamp = $("#pdfStamp").value.trim();
        if (!file) return showResult("Select a PDF first.", true);
        if (!stamp) return showResult("Enter the text you want to add.", true);
        const size = Number($("#pdfStampSize").value);
        if (!Number.isFinite(size) || size < 8 || size > 60) return showResult("Text size must be between 8 and 60.", true);
        button.disabled = true;
        button.textContent = "Editing PDF...";
        try {
            const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
            const doc = await PDFDocument.load(await file.arrayBuffer());
            const font = await doc.embedFont(StandardFonts.Helvetica);
            doc.getPages().forEach(page => {
                const { width, height } = page.getSize();
                page.drawText(stamp, {
                    x: 28, y: 24, size, font,
                    color: rgb(0.35, 0.25, 0.75),
                    opacity: 0.75,
                    maxWidth: Math.max(50, width - 56)
                });
            });
            const bytes = await doc.save();
            createDownload(new Blob([bytes], { type: "application/pdf" }), safeFileName(file.name, "-edited.pdf"));
            showResult("Edited PDF downloaded. Existing content was preserved and a text stamp was added.");
        } catch (error) {
            console.error(error);
            showResult(error.message || "Could not edit this PDF. It may be password-protected or damaged.", true);
        } finally {
            button.disabled = false;
            button.textContent = "Apply text & download edited PDF";
        }
    });
}

/* ------------------------------
   IMAGE TO PDF MAKER
------------------------------ */

function safeFileName(name, suffix) {
    const base = (name || "edugm-file").replace(/\\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 70) || "edugm-file";
    return base + suffix;
}

async function getProcessedImageBytes(file, settings) {
    const image = await loadImage(file);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    let sx = 0, sy = 0, sw = width, sh = height;

    if (settings.cropMode === "square") {
        const side = Math.min(width, height);
        sx = Math.floor((width - side) / 2);
        sy = Math.floor((height - side) / 2);
        sw = sh = side;
    } else if (settings.cropMode === "manual") {
        const left = Math.min(90, Math.max(0, settings.left));
        const top = Math.min(90, Math.max(0, settings.top));
        const right = Math.min(100, Math.max(left + 1, settings.right));
        const bottom = Math.min(100, Math.max(top + 1, settings.bottom));
        sx = Math.round(width * left / 100);
        sy = Math.round(height * top / 100);
        sw = Math.max(1, Math.round(width * (right - left) / 100));
        sh = Math.max(1, Math.round(height * (bottom - top) / 100));
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, sw);
    canvas.height = Math.max(1, sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image processing is not supported on this device.");
    ctx.filter = settings.filter;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await canvasBlob(canvas, "image/jpeg", settings.quality);
    return { bytes: await blob.arrayBuffer(), width: sw, height: sh };
}

function imageToPdfTool() {
    workspace(`
        <h2>🖼️ Images to PDF Maker</h2>
        <p class="muted">Select multiple images or capture photos. Each image becomes one PDF page.</p>
        <div class="field">
            <label for="pdfImages">Choose images (multiple)</label>
            <input id="pdfImages" type="file" accept="image/*" multiple>
        </div>
        <div class="field">
            <label for="captureImages">Capture images with camera</label>
            <input id="captureImages" type="file" accept="image/*" capture="environment" multiple>
        </div>
        <div class="field">
            <label for="imagePdfName">PDF file name</label>
            <input id="imagePdfName" type="text" maxlength="70" value="EduGM-Images">
        </div>
        <div class="field">
            <label for="pageSize">Page size</label>
            <select id="pageSize"><option value="a4">A4</option><option value="letter">Letter</option><option value="fit">Fit image</option></select>
        </div>
        <div class="field">
            <label for="cropMode">Crop mode</label>
            <select id="cropMode"><option value="none">Normal (no crop)</option><option value="square">Auto square crop (centre)</option><option value="manual">Manual crop (percentage)</option></select>
        </div>
        <div class="grid two">
            <div class="field"><label for="cropLeft">Left %</label><input id="cropLeft" type="number" min="0" max="99" value="0"></div>
            <div class="field"><label for="cropTop">Top %</label><input id="cropTop" type="number" min="0" max="99" value="0"></div>
            <div class="field"><label for="cropRight">Right %</label><input id="cropRight" type="number" min="1" max="100" value="100"></div>
            <div class="field"><label for="cropBottom">Bottom %</label><input id="cropBottom" type="number" min="1" max="100" value="100"></div>
        </div>
        <div class="field">
            <label for="imageFilter">Photo filter</label>
            <select id="imageFilter"><option value="none">Original</option><option value="grayscale(100%)">Black & white</option><option value="sepia(80%)">Sepia</option><option value="contrast(125%)">High contrast</option><option value="brightness(110%)">Bright</option><option value="saturate(150%)">Vivid</option></select>
        </div>
        <div class="field"><label for="pdfImageQuality">Image quality (%)</label><input id="pdfImageQuality" type="range" min="30" max="100" value="85"><output id="qualityOutput">85%</output></div>
        <div id="imageSelectionInfo" class="muted small">No images selected.</div>
        <button type="button" class="btn btn-primary" id="makeImagePdf">Create PDF</button>
        <p class="muted small">Photos are processed locally. For large batches, choose fewer or smaller images to avoid using too much device memory.</p>
    `, () => {});
    const fileInput = $("#pdfImages");
    const cameraInput = $("#captureImages");
    const info = $("#imageSelectionInfo");
    const quality = $("#pdfImageQuality");
    quality.addEventListener("input", () => $("#qualityOutput").textContent = quality.value + "%");

    function chosenFiles() {
        return [...(fileInput.files || []), ...(cameraInput.files || [])].filter(f => f.type.startsWith("image/"));
    }
    function updateInfo() {
        const files = chosenFiles();
        info.textContent = files.length ? files.length + " image(s) selected: " + files.map(f => f.name).join(", ") : "No images selected.";
    }
    fileInput.addEventListener("change", updateInfo);
    cameraInput.addEventListener("change", updateInfo);

    $("#makeImagePdf").addEventListener("click", async event => {
        const button = event.currentTarget;
        const files = chosenFiles();
        if (!files.length) return showResult("Choose or capture at least one image.", true);
        if (files.length > 40) return showResult("For smooth performance, create up to 40 pages at a time.", true);
        const cropMode = $("#cropMode").value;
        const settings = {
            cropMode,
            left: Number($("#cropLeft").value),
            top: Number($("#cropTop").value),
            right: Number($("#cropRight").value),
            bottom: Number($("#cropBottom").value),
            filter: $("#imageFilter").value,
            quality: Number(quality.value) / 100
        };
        if (cropMode === "manual" && !(settings.right > settings.left && settings.bottom > settings.top)) {
            return showResult("Manual crop right/bottom must be greater than left/top.", true);
        }
        button.disabled = true;
        button.textContent = "Creating PDF...";
        try {
            const { PDFDocument } = await loadPdfLib();
            const pdf = await PDFDocument.create();
            const size = $("#pageSize").value;
            for (let i = 0; i < files.length; i++) {
                const processed = await getProcessedImageBytes(files[i], settings);
                const jpg = await pdf.embedJpg(processed.bytes);
                let pageWidth = 595.28, pageHeight = 841.89;
                if (size === "letter") { pageWidth = 612; pageHeight = 792; }
                if (size === "fit") {
                    const scale = Math.min(595.28 / processed.width, 841.89 / processed.height);
                    pageWidth = processed.width * scale;
                    pageHeight = processed.height * scale;
                }
                const page = pdf.addPage([pageWidth, pageHeight]);
                const margin = size === "fit" ? 0 : 24;
                const scale = Math.min((pageWidth - margin * 2) / processed.width, (pageHeight - margin * 2) / processed.height);
                const w = processed.width * scale, h = processed.height * scale;
                page.drawImage(jpg, { x: (pageWidth - w) / 2, y: (pageHeight - h) / 2, width: w, height: h });
            }
            const bytes = await pdf.save();
            const name = ($("#imagePdfName").value.trim() || "EduGM-Images").replace(/[^a-z0-9_-]+/gi, "-").slice(0,70);
            createDownload(new Blob([bytes], {type:"application/pdf"}), name + ".pdf");
            showResult("Created a " + files.length + "-page PDF successfully.");
        } catch (error) {
            console.error(error);
            showResult(error.message || "Could not create the PDF.", true);
        } finally {
            button.disabled = false;
            button.textContent = "Create PDF";
        }
    });
}

/* ------------------------------
   BATCH IMAGE SIZE REDUCER
------------------------------ */

function imageReducerTool() {
    workspace(`
        <h2>📉 Image Size Reducer</h2>
        <p class="muted">Compress several images in one batch. Files are processed on your device.</p>
        <div class="field"><label for="reduceImages">Choose images</label><input id="reduceImages" type="file" accept="image/*" multiple></div>
        <div class="field"><label for="reduceQuality">Quality (%)</label><input id="reduceQuality" type="range" min="10" max="95" value="65"><output id="reduceQualityOut">65%</output></div>
        <div class="field"><label for="reduceMaxWidth">Maximum width (px, 0 = original)</label><input id="reduceMaxWidth" type="number" min="0" max="12000" value="1600"></div>
        <div class="field"><label for="reduceFormat">Output format</label><select id="reduceFormat"><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option><option value="image/png">PNG</option></select></div>
        <div id="reduceInfo" class="muted small">No images selected.</div>
        <button type="button" class="btn btn-primary" id="reduceBatch">Reduce image sizes</button>
    `, () => {});
    const input = $("#reduceImages");
    const quality = $("#reduceQuality");
    quality.addEventListener("input", () => $("#reduceQualityOut").textContent = quality.value + "%");
    input.addEventListener("change", () => $("#reduceInfo").textContent = input.files.length + " image(s) selected.");
    $("#reduceBatch").addEventListener("click", async event => {
        const button = event.currentTarget;
        const files = [...input.files];
        if (!files.length) return showResult("Choose at least one image.", true);
        if (files.length > 50) return showResult("Please process up to 50 images at a time.", true);
        button.disabled = true;
        let saved = 0, originalBytes = 0, outputBytes = 0;
        try {
            const format = $("#reduceFormat").value;
            const maxWidth = Number($("#reduceMaxWidth").value);
            if (!Number.isFinite(maxWidth) || maxWidth < 0) throw new Error("Enter a valid maximum width.");
            for (const file of files) {
                if (!file.type.startsWith("image/")) continue;
                const img = await loadImage(file);
                const scale = maxWidth > 0 ? Math.min(1, maxWidth / img.naturalWidth) : 1;
                const canvas = document.createElement("canvas");
                canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
                canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Canvas processing is unavailable.");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const blob = await canvasBlob(canvas, format, Number(quality.value) / 100);
                const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
                createDownload(blob, safeFileName(file.name, "-reduced." + ext));
                originalBytes += file.size;
                outputBytes += blob.size;
                saved++;
            }
            const reduction = originalBytes ? Math.max(0, (1 - outputBytes / originalBytes) * 100) : 0;
            showResult(saved + " image(s) processed. Total size: " + originalBytes + " → " + outputBytes + " bytes (" + reduction.toFixed(1) + "% smaller). Downloads may appear one by one.");
        } catch (error) {
            showResult(error.message || "Batch compression failed.", true);
        } finally {
            button.disabled = false;
        }
    });
}


/* ------------------------------
   OPEN TOOL
------------------------------ */

function openTool(id) {
    switch (id) {
        case "attendance":
            attendanceTool();
            break;

        case "percentage":
            percentageTool();
            break;

        case "sgpa":
            sgpaTool();
            break;

        case "cgpa":
            cgpaTool();
            break;

        case "image":
            imageTool();
            break;

        case "crop":
            cropTool();
            break;

        case "passport":
            passportTool();
            break;

        case "pdf":
            pdfTool();
            break;

        case "imagetopdf":
            imageToPdfTool();
            break;

        case "imagereducer":
            imageReducerTool();
            break;

        case "textpdf":
            textPdfTool();
            break;

        case "camera":
            cameraTool();
            break;

        default:
            showResult("This tool is not available.", true);
    }
}

/* ------------------------------
   TOOL MENU
------------------------------ */

function renderToolMenu(search = "") {
    const menu = $("#toolMenu");

    if (!menu) return;

    menu.replaceChildren();

    const filtered = tools.filter(tool => {
        const text = (
            tool.name + " " + tool.description
        ).toLowerCase();

        return text.includes(search.toLowerCase());
    });

    if (!filtered.length) {
        menu.textContent = "No matching tools found.";
        return;
    }

    filtered.forEach(tool => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "tool-card";

        button.innerHTML = `
            <span class="tool-icon">${tool.icon}</span>

            <span>
                <strong>${tool.name}</strong>
                <small>${tool.description}</small>
            </span>
        `;

        button.addEventListener("click", () => {
            openTool(tool.id);
        });

        menu.appendChild(button);
    });
}

/* ------------------------------
   INITIALIZE TOOLS PAGE
------------------------------ */

export function initTools() {
    const menu = $("#toolMenu");

    if (!menu) return;

    renderToolMenu();

    const search = $("#toolSearch");

    if (search) {
        search.addEventListener("input", function () {
            renderToolMenu(search.value);
        });
    }

    // Update calculator subject/semester fields.
    document.addEventListener("input", function (event) {
        if (event.target.id !== "count") return;

        const value = Math.max(
            1,
            Math.min(30, Number(event.target.value || 1))
        );

        const subjects = $("#subjectRows");
        const semesters = $("#semesterRows");

        if (subjects) {
            subjects.innerHTML = "";

            for (let i = 0; i < value; i++) {
                const row = document.createElement("div");

                row.className = "grid";

                row.innerHTML = `
                    <div class="field">
                        <label>Subject ${i + 1} Credits</label>
                        <input
                            id="credit${i}"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value="4">
                    </div>

                    <div class="field">
                        <label>Subject ${i + 1} Grade Point</label>
                        <input
                            id="grade${i}"
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value="8">
                    </div>
                `;

                subjects.appendChild(row);
            }
        }

        if (semesters) {
            semesters.innerHTML = "";

            for (let i = 0; i < value; i++) {
                const field = document.createElement("div");

                field.className = "field";

                field.innerHTML = `
                    <label>Semester ${i + 1} SGPA</label>

                    <input
                        id="semester${i}"
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value="8">
                `;

                semesters.appendChild(field);
            }
        }
    });
}

/* ------------------------------
   HOME PAGE TOOL CARDS
------------------------------ */

export function renderHomeTools() {
    const container = $("#homeTools");

    if (!container) return;

    container.replaceChildren();

    tools.slice(0, 6).forEach(tool => {
        const link = document.createElement("a");

        link.href = "tools.html";
        link.className = "tool-card";

        link.innerHTML = `
            <span class="tool-icon">${tool.icon}</span>

            <span>
                <strong>${tool.name}</strong>
                <small>${tool.description}</small>
            </span>
        `;

        container.appendChild(link);
    });
}
