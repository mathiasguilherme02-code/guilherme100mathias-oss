const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const t2 = `              {!selectedClient && !adminToken
                ? "Acesso restrito para clientes cadastrados."
                : "Preencha os dados abaixo para solicitar sua simulação."}`;
code = code.replace(t2, `"Preencha os dados abaixo para solicitar sua simulação."`);

const startStr = `            {!selectedClient && !adminToken ? (
              <div className="text-center py-8">`;
const endStr = `            ) : (
              <>
                <div className="bg-yellow-50 border border-yellow-200`;

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + `              <>
                <div className="bg-yellow-50 border border-yellow-200` + code.substring(endIndex + endStr.length);
}

const target3 = `                )}
              </>
            )}
          </div>
        </div>
        {renderModals()}
        {undoState && (`;
const repl3 = `                )}
              </>
          </div>
        </div>
        {renderModals()}
        {undoState && (`;
code = code.replace(target3, repl3);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully");
