
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* FIREBASE CONFIGURATION */
const firebaseConfig = {
  apiKey: "AIzaSyBxdkXP48MtLOZwcNicQnBNQrXjjVf4C6E",
  authDomain: "edugm-unitools-donations.firebaseapp.com",
  projectId: "edugm-unitools-donations",
  storageBucket: "edugm-unitools-donations.firebasestorage.app",
  messagingSenderId: "359466843038",
  appId: "1:359466843038:web:d39f7ed498c1c3836f348f"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const tools = [
  { id:"pdfviewer", name:"PDF Viewer", category:"PDF", icon:"📕", desc:"Open and view PDF files." },
  { id:"pdfcompress", name:"PDF Compressor", category:"PDF", icon:"🗜️", desc:"Re-save and optimize PDF files." },
  { id:"imagetopdf", name:"Image to PDF", category:"PDF", icon:"🖼️", desc:"Convert images into a PDF." },
  { id:"pdftoimage", name:"PDF to Image", category:"PDF", icon:"📸", desc:"Convert a PDF page into an image." },
  { id:"mergepdf", name:"Merge PDF", category:"PDF", icon:"📚", desc:"Combine multiple PDF files." },
  { id:"splitpdf", name:"Split PDF", category:"PDF", icon:"✂️", desc:"Extract a page range from a PDF." },
  { id:"texttopdf", name:"Text to PDF", category:"PDF", icon:"📝", desc:"Create a PDF from text." },
  { id:"imagecompress", name:"Image Compressor", category:"Images", icon:"🗜️", desc:"Reduce image file size." },
  { id:"imageresize", name:"Image Resizer", category:"Images", icon:"📐", desc:"Resize an image in pixels." },
  { id:"imageconvert", name:"Image Converter", category:"Images", icon:"🔄", desc:"Convert JPG, PNG and WebP." },
  { id:"imagecrop", name:"Image Cropper", category:"Images", icon:"✂️", desc:"Crop an image using pixel coordinates." },
  { id:"passport", name:"Passport Photo Maker", category:"Student", icon:"🪪", desc:"Create a passport-size photo." },
  { id:"signature", name:"Signature Resizer", category:"Student", icon:"✍️", desc:"Resize a signature image." },
  { id:"examimage", name:"NEET/JEE Image Helper", category:"Student", icon:"🎓", desc:"Resize an exam photo or signature." },
  { id:"admit", name:"Admit Card Print Helper", category:"Student", icon:"🖨️", desc:"Prepare a printable PDF from an image." },
  { id:"attendance", name:"Attendance Calculator", category:"Student", icon:"📅", desc:"Calculate attendance percentage." },
  { id:"sgpa", name:"SGPA Calculator", category:"Student", icon:"📊", desc:"Calculate SGPA using credits and grade points." },
  { id:"cgpa", name:"CGPA Calculator", category:"Student", icon:"🎯", desc:"Calculate CGPA from semester GPAs." },
  { id:"percentage", name:"Percentage Calculator", category:"Student", icon:"％", desc:"Calculate marks percentage." },
  { id:"qr", name:"QR Code Generator", category:"Documents", icon:"▦", desc:"Create a QR code from text or a link." },
  { id:"word", name:"Word to PDF", category:"Documents", icon:"📄", desc:"Convert a Word document to PDF." },
  { id:"excel", name:"Excel to PDF", category:"Documents", icon:"📊", desc:"Convert a spreadsheet to PDF." },
  { id:"ppt", name:"PowerPoint to PDF", category:"Documents", icon:"📽️", desc:"Convert a presentation to PDF." },
  { id:"scanner", name:"Document Scanner", category:"Images", icon:"📷", desc:"Capture a document image with your camera." }
];

const grid = document.getElementById("toolsGrid");
const result = document.getElementById("toolResult");
let currentCategory = "All";
let activeObjectUrl = null;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}

function renderTools() {
  const query = document.getElementById("searchInput").value.toLowerCase();

  const filtered = tools.filter(tool =>
    (currentCategory === "All" || tool.category === currentCategory) &&
    (tool.name.toLowerCase().includes(query) ||
     tool.desc.toLowerCase().includes(query))
  );

  document.getElementById("toolCount").textContent = `${filtered.length} tools`;
  grid.innerHTML = "";

  filtered.forEach(tool => {
    const card = document.createElement("button");
    card.className = "tool-card";
    card.innerHTML = `
      <span class="tool-icon">${tool.icon}</span>
      <strong>${escapeHTML(tool.name)}</strong>
      <small>${escapeHTML(tool.desc)}</small>`;
    card.addEventListener("click", () => openTool(tool.id));
    grid.appendChild(card);
  });

  if (!filtered.length) {
    grid.innerHTML = "<p>No matching tools found.</p>";
  }
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  window.scrollTo(0, 0);
}

function setResult(message, isError = false) {
  result.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = message;
  p.className = isError ? "status-error" : "status-success";
  result.appendChild(p);
}

function setDownload(blob, filename, message = "Your file is ready.") {
  if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
  activeObjectUrl = URL.createObjectURL(blob);

  result.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = message;
  p.className = "status-success";

  const link = document.createElement("a");
  link.href = activeObjectUrl;
  link.download = filename;
  link.textContent = `Download ${filename}`;
  link.style.display = "inline-block";
  link.style.marginTop = "10px";

  result.append(p, link);
}

function fileInput(label, accept = "*/*", multiple = false, camera = false) {
  return `
    <label>${label}</label>
    <input id="toolFiles" type="file" accept="${accept}"
      ${multiple ? "multiple" : ""}
      ${camera ? 'capture="environment"' : ""}>
  `;
}

function numberInput(label, id, value, min = 1, max = 10000) {
  return `<label>${label}</label><input id="${id}" type="number" min="${min}" max="${max}" value="${value}">`;
}

function buttonHTML(text = "Process file") {
  return `<button class="primary-button" id="runTool">${text}</button>`;
}

function workspace(html) {
  document.getElementById("toolWorkspace").innerHTML = html;
  result.innerHTML = "";
}

function openTool(id) {
  const tool = tools.find(item => item.id === id);
  if (!tool) return;

  showPage("toolPage");
  document.getElementById("toolIcon").textContent = tool.icon;
  document.getElementById("toolTitle").textContent = tool.name;
  document.getElementById("toolDescription").textContent = tool.desc;

  const workspaces = {
    pdfviewer: () => {
      workspace(fileInput("Choose PDF", "application/pdf") + buttonHTML("Open PDF"));
      run(() => {
        const file = getFile();
        if (!file || file.type !== "application/pdf") throw Error("Please select a PDF file.");
        if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);
        activeObjectUrl = URL.createObjectURL(file);
        result.innerHTML = `<iframe title="PDF viewer" src="${activeObjectUrl}" style="width:100%;height:65vh;border:0"></iframe>`;
      });
    },

    pdfcompress: () => {
      workspace(fileInput("Choose PDF", "application/pdf") +
        '<p class="hint">This re-saves the PDF. It may not reduce every PDF's file size.</p>' +
        buttonHTML("Optimize PDF"));
      run(async () => {
        const file = getFile();
        if (!file) throw Error("Choose a PDF first.");
        const bytes = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes);
        const output = await pdf.save({ useObjectStreams: true });
        setDownload(new Blob([output], {type:"application/pdf"}), "compressed.pdf",
          `PDF re-saved. Original: ${formatBytes(file.size)}. New: ${formatBytes(output.length)}.`);
      });
    },

    imagetopdf: () => {
      workspace(fileInput("Choose images", "image/*", true) + buttonHTML("Convert to PDF"));
      run(async () => {
        const files = getFiles();
        if (!files.length) throw Error("Choose at least one image.");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        for (let i = 0; i < files.length; i++) {
          const data = await imageData(files[i]);
          const img = await loadImage(data);
          const pageW = pdf.internal.pageSize.getWidth();
          const pageH = pdf.internal.pageSize.getHeight();
          const ratio = Math.min(pageW / img.width, pageH / img.height);
          const w = img.width * ratio, h = img.height * ratio;
          if (i) pdf.addPage();
          pdf.addImage(data, "JPEG", (pageW-w)/2, (pageH-h)/2, w, h);
        }
        setDownload(pdf.output("blob"), "images.pdf");
      });
    },

    pdftoimage: () => {
      workspace(fileInput("Choose PDF", "application/pdf") +
        numberInput("Page number", "pageNumber", 1) + buttonHTML("Convert page"));
      run(async () => {
        const file = getFile();
        if (!file) throw Error("Choose a PDF.");
        const pageNo = Number(document.getElementById("pageNumber").value);
        const pdf = await pdfjsLib.getDocument({data: await file.arrayBuffer()}).promise;
        if (pageNo < 1 || pageNo > pdf.numPages) throw Error(`Enter a page from 1 to ${pdf.numPages}.`);
        const page = await pdf.getPage(pageNo);
        const viewport = page.getViewport({scale:2});
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({canvasContext:canvas.getContext("2d"), viewport}).promise;
        canvas.toBlob(blob => setDownload(blob, `page-${pageNo}.png`), "image/png");
      });
    },

    mergepdf: () => {
      workspace(fileInput("Choose two or more PDFs", "application/pdf", true) + buttonHTML("Merge PDFs"));
      run(async () => {
        const files = getFiles();
        if (files.length < 2) throw Error("Choose at least two PDF files.");
        const merged = await PDFLib.PDFDocument.create();
        for (const file of files) {
          const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
          const pages = await merged.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(page => merged.addPage(page));
        }
        setDownload(new Blob([await merged.save()], {type:"application/pdf"}), "merged.pdf");
      });
    },

    splitpdf: () => {
      workspace(fileInput("Choose PDF", "application/pdf") +
        '<p class="hint">Enter a page range, for example 1-3 or 2,4,6.</p>' +
        '<label>Pages to extract</label><input id="pageRange" placeholder="1-3">' +
        buttonHTML("Extract pages"));
      run(async () => {
        const file = getFile();
        if (!file) throw Error("Choose a PDF.");
        const source = await PDFLib.PDFDocument.load(await file.arrayBuffer());
        const range = document.getElementById("pageRange").value.trim();
        const indexes = parsePageRange(range, source.getPageCount());
        const output = await PDFLib.PDFDocument.create();
        const pages = await output.copyPages(source, indexes);
        pages.forEach(page => output.addPage(page));
        setDownload(new Blob([await output.save()], {type:"application/pdf"}), "extracted-pages.pdf");
      });
    },

    texttopdf: () => {
      workspace('<label>Enter text</label><textarea id="pdfText" rows="9" placeholder="Write your text here..."></textarea>' +
        buttonHTML("Create PDF"));
      run(() => {
        const text = document.getElementById("pdfText").value;
        if (!text.trim()) throw Error("Enter some text.");
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        const lines = pdf.splitTextToSize(text, 180);
        let y = 15;
        lines.forEach(line => {
          if (y > 280) { pdf.addPage(); y = 15; }
          pdf.text(line, 15, y);
          y += 7;
        });
        setDownload(pdf.output("blob"), "text-document.pdf");
      });
    },

    imagecompress: () => imageWorkspace("Compress image", true),
    imageresize: () => imageWorkspace("Resize image", false),
    imageconvert: () => imageWorkspace("Convert image", false),
    imagecrop: () => cropWorkspace(),
    passport: () => resizeWorkspace("Passport photo", 413, 531),
    signature: () => resizeWorkspace("Signature", 300, 100),
    examimage: () => resizeWorkspace("Exam photo helper", 300, 400),
    admit: () => {
      workspace(fileInput("Choose admit card image", "image/*") +
        buttonHTML("Create printable PDF"));
      run(async () => {
        const file = getFile();
        if (!file) throw Error("Choose an image.");
        const data = await imageData(file);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(data, "JPEG", 10, 10, 190, 277, undefined, "FAST");
        setDownload(pdf.output("blob"), "admit-card-print.pdf");
      });
    },

    attendance: () => {
      workspace(numberInput("Classes attended", "attended", 75, 0, 100000) +
        numberInput("Total classes", "total", 100, 1, 100000) +
        numberInput("Required attendance (%)", "required", 75, 1, 100) +
        buttonHTML("Calculate"));
      run(() => {
        const a = Number(val("attended")), t = Number(val("total")), r = Number(val("required"));
        if (!Number.isFinite(a) || !Number.isFinite(t) || a > t || t <= 0) throw Error("Enter valid class counts.");
        const pct = a / t * 100;
        const needed = Math.max(0, Math.ceil((r*t-a)/(1-r/100)));
        setResult(`Your attendance is ${pct.toFixed(2)}%. ${pct >= r ? "You meet the required attendance." : `Attend approximately ${needed} more consecutive classes to reach ${r}%.`}`);
      });
    },

    sgpa: () => gradeCalculator(false),
    cgpa: () => gradeCalculator(true),

    percentage: () => {
      workspace(numberInput("Marks obtained", "obtained", 450, 0, 1000000) +
        numberInput("Total marks", "maximum", 500, 1, 1000000) +
        buttonHTML("Calculate percentage"));
      run(() => {
        const a = Number(val("obtained")), b = Number(val("maximum"));
        if (b <= 0 || a > b || a < 0) throw Error("Enter valid marks.");
        setResult(`Percentage: ${(a/b*100).toFixed(2)}%`);
      });
    },

    qr: () => {
      workspace('<label>Text or website URL</label><textarea id="qrText" rows="4" placeholder="https://example.com"></textarea>' +
        buttonHTML("Generate QR Code"));
      run(async () => {
        const text = document.getElementById("qrText").value.trim();
        if (!text) throw Error("Enter text or a URL.");
        result.innerHTML = "";
        const canvas = document.createElement("canvas");
        result.appendChild(canvas);
        await QRCode.toCanvas(canvas, text, {width:250, margin:2});
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "edugm-qr-code.png";
        link.textContent = "Download QR Code";
        result.appendChild(link);
      });
    },

    scanner: () => {
      workspace(fileInput("Take or select a document photo", "image/*", false, true) +
        buttonHTML("Save scanned image"));
      run(async () => {
        const file = getFile();
        if (!file) throw Error("Take a photo or choose an image.");
        const data = await imageData(file);
        const blob = await (await fetch(data)).blob();
        setDownload(blob, "document-scan.jpg");
      });
    },

    word: () => unsupported("Word to PDF conversion needs a document-conversion engine. It is not included in this offline-first version."),
    excel: () => unsupported("Excel to PDF conversion needs a spreadsheet conversion engine. It is not included in this offline-first version."),
    ppt: () => unsupported("PowerPoint to PDF conversion needs a presentation conversion engine. It is not included in this offline-first version.")
  };

  (workspaces[id] || (() => unsupported("This tool is not available yet.")))();
}

function run(callback) {
  document.getElementById("runTool").addEventListener("click", async () => {
    const button = document.getElementById("runTool");
    button.disabled = true;
    button.textContent = "Processing...";
    try {
      await callback();
    } catch (error) {
      setResult(error.message || "Something went wrong.", true);
    } finally {
      button.disabled = false;
      button.textContent = "Process again";
    }
  });
}

function getFile() {
  return document.getElementById("toolFiles")?.files?.[0];
}
function getFiles() {
  return Array.from(document.getElementById("toolFiles")?.files || []);
}
function val(id) { return document.getElementById(id).value; }
function formatBytes(bytes) {
  return bytes < 1024 ? `${bytes} B` : `${(bytes/1024/1024).toFixed(2)} MB`;
}

function parsePageRange(text, pageCount) {
  if (!text) throw Error("Enter the pages to extract.");
  const selected = new Set();
  text.split(",").forEach(part => {
    const p = part.trim();
    if (/^\d+-\d+$/.test(p)) {
      const [start, end] = p.split("-").map(Number);
      if (start < 1 || end > pageCount || start > end) throw Error("Invalid page range.");
      for (let n = start; n <= end; n++) selected.add(n-1);
    } else if (/^\d+$/.test(p)) {
      const n = Number(p);
      if (n < 1 || n > pageCount) throw Error("Page number is outside the PDF.");
      selected.add(n-1);
    } else throw Error("Use a range such as 1-3 or 1,3,5.");
  });
  return [...selected].sort((a,b) => a-b);
}

function imageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(Error("Could not load image."));
    img.src = src;
  });
}

async function imageWorkspace(title, compression) {
  workspace(fileInput("Choose image", "image/*") +
    (compression
      ? '<label>Image quality (10–100%)</label><input id="quality" type="number" min="10" max="100" value="70">'
      : numberInput("Width (pixels)", "imgWidth", 800, 1, 10000) +
        numberInput("Height (pixels)", "imgHeight", 800, 1, 10000)) +
    '<label>Output format</label><select id="imgFormat"><option value="image/jpeg">JPG</option><option value="image/png">PNG</option><option value="image/webp">WebP</option></select>' +
    buttonHTML(title));
  run(async () => {
    const file = getFile();
    if (!file) throw Error("Choose an image.");
    const img = await loadImage(await imageData(file));
    const canvas = document.createElement("canvas");
    canvas.width = compression ? img.width : Number(val("imgWidth"));
    canvas.height = compression ? img.height : Number(val("imgHeight"));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const format = val("imgFormat");
    const quality = compression ? Number(val("quality"))/100 : .92;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, format, quality));
    if (!blob) throw Error("Could not convert this image.");
    const ext = format.split("/")[1].replace("jpeg", "jpg");
    setDownload(blob, `edugm-image.${ext}`,
      `Finished. Original: ${formatBytes(file.size)}. Output: ${formatBytes(blob.size)}.`);
  });
}

function cropWorkspace() {
  workspace(fileInput("Choose image", "image/*") +
    numberInput("X position", "cropX", 0, 0, 100000) +
    numberInput("Y position", "cropY", 0, 0, 100000) +
    numberInput("Crop width", "cropW", 300, 1, 100000) +
    numberInput("Crop height", "cropH", 300, 1, 100000) +
    buttonHTML("Crop image") +
    '<p class="hint">Enter crop coordinates in pixels. The image starts at its top-left corner (0,0).</p>');
  run(async () => {
    const file = getFile();
    if (!file) throw Error("Choose an image.");
    const img = await loadImage(await imageData(file));
    const x = Number(val("cropX")), y = Number(val("cropY"));
    const w = Number(val("cropW")), h = Number(val("cropH"));
    if (x+w > img.width || y+h > img.height) throw Error(`Image size is ${img.width} × ${img.height}. Your crop exceeds it.`);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(img, x, y, w, h, 0, 0, w, h);
    canvas.toBlob(blob => setDownload(blob, "cropped-image.png"), "image/png");
  });
}

function resizeWorkspace(title, width, height) {
  workspace(fileInput("Choose photo or signature", "image/*") +
    numberInput("Width (pixels)", "imgWidth", width, 1, 5000) +
    numberInput("Height (pixels)", "imgHeight", height, 1, 5000) +
    '<label>Background</label><select id="bg"><option value="white">White</option><option value="transparent">Transparent (PNG)</option></select>' +
    buttonHTML(`Create ${title}`));
  run(async () => {
    const file = getFile();
    if (!file) throw Error("Choose an image.");
    const img = await loadImage(await imageData(file));
    const w = Number(val("imgWidth")), h = Number(val("imgHeight"));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (val("bg") === "white") { ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h); }
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob(blob => setDownload(blob, "resized-photo.png"), "image/png");
  });
}

function gradeCalculator(cgpaMode) {
  if (cgpaMode) {
    workspace('<p class="hint">Enter the SGPA for each semester. This simple calculator uses the average of the semester GPAs. If your university requires credit-weighted CGPA, use the SGPA/credit method in your official rules.</p>' +
      numberInput("Number of semesters", "semCount", 2, 1, 20) +
      '<div id="semesterInputs"></div>' + buttonHTML("Calculate CGPA"));
    const count = document.getElementById("semCount");
    const draw = () => {
      const n = Math.max(1, Math.min(20, Number(count.value) || 1));
      document.getElementById("semesterInputs").innerHTML =
        Array.from({length:n}, (_,i) => numberInput(`Semester ${i+1} SGPA`, `sem${i}`, 8, 0, 10)).join("");
    };
    count.addEventListener("input", draw);
    draw();
    run(() => {
      const n = Number(val("semCount"));
      const values = Array.from({length:n}, (_,i) => Number(val(`sem${i}`)));
      if (values.some(v => !Number.isFinite(v) || v < 0 || v > 10)) throw Error("Enter valid SGPA values between 0 and 10.");
      setResult(`Estimated CGPA: ${(values.reduce((a,b)=>a+b,0)/n).toFixed(2)}`);
    });
  } else {
    workspace('<p class="hint">Enter each subject's credit and grade point. The calculator uses the credit-weighted SGPA formula.</p>' +
      numberInput("Number of subjects", "subjectCount", 5, 1, 30) +
      '<div id="subjectInputs"></div>' + buttonHTML("Calculate SGPA"));
    const count = document.getElementById("subjectCount");
    const draw = () => {
      const n = Math.max(1, Math.min(30, Number(count.value) || 1));
      document.getElementById("subjectInputs").innerHTML = Array.from({length:n}, (_,i) =>
        `<label>Subject ${i+1} credit</label><input type="number" id="credit${i}" min="0.1" max="100" step="0.1" value="4">
         <label>Subject ${i+1} grade point</label><input type="number" id="grade${i}" min="0" max="10" step="0.1" value="8">`
      ).join("");
    };
    count.addEventListener("input", draw);
    draw();
    run(() => {
      const n = Number(val("subjectCount"));
      let totalCredits = 0, totalPoints = 0;
      for (let i=0; i<n; i++) {
        const c = Number(val(`credit${i}`)), g = Number(val(`grade${i}`));
        if (c <= 0 || g < 0 || g > 10) throw Error("Enter valid credits and grade points.");
        totalCredits += c;
        totalPoints += c*g;
      }
      setResult(`Your SGPA is ${(totalPoints/totalCredits).toFixed(2)}.`);
    });
  }
}

function unsupported(message) {
  workspace(`<p>${escapeHTML(message)}</p><p class="hint">These conversion features are listed for the roadmap but are not functional in this release.</p>`);
}

document.getElementById("searchInput").addEventListener("input", renderTools);

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentCategory = button.dataset.category;
    document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    renderTools();
  });
});

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
    if (button.dataset.categoryLink) {
      currentCategory = button.dataset.categoryLink;
      document.querySelectorAll(".filter").forEach(item =>
        item.classList.toggle("active", item.dataset.category === currentCategory));
      renderTools();
    }
  });
});

document.getElementById("themeButton").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("edugm-dark", document.body.classList.contains("dark") ? "yes" : "no");
});

if (localStorage.getItem("edugm-dark") === "yes") document.body.classList.add("dark");

document.getElementById("contactForm").addEventListener("submit", async event => {
  event.preventDefault();

  const form = event.currentTarget;
  const button = document.getElementById("sendMessageButton");
  const status = document.getElementById("contactStatus");
  const data = new FormData(form);

  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const subject = String(data.get("subject") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !subject || message.length < 5) {
    status.textContent = "Please complete all fields.";
    status.className = "status-error";
    return;
  }

  button.disabled = true;
  button.textContent = "Sending...";
  status.textContent = "";

  try {
    await addDoc(collection(db, "contactMessages"), {
      name: name,
      email: email,
      subject: subject,
      message: message,
      app: "EduGM UniTools",
      createdAt: serverTimestamp()
    });

    status.textContent = "Your message has been sent successfully. Thank you!";
    status.className = "status-success";
    form.reset();
  } catch (error) {
    console.error("Firebase contact submission error:", error);
    status.textContent = "Message could not be sent. Please check your internet connection and try again.";
    status.className = "status-error";
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
});

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

renderTools();
showPage("homePage");
