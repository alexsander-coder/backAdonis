export function gerarMatricula(tamanho = 7) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const gerarCaractereAleatorio = () => caracteres.charAt(Math.floor(Math.random() * caracteres.length));

  const matriculaArray = Array.from({ length: tamanho }, gerarCaractereAleatorio);
  const matricula = matriculaArray.join('');

  return matricula;
}