const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldLogin = `          <form className="mt-8 space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const phone = (e.currentTarget.elements.namedItem('telefone') as HTMLInputElement).value;
            if (!phone) {
              setClientLoginError("Por favor, insira seu telefone.");
              return;
            }
            // For now, mock successful login or show a toast
            toast.success("Login realizado com sucesso! Em breve, você terá acesso à área de produtos.");
            setView("produtos");
          }}>`;

const newLogin = `          <form className="mt-8 space-y-6" onSubmit={(e) => {
            e.preventDefault();
            const phone = (e.currentTarget.elements.namedItem('telefone') as HTMLInputElement).value;
            if (!phone) {
              setClientLoginError("Por favor, insira seu telefone.");
              return;
            }
            if (carrinho.length > 0) {
              toast.success(\`Pedido finalizado com sucesso! Forma de Pagamento: \${formaPagamentoProduto === 'dinheiro' ? 'Dinheiro' : formaPagamentoProduto === 'pix' ? 'Pix' : formaPagamentoProduto === 'debito' ? 'Cartão de Débito' : 'Cartão de Crédito'}. Entraremos em contato via WhatsApp.\`);
              setCarrinho([]);
              setFormaPagamentoProduto("");
            } else {
              toast.success("Login realizado com sucesso!");
            }
            setView("produtos_lista");
          }}>`;

const oldForm = `          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Cadastro realizado com sucesso! Em breve você terá acesso.");
              setView("produtos");
            }}
            className="p-8 space-y-6"
          >`;

const newForm = `          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (carrinho.length > 0) {
                toast.success(\`Cadastro e pedido realizados com sucesso! Forma de Pagamento: \${formaPagamentoProduto === 'dinheiro' ? 'Dinheiro' : formaPagamentoProduto === 'pix' ? 'Pix' : formaPagamentoProduto === 'debito' ? 'Cartão de Débito' : 'Cartão de Crédito'}. Entraremos em contato via WhatsApp.\`);
                setCarrinho([]);
                setFormaPagamentoProduto("");
              } else {
                toast.success("Cadastro realizado com sucesso! Em breve você terá acesso.");
              }
              setView("produtos_lista");
            }}
            className="p-8 space-y-6"
          >`;

code = code.replace(oldLogin, newLogin).replace(oldForm, newForm);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched form submits");
