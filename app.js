const seletorPerfil = document.getElementById('select-perfil');
const inputCustomizado = document.getElementById('input-customizado');
const statusProduto = document.getElementById('product-status');
const cardPrincipal = document.getElementById('main-product');

seletorPerfil.addEventListener('change', executarFiltroAutomatico);
inputCustomizado.addEventListener('input', executarFiltroAutomatico);
window.addEventListener('DOMContentLoaded', executarFiltroAutomatico);

function executarFiltroAutomatico() {
    const perfilAtual = seletorPerfil.value;
    statusProduto.innerHTML = `Analisando alimentos recomendados para: <strong>${perfilAtual}</strong>...`;
    
    cardPrincipal.style.borderLeftColor = "#3b82f6"; 
    cardPrincipal.style.backgroundColor = "#ffffff";

    let termoPesquisa = "Arroz"; 

    if (perfilAtual === "Perfil Diabético") {
        termoPesquisa = "Integral";
    } else if (perfilAtual === "Mãe de Criança Autista (TEA)") {
        termoPesquisa = "Suco Natural";
    } else if (perfilAtual === "Intolerância à Lactose") {
        termoPesquisa = "Zero Lactose";
    }

    carregarOsTresCardsSeguros(termoPesquisa, perfilAtual);
}

async function carregarOsTresCardsSeguros(termoChave, perfil) {
    try {
        const url = `https://br.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(termoChave)}&search_simple=1&action=process&json=1&page_size=8`;
        
        const resposta = await fetch(url, {
            headers: { 'User-Agent': 'InclusivFoodApp/1.0' }
        });
        const dados = await resposta.json();

        if (!dados.products || dados.products.length === 0) {
            statusProduto.innerText = "Erro ao conectar com a base da API.";
            return;
        }

        let palavrasProibidas = [];
        const textoDigitado = inputCustomizado.value.trim().toLowerCase();

        if (textoDigitado !== '') {
            const itensCortados = textoDigitado.split(',');
            itensCortados.forEach(item => {
                const itemLimpo = item.trim();
                if (itemLimpo !== '') palavrasProibidas.push(itemLimpo);
            });
        }

        const produtosFiltrados = dados.products.filter(produto => {
            const ingredientes = produto.ingredients_text ? produto.ingredients_text.toLowerCase() : "";
            const nomeProd = produto.product_name ? produto.product_name.toLowerCase() : "";
            const tudoDoItem = `${ingredientes} ${nomeProd}`;
            
            return !palavrasProibidas.some(palavra => tudoDoItem.includes(palavra));
        });

        if (palavrasProibidas.length > 0) {
            statusProduto.innerHTML = `🎉 Filtro ativo para <strong>${perfil}</strong>. Removendo itens com: ${palavrasProibidas.join(', ')}`;
            cardPrincipal.style.borderLeftColor = "#10b981"; 
            cardPrincipal.style.backgroundColor = "#ecfdf5";
        } else {
            statusProduto.innerHTML = `💡 Exibindo sugestões recomendadas para o perfil: <strong>${perfil}</strong>.`;
        }

        for (let i = 1; i <= 3; i++) {
            const indexProduto = i - 1;
            if (produtosFiltrados[indexProduto]) {
                document.getElementById(`card-title-${i}`).innerText = produtosFiltrados[indexProduto].product_name;
                document.getElementById(`card-brand-${i}`).innerText = produtosFiltrados[indexProduto].brands || "Recomendado";
                document.getElementById(`card-img-${i}`).src = produtosFiltrados[indexProduto].image_front_url || "https://images.openfoodfacts.org/images/misc/openfoodfacts-logo-en.svg";
            } else {
                const nomeMock = i === 1 ? "Biscoito de Polvilho" : (i === 2 ? "Tapioca Hidratada" : "Frutas Picadas");
                document.getElementById(`card-title-${i}`).innerText = nomeMock;
                document.getElementById(`card-brand-${i}`).innerText = "Alimento Natural";
                document.getElementById(`card-img-${i}`).src = "https://via.placeholder.com/150?text=Seguro";
            }
        }

    } catch (erro) {
        console.error(erro);
        statusProduto.innerText = "Erro ao carregar dados da API.";
    }
}