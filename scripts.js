

document.addEventListener('DOMContentLoaded', () => {

    const cepInput = document.getElementById('cep');
    const enderecoInput = document.getElementById('endereco');
    const numeroInput = document.getElementById('numero');
    const complementoInput = document.getElementById('complemento');
    const bairroInput = document.getElementById('bairro');
    const municipioInput = document.getElementById('municipio');
    const estadoInput = document.getElementById('estado');
    const fileInput = document.getElementById('file-upload');
    const attachmentsSection = document.querySelector('#attachments-section .attachments');
    const initialAttachment = document.querySelector('#attachment-1');
    const emptyMessage = document.querySelector('#attachments-section h3');
    const addProductButton = document.getElementById('add-product');
    const productsSection = document.getElementById('products-section');
    const saveButton = document.getElementById('save');
    const successModal = document.getElementById('success-modal');
    const closeModal = document.getElementById('close-modal');
    let filesList = [];
    let productCount = 1;

    // funçao via cep
    cepInput.addEventListener('blur', async () => {
        const cep = cepInput.value.replace(/\D/g, '');
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (data.erro) {
                    alert('CEP não encontrado.');
                    return;
                }
                enderecoInput.value = data.logradouro || '';
                complementoInput.value = data.complemento || '';
                bairroInput.value = data.bairro || '';
                municipioInput.value = data.localidade || '';
                estadoInput.value = data.uf || '';
                numeroInput.focus();
            } catch (error) {
                console.error('Erro ao buscar o CEP:', error);
                alert('Erro ao buscar o CEP.');
            }
        } else {
            alert('CEP inválido. Deve conter 8 dígitos.');
        }
    });

    // Calcula valor produto
    function addProductCalculation(product) {
        const quantityInput = product.querySelector('.quantity');
        const unitValueInput = product.querySelector('.unit-value');
        const totalValueInput = product.querySelector('.total-value');

        const calculateTotal = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitValue = parseFloat(unitValueInput.value) || 0;
            const totalValue = quantity * unitValue;
            totalValueInput.value = totalValue.toFixed(2);
            totalValueInput.classList.toggle('filled', quantity > 0 && unitValue > 0);
        };

        quantityInput.addEventListener('input', calculateTotal);
        unitValueInput.addEventListener('input', calculateTotal);
    }

    // Calcula o produto 
    const initialProduct = document.getElementById('product-1');
    addProductCalculation(initialProduct);

    // Adiciona mais produtos
    addProductButton.addEventListener('click', () => {
        productCount++;

        const newProduct = document.createElement('div');
        newProduct.id = `product-${productCount}`;
        newProduct.classList.add('product');

        newProduct.innerHTML = `
            <h3>Novo Produto</h3>
            <div class="product-container">
                <div class="product-grid">
                    <img src="./assets/box-svgrepo-com.svg" alt="box-logo" class="input-image" />
                    <div class="product-inputs">
                        <input type="text" placeholder="Produto" required class="input-field product-name" />
                        <div class="additional-fields">
                            <select class="input-field" required>
                                <option value="" disabled selected>UND. Medida</option>
                                <option>M = Metro</option>
                                <option>CM = Centímetro</option>
                                <option>MM = Milímetro</option>
                                <option>DM = Decímetro</option>
                                <option>DAM = Decâmetro</option>
                            </select>
                            <input type="number" required placeholder="QTD. em Estoque" class="input-field quantity" />
                            <input type="number" required placeholder="Valor Unitário" class="input-field unit-value" />
                            <input required placeholder="Valor Total" class="input-field total-value" readonly />
                        </div>
                    </div>
                </div>
            </div>
            <button class="delete">
                <img src="./assets/trash-alt-svgrepo-com.svg" alt="Delete" />
            </button>
        `;

        // excluir produto ao clicar no botão
        newProduct.querySelector('.delete').addEventListener('click', () => {
            newProduct.remove();
        });

        // calcular os novos produtos
        addProductCalculation(newProduct);

        productsSection.appendChild(newProduct);
    });

    // visibilidade quando nao tem anexos
    const updateEmptyMessageVisibility = () => {
        emptyMessage.style.display = (attachmentsSection.children.length === 0 ||
            (attachmentsSection.children.length === 1 && initialAttachment.style.display === 'block')) ? 'block' : 'none';
    };

    // limpa o anexo inicial se nao há outros
    const restoreInitialAttachment = () => {
        if (attachmentsSection.children.length === 0) {
            initialAttachment.style.display = 'block';
            initialAttachment.querySelector('span').textContent = 'Documento anexo 1';
            fileInput.value = '';
            updateEmptyMessageVisibility();
        }
    };

    // adiciona ao formulário
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;

        if (files.length === 0) return;

        if (initialAttachment && attachmentsSection.children.length === 1) {
            initialAttachment.style.display = 'none';
        }

        Array.from(files).forEach((file) => {
            console.log(`Imagem adicionada: ${file.name}`);
            const attachmentItem = document.createElement('div');
            attachmentItem.classList.add('attachment-item');
            attachmentItem.innerHTML = `
                <img src="./assets/trash-alt-svgrepo-com.svg" class="trash" alt="trash-icon">
                <img src="./assets/eye-svgrepo-com.svg" class="eye" alt="eye-icon">
                <span>${file.name}</span>
            `;

            // excluir anexo
            attachmentItem.querySelector('.trash').addEventListener('click', () => {
                console.log(`Imagem excluída: ${file.name}`);
                attachmentItem.remove();
                filesList = filesList.filter(f => f !== file);
                if (attachmentsSection.children.length === 0) {
                    restoreInitialAttachment();
                }
                updateEmptyMessageVisibility();
            });

            // baixar a ao clicar no botão eye
            attachmentItem.querySelector('.eye').addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(file);
                link.download = file.name;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });

            attachmentsSection.appendChild(attachmentItem);
            filesList.push(file);
            updateEmptyMessageVisibility();
        });
    });

    // abre o seletor ao clicar no botao incluir anexo
    document.getElementById('add-attachment').addEventListener('click', () => {
        fileInput.click();
    });

    //  mensagem de vazio
    updateEmptyMessageVisibility();

    // mostrar modal se tudo for preenchido 
    saveButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const requiredFields = document.querySelectorAll('.input-field[required]');
        let allFieldsFilled = true;

        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('error-border');
                allFieldsFilled = false;
            } else {
                field.classList.remove('error-border');
            }
        });

        if (fileInput.files.length === 0) {
            emptyMessage.style.display = 'block';
            allFieldsFilled = false;
        } else {
            emptyMessage.style.display = 'none';
        }

        if (allFieldsFilled) {
            const fornecedorData = {
                razaoSocial: document.getElementById('razao-social').value,
                nomeFantasia: document.getElementById('nome-fantasia').value,
                cnpj: document.getElementById('cnpj').value,
                inscricaoEstadual: document.getElementById('inscricao-estadual').value,
                inscricaoMunicipal: document.getElementById('inscricao-municipal').value,
                nomeContato: document.getElementById('contato').value,
                telefoneContato: document.getElementById('telefone').value,
                emailContato: document.getElementById('email').value,
                produtos: [],
                anexos: []
            };

            // pegando os dados dos inputs
            document.querySelectorAll('.product').forEach((product, index) => {
                const descricaoProduto = product.querySelector('.product-name').value;
                const unidadeMedida = product.querySelector('select').value;
                const qtdeEstoque = product.querySelector('.quantity').value;
                const valorUnitario = product.querySelector('.unit-value').value;
                const valorTotal = product.querySelector('.total-value').value;

                fornecedorData.produtos.push({
                    indice: index + 1,
                    descricaoProduto,
                    unidadeMedida,
                    qtdeEstoque,
                    valorUnitario,
                    valorTotal
                });
            });

            // pegando dados do anexo
            const processFiles = async () => {
                const promises = filesList.map((file, index) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            fornecedorData.anexos.push({
                                indice: index + 1,
                                nomeArquivo: file.name,
                                blobArquivo: reader.result
                            });
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    });
                });

                await Promise.all(promises);
                successModal.style.display = 'block';
                console.log('Dados JSON:', JSON.stringify(fornecedorData, null, 2));
            };

            await processFiles();
            // mostrar alert se faltar algum campo obrigatorio para preencher
        } else {
            alert('Por favor, preencha todos os campos obrigatórios e faça o upload de pelo menos um arquivo.');
        }
    });

    // fechando modal ao clicar no X ou fora dele
    closeModal.addEventListener('click', () => {
        successModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
});
