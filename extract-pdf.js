const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('C:/Users/AA MEDIA/.gemini/antigravity/brain/09af1d77-5c81-4360-816c-f9d296d59df1/.user_uploaded/media_1787083666236.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('maths_pdf.txt', data.text);
    console.log('Successfully wrote', data.text.length, 'bytes');
}).catch(e => console.error(e));
