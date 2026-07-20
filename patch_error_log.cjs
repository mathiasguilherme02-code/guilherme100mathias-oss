const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const catchOrig = `      } catch (e) {
        console.error("Error uploading produto image", e);
      }`;
const catchNew = `      } catch (e) {
        console.error("Error uploading produto image:", e);
        console.error("Data length:", produto.imagemUrl.length, "Starts with:", produto.imagemUrl.substring(0, 50));
      }`;
code = code.replace(catchOrig, catchNew);
code = code.replace(catchOrig, catchNew);
fs.writeFileSync('server.ts', code);
