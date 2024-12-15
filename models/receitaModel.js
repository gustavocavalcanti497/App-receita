// receitaModel.js
const { sequelize } = require('../config/db.js');
const { DataTypes } = require('sequelize');
  // Importa a conexão com o banco de dados

// Define o modelo Receita
const Receita = sequelize.define('Receita', {
  tempoPreparo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  porcoes: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vegetariano: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  vegano: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  semGluten: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  semLactose: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  muitoSaudavel: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  custoPorPorcao: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  imagem: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fonte: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  instrucoes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'receitas',  // Nome da tabela no banco
});

module.exports = Receita;

