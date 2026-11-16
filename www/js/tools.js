
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
        name: "PDF Viewer",
        icon: "📕",
        description: "Open and view local PDF files"
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
