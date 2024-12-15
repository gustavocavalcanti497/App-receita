// models/receitaIngrediente.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

    const ReceitaIngrediente = sequelize.define('ReceitaIngrediente', {
      quantidade: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 0,
      },
      unidade: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'unidade',
      }
    }, {
      tableName: 'receita_ingredientes'
    });
  
    ReceitaIngrediente.associate = function(models) {
      // Definindo a associação entre Receita e Ingrediente
      ReceitaIngrediente.belongsTo(models.Receita, {
        foreignKey: 'ReceitumId',
        as: 'receita',
      });
  
      ReceitaIngrediente.belongsTo(models.Ingrediente, {
        foreignKey: 'IngredienteId',
        as: 'ingrediente',
      });
    };
  
    module.exports = ReceitaIngrediente;