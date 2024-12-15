const axios = require('axios');
const { Op } = require('sequelize');
const { ReceitaIngrediente,Ingrediente, Receita } = require('../models');
const { traduzirTexto } = require('../services/translateService');

exports.buscarReceitas = async (req,res) => {
    const { ingredientes } = req.body; // Exemplo {"ingredientes": ["ovo","leite"]}

    try{
        console.log('Ingredientes recebidos no corpo da requisição:', ingredientes);

        //1. Buscar traduções no banco de dados
        const traducoes = await Ingrediente.findAll({
            where: {
                nome: { [Op.in]: ingredientes },
            },
            attributes: ['nome', 'nome_ingles'],
        });

        // Depuração: Log das traduções encontradas
        console.log('Traduções encontradas no banco:', traducoes);

        // Mapear as traduções existentes
        const traducoesMap = traducoes.reduce((map, t) => {
            map[t.nome] = t.nome_ingles;
            return map;
        }, {});

        // Identificar ingredientes que não estão traduzidos
        const naoTraduzidos = ingredientes.filter(
            (ing) => !traducoesMap.hasOwnProperty(ing)
        );

        console.log('Ingredientes que precisam ser traduzidos:', naoTraduzidos);

        // 2. Traduzir e salvar ingredientes não encontrados
        if (naoTraduzidos.length > 0) {
            for (const nome of naoTraduzidos) {
                const nomeIngles = await traduzirTexto(nome, 'pt', 'en');

                console.log(`Traduzindo e inserindo no banco: ${nome} -> ${nomeIngles}`);

                // Inserir no banco de dados
                const novoIngrediente = await Ingrediente.create({
                    nome,
                    nome_ingles: nomeIngles,
                });

                // Adicionar a tradução recém-criada ao mapa
                traducoesMap[nome] = novoIngrediente.nome_ingles;
            }
        }

        // 3. Preparar lista de nomes em inglês para a API
        const ingredientesIngles = ingredientes.map((ing) => traducoesMap[ing]);

        // Depuração: Log dos ingredientes traduzidos
        console.log('Ingredientes traduzidos (para envio à API):', ingredientesIngles);


        // 2. Preparar a requisição para a API Spoonacular

        const query = ingredientesIngles.join(','); // junta os ingredientes utilizando a vírgula como separador Ex: "egg,milk"
        const spoonacularKey = process.env.SPOONACULAR_API_KEY

        const response = await axios.get(
            `https://api.spoonacular.com/recipes/findByIngredients`,
            {
                params: {
                    ingredients: query,
                    apiKey: spoonacularKey,
                    number: 5 //limite de receitas retornadas
                }
            }
        );

        const receitas = response.data;

        //3. Isolar o "id" das receitas
        const receitasComId = receitas.map(receita => ({
            id: receita.id,
            title: receita.title,
            missedIngredients: receita.missedIngredients
        }));

        // 4. Traduzir os ingredientes em missedIngredientes
        const receitasTaduzidas = await Promise.all(
            receitasComId.map(async (receita) =>{
                // Traduzir o título da receita
                receita.title = await traduzirTexto(receita.title, 'en','pt-br');

                // Traduzir ingredientes em missedIngredientes
                receita.missedIngredients = await Promise.all(
                    receita.missedIngredients.map(async (ingrediente) => {
                        //verificar se o ingrediente já existe no banco
                        let ingredienteDb = await Ingrediente.findOne({
                            where: { nome_ingles: ingrediente.name}
                        });
                        if (!ingredienteDb){
                            // caso não exista no banco
                            const nomeIngles = ingrediente.name;
                            const nomePortugues = await traduzirTexto(nomeIngles, 'en','pt-br');

                            //Inserir no banco de dados
                            ingredienteDb = await Ingrediente.create({
                                nome: nomePortugues,
                                nome_ingles: nomeIngles
                            });
                        }
                        // Agora que temos o nome em português, retornamos o ingrediente com o nome traduzido
                        ingrediente.name = ingredienteDb.nome;
                        return ingrediente;
                    })
                );
                return receita;
            })
        );

        //5. Retorna as receitas com dados traduzidos
        res.json(receitasTaduzidas);

        //  Retornar as receitas da API Spoonacular
        // res.json(response.data);


    } catch (error) {
        console.error(error);
        res.status(500).json({ mensagem: 'Erro ao buscar receitas', erro: error.message});
    }
}

exports.receitaDetalhes = async (req, res) => {
    const { idReceita } = req.params;

      // Validação do ID
    if (!idReceita || isNaN(idReceita)) {
        return res.status(400).json({
            mensagem: 'O parâmetro "idReceita" é obrigatório e deve ser um número válido.',
        });
    }

    try {
        // Verificar se a receita já existe no banco
        let receitaBanco = await Receita.findOne({ where: { id: idReceita } });

        if (!receitaBanco) {
            // Caso não exista, buscar os detalhes da API
            const spoonacularKey = process.env.SPOONACULAR_API_KEY;
            const response = await axios.get(`https://api.spoonacular.com/recipes/${idReceita}/information`, {
                params: { apiKey: spoonacularKey },
            });

            const dadosReceita = response.data;

            // Estruturar os dados da receita
            const detalhesReceita = {
                id: dadosReceita.id,
                titulo: await traduzirTexto(dadosReceita.title,'en','pt-br'),
                tempoPreparo: dadosReceita.readyInMinutes,
                porcoes: dadosReceita.servings,
                vegetariano: await traduzirTexto(dadosReceita.vegetarian,'en','pt-br'),
                vegano: await traduzirTexto(dadosReceita.vegan,'en','pt-br'),
                semGluten: await traduzirTexto(dadosReceita.glutenFree,'en','pt-br'),
                semLactose: await traduzirTexto(dadosReceita.dairyFree,'en','pt-br'),
                muitoSaudavel: await traduzirTexto(dadosReceita.veryHealthy,'en','pt-br'),
                custoPorPorcao: dadosReceita.pricePerServing,
                imagem: dadosReceita.image,
                fonte: dadosReceita.sourceUrl,
                instrucoes: await traduzirTexto(dadosReceita.instructions,'en','pt-br') || '',
            };

            // Salvar a receita no banco
            receitaBanco = await Receita.create(detalhesReceita);

      // Processar e associar ingredientes à receita
      const ingredientesPromises = dadosReceita.extendedIngredients.map(async (ing) => {
        // Verificar se o ingrediente já existe
        let ingredienteBanco = await Ingrediente.findOne({ where: { nome_ingles: ing.nameClean } });

        // Caso o ingrediente não exista, criar
        if (!ingredienteBanco) {
            ingredienteBanco = await Ingrediente.create({
                nome_ingles: ing.nameClean,
                nome: await traduzirTexto(ing.name, 'en', 'pt-br'),
            });
        }

        // Verificar e usar valores padrões para quantidade e unidade caso estejam ausentes
        const quantidade = ing.amount || 0;
        const unidade = await traduzirTexto(ing.unit, 'en', 'pt-br') || 'unidade';
        console.log(quantidade,unidade);

        let receitadetalhesid = await ReceitaIngrediente.findOne({ where: { ReceitumId: receitaBanco.id,
            IngredienteId: ingredienteBanco.id } });

        // Associar o ingrediente à receita na tabela intermediária
        if (!receitadetalhesid) {
            receitadetalhesid = await ReceitaIngrediente.create({
                ReceitumId: receitaBanco.id,
                IngredienteId: ingredienteBanco.id,
                quantidade: quantidade,
                unidade: unidade
            });
        };
    });

    // Esperar que todas as promessas de ingredientes sejam resolvidas
    await Promise.all(ingredientesPromises);
}

// Buscar todos os ingredientes associados à receita
const receitaCompleta = {
    ...receitaBanco.dataValues,
    ingredientes: await receitaBanco.getIngredientes(),
};

// Retornar a receita completa com os ingredientes
res.json(receitaCompleta);
} catch (error) {
console.error(error);
res.status(500).json({ mensagem: 'Erro ao buscar detalhes da receita', erro: error.message });
}
};