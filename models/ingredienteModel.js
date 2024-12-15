const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Ingrediente = sequelize.define('Ingrediente', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nome_ingles: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

module.exports = Ingrediente;