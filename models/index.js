const Receita = require('./receitaModel');
const Ingrediente = require('./ingredienteModel');
const ReceitaIngrediente = require('./receitaIngredienteModel'); // Modelo da tabela intermediária

// Relacionamento: Receita possui muitos ingredientes (tabela intermediária ReceitaIngrediente)
Receita.belongsToMany(Ingrediente, {
    through: ReceitaIngrediente, // Usando o modelo intermediário
    foreignKey: 'ReceitumId',    // Chave estrangeira na tabela intermediária apontando para Receita
    otherKey: 'IngredienteId',   // Chave estrangeira apontando para Ingrediente
});

Ingrediente.belongsToMany(Receita, {
    through: ReceitaIngrediente, // Usando o modelo intermediário
    foreignKey: 'IngredienteId', // Chave estrangeira na tabela intermediária apontando para Ingrediente
    otherKey: 'ReceitumId',      // Chave estrangeira apontando para Receita
});

// Exportação dos modelos
module.exports = { Receita, Ingrediente, ReceitaIngrediente };
