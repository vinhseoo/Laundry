const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const htmlToDocx = require('html-to-docx');

async function compileReport() {
    console.log('[Compiler] Starting compilation of BubbleFlow Graduation Thesis Report...');
    
    // Order of files to read
    const files = [
        'BIA_MUC_LUC.md',
        'CHUONG_1.md',
        'CHUONG_2.md',
        'CHUONG_3.md',
        'KET_LUAN_THAM_KHAO.md'
    ];
    
    let combinedHtml = '';
    
    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            console.error(`[Compiler] Error: File not found: ${filePath}`);
            process.exit(1);
        }
        
        console.log(`[Compiler] Processing file: ${file}`);
        const mdContent = fs.readFileSync(filePath, 'utf8');
        
        // Convert Markdown to HTML
        let htmlContent = marked.parse(mdContent);
        
        // Wrap each file in a division and add page break at the end (except the last one)
        const isLastFile = file === files[files.length - 1];
        combinedHtml += `
<div class="chapter-container">
    ${htmlContent}
</div>
        `;
        
        if (!isLastFile) {
            combinedHtml += '<div style="page-break-after: always;"></div>';
        }
    }
    
    // Convert relative image references to Base64 inline data URIs
    console.log('[Compiler] Scanning for local image files to embed as Base64...');
    combinedHtml = combinedHtml.replace(/<img\s+([^>]*?)src="([^"]+)"/g, (match, prefix, src) => {
        if (src.startsWith('./') || (!src.startsWith('http') && !src.startsWith('data:'))) {
            const imageName = src.replace(/^\.\//, '');
            const imagePath = path.join(__dirname, imageName);
            if (fs.existsSync(imagePath)) {
                console.log(`[Compiler] Embedding image: ${imageName} as Base64`);
                const imageBuffer = fs.readFileSync(imagePath);
                const base64Image = imageBuffer.toString('base64');
                return `<img ${prefix}src="data:image/png;base64,${base64Image}"`;
            } else {
                console.warn(`[Compiler] Warning: Image file not found: ${imagePath}`);
            }
        }
        return match;
    });
    
    // Full HTML Template with Embedded Styles matching PTIT standards
    const fullHtmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 13pt;
            line-height: 1.3;
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Times New Roman', serif;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }
        /* Heading 1 - Chapter Title (Bold, Center, Uppercase) */
        h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-top: 24pt;
            margin-bottom: 12pt;
            page-break-inside: avoid;
        }
        /* Heading 2 - Section Level 1 (Bold, Left, 14pt) */
        h2 {
            font-size: 14pt;
            font-weight: bold;
            text-align: left;
            margin-top: 18pt;
            margin-bottom: 8pt;
            page-break-inside: avoid;
        }
        /* Heading 3 - Section Level 2 (Bold, Left, 13pt) */
        h3 {
            font-size: 13pt;
            font-weight: bold;
            text-align: left;
            margin-top: 12pt;
            margin-bottom: 6pt;
            page-break-inside: avoid;
        }
        p {
            font-size: 13pt;
            text-align: justify;
            margin-top: 0;
            margin-bottom: 3pt;
            text-indent: 1cm;
        }
        /* Exception for cover page centered text or lists */
        .chapter-container p:has(img), 
        .chapter-container p:has(pre) {
            text-indent: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10pt;
            margin-bottom: 10pt;
            font-size: 12pt;
        }
        th, td {
            border: 1px solid #000000;
            padding: 6px 10px;
            text-align: left;
            vertical-align: middle;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }
        ul, ol {
            margin-top: 0;
            margin-bottom: 6pt;
            padding-left: 20pt;
        }
        li {
            font-size: 13pt;
            margin-bottom: 3pt;
            text-align: justify;
        }
        pre {
            background-color: #f7f7f7;
            border: 1px solid #cccccc;
            padding: 8px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 10pt;
            white-space: pre-wrap;
            margin-top: 6pt;
            margin-bottom: 6pt;
        }
        code {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 10pt;
            background-color: #f7f7f7;
            padding: 1px 4px;
            border-radius: 3px;
        }
        em {
            font-style: italic;
        }
        strong {
            font-weight: bold;
        }
    </style>
</head>
<body>
    ${combinedHtml}
</body>
</html>
    `;
    
    // Config documentOptions for html-to-docx
    // 1 inch = 1440 TWIPs
    // 1 cm = 567 TWIPs
    // Top: 2.0 cm = 1134 TWIPs
    // Bottom: 2.0 cm = 1134 TWIPs
    // Left: 3.0 cm = 1701 TWIPs
    // Right: 1.5 cm = 851 TWIPs
    const docOptions = {
        font: 'Times New Roman',
        fontSize: 26, // measured in half-points, so 26 = 13pt
        orientation: 'portrait',
        margins: {
            top: 1134,
            bottom: 1134,
            left: 1701,
            right: 851
        },
        header: true,
        footer: true,
        pageNumber: true
    };
    
    try {
        console.log('[Compiler] Converting HTML template to DOCX buffer...');
        const docxBuffer = await htmlToDocx(fullHtmlTemplate, null, docOptions, null);
        
        const outputPath = path.join(__dirname, 'BubbleFlow_DoAnTotNghiep.docx');
        console.log(`[Compiler] Writing output DOCX to: ${outputPath}`);
        try {
            fs.writeFileSync(outputPath, docxBuffer);
            console.log('[Compiler] SUCCESS! Graduation Thesis Report compiled successfully.');
        } catch (writeError) {
            if (writeError.code === 'EBUSY') {
                const fallbackPath = path.join(__dirname, 'BubbleFlow_DoAnTotNghiep_v2.docx');
                console.warn(`[Compiler] Warning: Primary file is locked. Writing output to fallback path: ${fallbackPath}`);
                fs.writeFileSync(fallbackPath, docxBuffer);
                console.log('[Compiler] SUCCESS! Graduation Thesis Report compiled successfully (v2).');
            } else {
                throw writeError;
            }
        }
    } catch (error) {
        console.error('[Compiler] Compilation failed:', error);
    }
}

compileReport();
