export default class Usuario {
  constructor({ id, nome, email, telefone, wallet_address, created_at }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
    this.wallet_address = wallet_address;
    this.created_at = created_at;
  }
}
