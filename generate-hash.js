#!/usr/bin/env node

/**
 * Script para gerar hash bcrypt de senha
 * Use este script para criar usuários seguros no dashboard
 * 
 * Uso: node generate-hash.js sua_senha_aqui
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('❌ Erro: Forneça uma senha como argumento');
  console.error('Uso: node generate-hash.js sua_senha_aqui');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Erro: A senha deve ter no mínimo 8 caracteres');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('\n✅ Hash bcrypt gerado com sucesso:\n');
  console.log(`Senha: ${password}`);
  console.log(`Hash:  ${hash}\n`);
  console.log('📋 SQL para inserir no Supabase:\n');
  console.log(`INSERT INTO s_users (email, password_hash, is_active)`);
  console.log(`VALUES ('seu@email.com', '${hash}', true);\n`);
}).catch((err) => {
  console.error('❌ Erro ao gerar hash:', err);
  process.exit(1);
});
