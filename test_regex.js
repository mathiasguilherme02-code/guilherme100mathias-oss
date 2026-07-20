const regex = /^data:([A-Za-z-+\/]+);base64,(.+)$/;
const str1 = 'data:image/jpeg;base64,12345';
const str2 = 'data:image/png;base64,12345';
const str3 = 'data:image/webp;base64,12345';
console.log("str1", str1.match(regex));
console.log("str2", str2.match(regex));
console.log("str3", str3.match(regex));
