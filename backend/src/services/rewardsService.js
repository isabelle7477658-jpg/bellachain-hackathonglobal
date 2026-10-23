export const calcularPontosServico = (pontosConfigurados) => {
  const pontos = Number(pontosConfigurados);
  if (!Number.isInteger(pontos) || pontos < 0) return 0;
  return pontos;
};
