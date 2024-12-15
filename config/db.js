const { Sequelize } = require('sequelize');

// Configuração do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Desativar log de queries (opcional)
  }
);

// Função para testar a conexão
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados realizada com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);  // Para garantir que o aplicativo pare em caso de erro na conexão
  }
};

// Exportar a instância do Sequelize e a função de conexão
module.exports = { sequelize, connectDB };

