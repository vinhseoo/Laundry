const fs = require('fs');
const path = require('path');

const files = [
    'C1_Tong_Quan.md',
    'C2_1_Yeu_Cau_He_Thong.md',
    'C2_2_Kich_Ban_Use_Case.md',
    'C2_3_Bieu_Do_Tuan_Tu.md',
    'C2_4_Thiet_Ke_Lop_ERD.md',
    'C3_1_Kien_Truc_Cong_Nghe.md',
    'C3_2_Chi_Tiet_Chuc_Nang.md',
    'C3_3_Kiem_Thu_Danh_Gia.md',
    'C3_4_Ket_Luan_Huong_Di.md'
];

const reportDir = __dirname;
const outputMdPath = path.join(reportDir, 'Bao_Cao_BubbleFlow_Tong_Hop.md');
const outputHtmlPath = path.join(reportDir, 'Bao_Cao_BubbleFlow_Tong_Hop.html');

console.log('Bắt đầu tổng hợp báo cáo...');

let combinedMarkdown = `# BÁO CÁO ĐỀ TÀI\nHỆ THỐNG QUẢN LÝ CHUỖI CỬA HÀNG GIẶT LÀ / GIẶT SẤY TỰ ĐỘNG (BUBBLEFLOW)\n\n---\n\n`;

for (const file of files) {
    const filePath = path.join(reportDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`Đang đọc tệp: ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        // Thêm dấu ngắt trang hoặc khoảng cách giữa các phần
        combinedMarkdown += content + '\n\n<div style="page-break-after: always;"></div>\n\n';
    } else {
        console.warn(`Cảnh báo: Không tìm thấy tệp ${file}`);
    }
}

// Lưu file Markdown tổng hợp
fs.writeFileSync(outputMdPath, combinedMarkdown, 'utf8');
console.log(`Đã tạo tệp Markdown tổng hợp tại: ${outputMdPath}`);

// Tạo file HTML động hiển thị Markdown + Mermaid tự động qua CDN
const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Báo cáo Đề tài BubbleFlow</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Marked.js (Markdown Parser) -->
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <!-- Mermaid.js (Diagrams) -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #f8fafc;
        }
        .container {
            background-color: #ffffff;
            padding: 50px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        h1, h2, h3, h4 {
            color: #0f172a;
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
        }
        h1 {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            font-size: 2.2em;
        }
        h2 {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            font-size: 1.7em;
            margin-top: 1.8em;
        }
        h3 {
            font-size: 1.3em;
        }
        p {
            margin-bottom: 1.2em;
            text-align: justify;
        }
        code {
            font-family: Consolas, Monaco, 'Andale Mono', monospace;
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #0f172a;
        }
        pre {
            background-color: #0f172a;
            color: #f8fafc;
            padding: 18px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1.5em 0;
        }
        pre code {
            background-color: transparent;
            color: inherit;
            padding: 0;
            font-size: 0.9em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5em 0;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 600;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        blockquote {
            border-left: 4px solid #0891b2;
            padding-left: 16px;
            margin: 1.5em 0;
            color: #475569;
            font-style: italic;
        }
        .page-break {
            page-break-after: always;
            border-top: 2px dashed #cbd5e1;
            margin: 40px 0;
        }
        .mermaid {
            background: white;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin: 1.5em 0;
            display: flex;
            justify-content: center;
        }
        @media print {
            body {
                background-color: #fff;
                padding: 0;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
            .page-break {
                border-top: none;
            }
        }
    </style>
</head>
<body>
    <div class="container" id="content">
        Đang tải và biên dịch tài liệu báo cáo...
    </div>

    <!-- Lưu dữ liệu markdown thô tại đây -->
    <script type="text/markdown" id="markdown-raw">${combinedMarkdown.replace(/<\/script>/g, '<\\/script>')}</script>

    <script>
        // Cấu hình mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose'
        });

        // Đọc markdown thô
        const rawMarkdown = document.getElementById('markdown-raw').textContent;

        // Custom renderer để xử lý khối mermaid trong quá trình parse markdown
        const renderer = new marked.Renderer();
        const originalCodeRenderer = renderer.code;
        
        renderer.code = function(code, infostring, escaped) {
            // Nếu là code block mermaid
            if (infostring === 'mermaid') {
                return '<div class="mermaid">' + code + '</div>';
            }
            return originalCodeRenderer.call(this, code, infostring, escaped);
        };

        marked.setOptions({
            renderer: renderer,
            gfm: true,
            breaks: true
        });

        // Parse markdown sang HTML
        const html = marked.parse(rawMarkdown);
        document.getElementById('content').innerHTML = html;

        // Render Mermaid
        mermaid.run();
    </script>
</body>
</html>
`;

fs.writeFileSync(outputHtmlPath, htmlContent, 'utf8');
console.log(`Đã tạo tệp HTML động trực quan tại: ${outputHtmlPath}`);
console.log('Hoàn thành tổng hợp báo cáo thành công!');
