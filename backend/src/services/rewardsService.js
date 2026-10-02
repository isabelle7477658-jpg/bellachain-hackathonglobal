export const calcularRecompensa = (valorAtendimento) => {
  if (!valorAtendimento || Number(valorAtendimento) <= 0) {
    return 0;
  }

  return Number(valorAtendimento) * 0.05;
};
