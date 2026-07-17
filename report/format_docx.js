const fs = require('fs');
const path = require('path');

const stylesPath = path.join(__dirname, 'temp_docx', 'word', 'styles.xml');

if (!fs.existsSync(stylesPath)) {
    console.error('Không tìm thấy tệp styles.xml!');
    process.exit(1);
}

let stylesXml = fs.readFileSync(stylesPath, 'utf8');

// 1. Cập nhật Font mặc định thành Times New Roman cho tất cả các thẻ font
stylesXml = stylesXml.replace(
    /<w:rFonts\s+[^>]*\/>/g,
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman" />'
);

// 2. Cập nhật cỡ chữ mặc định trong docDefaults thành 14pt (val = 28)
const docDefaultsRegex = /<w:docDefaults>([\s\S]*?)<\/w:docDefaults>/;
let docDefaultsMatch = stylesXml.match(docDefaultsRegex);

if (docDefaultsMatch) {
    let docDefaults = docDefaultsMatch[0];
    docDefaults = docDefaults.replace(/<w:sz\s+w:val="[^"]*"\s*\/>/g, '<w:sz w:val="28" />');
    docDefaults = docDefaults.replace(/<w:szCs\s+w:val="[^"]*"\s*\/>/g, '<w:szCs w:val="28" />');

    // 3. Thêm căn lề Justified mặc định (val = both) trong pPrDefault
    if (!docDefaults.includes('<w:jc w:val="both"')) {
        docDefaults = docDefaults.replace(
            /<w:pPrDefault>\s*<w:pPr>/,
            '<w:pPrDefault>\n      <w:pPr>\n        <w:jc w:val="both" />'
        );
    }
    stylesXml = stylesXml.replace(docDefaultsRegex, docDefaults);
}

// 4. Thay thế tất cả các thuộc tính font theme khác thành Times New Roman để đảm bảo đồng bộ
stylesXml = stylesXml.replace(/w:asciiTheme="[^"]*"/g, 'w:ascii="Times New Roman"');
stylesXml = stylesXml.replace(/w:hAnsiTheme="[^"]*"/g, 'w:hAnsi="Times New Roman"');
stylesXml = stylesXml.replace(/w:eastAsiaTheme="[^"]*"/g, 'w:eastAsia="Times New Roman"');
stylesXml = stylesXml.replace(/w:cstheme="[^"]*"/g, 'w:cs="Times New Roman"');

// 5. Đảm bảo các Headings được Bold (Heading 1 đến Heading 6)
// Lấy các khối w:style có heading và đảm bảo có thẻ w:b và w:bCs trong w:rPr
const styleBlockRegex = /(<w:style\s+[^>]*w:styleId="Heading\d"[^>]*>[\s\S]*?<w:rPr>)([\s\S]*?)(<\/w:rPr>)/g;
stylesXml = stylesXml.replace(styleBlockRegex, (match, prefix, rPrContent, suffix) => {
    let newRPrContent = rPrContent;
    if (!newRPrContent.includes('<w:b />') && !newRPrContent.includes('<w:b/>') && !newRPrContent.includes('<w:b ')) {
        newRPrContent = '\n      <w:b />\n      <w:bCs />' + newRPrContent;
    }
    return prefix + newRPrContent + suffix;
});

// Ghi lại tệp styles.xml
fs.writeFileSync(stylesPath, stylesXml, 'utf8');
console.log('Đã định dạng styles.xml thành công (Times New Roman, size 14, Justified, Bold Headings)!');
