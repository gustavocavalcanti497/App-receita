const axios = require('axios');

// Função para traduzir texto usando DeepL API

const traduzirTexto = async (texto,origem,destino) =>{
    try{
        const response = await axios.post(
        'https://api-free.deepl.com/v2/translate',
        null,
        {
            params: {
                auth_key: '53f4f9c6-6633-40fc-bd0e-b7302b077578:fx',
                text: texto,
                source_lang: origem.toUpperCase(),
                target_lang: destino.toUpperCase()
            }
        }
        );

        // Retorna o texto traduzido
        return response.data.translations[0].text;
    } catch (error) {
        console.error('Erro ao traduzir com DeepL:', error.message);
        throw new Error ('Falha na tradução');
    }
};

module.exports = { traduzirTexto };